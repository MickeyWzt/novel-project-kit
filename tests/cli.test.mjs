import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const cli = join(root, 'bin', 'novel.mjs')

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' })
}

test('validate returns zero and supports JSON output for the demo', () => {
  const result = run(['validate', 'examples/yesterday-awake', '--json'])
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const value = JSON.parse(result.stdout)
  assert.equal(value.valid, true)
  assert.equal(value.errors, 0)
})

test('validate returns non-zero for an incomplete directory', () => {
  const directory = mkdtempSync(join(tmpdir(), 'novel-invalid-'))
  try {
    const result = run(['validate', directory])
    assert.equal(result.status, 1)
    assert.match(result.stdout, /缺少必需文件/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('stats prints canonical dashboard statistics', () => {
  const result = run(['stats', 'examples/yesterday-awake'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /27 章/)
  assert.match(result.stdout, /108,420 字/)
})

test('init copies a valid template into a new empty directory', () => {
  const base = mkdtempSync(join(tmpdir(), 'novel-init-'))
  const target = join(base, 'my-novel')
  try {
    const created = run(['init', target])
    assert.equal(created.status, 0, created.stderr || created.stdout)
    const validated = run(['validate', target])
    assert.equal(validated.status, 0, validated.stderr || validated.stdout)
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})
