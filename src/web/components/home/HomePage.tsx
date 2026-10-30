import { BlurRise } from '@demo-project/web/components/text/BlurRise'

export const HomePage: React.FC = () => (
  <main className='grid min-h-svh place-items-center bg-background px-6 py-16 font-sans text-foreground'>
    <div className='flex w-full max-w-md flex-col gap-3 rounded-md border border-hairline bg-card p-6 shadow-rest-lift'>
      <BlurRise
        as='h1'
        by='letter'
        className='font-semibold text-3xl tracking-tight'
        text='Demo Project'
      />
      <BlurRise
        className='text-pretty text-muted-foreground text-sm leading-relaxed'
        delay={0.2}
        text='A starting point for new demos: a Hono API and BullMQ worker on Railway, Claude calls with validated structured output, Postgres and Redis, and this React front end on Cloudflare Pages.'
      />
    </div>
  </main>
)
