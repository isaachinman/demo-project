import { Feather, XClose } from '@untitledui/icons'

import { AGENT_NAME } from '@demo-project/constants'
import { Button } from '@demo-project/web/components/ui/Button'
import { setDrawerOpen } from '@demo-project/web/stores/call/call.actions'

import { MemoryPanel } from './MemoryPanel'
import { UserSwitcher } from './UserSwitcher'

type Props = {
  inDrawer: boolean
}

// devl's SidebarBody: the brand, what Robin remembers, and the account footer.
export const SidebarBody: React.FC<Props> = ({ inDrawer }) => (
  <div className='flex h-full min-h-0 flex-col'>
    <div className='flex h-14 items-center gap-2 px-3'>
      <span className='flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground'>
        <Feather className='size-4' />
      </span>
      <span className='font-semibold text-foreground'>{AGENT_NAME}</span>
      {inDrawer && (
        <Button
          aria-label='Close sidebar'
          className='ms-auto'
          onClick={() => setDrawerOpen(false)}
          size='icon-sm'
          variant='ghost'
        >
          <XClose />
        </Button>
      )}
    </div>

    <div className='min-h-0 flex-1 overflow-y-auto px-2'>
      <MemoryPanel />
    </div>

    <div className='border-hairline border-t p-2'>
      <UserSwitcher />
    </div>
  </div>
)
