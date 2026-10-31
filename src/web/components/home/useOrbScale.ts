import { useEffect } from 'react'

import { useMotionValue, useSpring, useTransform } from 'motion/react'

type Options = {
  active: boolean
  speaking: boolean
  getInputVolume: () => number
  getOutputVolume: () => number
}

const MAX_SWELL = 0.28

// Samples whichever side is talking once per frame into a motion value, so React never re-renders for audio.
export const useOrbScale = ({ active, speaking, getInputVolume, getOutputVolume }: Options) => {
  const level = useMotionValue(0)
  const target = useTransform(level, [0, 1], [1, 1 + MAX_SWELL])
  const scale = useSpring(target, { damping: 32, stiffness: 380 })

  useEffect(() => {
    const sample = speaking ? getOutputVolume : getInputVolume
    const state = { frame: 0 }
    const tick = () => {
      level.set(active ? Math.min(1, sample()) : 0)
      state.frame = requestAnimationFrame(tick)
    }

    state.frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(state.frame)
  }, [active, speaking, getInputVolume, getOutputVolume, level])

  return scale
}
