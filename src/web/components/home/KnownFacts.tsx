import { AGENT_NAME } from '@demo-project/constants'
import type { UserMemory } from '@demo-project/web/stores/memory/memory.store'

import { MemoryItem } from './MemoryItem'
import { SidebarSection } from './SidebarSection'
import { AnimatePresence } from 'motion/react'

type Props = {
  memories: UserMemory['memories']
}

const label = (category: string) => `${category.charAt(0).toUpperCase()}${category.slice(1)}`

export const KnownFacts: React.FC<Props> = ({ memories }) => (
  <SidebarSection
    count={memories.length}
    title={`What ${AGENT_NAME} knows`}
  >
    <div className='flex flex-col gap-3 px-2.5'>
      {[...new Set(memories.map(({ category }) => category))].map(category => (
        <div key={category}>
          <h3 className='pb-1 font-medium text-[11px] text-muted-foreground/80'>{label(category)}</h3>
          <ul className='flex flex-col gap-1'>
            <AnimatePresence initial={false}>
              {memories
                .filter(memory => memory.category === category)
                .map(({ id, fact }) => (
                  <MemoryItem
                    className='text-pretty text-foreground/90 leading-snug'
                    key={id}
                  >
                    {fact}
                  </MemoryItem>
                ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </div>
  </SidebarSection>
)
