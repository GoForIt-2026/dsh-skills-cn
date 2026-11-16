/**
 * Host half of dsh-skills-cn.
 *
 * The browser half cannot touch the filesystem, so batch deletion lives here:
 * two loopback routes on the host web server, reachable from the DSH page with
 * a same-origin `fetch` (the desktop shell forwards `dsh-app://app` paths to
 * this server with the session cookie attached).
 *
 *   POST /__dsh-skills-cn/roots    -> allowed skill roots (for the UI's enablement)
 *   POST /__dsh-skills-cn/preview  -> what would be deleted, plus lock status
 *   POST /__dsh-skills-cn/delete   -> delete + prune .skill-lock.json
 *   POST /__dsh-skills-cn/usage    -> automatic (model-driven) usage counters
 *   POST /__dsh-skills-cn/usage/clear -> drop some or all of those counters
 *
 * Every route requires the intent header and a same-origin caller; the delete
 * route additionally requires the literal confirmation token. A route that
 * cannot be registered (no webServer) leaves the panel fully functional minus
 * deletion, which reports itself instead of failing silently.
 */
import {
  preview,
  removeSkills,
  listTrash,
  restoreFromTrash,
  purgeTrash,
  skillRoots,
  CONFIRM_TOKEN,
  MAX_NAMES
} from './host/skills-core.js'
import {
  UsageTracker,
  usageFile,
  isValidUsageName,
  skillCallName
} from './host/usage-core.js'
import { readDictionary, dictionaryFile } from './host/local-dict.js'

const PREFIX = '/__dsh-skills-cn'
const INTENT_HEADER = 'x-dsh-skills-cn'
const INTENT_VALUE = 'delete'
const BODY_LIMIT = 64 * 1024

function send(res, status, payload) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(body)
}

function sameOrigin(req, webServer) {
  const origin = req.headers.origin
  if (!origin) return true // same-origin navigations and older clients omit it
  if (origin.startsWith('dsh-app://')) return true // desktop shell
  let self
  try {
    self = webServer.getOrigin()
  } catch (error) {
    return false
  }
  if (origin === self) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch (error) {
    return false
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    let total = 0
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > BODY_LIMIT) {
        finish({ ok: false, reason: 'body-too-large' })
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim()
      if (text === '') {
        finish({ ok: true, value: {} })
        return
      }
      try {
        const value = JSON.parse(text)
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          finish({ ok: false, reason: 'invalid-json' })
          return
        }
        finish({ ok: true, value })
      } catch (error) {
        finish({ ok: false, reason: 'invalid-json' })
      }
    })
    req.on('error', () => finish({ ok: false, reason: 'read-failed' }))
  })
}

/** Read the Host skill registry with the fields the session-scoped Remote drops. */
async function readCatalog(webCtx, sessionId) {
  const skills = webCtx.get('skills')
  if (!skills) return { ok: false, reason: 'no-skills-service' }
  const agents = webCtx.get('agents')
  let agent
  try {
    agent = agents && sessionId ? agents.get(sessionId) : undefined
  } catch (error) {
    agent = undefined
  }
  const attempts = []
  if (agent && agent.ctx) attempts.push({ scope: agent.ctx })
  attempts.push({})
  let lastError
  for (const options of attempts) {
    try {
      const snapshot = await skills.snapshot(options)
      const items = (snapshot.skills || []).map(function (skill) {
        const base = skill.resourceBase
        return {
          name: skill.name,
          description: skill.description,
          whenToUse: skill.whenToUse,
          path: skill.path,
          source: skill.source,
          provider: skill.provider,
          modelInvocable: skill.invocation ? skill.invocation.modelInvocable : undefined,
          userInvocable: skill.invocation ? skill.invocation.userInvocable : undefined,
          resourceBase: base
            ? { kind: base.kind, path: base.path, url: base.url, description: base.description }
            : null
        }
      })
      return { ok: true, items, complete: snapshot.complete !== false, scoped: Boolean(options.scope) }
    } catch (error) {
      lastError = error
    }
  }
  return {
    ok: false,
    reason: 'catalog-failed',
    message: String((lastError && lastError.message) || lastError)
  }
}

function route(handler, webServer) {
  return async function handle(req, res) {
    try {
      if ((req.method || 'GET').toUpperCase() !== 'POST') {
        send(res, 405, { ok: false, reason: 'method-not-allowed' })
        return
      }
      if (req.headers[INTENT_HEADER] !== INTENT_VALUE) {
        send(res, 403, { ok: false, reason: 'forbidden' })
        return
      }
      if (!sameOrigin(req, webServer)) {
        send(res, 403, { ok: false, reason: 'origin-not-allowed' })
        return
      }
      const body = await readBody(req)
      if (body.ok === false) {
        send(res, body.reason === 'body-too-large' ? 413 : 400, { ok: false, reason: body.reason })
        return
      }
      const value = await handler(body.value)
      send(res, value && value.ok === false ? 400 : 200, value)
    } catch (error) {
      send(res, 500, { ok: false, reason: 'internal', message: String((error && error.message) || error) })
    }
  }
}

export function apply(ctx) {
  // Automatic usage: observe every tool result and count the ones where the model
  // loaded a skill. This is a passive listener — it adds nothing to the model's
  // prompt, tools or context, and it runs whether or not the panel is open.
  const tracker = new UsageTracker(usageFile())
  ctx.effect(() => {
    tracker.load()
    const off = ctx.on('tools/result', (exec) => {
      try {
        const name = skillCallName(exec)
        if (name) tracker.bump(name)
      } catch (error) { /* a counter must never disturb a tool result */ }
    })
    return () => {
      if (typeof off === 'function') off()
      tracker.dispose()
    }
  }, 'skill-manager: automatic usage')

  ctx.inject(['webServer'], (webCtx) => {
    const server = webCtx.webServer
    const mount = (path, handler) => {
      webCtx.effect(
        () => server.register({ kind: 'exact', path: PREFIX + path, handler: route(handler, server) }),
        'skill-manager: ' + path
      )
    }

    mount('/roots', async () => ({
      ok: true,
      roots: skillRoots().map((root) => ({ id: root.id, dir: root.dir, lock: root.lock })),
      confirmToken: CONFIRM_TOKEN,
      maxNames: MAX_NAMES
    }))

    // Rich catalog: the Host registry keeps `source`, `provider` and `resourceBase`
    // for every skill, which the session-scoped Remote the panel otherwise uses
    // does not expose.
    mount('/catalog', async (body) => readCatalog(webCtx, body && body.sessionId))

    mount('/preview', async (body) => preview(body.names, skillRoots()))
    mount('/delete', async (body) => removeSkills(body.names, skillRoots(), {
      confirm: body.confirm,
      mode: body.mode
    }))
    mount('/trash-list', async () => listTrash(skillRoots()))
    mount('/trash-restore', async (body) => restoreFromTrash(body.ids, skillRoots()))
    mount('/trash-purge', async (body) => purgeTrash(body.ids, skillRoots()))

    // Local Chinese dictionary: `~/.dsh/skills-cn/zh.json`, re-read on every call so
    // an edit shows up without reinstalling anything.
    mount('/dictionary', async () => {
      const read = await readDictionary(dictionaryFile())
      return {
        ok: true,
        path: dictionaryFile(),
        entries: read.entries,
        invalid: read.ok ? undefined : read.reason
      }
    })

    // Counters only; the browser keeps its own manual counts in localStorage.
    mount('/usage', async () => ({ ok: true, entries: tracker.entries() }))
    mount('/usage/clear', async (body) => {
      const payload = body || {}
      // `{ names: [...] }` removes exactly those rows (an empty list is a no-op);
      // omitting `names` clears every counter.
      if (Object.hasOwn(payload, 'names')) {
        const names = Array.isArray(payload.names) ? payload.names.filter(isValidUsageName) : []
        if (names.length === 0) return { ok: true, cleared: 0, entries: tracker.entries() }
        await tracker.clear(names)
        return { ok: true, cleared: names.length, entries: tracker.entries() }
      }
      await tracker.clear([])
      return { ok: true, cleared: 'all', entries: tracker.entries() }
    })
  })
}
