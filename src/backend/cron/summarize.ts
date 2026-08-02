// summarize.ts
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { llm } from "./llm"

type Segment = {
  start: number
  end: number
  text: string
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return [h, m, s]
    .map(v => String(v).padStart(2, "0"))
    .join(":")
}

export async function summarize(jsonFile: string) {
  const segments: Segment[] = JSON.parse(
    await readFile(jsonFile, "utf8")
  )

  const transcript = segments
    .map(s =>
      `[${formatTime(s.start)} - ${formatTime(s.end)}] ${s.text}`
    )
    .join("\n")

  const completion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Você é um assistente que resume transcrições.

Responda em Markdown.

Estrutura:

# Resumo

## Principais assuntos

- ...

## Linha do tempo

- [00:00] ...
- [12:35] ...

## Decisões

## Próximas ações

## Pessoas citadas
`
      },
      {
        role: "user",
        content: transcript
      }
    ]
  })

  const summary =
    completion.choices[0].message.content ?? ""

  await writeFile(
    path.join(
      path.dirname(jsonFile),
      path.basename(jsonFile, ".json") + ".summary.md"
    ),
    summary
  )
}