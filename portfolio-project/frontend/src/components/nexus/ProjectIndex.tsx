import { Icon } from "./Icon";
import type { DossierProject } from "@/lib/dossier";
import { Tag } from "./Tag";

const EASE = "cubic-bezier(0.25,0.1,0.25,1)";

/**
 * Numbered project index rows (nx-row). Hover draws a cyan left bar, washes
 * the row, shifts padding, and rotates the arrow chip −45° (rules in
 * index.css). Click opens the dossier modal.
 */
export function ProjectIndex({
  projects,
  onSelect,
  featuredLabel,
}: Readonly<{
  projects: DossierProject[];
  onSelect: (p: DossierProject) => void;
  featuredLabel: string;
}>) {
  return (
    <div style={{ borderTop: "1px solid var(--border-1)" }}>
      {projects.map((p, i) => (
        <button
          key={p.slug || p.title}
          type="button"
          onClick={() => onSelect(p)}
          className="nx-row nx-index-row"
          style={{ display: "grid", width: "100%", gridTemplateColumns: "64px 1fr auto", alignItems: "center", gap: 24, borderBottom: "1px solid var(--border-1)", borderTop: "none", borderLeft: "none", borderRight: "none", background: "transparent", padding: "24px 8px", textAlign: "left", cursor: "pointer", transition: `all 250ms ${EASE}` }}
        >
          <span className="nx-index-num" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-faint)", transition: "color 200ms" }}>{String(i + 1).padStart(2, "0")}</span>
          <span>
            <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontFamily: "var(--font-display)", fontSize: "clamp(1.15rem, 2.3vw, 1.5rem)", fontWeight: 600, color: "var(--text-1)" }}>
              {p.title}
              {p.featured ? <Tag gold>{featuredLabel}</Tag> : null}
            </span>
            <span style={{ display: "block", marginTop: 6, maxWidth: "46rem", fontSize: 13.5, color: "var(--text-muted)" }}>{p.summary}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ maxWidth: 210, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{(p.technologies || []).slice(0, 4).join(" · ")}</span>
            <span className="nx-index-arrow" style={{ display: "flex", height: 36, width: 36, flex: "none", alignItems: "center", justifyContent: "center", borderRadius: 9999, border: "1px solid var(--border-1)", color: "var(--text-faint)", transition: `all 250ms ${EASE}` }}>
              <Icon name="arrow-right" size={15} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
