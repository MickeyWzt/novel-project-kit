#!/usr/bin/env node
import { access, cp, mkdir, readdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readProjectDirectory } from '../core/node-files.js'
import { parseNovelProject } from '../core/project.js'
import { calculateProjectStats } from '../core/stats.js'
import { validateNovelProject } from '../core/validator.js'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')
const templateRoot = resolve(projectRoot, 'novel-skill', 'assets', 'novel-project-template')

function usage() {
  console.log(`章法 Novel Project CLI

用法：
  novel validate <项目目录> [--json]
  novel stats <项目目录>
  novel init <新目录>`)
}

function resolveTarget(value) {
  return resolve(process.cwd(), value ?? '.')
}

async function ensureDirectory(path) {
  await access(path, constants.R_OK)
}

async function validateCommand(path, jsonMode) {
  await ensureDirectory(path)
  const files = await readProjectDirectory(path)
  const project = parseNovelProject(files)
  const issues = validateNovelProject(project)
  const errors = issues.filter((item) => item.severity === 'error')
  const warnings = issues.filter((item) => item.severity === 'warning')
  if (jsonMode) {
    console.log(JSON.stringify({ valid: errors.length === 0, errors: errors.length, warnings: warnings.length, issues }, null, 2))
  } else {
    for (const item of issues) {
      const symbol = item.severity === 'error' ? '✗' : '!'
      console.log(`${symbol} [${item.code}] ${item.path} — ${item.message}`)
    }
    if (errors.length === 0) console.log(`✓ 项目有效（${warnings.length} 个警告）`)
    else console.log(`✗ 项目无效（${errors.length} 个错误，${warnings.length} 个警告）`)
  }
  process.exitCode = errors.length === 0 ? 0 : 1
}

async function statsCommand(path) {
  await ensureDirectory(path)
  const project = parseNovelProject(await readProjectDirectory(path))
  const errors = validateNovelProject(project).filter((item) => item.severity === 'error')
  if (errors.length) throw new Error(`项目包含 ${errors.length} 个错误，请先运行 novel validate`)
  const stats = calculateProjectStats(project)
  console.log(`${project.metadata.title}
${stats.chapterCount} 章 · ${stats.wordCount.toLocaleString('zh-CN')} 字 · ${stats.progress}%
${stats.activeArcs} 条活跃故事弧 · ${stats.activePlots} 条活跃支线
${stats.openForeshadowings} 个未回收伏笔 · ${stats.developingForeshadowings} 个发展中伏笔`)
}

async function initCommand(path) {
  await mkdir(path, { recursive: true })
  const entries = await readdir(path)
  if (entries.length) throw new Error(`目标目录不是空目录：${path}`)
  await cp(templateRoot, path, { recursive: true, errorOnExist: true })
  console.log(`✓ 已创建小说项目：${path}`)
  console.log('下一步：修改 novel.json，然后让 Agent 按 Novel Skill 建立故事。')
}

const [command, directory, ...flags] = process.argv.slice(2)
if (!command || ['-h', '--help', 'help'].includes(command)) {
  usage()
} else {
  try {
    if (command === 'validate') await validateCommand(resolveTarget(directory), flags.includes('--json'))
    else if (command === 'stats') await statsCommand(resolveTarget(directory))
    else if (command === 'init') await initCommand(resolveTarget(directory))
    else {
      usage()
      process.exitCode = 2
    }
  } catch (error) {
    console.error(`错误：${error.message}`)
    process.exitCode = 2
  }
}
