import type { DisconnectionDetails, HookOptions } from '@elevenlabs/react'

import { v } from '@demo-project/lib/valibot'
import { loadMemory, refreshAfterCall } from '@demo-project/web/stores/memory/memory.actions'
import { clearTranscript } from '@demo-project/web/stores/transcript/transcript.actions'
import { apiUrl } from '@demo-project/web/utils/apiUrl'

import { type CallError, useCallStore } from './call.store'

const SELECTED_USER_KEY = 'demo-project:user'

const Users = v.array(
  v.object({
    id: v.string(),
    name: v.string(),
  }),
)

const Session = v.object({
  conversationToken: v.string(),
  firstMessage: v.string(),
  prompt: v.string(),
})

type StartSession = (options: HookOptions) => void

const readSavedUserId = () => {
  try {
    return localStorage.getItem(SELECTED_USER_KEY)
  } catch {
    return null
  }
}

const saveUserId = (userId: string) => {
  try {
    localStorage.setItem(SELECTED_USER_KEY, userId)
  } catch {
    // Storage can be unavailable (private mode); the selection still holds for this visit.
  }
}

const fail = (error: CallError) => useCallStore.setState({ error, phase: 'idle' })

export const loadUsers = async () => {
  try {
    const response = await fetch(apiUrl('/api/users'))
    const users = v.parse(Users, await response.json())
    const saved = readSavedUserId()
    const selectedUserId = users.find(user => user.id === saved)?.id ?? users[0]?.id ?? null

    useCallStore.setState({ error: null, selectedUserId, users })

    if (selectedUserId) {
      await loadMemory(selectedUserId)
    }
  } catch {
    fail('users_failed')
  }
}

export const selectUser = async (userId: string) => {
  saveUserId(userId)
  useCallStore.setState({ drawerOpen: false, selectedUserId: userId })
  await loadMemory(userId)
}

export const setDrawerOpen = (drawerOpen: boolean) => useCallStore.setState({ drawerOpen })

// Asking for the microphone ourselves is the only reliable way to tell a denial apart from other failures.
const microphoneAllowed = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    for (const track of stream.getTracks()) {
      track.stop()
    }

    return true
  } catch {
    return false
  }
}

const requestSession = async (userId: string) => {
  try {
    const response = await fetch(apiUrl('/api/sessions'), {
      body: JSON.stringify({ userId }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })

    return response.ok ? v.parse(Session, await response.json()) : null
  } catch {
    return null
  }
}

const connect = async (userId: string, startSession: StartSession) => {
  const allowed = await microphoneAllowed()
  const session = allowed ? await requestSession(userId) : null

  if (session) {
    startSession({
      conversationToken: session.conversationToken,
      overrides: {
        agent: {
          firstMessage: session.firstMessage,
          prompt: { prompt: session.prompt },
        },
      },
      userId,
    })
  } else {
    fail(allowed ? 'session_failed' : 'mic_denied')
  }
}

export const startCall = async (startSession: StartSession) => {
  const { phase, selectedUserId } = useCallStore.getState()

  // Double taps while connecting (or during a call) are ignored.
  if (phase === 'idle' && selectedUserId) {
    useCallStore.setState({ error: null, phase: 'connecting' })
    clearTranscript()
    await connect(selectedUserId, startSession)
  }
}

export const callConnected = () => useCallStore.setState({ phase: 'connected' })

export const callEnded = async (details: DisconnectionDetails) => {
  const { selectedUserId } = useCallStore.getState()

  if (details.reason === 'error') {
    fail('disconnected')
  } else {
    useCallStore.setState({ phase: 'idle' })
  }

  // Even a dropped call reaches the webhook, so memory may still grow.
  if (selectedUserId) {
    await refreshAfterCall(selectedUserId)
  }
}

export const callErrored = () => {
  const { phase } = useCallStore.getState()

  fail(phase === 'connected' ? 'disconnected' : 'session_failed')
}
