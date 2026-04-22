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
            index="03"
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
            index="04"
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
