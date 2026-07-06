import ScrambleHeading from "@/components/nexus/ScrambleHeading";

interface NxSectionHeadProps {
  index: string;
  label: string;
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
}

/**
 * NEXUS section header: a `// idx label` mono rail above a decrypt/scramble
 * display heading, with an optional supporting paragraph.
 */
export default function NxSectionHead({ index, label, title, subtitle, as = "h2" }: NxSectionHeadProps) {
  return (
    <div className="mb-10 md:mb-12">
      <span className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
        <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
        <span className="text-primary-600 dark:text-primary-400">{index}</span>
        <span>{label}</span>
      </span>
      <ScrambleHeading
        as={as}
        text={title}
        className="mt-3.5 font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-[2.5rem]"
      />
      {subtitle && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gray-600 dark:text-dark-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}
