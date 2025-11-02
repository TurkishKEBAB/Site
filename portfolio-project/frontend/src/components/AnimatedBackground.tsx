import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas size with device pixel ratio
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Max 2x için sınırla
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform before scaling
      ctx.scale(dpr, dpr)
    }
    setCanvasSize()
    
    // Debounce resize
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(setCanvasSize, 200)
    }
    window.addEventListener('resize', handleResize, { passive: true })

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string

      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.2
        
        // Random purple/blue colors
        const colors = ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x > window.innerWidth) this.x = 0
        if (this.x < 0) this.x = window.innerWidth
        if (this.y > window.innerHeight) this.y = 0
        if (this.y < 0) this.y = window.innerHeight
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    // Create particles (30'a düşürdük)
    const particleCount = 30
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Gradient animation
    let gradientAngle = 0
    let animationFrameId: number

    // Animation loop
    const animate = () => {
      if (!ctx) return

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        window.innerWidth * Math.cos(gradientAngle),
        window.innerHeight * Math.sin(gradientAngle)
      )
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e1b4b')
      gradient.addColorStop(1, '#0f172a')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Update gradient angle
      gradientAngle += 0.001

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      // Draw connections between nearby particles (optimized)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) { // 150'den 120'ye düşürdük
            ctx.globalAlpha = 1 - distance / 120
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]"
    />
  )
}
