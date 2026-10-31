import { create } from 'zustand'

export type TranscriptLine = {
  id: number
  role: 'user' | 'agent'
  message: string
}

// The current (or most recent) call, as ElevenLabs transcribes it. Cleared when the next call starts.
type TranscriptState = {
  lines: TranscriptLine[]
}

export const useTranscriptStore = create<TranscriptState>()(() => ({
  lines: [],
}))
