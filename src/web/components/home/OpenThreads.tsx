import type { UserMemory } from '@demo-project/web/stores/memory/memory.store'

import { MemoryItem } from './MemoryItem'
import { SidebarSection } from './SidebarSection'
import { AnimatePresence } from 'motion/react'

type Props = {
  followUps: UserMemory['followUps']
}

export const OpenThreads: React.FC<Props> = ({ followUps }) => (
  <SidebarSection title='Open threads'>
    <ul className='flex flex-col gap-1 px-2.5'>
      <AnimatePresence initial={false}>
        {followUps.map(({ id, question }) => (
          <MemoryItem
            className='text-pretty text-muted-foreground leading-snug'
            key={id}
          >
            {question}
          </MemoryItem>
        ))}
      </AnimatePresence>
    </ul>
  </SidebarSection>
)
