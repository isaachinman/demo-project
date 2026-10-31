import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'

import { cn } from '@demo-project/web/utils/cn'

import { type ButtonVariants, buttonVariants } from './Button.styles'

type Props = useRender.ComponentProps<'button'> & ButtonVariants

export const Button: React.FC<Props> = ({ className, variant, size, render, ...props }) =>
  useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(buttonVariants({ className, size, variant })),
        type: render ? undefined : 'button',
      },
      props,
    ),
    render,
  })
