import { mkdir, rename } from "node:fs/promises"
import config from "./0.config"

const pre = `${__filename.split("/").pop()} |`

async function downloadMedia(url: string, id: string) {
  
  if (await (Bun.file(`${config.root}/${id}`).exists())) {
    console.warn(pre, `skip, Audio file already exists for id ${id}, skipping download`)
    return
  }

  const cp = Bun.spawn([
    "yt-dlp",
    // "-f", "worstaudio",
    "-f", "bestaudio",
    "-x",
    "--no-keep-video",
    "--audio-format", "m4a",
    "-P", config.root,
    "-o", id,
    url
  ], {
    stdout: "pipe",
    stderr: "pipe"
  })  
  
  const procEexitCode = await cp.exited
  if (procEexitCode !== 0) 
    throw new Error(`yt-dlp exited with code ${procEexitCode}`)

  await rename(`${config.root}/${id}.m4a`, `${config.root}/${id}`)
  console.log(pre, `Downloaded audio for id ${id}`)
}

export { downloadMedia }