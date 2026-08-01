"use client";

import { Fragment, useState, type CSSProperties } from "react";

import { getLocaleValue, type Locale } from "@/content/site";
import type { CareerLane, CareerLink, CareerNode } from "@/content/careerGraph";

const CM_EASE = "cubic-bezier(0.25,0.1,0.25,1)";

const label = (value: { en: string; tr: string }, locale: Locale): string => getLocaleValue(value, locale);

export function CareerMap({
  locale,
  lanes,
  nodes,
  links,
  initial,
  style,
  className = "",
}: Readonly<{
  locale: Locale;
  lanes: CareerLane[];
  nodes: CareerNode[];
  links?: CareerLink[];
  initial?: string;
  style?: CSSProperties;
  className?: string;
}>) {
  const laneList = lanes || [];
  const nodeList = nodes || [];
  const defaultNode = nodeList.find((node) => node.kind === "head") || nodeList[0];
  const [sel, setSel] = useState<string | undefined>(initial || defaultNode?.id);

  if (!laneList.length || !nodeList.length) return null;

  const PAD_TOP = 46;
  const LANE_GAP = 62;
  const PAD_BOTTOM = 30;
  const H = PAD_TOP + (laneList.length - 1) * LANE_GAP + PAD_BOTTOM;
  const laneIdx: Record<string, number> = {};
  laneList.forEach((lane, index) => {
    laneIdx[lane.id] = index;
  });
  const laneY = (id: string) => PAD_TOP + (laneIdx[id] ?? 0) * LANE_GAP;
  const X = (t: number) => 60 + t * 8.9;
  const xPct = (t: number) => 6 + t * 0.89;
  const byId: Record<string, CareerNode> = {};
  nodeList.forEach((node) => {
    byId[node.id] = node;
  });
  const selNode = (sel && byId[sel]) || defaultNode || nodeList[0];
  const laneOf = (node: CareerNode) => laneList[laneIdx[node.lane] ?? 0];
  const ordered = nodeList.slice().sort((a, b) => a.t - b.t);
  const selPos = ordered.indexOf(selNode);
  const step = (direction: number) => {
    const next = ordered[selPos + direction];
    if (next) setSel(next.id);
  };

  const spans = laneList.map((lane) => {
    const ts = nodeList.filter((node) => node.lane === lane.id).map((node) => node.t);
    return { lane, min: Math.min(...ts), max: Math.max(...ts) };
  });
  const linkPath = (from: CareerNode, to: CareerNode) => {
    const x1 = X(from.t);
    const y1 = laneY(from.lane);
    const x2 = X(to.t);
    const y2 = laneY(to.lane);
    const middle = (x1 + x2) / 2;
    return "M " + x1 + " " + y1 + " C " + middle + " " + y1 + ", " + middle + " " + y2 + ", " + x2 + " " + y2;
  };
  const linkColor = (from: CareerNode, to: CareerNode) =>
    (laneIdx[to.lane] === 0 ? laneOf(from) : laneOf(to)).color;
  const stepBtn = (enabled: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: 3,
    border: "1px solid var(--border-1)",
    background: "transparent",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: enabled ? "var(--text-muted)" : "var(--text-faint)",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.4,
  });
  const selectedLane = laneOf(selNode);
  const previousLabel = locale === "tr" ? "Önceki kayıt" : "Previous entry";
  const nextLabel = locale === "tr" ? "Sonraki kayıt" : "Next entry";
  const openLabel = locale === "tr" ? "Projeyi aç" : "Open project";

  return (
    <div className={className} style={style}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ position: "relative", minWidth: 760, height: H }}>
          <svg
            viewBox={"0 0 1000 " + H}
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: H, display: "block" }}
          >
            {spans.map(({ lane, min, max }) => (
              <g key={lane.id}>
                <line
                  x1={X(min)}
                  y1={laneY(lane.id)}
                  x2={X(max)}
                  y2={laneY(lane.id)}
                  stroke={lane.color}
                  strokeWidth="1.5"
                  opacity="0.55"
                  vectorEffect="non-scaling-stroke"
                />
                {lane.ongoing ? (
                  <line
                    x1={X(max)}
                    y1={laneY(lane.id)}
                    x2={X(102)}
                    y2={laneY(lane.id)}
                    stroke={lane.color}
                    strokeWidth="1.5"
                    opacity="0.4"
                    strokeDasharray="3 5"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </g>
            ))}
            {(links || []).map((link) => {
              const from = byId[link.from];
              const to = byId[link.to];
              if (!from || !to) return null;
              return (
                <path
                  key={link.from + "-" + link.to}
                  d={linkPath(from, to)}
                  fill="none"
                  stroke={linkColor(from, to)}
                  strokeWidth="1.5"
                  opacity="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {laneList.map((lane) => (
            <span
              key={lane.id}
              style={{
                position: "absolute",
                left: "1.2%",
                top: laneY(lane.id) - 27,
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: lane.color,
                opacity: 0.9,
                whiteSpace: "nowrap",
              }}
            >
              {label(lane.name, locale)}{lane.ongoing ? " ··" : ""}
            </span>
          ))}

          {nodeList.map((node) => {
            const color = laneOf(node).color;
            const selected = selNode.id === node.id;
            const head = node.kind === "head";
            const nodeLabel = label(node.when, locale) + " — " + label(node.title, locale);
            return (
              <Fragment key={node.id}>
                <button
                  type="button"
                  onClick={() => setSel(node.id)}
                  title={nodeLabel}
                  aria-label={nodeLabel}
                  aria-pressed={selected}
                  style={{
                    position: "absolute",
                    left: xPct(node.t) + "%",
                    top: laneY(node.lane),
                    transform: "translate(-50%, -50%)" + (head ? " rotate(45deg)" : ""),
                    width: 13,
                    height: 13,
                    borderRadius: head ? 2 : 9999,
                    border: "2px solid " + color,
                    boxSizing: "border-box",
                    background: selected ? color : "var(--bg-page)",
                    boxShadow: selected ? "0 0 12px " + color : "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 200ms " + CM_EASE,
                    zIndex: 2,
                    outline: node.kind === "origin" ? "1px solid " + color : "none",
                    outlineOffset: 3,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: xPct(node.t) + "%",
                    top: laneY(node.lane) + 12,
                    transform: "translateX(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    whiteSpace: "nowrap",
                    color: selected ? "var(--accent-text)" : "var(--text-faint)",
                    transition: "color 200ms",
                  }}
                >
                  {label(node.when, locale)}
                </span>
              </Fragment>
            );
          })}
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
              background: selectedLane.color,
              transform: selNode.kind === "head" ? "rotate(45deg)" : "none",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: selectedLane.color }}>
            {label(selectedLane.name, locale)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
            {label(selNode.when, locale)}
          </span>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" aria-label={previousLabel} onClick={() => step(-1)} disabled={selPos <= 0} style={stepBtn(selPos > 0)}>‹</button>
            <button type="button" aria-label={nextLabel} onClick={() => step(1)} disabled={selPos >= ordered.length - 1} style={stepBtn(selPos < ordered.length - 1)}>›</button>
          </div>
        </div>
        <h4 style={{ margin: "10px 0 0", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>
          {label(selNode.title, locale)}
        </h4>
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
