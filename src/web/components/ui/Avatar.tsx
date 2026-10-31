import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'

import { cn } from '@demo-project/web/utils/cn'

type Props = AvatarPrimitive.Root.Props & {
  initials: string
}

// coss ui's avatar, reduced to the initials fallback the demo users need.
export const Avatar: React.FC<Props> = ({ className, initials, ...props }) => (
  <AvatarPrimitive.Root
    className={cn(
      'relative inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-hairline bg-card font-medium text-foreground text-xs',
      className,
    )}
    {...props}
  >
    <AvatarPrimitive.Fallback className='flex size-full items-center justify-center'>
      {initials}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
)
