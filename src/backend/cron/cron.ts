import { rm, rename, readdir } from "node:fs/promises"
import config from "./0.config"
import { downloadMedia } from "./1.download"
import { transcribeAudio } from "./2.transcribe"
import { summarize } from "./3.summarize"
import { updateDatabase } from "./4.update-database"

const id = "019fc4d0-d023-7329-8166-4a192310d9c8"

function waitExec() {
  // setTimeout(cron, 1000 * 60 * 5) // wait X minutes and try again
  setTimeout(cron, 1000 * 3)
}

async function cron() {
  const files = (await readdir(config.root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && !entry.name.includes("."))
    .map((entry) => entry.name)
 
  const id = files[0]

  if (!id)
    return waitExec() 

  try {
    await transcribeAudio(id)
    await summarize(id)
    await updateDatabase(id)
    await rename(`${config.root}/${id}`, `${config.done}/${id}`)
    await rm(`${config.wip}/${id}`, { recursive: true, force: true })
  } catch (error) {
    console.error(`Error processing id ${id}:`, error)
    return waitExec()
  }

  cron()
}

cron()