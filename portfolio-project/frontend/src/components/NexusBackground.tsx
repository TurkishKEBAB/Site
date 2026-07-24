"use client";

import { useEffect, useRef } from "react";

export type NexusBackgroundMode = "nodes" | "grid" | "flow";

export function shouldAnimateNexusBackground({
  reducedMotion,
  saveData,
  hardwareConcurrency,
}: {
  reducedMotion: boolean;
  saveData: boolean;
  hardwareConcurrency?: number;
}): boolean {
  return !reducedMotion && !saveData && (hardwareConcurrency ?? 8) > 4;
}

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  label: string | null;
  lit: number;
}

interface GridPoint {
  bx: number;
  by: number;
}

interface FlowPoint {
  x: number;
  y: number;
}

const MODE_STORAGE_KEY = "nexus:bg-mode";

// Faithful to the design's labeled node-network (nexus-profile.js).
const LABELS = [
  "Java",
  "Spring",
  "FastAPI",
  "Python",
  "Docker",
  "K8s",
  "PostgreSQL",
  "Redis",
  "Kafka",
  "SonarQube",
  "Next.js",
  "TypeScript",
  "ElasticSearch",
  "CI/CD",
  "RabbitMQ",
  "AWS",
];

const NODE_COUNT = 34;
const GRID_GAP = 40;
const FLOW_COUNT = 90;
const FRAME_INTERVAL_MS = 1000 / 30;

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
  const gridRef = useRef<GridPoint[]>([]);
  const flowRef = useRef<FlowPoint[]>([]);
  const modeRef = useRef<NexusBackgroundMode>("nodes");
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const isDarkRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (isNexusMode(saved)) modeRef.current = saved;

    const onModeChange = (event: Event) => {
      const next = (event as CustomEvent<NexusBackgroundMode>).detail;
      if (!isNexusMode(next)) return;
      modeRef.current = next;
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
    };

    window.addEventListener("nexus:bg-mode", onModeChange);
    return () => window.removeEventListener("nexus:bg-mode", onModeChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedRef.current = event.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const animateBackground = shouldAnimateNexusBackground({
      reducedMotion: motionQuery.matches,
      saveData: Boolean(connection?.saveData),
      hardwareConcurrency: navigator.hardwareConcurrency,
    });

    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    updateTheme();
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const buildNodes = () => {
      const nodes: NodePoint[] = [];
      for (let i = 0; i < NODE_COUNT; i += 1) {
        nodes.push({
          x: randomFloat() * width,
          y: randomFloat() * height,
          vx: (randomFloat() - 0.5) * 0.32,
          vy: (randomFloat() - 0.5) * 0.32,
          r: randomFloat() * 1.6 + 0.9,
          label: i < LABELS.length ? LABELS[i] : null,
          lit: 0,
        });
      }
      nodesRef.current = nodes;
    };

    const buildGrid = () => {
      const grid: GridPoint[] = [];
      for (let x = GRID_GAP; x < width; x += GRID_GAP) {
        for (let y = GRID_GAP; y < height; y += GRID_GAP) {
          grid.push({ bx: x, by: y });
        }
      }
      gridRef.current = grid;
    };

    const buildFlow = () => {
      const flow: FlowPoint[] = [];
      for (let i = 0; i < FLOW_COUNT; i += 1) {
        flow.push({ x: randomFloat() * width, y: randomFloat() * height });
      }
      flowRef.current = flow;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
      buildGrid();
      buildFlow();
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const renderNodes = (col: string) => {
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const LINK = 150;
      const MR = 180;
      const CR = 230;

      for (const p of nodes) {
        if (!reducedRef.current) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MR && d > 0) {
            const f = 1 - d / MR;
            p.vx += (-dy / d) * f * 0.45 + (dx / d) * f * 0.12;
            p.vy += (dx / d) * f * 0.45 + (dy / d) * f * 0.12;
          }
          p.vx *= 0.97;
          p.vy *= 0.97;
          const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (sp > 0.8) {
            p.vx = (p.vx / sp) * 0.8;
            p.vy = (p.vy / sp) * 0.8;
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
          const dm = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
          p.lit += ((dm < CR ? 1 - dm / CR : 0) - p.lit) * 0.12;
        }
      }

      for (let a = 0; a < nodes.length; a += 1) {
        for (let b = a + 1; b < nodes.length; b += 1) {
          const ex = nodes[a].x - nodes[b].x;
          const ey = nodes[a].y - nodes[b].y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < LINK) {
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.strokeStyle = `rgba(${col},${(1 - ed / LINK) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
      for (const n of nodes) {
        const md = Math.sqrt((n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2);
        if (md < CR) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `rgba(${col},${(1 - md / CR) * 0.5})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + n.lit * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${0.28 + n.lit * 0.6})`;
        ctx.fill();
        if (n.label) {
          ctx.fillStyle = `rgba(${col},${0.08 + n.lit * 0.8})`;
          ctx.fillText(n.label, n.x + 8, n.y + 3);
        }
      }
    };

    const renderGrid = (col: string) => {
      const grid = gridRef.current;
      const mouse = mouseRef.current;
      const R = 150;
      const MAXO = 26;
      for (const g of grid) {
        const dx = g.bx - mouse.x;
        const dy = g.by - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = reducedRef.current ? 0 : Math.max(0, 1 - d / R);
        const off = force * MAXO;
        const x = g.bx + (dx / d) * off;
        const y = g.by + (dy / d) * off;
        const r = 1 + force * 1.8;
        const alpha = 0.12 + force * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${alpha})`;
        ctx.fill();
      }
    };

    const renderFlow = (col: string) => {
      const flow = flowRef.current;
      const mouse = mouseRef.current;
      timeRef.current += 0.004;
      const t = timeRef.current;
      for (const p of flow) {
        const ang = Math.sin(p.x * 0.008 + t) + Math.cos(p.y * 0.008 - t) + Math.sin((p.x + p.y) * 0.004);
        let vx = Math.cos(ang) * 0.7;
        let vy = Math.sin(ang) * 0.7;
        if (!reducedRef.current) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 170 && d > 0) {
            const f = (1 - d / 170) * 1.3;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
          p.x += vx;
          p.y += vy;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.5)`;
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const col = isDarkRef.current ? "0,212,255" : "0,140,180";
      if (modeRef.current === "grid") renderGrid(col);
      else if (modeRef.current === "flow") renderFlow(col);
      else renderNodes(col);
    };

    let lastFrameAt = 0;
    const render = (timestamp: number) => {
      if (document.hidden) {
        rafRef.current = 0;
        return;
      }

      if (timestamp - lastFrameAt >= FRAME_INTERVAL_MS) {
        draw();
        lastFrameAt = timestamp;
      }
      rafRef.current = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!animateBackground || document.hidden || rafRef.current) return;
      lastFrameAt = 0;
      rafRef.current = requestAnimationFrame(render);
    };

    const stopAnimation = () => {
      if (!rafRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    const onResize = () => {
      resize();
      draw();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
        return;
      }
      draw();
      startAnimation();
    };

    resize();
    draw();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    startAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#f4f4f8] dark:bg-dark-950" />
        <div className="absolute inset-0 bg-glow-radial-light dark:bg-glow-radial" />
        <div className="absolute inset-0 bg-dot-grid-light bg-grid-32 opacity-60 dark:bg-dot-grid-dark" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f4f8] to-transparent dark:from-dark-950" />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <span className="absolute left-5 top-5 h-8 w-8 border-l border-t border-primary-400/45" />
        <span className="absolute right-5 top-5 h-8 w-8 border-r border-t border-primary-400/45" />
        <span className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-primary-400/45" />
        <span className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-primary-400/45" />
      </div>
    </>
  );
}
