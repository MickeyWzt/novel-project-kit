export const FORMAT_VERSION = '1.0.0'

export const REQUIRED_FILES = [
  'novel.json',
  'story/direction.md',
  'story/bible.md',
  'story/style.md',
  'story/arcs.json',
  'world/locations.json',
  'world/rules.json',
  'plots/soft-plots.json',
  'plots/foreshadowing.json',
  'timeline/events.jsonl',
  'state/current.json',
  'state/locks.json',
]

export function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

export function normalizeFileMap(input) {
  const entries = input instanceof Map ? [...input.entries()] : Object.entries(input ?? {})
  return Object.fromEntries(entries.map(([path, content]) => [normalizePath(path), String(content)]))
}

export function chapterNumberFromPath(path) {
  const match = normalizePath(path).match(/(?:^|\/)(\d{3})\.(?:md|json)$/)
  return match ? Number(match[1]) : null
}

export function fileEntries(files, prefix, extension) {
  return Object.entries(files)
    .filter(([path]) => path.startsWith(prefix) && path.endsWith(extension))
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
}

export function countTextUnits(markdown) {
  const text = markdown
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#>*_`\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const han = text.match(/[\p{Script=Han}]/gu)?.length ?? 0
  const latinWords = text.replace(/[\p{Script=Han}]/gu, ' ').match(/[\p{L}\p{N}]+/gu)?.length ?? 0
  return han + latinWords
}
