import type { ReactNode } from "react";

/**
 * Chip used in the dossier (tech stack, eng-log tags, "Featured" pill).
 * `gold` renders the solid amber Featured badge; default is a hairline pill.
 */
export function Tag({ children, gold = false }: { children: ReactNode; gold?: boolean }) {
  if (gold) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 9999,
          background: "var(--gold-400)",
          color: "#06060e",
          padding: "2px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        border: "1px solid var(--border-1)",
        color: "var(--text-muted)",
        padding: "3px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
