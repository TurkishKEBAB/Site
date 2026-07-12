"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { FiMaximize2, FiX } from "react-icons/fi";

import type { GitHubDetail, NamedPercent, TelemetryStat, WakaDetail } from "@/content/telemetryDetail";

const EASE = "cubic-bezier(0.25,0.1,0.25,1)";
const MONO = "var(--font-mono)";
const HEAT = [0, 0.22, 0.42, 0.65, 0.92];

const statNum: CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)" };
const statLabel: CSSProperties = { marginTop: 4, fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-faint)" };
const noteStyle: CSSProperties = { marginTop: 2, fontFamily: MONO, fontSize: 10, color: "var(--text-faint)" };

/** Deterministic pseudo-random heat cells (0–4) for the contribution graph. */
function heatCells(count: number, mul: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.sin(i * mul) * 43758.5453;
    return Math.floor(Math.abs(seed - Math.floor(seed)) * 5);
  });
}

function Stat({ value, unit, label, note, size = 30, accentUnit = false }: TelemetryStat & { size?: number; accentUnit?: boolean }) {
  return (
    <div>
      <div style={{ ...statNum, fontSize: size }}>
        <span style={{ color: "var(--accent-text)" }}>{value}</span>
        {unit ? <span style={{ color: accentUnit ? "var(--accent-text)" : "var(--text-1)" }}>{unit}</span> : null}
      </div>
      <div style={statLabel}>{label}</div>
      {note ? <div style={noteStyle}>{note}</div> : null}
    </div>
  );
}

function Bars({ rows }: { rows: NamedPercent[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.name}>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: "var(--text-body)" }}>
            <span>{r.name}</span>
            <span style={{ color: "var(--accent-text)" }}>{r.percent}%</span>
          </div>
          <div style={{ height: 6, overflow: "hidden", borderRadius: 9999, background: "var(--border-1)" }}>
            <div style={{ height: "100%", borderRadius: 9999, background: r.color || "var(--primary-400)", width: `${r.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const Divider = () => <div aria-hidden="true" style={{ height: 1, background: "var(--border-1)", opacity: 0.6, margin: "24px 0" }} />;
const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div style={{ marginBottom: 14, fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-faint)" }}>{children}</div>
);

/** Expand affordance on the compact command-center panels. */
export function ExpandChip({ onClick, label = "expand" }: { onClick: () => void; label?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Expand ${label} details`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 4, border: `1px solid ${hover ? "rgba(0,212,255,0.5)" : "var(--border-1)"}`, background: "transparent", padding: "4px 10px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: hover ? "var(--accent-text)" : "var(--text-faint)", cursor: "pointer", transition: "all 200ms" }}
    >
      <FiMaximize2 size={11} />
      {label}
    </button>
  );
}

/** Overlay modal (shares the dossier's accessible backdrop-button pattern). */
export function TelemetryModal({ open, label, title, meta, onClose, children }: { open: boolean; label: string; title: string; meta?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <button type="button" aria-label="Close" onClick={onClose} style={{ position: "absolute", inset: 0, border: "none", background: "rgba(6,6,14,0.6)", backdropFilter: "blur(4px)", cursor: "default", animation: "nx-fade-in 200ms ease-out" }} />
      <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "relative", zIndex: 1, maxHeight: "88vh", width: "100%", maxWidth: 900, overflowY: "auto", borderRadius: 8, border: "1px solid var(--border-1)", background: "var(--surface-card-solid)", padding: 36, animation: `nx-slide-up 300ms ${EASE}` }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-faint)" }}>{label}</span>
            <h3 style={{ margin: "10px 0 0", fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)" }}>{title}</h3>
            {meta ? <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 11, color: "var(--text-faint)" }}>{meta}</div> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ display: "flex", height: 36, width: 36, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 4, border: "1px solid var(--border-1)", background: "transparent", color: "var(--text-faint)", cursor: "pointer" }}>
            <FiX size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WakaDetailView({ stats, languages, detail }: { stats: Array<{ value: string; unit?: string; label: string }>; languages: NamedPercent[]; detail: WakaDetail }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "20px 48px" }}>
        {stats.map((s, i) => <Stat key={s.label} value={s.value} unit={s.unit} label={s.label} size={i === 0 ? 44 : 24} />)}
        {detail.overview
          .filter((o) => o.label === "Most active")
          .map((o) => <Stat key={o.label} value={o.value} label={o.label} note={o.note} size={24} />)}
      </div>
      <Divider />
      <SectionLabel>AI coding</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 44px" }}>
        {detail.ai.map((s) => <Stat key={s.label} value={s.value} label={s.label} note={s.note} size={24} />)}
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <SectionLabel>Agents · lines</SectionLabel>
          <Bars rows={detail.agents} />
        </div>
        <div>
          <SectionLabel>Editors · time</SectionLabel>
          <Bars rows={detail.editors} />
        </div>
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <SectionLabel>Languages · share</SectionLabel>
          <Bars rows={languages.length ? languages : detail.languages7d} />
        </div>
        <div>
          <SectionLabel>Projects · last 7 days</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {detail.projects.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-1)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, color: "var(--text-1)" }}>{p.name}</div>
                  <div style={{ marginTop: 2, fontFamily: MONO, fontSize: 10, color: "var(--text-faint)" }}>{p.meta}</div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent-text)", whiteSpace: "nowrap" }}>{p.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Divider />
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--text-faint)" }}>
        <span style={{ color: "var(--accent-text)" }}>&gt;</span> os: windows 100% · machine: {detail.machine} · source: wakatime dashboard
      </div>
    </div>
  );
}

export function GitHubDetailView({ stats, cells, detail }: { stats: Array<{ value: string; label: string }>; cells: number[]; detail: GitHubDetail }) {
  const fallback = useMemo(() => heatCells(7 * 52, 311.7), []);
  const graphCells = cells.length ? cells : fallback;
  const months = ["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 44px" }}>
        {stats.map((s) => <Stat key={s.label} value={s.value} label={s.label} size={30} />)}
        <Stat value={detail.contributionsYear} label="Contributions · 1y" size={30} />
      </div>
      <Divider />
      <SectionLabel>Streak</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span aria-hidden="true" className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--status-green)", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
          <Stat value={detail.streak.current} unit=" days" label="Current streak" size={30} />
        </div>
        <Stat value={detail.streak.longest} unit=" days" label="Longest streak" size={24} />
        <Stat value={detail.streak.last} label="Last contribution" size={24} />
      </div>
      <Divider />
      <SectionLabel>Contribution graph · last 52 weeks</SectionLabel>
      <div aria-hidden="true" style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)", gap: 3 }}>
        {graphCells.map((level, i) => (
          <span key={i} style={{ aspectRatio: "1", borderRadius: 2, backgroundColor: level === 0 ? "var(--border-1)" : `rgba(0,212,255,${HEAT[level]})` }} />
        ))}
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: "var(--text-faint)" }}>
        {months.map((m) => <span key={m}>{m}</span>)}
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <SectionLabel>Top languages · repos</SectionLabel>
          <div aria-hidden="true" style={{ display: "flex", height: 8, overflow: "hidden", borderRadius: 9999, background: "var(--border-1)" }}>
            {detail.topLanguages.map((l) => <span key={l.name} style={{ width: `${l.percent}%`, background: l.color }} />)}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {detail.topLanguages.map((l) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, color: "var(--text-body)" }}>
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{l.name}</span>
                <span style={{ color: "var(--accent-text)" }}>{l.percent}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Profile details</SectionLabel>
          {detail.profile.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10, fontFamily: MONO, fontSize: 12, lineHeight: 2 }}>
              <span style={{ color: "var(--accent-text)", minWidth: 92, flexShrink: 0 }}>{k}</span>
              <span style={{ color: "var(--text-body)", minWidth: 0 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
