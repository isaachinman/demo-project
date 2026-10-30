import { serve } from '@hono/node-server'

import { config } from '@demo-project/config'
import { pool } from '@demo-project/db'
import { log } from '@demo-project/lib'
import { redis } from '@demo-project/redis'

import { app } from './app'

const server = serve({
  fetch: app.fetch,
  hostname: '::',
  port: config.PORT,
})

log.info({ port: config.PORT }, 'server: listening')

const stop = async (exitCode: 0 | 1) => {
  log.info('server: shutting down')
  server.close()
  await Promise.all([pool.end(), redis.quit()])
  process.exit(exitCode)
}

// Signals can arrive more than once (e.g. forwarded by tsx and concurrently); closing the pool twice rejects.
let stopping: Promise<void> | null = null

const shutdown = (exitCode: 0 | 1) => {
  stopping ??= stop(exitCode)
  return stopping
}

process.on('SIGTERM', () => shutdown(0))
process.on('SIGINT', () => shutdown(0))
process.on('unhandledRejection', reason => {
  log.error({ err: reason }, 'server: unhandled rejection')
  return shutdown(1)
})
