import { llm } from "../llm"
import { mkdir } from "node:fs/promises"
import config from "./0.config"

const pre = `${__filename.split("/").pop()} |`



const promptShortSummary = `
Você é um especialista em produzir sinopses para conteúdos educacionais.
Regras obrigatórias:
- Responda apenas com a sinopse.
- Escreva um único parágrafo de 3 linhas.
- Utilize linguagem clara, objetiva e natural.
- Destaque o tema principal e os conhecimentos ou habilidades que o conteúdo ensina.
- Mencione os tópicos mais relevantes apenas se forem essenciais para entender o conteúdo.
- Não faça listas.
- Não utilize Markdown.
- Não cite horários, capítulos ou timestamps.
- Não mencione que o conteúdo é um vídeo, aula, palestra, curso, transcrição, legenda ou documento.
- Não use frases como "Neste vídeo", "Esta aula", "O conteúdo apresenta", "A transcrição mostra" ou semelhantes.
- Não invente informações que não estejam presentes na transcrição.
- Escreva em terceira pessoa.
`.trim()




const promptSummary = `
Você é um sistema de geração de resumos.

Sua resposta DEVE obedecer exatamente às regras abaixo.

Regras:
- Responda apenas em Markdown.
- Use exatamente os títulos abaixo.
- Não adicione outras seções.
- Caso alguma seção não possua informações, escreva "Nenhuma informação encontrada."

Formato:
# Resumo

## Principais assuntos
- ...

## Linha do tempo

- [mm:ss] ...
- [mm:ss] ...
- [mm:ss] ...
- [mm:ss] ...

## Decisões
- ...

## Pessoas citadas
- ...
`.trim()

async function summarize(id: string) {
  const jsonFilePath = `${config.wip}/${id}/transcription`
  console.log(pre, `Summarizing transcription for id ${id}`)
  const startTime = Date.now()

  if (
    await Bun.file(`${config.wip}/${id}/summary`).exists() && 
    await Bun.file(`${config.wip}/${id}/short-summary`).exists()
  ) {
    console.log(pre, `skip, Summary and short summary already exist for id ${id}, skipping`)
    return
  }

  if (!(await Bun.file(jsonFilePath).exists())) {
    console.error(pre, `Transcription file does not exist for id ${id}, cannot summarize`)
    throw new Error(`Transcription file does not exist for id ${id}, cannot summarize`)
  }

  const srt = await Bun.file(jsonFilePath).text()

  if (srt.trim() === "") {
    console.warn(pre, `Transcription file is empty for id ${id}, skipping summarization`)
    throw new Error(`Transcription file is empty for id ${id}, skipping summarization`)
  }

  const transcript = `
Resuma a transcrição abaixo:
${srt}
`.trim()

  const completion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.1,
    messages: [ 
      { role: "system", content: promptSummary },
      { role: "user", content: transcript }
    ]
  })

  const shortCompletion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.2,
    messages: [
      { role: "system", content: promptShortSummary },
      { role: "user", content: transcript }
    ]
  })

  const summary = completion.choices[0]?.message.content ?? ""
  const shortSummary = shortCompletion.choices[0]?.message.content ?? ""

  // save the summary and short summary to files
  await mkdir(`${config.wip}/${id}`, { recursive: true })
  await Bun.write(`${config.wip}/${id}/summary`, summary)
  await Bun.write(`${config.wip}/${id}/short-summary`, shortSummary)
  const endTime = Date.now()
  await config.logTimeFile(`summarize | ${id}`, startTime, endTime)
}

export { summarize }