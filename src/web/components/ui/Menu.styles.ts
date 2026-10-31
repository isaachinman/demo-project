export const menuStyles = {
  item: 'flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-foreground text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0',
  label: 'px-2 py-1.5 font-medium text-muted-foreground text-xs',
  popup:
    'relative flex min-w-48 origin-(--transform-origin) rounded-sm border border-border bg-popover shadow-float outline-none transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0',
}
