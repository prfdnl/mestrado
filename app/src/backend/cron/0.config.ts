import { mkdir } from "fs/promises"
import path from "path"
const mainIndexFolder = path.resolve(Bun.main, "..") 
const root = `${mainIndexFolder}/files`
const done = `${root}/__done__`
const wip = `${root}/__wip__`
const downloads = `${root}/__downloads__`

await Promise.all([
  mkdir(root, { recursive: true }),
  mkdir(done, { recursive: true }),
  mkdir(wip, { recursive: true }),
  mkdir(downloads, { recursive: true }),
])


import { appendFile } from "node:fs/promises";
const logfile = `${root}/cron.log`

async function logTimeFile(title: string, start: number, end: number) {
  const diff = end - start
  console.log(`${title} | ${start} | ${end} | ${diff}`)
  await appendFile(logfile, `${title} | ${start} | ${end} | ${diff}\n`)
}

export default { root, done, wip, downloads, logTimeFile }