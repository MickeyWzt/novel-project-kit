import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import novelSchema from './schemas/novel.schema.json' with { type: 'json' }
import arcsSchema from './schemas/arcs.schema.json' with { type: 'json' }
import characterSchema from './schemas/character.schema.json' with { type: 'json' }
import currentSchema from './schemas/current.schema.json' with { type: 'json' }
import summarySchema from './schemas/summary.schema.json' with { type: 'json' }
import locksSchema from './schemas/locks.schema.json' with { type: 'json' }
import { parseNovelProject } from './project.js'

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)

const validators = {
  novel: ajv.compile(novelSchema),
  arcs: ajv.compile(arcsSchema),
  character: ajv.compile(characterSchema),
  current: ajv.compile(currentSchema),
  summary: ajv.compile(summarySchema),
  locks: ajv.compile(locksSchema),
}

function makeIssue(severity, code, path, message) {
  return { severity, code, path, message }
}

function schemaIssues(validate, data, path) {
  if (validate(data)) return []
  return (validate.errors ?? []).map((error) => makeIssue(
    'error',
    'schema',
    `${path}${error.instancePath || ''}`,
    `${error.message}${error.params?.allowedValue ? `（应为 ${error.params.allowedValue}）` : ''}`,
  ))
}

function duplicateIssues(items, group, pathFor = (item) => item.__path ?? group) {
  const seen = new Set()
  const issues = []
  for (const item of items) {
    if (!item?.id) continue
    if (seen.has(item.id)) issues.push(makeIssue('error', 'duplicate-id', pathFor(item), `${group} 中 ID ${item.id} 重复`))
    seen.add(item.id)
  }
  return issues
}

function references(issues, values, allowed, path, label) {
  for (const value of values ?? []) {
    if (!allowed.has(value)) issues.push(makeIssue('error', 'dangling-reference', path, `${label}引用不存在的 ID：${value}`))
  }
}

function collectionShape(issues, value, key, path) {
  if (!value || typeof value !== 'object' || !Array.isArray(value[key])) {
    issues.push(makeIssue('error', 'schema', path, `必须包含数组字段 ${key}`))
    return []
  }
  return value[key]
}

export function validateNovelProject(input) {
  const project = input?.files && input?.parseIssues ? input : parseNovelProject(input)
  const issues = [...project.parseIssues]

  if (project.files['novel.json']) issues.push(...schemaIssues(validators.novel, project.metadata, 'novel.json'))
  if (project.files['story/arcs.json']) issues.push(...schemaIssues(validators.arcs, project.raw.arcFile, 'story/arcs.json'))
  if (project.files['state/current.json']) issues.push(...schemaIssues(validators.current, project.current, 'state/current.json'))
  if (project.files['state/locks.json']) issues.push(...schemaIssues(validators.locks, project.raw.lockFile, 'state/locks.json'))
  for (const character of project.characters) {
    const { __path, ...value } = character
    issues.push(...schemaIssues(validators.character, value, __path))
  }
  for (const summary of project.summaries) {
    const { __path, ...value } = summary
    issues.push(...schemaIssues(validators.summary, value, __path))
  }

  const locations = collectionShape(issues, { locations: project.locations }, 'locations', 'world/locations.json')
  const rules = collectionShape(issues, { rules: project.rules }, 'rules', 'world/rules.json')
  const plots = collectionShape(issues, { plots: project.softPlots }, 'plots', 'plots/soft-plots.json')
  const foreshadowings = collectionShape(issues, { foreshadowings: project.foreshadowings }, 'foreshadowings', 'plots/foreshadowing.json')
  void rules

  issues.push(...duplicateIssues(project.characters, 'characters'))
  issues.push(...duplicateIssues(project.arcs, 'arcs', () => 'story/arcs.json'))
  issues.push(...duplicateIssues(locations, 'locations', () => 'world/locations.json'))
  issues.push(...duplicateIssues(plots, 'soft plots', () => 'plots/soft-plots.json'))
  issues.push(...duplicateIssues(foreshadowings, 'foreshadowings', () => 'plots/foreshadowing.json'))
  issues.push(...duplicateIssues(project.timeline, 'events', (item) => `timeline/events.jsonl:${item.__line}`))

  const characterIds = new Set(project.characters.map((item) => item.id))
  const locationIds = new Set(locations.map((item) => item.id))
  const arcIds = new Set(project.arcs.map((item) => item.id))
  const plotIds = new Set(plots.map((item) => item.id))
  const foreshadowingIds = new Set(foreshadowings.map((item) => item.id))
  const eventIds = new Set(project.timeline.map((item) => item.id))

  for (const character of project.characters) {
    references(issues, character.relationships?.map((item) => item.characterId), characterIds, character.__path, '人物关系')
    if (character.status?.location && !locationIds.has(character.status.location)) {
      issues.push(makeIssue('error', 'dangling-reference', character.__path, `人物位置引用不存在的 ID：${character.status.location}`))
    }
  }
  for (const arc of project.arcs) references(issues, arc.relatedCharacters, characterIds, 'story/arcs.json', '故事弧人物')
  for (const plot of plots) {
    references(issues, plot.relatedCharacters, characterIds, 'plots/soft-plots.json', '支线人物')
    references(issues, plot.relatedArcs, arcIds, 'plots/soft-plots.json', '支线故事弧')
  }
  for (const item of foreshadowings) {
    references(issues, item.relatedCharacters, characterIds, 'plots/foreshadowing.json', '伏笔人物')
    references(issues, item.relatedArcs, arcIds, 'plots/foreshadowing.json', '伏笔故事弧')
  }
  for (const event of project.timeline) {
    const path = `timeline/events.jsonl:${event.__line}`
    references(issues, event.characters, characterIds, path, '事件人物')
    references(issues, event.locations, locationIds, path, '事件地点')
    references(issues, event.arcs, arcIds, path, '事件故事弧')
    references(issues, event.plots, plotIds, path, '事件支线')
    references(issues, event.foreshadowings, foreshadowingIds, path, '事件伏笔')
  }
  for (const summary of project.summaries) {
    references(issues, summary.characters, characterIds, summary.__path, '摘要人物')
    references(issues, summary.locations, locationIds, summary.__path, '摘要地点')
    references(issues, summary.events, eventIds, summary.__path, '摘要事件')
    references(issues, summary.arcUpdates, arcIds, summary.__path, '摘要故事弧')
    references(issues, summary.plotUpdates, plotIds, summary.__path, '摘要支线')
    references(issues, summary.foreshadowingUpdates, foreshadowingIds, summary.__path, '摘要伏笔')
  }
  references(issues, project.current.activeArcs, arcIds, 'state/current.json', '当前故事弧')
  references(issues, project.current.activePlots, plotIds, 'state/current.json', '当前支线')
  references(issues, project.current.openForeshadowings, foreshadowingIds, 'state/current.json', '当前伏笔')

  for (const id of project.current.openForeshadowings ?? []) {
    const item = project.foreshadowings.find((entry) => entry.id === id)
    if (item && !['open', 'developing'].includes(item.status)) {
      issues.push(makeIssue('error', 'foreshadowing-state', 'state/current.json', `伏笔 ${id} 状态为 ${item.status}，不能仍列为 open`))
    }
  }

  const sortedEvents = [...project.timeline]
  for (let index = 1; index < sortedEvents.length; index += 1) {
    const previous = sortedEvents[index - 1]
    const current = sortedEvents[index]
    if ((current.chapter ?? 0) < (previous.chapter ?? 0) || ((current.chapter ?? 0) === (previous.chapter ?? 0) && (current.order ?? 0) < (previous.order ?? 0))) {
      issues.push(makeIssue('error', 'timeline-order', `timeline/events.jsonl:${current.__line}`, `事件顺序早于上一条事件 ${previous.id}`))
    }
  }

  const chapterNumbers = project.chapters.map((item) => item.number).filter(Number.isInteger)
  const maxChapter = chapterNumbers.length ? Math.max(...chapterNumbers) : 0
  if ((project.current.chapter ?? 0) !== maxChapter) {
    issues.push(makeIssue('error', 'chapter-state', 'state/current.json', `current.chapter=${project.current.chapter ?? 0}，但最新章节文件为 ${maxChapter}`))
  }
  if (project.metadata?.current?.chapter !== undefined && project.metadata.current.chapter !== project.current.chapter) {
    issues.push(makeIssue('error', 'chapter-state', 'novel.json', 'novel.current.chapter 与 state/current.json 不一致'))
  }
  for (const chapter of project.chapters) {
    const summary = project.summaries.find((item) => item.chapter === chapter.number)
    const plan = project.plans.find((item) => item.number === chapter.number)
    if (!summary) issues.push(makeIssue('error', 'chapter-companion', chapter.path, `第 ${chapter.number} 章缺少摘要`))
    if (!plan) issues.push(makeIssue('warning', 'chapter-companion', chapter.path, `第 ${chapter.number} 章缺少计划`))
  }
  for (const lock of project.locks) {
    if (!(lock.path in project.files)) issues.push(makeIssue('error', 'lock-target', 'state/locks.json', `锁定目标不存在：${lock.path}`))
  }

  for (const arc of project.arcs.filter((item) => item.status === 'active')) {
    const gap = (project.current.chapter ?? 0) - (arc.lastAdvancedChapter ?? 0)
    if (gap >= 12) issues.push(makeIssue('warning', 'stale-arc', 'story/arcs.json', `故事弧 ${arc.title} 已 ${gap} 章未推进`))
  }

  return issues.sort((left, right) => (left.severity === right.severity ? left.path.localeCompare(right.path) : left.severity === 'error' ? -1 : 1))
}
