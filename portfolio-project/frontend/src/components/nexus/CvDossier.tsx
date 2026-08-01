import AnimatedSection from "@/components/AnimatedSection";
import NxSectionHead from "@/components/nexus/NxSectionHead";
import { aboutDossier, type DossierItem } from "@/content/aboutDossier";
import { getLocaleValue, type Locale } from "@/content/site";

interface CvDossierProps {
  locale: Locale;
}

const text = (value: Record<Locale, string>, locale: Locale): string => getLocaleValue(value, locale);

function DossierCard({ item, locale }: Readonly<{ item: DossierItem; locale: Locale }>) {
  const title = text(item.title, locale);

  return (
    <AnimatedSection>
      <article className="panel-hover h-full p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-gray-400 dark:text-dark-400">
          <span>{text(item.meta, locale)}</span>
          {item.location ? <span>{text(item.location, locale)}</span> : null}
        </div>
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block font-display text-lg font-semibold text-gray-900 underline decoration-primary-400/40 underline-offset-4 transition hover:text-primary-600 dark:text-dark-50 dark:hover:text-primary-400"
          >
            {title}
          </a>
        ) : (
          <h4 className="mt-3 font-display text-lg font-semibold text-gray-900 dark:text-dark-50">{title}</h4>
        )}
        {item.organization ? (
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-600 dark:text-primary-400">
            {text(item.organization, locale)}
          </p>
        ) : null}
        <p className="mt-3 text-[13.5px] leading-relaxed text-gray-600 dark:text-dark-300">
          {text(item.summary, locale)}
        </p>
        {item.bullets?.length ? (
          <ul className="mt-3 space-y-2 border-t border-gray-200 pt-3 text-[12.5px] leading-relaxed text-gray-600 dark:border-dark-600 dark:text-dark-300">
            {item.bullets.map((bullet) => (
              <li key={text(bullet, locale)} className="flex gap-2">
                <span className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary-400" aria-hidden="true" />
                <span>{text(bullet, locale)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {item.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </AnimatedSection>
  );
}

export default function CvDossier({ locale }: CvDossierProps) {
  const content = aboutDossier[locale];

  return (
    <section className="mt-20" aria-label={content.sectionTitle}>
      <NxSectionHead
        index="02"
        label={content.sectionLabel}
        title={content.sectionTitle}
        subtitle={content.sectionSubtitle}
      />

      <article className="relative panel p-7 md:p-8">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-400/40" aria-hidden="true" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-400/40" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">{content.summaryTitle}</h3>
        <p className="mt-3 max-w-4xl text-[15px] leading-[1.75] text-gray-600 dark:text-dark-200">{content.summary}</p>
      </article>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.educationTitle}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {content.education.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.experienceTitle}</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {content.experience.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.projectsTitle}</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {content.projects.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.skillsTitle}</h3>
        <div className="grid gap-x-8 md:grid-cols-2">
          {content.skillGroups.map((group, index) => (
            <AnimatedSection key={text(group.title, locale)}>
              <article className="border-t border-gray-200 py-5 dark:border-dark-600">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-primary-600 dark:text-primary-400">/0{index + 1}</span>
                  <h4 className="font-display text-lg font-semibold text-gray-900 dark:text-dark-50">{text(group.title, locale)}</h4>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-600 dark:text-dark-300">{text(group.summary, locale)}</p>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.leadershipTitle}</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {content.leadership.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.certificationsTitle}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {content.certifications.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.achievementsTitle}</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {content.achievements.map((item) => <DossierCard key={text(item.title, locale)} item={item} locale={locale} />)}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">{content.interestsTitle}</h3>
        <div className="flex flex-wrap gap-2.5">
          {content.interests.map((interest) => (
            <span key={interest} className="rounded-full border border-primary-400/40 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-600 dark:text-primary-400">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
