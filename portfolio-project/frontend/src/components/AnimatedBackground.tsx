/**
 * AnimatedBackground — NEXUS Design System
 *
 * Interactive canvas-based particle network with mouse reactivity.
 * Particles float gently, form connecting lines, and respond to cursor.
 * Falls back to static render when prefers-reduced-motion is enabled.
 */
import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

const PARTICLE_COUNT = 70
const CONNECTION_DIST = 140
const MOUSE_RADIUS = 180
const MOUSE_FORCE = 0.6
const BASE_SPEED = 0.25

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const isDarkRef = useRef(false)
  const reducedMotionRef = useRef(false)

  const createParticles = useCallback((w: number, h: number): Particle[] => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * BASE_SPEED * 2,
      vy: (Math.random() - 0.5) * BASE_SPEED * 2,
      radius: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Detect reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = motionQuery.matches
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    motionQuery.addEventListener('change', onMotionChange)

    // Detect dark mode
    const updateDarkMode = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark')
    }
    updateDarkMode()
    const darkObserver = new MutationObserver(updateDarkMode)
    darkObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = createParticles(rect.width, rect.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    // Animation loop
    const animate = () => {
      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, w, h)

      const dark = isDarkRef.current
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const reduced = reducedMotionRef.current

      // Color palette
      const particleColor = dark ? '0, 212, 255' : '0, 140, 180'
      const lineColor = dark ? '0, 212, 255' : '0, 150, 200'

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!reduced) {
          // Mouse repulsion
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }

          // Damping
          p.vx *= 0.98
          p.vy *= 0.98

          // Clamp speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          const maxSpeed = BASE_SPEED * 4
          if (speed > maxSpeed) {
            p.vx = (p.vx / speed) * maxSpeed
            p.vy = (p.vy / speed) * maxSpeed
          }

          // Move
          p.x += p.vx
          p.y += p.vy

          // Bounce off edges
          if (p.x < 0) { p.x = 0; p.vx *= -1 }
          if (p.x > w) { p.x = w; p.vx *= -1 }
          if (p.y < 0) { p.y = 0; p.vy *= -1 }
          if (p.y > h) { p.y = h; p.vy *= -1 }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Mouse glow halo
      if (mouse.x > -999 && !reduced) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS
        )
        gradient.addColorStop(0, `rgba(${particleColor}, 0.06)`)
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      motionQuery.removeEventListener('change', onMotionChange)
      darkObserver.disconnect()
    }
  }, [createParticles])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    >
      {/* Base background color */}
      <div className="absolute inset-0 bg-[#f4f4f8] dark:bg-dark-950" />

      {/* Top radial glow underglow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.08) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Interactive particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      {/* Bottom fade for footer grounding */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to top, #f4f4f8, transparent)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-40 hidden dark:block"
        style={{
          background: 'linear-gradient(to top, #06060e, transparent)',
        }}
      />
    </div>
  )
}
