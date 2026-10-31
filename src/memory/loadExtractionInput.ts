import { and, asc, desc, eq, isNotNull, isNull } from 'drizzle-orm'

import { db } from '@demo-project/db'
import { conversations, followUps, memories, turns, users } from '@demo-project/db/schema'

import type { ExtractionInput } from './extractionSchema'

const PREVIOUS_OPENERS = 5

export const loadExtractionInput = async (conversationId: string, userId: string): Promise<ExtractionInput> => {
  const [[user], knownMemories, openFollowUps, openers, transcript] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, userId)),
    db
      .select({ category: memories.category, fact: memories.fact, id: memories.id })
      .from(memories)
      .where(and(eq(memories.userId, userId), isNull(memories.supersededAt)))
      .orderBy(asc(memories.createdAt)),
    db
      .select({ id: followUps.id, question: followUps.question })
      .from(followUps)
      .where(and(eq(followUps.userId, userId), isNull(followUps.resolvedAt))),
    db
      .select({ opener: conversations.opener })
      .from(conversations)
      .where(and(eq(conversations.userId, userId), isNotNull(conversations.opener)))
      .orderBy(desc(conversations.startedAt))
      .limit(PREVIOUS_OPENERS),
    db
      .select({ message: turns.message, role: turns.role })
      .from(turns)
      .where(eq(turns.conversationId, conversationId))
      .orderBy(asc(turns.index)),
  ])

  return {
    followUps: openFollowUps,
    memories: knownMemories,
    name: user?.name ?? 'the user',
    previousOpeners: openers.flatMap(({ opener }) => (opener ? [opener] : [])),
    transcript,
  }
}
