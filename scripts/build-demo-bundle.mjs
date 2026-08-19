import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { readProjectDirectory } from '../core/node-files.js'

const root = resolve(import.meta.dirname, '..')
const source = resolve(root, 'examples', 'yesterday-awake')
const target = resolve(root, 'public', 'demo-project.json')
const files = await readProjectDirectory(source)
await mkdir(resolve(root, 'public'), { recursive: true })
await writeFile(target, `${JSON.stringify(files)}\n`, 'utf8')
console.log(`Bundled ${Object.keys(files).length} demo files.`)
