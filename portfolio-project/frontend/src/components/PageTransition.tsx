import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          width: '100%',
          willChange: 'opacity, transform',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
