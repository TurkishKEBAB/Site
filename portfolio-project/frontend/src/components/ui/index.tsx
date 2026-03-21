import type { ReactNode } from "react";

export function CornerFrame({
  children,
  className = "",
  size = 20,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
  accent?: boolean;
}) {
  const color = accent
    ? "border-primary-400/50 dark:border-primary-400/40"
    : "border-gray-300 dark:border-dark-600";

  return (
    <div className={`relative ${className}`}>
      <span
        className={`absolute top-0 left-0 border-t border-l ${color} pointer-events-none`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span
        className={`absolute top-0 right-0 border-t border-r ${color} pointer-events-none`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span
        className={`absolute bottom-0 left-0 border-b border-l ${color} pointer-events-none`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span
        className={`absolute bottom-0 right-0 border-b border-r ${color} pointer-events-none`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export function SectionHeading({
  index,
  label,
  title,
  subtitle,
  align = "left",
  className = "",
}: {
  index?: string;
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-10 md:mb-14 ${alignClass} ${className}`}>
      <div
        className={`sys-label mb-3 ${align === "center" ? "justify-center" : ""} flex items-center gap-2`}
      >
        {index && <span className="text-primary-500 dark:text-primary-400">{index}</span>}
        <span>{label}</span>
      </div>
      <h2 className="section-title">{title}</h2>
      {subtitle && (
        <p
          className="mt-3 text-gray-600 dark:text-dark-300 max-w-2xl leading-relaxed"
          style={align === "center" ? { margin: "0.75rem auto 0" } : undefined}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function PanelCard({
  children,
  className = "",
  hover = true,
  onClick,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  as?: "div" | "article";
}) {
  return (
    <Tag
      className={`
        ${hover ? "panel-hover" : "panel"} p-5 md:p-6
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

export function StatusDot({
  color = "cyan",
  label,
}: {
  color?: "cyan" | "green" | "amber" | "red";
  label?: string;
}) {
  const colorMap = {
    cyan: "bg-primary-400",
    green: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${colorMap[color]} animate-pulse-glow`} aria-hidden="true" />
      {label && <span className="sys-label">{label}</span>}
    </span>
  );
}

export function GlowBar({ className = "" }: { className?: string }) {
  return <div className={`glow-line ${className}`} aria-hidden="true" />;
}
