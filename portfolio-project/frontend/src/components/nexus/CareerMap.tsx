"use client";

import { Fragment, useState, type CSSProperties } from "react";

import type { CareerLane, CareerLink, CareerNode } from "@/content/careerGraph";

const CM_EASE = "cubic-bezier(0.25,0.1,0.25,1)";

/**
 * Git-graph career map. Lanes are branches (main = the degree), nodes are
 * commits along them, links are branch/merge curves. Click a node (or use the
 * ‹ › steppers) to read its story in the detail panel below.
 */
export function CareerMap({
  lanes,
  nodes,
  links,
  initial,
  style,
  className = "",
}: Readonly<{
  lanes: CareerLane[];
  nodes: CareerNode[];
  links?: CareerLink[];
  initial?: string;
  style?: CSSProperties;
  className?: string;
}>) {
  const laneList = lanes || [];
  const nodeList = nodes || [];
  const [sel, setSel] = useState<string | undefined>(initial || (nodeList[0] && nodeList[0].id));
  if (!laneList.length || !nodeList.length) return null;

  const PAD_TOP = 46, LANE_GAP = 62, PAD_BOTTOM = 30;
  const H = PAD_TOP + (laneList.length - 1) * LANE_GAP + PAD_BOTTOM;
  const laneIdx: Record<string, number> = {};
  laneList.forEach((l, i) => { laneIdx[l.id] = i; });
  const laneY = (id: string) => PAD_TOP + (laneIdx[id] || 0) * LANE_GAP;
  const X = (t: number) => 60 + t * 8.9; /* svg coords (viewBox 1000) */
  const xPct = (t: number) => 6 + t * 0.89; /* html overlay % */
  const byId: Record<string, CareerNode> = {};
  nodeList.forEach((n) => { byId[n.id] = n; });
  const selNode = (sel && byId[sel]) || nodeList[0];
  const laneOf = (n: CareerNode) => laneList[laneIdx[n.lane] || 0];
  const ordered = nodeList.slice().sort((a, b) => a.t - b.t);
  const selPos = ordered.indexOf(selNode);
  const step = (d: number) => { const n = ordered[selPos + d]; if (n) setSel(n.id); };

  const spans = laneList.map((l) => {
    const ts = nodeList.filter((n) => n.lane === l.id).map((n) => n.t);
    return { lane: l, min: Math.min(...ts), max: Math.max(...ts) };
  });
  const linkPath = (a: CareerNode, b: CareerNode) => {
    const x1 = X(a.t), y1 = laneY(a.lane), x2 = X(b.t), y2 = laneY(b.lane);
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };
  const linkColor = (a: CareerNode, b: CareerNode) => (laneIdx[b.lane] === 0 ? laneOf(a) : laneOf(b)).color;

  const stepBtn = (enabled: boolean): CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 3,
    border: "1px solid var(--border-1)", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 13,
    color: enabled ? "var(--text-muted)" : "var(--text-faint)", cursor: enabled ? "pointer" : "default", opacity: enabled ? 1 : 0.4,
  });

  return (
    <div className={className} style={style}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ position: "relative", minWidth: 640, height: H }}>
          {/* — rails, branch curves (svg) — */}
          <svg viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: H, display: "block" }}>
            {spans.map(({ lane, min, max }) => (
              <g key={lane.id}>
                <line x1={X(min)} y1={laneY(lane.id)} x2={X(max)} y2={laneY(lane.id)} stroke={lane.color} strokeWidth="1.5" opacity="0.55" vectorEffect="non-scaling-stroke" />
                {lane.ongoing ? (
                  <line x1={X(max)} y1={laneY(lane.id)} x2={X(102)} y2={laneY(lane.id)} stroke={lane.color} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
                ) : null}
              </g>
            ))}
            {(links || []).map((lk) => {
              const a = byId[lk.from], b = byId[lk.to];
              if (!a || !b) return null;
              return <path key={`${lk.from}-${lk.to}`} d={linkPath(a, b)} fill="none" stroke={linkColor(a, b)} strokeWidth="1.5" opacity="0.6" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          {/* — lane names, nodes, date labels (html overlay) — */}
          {laneList.map((l) => (
            <span key={l.id} style={{ position: "absolute", left: "1.2%", top: laneY(l.id) - 27, fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.16em", color: l.color, opacity: 0.9, whiteSpace: "nowrap" }}>
              {l.name}{l.ongoing ? " ·· " : ""}
            </span>
          ))}
          {nodeList.map((n) => {
            const c = laneOf(n).color;
            const on = selNode && selNode.id === n.id;
            return (
              <Fragment key={n.id}>
                <button type="button" onClick={() => setSel(n.id)} title={`${n.when} — ${n.title}`} aria-pressed={on}
                  style={{ position: "absolute", left: `${xPct(n.t)}%`, top: laneY(n.lane), transform: `translate(-50%, -50%)${n.kind === "head" ? " rotate(45deg)" : ""}`, width: 13, height: 13, borderRadius: n.kind === "head" ? 2 : 9999, border: `2px solid ${c}`, boxSizing: "border-box", background: on ? c : "var(--bg-page)", boxShadow: on ? `0 0 12px ${c}` : "none", cursor: "pointer", padding: 0, transition: `all 200ms ${CM_EASE}`, zIndex: 2, outline: n.kind === "start" ? `1px solid ${c}` : "none", outlineOffset: 3 }}
                />
                <span aria-hidden="true" style={{ position: "absolute", left: `${xPct(n.t)}%`, top: laneY(n.lane) + 12, transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: 9, whiteSpace: "nowrap", color: on ? "var(--accent-text)" : "var(--text-faint)", transition: "color 200ms" }}>{n.when}</span>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* — detail panel — */}
      {selNode ? (
        <div className="panel" style={{ marginTop: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: selNode.kind === "head" ? 2 : 9999, background: laneOf(selNode).color, transform: selNode.kind === "head" ? "rotate(45deg)" : "none" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: laneOf(selNode).color }}>{laneOf(selNode).name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>{selNode.when}</span>
            <span style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" aria-label="Previous entry" onClick={() => step(-1)} disabled={selPos <= 0} style={stepBtn(selPos > 0)}>‹</button>
              <button type="button" aria-label="Next entry" onClick={() => step(1)} disabled={selPos >= ordered.length - 1} style={stepBtn(selPos < ordered.length - 1)}>›</button>
            </div>
          </div>
          <h4 style={{ margin: "10px 0 0", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{selNode.title}</h4>
          {selNode.body ? <p style={{ margin: "6px 0 0", maxWidth: "44rem", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>{selNode.body}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
