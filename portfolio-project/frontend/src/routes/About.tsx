import AnimatedSection from "@/components/AnimatedSection";
import CapabilityMatrix, { type CapabilityGroup } from "@/components/nexus/CapabilityMatrix";
import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import TechRadar from "@/components/nexus/TechRadar";
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

const nowCards = [
  {
    tag: { en: "ACTIVE", tr: "AKTIF" },
    title: { en: "Graduation thesis", tr: "Bitirme tezi" },
    body: {
      en: "Agentic IDE on Electron + Monaco — observe / plan / approve / apply loops.",
      tr: "Electron + Monaco uzerinde agentic IDE — gozlemle / planla / onayla / uygula dongusu.",
    },
  },
  {
    tag: { en: "RESEARCH", tr: "ARASTIRMA" },
    title: { en: "AdaLab · Data Analytics", tr: "AdaLab · Veri Analitigi" },
    body: {
      en: "Research assistant supporting AI & data-analytics work.",
      tr: "AI ve veri-analitigi calismalarini destekleyen arastirma asistani.",
    },
  },
  {
    tag: { en: "RECENT", tr: "YAKIN" },
    title: { en: "Ex-NETAS intern", tr: "Ex-NETAS stajyer" },
    body: {
      en: "Shipped production code across four Jira tickets on a Java microservices platform.",
      tr: "Java mikroservis platformunda dort Jira ticket boyunca production kod teslim ettim.",
    },
  },
  {
    tag: { en: "OPEN", tr: "ACIK" },
    title: { en: "Open to roles", tr: "Rollere acik" },
    body: {
      en: "Part-time SWE, backend, cloud platform & DevOps.",
      tr: "Part-time SWE, backend, cloud platform ve DevOps.",
    },
  },
];

const timeline = [
  {
    when: { en: "Jan 2026 – Feb 2026", tr: "Oca 2026 – Sub 2026" },
    where: "NETAS Telekom",
    title: { en: "Software Engineering Intern", tr: "Yazilim Muhendisligi Stajyeri" },
    body: {
      en: "25 commits and 1,550 lines of code & tests across four Jira tickets; traced a silent UTC vs UTC+3 mismatch with ELK and locked it down with 600+ test lines.",
      tr: "Dort Jira ticket boyunca 25 commit ve 1.550 satir kod & test; sessiz UTC vs UTC+3 uyumsuzlugunu ELK ile izleyip 600+ satir testle sabitledim.",
    },
  },
  {
    when: { en: "Dec 2025 – Present", tr: "Ara 2025 – Devam" },
    where: "AdaLab",
    title: { en: "Research Assistant", tr: "Arastirma Asistani" },
    body: {
      en: "Academic data-analytics lab — supporting AI and data-analytics research alongside coursework.",
      tr: "Akademik veri-analitigi lab — ders yukunun yaninda AI ve veri-analitigi arastirmasina destek.",
    },
  },
  {
    when: { en: "Nov 2025 – Jan 2026", tr: "Kas 2025 – Oca 2026" },
    where: "Arch of Sigma · Remote",
    title: { en: "Project Management Intern", tr: "Proje Yonetimi Stajyeri" },
    body: {
      en: "Coordinated cross-functional architecture project delivery and reporting.",
      tr: "Fonksiyonlar arasi mimari proje teslimini ve raporlamasini koordine ettim.",
    },
  },
  {
    when: { en: "Feb 2024 – Present", tr: "Sub 2024 – Devam" },
    where: "Isik University · CSE",
    title: { en: "Student Assistant", tr: "Ogrenci Asistani" },
    body: {
      en: "Supporting the Computer Science & Engineering department across coursework and labs.",
      tr: "Bilgisayar Bilimleri & Muhendisligi bolumunu dersler ve laboratuvarlarda destekliyorum.",
    },
  },
  {
    when: { en: "Ongoing", tr: "Suregelen" },
    where: "IEEE Isik",
    title: { en: "Leadership & Coordination", tr: "Liderlik & Koordinasyon" },
    body: {
      en: "Help coordinate 35+ technical events reaching 1,100+ students.",
      tr: "1.100+ ogrenciye ulasan 35+ teknik etkinligin koordinasyonuna destek.",
    },
  },
  {
    when: { en: "2023 – 2027", tr: "2023 – 2027" },
    where: "Isik University",
    title: { en: "B.Sc. Software Engineering", tr: "Lisans, Yazilim Muhendisligi" },
    body: {
      en: "Third-year — focused on backend systems, cloud delivery, and quality engineering.",
      tr: "Ucuncu sinif — backend sistemleri, cloud teslimi ve kalite muhendisligine odakli.",
    },
  },
];

const domains = ["backend", "cloud", "product", "testing", "research"];

export default function About({ locale }: AboutPageProps) {
  const text = aboutContent[locale];
  const tr = locale === "tr";

  const capabilityGroups: CapabilityGroup[] = skillGroups.map((group, index) => ({
    no: `/0${index + 1}`,
    domain: domains[index] ?? "backend",
    title: getLocaleValue(group.title, locale),
    summary: getLocaleValue(group.summary, locale),
    skills: group.skills,
  }));

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> {text.pageLabel}
        </span>
        <ScrambleHeading
          as="h1"
          text={tr ? "Yetenekler & sistem" : "Skills & system"}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">{text.pageSubtitle}</p>
      </header>

      {/* 01 — optimize for */}
      <section className="mt-16">
        <div className="relative panel p-7 md:p-8">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-400/40" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-400/40" aria-hidden="true" />
          <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
            <span className="text-primary-600 dark:text-primary-400">01</span> {tr ? "Neyi optimize ediyorum" : "What I optimize for"}
          </span>
          <p className="mt-3.5 text-[15px] leading-[1.7] text-gray-600 dark:text-dark-200">{text.journeyBody}</p>
        </div>
      </section>

      {/* 02 — now */}
      <section className="mt-20">
        <NxSectionHead index="02" label={tr ? "Simdi" : "Now"} title={tr ? "Guncel sinyal" : "Current signal"} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nowCards.map((card, index) => (
            <AnimatedSection key={card.title.en} delay={index * 0.04}>
              <div className="panel-hover h-full p-5">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {getLocaleValue(card.tag, locale)}
                </span>
                <h4 className="mt-3 font-display text-[15px] font-semibold text-gray-900 dark:text-dark-50">
                  {getLocaleValue(card.title, locale)}
                </h4>
                <p className="mt-1.5 text-[12.5px] leading-[1.55] text-gray-600 dark:text-dark-300">
                  {getLocaleValue(card.body, locale)}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 03 — proof points */}
      <section className="mt-20">
        <NxSectionHead
          index="03"
          label={tr ? "Son donem kanitlar" : "Recent proof points"}
          title={tr ? "Sayilarin ardindaki" : "What's behind the numbers"}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {text.highlights.map((highlight, index) => (
            <AnimatedSection key={highlight} delay={index * 0.04}>
              <div className="panel h-full p-6">
                <p className="text-[13.5px] leading-relaxed text-gray-700 dark:text-dark-200">{highlight}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 04 — timeline */}
      <section className="mt-20">
        <NxSectionHead index="04" label={tr ? "Yon" : "Trajectory"} title={tr ? "Kariyer zaman cizgisi" : "Career timeline"} />
        <div className="relative ml-2">
          <span className="absolute bottom-1.5 left-[5px] top-1.5 w-px bg-gray-200 dark:bg-dark-600" aria-hidden="true" />
          {timeline.map((entry, index) => (
            <AnimatedSection key={`${entry.where}-${index}`} delay={index * 0.03}>
              <div className="group relative pb-7 pl-8 last:pb-0">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-gray-300 bg-[#f4f4f8] transition-all group-hover:border-primary-400 group-hover:shadow-[0_0_0_4px_rgba(0,212,255,0.12)] dark:border-dark-500 dark:bg-dark-950" aria-hidden="true" />
                <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.06em]">
                  <span className="text-primary-600 dark:text-primary-400">{getLocaleValue(entry.when, locale)}</span>
                  <span className="text-gray-400 dark:text-dark-400">{entry.where}</span>
                </div>
                <h4 className="mt-1.5 font-display text-[17px] font-semibold text-gray-900 dark:text-dark-50">
                  {getLocaleValue(entry.title, locale)}
                </h4>
                <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-gray-600 dark:text-dark-300">
                  {getLocaleValue(entry.body, locale)}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 05 — capabilities */}
      <section className="mt-20">
        <NxSectionHead
          index="05"
          label={tr ? "Yetkinlikler" : "Capabilities"}
          title={tr ? "Teknik sistem" : "Technical system"}
          subtitle={tr ? "Matrisi odaklamak icin domain'e gore filtrele." : "Filter by domain to focus the matrix."}
        />
        <CapabilityMatrix locale={locale} groups={capabilityGroups} />
      </section>

      {/* 06 — tech radar */}
      <section className="mt-20">
        <NxSectionHead
          index="06"
          label={tr ? "Tech radar" : "Tech radar"}
          title={tr ? "Adopt · dene · degerlendir" : "Adopt · trial · assess"}
          subtitle={tr ? "Stack'imin bugun durdugu yer — adi icin bir blip'in uzerine gel." : "Where my stack sits today — hover a blip for the name."}
        />
        <TechRadar locale={locale} />
      </section>

      {/* 07 — impact metrics */}
      <section className="mt-20">
        <NxSectionHead
          index="07"
          label={tr ? "Etki metrikleri" : "Impact metrics"}
          title={tr ? "Olcekle birlikte teslim" : "Delivery with scale"}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {impactMetrics.map((metric) => (
            <AnimatedSection key={metric.value}>
              <div className="relative px-6 py-7">
                <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary-400/40" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-primary-400/40" aria-hidden="true" />
                <div className="font-display text-[2.6rem] font-bold leading-none tracking-tight text-gray-900 dark:text-dark-50">
                  {metric.value}
                </div>
                <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
                  {getLocaleValue(metric.label, locale)}
                </div>
                <div className="mt-1.5 text-[13px] text-gray-400 dark:text-dark-400">
                  {getLocaleValue(metric.note, locale)}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
