/**
 * Usage counters for dsh-skills-cn.
 *
 * Manual counts live in the browser (`localStorage`): the panel writes them when
 * you insert a command. Automatic counts — the model loading a skill through the
 * `skill` tool — are observed on the Host through the `tools/result` event and
 * persisted here. The two halves are merged only for display.
 *
 * Pure helpers (normalize / bump / merge) carry no Cordis or fs dependency beyond
 * reading and writing one JSON file, so they are unit tested directly.
 *
 * The file holds nothing but skill names, counts and timestamps: never a skill
 * description, body or any other content.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { randomBytes } from 'node:crypto'
import { NAME_PATTERN } from './skills-core.js'

export const USAGE_VERSION = 1
/** Keep the file small even if a session invents names; 500 rows is plenty. */
export const MAX_ENTRIES = 500
/** Object keys that would poison a plain-object store. */
const RESERVED = new Set(['__proto__', 'constructor', 'prototype'])

/** `<home>/.dsh/skills-cn/usage.json` — beside the other per-plugin DSH dirs. */
export function usageFile(home = os.homedir()) {
  return path.join(home, '.dsh', 'skills-cn', 'usage.json')
}

export function isValidUsageName(name) {
  return typeof name === 'string'
    && NAME_PATTERN.test(name)
    && !RESERVED.has(name)
}

/**
 * The skill name behind a `tools/result` execution, or `''` when the call was
 * not the model loading a skill. Arguments arrive parsed, but some dispatch
 * paths carry the raw JSON string, so both shapes are accepted.
 */
export function skillCallName(exec) {
  if (!exec || typeof exec !== 'object' || exec.name !== 'skill') return ''
  let args = exec.arguments
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args)
    } catch (error) {
      return ''
    }
  }
  const name = args && typeof args === 'object' ? args.name : ''
  return isValidUsageName(name) ? name : ''
}

function safeCount(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return 0
  return Math.min(Math.trunc(number), Number.MAX_SAFE_INTEGER)
}

function safeTime(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : 0
}

/**
 * Accept anything that claims to be a store and return a clean one: unknown keys
 * dropped, counts clamped, at most MAX_ENTRIES rows (newest first).
 */
export function normalizeStore(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw.entries : null
  const entries = {}
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    for (const name of Object.keys(source)) {
      if (!isValidUsageName(name)) continue
      const value = source[name]
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const auto = safeCount(value.auto)
      const lastAt = safeTime(value.lastAt)
      if (auto === 0 && lastAt === 0) continue
      entries[name] = { auto, lastAt }
    }
  }
  const names = Object.keys(entries)
  if (names.length > MAX_ENTRIES) {
    names.sort(function (a, b) { return entries[b].lastAt - entries[a].lastAt })
    const kept = {}
    for (const name of names.slice(0, MAX_ENTRIES)) kept[name] = entries[name]
    return { version: USAGE_VERSION, entries: kept }
  }
  return { version: USAGE_VERSION, entries }
}

function cloneEntries(entries) {
  const next = {}
  for (const name of Object.keys(entries)) next[name] = { auto: entries[name].auto, lastAt: entries[name].lastAt }
  return next
}

/** Count one automatic use. Returns a new store; the input is not mutated. */
export function bumpAuto(store, name, at = Date.now()) {
  const base = normalizeStore(store)
  if (!isValidUsageName(name)) return base
  const previous = base.entries[name] || { auto: 0, lastAt: 0 }
  const entries = cloneEntries(base.entries)
  entries[name] = { auto: previous.auto + 1, lastAt: Math.max(previous.lastAt, safeTime(at)) }
  return { version: USAGE_VERSION, entries }
}

/** Sum two stores by name (used to keep counts bumped while the file was loading). */
export function mergeStores(left, right) {
  const a = normalizeStore(left).entries
  const b = normalizeStore(right).entries
  const entries = cloneEntries(a)
  for (const name of Object.keys(b)) {
    const existing = entries[name]
    entries[name] = {
      auto: (existing ? existing.auto : 0) + b[name].auto,
      lastAt: Math.max(existing ? existing.lastAt : 0, b[name].lastAt)
    }
  }
  return { version: USAGE_VERSION, entries }
}

/** Remove the named rows; an empty list clears everything. */
export function clearUsage(store, names) {  const base = normalizeStore(store)
  if (!Array.isArray(names) || names.length === 0) return { version: USAGE_VERSION, entries: {} }
  const drop = new Set(names.filter(isValidUsageName))
  const entries = {}
  for (const name of Object.keys(base.entries)) {
    if (!drop.has(name)) entries[name] = base.entries[name]
  }
  return { version: USAGE_VERSION, entries }
}

/** Read the store. A missing file is a valid empty store. */
export async function readUsage(file) {
  try {
    const raw = await fs.readFile(file, 'utf8')
    return { ok: true, store: normalizeStore(JSON.parse(raw)) }
  } catch (error) {
    if (error && error.code === 'ENOENT') return { ok: true, store: normalizeStore(null), missing: true }
    // A corrupt file must not stop counting: start clean and let the next flush
    // replace it.
    return { ok: false, reason: 'usage-unreadable', store: normalizeStore(null) }
  }
}

/** Replace the file atomically (temp file in the same directory, then rename). */
export async function writeUsageAtomic(file, store) {
  const dir = path.dirname(file)
  await fs.mkdir(dir, { recursive: true })
  const text = JSON.stringify({ version: USAGE_VERSION, entries: normalizeStore(store).entries }, null, 2) + '\n'
  const temp = path.join(dir, `.usage.${randomBytes(6).toString('hex')}.tmp`)
  await fs.writeFile(temp, text, 'utf8')
  try {
    await fs.rename(temp, file)
  } catch (error) {
    await fs.rm(temp, { force: true }).catch(function () {})
    await fs.writeFile(file, text, 'utf8')
  }
}

/**
 * Process-local counter with a debounced flush: `bump` is synchronous so the
 * `tools/result` listener never delays a tool result, and disk writes coalesce.
 */
export class UsageTracker {
  constructor(file, options = {}) {
    this.file = file
    this.delay = Number.isFinite(options.delay) ? options.delay : 800
    this.now = typeof options.now === 'function' ? options.now : function () { return Date.now() }
    this.store = normalizeStore(null)
    this.loaded = false
    this.queue = []
    this.timer = null
    this.writes = Promise.resolve()
    this.writeCount = 0
  }

  async load() {
    const result = await readUsage(this.file)
    // Bumps that arrived while reading are kept: merge the file under them.
    this.store = mergeStores(result.store, this.store)
    this.loaded = true
    if (this.queue.length > 0) {
      const queued = this.queue
      this.queue = []
      for (const name of queued) this.store = bumpAuto(this.store, name, this.now())
    }
    return result
  }

  bump(name) {
    if (!this.loaded) {
      if (isValidUsageName(name)) this.queue.push(name)
      return
    }
    this.store = bumpAuto(this.store, name, this.now())
    this.schedule()
  }

  clear(names) {
    this.store = clearUsage(this.store, names)
    this.schedule()
    return this.flush()
  }

  schedule() {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      this.flush()
    }, this.delay)
    if (typeof this.timer.unref === 'function') this.timer.unref()
  }

  /** Write the current snapshot now; resolves once that snapshot is on disk. */
  flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (!this.loaded) return Promise.resolve()
    const snapshot = { version: USAGE_VERSION, entries: cloneEntries(normalizeStore(this.store).entries) }
    this.writeCount += 1
    this.writes = this.writes
      .then(() => writeUsageAtomic(this.file, snapshot))
      .catch(function () { /* keep counting even when the disk refuses */ })
    return this.writes
  }

  snapshot() {
    return normalizeStore(this.store)
  }

  entries() {
    return this.snapshot().entries
  }

  dispose() {
    return this.flush()
  }
}
