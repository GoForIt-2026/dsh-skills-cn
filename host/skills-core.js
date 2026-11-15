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

/**
 * A row of the registry only governs skills that live in the same root as the
 * lock file: `~/.agents/.skill-lock.json` registers `~/.agents/skills/*`. A
 * skill of the same name under `~/.dsh/skills` is a different installation and
 * must neither read nor prune that record.
 */
function ownsLock(root, lockPath) {
  return Boolean(root && root.lock && lockPath && samePath(root.lock, lockPath))
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
    if (data.skills !== undefined
      && (data.skills === null || typeof data.skills !== 'object' || Array.isArray(data.skills))) {
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
      // A registered name whose directory is gone everywhere is cleaned out, so
      // it is honest to report the record here; every other refusal is a no-op.
      items.push({
        name,
        allowed: false,
        reason: found.reason,
        lockRegistered: found.reason === 'missing' && Object.hasOwn(registered, name)
      })
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
      lockRegistered: ownsLock(found.root, lockRoot && lockRoot.lock) && Object.hasOwn(registered, name),
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

function lockEntryOf(lockData, name) {
  if (!lockData || !lockData.skills || typeof lockData.skills !== 'object') return null
  return Object.hasOwn(lockData.skills, name) ? lockData.skills[name] : null
}

/** `<root>/../.skill-trash` — beside the skills directory, never inside it. */
export function trashRootOf(root) {
  return path.join(path.dirname(root.dir), '.skill-trash')
}

function newTrashId() {
  return Date.now().toString(36) + '-' + randomBytes(3).toString('hex')
}

/** Move one skill directory into the root's trash with a restore manifest. */
export async function moveToTrash(name, found, lockEntry) {
  const root = found.root
  const trashRoot = trashRootOf(root)
  const id = newTrashId()
  const entryDir = path.join(trashRoot, id)
  await fs.mkdir(entryDir, { recursive: true })
  const meta = {
    version: 1,
    id,
    name,
    rootId: root.id,
    rootDir: root.dir,
    originalDir: found.dir,
    trashedAt: Date.now(),
    lockEntry: lockEntry || null
  }
  await fs.writeFile(path.join(entryDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')
  try {
    await fs.rename(found.dir, path.join(entryDir, name))
  } catch (error) {
    if (error && error.code === 'EXDEV') {
      // Different volume: copy then remove.
      await fs.cp(found.dir, path.join(entryDir, name), { recursive: true, force: true })
      await fs.rm(found.dir, { recursive: true, force: true, maxRetries: 3 })
    } else {
      await fs.rm(entryDir, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  }
  return meta
}

/** Read every trash entry across the allowed roots. */
export async function listTrash(roots = skillRoots()) {
  const items = []
  const seen = new Set()
  for (const root of roots) {
    const trashRoot = trashRootOf(root)
    if (seen.has(trashRoot)) continue
    seen.add(trashRoot)
    let ids
    try {
      ids = await fs.readdir(trashRoot, { withFileTypes: true })
    } catch (error) {
      continue
    }
    for (const entry of ids) {
      if (!entry.isDirectory()) continue
      const entryDir = path.join(trashRoot, entry.name)
      let meta
      try {
        meta = JSON.parse(await fs.readFile(path.join(entryDir, 'meta.json'), 'utf8'))
      } catch (error) {
        continue
      }
      // A tampered or half-written manifest must not make us measure (or later
      // move) anything outside the entry directory.
      if (!meta || typeof meta !== 'object' || !isValidName(meta.name)) continue
      const payloadDir = path.join(entryDir, meta.name)
      const stats = await measure(payloadDir)
      items.push({
        id: meta.id || entry.name,
        name: meta.name,
        rootId: meta.rootId,
        rootDir: meta.rootDir,
        originalDir: meta.originalDir,
        trashedAt: meta.trashedAt || 0,
        lockEntry: meta.lockEntry || null,
        bytes: stats.bytes,
        files: stats.files,
        entryDir
      })
    }
  }
  items.sort(function (a, b) { return b.trashedAt - a.trashedAt })
  return { ok: true, items, count: items.length }
}

function findRootForMeta(meta, roots) {
  const byId = roots.find(function (root) { return root.id === meta.rootId })
  if (byId) return byId
  return roots.find(function (root) { return samePath(root.dir, meta.rootDir) }) || null
}

/** Move one trash entry back to its original root and restore its lock record. */
export async function restoreFromTrash(ids, roots = skillRoots()) {
  if (!Array.isArray(ids) || ids.length === 0) return { ok: false, reason: 'empty' }
  const listed = await listTrash(roots)
  const results = []
  const lockRoot = roots.find(function (root) { return root.lock })
  let lock = lockRoot ? await readLock(lockRoot.lock) : { ok: true, data: null }
  if (lockRoot && lock.ok === false) {
    return { ok: false, aborted: 'lock-unreadable', results: [] }
  }

  for (const id of ids) {
    const entry = listed.items.find(function (item) { return item.id === id })
    if (!entry) {
      results.push({ id, ok: false, reason: 'not-found' })
      continue
    }
    if (!isValidName(entry.name)) {
      results.push({ id, ok: false, reason: 'invalid-name' })
      continue
    }
    const root = findRootForMeta(entry, roots)
    if (!root) {
      results.push({ id, ok: false, reason: 'outside-root' })
      continue
    }
    const target = path.join(root.dir, entry.name)
    const existing = await statOrNull(target)
    if (existing !== null) {
      results.push({ id, ok: false, reason: 'target-exists' })
      continue
    }
    const payload = path.join(entry.entryDir, entry.name)
    const payloadInfo = await statOrNull(payload)
    if (payloadInfo === null) {
      results.push({ id, ok: false, name: entry.name, reason: 'payload-missing' })
      continue
    }
    if (payloadInfo.isSymbolicLink() || !payloadInfo.isDirectory()) {
      results.push({ id, ok: false, name: entry.name, reason: 'payload-unsafe' })
      continue
    }
    try {
      await fs.mkdir(root.dir, { recursive: true })
      await fs.rename(payload, target)
    } catch (error) {
      try {
        await fs.cp(payload, target, { recursive: true, force: false, errorOnExist: true })
        await fs.rm(payload, { recursive: true, force: true })
      } catch (fallbackError) {
        results.push({ id, ok: false, reason: (fallbackError && fallbackError.code) || 'restore-failed' })
        continue
      }
    }

    let lockRestored = false
    // Ownership is re-checked here as well: entries written by older builds may
    // still carry a record copied from a lock that never governed this root.
    if (lockRoot && entry.lockEntry && lock.ok && ownsLock(root, lockRoot.lock)) {
      const data = lock.data || { version: 3, skills: {} }
      const skills = Object.assign({}, data.skills || {})
      if (!Object.hasOwn(skills, entry.name)) {
        skills[entry.name] = entry.lockEntry
        const next = Object.assign({}, data, { skills })
        try {
          await writeLockAtomic(lockRoot.lock, next)
          lock.data = next
          lockRestored = true
        } catch (error) {
          // The registry is the half we cannot leave stale: put the files back
          // into the trash entry and keep it, so the user can retry.
          await fs.rename(target, path.join(entry.entryDir, entry.name)).catch(() => {})
          results.push({
            id,
            ok: false,
            name: entry.name,
            reason: 'lock-write-failed',
            lockError: (error && error.code) || 'lock-write-failed'
          })
          continue
        }
      }
    }
    await fs.rm(entry.entryDir, { recursive: true, force: true }).catch(() => {})
    results.push({ id, ok: true, name: entry.name, dir: target, lockRestored })
  }

  return { ok: true, results }
}

/** Permanently remove trash entries. */
export async function purgeTrash(ids, roots = skillRoots()) {
  if (!Array.isArray(ids) || ids.length === 0) return { ok: false, reason: 'empty' }
  const listed = await listTrash(roots)
  const results = []
  for (const id of ids) {
    const entry = listed.items.find(function (item) { return item.id === id })
    if (!entry) {
      results.push({ id, ok: false, reason: 'not-found' })
      continue
    }
    try {
      await fs.rm(entry.entryDir, { recursive: true, force: true, maxRetries: 3 })
      results.push({ id, ok: true })
    } catch (error) {
      results.push({ id, ok: false, reason: (error && error.code) || 'purge-failed' })
    }
  }
  return { ok: true, results }
}

/**
 * Delete the requested skill directories and prune their lock registrations.
 * The lock is parsed first: an unreadable lock aborts before any file is touched.
 */
export async function removeSkills(names, roots = skillRoots(), options = {}) {
  const list = normalizeNames(names)
  if (list.ok === false) return { ok: false, reason: list.reason }
  if (options.confirm !== CONFIRM_TOKEN) return { ok: false, reason: 'confirmation-required' }
  const mode = options.mode === 'purge' ? 'purge' : 'trash'

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
    // Only the root that owns the lock may read or prune its record.
    const owner = ownsLock(entry.found.root, lockPath)
    try {
      if (mode === 'trash') {
        const original = owner ? lockEntryOf(lock.data, entry.name) : null
        await moveToTrash(entry.name, entry.found, original)
        results.push({ name: entry.name, ok: true, dir: entry.found.dir, trashed: true })
      } else {
        await fs.rm(entry.found.dir, { recursive: true, force: true, maxRetries: 3 })
        results.push({ name: entry.name, ok: true, dir: entry.found.dir })
      }
      deleted.push(entry.name)
      if (owner) prunable.push(entry.name)
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

  return {
    ok: true,
    results,
    mode,
    deleted,
    trashed: results.filter(function (item) { return item.trashed === true; }).map(function (item) { return item.name; }),
    lockChanged,
    lockRemoved,
    lockPath
  }
}
