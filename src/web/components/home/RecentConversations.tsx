import type { UserMemory } from '@demo-project/web/stores/memory/memory.store'
import { relativeTime } from '@demo-project/web/utils/relativeTime'

import { MemoryItem } from './MemoryItem'
import { SidebarSection } from './SidebarSection'
import { AnimatePresence } from 'motion/react'

type Props = {
  conversations: UserMemory['conversations']
}

const firstSentence = (summary: string | null) => summary?.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? summary ?? 'Short call'

export const RecentConversations: React.FC<Props> = ({ conversations }) => (
  <SidebarSection title='Recent'>
    <ul className='flex flex-col gap-0.5'>
      <AnimatePresence initial={false}>
        {conversations.map(({ id, startedAt, summary }) => (
          <MemoryItem
            className='flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-muted-foreground'
            key={id}
          >
            <span className='line-clamp-2 min-w-0 flex-1 text-pretty text-foreground/90'>{firstSentence(summary)}</span>
            <span className='shrink-0 text-xs tabular-nums'>{relativeTime(startedAt)}</span>
          </MemoryItem>
        ))}
      </AnimatePresence>
    </ul>
  </SidebarSection>
)
