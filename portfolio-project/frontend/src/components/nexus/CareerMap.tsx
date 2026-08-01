"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { getLocaleValue, type Locale } from "@/content/site";
import type { CareerAxisMark, CareerLane, CareerLink, CareerNode } from "@/content/careerGraph";

/* The plot is a pixel canvas inside a horizontal scroller: SVG units equal CSS
   pixels, so lines never stretch and HTML nodes always sit exactly on the
   branch they belong to. It grows to fill the panel and scrolls below that. */
const MIN_CANVAS_W = 1040;
const RAIL_W = 192;
const PLOT_X0 = 220;
/** Canvas space kept to the right of HEAD for its trailing branch line. */
const HEAD_INSET = 70;
const TAIL_INSET = 36;
const PAD_TOP = 52;
const LANE_GAP = 64;
const AXIS_DROP = 34;
const PAD_BOTTOM = 56;
/** Right-edge space kept clear so merge elbows fan out instead of piling up. */
const MERGE_GUTTER = 116;
/** Smallest distance between two commits on the same branch. */
const MIN_NODE_GAP = 30;
const TURN_PAD = 12;
const ELBOW_R = 10;
const CHIP_EDGE = 130;

const label = (value: { en: string; tr: string }, locale: Locale): string => getLocaleValue(value, locale);

/**
 * Rounded-elbow connector, the shape every git graph renderer draws: run along
 * the source branch, turn once, land on the target branch. Bezier curves
 * collapse into near-vertical hooks when two commits are days apart; elbows
 * stay legible at any spacing.
 */
function elbowPath(x1: number, y1: number, turnX: number, x2: number, y2: number): string {
  if (y1 === y2) return `M ${x1} ${y1} H ${x2}`;
  const down = y2 > y1;
  const sy = down ? 1 : -1;
  const turn = Math.min(Math.max(turnX, x1), x2);
  const r = Math.max(0, Math.min(ELBOW_R, turn - x1, x2 - turn, Math.abs(y2 - y1) / 2));
  if (r === 0) return `M ${x1} ${y1} H ${turn} V ${y2} H ${x2}`;
  return [
    `M ${x1} ${y1}`,
    `H ${turn - r}`,
    `A ${r} ${r} 0 0 ${down ? 1 : 0} ${turn} ${y1 + sy * r}`,
    `V ${y2 - sy * r}`,
    `A ${r} ${r} 0 0 ${down ? 0 : 1} ${turn + r} ${y2}`,
    `H ${x2}`,
  ].join(" ");
}

/**
 * Time position per commit, then a two-pass relaxation that guarantees
 * MIN_NODE_GAP between neighbours on a branch. Late 2025 holds six events in a
 * few weeks; without this they land on top of each other.
 */
function solveX(lanes: CareerLane[], nodes: CareerNode[], headX: number): Record<string, number> {
  const time = (t: number) => PLOT_X0 + (t / 100) * (headX - PLOT_X0);
  const placed: Record<string, number> = {};
  for (const lane of lanes) {
    const laneNodes = nodes.filter((node) => node.lane === lane.id).sort((a, b) => a.t - b.t);
    if (!laneNodes.length) continue;
    const ceiling = (node: CareerNode) => (node.kind === "head" ? headX : headX - MERGE_GUTTER);
    const xs = laneNodes.map((node) => Math.min(time(node.t), ceiling(node)));
    for (let i = 1; i < xs.length; i += 1) xs[i] = Math.max(xs[i], xs[i - 1] + MIN_NODE_GAP);
    for (let i = xs.length - 1; i >= 0; i -= 1) {
      const next = i === xs.length - 1 ? Infinity : xs[i + 1] - MIN_NODE_GAP;
      xs[i] = Math.max(PLOT_X0, Math.min(xs[i], ceiling(laneNodes[i]), next));
    }
    laneNodes.forEach((node, i) => {
      placed[node.id] = xs[i];
    });
  }
  return placed;
}

export function CareerMap({
  locale,
  lanes,
  nodes,
  links,
  axis,
  initial,
  style,
  className = "",
}: Readonly<{
  locale: Locale;
  lanes: CareerLane[];
  nodes: CareerNode[];
  links?: CareerLink[];
  axis?: CareerAxisMark[];
  initial?: string;
  style?: CSSProperties;
  className?: string;
}>) {
  const laneList = useMemo(() => lanes || [], [lanes]);
  const nodeList = useMemo(() => nodes || [], [nodes]);
  const headNode = nodeList.find((node) => node.kind === "head");
  const defaultNode = headNode || nodeList[0];

  const [sel, setSel] = useState<string | undefined>(initial || defaultNode?.id);
  const [hover, setHover] = useState<string | undefined>();
  const [canvasW, setCanvasW] = useState(MIN_CANVAS_W);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  /* Fill the panel on wide screens — more room per year is the cheapest way to
     make a dense timeline readable. */
  useEffect(() => {
    const element = scroller.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const measured = Math.round(entries[0]?.contentRect.width ?? 0);
      setCanvasW((current) => (measured > MIN_CANVAS_W ? measured : MIN_CANVAS_W) || current);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const headX = canvasW - HEAD_INSET;
  const tailEnd = canvasW - TAIL_INSET;
  const rawX = (t: number) => PLOT_X0 + (t / 100) * (headX - PLOT_X0);

  const laneIdx = useMemo(() => {
    const map: Record<string, number> = {};
    laneList.forEach((lane, index) => {
      map[lane.id] = index;
    });
    return map;
  }, [laneList]);

  const laneY = (id: string) => PAD_TOP + (laneIdx[id] ?? 0) * LANE_GAP;
  const H = PAD_TOP + Math.max(0, laneList.length - 1) * LANE_GAP + PAD_BOTTOM;
  const axisY = PAD_TOP + Math.max(0, laneList.length - 1) * LANE_GAP + AXIS_DROP;

  const x = useMemo(() => solveX(laneList, nodeList, headX), [laneList, nodeList, headX]);

  const byId = useMemo(() => {
    const map: Record<string, CareerNode> = {};
    nodeList.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  }, [nodeList]);

  /* Left to right is how the graph reads, so that is the stepper's order too. */
  const ordered = useMemo(
    () => nodeList.slice().sort((a, b) => (x[a.id] ?? 0) - (x[b.id] ?? 0) || a.t - b.t || a.id.localeCompare(b.id)),
    [nodeList, x],
  );

  /* A branch that merges into HEAD is already shown as current, so only an
     unmerged branch trails off past the diamond. */
  const merged = useMemo(() => {
    const set = new Set<string>();
    if (!headNode) return set;
    for (const link of links || []) {
      if (link.to === headNode.id && byId[link.from]) set.add(byId[link.from].lane);
    }
    return set;
  }, [links, byId, headNode]);

  const spans = useMemo(
    () =>
      laneList
        .map((lane) => {
          const xs = nodeList.filter((node) => node.lane === lane.id).map((node) => x[node.id] ?? 0);
          return xs.length ? { lane, from: Math.min(...xs), to: Math.max(...xs) } : null;
        })
        .filter((span): span is { lane: CareerLane; from: number; to: number } => span !== null),
    [laneList, nodeList, x],
  );

  /* Merges into the same commit fan out across the gutter, farthest branch
     first, so the lines never overlap on their way in. */
  const drawnLinks = useMemo(() => {
    const cross = (links || []).filter((link) => {
      const from = byId[link.from];
      const to = byId[link.to];
      return from && to && from.lane !== to.lane;
    });
    const targets = new Map<string, CareerLink[]>();
    for (const link of cross) {
      const list = targets.get(link.to) || [];
      list.push(link);
      targets.set(link.to, list);
    }
    const yOf = (laneId: string) => PAD_TOP + (laneIdx[laneId] ?? 0) * LANE_GAP;
    const paths: Array<{ key: string; d: string; color: string }> = [];
    targets.forEach((incoming, targetId) => {
      const to = byId[targetId];
      const targetX = x[targetId] ?? 0;
      const targetY = yOf(to.lane);
      const sorted = incoming
        .slice()
        .sort(
          (a, b) =>
            Math.abs(laneIdx[byId[b.from].lane] - laneIdx[to.lane]) -
              Math.abs(laneIdx[byId[a.from].lane] - laneIdx[to.lane]) ||
            (x[a.from] ?? 0) - (x[b.from] ?? 0),
        );
      const widest = Math.max(...sorted.map((link) => x[link.from] ?? 0));
      const lo = widest + TURN_PAD;
      const hi = targetX - TURN_PAD;
      const fits = hi > lo && hi - lo >= (sorted.length - 1) * TURN_PAD;
      sorted.forEach((link, index) => {
        const from = byId[link.from];
        const fromX = x[link.from] ?? 0;
        const fromY = yOf(from.lane);
        let turn = fromX;
        if (fits) turn = sorted.length === 1 ? hi : lo + ((hi - lo) * index) / (sorted.length - 1);
        else if (hi > fromX) turn = hi;
        paths.push({
          key: `${link.from}-${link.to}`,
          d: elbowPath(fromX, fromY, turn, targetX, targetY),
          color: to.lane === "main" ? laneList[laneIdx[from.lane]].color : laneList[laneIdx[to.lane]].color,
        });
      });
    });
    return paths;
  }, [links, byId, x, laneIdx, laneList]);

  if (!laneList.length || !nodeList.length) return null;

  const selNode = (sel && byId[sel]) || defaultNode || nodeList[0];
  const selLane = laneList[laneIdx[selNode.lane] ?? 0];
  const selPos = ordered.indexOf(selNode);
  const chipNode = (hover && byId[hover]) || undefined;

  const focus = (id: string) => {
    setSel(id);
    buttons.current.get(id)?.focus();
  };
  const step = (direction: number) => {
    const next = ordered[selPos + direction];
    if (next) setSel(next.id);
  };
  const onNodeKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const targets: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: ordered.length - 1 };
    const next = targets[event.key];
    if (next === undefined) return;
    const node = ordered[Math.min(Math.max(next, 0), ordered.length - 1)];
    if (!node) return;
    event.preventDefault();
    focus(node.id);
  };

  const tr = locale === "tr";
  const previousLabel = tr ? "Önceki kayıt" : "Previous entry";
  const nextLabel = tr ? "Sonraki kayıt" : "Next entry";
  const openLabel = tr ? "Projeyi aç" : "Open project";
  const meta = tr
    ? `${laneList.length} dal · ${nodeList.length} commit · HEAD → main`
    : `${laneList.length} branches · ${nodeList.length} commits · HEAD → main`;

  const chipStyle = (node: CareerNode): CSSProperties => {
    const cx = x[node.id] ?? 0;
    const base: CSSProperties = { color: laneList[laneIdx[node.lane]].color, bottom: H - (laneY(node.lane) - 14) };
    if (cx < PLOT_X0 + CHIP_EDGE) return { ...base, left: cx - 15 };
    if (cx > headX - CHIP_EDGE) return { ...base, right: canvasW - cx - 15 };
    return { ...base, left: cx, transform: "translateX(-50%)" };
  };

  return (
    <div className={className} style={style}>
      <div className="cm-surface">
        <div className="border-b px-4 py-2.5" style={{ borderColor: "var(--border-1)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: "var(--text-muted)" }}>
            {meta}
          </span>
        </div>

        <div className="cm-scroll" ref={scroller}>
          <div style={{ position: "relative", width: canvasW, height: H }}>
            <svg
              width={canvasW}
              height={H}
              viewBox={`0 0 ${canvasW} ${H}`}
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, display: "block" }}
            >
              {spans.map(({ lane, from, to }) => (
                <g key={lane.id}>
                  <line x1={from} y1={laneY(lane.id)} x2={to} y2={laneY(lane.id)} stroke={lane.color} strokeWidth="1.5" opacity="0.7" />
                  {lane.ongoing && !merged.has(lane.id) ? (
                    <line
                      x1={to}
                      y1={laneY(lane.id)}
                      x2={tailEnd}
                      y2={laneY(lane.id)}
                      stroke={lane.color}
                      strokeWidth="1.5"
                      opacity="0.35"
                      strokeDasharray="2 6"
                      strokeLinecap="round"
                    />
                  ) : null}
                </g>
              ))}
              {drawnLinks.map((link) => (
                <path key={link.key} d={link.d} fill="none" stroke={link.color} strokeWidth="1.5" opacity="0.62" strokeLinecap="round" />
              ))}
              <line x1={PLOT_X0} y1={axisY} x2={tailEnd} y2={axisY} stroke="var(--border-1)" strokeWidth="1" />
              {(axis || []).map((mark) => (
                <line key={mark.label} x1={rawX(mark.t)} y1={axisY - 4} x2={rawX(mark.t)} y2={axisY} stroke="var(--border-1)" strokeWidth="1" />
              ))}
            </svg>

            {(axis || []).map((mark) => (
              <span key={mark.label} className="cm-axis-label" style={{ left: rawX(mark.t), top: axisY + 8 }}>
                {mark.label}
              </span>
            ))}

            {headNode ? (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: x[headNode.id] ?? headX,
                  top: laneY(headNode.lane) - 30,
                  transform: "translateX(-50%)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  color: laneList[laneIdx[headNode.lane] ?? 0].color,
                }}
              >
                HEAD
              </span>
            ) : null}

            <span
              className="cm-guide"
              aria-hidden="true"
              style={{
                left: x[selNode.id] ?? 0,
                top: laneY(selNode.lane) + 11,
                height: Math.max(0, axisY - laneY(selNode.lane) - 11),
                color: selLane.color,
              }}
            />

            <div className="cm-rail" style={{ width: RAIL_W, height: H }}>
              {laneList.map((lane) => (
                <span key={lane.id} style={{ position: "absolute", left: 16, top: laneY(lane.id) - 16, width: RAIL_W - 28 }}>
                  <span className="cm-branch" style={{ color: lane.color }}>
                    {lane.id}
                    {lane.ongoing ? <span style={{ opacity: 0.5 }}> ··</span> : null}
                  </span>
                  <span className="cm-role">{label(lane.role, locale)}</span>
                </span>
              ))}
            </div>

            {ordered.map((node, index) => {
              const color = laneList[laneIdx[node.lane]].color;
              const selected = selNode.id === node.id;
              const head = node.kind === "head";
              return (
                <button
                  key={node.id}
                  ref={(element) => {
                    if (element) buttons.current.set(node.id, element);
                    else buttons.current.delete(node.id);
                  }}
                  type="button"
                  className="cm-node"
                  style={{ left: x[node.id] ?? 0, top: laneY(node.lane), color }}
                  tabIndex={selected ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={`${label(node.when, locale)} — ${label(node.title, locale)}`}
                  onClick={() => setSel(node.id)}
                  onKeyDown={(event) => onNodeKey(event, index)}
                  onMouseEnter={() => setHover(node.id)}
                  onMouseLeave={() => setHover((current) => (current === node.id ? undefined : current))}
                  onFocus={() => setHover(node.id)}
                  onBlur={() => setHover((current) => (current === node.id ? undefined : current))}
                >
                  <span className="cm-ring" aria-hidden="true" />
                  <span className={head ? "cm-dot cm-dot--head" : "cm-dot"} aria-hidden="true" />
                </button>
              );
            })}

            {chipNode ? (
              <span className="cm-chip" aria-hidden="true" style={chipStyle(chipNode)}>
                <time>{label(chipNode.when, locale)}</time>
                {label(chipNode.title, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14, padding: "20px 24px" }} aria-live="polite">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: selNode.kind === "head" ? 2 : 9999,
              background: selLane.color,
              transform: selNode.kind === "head" ? "rotate(45deg)" : "none",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: selLane.color }}>
            {selLane.id} · {label(selLane.role, locale)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)" }}>
            {label(selNode.when, locale)}
          </span>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="cm-step" aria-label={previousLabel} onClick={() => step(-1)} disabled={selPos <= 0}>
              ‹
            </button>
            <button type="button" className="cm-step" aria-label={nextLabel} onClick={() => step(1)} disabled={selPos >= ordered.length - 1}>
              ›
            </button>
          </div>
        </div>
        <h3 style={{ margin: "10px 0 0", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>
          {label(selNode.title, locale)}
        </h3>
        {selNode.body ? (
          <p style={{ margin: "6px 0 0", maxWidth: "44rem", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>
            {label(selNode.body, locale)}
          </p>
        ) : null}
        {selNode.bullets?.length ? (
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, maxWidth: "48rem", fontSize: 12.5, lineHeight: 1.65, color: "var(--text-muted)" }}>
            {selNode.bullets.map((bullet, index) => <li key={label(bullet, locale) + index}>{label(bullet, locale)}</li>)}
          </ul>
        ) : null}
        {selNode.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selNode.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {selNode.href ? (
          <a href={selNode.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-primary-600 underline underline-offset-4 dark:text-primary-400">
            {openLabel} ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}
