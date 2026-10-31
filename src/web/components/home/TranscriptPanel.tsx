import { AGENT_NAME } from '@demo-project/constants'
import { selectSelectedUser, useCallStore } from '@demo-project/web/stores/call/call.store'
import { useTranscriptStore } from '@demo-project/web/stores/transcript/transcript.store'
import { cn } from '@demo-project/web/utils/cn'

import { MemoryItem } from './MemoryItem'
import { transcriptPanelStyles } from './TranscriptPanel.styles'
import { AnimatePresence } from 'motion/react'

type Props = {
  placement: 'aside' | 'inline'
}

// What was said on the current call, line by line as ElevenLabs transcribes it. Kept after hang-up until the next call.
export const TranscriptPanel: React.FC<Props> = ({ placement }) => {
  const lines = useTranscriptStore(state => state.lines)
  const user = useCallStore(selectSelectedUser)
  const live = useCallStore(state => state.phase === 'connected')
  const hidden = placement === 'inline' && lines.length === 0

  return hidden ? null : (
    <section
      aria-label='Transcript'
      className={cn(placement === 'aside' ? transcriptPanelStyles.aside : transcriptPanelStyles.inline)}
    >
      <h2 className='flex h-14 shrink-0 items-center gap-2 px-3 font-medium text-muted-foreground text-xs'>
        Transcript
        {live && <span className='size-1.5 rounded-full bg-foreground motion-safe:animate-pulse' />}
      </h2>
      <div className={transcriptPanelStyles.scroller}>
        {lines.length === 0 ? (
          <p className='text-pretty text-muted-foreground text-xs leading-relaxed'>
            What you and {AGENT_NAME} say will appear here as you talk.
          </p>
        ) : (
          <ol
            aria-live='polite'
            className='flex flex-col gap-3'
          >
            <AnimatePresence initial={false}>
              {lines.map(({ key, role, message, final }) => (
                <MemoryItem
                  className='flex flex-col gap-0.5'
                  key={key}
                >
                  <span className='font-medium text-[11px] text-muted-foreground'>
                    {role === 'agent' ? AGENT_NAME : (user?.name ?? 'You')}
                  </span>
                  <span
                    className={cn(
                      'text-pretty leading-relaxed',
                      role === 'agent' ? 'text-foreground' : 'text-muted-foreground',
                      !final && 'opacity-70',
                    )}
                  >
                    {message}
                    {!final && (
                      <span
                        aria-hidden
                        className='ms-0.5 inline-block h-3.5 w-1 translate-y-0.5 rounded-full bg-current motion-safe:animate-pulse'
                      />
                    )}
                  </span>
                </MemoryItem>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </section>
  )
}
