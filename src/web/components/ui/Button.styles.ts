import { cva, type VariantProps } from 'class-variance-authority'

// Ported from coss ui's button: 36px controls (32px on desktop pointers), 10px corners, and the 0.97 press.
export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-sm outline-none transition-[background-color,border-color,color,scale] duration-120 ease-out active:scale-[0.97] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-[13px]',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:border-ink-hover hover:bg-ink-hover',
        ghost: 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
        outline: 'border-input bg-fill text-foreground hover:border-border-strong',
      },
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
