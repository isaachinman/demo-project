import { AGENT_NAME } from '@demo-project/constants'
import type { CallError, CallPhase } from '@demo-project/web/stores/call/call.store'

import { AnimatePresence, motion } from 'motion/react'

type Props = {
  phase: CallPhase
  error: CallError | null
  speaking: boolean
  muted: boolean
}

const ERRORS: Record<CallError, { title: string; detail: string }> = {
  disconnected: {
    detail: 'The connection to the call was lost.',
    title: 'The call dropped',
  },
  mic_denied: {
    detail: 'Allow microphone access for this site in your browser, then try again.',
    title: `${AGENT_NAME} needs your microphone`,
  },
  session_failed: {
    detail: 'The call didn’t connect. Try again in a moment.',
    title: `${AGENT_NAME} couldn’t pick up`,
  },
  users_failed: {
    detail: 'The list of people didn’t load.',
    title: 'Couldn’t load who’s here',
  },
}

const liveLabel = (speaking: boolean, muted: boolean) => {
  const listening = muted ? 'You’re muted' : 'Listening'

  return speaking ? `${AGENT_NAME} is speaking` : listening
}

const labelFor = (phase: CallPhase, speaking: boolean, muted: boolean) => {
  const idle = phase === 'connecting' ? 'Connecting…' : 'Tap to talk'

  return phase === 'connected' ? liveLabel(speaking, muted) : idle
}

export const CallStatus: React.FC<Props> = ({ phase, error, speaking, muted }) => {
  const message = error ? ERRORS[error] : null
  const label = message?.title ?? labelFor(phase, speaking, muted)

  return (
    <div
      aria-live='polite'
      className='flex min-h-12 flex-col items-center gap-1 text-center'
    >
      <AnimatePresence
        initial={false}
        mode='wait'
      >
        <motion.p
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          className={message ? 'font-medium text-failure text-sm' : 'font-medium text-muted-foreground text-sm'}
          exit={{ filter: 'blur(2px)', opacity: 0, y: -4 }}
          initial={{ filter: 'blur(2px)', opacity: 0, y: 4 }}
          key={label}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          {label}
        </motion.p>
      </AnimatePresence>
      {message && <p className='max-w-xs text-pretty text-muted-foreground text-sm'>{message.detail}</p>}
    </div>
  )
}
