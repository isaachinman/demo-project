const ROWS = ['w-4/5', 'w-3/5', 'w-2/3', 'w-1/2']

export const MemorySkeleton: React.FC = () => (
  <div
    aria-hidden
    className='flex flex-col gap-2.5 px-2.5 pt-6'
  >
    <span className='h-3 w-16 animate-pulse rounded-full bg-fill' />
    {ROWS.map(width => (
      <span
        className={`h-3.5 ${width} animate-pulse rounded-full bg-fill`}
        key={width}
      />
    ))}
  </div>
)
