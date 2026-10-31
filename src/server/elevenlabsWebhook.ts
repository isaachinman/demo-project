import { eq } from 'drizzle-orm'
import type { Context } from 'hono'

import { config } from '@demo-project/config'
import { db } from '@demo-project/db'
import { conversations, turns, users } from '@demo-project/db/schema'
import { log, v } from '@demo-project/lib'
import { toMS } from '@demo-project/utils/data/toMS'
import { elevenlabs } from '@demo-project/voice'
import { PostCallTranscription } from '@demo-project/voice/postCallPayload'
import { addJob } from '@demo-project/worker/queue'

type Data = PostCallTranscription['data']

const verify = async (
  rawBody: string,
  signature: string | undefined,
): Promise<{ ok: true; event: unknown } | { ok: false }> => {
  try {
    const event: unknown = await elevenlabs.webhooks.constructEvent(
      rawBody,
      signature ?? '',
      config.ELEVENLABS_WEBHOOK_SECRET ?? '',
    )

    return { event, ok: true }
  } catch {
    return { ok: false }
  }
}

const milliseconds = (metric: { elapsed_time: number } | undefined) =>
  metric ? toMS.seconds(metric.elapsed_time) : null

// Tool-only turns carry no message and are skipped; the stored index keeps ElevenLabs' position in the call.
const turnRows = (data: Data) =>
  data.transcript.flatMap((turn, index) =>
    turn.message
      ? [
          {
            conversationId: data.conversation_id,
            index,
            llmTtfbMs: milliseconds(turn.conversation_turn_metrics?.metrics?.convai_llm_service_ttfb),
            llmTtfSentenceMs: milliseconds(turn.conversation_turn_metrics?.metrics?.convai_llm_service_ttf_sentence),
            message: turn.message,
            role: turn.role,
            timeInCallSecs: Math.round(turn.time_in_call_secs),
          },
        ]
      : [],
  )

const store = async (data: Data) => {
  const rows = turnRows(data)
  const opener = rows.find(row => row.role === 'agent')?.message ?? null

  await db.transaction(async tx => {
    await tx
      .insert(conversations)
      .values({
        durationSecs: Math.round(data.metadata.call_duration_secs),
        id: data.conversation_id,
        opener,
        startedAt: new Date(toMS.seconds(data.metadata.start_time_unix_secs)),
        userId: data.user_id,
      })
      .onConflictDoNothing()

    if (rows.length > 0) {
      await tx.insert(turns).values(rows).onConflictDoNothing()
    }
  })

  // The job id is the conversation id, so a redelivered webhook queues nothing new.
  await addJob(
    {
      conversationId: data.conversation_id,
      jobType: 'extractMemories',
    },
    { jobId: data.conversation_id },
  )

  log.info({ conversationId: data.conversation_id, turns: rows.length, userId: data.user_id }, 'webhook: call stored')
}

const handle = async (context: Context, event: unknown) => {
  const parsed = v.safeParse(PostCallTranscription, event)
  const [user] = parsed.success
    ? await db.select({ id: users.id }).from(users).where(eq(users.id, parsed.output.data.user_id))
    : []

  // Other event types, malformed payloads and unknown users are acknowledged so ElevenLabs doesn't retry forever.
  if (parsed.success && user) {
    await store(parsed.output.data)
  } else {
    log.warn(
      { issues: parsed.success ? null : parsed.issues.map(issue => v.getDotPath(issue)), knownUser: Boolean(user) },
      'webhook: ignored event',
    )
  }

  return context.json({ ok: true })
}

// ElevenLabs post-call webhook. Signed with an HMAC of the raw body; a database failure returns 500 so it retries.
export const elevenlabsWebhookEndpoint = async (context: Context) => {
  const verified = await verify(await context.req.text(), context.req.header('elevenlabs-signature'))

  return verified.ok ? handle(context, verified.event) : context.json({ error: 'invalid_signature' }, 401)
}
