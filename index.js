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

    mount('/preview', async (body) => preview(body.names, skillRoots()))
    mount('/delete', async (body) => removeSkills(body.names, skillRoots(), {
      confirm: body.confirm,
      mode: body.mode
    }))
    mount('/trash-list', async () => listTrash(skillRoots()))
    mount('/trash-restore', async (body) => restoreFromTrash(body.ids, skillRoots()))
    mount('/trash-purge', async (body) => purgeTrash(body.ids, skillRoots()))
  })
}
