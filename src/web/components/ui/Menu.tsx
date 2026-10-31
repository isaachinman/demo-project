import { Menu as MenuPrimitive } from '@base-ui/react/menu'

import { cn } from '@demo-project/web/utils/cn'

import { menuStyles } from './Menu.styles'

// Ported from coss ui's menu: only the parts the user switcher uses.

export const Menu = MenuPrimitive.Root
export const MenuTrigger = MenuPrimitive.Trigger
export const MenuRadioGroup = MenuPrimitive.RadioGroup

type PopupProps = MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, 'align' | 'side' | 'sideOffset'>

export const MenuPopup: React.FC<PopupProps> = ({
  className,
  children,
  align = 'start',
  side = 'top',
  sideOffset = 6,
  ...props
}) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      align={align}
      className='z-50'
      side={side}
      sideOffset={sideOffset}
    >
      <MenuPrimitive.Popup
        className={cn(menuStyles.popup, className)}
        {...props}
      >
        <div className='max-h-(--available-height) w-full overflow-y-auto p-1'>{children}</div>
      </MenuPrimitive.Popup>
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
)

export const MenuGroupLabel: React.FC<MenuPrimitive.GroupLabel.Props> = ({ className, ...props }) => (
  <MenuPrimitive.GroupLabel
    className={cn(menuStyles.label, className)}
    {...props}
  />
)

export const MenuRadioItem: React.FC<MenuPrimitive.RadioItem.Props> = ({ className, ...props }) => (
  <MenuPrimitive.RadioItem
    className={cn(menuStyles.item, className)}
    {...props}
  />
)

export const MenuRadioItemIndicator = MenuPrimitive.RadioItemIndicator
