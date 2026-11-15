#!/usr/bin/env node
/**
 * Publish-time self check for dsh-skills-cn.
 *
 * Runs with no dependencies: verifies the bundle manifest, every file named in
 * `files`, both syntax-checked halves, the patch, both locale files, each
 * declared detail document (exactly one image line, image present and small
 * enough), the icon, and the repository documents.
 */
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const warnings = []

const fail = (message) => errors.push(message)
const warn = (message) => warnings.push(message)
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')
const has = (rel) => existsSync(join(ROOT, rel))
const size = (rel) => statSync(join(ROOT, rel)).size

// ----------------------------------------------------------------- manifest
let pkg
try {
  pkg = JSON.parse(read('package.json'))
} catch (error) {
  console.error(`package.json is not valid JSON: ${error.message}`)
  process.exit(1)
}

for (const field of ['name', 'version', 'description', 'license', 'author']) {
  if (!pkg[field] || typeof pkg[field] !== 'string') fail(`package.json: missing string field "${field}"`)
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version || '')) fail(`package.json: version "${pkg.version}" is not semver`)
if (pkg.private === true) fail('package.json: "private": true blocks publishing')
if (pkg.type !== 'module') fail('package.json: "type" must be "module"')
if (!pkg.exports?.['.']) fail('package.json: exports["."] is required')
if (!pkg.exports?.['./client']) fail('package.json: exports["./client"] is required')
if (!pkg.exports?.['./locale/*.json']) fail('package.json: exports["./locale/*.json"] is required')
if (!pkg.engines?.node) fail('package.json: engines.node is required')
if (!pkg.engines?.dsh) fail('package.json: engines.dsh is required (DSH blocks installation without it)')
if (!pkg.dsh?.bundle?.patch) fail('package.json: dsh.bundle.patch is required')
if (pkg.dsh?.client?.platform !== 'web') fail('package.json: dsh.client.platform must be "web"')
if (pkg.dsh?.client?.immediately !== true) warn('package.json: dsh.client.immediately is not true, the tab may not appear before the plugin is activated')
if (!Array.isArray(pkg.keywords) || !pkg.keywords.includes('dsh-plugin')) fail('package.json: keywords must include "dsh-plugin"')
if (!Array.isArray(pkg.files) || pkg.files.length === 0) fail('package.json: "files" whitelist is empty')
const repositoryUrl = pkg.repository?.url || ''
if (repositoryUrl.includes('YOUR_GITHUB') || (pkg.author || '').includes('YOUR_GITHUB')) {
  warn('package.json: replace YOUR_GITHUB in author/repository/homepage/bugs before publishing')
}

// ------------------------------------------------------------- files entries
const expand = (pattern) => {
  if (!pattern.includes('*')) return [pattern]
  const [dir, rest] = [pattern.slice(0, pattern.indexOf('/')), pattern.slice(pattern.indexOf('/') + 1)]
  if (!has(dir)) return []
  const suffix = rest.replace('*', '')
  return readdirSync(join(ROOT, dir)).filter((name) => name.endsWith(suffix)).map((name) => `${dir}/${name}`)
}
const packed = new Set()
for (const entry of pkg.files || []) {
  const hits = expand(entry)
  if (hits.length === 0) fail(`files: "${entry}" matches nothing`)
  for (const hit of hits) {
    if (!has(hit)) fail(`files: "${hit}" does not exist`)
    if (statSync(join(ROOT, hit)).isDirectory()) {
      for (const inner of readdirSync(join(ROOT, hit))) packed.add(`${hit}/${inner}`)
    } else packed.add(hit)
  }
}
for (const required of ['README.md', 'LICENSE', 'CHANGELOG.md', 'icon.svg', 'cordis.patch.yml']) {
  if (!has(required)) fail(`repository: ${required} is missing`)
}

// --------------------------------------------------------------- JS syntax
for (const file of ['index.js', 'client.js']) {
  if (!has(file)) {
    fail(`${file} is missing`)
    continue
  }
  try {
    execFileSync(process.execPath, ['--check', join(ROOT, file)], { stdio: 'pipe' })
  } catch (error) {
    fail(`${file} has a syntax error: ${String(error.stderr || error.message).trim().split('\n')[0]}`)
  }
}
if (has('client.js') && !read('client.js').includes('__ModuleLoader__')) {
  fail('client.js must register through window.__ModuleLoader__.load')
}
const moduleId = has('client.js') && read('client.js').match(/__ModuleLoader__\.load\(\{\s*id:\s*'([^']+)'/)
if (has('client.js')) {
  if (!moduleId) fail('client.js: could not read the module id from __ModuleLoader__.load({ id: ... })')
  else if (moduleId[1] !== pkg.name) fail(`client.js: module id "${moduleId[1]}" must equal the package name "${pkg.name}"`)
}


// ------------------------------------------------------------------- patch
if (has('cordis.patch.yml')) {
  const patch = read('cordis.patch.yml')
  if (!patch.includes(`name: '${pkg.name}'`) && !patch.includes(`name: "${pkg.name}"`)) {
    fail(`cordis.patch.yml must insert the row with name: '${pkg.name}'`)
  }
  if (!/id:\s*skill-manager/.test(patch)) fail('cordis.patch.yml must insert the row id skill-manager')
}

// ------------------------------------------------------------------ locales
const locales = (pkg.exports?.['./locale/*.json'] ? expand('locale/*.json') : [])
if (locales.length === 0) fail('locale/*.json: no locale files found')
const IMAGE_LINE = /^!\[[^\]]*\]\(([^)\s]+)\)$/
for (const file of locales) {
  let dict
  try {
    dict = JSON.parse(read(file))
  } catch (error) {
    fail(`${file}: invalid JSON (${error.message})`)
    continue
  }
  for (const field of ['title', 'description']) {
    if (typeof dict.meta?.[field] !== 'string' || !dict.meta[field].trim()) fail(`${file}: meta.${field} is required`)
  }
  const detail = dict.meta?.detail
  if (!detail) {
    warn(`${file}: no meta.detail, the plugin page falls back to the package README`)
    continue
  }
  if (!detail.endsWith('.md') && !detail.endsWith('.markdown')) fail(`${file}: meta.detail must end in .md/.markdown`)
  if (!has(detail)) {
    fail(`${file}: meta.detail "${detail}" does not exist`)
    continue
  }
  const lines = read(detail).split(/\r?\n/).filter((line) => line.trim())
  const images = lines.filter((line) => IMAGE_LINE.test(line.trim()))
  if (lines.length !== 1 || images.length !== 1) {
    fail(`${detail}: a detail document must be exactly one image line`)
    continue
  }
  const target = images[0].match(IMAGE_LINE)[1]
  const imagePath = resolve(ROOT, dirname(detail), target)
  if (!existsSync(imagePath)) {
    fail(`${detail}: image "${target}" does not exist`)
    continue
  }
  const bytes = statSync(imagePath).size
  if (bytes > 5 * 1024 * 1024) fail(`${detail}: image "${target}" is larger than 5 MiB`)
  if (!target.endsWith('.svg')) warn(`${detail}: prefer an SVG feature image, found "${target}"`)
}

// --------------------------------------------------------------------- icon
if (has('icon.svg')) {
  const bytes = size('icon.svg')
  if (bytes > 256 * 1024) fail(`icon.svg is ${bytes} bytes, the limit is 256 KiB`)
  const head = read('icon.svg').slice(0, 200).trimStart()
  if (!head.startsWith('<svg') && !head.startsWith('<?xml')) fail('icon.svg does not look like an SVG document')
}

// ------------------------------------------------------------------- report
for (const message of warnings) console.warn(`WARN  ${message}`)
if (errors.length > 0) {
  for (const message of errors) console.error(`ERROR ${message}`)
  console.error(`\nvalidate: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}
console.log(`validate: ok — ${pkg.name}@${pkg.version}, ${packed.size} packaged path(s), ${locales.length} locale(s), ${warnings.length} warning(s)`)
