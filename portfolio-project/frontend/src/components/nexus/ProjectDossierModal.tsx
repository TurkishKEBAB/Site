"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { DossierMetric, ProjectDetail } from "@/content/projectDetails";

import { C4Diagram } from "./C4Diagram";
import { DiagramGallery } from "./DiagramGallery";
import { Icon } from "./Icon";
import { Tag } from "./Tag";

const EASE = "cubic-bezier(0.25,0.1,0.25,1)";

export interface DossierProject {
  slug: string;
  title: string;
  summary: string;
  description: string;
  impact: string;
  technologies: string[];
  featured: boolean;
  details?: ProjectDetail;
}

export interface DossierLabels {
  featured: string;
  project: string;
  dossier: string;
  overview: string;
  architecture: string;
  decisions: string;
  engLog: string;
  gallery: string;
  impact: string;
  techStack: string;
  close: string;
  context: string;
  decision: string;
  tradeoff: string;
  galleryHint: string;
}

const adrChip = (status: string): CSSProperties => {
  const s = String(status || "").toLowerCase();
  const c = s === "accepted"
    ? { b: "rgba(52,211,153,0.4)", bg: "rgba(52,211,153,0.07)", t: "var(--status-green)" }
    : s === "superseded"
      ? { b: "rgba(240,180,0,0.4)", bg: "rgba(240,180,0,0.07)", t: "var(--gold-400)" }
      : { b: "rgba(0,212,255,0.4)", bg: "rgba(0,212,255,0.07)", t: "var(--accent-text)" };
  return { borderRadius: 3, border: `1px solid ${c.b}`, background: c.bg, color: c.t, padding: "2px 8px", fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em" };
};

const dtStyle: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-faint)", paddingTop: 2 };
const ddStyle: CSSProperties = { margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--text-body)" };

function OverviewTab({ project, metrics, labels }: { project: DossierProject; metrics?: DossierMetric[]; labels: DossierLabels }) {
  return (
    <div>
      <p style={{ margin: 0, maxWidth: "48rem", fontSize: 15, lineHeight: 1.7, color: "var(--text-body)" }}>{project.description}</p>
      {metrics && metrics.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, margin: "22px 0" }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ border: "1px solid var(--border-1)", borderRadius: 4, padding: "14px 16px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)" }}>{m.value}</div>
              <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--accent-text)" }}>{m.label}</div>
              {m.note ? <div style={{ marginTop: 3, fontSize: 10.5, color: "var(--text-faint)" }}>{m.note}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ margin: "20px 0", borderRadius: 4, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.05)", padding: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-faint)" }}>{labels.impact}</div>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6, color: "var(--text-body)" }}>{project.impact}</p>
      </div>
      <h4 style={{ margin: "0 0 10px", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>{labels.techStack}</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(project.technologies || []).map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
    </div>
  );
}

/** Gallery figure — real /public image with a dashed empty-state fallback. */
function GalleryFigure({ src, caption, hint }: { src: string; caption: string; hint: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", borderRadius: 4, border: errored ? "1px dashed var(--border-1)" : "1px solid var(--border-1)", background: "rgba(0,212,255,0.02)" }}>
        {!errored ? (
          <img src={src} alt={caption} onError={() => setErrored(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-faint)", padding: 16, textAlign: "center" }}>
            <Icon name="image" size={20} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em" }}>{hint} public{src}</span>
          </div>
        )}
      </div>
      <figcaption style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--text-muted)" }}>{caption}</figcaption>
    </figure>
  );
}

type TabId = "overview" | "arch" | "adr" | "log" | "gallery";

/**
 * Project detail modal. With `project.details` it becomes a full dossier —
 * tabs: overview / architecture (C4 zoom + diagrams) / decisions (ADRs) /
 * eng-log / gallery. Without details it stays the compact 660px dialog.
 */
export function ProjectDossierModal({ project, onClose, labels }: { project: DossierProject | null; onClose: () => void; labels: DossierLabels }) {
  const [tab, setTab] = useState<TabId>("overview");
  const closeRef = useRef<HTMLButtonElement>(null);
  const slug = project ? project.slug || project.title : null;

  useEffect(() => { setTab("overview"); }, [slug]);

  useEffect(() => {
    if (!project) return undefined;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) return null;

  const d = project.details;
  const tabs: Array<[TabId, string]> = [["overview", labels.overview]];
  if (d && ((d.diagrams && d.diagrams.length) || (d.c4 && d.c4.length))) tabs.push(["arch", labels.architecture]);
  if (d && d.adrs && d.adrs.length) tabs.push(["adr", labels.decisions]);
  if (d && d.log && d.log.length) tabs.push(["log", labels.engLog]);
  if (d && d.gallery && d.gallery.length) tabs.push(["gallery", labels.gallery]);
  const compact = tabs.length === 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* backdrop — real button so click/Enter/Space all close accessibly */}
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, border: "none", background: "rgba(6,6,14,0.6)", backdropFilter: "blur(4px)", cursor: "default", animation: "nx-fade-in 200ms ease-out" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: compact ? 660 : 1080, maxHeight: "88vh", height: compact ? "auto" : "min(88vh, 820px)", overflow: "hidden", borderRadius: 8, border: "1px solid var(--border-1)", background: "var(--surface-card-solid)", animation: `nx-slide-up 250ms ${EASE}` }}
      >
        {/* — header — */}
        <div style={{ flex: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: compact ? "32px 36px 0" : "26px 34px 0" }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.24em", color: "var(--text-faint)" }}>
              {project.featured ? labels.featured : labels.project}{compact ? "" : ` · ${labels.dossier}`}
            </span>
            <h3 style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: compact ? 26 : 28, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text-1)" }}>{project.title}</h3>
            {!compact ? <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{project.summary}</p> : null}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} style={{ display: "flex", height: 36, width: 36, flex: "none", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "1px solid var(--border-1)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>

        {/* — tab bar — */}
        {!compact ? (
          <div role="tablist" style={{ flex: "none", display: "flex", gap: 2, margin: "18px 34px 0", borderBottom: "1px solid var(--border-1)", overflowX: "auto" }}>
            {tabs.map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                style={{ border: "none", background: "transparent", padding: "9px 13px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", whiteSpace: "nowrap", color: tab === id ? "var(--accent-text)" : "var(--text-faint)", boxShadow: tab === id ? "inset 0 -2px 0 var(--primary-400)" : "none", transition: "color 200ms" }}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {/* — body — */}
        <div style={{ flex: compact ? "none" : "1 1 auto", overflowY: "auto", padding: compact ? "20px 36px 36px" : "24px 34px 34px" }}>
          {tab === "overview" ? <OverviewTab project={project} metrics={d?.metrics} labels={labels} /> : null}

          {tab === "arch" && d ? (d.diagrams && d.diagrams.length ? <DiagramGallery diagrams={d.diagrams} /> : (d.c4 && d.c4.length ? <C4Diagram levels={d.c4} /> : null)) : null}

          {tab === "adr" && d && d.adrs ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {d.adrs.map((a) => (
                <article key={a.id} style={{ border: "1px solid var(--border-1)", borderRadius: 4, padding: "18px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-text)" }}>{a.id}</span>
                    <h5 style={{ margin: 0, flex: 1, minWidth: 200, fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>{a.title}</h5>
                    <span style={adrChip(a.status)}>{a.status}</span>
                    {a.date ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>{a.date}</span> : null}
                  </div>
                  <dl style={{ margin: "14px 0 0", display: "grid", gridTemplateColumns: "92px 1fr", rowGap: 8, columnGap: 16 }}>
                    <dt style={dtStyle}>{labels.context}</dt><dd style={ddStyle}>{a.context}</dd>
                    <dt style={dtStyle}>{labels.decision}</dt><dd style={ddStyle}>{a.decision}</dd>
                    {a.tradeoff ? <><dt style={dtStyle}>{labels.tradeoff}</dt><dd style={ddStyle}>{a.tradeoff}</dd></> : null}
                  </dl>
                </article>
              ))}
            </div>
          ) : null}

          {tab === "log" && d && d.log ? (
            <div>
              {d.log.map((e) => (
                <div key={e.hash} style={{ display: "grid", gridTemplateColumns: "76px 1fr auto", gap: 14, alignItems: "baseline", padding: "13px 4px", borderBottom: "1px solid var(--border-1)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--accent-text)" }}>{e.hash}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                      {e.tag ? <Tag gold>{e.tag}</Tag> : null}
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>{e.title}</span>
                    </span>
                    {e.note ? <span style={{ display: "block", marginTop: 4, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}>{e.note}</span> : null}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>{e.date}</span>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "gallery" && d && d.gallery ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
              {d.gallery.map((g) => <GalleryFigure key={g.id} src={g.src} caption={g.caption} hint={labels.galleryHint} />)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
