import { mkdir } from "fs/promises"
import path from "path"
const mainIndexFolder = path.resolve(Bun.main, "..") 
const root = `${mainIndexFolder}/files`
const done = `${mainIndexFolder}/files/__done__`
const wip = `${mainIndexFolder}/files/__wip__`
await mkdir(root, { recursive: true })
await mkdir(done, { recursive: true })
await mkdir(wip, { recursive: true })
export default { root, done, wip }