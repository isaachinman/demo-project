import { create } from 'zustand'

export type TranscriptLine = {
  // One per turn: the role plus ElevenLabs' event id, so partial and final text land on the same line.
  key: string
  role: 'user' | 'agent'
  message: string
  // false while the text is still streaming in.
  final: boolean
}

// The current (or most recent) call, as ElevenLabs transcribes it. Cleared when the next call starts.
type TranscriptState = {
  lines: TranscriptLine[]
}

export const useTranscriptStore = create<TranscriptState>()(() => ({
  lines: [],
}))
