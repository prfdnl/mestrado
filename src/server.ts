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

const root = `files`
const downloadingDir = `${root}/downloading`
const processingDir = `${root}/processing`

async function downlaodYt(url: string, filename: string) {
  const cp = Bun.spawn([
    "yt-dlp",
    "-f", "worstaudio",
    "-x",
    "--no-keep-video",
    "--audio-format", "mp3",
    "-P", downloadingDir,
    "-o", `${filename}.%(ext)s`,
    url
  ], {
    stdout: "pipe",
    stderr: "pipe"
  })
  
  const code = await cp.exited  
  if (code !== 0) {
    console.error(`yt-dlp exited with code ${code}`)
    return
  }

  // delete all files in /downloading that start with filename and do not end with .mp3
  const downloaded = await readdir(downloadingDir)
  await Promise.all(
    downloaded
      .filter((file) => file.startsWith(`${filename}.`) && !file.endsWith(".mp3"))
      .map((file) => unlink(`${downloadingDir}/${file}`))
  )

  // move the mp3 file to ../
  await rename(`${downloadingDir}/${filename}.mp3`, `${root}/${filename}`)
}

async function aaaa() {
  const files = (await readdir("files", { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
  console.log("Files in /files:", files)

  // move first file to /process
  if (files.length > 0) {
    const file = files[0]
    await mkdir(processingDir, { recursive: true })
    await rename(`${root}/${file}`, `${processingDir}/${file}`)
  }

  // 
  setTimeout(aaaa, 5000)
}

downlaodYt("https://www.youtube.com/watch?v=exTz3NjJsWI", "rola")

aaaa()