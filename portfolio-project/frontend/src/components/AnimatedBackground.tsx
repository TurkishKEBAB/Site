import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

const getSecureRandom = (): number => {
  const randomValues = new Uint32Array(1)
  globalThis.crypto.getRandomValues(randomValues)
  return randomValues[0] / 4294967296
}

const createParticle = (): Particle => ({
  x: getSecureRandom() * globalThis.innerWidth,
  y: getSecureRandom() * globalThis.innerHeight,
  size: getSecureRandom() * 3 + 1,
  speedX: (getSecureRandom() - 0.5) * 0.4,
  speedY: (getSecureRandom() - 0.5) * 0.4,
  opacity: getSecureRandom() * 0.4 + 0.2,
})

const updateParticle = (particle: Particle) => {
  particle.x += particle.speedX
  particle.y += particle.speedY

  if (particle.x > globalThis.innerWidth) particle.x = 0
  if (particle.x < 0) particle.x = globalThis.innerWidth
  if (particle.y > globalThis.innerHeight) particle.y = 0
  if (particle.y < 0) particle.y = globalThis.innerHeight
}

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.fillStyle = '#38bdf8'
  ctx.globalAlpha = particle.opacity
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) {
      return
    }

    const ctx = context
    const prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setCanvasSize = () => {
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2)
      canvas.width = globalThis.innerWidth * dpr
      canvas.height = globalThis.innerHeight * dpr
      canvas.style.width = `${globalThis.innerWidth}px`
      canvas.style.height = `${globalThis.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const drawStaticBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, globalThis.innerWidth, globalThis.innerHeight)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#0c4a6e')
      gradient.addColorStop(1, '#1e293b')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, globalThis.innerWidth, globalThis.innerHeight)
    }

    setCanvasSize()

    if (prefersReducedMotion) {
      drawStaticBackground()
      return () => undefined
    }

    const particleCount = globalThis.innerWidth < 768 ? 15 : 30
    const particles: Particle[] = Array.from({ length: particleCount }, createParticle)

    let gradientAngle = 0
    let animationFrameId = 0
    let isPaused = document.hidden

    const drawFrame = () => {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        globalThis.innerWidth * Math.cos(gradientAngle),
        globalThis.innerHeight * Math.sin(gradientAngle),
      )
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#0c4a6e')
      gradient.addColorStop(1, '#1e293b')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, globalThis.innerWidth, globalThis.innerHeight)

      gradientAngle += 0.001

      particles.forEach((particle) => {
        updateParticle(particle)
        drawParticle(ctx, particle)
      })

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)'
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.hypot(dx, dy)

          if (distance < 120) {
            ctx.globalAlpha = 1 - distance / 120
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
    }

    const loop = () => {
      if (isPaused) {
        return
      }

      drawFrame()
      animationFrameId = requestAnimationFrame(loop)
    }

    const onVisibilityChange = () => {
      isPaused = document.hidden
      if (!isPaused) {
        animationFrameId = requestAnimationFrame(loop)
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        setCanvasSize()
      }, 200)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    globalThis.addEventListener('resize', onResize, { passive: true })

    animationFrameId = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      globalThis.removeEventListener('resize', onResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900"
    />
  )
}
