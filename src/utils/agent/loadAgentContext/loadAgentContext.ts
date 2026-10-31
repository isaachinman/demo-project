import { desc, eq } from 'drizzle-orm'

import { db } from '@demo-project/db'
import { conversations, followUps, memories, users } from '@demo-project/db/schema'
import type { AgentContext } from '@demo-project/types'

const RECENT_CONVERSATIONS = 5

// Read once at call start; buildAgentPrompt filters and caps what reaches the prompt.
export const loadAgentContext = async (userId: string): Promise<AgentContext | null> => {
  const [[user], userMemories, userFollowUps, recent] = await Promise.all([
    db.select({ name: users.name, nextOpener: users.nextOpener }).from(users).where(eq(users.id, userId)),
    db
      .select({
        category: memories.category,
        createdAt: memories.createdAt,
        fact: memories.fact,
        supersededAt: memories.supersededAt,
      })
      .from(memories)
      .where(eq(memories.userId, userId)),
    db
      .select({ createdAt: followUps.createdAt, question: followUps.question, resolvedAt: followUps.resolvedAt })
      .from(followUps)
      .where(eq(followUps.userId, userId)),
    db
      .select({ opener: conversations.opener, startedAt: conversations.startedAt, summary: conversations.summary })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt))
      .limit(RECENT_CONVERSATIONS),
  ])

  return user
    ? {
        conversations: recent,
        followUps: userFollowUps,
        memories: userMemories,
        name: user.name,
        nextOpener: user.nextOpener,
        now: new Date(),
      }
    : null
}
