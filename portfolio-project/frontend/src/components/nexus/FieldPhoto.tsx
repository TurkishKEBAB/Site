"use client";

import { useState, type CSSProperties } from "react";

import type { Locale } from "@/content/site";

const copy = {
  en: {
    label: "Field log",
    place: "Zürich · CH",
    coords: "47.3769°N 8.5417°E",
    alt: "Yiğit Okur standing on a canal-side plaza in Zürich, framed by glass office buildings and young ginkgo trees.",
    toColor: "Show the original colour",
    toGraded: "Apply the cyan grade",
    original: "original",
    graded: "graded",
  },
  tr: {
    label: "Saha kaydı",
    place: "Zürih · CH",
    coords: "47.3769°K 8.5417°D",
    alt: "Yiğit Okur, Zürih'te kanal kenarındaki meydanda; arkasında cam ofis binaları ve genç ginkgo ağaçları.",
    toColor: "Orijinal rengi göster",
    toGraded: "Camgöbeği tonlamayı uygula",
    original: "orijinal",
    graded: "tonlu",
  },
} as const;

/** Corner bracket for the HUD frame, mirroring the hero terminal's photo slot. */
const bracket = (corner: "tl" | "tr" | "bl" | "br"): CSSProperties => ({
  position: "absolute",
  width: 22,
  height: 22,
  pointerEvents: "none",
  ...(corner.startsWith("t")
    ? { top: 12, borderTop: "1px solid rgba(0,212,255,0.75)" }
    : { bottom: 12, borderBottom: "1px solid rgba(0,212,255,0.75)" }),
  ...(corner.endsWith("l")
    ? { left: 12, borderLeft: "1px solid rgba(0,212,255,0.75)" }
    : { right: 12, borderRight: "1px solid rgba(0,212,255,0.75)" }),
});

/**
 * Full-width photo band sitting between the hero and the tech ticker.
 *
 * The source frame is landscape and its subject is the place as much as the
 * person, so the crop is done in CSS rather than baked into the asset: the
 * aspect ratio opens up on small screens and tightens to cinematic on wide
 * ones, while `object-position` keeps the skyline and the face in frame.
 * Colour is graded to the house cyan by default and can be toggled back to
 * the original, matching the terminal's photo behaviour.
 */
export default function FieldPhoto({ locale }: Readonly<{ locale: Locale }>) {
  const [graded, setGraded] = useState(true);
  const text = copy[locale === "tr" ? "tr" : "en"];
  const overlay = (style: CSSProperties) => ({
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    opacity: graded ? 1 : 0,
    transition: "opacity 400ms var(--ease-nx)",
    ...style,
  });

  return (
    <section className="container-custom pb-2 pt-2">
      <figure className="relative m-0 overflow-hidden rounded border border-gray-200 shadow-xl dark:border-dark-600/70">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]">
          {/*
            Phones are deliberately served below their device pixel ratio. This
            band is decorative and below the fold, yet browsers prefetch lazy
            images generously enough that it was pulling 142KB into the initial
            mobile load; at this size the colour grade hides the softness. Wide
            viewports get the honest measurement.
          */}
          <img
            src="/photo-zurich-960.webp"
            srcSet="/photo-zurich-480.webp 480w, /photo-zurich-640.webp 640w, /photo-zurich-768.webp 768w, /photo-zurich-960.webp 960w, /photo-zurich-1152.webp 1152w, /photo-zurich-1448.webp 1448w"
            sizes="(min-width: 1280px) 1216px, (min-width: 640px) calc(100vw - 3rem), 65vw"
            alt={text.alt}
            width={1448}
            height={1086}
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: "50% 28%",
              filter: graded ? "grayscale(0.45) contrast(1.05) brightness(0.97)" : "none",
              transition: "filter 400ms var(--ease-nx)",
            }}
          />
          <div aria-hidden="true" style={overlay({ background: "rgba(0,212,255,0.22)", mixBlendMode: "color" })} />
          <div
            aria-hidden="true"
            style={overlay({
              background:
                "repeating-linear-gradient(0deg, rgba(0,212,255,0.045) 0px, rgba(0,212,255,0.045) 1px, transparent 1px, transparent 4px)",
            })}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(6,6,14,0.72), transparent 42%)", pointerEvents: "none" }}
          />

          <span aria-hidden="true" style={bracket("tl")} />
          <span aria-hidden="true" style={bracket("tr")} />
          <span aria-hidden="true" style={bracket("bl")} />
          <span aria-hidden="true" style={bracket("br")} />

          <button
            type="button"
            onClick={() => setGraded((value) => !value)}
            aria-pressed={graded}
            title={graded ? text.toColor : text.toGraded}
            className="absolute right-3 top-3 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors"
            style={{
              borderColor: "rgba(0,212,255,0.35)",
              background: "rgba(6,6,14,0.62)",
              backdropFilter: "blur(3px)",
              color: "var(--primary-300)",
            }}
          >
            {graded ? text.original : text.graded}
          </button>

          <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 pb-3.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:px-6 sm:text-[11px]">
            <span className="flex items-baseline gap-2.5">
              <span style={{ color: "var(--primary-400)" }}>{text.label}</span>
              <span className="text-white/85">{text.place}</span>
            </span>
            <span className="text-white/55">{text.coords}</span>
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
