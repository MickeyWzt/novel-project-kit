import { chapterNumberFromPath, fileEntries, normalizeFileMap, REQUIRED_FILES } from './format.js'

function issue(code, path, message) {
  return { severity: 'error', code, path, message }
}

function parseJson(files, path, parseIssues, fallback) {
  if (!(path in files)) return fallback
  try {
    return JSON.parse(files[path])
  } catch (error) {
    parseIssues.push(issue('json-parse', path, `JSON 无法解析：${error.message}`))
    return fallback
  }
}

function parseJsonLines(files, path, parseIssues) {
  if (!(path in files)) return []
  return files[path]
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line)
    .flatMap(({ line, index }) => {
      try {
        return [{ ...JSON.parse(line), __line: index + 1 }]
      } catch (error) {
        parseIssues.push(issue('jsonl-parse', `${path}:${index + 1}`, `JSONL 无法解析：${error.message}`))
        return []
      }
    })
}

export function parseNovelProject(input) {
  const files = normalizeFileMap(input)
  const parseIssues = []
  for (const path of REQUIRED_FILES) {
    if (!(path in files)) parseIssues.push(issue('required-file', path, `缺少必需文件 ${path}`))
  }

  const metadata = parseJson(files, 'novel.json', parseIssues, {})
  const arcFile = parseJson(files, 'story/arcs.json', parseIssues, { arcs: [] })
  const locationFile = parseJson(files, 'world/locations.json', parseIssues, { locations: [] })
  const ruleFile = parseJson(files, 'world/rules.json', parseIssues, { rules: [] })
  const plotFile = parseJson(files, 'plots/soft-plots.json', parseIssues, { plots: [] })
  const foreshadowingFile = parseJson(files, 'plots/foreshadowing.json', parseIssues, { foreshadowings: [] })
  const current = parseJson(files, 'state/current.json', parseIssues, {})
  const lockFile = parseJson(files, 'state/locks.json', parseIssues, { locks: [] })

  const characters = fileEntries(files, 'characters/', '.json').map(([path]) => ({
    ...parseJson(files, path, parseIssues, {}),
    __path: path,
  }))
  const chapters = fileEntries(files, 'chapters/', '.md').map(([path, content]) => ({
    number: chapterNumberFromPath(path), path, content,
  }))
  const plans = fileEntries(files, 'plans/', '.md').map(([path, content]) => ({
    number: chapterNumberFromPath(path), path, content,
  }))
  const summaries = fileEntries(files, 'summaries/', '.json').map(([path]) => ({
    ...parseJson(files, path, parseIssues, {}),
    __path: path,
  }))

  return {
    files,
    parseIssues,
    metadata,
    direction: files['story/direction.md'] ?? '',
    bible: files['story/bible.md'] ?? '',
    style: files['story/style.md'] ?? '',
    arcs: arcFile.arcs ?? [],
    characters,
    locations: locationFile.locations ?? [],
    rules: ruleFile.rules ?? [],
    softPlots: plotFile.plots ?? [],
    foreshadowings: foreshadowingFile.foreshadowings ?? [],
    timeline: parseJsonLines(files, 'timeline/events.jsonl', parseIssues),
    chapters,
    plans,
    summaries,
    current,
    locks: lockFile.locks ?? [],
    raw: { arcFile, lockFile },
  }
}
