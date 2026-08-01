import { getLocaleValue, type Locale } from "@/content/site";
import type { CareerLane, CareerNode } from "@/content/careerGraph";

function shortHash(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return hash.toString(16).padStart(7, "0").slice(0, 7);
}

const label = (value: { en: string; tr: string }, locale: Locale): string => getLocaleValue(value, locale);

export function CareerLog({ locale, lanes, nodes }: Readonly<{ locale: Locale; lanes: CareerLane[]; nodes: CareerNode[] }>) {
  const laneById: Record<string, CareerLane> = {};
  lanes.forEach((lane) => {
    laneById[lane.id] = lane;
  });
  const laneColor = (id: string) => laneById[id]?.color ?? "var(--accent-text)";
  const ordered = [...nodes].sort((a, b) => b.t - a.t);
  const openLabel = locale === "tr" ? "Projeyi aç" : "Open project";

  return (
    <div style={{ fontFamily: "var(--font-mono)" }}>
      <div style={{ marginBottom: 14, fontSize: 11, color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent-text)" }}>$</span> git log --graph --oneline --all
      </div>
      {ordered.map((node, index) => {
        const color = laneColor(node.lane);
        const last = index === ordered.length - 1;
        const head = node.kind === "head";
        const title = label(node.title, locale);
        return (
          <article key={node.id} style={{ display: "grid", gridTemplateColumns: "16px 1fr", columnGap: 16 }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                aria-hidden="true"
                style={{
                  marginTop: 4,
                  width: 11,
                  height: 11,
                  flex: "none",
                  borderRadius: head ? 2 : 9999,
                  border: "2px solid " + color,
                  boxSizing: "border-box",
                  background: "var(--bg-page)",
                  transform: head ? "rotate(45deg)" : "none",
                  boxShadow: "0 0 8px " + color + "55",
                }}
              />
              {!last ? <span aria-hidden="true" style={{ flex: 1, width: 1, marginTop: 2, background: "var(--border-1)" }} /> : null}
            </div>
            <div style={{ paddingBottom: last ? 0 : 26 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, fontSize: 11 }}>
                <span style={{ color: "var(--accent-text)" }}>{shortHash(node.id)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color }}>
                  <span aria-hidden="true">({head ? "HEAD → " : ""}{node.lane})</span>
                </span>
                <span style={{ color: "var(--text-muted)" }}>{label(node.when, locale)}</span>
              </div>
              <h3 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>
                {title}
              </h3>
              {node.body ? <p style={{ margin: "4px 0 0", maxWidth: "46rem", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>{label(node.body, locale)}</p> : null}
              {node.bullets?.length ? (
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, maxWidth: "46rem", fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}>
                  {node.bullets.map((bullet, bulletIndex) => <li key={label(bullet, locale) + bulletIndex}>{label(bullet, locale)}</li>)}
                </ul>
              ) : null}
              {node.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {node.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {node.href ? (
                <a href={node.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-primary-600 underline underline-offset-4 dark:text-primary-400">
                  {openLabel} ↗
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
