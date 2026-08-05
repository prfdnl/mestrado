import { mkdir, rename } from "node:fs/promises"
import config from "./0.config"
const pre = `${__filename.split("/").pop()} |`

async function transcribeAudio(id: string) {
  console.log(pre, `Transcribing audio for id ${id}`)
  const startTime = Date.now()
  const audioFilePath = `${config.root}/${id}`

  if (!(await Bun.file(audioFilePath).exists())) {
    console.error(pre, `Audio file does not exist for id ${id}, cannot transcribe`)
    throw new Error(`Audio file does not exist for id ${id}, cannot transcribe`)
  }

  if (await Bun.file(`${config.wip}/${id}/transcription`).exists()) {
    console.warn(pre, `skip, Transcription already exists for id ${id}, skipping transcription`)
    return
  }
  
  // const cp = Bun.spawn(["python", `${__dirname}/fast-whisper.py`, audioFilePath], { stdout: "pipe", stderr: "pipe" })
  const cp = Bun.spawn(["faster-whisper", audioFilePath], { stdout: "pipe", stderr: "pipe" })
  const code = await cp.exited
  
  if (code !== 0) {
    console.error(`fastwhisper exited with code ${code}`)
    await config.logTimeFile(`transcribeAudio | ${id} | fastwhisper failed`, startTime, Date.now())
    throw new Error(`fastwhisper exited with code ${code}`)
  }
  
  // rename the srt file to transcription
  await mkdir(`${config.wip}/${id}`, { recursive: true })
  await rename(`${audioFilePath}.srt`, `${config.wip}/${id}/transcription`)
  console.log(pre, `Transcribed audio for id ${id}`)

  const endTime = Date.now()
  await config.logTimeFile(`transcribeAudio | ${id}`, startTime, endTime)
}

export { transcribeAudio }