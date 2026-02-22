import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      return;
    }

    const ctx = context;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const drawStaticBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#0c4a6e');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    setCanvasSize();

    if (prefersReducedMotion) {
      drawStaticBackground();
      return () => undefined;
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > window.innerWidth) this.x = 0;
        if (this.x < 0) this.x = window.innerWidth;
        if (this.y > window.innerHeight) this.y = 0;
        if (this.y < 0) this.y = window.innerHeight;
      }

      draw() {
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle());

    let gradientAngle = 0;
    let animationFrameId = 0;
    let isPaused = document.hidden;

    const drawFrame = () => {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        window.innerWidth * Math.cos(gradientAngle),
        window.innerHeight * Math.sin(gradientAngle),
      );
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#0c4a6e');
      gradient.addColorStop(1, '#1e293b');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      gradientAngle += 0.001;

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.globalAlpha = 1 - distance / 120;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (isPaused) {
        return;
      }

      drawFrame();
      animationFrameId = requestAnimationFrame(loop);
    };

    const onVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        animationFrameId = requestAnimationFrame(loop);
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
      }, 200);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', onResize, { passive: true });

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900"
    />
  );
}

