/**
 * Skill-directory deletion for dsh-skills-cn.
 *
 * Pure Node helpers with no Cordis dependency so they can be unit tested: name
 * validation, root resolution, preview statistics, physical removal, and the
 * `.agents/.skill-lock.json` prune that keeps the registry in step with disk.
 *
 * Safety rules baked in here:
 *  - a name is one path segment matching SKILL.md's own naming rules;
 *  - a skill directory must be a direct, non-symlinked child of an allowed root;
 *  - the lock file is parsed before anything is deleted, so an unreadable lock
 *    aborts the whole request instead of leaving a stale registration;
 *  - the lock is only rewritten when a removed name was actually registered.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { randomBytes } from 'node:crypto'

export const NAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/
export const CONFIRM_TOKEN = 'DELETE'
export const MAX_NAMES = 200

/** Allowed skill roots for this machine, plus the lock file that belongs to the first one. */
export function skillRoots(home = os.homedir()) {
  const agents = path.join(home, '.agents')
  return [
    { id: 'agents', dir: path.join(agents, 'skills'), lock: path.join(agents, '.skill-lock.json') },
    { id: 'dsh-skills', dir: path.join(home, '.dsh', 'skills'), lock: null },
    { id: 'dsh-agent-skills', dir: path.join(home, '.dsh', 'agent-skills'), lock: null }
  ]
}

export function isValidName(name) {
  return typeof name === 'string'
    && NAME_PATTERN.test(name)
    && name !== '.' && name !== '..'
    && !name.includes('/') && !name.includes('\\')
}

function samePath(a, b) {
  const left = path.resolve(a)
  const right = path.resolve(b)
  return process.platform === 'win32' ? left.toLowerCase() === right.toLowerCase() : left === right
}

async function statOrNull(target) {
  try {
    return await fs.lstat(target)
  } catch (error) {
    if (error && error.code === 'ENOENT') return null
    throw error
  }
}

/** Count files and bytes under a directory without following symlinks. */
export async function measure(dir) {
  let bytes = 0
  let files = 0
  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch (error) {
      continue
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (entry.isFile()) {
        files += 1
        try {
          const info = await fs.stat(full)
          bytes += info.size
        } catch (error) { /* raced away; keep counting */ }
      }
    }
  }
  return { files, bytes }
}

/**
 * Resolve one skill name against the allowed roots.
 * @returns `{ ok: true, dir, root }` or `{ ok: false, reason }`.
 */
export async function locate(name, roots = skillRoots()) {
  if (!isValidName(name)) return { ok: false, reason: 'invalid-name' }
  for (const root of roots) {
    const dir = path.join(root.dir, name)
    const info = await statOrNull(dir)
    if (info === null) continue
    if (info.isSymbolicLink()) return { ok: false, reason: 'symlink' }
    if (!info.isDirectory()) return { ok: false, reason: 'not-directory' }
    const realParent = await fs.realpath(path.dirname(dir)).catch(() => null)
    const realRoot = await fs.realpath(root.dir).catch(() => null)
    if (realParent === null || realRoot === null) return { ok: false, reason: 'outside-root' }
    if (!samePath(realParent, realRoot)) return { ok: false, reason: 'outside-root' }
    return { ok: true, dir, root }
  }
  return { ok: false, reason: 'missing' }
}

/** Read the lock file. A missing file is a valid empty registry. */
export async function readLock(lockPath) {
  try {
    const raw = await fs.readFile(lockPath, 'utf8')
    const data = JSON.parse(raw)
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, reason: 'lock-unreadable' }
    }
    if (data.skills !== undefined && (data.skills === null || typeof data.skills !== 'object')) {
      return { ok: false, reason: 'lock-unreadable' }
    }
    return { ok: true, data }
  } catch (error) {
    if (error && error.code === 'ENOENT') return { ok: true, data: null, missing: true }
    return { ok: false, reason: 'lock-unreadable' }
  }
}

/** Remove the named registrations, keeping every other field untouched. */
export function pruneLock(data, names) {
  const skills = data && data.skills && typeof data.skills === 'object' ? data.skills : {}
  const next = {}
  const removed = []
  for (const key of Object.keys(skills)) {
    if (names.includes(key)) removed.push(key)
    else next[key] = skills[key]
  }
  return { data: Object.assign({}, data, { skills: next }), removed }
}

/** Replace the lock file atomically: temp file in the same directory, then rename. */
export async function writeLockAtomic(lockPath, data) {
  const text = JSON.stringify(data, null, 2) + '\n'
  const temp = path.join(path.dirname(lockPath), `.skill-lock.${randomBytes(6).toString('hex')}.tmp`)
  await fs.writeFile(temp, text, 'utf8')
  try {
    await fs.rename(temp, lockPath)
  } catch (error) {
    await fs.rm(temp, { force: true }).catch(() => {})
    // Windows refuses to replace an existing file with rename in some states.
    await fs.writeFile(lockPath, text, 'utf8')
  }
}

function normalizeNames(names) {
  if (!Array.isArray(names)) return { ok: false, reason: 'invalid-names' }
  if (names.length === 0) return { ok: false, reason: 'empty' }
  if (names.length > MAX_NAMES) return { ok: false, reason: 'too-many' }
  const unique = []
  for (const name of names) {
    if (typeof name !== 'string') return { ok: false, reason: 'invalid-names' }
    if (!unique.includes(name)) unique.push(name)
  }
  return { ok: true, names: unique }
}

/**
 * Read-only preview: what would be deleted, and whether the lock registers it.
 */
export async function preview(names, roots = skillRoots()) {
  const list = normalizeNames(names)
  if (list.ok === false) return { ok: false, reason: list.reason }

  const lockRoot = roots.find((root) => root.lock)
  const lock = lockRoot ? await readLock(lockRoot.lock) : { ok: true, data: null }
  const registered = lock.ok && lock.data && lock.data.skills ? lock.data.skills : {}

  const items = []
  for (const name of list.names) {
    const found = await locate(name, roots)
    if (found.ok === false) {
      items.push({ name, allowed: false, reason: found.reason, lockRegistered: Object.hasOwn(registered, name) })
      continue
    }
    const stats = await measure(found.dir)
    items.push({
      name,
      allowed: true,
      dir: found.dir,
      root: found.root.id,
      bytes: stats.bytes,
      files: stats.files,
      lockRegistered: Object.hasOwn(registered, name),
      lockShared: found.root.lock !== null
    })
  }

  return {
    ok: true,
    items,
    lock: lockRoot
      ? {
          path: lockRoot.lock,
          readable: lock.ok,
          reason: lock.ok ? undefined : lock.reason,
          entries: lock.ok && lock.data && lock.data.skills ? Object.keys(lock.data.skills).length : 0
        }
      : null
  }
}

/**
 * Delete the requested skill directories and prune their lock registrations.
 * The lock is parsed first: an unreadable lock aborts before any file is touched.
 */
export async function removeSkills(names, roots = skillRoots(), options = {}) {
  const list = normalizeNames(names)
  if (list.ok === false) return { ok: false, reason: list.reason }
  if (options.confirm !== CONFIRM_TOKEN) return { ok: false, reason: 'confirmation-required' }

  const results = []
  const located = []
  const prunable = []
  const deleted = []
  for (const name of list.names) {
    const found = await locate(name, roots)
    if (found.ok === false) {
      // A registration whose directory is already gone must still be cleaned out.
      if (found.reason === 'missing') prunable.push(name)
      results.push({ name, ok: false, reason: found.reason })
      continue
    }
    located.push({ name, found })
  }

  // Parse the lock before touching any directory, whichever root holds it.
  const lockRoot = roots.find((entry) => entry.lock)
  const lockPath = lockRoot ? lockRoot.lock : null
  let lock = { ok: true, data: null }
  if (lockPath) {
    lock = await readLock(lockPath)
    if (lock.ok === false) {
      return {
        ok: false,
        aborted: 'lock-unreadable',
        lockPath,
        results: list.names.map((name) => ({ name, ok: false, reason: 'lock-unreadable' }))
      }
    }
  }

  for (const entry of located) {
    try {
      await fs.rm(entry.found.dir, { recursive: true, force: true, maxRetries: 3 })
      deleted.push(entry.name)
      prunable.push(entry.name)
      results.push({ name: entry.name, ok: true, dir: entry.found.dir })
    } catch (error) {
      results.push({ name: entry.name, ok: false, reason: (error && error.code) || 'delete-failed' })
    }
  }

  let lockChanged = false
  let lockRemoved = []
  if (lockPath && prunable.length > 0) {
    const pruned = pruneLock(lock.data || { version: 3, skills: {} }, prunable)
    lockRemoved = pruned.removed
    if (lockRemoved.length > 0) {
      try {
        await writeLockAtomic(lockPath, pruned.data)
        lockChanged = true
      } catch (error) {
        return {
          ok: false,
          aborted: 'lock-write-failed',
          lockPath,
          results,
          error: (error && error.code) || 'lock-write-failed'
        }
      }
    }
  }

  for (const result of results) {
    if (result.ok && lockRemoved.includes(result.name)) result.lockRemoved = true
  }

  return { ok: true, results, deleted, lockChanged, lockRemoved, lockPath }
}
