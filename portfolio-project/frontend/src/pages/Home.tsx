import { motion } from 'framer-motion'
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiChevronDown } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useFeaturedProjects } from '../hooks/useProjects'
import { useSkills } from '../hooks/useSkills'
import { CornerFrame, SectionHeading, PanelCard, GlowBar, StatusDot, staggerContainer, staggerItem } from '../components/ui'

export default function Home() {
  const { language } = useLanguage()

  const { data: projectsResponse, isLoading: projectsLoading } = useFeaturedProjects(language)
  const { data: skillsData, isLoading: skillsLoading } = useSkills(language)

  const loading = projectsLoading || skillsLoading
  const featuredProjects = projectsResponse?.items ?? []
  const topSkills = [...(skillsData ?? [])].sort((a, b) => b.proficiency - a.proficiency).slice(0, 8)

  const t = {
    tr: {
      hero: {
        greeting: 'Merhaba, ben ',
        init: '> sistem.profil baslatiliyor',
        role: 'SOFTWARE ENGINEER',
        roleParts: ['BACKEND SYSTEMS', 'CLOUD & DEVOPS', 'AI-NATIVE TOOLING'],
        description:
          'Istanbul Isik Universitesi\'nde yazilim muhendisligi egitimime devam ederken enterprise backend, cloud-native mimari ve DevOps otomasyonu uzerine odaklaniyorum. NETAS stajimda kurumsal Java mikroservis platformuna katkida bulundum, kritik timezone tutarsizligini ELK ve test odakli analizle tespit ettim.',
      },
      about: {
        label: 'GENEL BAKIS',
        title: 'Hakkimda',
        description:
          'IsikSchedule, Agentic IDE ve Teknofest Sarkan UAV gibi projelerde algoritma, sistem tasarimi ve urunlestirme deneyimi edindim. IEEE Isik Ogrenci Kolu\'nda teknik etkinlikler ve topluluk operasyonlari yurutterek hem teknik hem organizasyonel liderlik gelistiriyorum.',
        btnMore: 'Profili Incele',
      },
      skills: {
        label: 'TEKNIK YETKINLIKLER',
        title: 'Yetenekler',
        subtitle: 'Backend, cloud ve otomasyon odakli olarak aktif kullandigim teknoloji seti',
        empty: 'Yetenek verisi bulunamadi.',
      },
      projects: {
        label: 'PROJELER',
        title: 'One Cikan Projeler',
        subtitle: 'Gercek urun, arastirma ve muhendislik odakli guncel calismalarim',
        empty: 'One cikan proje bulunamadi.',
        btnAll: 'Tum Projeleri Gor',
      },
      cta: {
        label: 'ILETISIM',
        title: 'Birlikte Uretelim mi?',
        description:
          'Yazilim muhendisligi, cloud altyapi, optimizasyon veya AI-native urunler uzerine konusmak istersen benimle iletisime gecebilirsin.',
      },
      buttons: {
        contact: 'Iletisime Gec',
        viewProjects: 'Projeleri Incele',
      },
      scroll: 'Asagi Kaydir',
      aria: {
        github: 'GitHub profili',
        linkedin: 'LinkedIn profili',
        email: 'E-posta gonder',
      },
    },
    en: {
      hero: {
        greeting: "Hi, I'm ",
        init: '> init system.profile',
        role: 'SOFTWARE ENGINEER',
        roleParts: ['BACKEND SYSTEMS', 'CLOUD & DEVOPS', 'AI-NATIVE TOOLING'],
        description:
          'I focus on enterprise backend systems, cloud-native architecture, and DevOps automation while studying Software Engineering at Isik University. During my NETAS internship, I contributed to production Java microservices and uncovered a critical timezone mismatch through ELK-driven investigation and test-first validation.',
      },
      about: {
        label: 'OVERVIEW',
        title: 'About Me',
        description:
          'I build and ship systems across scheduling optimization, AI-native tooling, and defense-grade telemetry projects. Through IEEE leadership at Isik University, I also coordinate technical events and community operations, combining delivery execution with technical leadership.',
        btnMore: 'View Profile',
      },
      skills: {
        label: 'CAPABILITIES',
        title: 'Skills',
        subtitle: 'Technology stack I actively use across backend, cloud, and automation workflows',
        empty: 'No skills data available.',
      },
      projects: {
        label: 'ARCHIVE',
        title: 'Featured Projects',
        subtitle: 'Current engineering work across product, research, and systems domains',
        empty: 'No featured projects available.',
        btnAll: 'View All Projects',
      },
      cta: {
        label: 'CONTACT',
        title: "Let's Build Together",
        description:
          'If you want to discuss software engineering, cloud architecture, optimization, or AI-native products, feel free to reach out.',
      },
      buttons: {
        contact: 'Get In Touch',
        viewProjects: 'View Projects',
      },
      scroll: 'Scroll',
      aria: {
        github: 'GitHub profile',
        linkedin: 'LinkedIn profile',
        email: 'Send an email',
      },
    },
  }

  const currentLang = language === 'en' ? 'en' : 'tr'
  const text = t[currentLang]

  return (
    <div className="relative">
      {/* ═══════════ HERO ═══════════ */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
        {/* Corner frames */}
        <div className="hidden md:block">
          <span className="absolute top-8 left-8 w-14 h-14 border-l border-t border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute top-8 right-8 w-14 h-14 border-r border-t border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute bottom-8 left-8 w-14 h-14 border-l border-b border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute bottom-8 right-8 w-14 h-14 border-r border-b border-primary-400/20 pointer-events-none" aria-hidden="true" />
        </div>

        {/* System label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-24 left-8 md:left-14 hidden md:block"
        >
          <span className="sys-label text-primary-500/40">// portfolio.sys</span>
        </motion.div>

        <div className="container-custom">
          <div className="grid md:grid-cols-[1fr,auto] gap-8 md:gap-12 items-center max-w-5xl">
            {/* Left — Text content */}
            <div className="order-2 md:order-1">
              {/* Terminal init line */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-5 font-mono text-xs sm:text-sm text-dark-400 dark:text-dark-400 tracking-wider"
              >
                <span className="text-primary-500">{'>'}</span> {text.hero.init}
                <span className="animate-blink text-primary-400 ml-0.5">_</span>
              </motion.div>

              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-5 leading-[0.95]"
              >
                <span className="text-gray-900 dark:text-dark-50">YIĞİT</span>
                <br />
                <span className="text-primary-500 dark:text-primary-400">OKUR</span>
              </motion.h1>

              {/* Role chips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex flex-wrap items-center gap-2 sm:gap-3 mb-7"
              >
                <span className="w-6 sm:w-8 h-px bg-primary-400/50" aria-hidden="true" />
                {text.hero.roleParts.map((part, i) => (
                  <span key={part} className="font-mono text-[10px] sm:text-xs tracking-wider text-gray-500 dark:text-dark-300 flex items-center gap-2 sm:gap-3">
                    {i > 0 && <span className="text-dark-600 dark:text-dark-500">·</span>}
                    {part}
                  </span>
                ))}
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="text-base sm:text-lg text-gray-600 dark:text-dark-300 max-w-2xl leading-relaxed mb-9"
              >
                {text.hero.description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link to="/contact" className="btn-primary">
                  <span>{text.buttons.contact}</span>
                  <FiArrowRight size={14} />
                </Link>
                <Link to="/projects" className="btn-secondary">
                  <span>{text.buttons.viewProjects}</span>
                </Link>
              </motion.div>

              {/* Social */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                {[
                  { icon: FiGithub, href: 'https://github.com/TurkishKEBAB', label: text.aria.github },
                  { icon: FiLinkedin, href: 'https://www.linkedin.com/in/yigit-okur-050b5b278', label: text.aria.linkedin },
                  { icon: FiMail, href: 'mailto:yigitokur@ieee.org', label: text.aria.email },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    aria-label={s.label}
                    className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all"
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Right — Profile photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="order-1 md:order-2 flex justify-center md:justify-end"
            >
              <div className="relative group">
                {/* Glow ring */}
                <div
                  className="absolute -inset-1 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-500 blur-md"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc, #00d4ff)' }}
                  aria-hidden="true"
                />
                {/* Photo */}
                <img
                  src="/profile-placeholder.png"
                  alt="Yiğit Okur"
                  className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full object-cover border-2 border-primary-400/30 dark:border-primary-400/20"
                />
                {/* Corner accent */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-primary-400/40 rounded-br" aria-hidden="true" />
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-primary-400/40 rounded-tl" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 dark:text-dark-500">
            {text.scroll}
          </span>
          <FiChevronDown size={14} className="text-gray-400 dark:text-dark-500 animate-bounce" />
        </motion.div>
      </section>

      {/* ═══════════ ABOUT SECTION ═══════════ */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              index="01"
              label={text.about.label}
              title={text.about.title}
              align="center"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-gray-600 dark:text-dark-300 leading-relaxed mb-8"
            >
              {text.about.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/about" className="btn-secondary">
                <span>{text.about.btnMore}</span>
                <FiArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <GlowBar />

      {/* ═══════════ SKILLS ═══════════ */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="02"
            label={text.skills.label}
            title={text.skills.title}
            subtitle={text.skills.subtitle}
            align="center"
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-6 w-6 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
            </div>
          ) : topSkills.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-dark-400 font-mono text-sm">
              {text.skills.empty}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
            >
              {topSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={staggerItem}
                >
                  <PanelCard className="text-center">
                    {skill.icon && <div className="text-2xl mb-2">{skill.icon}</div>}
                    <h3 className="font-mono text-sm font-medium text-gray-800 dark:text-dark-100 mb-2">
                      {skill.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="h-full bg-primary-400"
                        />
                      </div>
                      <span className="font-mono text-[10px] text-primary-500 dark:text-primary-400 w-8 text-right">
                        {skill.proficiency}%
                      </span>
                    </div>
                  </PanelCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <GlowBar />

      {/* ═══════════ FEATURED PROJECTS ═══════════ */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="03"
            label={text.projects.label}
            title={text.projects.title}
            subtitle={text.projects.subtitle}
            align="center"
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-6 w-6 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-dark-400 font-mono text-sm">
              {text.projects.empty}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featuredProjects.map((project) => (
                <motion.article
                  key={project.id}
                  variants={staggerItem}
                  className="panel-hover group overflow-hidden"
                >
                  {project.cover_image && (
                    <div className="relative overflow-hidden h-44 border-b border-gray-200 dark:border-dark-600">
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-dark-50 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-dark-300 mb-4 line-clamp-2">
                      {project.short_description || project.description}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech.id}
                            className="px-2 py-0.5 font-mono text-[10px] tracking-wide border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 rounded"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/projects" className="btn-secondary">
              <span>{text.projects.btnAll}</span>
              <FiArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <GlowBar />

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <CornerFrame accent className="max-w-3xl mx-auto p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <StatusDot color="green" label={text.cta.label} />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-50 mt-4 mb-4">
                {text.cta.title}
              </h2>
              <p className="text-gray-600 dark:text-dark-300 mb-8 max-w-xl mx-auto">
                {text.cta.description}
              </p>
              <Link to="/contact" className="btn-primary">
                <span>{text.buttons.contact}</span>
                <FiArrowRight size={14} />
              </Link>
            </motion.div>
          </CornerFrame>
        </div>
      </section>
    </div>
  )
}
