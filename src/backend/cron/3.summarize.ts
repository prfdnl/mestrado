import { llm } from "../llm"
import { mkdir, rename } from "node:fs/promises"
import config from "./0.config"

const pre = `${__filename.split("/").pop()} |`

type Segment = {
  start: number
  end: number
  text: string
}

const promptShortSummary = `
Você é um assistente que faz resumos curtos.
faça um resumo curto seguindo as seguintes instruções:
- Resuma em até 5 linhas.
- Use uma linguagem simples e direta.
- Destaque os pontos mais importantes da transcrição.
- Evite detalhes desnecessários.
- Descreva o conteúdo de forma clara e concisa.
- não inclua informações que não estão na transcrição.
- não inclua Resumo: no início da resposta.
`

const promptSummary = `
Você é um assistente que resume transcrições.
Responda em Markdown.
Estrutura:
# Resumo
## Principais assuntos
- ...
## Linha do tempo
- [00:00] ...
- [12:35] ...
- [nn:nn] ...
## Decisões
## Próximas ações
## Pessoas citadas
`

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s]
    .map(v => String(v).padStart(2, "0"))
    .join(":")
}

async function summarize(id: string) {
  const jsonFilePath = `${config.wip}/${id}/transcription`

  if (
    await Bun.file(`${config.wip}/${id}/summary`).exists() && 
    await Bun.file(`${config.wip}/${id}/short-summary`).exists()
  ) {
    console.log(pre, `skip, Summary and short summary already exist for id ${id}, skipping`)
    return
  }

  console.log(pre, `Summarizing transcription for id ${id}`)

  if (!(await Bun.file(jsonFilePath).exists())) {
    console.error(pre, `Transcription file does not exist for id ${id}, cannot summarize`)
    throw new Error(`Transcription file does not exist for id ${id}, cannot summarize`)
  }

  const srt = await Bun.file(jsonFilePath).text()

  if (srt.trim() === "") {
    console.warn(pre, `Transcription file is empty for id ${id}, skipping summarization`)
    throw new Error(`Transcription file is empty for id ${id}, skipping summarization`)
  }

  // let segments: Segment[]
  
  // try {
  //   segments = JSON.parse(jsonText)
  // } catch (error) {
  //   console.error(pre, `Error parsing transcription JSON for id ${id}:`, error)
  //   throw new Error(`Error parsing transcription JSON for id ${id}: ${error}`)
  // }
  
  // if (!Array.isArray(segments)) {
  //   console.error(pre, `Transcription JSON is not an array for id ${id}, cannot summarize`)
  //   throw new Error(`Transcription JSON is not an array for id ${id}, cannot summarize`)
  // }

  const transcript = srt

  const completion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: promptSummary
      },
      {
        role: "user",
        content: transcript
      }
    ]
  })

  const summary =
    completion.choices[0]?.message.content ?? ""

  const shortCompletion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: promptShortSummary
      },
      {
        role: "user",
        content: transcript
      }
    ]
  })

  const shortSummary =
    shortCompletion.choices[0]?.message.content ?? ""

  // save the summary and short summary to files
  await mkdir(`${config.wip}/${id}`, { recursive: true })
  await Bun.write(`${config.wip}/${id}/summary`, summary)
  await Bun.write(`${config.wip}/${id}/short-summary`, shortSummary)
}

export { summarize }