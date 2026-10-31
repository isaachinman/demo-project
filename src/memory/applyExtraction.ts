import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@demo-project/db'
import { conversations, followUps, memories, users } from '@demo-project/db/schema'

import type { ExtractionInput, ExtractionResult } from './extractionSchema'
import { ownedIds } from './ownedIds'

const MAX_FOLLOW_UPS = 3

type Target = {
  conversationId: string
  userId: string
}

export const applyExtraction = async (
  { conversationId, userId }: Target,
  input: ExtractionInput,
  result: ExtractionResult,
) => {
  const superseded = ownedIds(
    result.supersededMemoryIds,
    input.memories.map(({ id }) => id),
  )
  const resolved = ownedIds(
    result.resolvedFollowUpIds,
    input.followUps.map(({ id }) => id),
  )
  const added = result.newMemories.map(({ category, fact }) => ({
    category,
    fact,
    sourceConversationId: conversationId,
    userId,
  }))
  const opened = result.followUps.slice(0, MAX_FOLLOW_UPS).map(({ question, why }) => ({
    question,
    sourceConversationId: conversationId,
    userId,
    why,
  }))
  const now = new Date()

  await db.transaction(async tx => {
    if (added.length > 0) {
      await tx.insert(memories).values(added)
    }

    if (superseded.length > 0) {
      await tx
        .update(memories)
        .set({ supersededAt: now })
        .where(and(eq(memories.userId, userId), inArray(memories.id, superseded)))
    }

    if (resolved.length > 0) {
      await tx
        .update(followUps)
        .set({ resolvedAt: now })
        .where(and(eq(followUps.userId, userId), inArray(followUps.id, resolved)))
    }

    if (opened.length > 0) {
      await tx.insert(followUps).values(opened)
    }

    await tx
      .update(conversations)
      .set({ extractedAt: now, summary: result.summary })
      .where(eq(conversations.id, conversationId))
    await tx.update(users).set({ nextOpener: result.opener }).where(eq(users.id, userId))
  })

  return {
    added: added.length,
    followUps: opened.length,
    superseded: superseded.length,
  }
}
