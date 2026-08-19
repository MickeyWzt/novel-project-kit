import { normalizePath } from '../../core/format.js'

type FileMap = Record<string, string>

function sharedRoot(paths: string[]) {
  const firstSegments = paths.map((path) => normalizePath(path).split('/')[0])
  return firstSegments.length > 0 && firstSegments.every((segment) => segment === firstSegments[0]) ? firstSegments[0] : null
}

export async function readFileList(list: FileList | File[]): Promise<FileMap> {
  const accepted = [...list].filter((file) => /\.(json|jsonl|md|txt)$/i.test(file.name))
  const rawPaths = accepted.map((file) => file.webkitRelativePath || file.name)
  const root = sharedRoot(rawPaths)
  const files: FileMap = {}
  await Promise.all(accepted.map(async (file, index) => {
    let path = normalizePath(rawPaths[index])
    if (root && path.startsWith(`${root}/`)) path = path.slice(root.length + 1)
    files[path] = await file.text()
  }))
  return files
}

interface LegacyEntry {
  isFile: boolean
  isDirectory: boolean
  name: string
  fullPath: string
  file?: (success: (file: File) => void, failure?: (error: DOMException) => void) => void
  createReader?: () => { readEntries: (success: (entries: LegacyEntry[]) => void, failure?: (error: DOMException) => void) => void }
}

async function readEntry(entry: LegacyEntry, prefix = ''): Promise<Array<{ file: File, path: string }>> {
  const path = prefix ? `${prefix}/${entry.name}` : entry.name
  if (entry.isFile && entry.file) {
    const file = await new Promise<File>((resolve, reject) => entry.file?.(resolve, reject))
    return [{ file, path }]
  }
  if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader()
    const children: LegacyEntry[] = []
    while (true) {
      const batch = await new Promise<LegacyEntry[]>((resolve, reject) => reader.readEntries(resolve, reject))
      if (!batch.length) break
      children.push(...batch)
    }
    return (await Promise.all(children.map((child) => readEntry(child, path)))).flat()
  }
  return []
}

export async function readDrop(event: DragEvent): Promise<FileMap> {
  const items = [...(event.dataTransfer?.items ?? [])]
  const entries: LegacyEntry[] = items
    .map((item) => item.webkitGetAsEntry?.() as unknown as LegacyEntry | null | undefined)
    .filter((entry): entry is LegacyEntry => entry !== null && entry !== undefined)
  if (!entries.length) return readFileList(event.dataTransfer?.files ?? [])
  const nested = (await Promise.all(entries.map((entry) => readEntry(entry)))).flat()
  const root = sharedRoot(nested.map((item) => item.path))
  const files: FileMap = {}
  await Promise.all(nested.filter(({ file }) => /\.(json|jsonl|md|txt)$/i.test(file.name)).map(async ({ file, path }) => {
    const normalized = normalizePath(path)
    const relative = root && normalized.startsWith(`${root}/`) ? normalized.slice(root.length + 1) : normalized
    files[relative] = await file.text()
  }))
  return files
}
