import AnimatedSection from "@/components/AnimatedSection";
import { GlowBar, PanelCard, SectionHeading } from "@/components/ui";
import {
  aboutContent,
  getLocaleValue,
  impactMetrics,
  skillGroups,
  type Locale,
} from "@/content/site";

interface AboutPageProps {
  locale: Locale;
}

const currentSignals = [
  {
    title: { en: "Part-time engineering search", tr: "Part-time engineering arayisi" },
    body: {
      en: "Backend, platform, cloud, and quality-focused teams are the clearest fit.",
      tr: "Backend, platform, cloud ve kalite odakli ekipler en net eslesme.",
    },
  },
  {
    title: { en: "Portfolio platform hardening", tr: "Portfolyo platform sertlestirme" },
    body: {
      en: "Security hotspots, SSR reliability, and CI gates are the current maintenance loop.",
      tr: "Security hotspot, SSR guvenilirligi ve CI kapilari guncel bakim dongusu.",
    },
  },
  {
    title: { en: "Agentic IDE research", tr: "Agentic IDE arastirmasi" },
    body: {
      en: "Human approval, prohibited-command policy, and local/cloud model orchestration.",
      tr: "Insan onayi, yasak komut politikasi ve lokal/cloud model orkestrasyonu.",
    },
  },
];

const careerTimeline = [
  {
    year: "2026",
    title: { en: "NETAS software engineering internship", tr: "NETAS software engineering staji" },
    body: {
      en: "Production Java microservices, timezone diagnosis, and regression-focused test proof.",
      tr: "Production Java mikroservisleri, timezone teshisi ve regression odakli test kaniti.",
    },
  },
  {
    year: "2025",
    title: { en: "AdaLab research and Arch of Sigma coordination", tr: "AdaLab arastirma ve Arch of Sigma koordinasyon" },
    body: {
      en: "Moved between research support, remote project management, and structured delivery.",
      tr: "Arastirma destegi, remote proje yonetimi ve yapilandirilmis teslim arasinda calistim.",
    },
  },
  {
    year: "2024",
    title: { en: "Isik University student assistant", tr: "Isik University student assistant" },
    body: {
      en: "Teaching support, mentoring, and technical event operations around the CSE department.",
      tr: "CSE bolumu etrafinda ders destegi, mentorluk ve teknik etkinlik operasyonlari.",
    },
  },
  {
    year: "2023",
    title: { en: "Software engineering foundation", tr: "Software engineering temeli" },
    body: {
      en: "Started the B.Sc. path and began building portfolio-grade product systems.",
      tr: "Lisans yolculugu basladi ve portfolio seviyesinde urun sistemleri gelismeye basladi.",
    },
  },
];

const radarQuadrants = [
  { label: "Adopt", items: ["Java", "FastAPI", "Docker", "PostgreSQL"] },
  { label: "Trial", items: ["Next.js", "Redis", "Celery", "GitHub Actions"] },
  { label: "Assess", items: ["Kubernetes", "RabbitMQ", "ELK", "RAG"] },
  { label: "Watch", items: ["Agents", "Monaco", "Edge APIs", "Satori"] },
];

export default function About({ locale }: AboutPageProps) {
  const text = aboutContent[locale];

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        <AnimatedSection className="mb-16">
          <span className="sys-label mb-3 block">// {text.pageLabel}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-3xl">
            {text.pageSubtitle}
          </p>
        </AnimatedSection>

        <section className="mb-20">
          <SectionHeading index="01" label={text.journeyLabel} title={text.journeyTitle} />
          <AnimatedSection>
            <PanelCard>
              <p className="text-base leading-relaxed text-gray-700 dark:text-dark-200">
                {text.journeyBody}
              </p>
            </PanelCard>
          </AnimatedSection>
        </section>

        <GlowBar className="mb-20" />

        <section className="mb-20">
          <SectionHeading
            index="02"
            label={locale === "tr" ? "Simdi" : "Now"}
            title={locale === "tr" ? "Guncel sinyal" : "Current signal"}
            subtitle={
              locale === "tr"
                ? "Profilin su anda hangi islere ve sistemlere odaklandigini gosteren kisa sinyaller."
                : "Short signals that show where the profile is pointed right now."
            }
          />
          <div className="grid md:grid-cols-3 gap-5">
            {currentSignals.map((signal, index) => (
              <AnimatedSection key={signal.title.en} delay={index * 0.04}>
                <PanelCard className="h-full">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-dark-50">
                    {getLocaleValue(signal.title, locale)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                    {getLocaleValue(signal.body, locale)}
                  </p>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <GlowBar className="mb-20" />

        <section className="mb-20">
          <SectionHeading
            index="03"
            label={text.highlightsLabel}
            title={text.highlightsTitle}
          />
          <div className="grid md:grid-cols-2 gap-5">
            {text.highlights.map((highlight, index) => (
              <AnimatedSection key={highlight} delay={index * 0.04}>
                <PanelCard className="h-full">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-dark-200">
                    {highlight}
                  </p>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <GlowBar className="mb-20" />

        <section className="mb-20">
          <SectionHeading
            index="04"
            label={locale === "tr" ? "Yol" : "Trajectory"}
            title={locale === "tr" ? "Kariyer zaman cizgisi" : "Career timeline"}
            subtitle={
              locale === "tr"
                ? "Sistemler, arastirma, topluluk operasyonlari ve production yazilim arasindaki ilerleme."
                : "A progression across systems, research, community operations, and production software."
            }
          />
          <div className="relative space-y-4">
            <div className="absolute left-4 top-0 hidden h-full w-px bg-primary-400/25 md:block" aria-hidden="true" />
            {careerTimeline.map((entry, index) => (
              <AnimatedSection key={`${entry.year}-${entry.title.en}`} delay={index * 0.04}>
                <PanelCard className="relative md:ml-12">
                  <span
                    className="absolute -left-[2.35rem] top-7 hidden h-3 w-3 rounded-full border border-primary-400 bg-[#f4f4f8] dark:bg-dark-950 md:block"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="sys-label">{entry.year}</span>
                      <h3 className="mt-2 font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                        {getLocaleValue(entry.title, locale)}
                      </h3>
                    </div>
                    <span className="rounded-full border border-gray-200 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:border-dark-600 dark:text-dark-300">
                      {index === 0 ? "current" : "logged"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                    {getLocaleValue(entry.body, locale)}
                  </p>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <GlowBar className="mb-20" />

        <section className="mb-20">
          <SectionHeading
            index="05"
            label={locale === "tr" ? "Tech radar" : "Tech radar"}
            title={locale === "tr" ? "Adopt | trial | assess" : "Adopt | trial | assess"}
            subtitle={
              locale === "tr"
                ? "Stack kararlarini hype yerine kanit, kullanim sikligi ve teslim riskiyle konumlandiriyorum."
                : "Stack choices are positioned by proof, frequency of use, and delivery risk rather than hype."
            }
          />
          <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
            <AnimatedSection>
              <PanelCard className="h-full">
                <div className="relative mx-auto aspect-square max-w-sm">
                  <svg viewBox="0 0 320 320" className="h-full w-full" role="img" aria-label="Tech radar">
                    <circle cx="160" cy="160" r="132" fill="none" stroke="currentColor" className="text-gray-200 dark:text-dark-600" />
                    <circle cx="160" cy="160" r="92" fill="none" stroke="currentColor" className="text-gray-200 dark:text-dark-600" />
                    <circle cx="160" cy="160" r="52" fill="none" stroke="currentColor" className="text-gray-200 dark:text-dark-600" />
                    <path d="M160 28V292M28 160H292" stroke="currentColor" className="text-gray-200 dark:text-dark-600" />
                    {[
                      { x: 126, y: 104, label: "Java" },
                      { x: 197, y: 86, label: "FastAPI" },
                      { x: 218, y: 188, label: "Docker" },
                      { x: 103, y: 205, label: "Next.js" },
                      { x: 182, y: 232, label: "Agents" },
                    ].map((point) => (
                      <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="5" className="fill-primary-400" />
                        <text x={point.x + 9} y={point.y + 4} className="fill-primary-600 font-mono text-[10px] dark:fill-primary-400">
                          {point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </PanelCard>
            </AnimatedSection>

            <div className="grid gap-5 sm:grid-cols-2">
              {radarQuadrants.map((quadrant, index) => (
                <AnimatedSection key={quadrant.label} delay={index * 0.04}>
                  <PanelCard className="h-full">
                    <span className="sys-label">// {quadrant.label}</span>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {quadrant.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-gray-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </PanelCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <GlowBar className="mb-20" />

        <section className="mb-20">
          <SectionHeading
            index="06"
            label={locale === "tr" ? "Etki metrikleri" : "Impact metrics"}
            title={locale === "tr" ? "Olcekle birlikte teslim" : "Delivery with scale"}
          />
          <div className="grid md:grid-cols-3 gap-5">
            {impactMetrics.map((metric, index) => (
              <AnimatedSection key={metric.value} delay={index * 0.04}>
                <PanelCard className="space-y-2 h-full">
                  <div className="font-display text-3xl font-semibold text-gray-900 dark:text-dark-50">
                    {metric.value}
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                    {getLocaleValue(metric.label, locale)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-dark-300">
                    {getLocaleValue(metric.note, locale)}
                  </p>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <GlowBar className="mb-20" />

        <section>
          <SectionHeading
            index="07"
            label={locale === "tr" ? "Teknik gruplar" : "Technical groups"}
            title={locale === "tr" ? "Calistigim katmanlar" : "Layers I ship across"}
          />
          <div className="grid lg:grid-cols-2 gap-5">
            {skillGroups.map((group, index) => (
              <AnimatedSection key={group.title.en} delay={index * 0.04}>
                <PanelCard className="h-full">
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                    {getLocaleValue(group.title, locale)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                    {getLocaleValue(group.summary, locale)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={`${group.title.en}-${skill}`}
                        className="rounded-full border border-gray-200 dark:border-dark-600 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
