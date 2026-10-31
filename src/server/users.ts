import { asc } from 'drizzle-orm'
import type { Context } from 'hono'

import { db } from '@demo-project/db'
import { users } from '@demo-project/db/schema'

export const usersEndpoint = async (context: Context) =>
  context.json(await db.select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.name)))
