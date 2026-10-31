import type { MessagePayload } from '@elevenlabs/react'

import { useTranscriptStore } from './transcript.store'

type Correction = {
  original_agent_response: string
  corrected_agent_response: string
}

export const clearTranscript = () => useTranscriptStore.setState({ lines: [] })

export const addTranscriptLine = ({ event_id, role, message }: MessagePayload) =>
  useTranscriptStore.setState(({ lines }) => ({ lines: [...lines, { id: event_id, message, role }] }))

// When the user interrupts, ElevenLabs trims the agent's reply to what was actually spoken.
export const correctTranscriptLine = ({ original_agent_response, corrected_agent_response }: Correction) =>
  useTranscriptStore.setState(({ lines }) => {
    const index = lines.findLastIndex(line => line.role === 'agent' && line.message === original_agent_response)

    return {
      lines: lines.map((line, i) => (i === index ? { ...line, message: corrected_agent_response } : line)),
    }
  })
