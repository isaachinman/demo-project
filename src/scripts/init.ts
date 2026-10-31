import { db, pool, seedUsers } from '@demo-project/db'
import { log } from '@demo-project/lib'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

// Idempotent: safe to run on every deploy.

await migrate(db, {
  migrationsFolder: 'src/db/migrations',
})

await seedUsers()

await pool.end()

log.info('init: migrations applied and users seeded')
