/**
 * Unit tests for the automatic usage counters.
 *
 * Every case uses its own throwaway directory, so the real
 * `~/.dsh/skills-cn/usage.json` is never touched.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import {
  USAGE_VERSION,
  MAX_ENTRIES,
  bumpAuto,
  clearUsage,
  isValidUsageName,
  mergeStores,
  normalizeStore,
  readUsage,
  skillCallName,
  usageFile,
  writeUsageAtomic,
  UsageTracker
} from '../host/usage-core.js'

const tmpdir = () => fs.mkdtemp(path.join(os.tmpdir(), 'dsh-skills-cn-usage-'))

test('reads the skill name out of a tools/result execution', () => {
  assert.equal(skillCallName({ name: 'skill', arguments: { name: 'dsh-doc' } }), 'dsh-doc')
  assert.equal(skillCallName({ name: 'skill', arguments: '{"name":"office"}' }), 'office')
  assert.equal(skillCallName({ name: 'bash', arguments: { name: 'dsh-doc' } }), '', 'other tools are ignored')
  assert.equal(skillCallName({ name: 'skill', arguments: { name: '../x' } }), '', 'unsafe names are ignored')
  assert.equal(skillCallName({ name: 'skill', arguments: null }), '')
  assert.equal(skillCallName({ name: 'skill', arguments: 'not json' }), '')
  assert.equal(skillCallName(null), '')
  assert.equal(skillCallName({}), '')
})

test('counts one automatic use per call without mutating the input', () => {
  const start = normalizeStore(null)
  const once = bumpAuto(start, 'ab-testing', 1000)
  assert.equal(once.entries['ab-testing'].auto, 1)
  assert.equal(once.entries['ab-testing'].lastAt, 1000)
  assert.deepEqual(start.entries, {}, 'the input store is untouched')

  const twice = bumpAuto(once, 'ab-testing', 900)
  assert.equal(twice.entries['ab-testing'].auto, 2)
  assert.equal(twice.entries['ab-testing'].lastAt, 1000, 'lastAt never moves backwards')
})

test('ignores names that could poison the store or escape the shape', () => {
  for (const name of ['__proto__', 'constructor', 'prototype', 'A-Upper', 'a/b', '../x', '', '   ', null, 42, 'x'.repeat(70)]) {
    assert.equal(isValidUsageName(name), false, String(name))
    const store = bumpAuto(normalizeStore(null), name, 5)
    assert.deepEqual(store.entries, {}, String(name))
  }
  assert.equal(isValidUsageName('dsh-doc'), true)
  assert.equal(isValidUsageName('office-xlsx'), true)
})

test('normalizes a damaged store', () => {
  const entries = {
    good: { auto: 3, lastAt: 10 },
    zero: { auto: 0, lastAt: 0 },
    negative: { auto: -4, lastAt: 6 },
    stringy: 'nope',
    arrayish: [1, 2],
    __proto__: { auto: 99, lastAt: 99 }
  }
  const store = normalizeStore({ version: 99, entries })
  assert.equal(store.version, USAGE_VERSION)
  assert.equal(store.entries.good.auto, 3)
  assert.equal(store.entries.zero, undefined, 'an all-zero row is dropped')
  assert.equal(store.entries.negative.auto, 0, 'a negative count clamps to zero')
  assert.equal(store.entries.stringy, undefined)
  assert.equal(store.entries.arrayish, undefined)
  assert.equal(Object.hasOwn(store.entries, '__proto__'), false)
})

test('caps the store at MAX_ENTRIES rows, keeping the most recent', () => {
  const entries = {}
  for (let i = 0; i < MAX_ENTRIES + 20; i += 1) {
    entries['extra-' + i] = { auto: 1, lastAt: i + 1 }
  }
  const store = normalizeStore({ entries })
  assert.equal(Object.keys(store.entries).length, MAX_ENTRIES)
  assert.ok(store.entries['extra-' + (MAX_ENTRIES + 19)], 'the newest row survives')
  assert.equal(store.entries['extra-0'], undefined, 'the oldest row is dropped')
})

test('merges two stores by name', () => {
  const a = bumpAuto(bumpAuto(normalizeStore(null), 'alpha', 10), 'beta', 20)
  const b = bumpAuto(normalizeStore(null), 'alpha', 30)
  const merged = mergeStores(a, b)
  assert.equal(merged.entries.alpha.auto, 2)
  assert.equal(merged.entries.alpha.lastAt, 30)
  assert.equal(merged.entries.beta.auto, 1)
  assert.equal(merged.entries.beta.lastAt, 20)
})

test('clears everything or only the named rows', () => {
  let store = bumpAuto(bumpAuto(normalizeStore(null), 'alpha', 1), 'beta', 2)
  const partial = clearUsage(store, ['alpha'])
  assert.deepEqual(Object.keys(partial.entries), ['beta'])
  assert.deepEqual(Object.keys(store.entries), ['alpha', 'beta'], 'input untouched')
  assert.deepEqual(clearUsage(store, []).entries, {})
  assert.deepEqual(clearUsage(store, 'alpha').entries, {}, 'a non-array clears everything')
})

test('a missing file reads as an empty store and a corrupt one does not throw', async () => {
  const dir = await tmpdir()
  const file = path.join(dir, 'nested', 'usage.json')
  const missing = await readUsage(file)
  assert.equal(missing.ok, true)
  assert.equal(missing.missing, true)
  assert.deepEqual(missing.store.entries, {})

  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, '{ not json', 'utf8')
  const corrupt = await readUsage(file)
  assert.equal(corrupt.ok, false)
  assert.equal(corrupt.reason, 'usage-unreadable')
  assert.deepEqual(corrupt.store.entries, {})
})

test('writes the store atomically into a directory that does not exist yet', async () => {
  const dir = await tmpdir()
  const file = usageFile(dir)
  assert.ok(file.endsWith(path.join('.dsh', 'skills-cn', 'usage.json')))
  const store = bumpAuto(normalizeStore(null), 'office', 42)
  await writeUsageAtomic(file, store)
  const read = await readUsage(file)
  assert.equal(read.ok, true)
  assert.equal(read.store.entries.office.auto, 1)
  assert.equal(read.store.entries.office.lastAt, 42)
  const raw = JSON.parse(await fs.readFile(file, 'utf8'))
  assert.equal(raw.version, USAGE_VERSION)
  assert.deepEqual(Object.keys(raw).sort(), ['entries', 'version'], 'nothing else is persisted')
})

test('the tracker counts before load, coalesces writes and flushes on dispose', async () => {
  const dir = await tmpdir()
  const file = path.join(dir, 'usage.json')
  const tracker = new UsageTracker(file, { delay: 5 })

  tracker.bump('early')
  await tracker.load()
  assert.equal(tracker.entries().early.auto, 1, 'a bump that arrives before load survives')

  tracker.bump('alpha')
  tracker.bump('alpha')
  tracker.bump('beta')
  assert.equal(tracker.entries().alpha.auto, 2, 'counts are visible before the flush')
  assert.equal(tracker.writeCount, 0, 'nothing is written while the debounce is pending')
  await tracker.flush()
  assert.equal(tracker.writeCount, 1, 'three bumps produced one write')
  const first = await readUsage(file)
  assert.equal(first.store.entries.alpha.auto, 2)
  assert.equal(first.store.entries.beta.auto, 1)

  tracker.bump('alpha')
  await tracker.dispose()
  const second = await readUsage(file)
  assert.equal(second.store.entries.alpha.auto, 3)
})

test('the tracker keeps counts across a reload of the same file', async () => {
  const dir = await tmpdir()
  const file = path.join(dir, 'usage.json')
  const first = new UsageTracker(file, { delay: 5 })
  await first.load()
  first.bump('alpha')
  await first.flush()

  const second = new UsageTracker(file, { delay: 5 })
  await second.load()
  second.bump('alpha')
  await second.flush()
  assert.equal((await readUsage(file)).store.entries.alpha.auto, 2)
})
