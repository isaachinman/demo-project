import { RefreshCw01 } from '@untitledui/icons'

import { AGENT_NAME } from '@demo-project/constants'
import { Button } from '@demo-project/web/components/ui/Button'
import { selectSelectedUser, useCallStore } from '@demo-project/web/stores/call/call.store'
import { loadMemory } from '@demo-project/web/stores/memory/memory.actions'
import { useMemoryStore } from '@demo-project/web/stores/memory/memory.store'

import { KnownFacts } from './KnownFacts'
import { MemorySkeleton } from './MemorySkeleton'
import { OpenThreads } from './OpenThreads'
import { RecentConversations } from './RecentConversations'
import { AnimatePresence, motion } from 'motion/react'

// The sidebar's middle: past calls, what Robin has learned and what it means to follow up on. Read-only.
export const MemoryPanel: React.FC = () => {
  const user = useCallStore(selectSelectedUser)
  const { memory, status, updating, userId } = useMemoryStore()
  const empty = memory !== null && memory.conversations.length === 0

  return (
    <div className='flex flex-col pb-4'>
      <AnimatePresence initial={false}>
        {updating && (
          <motion.p
            animate={{ height: 'auto', opacity: 1 }}
            className='overflow-hidden px-2.5 text-attention text-xs'
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className='block pt-4'>Updating memory…</span>
          </motion.p>
        )}
      </AnimatePresence>

      {status === 'loading' && <MemorySkeleton />}

      {status === 'failed' && (
        <div className='flex flex-col items-start gap-2 px-2.5 pt-6'>
          <p className='text-muted-foreground text-xs'>Couldn’t load what {AGENT_NAME} remembers.</p>
          <Button
            onClick={() => userId && loadMemory(userId)}
            variant='outline'
          >
            <RefreshCw01 />
            Try again
          </Button>
        </div>
      )}

      {status === 'ready' && empty && (
        <p className='text-pretty px-2.5 pt-6 text-muted-foreground text-xs leading-relaxed'>
          {AGENT_NAME} hasn’t met {user?.name ?? 'them'} yet. Start a call and what {AGENT_NAME} learns will show up
          here.
        </p>
      )}

      {status === 'ready' && memory && !empty && (
        <>
          <RecentConversations conversations={memory.conversations} />
          {memory.memories.length > 0 && <KnownFacts memories={memory.memories} />}
          {memory.followUps.length > 0 && <OpenThreads followUps={memory.followUps} />}
        </>
      )}
    </div>
  )
}
