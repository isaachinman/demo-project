import { Badge } from '@demo-project/web/components/ui/Badge'

type Props = React.PropsWithChildren<{
  title: string
  count?: number
}>

export const SidebarSection: React.FC<Props> = ({ title, count, children }) => (
  <section className='flex flex-col'>
    <h2 className='flex items-center justify-between px-2.5 pt-5 pb-1.5 font-medium text-muted-foreground text-xs'>
      {title}
      {count !== undefined && <Badge>{count}</Badge>}
    </h2>
    {children}
  </section>
)
