import { eq } from 'drizzle-orm'
import type { Context } from 'hono'

import { config } from '@demo-project/config'
import { db } from '@demo-project/db'
import { users } from '@demo-project/db/schema'
import { log, v } from '@demo-project/lib'
import { buildAgentPrompt } from '@demo-project/utils/agent/buildAgentPrompt'
import { elevenlabs } from '@demo-project/voice'

const SessionRequest = v.object({
  userId: v.pipe(v.string(), v.uuid()),
})

const readJson = async (context: Context) => {
  try {
    return await context.req.json()
  } catch {
    return null
  }
}

const mintToken = async () => {
  try {
    const { token } = await elevenlabs.conversationalAi.conversations.getWebrtcToken({
      agentId: config.ELEVENLABS_AGENT_ID ?? 'missing',
    })

    return token
  } catch (error) {
    log.error({ err: error }, 'sessions: ElevenLabs token request failed')
    return null
  }
}

const startSession = async (context: Context, userId: string) => {
  const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId))
  const conversationToken = user ? await mintToken() : null

  return user && conversationToken
    ? context.json({ conversationToken, ...buildAgentPrompt({ name: user.name }) })
    : context.json(user ? { error: 'voice_unavailable' } : { error: 'user_not_found' }, user ? 502 : 404)
}

// Everything the browser needs to start a voice conversation with the agent, personalised for the user.
export const sessionsEndpoint = async (context: Context) => {
  const body = v.safeParse(SessionRequest, await readJson(context))

  return body.success ? startSession(context, body.output.userId) : context.json({ error: 'invalid_request' }, 400)
}
