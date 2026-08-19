import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { normalizePath } from './format.js'

const TEXT_EXTENSIONS = new Set(['.json', '.jsonl', '.md', '.txt'])

function extension(path) {
  const index = path.lastIndexOf('.')
  return index >= 0 ? path.slice(index).toLowerCase() : ''
}

export async function readProjectDirectory(directory) {
  const root = resolve(directory)
  const files = {}

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const absolute = resolve(current, entry.name)
      if (entry.isDirectory()) await walk(absolute)
      if (entry.isFile() && TEXT_EXTENSIONS.has(extension(entry.name))) {
        files[normalizePath(relative(root, absolute))] = await readFile(absolute, 'utf8')
      }
    }
  }

  await walk(root)
  return files
}
