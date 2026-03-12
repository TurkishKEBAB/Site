import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

// Sayfa sıralaması (geçiş mesafesi hesabı için)
const pageOrder: { [key: string]: number } = {
  '/': 0,
  '/about': 1,
  '/projects': 2,
  '/blog': 3,
  '/contact': 4,
  '/login': 5,
  '/admin': 6,
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const prevPathRef = useRef<string>('/')

  const isCurrentKnown = location.pathname in pageOrder
  const isPrevKnown = prevPathRef.current in pageOrder
  const currentIndex = pageOrder[location.pathname] ?? 0
  const prevIndex = pageOrder[prevPathRef.current] ?? 0

  // Only use directional slide when both routes are named in pageOrder
  // Unknown routes (e.g. /blog/some-slug) get a neutral fade
  const direction = (isCurrentKnown && isPrevKnown) ? (currentIndex > prevIndex ? 1 : -1) : 0
  const distance = Math.abs(currentIndex - prevIndex)

  // Mesafeye göre animasyon süresi (yakın sayfalar yavaş, uzak sayfalar hızlı)
  const duration = distance === 1 ? 0.6 : 0.4 // Yan sayfa: 0.6s, uzak sayfalar: 0.4s
  const stiffness = distance === 1 ? 80 : 120 // Yan sayfa: yumuşak, uzak: hızlı

  useEffect(() => {
    prevPathRef.current = location.pathname
  }, [location.pathname])

  const pageVariants = {
    initial: (custom: { direction: number }) => ({
      x: custom.direction !== 0 ? (custom.direction > 0 ? '100%' : '-100%') : 0,
      opacity: 0,
      scale: 0.98,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness,
        damping: 30,
        duration,
        mass: 0.8,
      },
    },
    exit: (custom: { direction: number }) => ({
      x: custom.direction !== 0 ? (custom.direction > 0 ? '-20%' : '20%') : 0,
      opacity: 0,
      scale: 0.97,
      transition: {
        type: 'spring',
        stiffness: stiffness * 1.2,
        damping: 30,
        duration: duration * 0.7,
        mass: 0.8,
      },
    }),
  }

  return (
    <AnimatePresence mode="wait" custom={{ direction }}>
      <motion.div
        key={location.pathname}
        custom={{ direction }}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          width: '100%',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
