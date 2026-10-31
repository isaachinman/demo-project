import { useId } from 'react'

import { cn } from '@demo-project/web/utils/cn'

import { gooOrbStyles } from './GooOrb.styles'
import { OrbFilter } from './OrbFilter'
import { type MotionValue, motion } from 'motion/react'

type Props = {
  size: number
  busy: boolean
  scale: MotionValue<number>
}

// Port of devl's GooOrb. Blobs drift on loops; the whole orb breathes with the live audio level.
export const GooOrb: React.FC<Props> = ({ size, busy, scale }) => {
  const id = `orb-${useId().replace(/:/g, '')}`
  const k = size / 48
  const loop = (duration: number, x: number[], y: number[]) => ({
    transition: { duration, ease: 'easeInOut' as const, repeat: Number.POSITIVE_INFINITY },
    x: x.map(value => value * k),
    y: y.map(value => value * k),
  })

  return (
    <motion.span
      aria-hidden
      className='relative block shrink-0'
      style={{ height: size, scale, width: size }}
    >
      <OrbFilter
        blur={3.5 * k}
        id={id}
      />
      <span
        className='absolute inset-0'
        style={{ filter: `url(#${id})` }}
      >
        <span className={cn(gooOrbStyles.blob, gooOrbStyles.core)} />
        <motion.span
          animate={loop(busy ? 3 : 7, [0, 5, 3, -1, 0], [0, 2, 6, 3, 0])}
          className={cn(gooOrbStyles.blob, gooOrbStyles.drift)}
        />
        <motion.span
          animate={loop(busy ? 3.4 : 8, [0, -4, -6, -1, 0], [0, -5, -1, 2, 0])}
          className={cn(gooOrbStyles.blob, gooOrbStyles.shade)}
        />
        <motion.span
          animate={busy ? loop(2.2, [0, 13, 0], [0, -13, 0]) : loop(6, [0, 2, 0], [0, -2, 0])}
          className={cn(gooOrbStyles.blob, gooOrbStyles.spark)}
        />
      </span>
    </motion.span>
  )
}
