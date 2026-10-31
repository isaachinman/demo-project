import { parseArgs } from 'node:util'

import { and, count, eq, gte, isNotNull, isNull, or, type SQLWrapper, sql } from 'drizzle-orm'

import { db, pool } from '@demo-project/db'
import { conversations, turns } from '@demo-project/db/schema'

// p50/p90 of ElevenLabs' per-turn LLM latency for agent turns, optionally since a timestamp:
//   bun run report:latency --since 2026-10-31T14:00:00Z
// Run it once per bake-off window so each candidate model is reported separately.

const { values } = parseArgs({ options: { since: { type: 'string' } } })
const since = values.since ? new Date(values.since) : new Date(0)

const percentile = (column: SQLWrapper, fraction: number) =>
  sql<number | null>`percentile_cont(${fraction}) within group (order by ${column})`.mapWith(Number)

const inWindow = and(eq(turns.role, 'agent'), gte(conversations.startedAt, since))

const [measured] = await db
  .select({
    sentenceP50: percentile(turns.llmTtfSentenceMs, 0.5),
    sentenceP90: percentile(turns.llmTtfSentenceMs, 0.9),
    ttfbP50: percentile(turns.llmTtfbMs, 0.5),
    ttfbP90: percentile(turns.llmTtfbMs, 0.9),
    turns: count(),
  })
  .from(turns)
  .innerJoin(conversations, eq(turns.conversationId, conversations.id))
  .where(and(inWindow, isNotNull(turns.llmTtfbMs), isNotNull(turns.llmTtfSentenceMs)))

const [unmeasured] = await db
  .select({ turns: count() })
  .from(turns)
  .innerJoin(conversations, eq(turns.conversationId, conversations.id))
  .where(and(inWindow, or(isNull(turns.llmTtfbMs), isNull(turns.llmTtfSentenceMs))))

await pool.end()

const ms = (value: number | null | undefined) =>
  value === null || value === undefined ? '–' : `${Math.round(value)} ms`
const row = (label: string, p50: number | null | undefined, p90: number | null | undefined) =>
  `${label.padEnd(26)}${ms(p50).padStart(10)}${ms(p90).padStart(10)}`

process.stdout.write(
  [
    `Agent turns since ${since.toISOString()}: ${measured?.turns ?? 0} measured, ${unmeasured?.turns ?? 0} without metrics`,
    '',
    `${''.padEnd(26)}${'p50'.padStart(10)}${'p90'.padStart(10)}`,
    row('Time to first token', measured?.ttfbP50, measured?.ttfbP90),
    row('Time to first sentence', measured?.sentenceP50, measured?.sentenceP90),
    '',
    'Target: time to first sentence p50 ≤ 600 ms, p90 ≤ 1000 ms',
    '',
  ].join('\n'),
)
