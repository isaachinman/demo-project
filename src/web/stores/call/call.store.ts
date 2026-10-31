import { create } from 'zustand'

export type DemoUser = {
  id: string
  name: string
}

// The call itself (connected, speaking, muted) lives in the ElevenLabs conversation; this holds what surrounds it.
export type CallPhase = 'idle' | 'connecting' | 'connected'

export type CallError = 'mic_denied' | 'session_failed' | 'disconnected' | 'users_failed'

type CallState = {
  users: DemoUser[] | null
  selectedUserId: string | null
  phase: CallPhase
  error: CallError | null
  drawerOpen: boolean
}

export const useCallStore = create<CallState>()(() => ({
  drawerOpen: false,
  error: null,
  phase: 'idle',
  selectedUserId: null,
  users: null,
}))

export const selectSelectedUser = ({ users, selectedUserId }: CallState) =>
  users?.find(user => user.id === selectedUserId) ?? null
