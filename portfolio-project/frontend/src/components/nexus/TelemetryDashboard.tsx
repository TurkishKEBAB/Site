"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { FiMaximize2, FiX } from "react-icons/fi";

import type { GitHubDetail, NamedPercent, TelemetryStat } from "@/content/telemetryDetail";
import type { GitHubContributions, WakaTimeStats } from "@/lib/systemProfile";

const EASE = "cubic-bezier(0.25,0.1,0.25,1)";
const MONO = "var(--font-mono)";
const HEAT = [0, 0.22, 0.42, 0.65, 0.92];

const statNum: CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)" };
const statLabel: CSSProperties = { marginTop: 4, fontFamily: MONO, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-faint)" };
const noteStyle: CSSProperties = { marginTop: 2, fontFamily: MONO, fontSize: 10, color: "var(--text-faint)" };

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
      {rows.map((row) => (
        <div key={row.name}>
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: "var(--text-body)" }}>
            <span>{row.name}</span>
            <span style={{ color: "var(--accent-text)" }}>{row.percent}%</span>
          </div>
          <div style={{ height: 6, overflow: "hidden", borderRadius: 9999, background: "var(--border-1)" }}>
            <div style={{ height: "100%", borderRadius: 9999, background: row.color || "var(--primary-400)", width: `${row.percent}%` }} />
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

export function TelemetryModal({ open, label, title, meta, onClose, children }: { open: boolean; label: string; title: string; meta?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
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

export function WakaDetailView({
  stats,
  languages,
  data,
}: {
  stats: Array<{ value: string; unit?: string; label: string }>;
  languages: NamedPercent[];
  data: Pick<WakaTimeStats, "projects" | "editors" | "most_active_day"> | null;
}) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "20px 48px" }}>
        {stats.map((stat, index) => <Stat key={stat.label} value={stat.value} unit={stat.unit} label={stat.label} size={index === 0 ? 44 : 24} />)}
        {data?.most_active_day ? <Stat value={data.most_active_day.text} label="Most active" note={data.most_active_day.date} size={24} /> : null}
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <SectionLabel>Languages · last 7 days</SectionLabel>
          {languages.length ? <Bars rows={languages} /> : <div style={noteStyle}>No live language data.</div>}
        </div>
        <div>
          <SectionLabel>Editors · last 7 days</SectionLabel>
          {data?.editors.length ? <Bars rows={data.editors} /> : <div style={noteStyle}>No live editor data.</div>}
        </div>
      </div>
      <Divider />
      <SectionLabel>Projects · last 7 days</SectionLabel>
      {data?.projects.length ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.projects.map((project, index) => (
            <div key={project.name} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: index === 0 ? "none" : "1px solid var(--border-1)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: "var(--text-1)" }}>{project.name}</div>
                <div style={{ marginTop: 2, fontFamily: MONO, fontSize: 10, color: "var(--text-faint)" }}>{project.percent}%</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent-text)", whiteSpace: "nowrap" }}>{project.text}</div>
            </div>
          ))}
        </div>
      ) : <div style={noteStyle}>No live project data.</div>}
      <Divider />
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--text-faint)" }}>
        <span style={{ color: "var(--accent-text)" }}>&gt;</span> source: WakaTime · window: last 7 days
      </div>
    </div>
  );
}

export function GitHubDetailView({ stats, contributions, languages, detail }: { stats: Array<{ value: string; label: string }>; contributions: GitHubContributions | null; languages: NamedPercent[]; detail: GitHubDetail }) {
  const months = ["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 44px" }}>
        {stats.map((stat) => <Stat key={stat.label} value={stat.value} label={stat.label} size={30} />)}
        {contributions ? <Stat value={String(contributions.total_contributions)} label="Contributions · 1y" size={30} /> : null}
      </div>
      <Divider />
      <SectionLabel>Streak</SectionLabel>
      {contributions ? (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span aria-hidden="true" className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--status-green)", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
            <Stat value={String(contributions.current_streak)} unit=" days" label="Current streak" size={30} />
          </div>
          <Stat value={String(contributions.longest_streak)} unit=" days" label="Longest streak" size={24} />
          <Stat value={contributions.last_contribution || "—"} label="Last contribution" size={24} />
        </div>
      ) : <div style={noteStyle}>No live contribution data.</div>}
      <Divider />
      <SectionLabel>Contribution graph · last 52 weeks</SectionLabel>
      {contributions?.cells.length ? (
        <div aria-hidden="true" style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)", gap: 3 }}>
          {contributions.cells.map((level, index) => (
            <span key={index} style={{ aspectRatio: "1", borderRadius: 2, backgroundColor: level === 0 ? "var(--border-1)" : `rgba(0,212,255,${HEAT[level]})` }} />
          ))}
        </div>
      ) : <div style={noteStyle}>No live contribution graph data.</div>}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: "var(--text-faint)" }}>
        {months.map((month) => <span key={month}>{month}</span>)}
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <SectionLabel>Top languages · repos</SectionLabel>
          {languages.length ? <Bars rows={languages} /> : <div style={noteStyle}>No live language data.</div>}
        </div>
        <div>
          <SectionLabel>Profile details</SectionLabel>
          {detail.profile.map(([key, value]) => (
            <div key={key} style={{ display: "flex", gap: 10, fontFamily: MONO, fontSize: 12, lineHeight: 2 }}>
              <span style={{ color: "var(--accent-text)", minWidth: 92, flexShrink: 0 }}>{key}</span>
              <span style={{ color: "var(--text-body)", minWidth: 0 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
