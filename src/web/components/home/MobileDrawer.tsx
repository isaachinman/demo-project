import { setDrawerOpen } from '@demo-project/web/stores/call/call.actions'
import { useCallStore } from '@demo-project/web/stores/call/call.store'

import { SidebarBody } from './SidebarBody'
import { AnimatePresence, motion } from 'motion/react'

const SPRING = { bounce: 0, duration: 0.3, type: 'spring' } as const

export const MobileDrawer: React.FC = () => {
  const open = useCallStore(state => state.drawerOpen)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            aria-hidden
            className='fixed inset-0 z-40 bg-black/40 md:hidden'
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
          <motion.div
            animate={{ x: 0 }}
            aria-label='Navigation'
            aria-modal='true'
            className='fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] border-hairline border-e bg-background shadow-float md:hidden'
            exit={{ x: '-104%' }}
            initial={{ x: '-104%' }}
            onKeyDown={event => event.key === 'Escape' && setDrawerOpen(false)}
            role='dialog'
            transition={SPRING}
          >
            <SidebarBody inDrawer />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
