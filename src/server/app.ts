import type { HttpBindings } from '@hono/node-server'
import { Hono } from 'hono'
import { pinoHttp } from 'pino-http'

import { config } from '@demo-project/config'
import { log } from '@demo-project/lib'
import { healthEndpoint } from '@demo-project/server/health'
import { sessionsEndpoint } from '@demo-project/server/sessions'
import { usersEndpoint } from '@demo-project/server/users'

import { cors } from 'hono/cors'

const httpLog = pinoHttp({ logger: log })

export const app = new Hono<{ Bindings: HttpBindings }>()

// pino-http logs each request once the Node response finishes.
app.use(async (context, next) => {
  httpLog(context.env.incoming, context.env.outgoing)
  await next()
})

// In production the web app is served from Cloudflare Pages, a different origin; in dev Vite proxies /api.
app.use('/api/*', cors({ origin: config.WEB_ORIGIN }))

app.onError((error, context) => {
  log.error({ err: error, path: context.req.path }, 'server: request failed')
  return context.json({ error: 'internal_error' }, 500)
})

app.get('/health', healthEndpoint)
app.get('/api/users', usersEndpoint)
app.post('/api/sessions', sessionsEndpoint)
