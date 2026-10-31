import { motion } from 'motion/react'

type Props = React.PropsWithChildren<{
  className?: string
}>

// New entries rise and sharpen into place; entries already on screen when the list loads don't animate.
export const MemoryItem: React.FC<Props> = ({ className, children }) => (
  <motion.li
    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
    className={className}
    initial={{ filter: 'blur(4px)', opacity: 0, y: 4 }}
    layout='position'
    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.li>
)
