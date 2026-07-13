"use client";

import { useState, type CSSProperties } from "react";

import type {
  Diagram,
  Entity,
  FlowKind,
  FlowNode as FlowNodeData,
  MatrixData,
  SchemaData,
  SequenceData,
  TiersData,
} from "@/lib/dossier";

import { C4Diagram } from "./C4Diagram";
import { Icon } from "./Icon";

const DG_EASE = "cubic-bezier(0.25,0.1,0.25,1)";
const MONO = "var(--font-mono)";

/* ————— tiers/flow renderer — flowcharts, pipelines, state machines ————— */

const FLOW_KINDS: Record<FlowKind, { pill?: boolean; accent: string; prefix?: string; label?: string; dashed?: boolean }> = {
  start: { pill: true, accent: "var(--status-green)", prefix: "●" },
  end: { pill: true, accent: "var(--accent-text)" },
  state: { pill: true, accent: "var(--accent-text)" },
  final: { pill: true, accent: "var(--status-green)", prefix: "◎" },
  step: { accent: "var(--accent-text)", label: "step" },
  decision: { accent: "var(--gold-400)", label: "decision", dashed: true },
  error: { accent: "var(--syn-err)", label: "error path" },
  store: { accent: "var(--syn-keyword)", label: "data store" },
};

function FlowNode({ node }: { node: FlowNodeData }) {
  const k = FLOW_KINDS[node.kind] || FLOW_KINDS.step;
  const via = node.via ? (
    <span style={{ alignSelf: "flex-start", marginBottom: 5, borderRadius: 3, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.06)", padding: "1px 7px", fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: "var(--accent-text)" }}>↳ {node.via}</span>
  ) : null;
  if (k.pill) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {via}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, border: `1px solid ${k.accent}`, padding: "7px 15px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", color: k.accent, whiteSpace: "nowrap" }}>
          {k.prefix ? <span aria-hidden="true" style={{ fontSize: 9 }}>{k.prefix}</span> : null}
          {node.title}
        </span>
        {node.sub ? <span style={{ marginTop: 5, fontSize: 10.5, color: "var(--text-faint)", textAlign: "center" }}>{node.sub}</span> : null}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {via}
      <div className="panel" style={{ width: "100%", padding: 13, ...(k.dashed ? { border: `1px dashed ${k.accent}` } : null) }}>
        <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: k.accent }}>{k.label}</div>
        <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{node.title}</div>
        {node.sub ? <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.5, color: "var(--text-faint)" }}>{node.sub}</div> : null}
      </div>
    </div>
  );
}

function TiersFlow({ data }: { data: TiersData }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 8, paddingTop: 2 }}>
        {data.tiers.map((tier, ti) => (
          <div key={ti} style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ display: "flex", minWidth: 158, maxWidth: 220, flex: "1 0 158px", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              {tier.map((node) => <FlowNode key={node.title} node={node} />)}
            </div>
            {ti < data.tiers.length - 1 ? (
              <div aria-hidden="true" style={{ display: "flex", flex: "none", alignItems: "center", padding: "0 11px", color: "var(--text-faint)" }}>
                <Icon name="arrow-right" size={18} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {data.notes && data.notes.length ? (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {data.notes.map((n) => <div key={n} style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--text-faint)" }}>// {n}</div>)}
        </div>
      ) : null}
    </div>
  );
}

/* ————— sequence renderer — UML lifelines + messages ————— */

function SequenceDiagram({ data }: { data: SequenceData }) {
  const actors = data.actors || [];
  const n = Math.max(1, actors.length);
  const cx = (name: string) => ((Math.max(0, actors.indexOf(name)) + 0.5) / n) * 100;
  return (
    <div style={{ minWidth: Math.max(540, n * 128) }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 8 }}>
        {actors.map((a) => (
          <div key={a} className="panel" style={{ padding: "8px 6px", textAlign: "center", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.05em", color: "var(--accent-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a}</div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {actors.map((a, i) => (
          <span key={a} aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${((i + 0.5) / n) * 100}%`, borderLeft: "1px dashed var(--border-1)", opacity: 0.7 }} />
        ))}
        <div style={{ position: "relative", padding: "8px 0 4px" }}>
          {(data.messages || []).map((m, mi) => {
            const isReturn = m.kind === "return";
            if (m.from === m.to) {
              const x1 = cx(m.from);
              return (
                <div key={mi} style={{ position: "relative", height: 38 }}>
                  <span aria-hidden="true" style={{ position: "absolute", left: `${x1}%`, top: 9, width: 30, height: 18, border: "1px dashed rgba(0,212,255,0.45)", borderLeft: "none", borderRadius: "0 4px 4px 0" }} />
                  <span style={{ position: "absolute", left: `calc(${x1}% + 40px)`, top: 11, fontFamily: MONO, fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{m.label}</span>
                </div>
              );
            }
            const x1 = cx(m.from), x2 = cx(m.to);
            const left = Math.min(x1, x2), width = Math.abs(x2 - x1);
            const dirRight = x2 >= x1;
            const head: CSSProperties = { position: "absolute", top: -5, color: isReturn ? "var(--text-faint)" : "var(--accent-text)", fontSize: 9, lineHeight: "1" };
            if (dirRight) head.right = -2; else head.left = -2;
            return (
              <div key={mi} style={{ position: "relative", height: 42 }}>
                <span style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 24, borderTop: `1px ${isReturn ? "dashed" : "solid"} ${isReturn ? "var(--border-1)" : "rgba(0,212,255,0.55)"}` }}>
                  <span aria-hidden="true" style={head}>{dirRight ? "▶" : "◀"}</span>
                </span>
                <span style={{ position: "absolute", left: `${left + width / 2}%`, transform: "translateX(-50%)", top: 4, maxWidth: "94%", fontFamily: MONO, fontSize: 10, color: isReturn ? "var(--text-faint)" : "var(--text-muted)", whiteSpace: "nowrap", background: "var(--surface-card-solid)", padding: "0 6px", borderRadius: 2 }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ————— schema renderer — class diagrams, ERDs ————— */

const ENTITY_KIND_COLOR: Record<string, string> = { table: "var(--syn-keyword)", class: "var(--accent-text)", abstract: "var(--gold-400)", interface: "var(--gold-400)", enum: "var(--status-green)" };

function EntityCard({ e }: { e: Entity }) {
  const accent = (e.kind && ENTITY_KIND_COLOR[e.kind]) || "var(--accent-text)";
  return (
    <div className="panel" style={{ width: "100%", padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderBottom: "1px solid var(--border-1)", background: "rgba(0,212,255,0.03)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>{e.name}</span>
        {e.kind ? <span style={{ fontFamily: MONO, fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: accent }}>{e.kind}</span> : null}
      </div>
      <div style={{ padding: "6px 12px 9px" }}>
        {(e.rows || []).map((r) => (
          <div key={r} style={{ padding: "3.5px 0", borderBottom: "1px solid rgba(30,30,62,0.35)", fontFamily: MONO, fontSize: 10.5, color: "var(--text-muted)" }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function SchemaDiagram({ data }: { data: SchemaData }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 8, paddingTop: 2 }}>
        {data.tiers.map((tier, ti) => (
          <div key={ti} style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ display: "flex", minWidth: 190, maxWidth: 250, flex: "1 0 190px", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              {tier.map((e) => <EntityCard key={e.name} e={e} />)}
            </div>
            {ti < data.tiers.length - 1 ? (
              <div aria-hidden="true" style={{ display: "flex", flex: "none", alignItems: "center", padding: "0 12px", color: "var(--text-faint)" }}>
                <Icon name="minus" size={18} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {data.relations && data.relations.length ? (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: "6px 22px" }}>
          {data.relations.map((r, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--text-faint)" }}>
              <span style={{ color: "var(--accent-text)" }}>{r.from}</span>
              <span> —{r.label}→ </span>
              <span style={{ color: "var(--accent-text)" }}>{r.to}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ————— matrix renderer — authorization / risk grids ————— */

function MatrixDiagram({ data }: { data: MatrixData }) {
  const cellColor = (c: string) => (c === "✓" ? "var(--status-green)" : c === "—" || c === "✕" ? "var(--text-faint)" : "var(--text-muted)");
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: 420 }}>
        <thead>
          <tr>
            <th aria-label="Capability" style={{ borderBottom: "1px solid var(--border-1)" }} />
            {data.cols.map((c) => (
              <th key={c} style={{ padding: "9px 18px", borderBottom: "1px solid var(--border-1)", fontFamily: MONO, fontSize: 9.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--accent-text)", textAlign: "center" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.label}>
              <td style={{ padding: "9px 18px 9px 0", borderBottom: "1px solid var(--border-1)", fontSize: 12.5, color: "var(--text-body)" }}>{r.label}</td>
              {r.cells.map((c, i) => (
                <td key={i} style={{ padding: "9px 18px", borderBottom: "1px solid var(--border-1)", textAlign: "center", fontFamily: MONO, fontSize: 12, color: cellColor(c) }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ————— gallery shell ————— */

const KIND_ICON: Record<string, string> = { c4: "layers", tiers: "git-branch", sequence: "activity", schema: "database", matrix: "grid" };

/**
 * Diagram gallery — mono chip picker over five data-driven renderers:
 * c4 (semantic zoom), tiers (flowcharts / pipelines / state machines),
 * sequence (UML lifelines), schema (class / ERD cards), matrix (authz/risk).
 */
export function DiagramGallery({ diagrams, style, className = "" }: { diagrams: Diagram[]; style?: CSSProperties; className?: string }) {
  const [active, setActive] = useState(0);
  const list = diagrams || [];
  if (!list.length) return null;
  const idx = Math.min(active, list.length - 1);
  const dg = list[idx];
  const chip = (on: boolean): CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 3, padding: "5px 10px",
    fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", cursor: on ? "default" : "pointer", whiteSpace: "nowrap",
    border: `1px solid ${on ? "rgba(0,212,255,0.4)" : "var(--border-1)"}`,
    background: on ? "rgba(0,212,255,0.08)" : "transparent",
    color: on ? "var(--accent-text)" : "var(--text-muted)", transition: `all 200ms ${DG_EASE}`,
  });
  return (
    <div className={className} style={style}>
      <div role="tablist" aria-label="Diagrams" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {list.map((d2, i) => (
          <button key={d2.id || i} type="button" role="tab" aria-selected={i === idx} onClick={() => setActive(i)} style={chip(i === idx)}>
            <Icon name={KIND_ICON[d2.kind] || "box"} size={11} />
            {d2.title}
          </button>
        ))}
      </div>
      {dg.note ? <div style={{ margin: "10px 0 0", fontFamily: MONO, fontSize: 10.5, color: "var(--text-muted)" }}>// {dg.note}</div> : null}
      <div key={dg.id || idx} style={{ marginTop: 14, animation: `nx-c4-in 320ms ${DG_EASE}`, transformOrigin: "50% 30%" }}>
        {dg.kind === "c4" ? <C4Diagram levels={dg.data} />
          : dg.kind === "sequence" ? <div style={{ overflowX: "auto" }}><SequenceDiagram data={dg.data} /></div>
          : dg.kind === "schema" ? <SchemaDiagram data={dg.data} />
          : dg.kind === "matrix" ? <MatrixDiagram data={dg.data} />
          : <TiersFlow data={dg.data} />}
      </div>
    </div>
  );
}
