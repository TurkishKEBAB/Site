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
  
  // Mevcut ve önceki sayfa index'lerini al
  const currentIndex = pageOrder[location.pathname] ?? 0
  const prevIndex = pageOrder[prevPathRef.current] ?? 0
  
  // Geçiş yönünü ve mesafesini belirle
  const direction = currentIndex > prevIndex ? 1 : -1
  const distance = Math.abs(currentIndex - prevIndex)
  
  // Mesafeye göre animasyon süresi (yakın sayfalar yavaş, uzak sayfalar hızlı)
  const duration = distance === 1 ? 0.6 : 0.4 // Yan sayfa: 0.6s, uzak sayfalar: 0.4s
  const stiffness = distance === 1 ? 80 : 120 // Yan sayfa: yumuşak, uzak: hızlı
  
  useEffect(() => {
    prevPathRef.current = location.pathname
  }, [location.pathname])

  const pageVariants = {
    initial: (custom: { direction: number }) => ({
      x: custom.direction > 0 ? '100%' : '-100%', // Sağa gidiyorsa sağdan gel, sola gidiyorsa soldan gel
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
        damping: 30, // 25'ten 30'a çıkardık (daha yumuşak durma)
        duration,
        mass: 0.8, // Hafif hissettirmek için
      },
    },
    exit: (custom: { direction: number }) => ({
      x: custom.direction > 0 ? '-20%' : '20%', // 30%'dan 20%'ye düşürdük (daha az hareket)
      opacity: 0,
      scale: 0.97,
      transition: {
        type: 'spring',
        stiffness: stiffness * 1.2, // Exit biraz daha hızlı
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
