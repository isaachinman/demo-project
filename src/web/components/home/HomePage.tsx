import { ConversationProvider } from '@elevenlabs/react'
import { Feather, Menu01 } from '@untitledui/icons'

import { AGENT_NAME } from '@demo-project/constants'
import { Button } from '@demo-project/web/components/ui/Button'
import { setDrawerOpen } from '@demo-project/web/stores/call/call.actions'

import { CallStage } from './CallStage'
import { MobileDrawer } from './MobileDrawer'
import { SidebarBody } from './SidebarBody'
import { TranscriptPanel } from './TranscriptPanel'

// Voice-only port of devl's Assistant Start: the sidebar shell, the greeting, the orb and the live transcript. No text input.
export const HomePage: React.FC = () => (
  <ConversationProvider>
    <div className='flex h-svh w-full overflow-hidden bg-background font-sans text-foreground text-sm'>
      <aside className='hidden w-64 shrink-0 border-hairline border-e bg-card/40 md:block'>
        <SidebarBody inDrawer={false} />
      </aside>

      <MobileDrawer />

      <main className='flex min-w-0 flex-1 flex-col'>
        <header className='flex h-14 shrink-0 items-center gap-2 border-hairline border-b px-2 md:hidden'>
          <Button
            aria-label='Open sidebar'
            onClick={() => setDrawerOpen(true)}
            size='icon-sm'
            variant='ghost'
          >
            <Menu01 />
          </Button>
          <span className='flex items-center gap-1.5 font-semibold'>
            <Feather className='size-4' />
            {AGENT_NAME}
          </span>
        </header>

        <div className='flex min-h-0 flex-1 flex-col items-center justify-center-safe gap-8 overflow-y-auto px-4 py-10'>
          <CallStage />
          <TranscriptPanel placement='inline' />
        </div>
      </main>

      <TranscriptPanel placement='aside' />
    </div>
  </ConversationProvider>
)
