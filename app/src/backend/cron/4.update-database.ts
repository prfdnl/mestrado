import { elasticsearch, postgres } from "../database/connection"
import { mkdir, rename } from "node:fs/promises"
import config from "./0.config"

const pre = `${__filename.split("/").pop()} |`

async function updateDatabase(id: string) {
  console.log(pre, `Updating database`)
  const startTime = Date.now()

  if (!await Bun.file(`${config.wip}/${id}/summary`).exists()) {
    console.error(pre, `summary not found for id ${id}`)
    throw new Error(`summary not found for id ${id}`)
  }

  if (!await Bun.file(`${config.wip}/${id}/short-summary`).exists()) {
    console.error(pre, `short-summary not found for id ${id}`)
    throw new Error(`short-summary not found for id ${id}`)
  }

  if (!await Bun.file(`${config.wip}/${id}/transcription`).exists()) {
    console.error(pre, `transcription not found for id ${id}`)
    throw new Error(`transcription not found for id ${id}`)
  }
  
  const [summary, shortSummary, transcription] = await Promise.all([
    Bun.file(`${config.wip}/${id}/summary`).text(),
    Bun.file(`${config.wip}/${id}/short-summary`).text(),
    Bun.file(`${config.wip}/${id}/transcription`).text()
  ])

  // update postgres
  const result = await postgres`UPDATE publicacao SET 
    resumo = ${summary},
    resumo_curto = ${shortSummary},
    transcricao = ${transcription}
    WHERE id = ${id}`

  if (result.count === 0) {
    console.error(pre, `No rows updated for id ${id}`)
    await config.logTimeFile(`updateDatabase | ${id} | No rows updated`, startTime, Date.now())
    throw new Error(`No rows updated for id ${id}`)
  }

  // update elasticsearch
  const esResult = await elasticsearch.update({
    index: "publicacao",
    id: id.toString(),
    body: {
      // @ts-ignore
      doc: {
        resumo: summary,
        resumoCurto: shortSummary,
        transcricao: transcription
      }
    }
  })

  const endTime = Date.now()
  await config.logTimeFile(`updateDatabase | ${id}`, startTime, endTime)
}

export { updateDatabase }