import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import type { Context } from 'hono'

import { db } from '@demo-project/db'
import { conversations, followUps, memories, users } from '@demo-project/db/schema'
import { v } from '@demo-project/lib'

const RECENT_CONVERSATIONS = 20

const load = async (context: Context, userId: string) => {
  const [[user], recent, known, open] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.id, userId)),
    db
      .select({
        extractedAt: conversations.extractedAt,
        id: conversations.id,
        startedAt: conversations.startedAt,
        summary: conversations.summary,
      })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt))
      .limit(RECENT_CONVERSATIONS),
    db
      .select({ category: memories.category, fact: memories.fact, id: memories.id })
      .from(memories)
      .where(and(eq(memories.userId, userId), isNull(memories.supersededAt)))
      .orderBy(asc(memories.createdAt)),
    db
      .select({ id: followUps.id, question: followUps.question })
      .from(followUps)
      .where(and(eq(followUps.userId, userId), isNull(followUps.resolvedAt)))
      .orderBy(desc(followUps.createdAt)),
  ])

  return user
    ? context.json({
        conversations: recent.map(({ id, startedAt, summary }) => ({ id, startedAt, summary })),
        followUps: open,
        memories: known,
        // The latest call hasn't been through extraction yet, so the sidebar keeps polling.
        pending: recent[0] ? recent[0].extractedAt === null : false,
      })
    : context.json({ error: 'user_not_found' }, 404)
}

// Read-only view of what Robin remembers about a user, for the sidebar.
export const userMemoryEndpoint = async (context: Context) => {
  const userId = v.safeParse(v.pipe(v.string(), v.uuid()), context.req.param('id'))

  return userId.success ? await load(context, userId.output) : context.json({ error: 'user_not_found' }, 404)
}
