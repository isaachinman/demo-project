import { v } from '@demo-project/lib/valibot'
import { toMS } from '@demo-project/utils/data/toMS'
import { apiUrl } from '@demo-project/web/utils/apiUrl'

import { type UserMemory, useMemoryStore } from './memory.store'

const POLL_EVERY = toMS.seconds(3)
const POLL_FOR = toMS.seconds(60)

const UserMemorySchema = v.object({
  conversations: v.array(v.object({ id: v.string(), startedAt: v.string(), summary: v.nullable(v.string()) })),
  followUps: v.array(v.object({ id: v.string(), question: v.string() })),
  memories: v.array(v.object({ category: v.string(), fact: v.string(), id: v.string() })),
  pending: v.boolean(),
})

const fetchMemory = async (userId: string): Promise<UserMemory | null> => {
  try {
    const response = await fetch(apiUrl(`/api/users/${userId}/memory`))

    return response.ok ? v.parse(UserMemorySchema, await response.json()) : null
  } catch {
    return null
  }
}

// Responses for a user who is no longer selected are dropped.
const settle = (userId: string, memory: UserMemory | null) => {
  if (useMemoryStore.getState().userId === userId) {
    useMemoryStore.setState(memory ? { memory, status: 'ready' } : { status: 'failed' })
  }
}

export const loadMemory = async (userId: string) => {
  useMemoryStore.setState({ memory: null, status: 'loading', updating: false, userId })
  settle(userId, await fetchMemory(userId))
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const landed = (memory: UserMemory | null, previousLatestId: string | null) =>
  memory !== null && memory.conversations[0]?.id !== previousLatestId && !memory.pending

// After hang-up the webhook and extraction take a few seconds: poll until the new call is extracted, or give up.
export const refreshAfterCall = async (userId: string) => {
  const previousLatestId = useMemoryStore.getState().memory?.conversations[0]?.id ?? null
  const deadline = Date.now() + POLL_FOR

  useMemoryStore.setState({ updating: true })

  for (let done = false; !done && Date.now() < deadline; ) {
    await wait(POLL_EVERY)
    const memory = await fetchMemory(userId)

    done = landed(memory, previousLatestId) || useMemoryStore.getState().userId !== userId
    settle(userId, memory)
  }

  useMemoryStore.setState({ updating: false })
}
