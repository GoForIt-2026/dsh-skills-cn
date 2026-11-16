/**
 * Unit tests for the local Chinese dictionary (`~/.dsh/skills-cn/zh.json`).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import {
  MAX_DESC,
  MAX_ENTRIES,
  MAX_NAME,
  dictionaryFile,
  normalizeDictionary,
  readDictionary
} from '../host/local-dict.js'

const tmpdir = () => fs.mkdtemp(path.join(os.tmpdir(), 'dsh-skills-cn-dict-'))

test('accepts the array, string and object shapes', () => {
  const dict = normalizeDictionary({
    'my-skill': ['我的技能', '一句话说明它干什么'],
    'name-only': '光有名字',
    'object-row': { name: '对象写法', description: '也认' }
  })
  assert.deepEqual(dict.entries['my-skill'], ['我的技能', '一句话说明它干什么'])
  assert.deepEqual(dict.entries['name-only'], ['光有名字'])
  assert.deepEqual(dict.entries['object-row'], ['对象写法', '也认'])
})

test('drops rows that would break the panel instead of failing the file', () => {
  const dict = normalizeDictionary({
    'Bad-Upper': ['不行'],
    '../escape': ['不行'],
    __proto__: ['不行'],
    '': ['不行'],
    'no-name': ['', '只有说明没有名字'],
    'bad-value': 42,
    good: ['  好好  的  名字  ', '  说明   连着空格 ']
  })
  assert.deepEqual(Object.keys(dict.entries), ['good'])
  assert.deepEqual(dict.entries.good, ['好好 的 名字', '说明 连着空格'])
})

test('caps name and description length and the total row count', () => {
  const long = 'x'.repeat(300)
  const dict = normalizeDictionary({ skill: [long, long] })
  assert.equal(dict.entries.skill[0].length, MAX_NAME)
  assert.equal(dict.entries.skill[1].length, MAX_DESC)

  const many = {}
  for (let i = 0; i < MAX_ENTRIES + 10; i += 1) many['skill-' + i] = ['名字' + i]
  assert.equal(Object.keys(normalizeDictionary(many).entries).length, MAX_ENTRIES)
})

test('a missing file is an empty dictionary, not an error', async () => {
  const dir = await tmpdir()
  const file = dictionaryFile(dir)
  assert.ok(file.endsWith(path.join('.dsh', 'skills-cn', 'zh.json')))
  const read = await readDictionary(file)
  assert.equal(read.ok, true)
  assert.equal(read.missing, true)
  assert.deepEqual(read.entries, {})
})

test('a malformed file reports why and stays empty', async () => {
  const dir = await tmpdir()
  const file = dictionaryFile(dir)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, '{ nope', 'utf8')
  const read = await readDictionary(file)
  assert.equal(read.ok, false)
  assert.equal(read.reason, 'dictionary-invalid-json')
  assert.deepEqual(read.entries, {})
})

test('tolerates a UTF-8 BOM written by Windows editors', async () => {
  const dir = await tmpdir()
  const file = dictionaryFile(dir)
  await fs.mkdir(path.dirname(file), { recursive: true })
  const body = JSON.stringify({ 'my-skill': ['我的技能', '说明'] }, null, 2)
  await fs.writeFile(file, '\uFEFF' + body, 'utf8')
  const read = await readDictionary(file)
  assert.equal(read.ok, true)
  assert.deepEqual(read.entries['my-skill'], ['我的技能', '说明'])
})

test('reads a hand-written file', async () => {
  const dir = await tmpdir()
  const file = dictionaryFile(dir)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify({
    'universal-video-prompt-reverse': ['视频反推提示词', '把参考视频逆向拆成可用的生成提示词']
  }, null, 2), 'utf8')
  const read = await readDictionary(file)
  assert.equal(read.ok, true)
  assert.deepEqual(read.entries['universal-video-prompt-reverse'], ['视频反推提示词', '把参考视频逆向拆成可用的生成提示词'])
})
