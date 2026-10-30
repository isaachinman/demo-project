import { Pool } from 'pg'

import { config } from '@demo-project/config'

import { drizzle } from 'drizzle-orm/node-postgres'

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
})

export const db = drizzle({
  casing: 'snake_case',
  client: pool,
})
