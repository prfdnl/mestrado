import backendRoutes from "./backend/routes/routes"

import index from "./frontend/index.html"
import login from "./frontend/login.html"

const { url } = Bun.serve({
  routes: {
    "/api/*": backendRoutes.fetch,
    "/login": login,
    "/*": index
  }
})

console.log(`Server started on ${url}`)




// list all files from /files
import { mkdir, readdir, rename, unlink } from "fs/promises"
import path from "path"

const root = `files`
const downloadingDir = `${root}/downloading`
const processingDir = `${root}/processing`

mkdir(root, { recursive: true })
mkdir(downloadingDir, { recursive: true })
mkdir(processingDir, { recursive: true })

async function downlaodYt(url: string, filename: string) {
  console.log("Downloading", filename)
  const cp = Bun.spawn([
    "yt-dlp",
    "-f", "worstaudio",
    "-x",
    "--no-keep-video",
    "--audio-format", "m4a",
    "-P", downloadingDir,
    "-o", `${filename}.%(ext)s`,
    url
  ], {
    stdout: "pipe",
    stderr: "pipe"
  })  
  
  // wait for the process to exit
  const code = await cp.exited  

  if (code !== 0) {
    console.error(`yt-dlp exited with code ${code}`)
    return
  }

  console.log(1)

  // delete all files in /downloading that start with filename and do not end with .mp3
  const downloaded = await readdir(downloadingDir)
  await Promise.all(
    downloaded
      .filter((file) => file.startsWith(`${filename}.`) && !file.endsWith(".m4a"))
      .map((file) => unlink(`${downloadingDir}/${file}`))
  )

  // move the m4a file to ../
  await rename(`${downloadingDir}/${filename}.m4a`, `${root}/${filename}`)

  // delete all files in /downloading that start with filename and do not end with .m4a
  const downloading = await readdir(downloadingDir)
  await Promise.all(
    downloading
      .filter((file) => file.startsWith(`${filename}.`) && !file.endsWith(".m4a"))
      .map((file) => unlink(`${downloadingDir}/${file}`))
  )

  // move the audio file to root
  await rename(`${root}/${filename}`, `${root}/${filename}`)
  console.log("Downloaded", filename)
}




async function fastwhisper(filepath: string) {
  console.log("fast-whisper", filepath)
  const cp = Bun.spawn([
    "python",
    "fast-whisper.py",
    filepath
  ], {
    stdout: "inherit",
    stderr: "inherit"
  })
  const code = await cp.exited
  if (code !== 0) {
    console.error(`fastwhisper exited with code ${code}`)
    // o arquivo precisa voltar para a pasta /files para ser processado novamente
    await rename(filepath, `${root}/${path.basename(filepath)}`)
    return
  }
  console.log("fast-whisper end", filepath)
}




async function aaaa() {
  const files = (await readdir("files", { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  // move first file to /process
  if (files.length > 0) {
    console.log("Files in /files:", files)
    const file = files[0]
    await rename(`${root}/${file}`, `${processingDir}/${file}`)
    await fastwhisper(`${processingDir}/${file}`)
  }

  // 
  setTimeout(aaaa, 5000)
}

downlaodYt("https://www.youtube.com/watch?v=exTz3NjJsWI", "rola")

aaaa()