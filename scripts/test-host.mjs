/**
 * Unit tests for the host deletion core.
 *
 * Every case builds its own throwaway home directory, so the real skill roots
 * and `.skill-lock.json` are never touched.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  locate,
  preview,
  removeSkills,
  skillRoots,
  CONFIRM_TOKEN
} from '../host/skills-core.js'

async function makeHome() {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-skills-cn-test-'))
  const skills = path.join(home, '.agents', 'skills')
  await fs.mkdir(path.join(skills, 'alpha'), { recursive: true })
  await fs.mkdir(path.join(skills, 'beta'), { recursive: true })
  await fs.writeFile(path.join(skills, 'alpha', 'SKILL.md'), '---\nname: alpha\n---\n')
  await fs.writeFile(path.join(skills, 'beta', 'SKILL.md'), '---\nname: beta\n---\n')
  await fs.writeFile(path.join(skills, 'beta', 'notes.txt'), 'x'.repeat(42))
  return { home, skills, roots: skillRoots(home) }
}

async function writeLock(home, skills) {
  const file = path.join(home, '.agents', '.skill-lock.json')
  await fs.writeFile(file, JSON.stringify({
    version: 3,
    skills,
    dismissed: { findSkillsPrompt: true },
    futureField: { keep: true }
  }, null, 2) + '\n', 'utf8')
  return file
}

const ENTRY = () => ({
  source: 'acme/skills',
  sourceType: 'github',
  sourceUrl: 'https://github.com/acme/skills.git',
  skillPath: 'skills/alpha/SKILL.md',
  skillFolderHash: 'abc',
  installedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
})

test('deletes directories and prunes only the registered names', async () => {
  const { home, skills, roots } = await makeHome()
  const lock = await writeLock(home, { alpha: ENTRY() })

  const reviewed = await preview(['alpha', 'beta'], roots)
  assert.equal(reviewed.ok, true)
  assert.deepEqual(reviewed.items.map((item) => item.name), ['alpha', 'beta'])
  assert.equal(reviewed.items[0].allowed, true)
  assert.equal(reviewed.items[0].lockRegistered, true)
  assert.equal(reviewed.items[1].lockRegistered, false)
  assert.equal(reviewed.items[1].files, 2)
  assert.ok(reviewed.items[1].bytes >= 42)

  const result = await removeSkills(['alpha', 'beta'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.ok, true)
  assert.deepEqual(result.deleted.sort(), ['alpha', 'beta'])
  assert.deepEqual(result.lockRemoved, ['alpha'])
  assert.equal(result.lockChanged, true)

  await assert.rejects(fs.stat(path.join(skills, 'alpha')))
  await assert.rejects(fs.stat(path.join(skills, 'beta')))

  const written = JSON.parse(await fs.readFile(lock, 'utf8'))
  assert.equal(written.version, 3)
  assert.deepEqual(written.dismissed, { findSkillsPrompt: true })
  assert.deepEqual(written.futureField, { keep: true })
  assert.deepEqual(Object.keys(written.skills), [])

  const again = await preview(['alpha'], roots)
  assert.equal(again.items[0].allowed, false)
  assert.equal(again.items[0].reason, 'missing')
})

test('leaves the lock file byte-identical when nothing is registered', async () => {
  const { home, roots } = await makeHome()
  const lock = await writeLock(home, { alpha: ENTRY() })
  const before = await fs.readFile(lock, 'utf8')
  const beforeStat = await fs.stat(lock)
  await delay(20)

  const result = await removeSkills(['beta'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.ok, true)
  assert.equal(result.lockChanged, false)
  assert.deepEqual(result.lockRemoved, [])
  assert.equal(await fs.readFile(lock, 'utf8'), before)
  assert.equal((await fs.stat(lock)).mtimeMs, beforeStat.mtimeMs)
})

test('rejects invalid names without touching disk', async () => {
  const { skills, roots } = await makeHome()
  for (const name of ['../escape', 'a/b', 'A-Upper', '.', '..', 'x'.repeat(70), '']) {
    const found = await locate(name, roots)
    assert.equal(found.ok, false, name)
    assert.equal(found.reason, 'invalid-name', name)
  }
  assert.equal((await fs.readdir(skills)).sort().join(','), 'alpha,beta')
})

test('refuses a symlinked skill directory and leaves its target alone', async (t) => {
  const { home, skills, roots } = await makeHome()
  const outside = path.join(home, 'outside')
  await fs.mkdir(outside, { recursive: true })
  await fs.writeFile(path.join(outside, 'keep.txt'), 'keep')
  try {
    await fs.symlink(outside, path.join(skills, 'linked'), 'dir')
  } catch (error) {
    t.skip('creating a directory symlink needs extra privileges on this host')
    return
  }
  const found = await locate('linked', roots)
  assert.equal(found.ok, false)
  assert.equal(found.reason, 'symlink')

  const result = await removeSkills(['linked'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.results[0].ok, false)
  assert.equal(result.results[0].reason, 'symlink')
  assert.equal(await fs.readFile(path.join(outside, 'keep.txt'), 'utf8'), 'keep')
  // The link itself is left in place: deletion never follows or unlinks it.
  assert.ok((await fs.lstat(path.join(skills, 'linked'))).isSymbolicLink())
})

test('aborts without deleting anything when the lock cannot be parsed', async () => {
  const { home, skills, roots } = await makeHome()
  const lock = path.join(home, '.agents', '.skill-lock.json')
  await fs.writeFile(lock, '{ this is not json', 'utf8')

  const result = await removeSkills(['alpha'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.ok, false)
  assert.equal(result.aborted, 'lock-unreadable')
  assert.equal(result.results[0].reason, 'lock-unreadable')
  assert.ok(await fs.stat(path.join(skills, 'alpha')))
  assert.equal(await fs.readFile(lock, 'utf8'), '{ this is not json')
})

test('cleans a registration whose directory is already gone', async () => {
  const { home, skills, roots } = await makeHome()
  const lock = await writeLock(home, { ghost: ENTRY(), alpha: ENTRY() })
  await fs.rm(path.join(skills, 'alpha'), { recursive: true, force: true })

  const result = await removeSkills(['ghost', 'alpha'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.ok, true)
  assert.equal(result.results[0].ok, false)
  assert.equal(result.results[0].reason, 'missing')
  assert.equal(result.results[1].ok, false)
  assert.equal(result.results[1].reason, 'missing')
  assert.deepEqual(result.lockRemoved.sort(), ['alpha', 'ghost'])
  const written = JSON.parse(await fs.readFile(lock, 'utf8'))
  assert.deepEqual(Object.keys(written.skills), [])
})

test('requires explicit confirmation and well-formed input', async () => {
  const { skills, roots } = await makeHome()
  assert.equal((await removeSkills(['alpha'], roots, {})).reason, 'confirmation-required')
  assert.equal((await removeSkills([], roots, { confirm: CONFIRM_TOKEN })).reason, 'empty')
  assert.equal((await removeSkills('alpha', roots, { confirm: CONFIRM_TOKEN })).reason, 'invalid-names')
  assert.equal((await removeSkills(['alpha'], roots, { confirm: 'delete' })).reason, 'confirmation-required')
  assert.ok(await fs.stat(path.join(skills, 'alpha')))
})

test('treats a missing lock file as an empty registry', async () => {
  const { skills, roots } = await makeHome()
  const result = await removeSkills(['beta'], roots, { confirm: CONFIRM_TOKEN })
  assert.equal(result.ok, true)
  assert.equal(result.lockChanged, false)
  await assert.rejects(fs.stat(path.join(skills, 'beta')))
})
