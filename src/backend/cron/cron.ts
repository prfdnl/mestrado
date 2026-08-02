import { mkdir, readdir, rename, unlink } from "fs/promises"
import path from "path"
import { summarize } from "./summarize"
import { updateDatabase } from "./update-database"

// Define the directories
const root = `${__dirname}/../../../files`
const downloadingDir = `${root}/downloading`
const processingDir = `${root}/processing`
const processedDir = `${root}/processed`

// Keep track of the child processes for eventual termination
const dowloadingChildProcess: Record<string, Bun.Subprocess> = {}
const transcriptionChildProcess: Record<string, Bun.Subprocess> = {}

// Create the directories if they don't exist
mkdir(root, { recursive: true })
mkdir(downloadingDir, { recursive: true })
mkdir(processingDir, { recursive: true })
mkdir(processedDir, { recursive: true })

function stopDownloadYt(filename: string) {
  const cp = dowloadingChildProcess[filename]
  if (cp) {
    cp.kill(10)
    delete dowloadingChildProcess[filename]
  }
}

async function downlaodYt(url: string, filename: string) {
  console.log("Downloading", filename)
  const cp = dowloadingChildProcess[filename] = Bun.spawn([
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

  // usuário parou o download, antes de terminar
  // On Linux, killing with signal 10 (SIGUSR1) results in exit code 128 + 10 = 138
  if (code === 128 + 10) {
    const downloaded = await readdir(downloadingDir)
    await Promise.all(
      downloaded
        .filter((file) => file.startsWith(`${filename}.`))
        .map((file) => unlink(`${downloadingDir}/${file}`))
    )
    return
  }

  if (code !== 0) {
    console.error(`yt-dlp exited with code ${code}`)
    return
  }

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

function stopTranscription(filename: string) {
  console.log("stopTranscription", filename)
  const cp = transcriptionChildProcess[filename]
  if (cp) {
    cp.kill(10)
    delete transcriptionChildProcess[filename]
  }
}

async function transcription(filepath: string) {
  const cp = Bun.spawn(["python", `${__dirname}/fast-whisper.py`, filepath], { stdout: "inherit", stderr: "inherit" })
  console.log("transcribing", filepath)
  const code = await cp.exited
  if (code === 128 + 10) {
    console.log(`fastwhisper stopped by user`, filepath)
    await unlink(filepath)
    return
  }
  if (code !== 0) {
    console.error(`fastwhisper exited with code ${code}`)
    // o arquivo precisa voltar para a pasta /files
    // para tentar ser processado novamente
    await rename(filepath, `${root}/${path.basename(filepath)}`)
    return
  }
  console.log("fast-whisper end", filepath)
}


async function startCronJob() {
  // get all files from /files
  const files = (await readdir(`${root}`, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  // proccess the first file in the list
  if (files.length > 0) {
    console.log("Files in /files:", files)
    const file = files[0] as string
    await rename(`${root}/${file}`, `${processingDir}/${file}`)
    // await transcription(`${processingDir}/${file}`)
    // await summarize(`${processingDir}/${file}.json`)
    await updateDatabase(file, `${processingDir}/${file}.summary.md`, `${processingDir}/${file}.json`)
    await unlink(`${processingDir}/${file}`)
  }

  // next
  if (files.length === 0)  
    return setTimeout(startCronJob, 1000 * 30) // 30 seconds
  startCronJob()
}

export { startCronJob, downlaodYt, stopDownloadYt, stopTranscription }