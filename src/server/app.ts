import type { HttpBindings } from '@hono/node-server'
import { Hono } from 'hono'
import { pinoHttp } from 'pino-http'

import { log } from '@demo-project/lib'
import { healthEndpoint } from '@demo-project/server/health'

const httpLog = pinoHttp({ logger: log })

export const app = new Hono<{ Bindings: HttpBindings }>()

// pino-http logs each request once the Node response finishes.
app.use(async (context, next) => {
  httpLog(context.env.incoming, context.env.outgoing)
  await next()
})

app.get('/health', healthEndpoint)
