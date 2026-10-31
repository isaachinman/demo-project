import { cn } from '@demo-project/web/utils/cn'

type Props = React.PropsWithChildren<{
  className?: string
}>

// coss ui's outline badge as a DESIGN.md chip: Raised Charcoal pill, hairline edge, Dimmed Ink label.
export const Badge: React.FC<Props> = ({ className, children }) => (
  <span
    className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-hairline bg-card px-1.5 font-medium text-[11px] text-muted-foreground tabular-nums',
      className,
    )}
  >
    {children}
  </span>
)
