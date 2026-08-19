import test from 'node:test'
import assert from 'node:assert/strict'

import { parseNovelProject } from '../core/project.js'
import { calculateProjectStats } from '../core/stats.js'
import { validateNovelProject } from '../core/validator.js'

function validFiles() {
  return {
    'novel.json': JSON.stringify({
      formatVersion: '1.0.0', id: 'test-novel', title: '测试小说', author: '测试者',
      language: 'zh-CN', genres: ['悬疑'], status: 'draft', createdAt: '2026-08-19',
      updatedAt: '2026-08-19', target: { chapters: 100, wordsPerChapter: 4000 },
      current: { chapter: 1, wordCount: 120 }
    }),
    'story/direction.md': '# 故事方向\n\n寻找失落的记忆。',
    'story/bible.md': '# Story Bible',
    'story/style.md': '# 文风',
    'story/arcs.json': JSON.stringify({ arcs: [{ id: 'arc-memory', title: '寻找记忆', type: 'mystery', status: 'active', progress: 10, summary: '追查记忆来源', target: '找到真相', relatedCharacters: ['lin-xia'], lastAdvancedChapter: 1, locked: false }] }),
    'characters/lin-xia.json': JSON.stringify({ id: 'lin-xia', name: '林夏', role: 'protagonist', summary: '高中生', status: { location: 'home', condition: 'healthy', emotion: 'uneasy' }, traits: ['敏锐'], goals: ['找到真相'], knowledge: [], secrets: [], relationships: [], lastUpdatedChapter: 1, canon: { lockedFields: [] } }),
    'world/locations.json': JSON.stringify({ locations: [{ id: 'home', name: '林夏家', type: 'home', summary: '旧公寓', locked: false }] }),
    'world/rules.json': JSON.stringify({ rules: [{ id: 'rule-dream', title: '梦境规则', description: '睡着后进入他人记忆', locked: true }] }),
    'plots/soft-plots.json': JSON.stringify({ plots: [{ id: 'plot-father', title: '父女隔阂', status: 'active', purpose: '改变关系', summary: '两人缺少交流', relatedCharacters: ['lin-xia'], relatedArcs: ['arc-memory'], introducedChapter: 1, lastAdvancedChapter: 1, locked: false }] }),
    'plots/foreshadowing.json': JSON.stringify({ foreshadowings: [{ id: 'f-mirror', title: '镜中人影', status: 'open', description: '镜中出现陌生人', plantedChapter: 1, relatedCharacters: ['lin-xia'], relatedArcs: ['arc-memory'], lastAdvancedChapter: 1, locked: false }] }),
    'timeline/events.jsonl': JSON.stringify({ id: 'event-001', chapter: 1, order: 1, storyDate: '2026-09-01', title: '第一次入梦', summary: '林夏进入陌生记忆', characters: ['lin-xia'], locations: ['home'], arcs: ['arc-memory'], plots: ['plot-father'], foreshadowings: ['f-mirror'] }),
    'plans/001.md': '# 第 1 章计划',
    'chapters/001.md': '# 第一章 梦醒之前\n\n林夏睁开眼睛。',
    'summaries/001.json': JSON.stringify({ chapter: 1, title: '梦醒之前', summary: '林夏第一次进入陌生记忆。', wordCount: 120, characters: ['lin-xia'], locations: ['home'], events: ['event-001'], arcUpdates: ['arc-memory'], plotUpdates: ['plot-father'], foreshadowingUpdates: ['f-mirror'] }),
    'state/current.json': JSON.stringify({ chapter: 1, phase: '第一幕', scene: '家中清晨', storyDate: '2026-09-01', activeArcs: ['arc-memory'], activePlots: ['plot-father'], openForeshadowings: ['f-mirror'], lastUpdatedAt: '2026-08-19' }),
    'state/locks.json': JSON.stringify({ locks: [{ path: 'world/rules.json', scope: 'file', reason: '世界核心规则', lockedAt: '2026-08-19' }] })
  }
}

test('parses and validates a complete Format v1 project', () => {
  const project = parseNovelProject(validFiles())
  const issues = validateNovelProject(project)
  assert.equal(issues.filter((issue) => issue.severity === 'error').length, 0)
  assert.equal(project.characters[0].name, '林夏')
  assert.equal(project.chapters[0].number, 1)
})

test('reports missing required files and malformed JSON', () => {
  const files = validFiles()
  delete files['story/bible.md']
  files['story/arcs.json'] = '{broken'
  const issues = validateNovelProject(files)
  assert.ok(issues.some((issue) => issue.code === 'required-file'))
  assert.ok(issues.some((issue) => issue.code === 'json-parse'))
})

test('reports dangling references and state conflicts', () => {
  const files = validFiles()
  const current = JSON.parse(files['state/current.json'])
  current.activeArcs.push('missing-arc')
  files['state/current.json'] = JSON.stringify(current)
  const foreshadowing = JSON.parse(files['plots/foreshadowing.json'])
  foreshadowing.foreshadowings[0].status = 'resolved'
  files['plots/foreshadowing.json'] = JSON.stringify(foreshadowing)
  const issues = validateNovelProject(files)
  assert.ok(issues.some((issue) => issue.code === 'dangling-reference' && issue.message.includes('missing-arc')))
  assert.ok(issues.some((issue) => issue.code === 'foreshadowing-state'))
})

test('reports duplicate IDs, reversed timeline order, and chapter mismatch', () => {
  const files = validFiles()
  const character = JSON.parse(files['characters/lin-xia.json'])
  files['characters/duplicate.json'] = JSON.stringify({ ...character, name: '重复人物' })
  files['timeline/events.jsonl'] += `\n${JSON.stringify({ id: 'event-002', chapter: 0, order: 1, storyDate: '2026-08-31', title: '倒序事件', summary: '时间错误', characters: [], locations: [], arcs: [], plots: [], foreshadowings: [] })}`
  const current = JSON.parse(files['state/current.json'])
  current.chapter = 2
  files['state/current.json'] = JSON.stringify(current)
  const issues = validateNovelProject(files)
  assert.ok(issues.some((issue) => issue.code === 'duplicate-id'))
  assert.ok(issues.some((issue) => issue.code === 'timeline-order'))
  assert.ok(issues.some((issue) => issue.code === 'chapter-state'))
})

test('calculates dashboard statistics from canonical data', () => {
  const stats = calculateProjectStats(parseNovelProject(validFiles()))
  assert.deepEqual(stats, {
    chapterCount: 1,
    wordCount: 120,
    activeArcs: 1,
    activePlots: 1,
    openForeshadowings: 1,
    developingForeshadowings: 0,
    resolvedForeshadowings: 0,
    longestUnadvancedForeshadowing: 0,
    progress: 1
  })
})
