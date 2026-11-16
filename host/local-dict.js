/**
 * Local Chinese dictionary for dsh-skills-cn.
 *
 * The shipped `TERMS` table only knows common skill packs. Skills you name
 * yourself are never in it, and the plugin deliberately does not translate at
 * runtime (no model call, no network). This file is the escape hatch: a plain
 * JSON map on this machine that wins over `TERMS` but not over your own ✎ edits.
 *
 *   ~/.dsh/skills-cn/zh.json
 *   {
 *     "my-own-skill": ["我的技能", "一句话说明它干什么"]
 *   }
 *
 * One line per skill. The name is required, the description optional; a bare
 * string (`"my-own-skill": "我的技能"`) is accepted too.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { NAME_PATTERN } from './skills-core.js'

export const DICT_VERSION = 1
export const MAX_ENTRIES = 500
export const MAX_NAME = 40
export const MAX_DESC = 160
const RESERVED = new Set(['__proto__', 'constructor', 'prototype'])

export function dictionaryFile(home = os.homedir()) {
  return path.join(home, '.dsh', 'skills-cn', 'zh.json')
}

function isUsableName(name) {
  return typeof name === 'string' && NAME_PATTERN.test(name) && !RESERVED.has(name)
}

function cleanText(value, limit) {
  if (typeof value !== 'string') return ''
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > limit ? text.slice(0, limit) : text
}

/**
 * Accept a hand-edited map and return only the usable rows:
 * `{ entries: { name: [中文名, 中文说明] } }`. Invalid keys and empty names are
 * dropped rather than failing the whole file, so one typo cannot blank the panel.
 */
export function normalizeDictionary(raw) {
  const entries = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { version: DICT_VERSION, entries }
  for (const name of Object.keys(raw)) {
    if (!isUsableName(name)) continue
    const value = raw[name]
    let zhName = ''
    let zhDesc = ''
    if (typeof value === 'string') {
      zhName = cleanText(value, MAX_NAME)
    } else if (Array.isArray(value)) {
      zhName = cleanText(value[0], MAX_NAME)
      zhDesc = cleanText(value[1], MAX_DESC)
    } else if (value && typeof value === 'object') {
      zhName = cleanText(value.name || value.zhName, MAX_NAME)
      zhDesc = cleanText(value.description || value.zhDesc, MAX_DESC)
    }
    if (!zhName) continue
    entries[name] = zhDesc ? [zhName, zhDesc] : [zhName]
    if (Object.keys(entries).length >= MAX_ENTRIES) break
  }
  return { version: DICT_VERSION, entries }
}

/** Read the file. A missing file is simply "nothing extra". */
export async function readDictionary(file) {
  let text
  try {
    text = await fs.readFile(file, 'utf8')
  } catch (error) {
    if (error && error.code === 'ENOENT') return { ok: true, missing: true, entries: {} }
    return { ok: false, reason: 'dictionary-unreadable', entries: {} }
  }
  try {
    // Editors on Windows happily save "UTF-8 with BOM"; JSON.parse refuses it.
    return { ok: true, ...normalizeDictionary(JSON.parse(text.replace(/^\uFEFF/, ''))) }
  } catch (error) {
    return { ok: false, reason: 'dictionary-invalid-json', entries: {} }
  }
}
