import { FiClock, FiGithub, FiLinkedin, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import ContactForm from "@/components/ContactForm";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import { CornerFrame, PanelCard, StatusDot } from "@/components/ui";
import { contactContent, siteConfig, type Locale } from "@/content/site";

interface ContactPageProps {
  locale: Locale;
}

export default function Contact({ locale }: ContactPageProps) {
  const text = contactContent[locale];
  const tr = locale === "tr";

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="mb-12 max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> {text.pageLabel}
        </span>
        <ScrambleHeading
          as="h1"
          text={text.pageTitle}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">{text.pageSubtitle}</p>
      </header>

      <div className="grid max-w-5xl gap-8 md:grid-cols-[1.1fr,0.9fr]">
        <AnimatedSection>
          <CornerFrame accent className="p-6 md:p-8">
            <span className="sys-label mb-4 block">// {text.formLabel}</span>
            <h2 className="mb-2 font-display text-xl font-bold text-gray-900 dark:text-dark-50">{text.formTitle}</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-dark-300">{text.formDescription}</p>
            <ContactForm locale={locale} />
          </CornerFrame>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="space-y-6">
          <PanelCard>
            <span className="sys-label mb-4 block">// {text.infoTitle}</span>
            <div className="space-y-4">
              {[
                { icon: FiMail, label: text.fields.email, value: siteConfig.email, href: `mailto:${siteConfig.email}` },
                { icon: FiPhone, label: tr ? "Telefon" : "Phone", value: siteConfig.phone, href: siteConfig.phoneHref },
                { icon: FiMapPin, label: tr ? "Konum" : "Location", value: siteConfig.location[locale] },
                {
                  icon: FiClock,
                  label: tr ? "Donus suresi" : "Response time",
                  value: tr ? "Genellikle 24 saat icinde" : "Usually within 24 hours",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="rounded border border-gray-200 p-2 text-primary-500 dark:border-dark-600">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-dark-400">
                      {item.label}
                    </h3>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-dark-200">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>

          <CornerFrame accent className="p-6">
            <StatusDot color="green" label={tr ? "AKTIF" : "ACTIVE"} />
            <h3 className="mb-2 mt-3 font-display text-lg font-bold text-gray-900 dark:text-dark-50">
              {text.availabilityTitle}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-dark-300">{text.availabilityBody}</p>
            <div className="flex gap-2">
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded border border-gray-200 p-2.5 text-gray-500 transition-all hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-400 dark:hover:text-primary-400"
              >
                <FiGithub size={16} />
              </a>
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded border border-gray-200 p-2.5 text-gray-500 transition-all hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-400 dark:hover:text-primary-400"
              >
                <FiLinkedin size={16} />
              </a>
            </div>
          </CornerFrame>
        </AnimatedSection>
      </div>
    </div>
  );
}
