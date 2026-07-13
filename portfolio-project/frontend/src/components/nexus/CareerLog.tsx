import type { CareerLane, CareerNode } from "@/content/careerGraph";

/** Short deterministic "commit" hash from a node id, for git-log flavor. */
function shortHash(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(7, "0").slice(0, 7);
}

/**
 * Vertical "code" career view — the same career data as CareerMap, rendered
 * like `git log --graph`: a lane-colored commit gutter, mono commit/ref line,
 * then the story. Newest first.
 */
export function CareerLog({ lanes, nodes }: Readonly<{ lanes: CareerLane[]; nodes: CareerNode[] }>) {
  const laneById: Record<string, CareerLane> = {};
  lanes.forEach((l) => { laneById[l.id] = l; });
  const laneColor = (id: string) => laneById[id]?.color ?? "var(--accent-text)";
  const laneName = (id: string) => laneById[id]?.name ?? id;
  const ordered = [...nodes].sort((a, b) => b.t - a.t);

  return (
    <div style={{ fontFamily: "var(--font-mono)" }}>
      <div style={{ marginBottom: 14, fontSize: 11, color: "var(--text-faint)" }}>
        <span style={{ color: "var(--accent-text)" }}>$</span> git log --graph --oneline --all
      </div>
      {ordered.map((n, i) => {
        const c = laneColor(n.lane);
        const last = i === ordered.length - 1;
        const isHead = n.kind === "head";
        return (
          <div key={n.id} style={{ display: "grid", gridTemplateColumns: "16px 1fr", columnGap: 16 }}>
            {/* commit gutter */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                aria-hidden="true"
                style={{ marginTop: 4, width: 11, height: 11, flex: "none", borderRadius: isHead ? 2 : 9999, border: `2px solid ${c}`, boxSizing: "border-box", background: "var(--bg-page)", transform: isHead ? "rotate(45deg)" : "none", boxShadow: `0 0 8px ${c}55` }}
              />
              {!last ? <span aria-hidden="true" style={{ flex: 1, width: 1, marginTop: 2, background: "var(--border-1)" }} /> : null}
            </div>
            {/* commit body */}
            <div style={{ paddingBottom: last ? 0 : 26 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, fontSize: 11 }}>
                <span style={{ color: "var(--accent-text)" }}>{shortHash(n.id)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c }}>
                  <span aria-hidden="true">({isHead ? "HEAD → " : ""}{laneName(n.lane).split(" ")[0]})</span>
                </span>
                <span style={{ color: "var(--text-faint)" }}>{n.when}</span>
              </div>
              <h4 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)" }}>{n.title}</h4>
              {n.body ? <p style={{ margin: "4px 0 0", maxWidth: "46rem", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>{n.body}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
