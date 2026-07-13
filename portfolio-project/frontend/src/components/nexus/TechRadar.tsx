import { type Locale } from "@/content/site";
import type { RadarBlip } from "@/lib/skills";

interface TechRadarProps {
  locale: Locale;
  blips: RadarBlip[];
}

const C = 200;
const rings = [55, 105, 152, 196];
const ringMid = [33, 80, 128, 174];

const quadLabels = (locale: Locale) =>
  locale === "tr"
    ? ["Diller", "Platformlar", "Araclar", "Yontemler"]
    : ["Languages", "Platforms", "Tools", "Methods"];

const ringLabels = (locale: Locale) =>
  locale === "tr"
    ? ["Adopt", "Dene", "Degerlendir", "Beklet"]
    : ["Adopt", "Trial", "Assess", "Hold"];

const qPos = [
  [300, 24],
  [100, 24],
  [100, 384],
  [300, 384],
];

interface PlacedBlip {
  name: string;
  ring: number;
  x: number;
  y: number;
}

const ringIndex: Record<RadarBlip["ring"], number> = {
  adopt: 0,
  trial: 1,
  assess: 2,
  hold: 3,
};

const placeBlips = (blips: RadarBlip[]): PlacedBlip[] => {
  const result: PlacedBlip[] = [];
  for (let quad = 0; quad < 4; quad += 1) {
    const arr = blips.filter((b) => b.quadrant === quad);
    arr.forEach((b, i) => {
      const a0 = quad * 90 + 14;
      const a1 = quad * 90 + 76;
      const angle = ((a0 + (a1 - a0) * ((i + 0.5) / arr.length)) * Math.PI) / 180;
      const ring = ringIndex[b.ring];
      const rr = ringMid[ring];
      result.push({
        name: b.name,
        ring,
        x: C + rr * Math.cos(angle),
        y: C - rr * Math.sin(angle),
      });
    });
  }
  return result;
};

/**
 * Tech radar (design idea #14). Adopt/Trial/Assess/Hold rings × four
 * quadrants; hover a blip to reveal its label (CSS, see .nx-radar in index.css).
 */
export default function TechRadar({ locale, blips }: TechRadarProps) {
  const placedBlips = placeBlips(blips);

  return (
    <div className="grid items-center gap-9 md:grid-cols-[minmax(0,420px),1fr]">
      <div className="nx-radar">
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-label="Tech radar">
          {rings.map((r, index) => (
            <circle
              key={`ring-${r}`}
              cx={C}
              cy={C}
              r={r}
              fill="none"
              stroke={index === 0 ? "rgba(0,212,255,0.4)" : "currentColor"}
              className={index === 0 ? "" : "text-gray-200 dark:text-dark-500"}
            />
          ))}
          <line x1={C} y1={4} x2={C} y2={396} className="text-gray-200 dark:text-dark-500" stroke="currentColor" strokeDasharray="2 4" />
          <line x1={4} y1={C} x2={396} y2={C} className="text-gray-200 dark:text-dark-500" stroke="currentColor" strokeDasharray="2 4" />
          {quadLabels(locale).map((label, index) => (
            <text
              key={label}
              x={qPos[index][0]}
              y={qPos[index][1]}
              textAnchor="middle"
              className="fill-gray-400 font-mono uppercase tracking-[0.1em] dark:fill-dark-300"
              fontSize="11"
            >
              {label}
            </text>
          ))}
          {placedBlips.map((b) => (
            <g key={b.name} className={`blip blip-r${b.ring}`}>
              <circle cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r="4.5" />
              <text x={(b.x + 8).toFixed(1)} y={(b.y + 3).toFixed(1)}>
                {b.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        {ringLabels(locale).map((label, index) => (
          <span
            key={label}
            className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.08em] text-gray-600 dark:text-dark-300"
          >
            <span
              className="h-2.5 w-2.5 flex-none rounded-full"
              style={{ backgroundColor: `rgba(0,212,255,${[1, 0.7, 0.45, 0.3][index]})` }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
