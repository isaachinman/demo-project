import { sql } from 'drizzle-orm'

import { index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

// `bun run db:generate` writes the migration. Column names become snake_case via the client's casing option.

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow()

export const users = pgTable('users', {
  createdAt: createdAt(),
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  // Written by the extraction job; the first message of the user's next call.
  nextOpener: text(),
})

export const conversations = pgTable(
  'conversations',
  {
    durationSecs: integer().notNull(),
    // Set once the extraction job has run, even when it found nothing to extract.
    extractedAt: timestamp({ withTimezone: true }),
    // The ElevenLabs conversation_id.
    id: text().primaryKey(),
    // The first message the agent actually spoke.
    opener: text(),
    startedAt: timestamp({ withTimezone: true }).notNull(),
    summary: text(),
    userId: uuid()
      .notNull()
      .references(() => users.id),
  },
  table => [index().on(table.userId, table.startedAt.desc())],
)

export const turnRole = pgEnum('turn_role', ['user', 'agent'])

export const turns = pgTable(
  'turns',
  {
    conversationId: text()
      .notNull()
      .references(() => conversations.id),
    id: uuid().primaryKey().defaultRandom(),
    index: integer().notNull(),
    // ElevenLabs per-turn LLM latency, on agent turns only.
    llmTtfbMs: integer(),
    llmTtfSentenceMs: integer(),
    message: text().notNull(),
    role: turnRole().notNull(),
    timeInCallSecs: integer().notNull(),
  },
  table => [unique().on(table.conversationId, table.index)],
)

export const memoryCategory = pgEnum('memory_category', [
  'background',
  'people',
  'work',
  'interests',
  'plans',
  'preferences',
  'feelings',
])

export const memories = pgTable(
  'memories',
  {
    category: memoryCategory().notNull(),
    createdAt: createdAt(),
    fact: text().notNull(),
    id: uuid().primaryKey().defaultRandom(),
    sourceConversationId: text()
      .notNull()
      .references(() => conversations.id),
    supersededAt: timestamp({ withTimezone: true }),
    userId: uuid()
      .notNull()
      .references(() => users.id),
  },
  table => [index().on(table.userId).where(sql`${table.supersededAt} is null`)],
)

export const followUps = pgTable('follow_ups', {
  createdAt: createdAt(),
  id: uuid().primaryKey().defaultRandom(),
  question: text().notNull(),
  resolvedAt: timestamp({ withTimezone: true }),
  sourceConversationId: text()
    .notNull()
    .references(() => conversations.id),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  why: text().notNull(),
})
