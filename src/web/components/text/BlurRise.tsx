import { type ElementType, Fragment, useRef } from 'react'

import { cn } from '@demo-project/web/utils/cn'

import { type BezierDefinition, motion, type Transition, useInView, useReducedMotion } from 'motion/react'

// Port of devl.dev's Blur Rise: text drifts up and comes into focus a word or letter at a time.

type Props = {
  text: string
  by?: 'word' | 'letter'
  as?: ElementType
  stagger?: number
  maxSpread?: number
  delay?: number
  once?: boolean
  className?: string
}

const EASE_OUT: BezierDefinition = [0.23, 1, 0.32, 1]

const VARIANTS = {
  hidden: {
    filter: 'blur(8px)',
    opacity: 0,
    scale: 0.96,
    y: '0.4em',
  },
  shown: {
    filter: 'blur(0px)',
    opacity: 1,
    scale: 1,
    transitionEnd: { filter: 'none' },
    y: 0,
  },
}

const transitionFor = (at: number, delay: number, reduce: boolean): Transition =>
  reduce
    ? {
        duration: 0,
        opacity: { delay: delay + (at - delay) / 2, duration: 0.3, ease: 'easeOut' },
      }
    : {
        damping: 22,
        delay: at,
        filter: { delay: at, duration: 0.45, ease: EASE_OUT },
        mass: 0.7,
        opacity: { delay: at, duration: 0.3, ease: 'easeOut' },
        stiffness: 170,
        type: 'spring',
      }

export const BlurRise: React.FC<Props> = ({
  text,
  by = 'word',
  as: Tag = 'p',
  stagger,
  maxSpread = 0.6,
  delay = 0,
  once = true,
  className,
}) => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.4, once })
  const reduce = useReducedMotion() ?? false

  const words = text.split(/\s+/).filter(Boolean)
  const pieces = words.map(word => (by === 'letter' ? [...word] : [word]))
  const starts = pieces.map((_, w) => pieces.slice(0, w).flat().length)
  const count = pieces.flat().length
  const wanted = stagger ?? (by === 'letter' ? 0.022 : 0.035)
  const step = count > 1 ? Math.min(wanted, maxSpread / (count - 1)) : 0

  return (
    <Tag
      className={cn('text-balance', className)}
      ref={ref}
    >
      <span className='sr-only'>{text}</span>
      {words.map((word, w) => (
        <Fragment key={`${word}-${w}`}>
          <span
            aria-hidden
            className='inline-block whitespace-nowrap'
          >
            {(pieces[w] ?? []).map((content, c) => (
              <motion.span
                animate={inView ? 'shown' : 'hidden'}
                className='inline-block'
                initial='hidden'
                key={`${w}-${c}`}
                transition={transitionFor(delay + ((starts[w] ?? 0) + c) * step, delay, reduce)}
                variants={VARIANTS}
              >
                {content}
              </motion.span>
            ))}
          </span>
          {w < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
