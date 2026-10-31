import { and, count, eq } from 'drizzle-orm'

import { db } from '@demo-project/db'
import { conversations, turns } from '@demo-project/db/schema'
import { log } from '@demo-project/lib'
import { applyExtraction, extractMemories as extract, loadExtractionInput } from '@demo-project/memory'
import type { JobHandler } from '@demo-project/types'

const MIN_USER_TURNS = 2

const markExtracted = (conversationId: string) =>
  db.update(conversations).set({ extractedAt: new Date() }).where(eq(conversations.id, conversationId))

const run = async (conversationId: string, userId: string) => {
  const [userTurns] = await db
    .select({ value: count() })
    .from(turns)
    .where(and(eq(turns.conversationId, conversationId), eq(turns.role, 'user')))

  // Too short to learn anything from; mark it done so the sidebar stops waiting.
  if ((userTurns?.value ?? 0) < MIN_USER_TURNS) {
    await markExtracted(conversationId)
    log.info({ conversationId }, 'job: extractMemories skipped a short call')
  } else {
    const input = await loadExtractionInput(conversationId, userId)
    const applied = await applyExtraction({ conversationId, userId }, input, await extract(input))

    log.info({ conversationId, ...applied }, 'job: extractMemories applied')
  }
}

// Idempotent: the extractedAt guard skips a conversation that was already processed.
export const extractMemories: JobHandler<'extractMemories'> = async ({ conversationId }) => {
  const [conversation] = await db
    .select({ extractedAt: conversations.extractedAt, userId: conversations.userId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))

  if (conversation && !conversation.extractedAt) {
    await run(conversationId, conversation.userId)
  }
}
