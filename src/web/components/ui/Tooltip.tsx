import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'

// Ported from coss ui's tooltip: Raised Charcoal with the Float shadow.

type Props = React.PropsWithChildren<{
  label: string
  render: TooltipPrimitive.Trigger.Props['render']
}>

export const Tooltip: React.FC<Props> = ({ label, render, children }) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger render={render}>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className='z-50'
        sideOffset={6}
      >
        <TooltipPrimitive.Popup className='origin-(--transform-origin) rounded-sm border border-hairline bg-popover px-2 py-1 text-foreground text-xs shadow-float transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0'>
          {label}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
)
