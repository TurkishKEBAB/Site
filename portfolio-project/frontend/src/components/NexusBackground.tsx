"use client";

import { useCallback, useEffect, useRef } from "react";

export type NexusBackgroundMode = "nodes" | "grid" | "flow";

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
}

const MODE_STORAGE_KEY = "nexus:bg-mode";
const NODE_COUNT = 54;
const CONNECTION_DISTANCE = 150;
const TECH_LABELS = ["Java", "FastAPI", "Docker", "Redis", "Next.js", "CI/CD", "ELK"];

const isNexusMode = (value: string | null): value is NexusBackgroundMode =>
  value === "nodes" || value === "grid" || value === "flow";

const randomFloat = () => {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  }

  return Math.random();
};

export default function NexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodePoint[]>([]);
  const modeRef = useRef<NexusBackgroundMode>("nodes");
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const isDarkRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const createNodes = useCallback((width: number, height: number): NodePoint[] => {
    return Array.from({ length: NODE_COUNT }, (_, index) => ({
      x: randomFloat() * width,
      y: randomFloat() * height,
      vx: (randomFloat() - 0.5) * 0.32,
      vy: (randomFloat() - 0.5) * 0.32,
      radius: randomFloat() * 1.8 + 0.9,
      label: index < TECH_LABELS.length ? TECH_LABELS[index] : undefined,
    }));
  }, []);

  useEffect(() => {
    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (isNexusMode(savedMode)) {
      modeRef.current = savedMode;
    }

    const onModeChange = (event: Event) => {
      const nextMode = (event as CustomEvent<NexusBackgroundMode>).detail;
      if (!isNexusMode(nextMode)) return;

      modeRef.current = nextMode;
      window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    };

    window.addEventListener("nexus:bg-mode", onModeChange);
    return () => window.removeEventListener("nexus:bg-mode", onModeChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    updateTheme();

    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodesRef.current = createNodes(rect.width, rect.height);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const drawGrid = (width: number, height: number, accent: string) => {
      const gap = 56;
      const offset = reducedMotionRef.current ? 0 : (frameRef.current * 0.16) % gap;

      context.lineWidth = 0.6;
      context.strokeStyle = `rgba(${accent}, 0.08)`;

      for (let x = -gap + offset; x < width + gap; x += gap) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let y = -gap + offset; y < height + gap; y += gap) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle = `rgba(${accent}, 0.18)`;
      context.strokeRect(width * 0.08, height * 0.18, width * 0.24, height * 0.16);
      context.strokeRect(width * 0.68, height * 0.54, width * 0.2, height * 0.18);
    };

    const drawFlow = (width: number, height: number, accent: string) => {
      const lanes = 8;
      const flow = reducedMotionRef.current ? 0 : frameRef.current * 0.9;

      for (let index = 0; index < lanes; index += 1) {
        const y = (height / lanes) * index + 42;
        const alpha = 0.05 + index * 0.012;

        context.beginPath();
        context.moveTo(-80, y);
        for (let x = -80; x <= width + 80; x += 80) {
          const wave = Math.sin((x + flow + index * 60) * 0.008) * 28;
          context.lineTo(x, y + wave);
        }
        context.strokeStyle = `rgba(${accent}, ${alpha})`;
        context.lineWidth = 1;
        context.stroke();
      }

      for (let index = 0; index < 18; index += 1) {
        const x = ((index * 173 + flow * 1.7) % (width + 160)) - 80;
        const y = ((index * 97) % height) + Math.sin(frameRef.current * 0.02 + index) * 16;
        context.fillStyle = `rgba(${accent}, 0.18)`;
        context.fillRect(x, y, 24, 1);
      }
    };

    const drawNodes = (width: number, height: number, accent: string) => {
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      for (const node of nodes) {
        if (!reducedMotionRef.current) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 170 && distance > 0) {
            const force = (1 - distance / 170) * 0.22;
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }

          node.vx *= 0.985;
          node.vy *= 0.985;
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
          node.y = Math.max(0, Math.min(height, node.y));
        }

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${accent}, 0.38)`;
        context.fill();

        if (node.label) {
          context.font = "10px JetBrains Mono, ui-monospace, monospace";
          context.fillStyle = `rgba(${accent}, 0.46)`;
          context.fillText(node.label, node.x + 8, node.y - 8);
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            context.beginPath();
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.strokeStyle = `rgba(${accent}, ${(1 - distance / CONNECTION_DISTANCE) * 0.14})`;
            context.lineWidth = 0.6;
            context.stroke();
          }
        }
      }
    };

    const render = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;
      const accent = isDarkRef.current ? "0, 212, 255" : "0, 150, 200";

      frameRef.current += 1;
      context.clearRect(0, 0, width, height);

      if (modeRef.current === "grid") {
        drawGrid(width, height, accent);
      } else if (modeRef.current === "flow") {
        drawFlow(width, height, accent);
      } else {
        drawNodes(width, height, accent);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      motionQuery.removeEventListener("change", onMotionChange);
      themeObserver.disconnect();
    };
  }, [createNodes]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[#f4f4f8] dark:bg-dark-950" />
      <div className="absolute inset-0 bg-glow-radial-light dark:bg-glow-radial" />
      <div className="absolute inset-0 bg-dot-grid-light dark:bg-dot-grid-dark bg-grid-32 opacity-60" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f4f4f8] to-transparent dark:from-dark-950" />
    </div>
  );
}
