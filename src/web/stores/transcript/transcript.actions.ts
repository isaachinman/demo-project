import type { MessagePayload } from '@elevenlabs/react'

import { v } from '@demo-project/lib/valibot'

import { type TranscriptLine, useTranscriptStore } from './transcript.store'

type Correction = {
  event_id: number
  corrected_agent_response: string
}

type ResponsePart = {
  event_id: number
  text: string
  type: 'start' | 'delta' | 'stop'
}

// The SDK has no callback for the user's in-progress speech; it only arrives as a raw incoming event.
const TentativeUserTranscript = v.object({
  tentative_user_transcription_event: v.object({
    event_id: v.number(),
    user_transcript: v.string(),
  }),
  type: v.literal('tentative_user_transcript'),
})

const keyOf = (role: TranscriptLine['role'], eventId: number) => `${role}-${eventId}`

const upsert = (line: TranscriptLine, update: (existing: TranscriptLine) => TranscriptLine = () => line) =>
  useTranscriptStore.setState(({ lines }) => ({
    lines: lines.some(({ key }) => key === line.key)
      ? lines.map(existing => (existing.key === line.key ? update(existing) : existing))
      : [...lines, line],
  }))

export const clearTranscript = () => useTranscriptStore.setState({ lines: [] })

// Final text for a turn; replaces whatever streamed in for it.
export const addTranscriptLine = ({ event_id, role, message }: MessagePayload) =>
  upsert({ final: true, key: keyOf(role, event_id), message, role })

// Robin's reply, token by token as the model writes it.
export const streamAgentText = ({ event_id, text, type }: ResponsePart) =>
  upsert({ final: type === 'stop', key: keyOf('agent', event_id), message: text, role: 'agent' }, existing => ({
    ...existing,
    final: existing.final || type === 'stop',
    message: existing.final ? existing.message : `${existing.message}${text}`,
  }))

// The user's words while they are still speaking; each event carries the whole transcript so far.
export const streamUserText = (event: unknown) => {
  const parsed = v.safeParse(TentativeUserTranscript, event)

  if (parsed.success) {
    const { event_id, user_transcript } = parsed.output.tentative_user_transcription_event

    upsert({ final: false, key: keyOf('user', event_id), message: user_transcript, role: 'user' }, existing =>
      existing.final ? existing : { ...existing, message: user_transcript },
    )
  }
}

// When the user interrupts, ElevenLabs trims the agent's reply to what was actually spoken.
export const correctTranscriptLine = ({ event_id, corrected_agent_response }: Correction) =>
  useTranscriptStore.setState(({ lines }) => ({
    lines: lines.map(line =>
      line.key === keyOf('agent', event_id) ? { ...line, final: true, message: corrected_agent_response } : line,
    ),
  }))
