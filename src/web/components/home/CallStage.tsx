import { useConversation } from '@elevenlabs/react'
import { Microphone01, MicrophoneOff01, PhoneCall01, PhoneHangUp, RefreshCw01 } from '@untitledui/icons'

import { AGENT_NAME } from '@demo-project/constants'
import { Button } from '@demo-project/web/components/ui/Button'
import { Tooltip } from '@demo-project/web/components/ui/Tooltip'
import { callConnected, callEnded, callErrored, loadUsers, startCall } from '@demo-project/web/stores/call/call.actions'
import { selectSelectedUser, useCallStore } from '@demo-project/web/stores/call/call.store'

import { CallStatus } from './CallStatus'
import { GooOrb } from './GooOrb'
import { Greeting } from './Greeting'
import { useOrbScale } from './useOrbScale'

const ORB_SIZE = 192

export const CallStage: React.FC = () => {
  const conversation = useConversation({
    onConnect: callConnected,
    onDisconnect: callEnded,
    onError: callErrored,
  })
  const user = useCallStore(selectSelectedUser)
  const phase = useCallStore(state => state.phase)
  const error = useCallStore(state => state.error)
  const live = phase === 'connected'
  const speaking = live && conversation.isSpeaking
  const scale = useOrbScale({
    active: live,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
    speaking,
  })

  const begin = () => startCall(conversation.startSession)
  const toggleCall = () => (live ? conversation.endSession() : begin())
  const retry = () => (error === 'users_failed' ? loadUsers() : begin())

  return (
    <div className='flex w-full max-w-md flex-col items-center gap-8'>
      {user && <Greeting name={user.name} />}

      <button
        aria-label={live ? `End the call with ${AGENT_NAME}` : `Talk to ${AGENT_NAME}`}
        className='relative grid cursor-pointer place-items-center rounded-full p-4 outline-none transition-[scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:cursor-default disabled:opacity-50'
        disabled={!user || phase === 'connecting'}
        onClick={toggleCall}
        type='button'
      >
        <GooOrb
          busy={phase === 'connecting'}
          scale={scale}
          size={ORB_SIZE}
        />
      </button>

      <CallStatus
        error={error}
        muted={conversation.isMuted}
        phase={phase}
        speaking={speaking}
      />

      <div className='flex h-9 items-center gap-2'>
        {error && (
          <Button
            onClick={retry}
            variant='outline'
          >
            <RefreshCw01 />
            Try again
          </Button>
        )}
        {!error && live && (
          <>
            <Tooltip
              label={conversation.isMuted ? 'Unmute' : 'Mute'}
              render={
                <Button
                  aria-label={conversation.isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  aria-pressed={conversation.isMuted}
                  onClick={() => conversation.setMuted(!conversation.isMuted)}
                  size='icon'
                  variant='outline'
                />
              }
            >
              {conversation.isMuted ? <MicrophoneOff01 /> : <Microphone01 />}
            </Tooltip>
            <Button
              onClick={conversation.endSession}
              variant='outline'
            >
              <PhoneHangUp />
              End
            </Button>
          </>
        )}
        {!(error || live) && (
          <Button
            disabled={!user || phase === 'connecting'}
            onClick={begin}
          >
            <PhoneCall01 />
            Start talking
          </Button>
        )}
      </div>
    </div>
  )
}
