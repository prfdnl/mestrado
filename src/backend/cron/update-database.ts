import { elasticsearch, postgres } from "../database/connection"

export async function updateDatabase(
  publicacaoId: string,
  filepathSummary: string,
  filepathTranscription: string
) {
  // load files
  const summary = await Bun.file(filepathSummary).text()
  const transcription = await Bun.file(filepathTranscription).text()

  // update postgres
  const result = await postgres`UPDATE publicacao SET 
    resumo = ${summary}, 
    transcricao = ${transcription}
    WHERE id = ${publicacaoId}` 

 if (result.count === 0) {
    console.error(`No rows updated for publicacaoId ${publicacaoId}`)
  }

  // update elasticsearch
  const esResult = await elasticsearch.update({
    index: "publicacao",
    id: publicacaoId.toString(),
    body: {
      doc: {
        summary,
        transcription
      }
    }
  })

  if (esResult.result !== "updated") {
    console.error(`Elasticsearch update failed for publicacaoId ${publicacaoId}`)
  }

  // delete the files
  await Bun.file(filepathSummary).unlink()
  await Bun.file(filepathTranscription).unlink()
}