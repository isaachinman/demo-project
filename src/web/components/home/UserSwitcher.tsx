import { Check, ChevronSelectorVertical } from '@untitledui/icons'

import { Avatar } from '@demo-project/web/components/ui/Avatar'
import {
  Menu,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRadioItemIndicator,
  MenuTrigger,
} from '@demo-project/web/components/ui/Menu'
import { selectUser } from '@demo-project/web/stores/call/call.actions'
import { selectSelectedUser, useCallStore } from '@demo-project/web/stores/call/call.store'

const initialsOf = (name: string) => name.slice(0, 2).toUpperCase()

// The sidebar's account footer, turned into a switcher between the seeded demo users.
export const UserSwitcher: React.FC = () => {
  const users = useCallStore(state => state.users)
  const user = useCallStore(selectSelectedUser)
  const inCall = useCallStore(state => state.phase !== 'idle')

  return (
    <Menu>
      <MenuTrigger
        className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg p-2 text-left outline-none transition-colors duration-120 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent data-popup-open:bg-accent'
        disabled={!user || inCall}
      >
        <Avatar initials={user ? initialsOf(user.name) : '··'} />
        <span className='min-w-0 flex-1'>
          <span className='block truncate font-medium text-foreground text-sm'>{user?.name ?? 'Loading…'}</span>
          <span className='block truncate text-muted-foreground text-xs'>{inCall ? 'On a call' : 'Talking as'}</span>
        </span>
        <ChevronSelectorVertical className='size-4 shrink-0 text-muted-foreground' />
      </MenuTrigger>
      <MenuPopup className='w-(--anchor-width)'>
        <MenuGroupLabel>Talk as</MenuGroupLabel>
        <MenuRadioGroup
          onValueChange={value => selectUser(String(value))}
          value={user?.id ?? null}
        >
          {(users ?? []).map(option => (
            <MenuRadioItem
              key={option.id}
              value={option.id}
            >
              <Avatar
                className='size-6 text-[10px]'
                initials={initialsOf(option.name)}
              />
              <span className='flex-1'>{option.name}</span>
              <MenuRadioItemIndicator>
                <Check className='size-4 text-foreground' />
              </MenuRadioItemIndicator>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
