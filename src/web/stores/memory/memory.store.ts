import { create } from 'zustand'

export type UserMemory = {
  conversations: { id: string; startedAt: string; summary: string | null }[]
  memories: { id: string; category: string; fact: string }[]
  followUps: { id: string; question: string }[]
  pending: boolean
}

type MemoryState = {
  userId: string | null
  memory: UserMemory | null
  status: 'loading' | 'ready' | 'failed'
  // A call just ended and its extraction hasn't landed yet.
  updating: boolean
}

export const useMemoryStore = create<MemoryState>()(() => ({
  memory: null,
  status: 'loading',
  updating: false,
  userId: null,
}))
