import { mkdir, rename, readdir } from "node:fs/promises"
import config from "./0.config"

const pre = `${__filename.split("/").pop()} |`


async function downloadMedia(url: string, id: string) {
  console.log(pre, `Downloading media for id ${id}`)

  const startTime = Date.now()
  
  if (await (Bun.file(`${config.downloads}/${id}.mp3`).exists())) {
    console.warn(pre, `skip, Audio file already exists in downloads folder for id ${id}, copying and skipping download`)
    throw new Error(`Audio file ${id} already exists in downloads folder, probably a previous download attempt failed, please check the downloads folder and remove the file if you want to retry `)
  }

  if (await (Bun.file(`${config.done}/${id}`).exists())) {
    console.warn(pre, `skip, Audio file already exists in done folder for id ${id}, copying and skipping download`)
    await rename(`${config.done}/${id}`, `${config.root}/${id}`)
    return
  }

  if (await (Bun.file(`${config.root}/${id}`).exists())) {
    console.warn(pre, `skip, Audio file already exists in root folder for id ${id}, skipping download`)
    return
  }

  const cp = Bun.spawn([
    "yt-dlp",
    "-x",
    "--no-playlist"  ,
    "--no-keep-video",
    "-f"             , "worst",
    "--audio-format" , "mp3",
    "--cookies"      , `${config.downloads}/cookie.txt`,
    "--js-runtime"   , "bun",
    "-P"             , config.downloads,
    "-o"             , id,
    url
  ], {
    stdout: "inherit",
    stderr: "inherit"
  })  
  
  const procEexitCode = await cp.exited
  if (procEexitCode !== 0) {
    await config.logTimeFile(`downloadMedia | ${id} | yt-dlp failed`, startTime, Date.now())
    throw new Error(`yt-dlp exited with code ${procEexitCode}`)
  }

  await rename(`${config.downloads}/${id}.mp3`, `${config.root}/${id}`)
  console.log(pre, `Downloaded audio for id ${id}`)

  // delete all files in downloads folder with the same id prefix
  const files = await readdir(config.downloads, { withFileTypes: true })
  for (const file of files) {
    if (file.isFile() && file.name.startsWith(id)) {
      await Bun.file(`${config.downloads}/${file.name}`).delete()
    }
  }

  const endTime = Date.now()
  await config.logTimeFile(`downloadMedia | ${id}`, startTime, endTime)
}

export { downloadMedia }