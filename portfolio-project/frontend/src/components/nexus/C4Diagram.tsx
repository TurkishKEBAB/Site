"use client";

import { Fragment, useState, type CSSProperties } from "react";

import type { C4Level, C4Node, C4NodeKind } from "@/lib/dossier";

import { Icon } from "./Icon";

const EASE = "cubic-bezier(0.25,0.1,0.25,1)";

const C4_KINDS: Record<C4NodeKind, { accent: string; label: string; dashed?: boolean }> = {
  person: { accent: "var(--gold-400)", label: "person" },
  system: { accent: "var(--accent-text)", label: "system" },
  client: { accent: "var(--accent-text)", label: "client" },
  container: { accent: "var(--accent-text)", label: "container" },
  component: { accent: "var(--status-green)", label: "component" },
  store: { accent: "var(--syn-keyword)", label: "data store" },
  queue: { accent: "var(--syn-keyword)", label: "queue" },
  external: { accent: "var(--text-faint)", label: "external", dashed: true },
};
const kindStyle = (k: C4NodeKind) => C4_KINDS[k] || { accent: "var(--accent-text)", label: k || "node" };

function C4NodeCard({ node, drillable, onDrill }: { node: C4Node; drillable: boolean; onDrill: (n: C4Node) => void }) {
  const ks = kindStyle(node.kind);
  const inner = [
    <div key="h" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: ks.accent }}>{ks.label}</span>
      {drillable ? (
        <span aria-hidden="true" style={{ display: "flex", color: "var(--text-faint)", opacity: 0.7 }}>
          <Icon name="maximize-2" size={11} />
        </span>
      ) : null}
    </div>,
    <div key="t" style={{ marginTop: 6, fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{node.title}</div>,
    node.sub ? <div key="s" style={{ marginTop: 4, fontSize: 11, lineHeight: 1.5, color: "var(--text-faint)" }}>{node.sub}</div> : null,
  ];
  const base: CSSProperties = { position: "relative", width: "100%", padding: 13, textAlign: "left", transition: `all 250ms ${EASE}`, fontFamily: "inherit" };
  if (drillable) {
    return (
      <button type="button" onClick={() => onDrill(node)} title={`Zoom into ${node.title}`} className="panel panel-hover" style={{ ...base, cursor: "zoom-in" }}>
        {inner}
      </button>
    );
  }
  return (
    <div className="panel" style={{ ...base, ...(ks.dashed ? { border: "1px dashed var(--border-1)" } : null) }}>
      {inner}
    </div>
  );
}

/**
 * Interactive C4 architecture diagram with semantic zoom.
 * Levels (Context → Containers → Components) are tier-column maps; clicking a
 * node (or +) zooms one level deeper, breadcrumbs / − zoom back out.
 * A single-level input renders a static map.
 */
export function C4Diagram({ levels, style, className = "" }: { levels: C4Level[]; style?: CSSProperties; className?: string }) {
  const [depth, setDepth] = useState(0);
  const [dir, setDir] = useState<"in" | "out">("in");
  const [path, setPath] = useState<Array<string | null>>([]);
  const safe = levels || [];
  const clamped = Math.min(depth, safe.length - 1);
  if (!safe.length) return null;
  const level = safe[clamped];
  const canIn = clamped < safe.length - 1;
  const canOut = clamped > 0;

  const goIn = (node: C4Node | null) => {
    if (!canIn) return;
    setDir("in");
    setPath((p) => {
      const n = p.slice(0, clamped);
      n[clamped] = node ? node.title : null;
      return n;
    });
    setDepth(clamped + 1);
  };
  const goTo = (d: number) => {
    if (d === clamped || d < 0 || d >= safe.length) return;
    setDir(d > clamped ? "in" : "out");
    setPath((p) => p.slice(0, d));
    setDepth(d);
  };

  const focus = path[clamped - 1];
  const kinds: C4NodeKind[] = [];
  level.tiers.forEach((tier) => tier.forEach((n) => { if (kinds.indexOf(n.kind) === -1) kinds.push(n.kind); }));

  const crumb = (i: number): CSSProperties => {
    const active = i === clamped;
    const future = i > clamped;
    return {
      borderRadius: 3, padding: "4px 9px", fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em",
      border: `1px solid ${active ? "rgba(0,212,255,0.4)" : "var(--border-1)"}`,
      background: active ? "rgba(0,212,255,0.08)" : "transparent",
      color: active ? "var(--accent-text)" : "var(--text-muted)",
      cursor: active ? "default" : "pointer", opacity: future ? 0.55 : 1, transition: `all 200ms ${EASE}`,
    };
  };
  const zoomBtn = (enabled: boolean): CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 3,
    border: "1px solid var(--border-1)", background: "transparent", color: enabled ? "var(--text-muted)" : "var(--text-faint)",
    cursor: enabled ? "pointer" : "default", opacity: enabled ? 1 : 0.4,
  });

  return (
    <div className={className} style={style}>
      {/* — zoom bar: breadcrumbs + controls — */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {safe.map((lv, i) => (
          <Fragment key={lv.label || i}>
            {i > 0 ? <span aria-hidden="true" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>›</span> : null}
            <button type="button" onClick={() => goTo(i)} disabled={i === clamped} style={crumb(i)}>C{i + 1} · {lv.label}</button>
          </Fragment>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Zoom out" onClick={() => goTo(clamped - 1)} disabled={!canOut} style={zoomBtn(canOut)}><Icon name="zoom-out" size={13} /></button>
        <button type="button" aria-label="Zoom in" onClick={() => goIn(null)} disabled={!canIn} style={zoomBtn(canIn)}><Icon name="zoom-in" size={13} /></button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
        {level.note ? <span style={{ color: "var(--text-muted)" }}>{level.note}</span> : null}
        {focus ? (
          <span style={{ borderRadius: 3, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.06)", padding: "2px 8px", color: "var(--accent-text)" }}>
            focus: {focus}
          </span>
        ) : null}
        {canIn ? <span style={{ color: "var(--text-faint)" }}>// click a node to zoom in</span> : null}
      </div>

      {/* — canvas — */}
      <div style={{ minHeight: 240 }}>
        <div key={clamped} style={{ animation: `nx-c4-${dir} 320ms ${EASE}`, transformOrigin: "50% 40%" }}>
          <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 8, paddingTop: 2 }}>
            {level.tiers.map((tier, ti) => (
              <div key={ti} style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{ display: "flex", minWidth: 168, maxWidth: 220, flex: "1 0 168px", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                  {tier.map((node) => (
                    <C4NodeCard key={node.title} node={node} drillable={canIn && !node.leaf} onDrill={goIn} />
                  ))}
                </div>
                {ti < level.tiers.length - 1 ? (
                  <div aria-hidden="true" style={{ display: "flex", flex: "none", alignItems: "center", padding: "0 12px", color: "var(--text-faint)" }}>
                    <Icon name="arrow-right" size={20} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* — legend — */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, borderTop: "1px solid var(--border-1)", paddingTop: 10 }}>
        {kinds.map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-faint)" }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: kindStyle(k).accent, opacity: 0.85 }} />
            {kindStyle(k).label}
          </span>
        ))}
      </div>
    </div>
  );
}
