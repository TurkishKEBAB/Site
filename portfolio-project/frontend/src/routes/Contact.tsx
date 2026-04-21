import { FiClock, FiGithub, FiLinkedin, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import ContactForm from "@/components/ContactForm";
import { CornerFrame, PanelCard, StatusDot } from "@/components/ui";
import { contactContent, siteConfig, type Locale } from "@/content/site";

interface ContactPageProps {
  locale: Locale;
}

export default function Contact({ locale }: ContactPageProps) {
  const text = contactContent[locale];

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        <AnimatedSection className="mb-12">
          <span className="sys-label mb-3 block">// {text.pageLabel}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-3xl">
            {text.pageSubtitle}
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
          <AnimatedSection>
            <CornerFrame accent className="p-6 md:p-8">
              <span className="sys-label mb-4 block">// {text.formLabel}</span>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-dark-50 mb-2">
                {text.formTitle}
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-dark-300">
                {text.formDescription}
              </p>
              <ContactForm locale={locale} />
            </CornerFrame>
          </AnimatedSection>

          <AnimatedSection delay={0.08} className="space-y-6">
            <PanelCard>
              <span className="sys-label mb-4 block">// {text.infoTitle}</span>
              <div className="space-y-4">
                {[
                  { icon: FiMail, label: text.fields.email, value: siteConfig.email, href: `mailto:${siteConfig.email}` },
                  { icon: FiPhone, label: locale === "tr" ? "Telefon" : "Phone", value: siteConfig.phone, href: siteConfig.phoneHref },
                  { icon: FiMapPin, label: locale === "tr" ? "Konum" : "Location", value: siteConfig.location[locale] },
                  { icon: FiClock, label: locale === "tr" ? "Donus suresi" : "Response time", value: locale === "tr" ? "Genellikle 24 saat icinde" : "Usually within 24 hours" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 rounded border border-gray-200 dark:border-dark-600 text-primary-500">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-mono text-xs tracking-wide text-gray-500 dark:text-dark-400 uppercase">
                        {item.label}
                      </h3>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
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
              <StatusDot color="green" label="ACTIVE" />
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-dark-50 mt-3 mb-2">
                {text.availabilityTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-300 mb-4">
                {text.availabilityBody}
              </p>
              <div className="flex gap-2">
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all" aria-label="GitHub">
                  <FiGithub size={16} />
                </a>
                <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all" aria-label="LinkedIn">
                  <FiLinkedin size={16} />
                </a>
              </div>
            </CornerFrame>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
