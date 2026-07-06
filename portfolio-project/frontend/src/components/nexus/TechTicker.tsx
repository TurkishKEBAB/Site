const TICKER_TECH =
  "Java · Spring Boot · FastAPI · Python · C# · Docker · Kubernetes · AWS · PostgreSQL · Redis · ElasticSearch · SonarQube · GitHub Actions · Azure DevOps · RabbitMQ · Celery · Next.js";

/**
 * Infinite tech-stack ticker (design hero motif). Pure CSS marquee — the
 * track is duplicated and translated -50% so it loops seamlessly.
 */
export default function TechTicker() {
  return (
    <div
      // Tech names are proper nouns; pin English casing so `uppercase` does
      // not produce dotted İ (SPRİNG BOOT) when the document lang is "tr".
      lang="en"
      className="relative z-10 overflow-hidden border-y border-gray-200 bg-black/[0.02] py-3.5 dark:border-dark-600 dark:bg-dark-800/30"
      aria-hidden="true"
    >
      <div className="nx-ticker-track">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
          {TICKER_TECH}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
          {TICKER_TECH}
        </span>
      </div>
    </div>
  );
}
