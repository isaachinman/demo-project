import { sql } from 'drizzle-orm'
import type { Context } from 'hono'

import { db } from '@demo-project/db'
import { redis } from '@demo-project/redis'
import type { HealthCheck } from '@demo-project/types'

// Real readiness: the server is only healthy if it can reach everything a request needs.

const CHECKS: HealthCheck[] = [
  { name: 'database', run: () => db.execute(sql`select 1`) },
  { name: 'redis', run: () => redis.ping() },
]

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const probe = async ({ name, run }: HealthCheck) => {
  try {
    await run()

    return {
      error: null,
      name,
      ok: true,
    }
  } catch (error) {
    return {
      error: errorMessage(error),
      name,
      ok: false,
    }
  }
}

export const healthEndpoint = async (context: Context) => {
  const checks = await Promise.all(CHECKS.map(probe))
  const ok = checks.every(check => check.ok)

  return context.json(
    {
      checks,
      ok,
    },
    ok ? 200 : 503,
  )
}
