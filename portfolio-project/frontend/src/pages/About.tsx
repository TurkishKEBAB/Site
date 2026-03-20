import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useSkills } from '../hooks/useSkills'
import { useExperiences } from '../hooks/useExperiences'
import {
  FiBookOpen, FiShield, FiCode, FiAward, FiGlobe,
  FiCpu, FiTarget, FiUsers, FiActivity, FiBriefcase,
  FiHeart, FiStar, FiTerminal, FiDatabase, FiGithub
} from 'react-icons/fi'
import { SectionHeading, PanelCard, CornerFrame, GlowBar, staggerContainer, staggerItem } from '../components/ui'

type FilterType = 'all' | 'education' | 'work' | 'volunteer' | 'activity' | 'certification' | 'achievement'

export default function About() {
  const [filter, setFilter] = useState<FilterType>('all')
  const { language } = useLanguage()

  const { data: skills = [], isLoading: skillsLoading } = useSkills(language)
  const { data: experiencesData, isLoading: experiencesLoading } = useExperiences({ language })
  const experiences = Array.isArray(experiencesData) ? experiencesData : []
  const loading = skillsLoading || experiencesLoading

  const t = {
    tr: {
      pageLabel: 'PROFIL DOSYASI',
      pageTitle: 'Hakkimda',
      pageSubtitle: 'Enterprise backend sistemleri, cloud-native mimari ve DevOps otomasyonu odaginda ureten bir yazilim muhendisi adayi.',
      introLabel: 'GIRIS',
      introTitle: 'Kisaca Ben',
      introP1: "Merhaba, ben <span class='text-primary-600 dark:text-primary-400 font-semibold'>Yigit Okur</span>. Isik Universitesi'nde 3. sinif Yazilim Muhendisligi ogrencisiyim ve kurumsal backend, cloud ve otomasyon odakli calisiyorum.",
      introP2: 'NETAS stajimda Java mikroservis platformuna katkida bulundum; YAML ve ELK analiziyle kritik bir timezone uyumsuzlugunu tespit ederek 600+ satir test ile dokumante ettim.',
      introP3: "IsikSchedule, Agentic IDE ve Teknofest Sarkan UAV projelerinde mimari tasarim, algoritma optimizasyonu ve urunlestirme sureclerini yonettim.",
      introP4: "IEEE Isik Ogrenci Kolu'nda baskan yardimciligi ve proje koordinasyonu yaparak 1.100+ ogrenciye ulasan teknik etkinliklerin organizasyonunu surduruyorum.",
      skillsLabel: 'TEKNIK YETKINLIKLER',
      skillsTitle: 'Teknik Yetkinlikler',
      noSkillsData: 'Su an icin yetenek verisi bulunmamaktadir.',
      timelineLabel: 'ZAMAN CIZELGESI',
      timelineTitle: 'Zaman Cizelgesi',
      noTimelineData: 'Bu filtreye uygun kayit bulunamadi.',
      interestsLabel: 'ILGI ALANLARI',
      interestsTitle: 'Ilgi Alanlari',
      githubLabel: 'GITHUB',
      githubTitle: 'GitHub Aktivitem',
      githubBtn: 'GitHub Profilime Goz At',
      ctaTitle: 'Birlikte Calisalim',
      ctaText: 'Yazilim muhendisligi, cloud altyapi, optimizasyon ve AI-native urunler uzerine birlikte uretmek istersen ulasabilirsin.',
      ctaBtn: 'Iletisime Gec',
      loading: 'Yukleniyor...',
      present: 'Gunumuz',
      unknown: 'Bilinmiyor',
      filters: {
        all: 'Tumu',
        education: 'Egitim',
        work: 'Is Deneyimi',
        volunteer: 'Gonulluluk',
        activity: 'Aktiviteler',
        certification: 'Sertifikalar',
        achievement: 'Basarilar'
      },
      hobbies: ['Satranc', 'Gitar', 'Piyano', 'Vokal Egitimi', 'Fitness', 'Yuzme']
    },
    en: {
      pageLabel: 'DOSSIER',
      pageTitle: 'About Me',
      pageSubtitle: 'A software engineering student focused on enterprise backend systems, cloud-native architecture, and DevOps automation.',
      introLabel: 'INTRODUCTION',
      introTitle: 'Briefly About Me',
      introP1: "Hi, I'm <span class='text-primary-600 dark:text-primary-400 font-semibold'>Yigit Okur</span>. I'm a 3rd-year Software Engineering student at Isik University, focusing on enterprise backend, cloud, and automation workflows.",
      introP2: 'During my NETAS internship, I contributed to a Java microservices platform and identified a critical timezone mismatch through YAML and ELK analysis, then documented remediation with 600+ lines of tests.',
      introP3: 'Through IsikSchedule, Agentic IDE, and Teknofest Sarkan UAV, I have worked on architecture, optimization algorithms, and productization.',
      introP4: 'As IEEE Isik Student Branch Vice President and Project Coordinator, I continue organizing high-impact technical events for 1,100+ students.',
      skillsLabel: 'CAPABILITIES',
      skillsTitle: 'Technical Skills',
      noSkillsData: 'No skills data available at the moment.',
      timelineLabel: 'TIMELINE',
      timelineTitle: 'Timeline',
      noTimelineData: 'No records found for this filter.',
      interestsLabel: 'INTERESTS',
      interestsTitle: 'Interests',
      githubLabel: 'GITHUB',
      githubTitle: 'My GitHub Activity',
      githubBtn: 'View My GitHub Profile',
      ctaTitle: "Let's Work Together",
      ctaText: 'If you want to collaborate on software engineering, cloud infrastructure, optimization, or AI-native products, feel free to reach out.',
      ctaBtn: 'Get In Touch',
      loading: 'Loading...',
      present: 'Present',
      unknown: 'Unknown',
      filters: {
        all: 'All',
        education: 'Education',
        work: 'Experience',
        volunteer: 'Volunteer',
        activity: 'Activities',
        certification: 'Certifications',
        achievement: 'Achievements'
      },
      hobbies: ['Chess', 'Guitar', 'Piano', 'Vocal Training', 'Fitness', 'Swimming']
    }
  }

  const currentLang = language === 'en' ? 'en' : 'tr'
  const text = t[currentLang]

  const certifications = [
    { id: 1, type: 'certification' as const, title: currentLang === 'tr' ? 'Cloud ve DevOps Egitim Serisi' : 'Cloud and DevOps Learning Track', organization: currentLang === 'tr' ? 'Udemy / Siber Kulupler Birligi' : 'Udemy / Cyber Clubs Union', date: '2024 - 2025', description: currentLang === 'tr' ? 'Linux for Cloud & DevOps Engineers, Master System Design & Software Architecture, CCNA temelleri ve DevSecOps egitimleri tamamlandi.' : 'Completed Linux for Cloud & DevOps Engineers, Master System Design & Software Architecture, networking fundamentals (CCNA), and DevSecOps trainings.', icon: <FiShield /> },
    { id: 2, type: 'certification' as const, title: currentLang === 'tr' ? 'Complete AI & Machine Learning Bootcamp' : 'Complete AI & Machine Learning Bootcamp', organization: 'Miuul', date: '2024', description: currentLang === 'tr' ? 'Makine ogrenmesi ve AI temellerini uygulamali olarak kapsayan yogun egitim programi.' : 'Intensive hands-on program covering machine learning and AI fundamentals.', icon: <FiDatabase /> },
    { id: 3, type: 'certification' as const, title: currentLang === 'tr' ? 'Master the Coding Interview: Data Structures + Algorithms' : 'Master the Coding Interview: Data Structures + Algorithms', organization: 'Udemy', date: '2025', description: currentLang === 'tr' ? 'Veri yapilari ve algoritma odakli ileri seviye problem cozme egitimi.' : 'Advanced problem-solving training focused on data structures and algorithms.', icon: <FiCpu /> },
    { id: 4, type: 'certification' as const, title: 'TalentCoders TechCamp', organization: 'TalentCoders', date: '2024', description: currentLang === 'tr' ? 'Modern yazilim gelistirme pratikleri odakli teknik kamp.' : 'Technical camp focused on modern software development practices.', icon: <FiCode /> },
    { id: 5, type: 'certification' as const, title: currentLang === 'tr' ? 'Ingilizce C1 Yeterlilik' : 'English C1 Proficiency', organization: currentLang === 'tr' ? 'Cambridge & American Culture Institute' : 'Cambridge & American Culture Institute', date: '2023', description: currentLang === 'tr' ? 'Profesyonel iletisim icin ileri seviye Ingilizce yeterlilik sertifikasi.' : 'Advanced English proficiency certificate for professional communication.', icon: <FiGlobe /> },
    { id: 6, type: 'certification' as const, title: currentLang === 'tr' ? 'Diksiyon ve Etkili Konusma Egitimi' : 'Diction and Effective Public Speaking Training', organization: currentLang === 'tr' ? 'Baskent Iletisim Akademisi' : 'Baskent Communication Academy', date: '2023', description: currentLang === 'tr' ? 'Sahne ve sunum odakli etkili iletisim yetkinligi kazandirildi.' : 'Training focused on effective communication, stage presence, and presentation quality.', icon: <FiBookOpen /> },
    { id: 7, type: 'certification' as const, title: currentLang === 'tr' ? 'Java Programlama Egitimi' : 'Java Programming Training', organization: currentLang === 'tr' ? 'C ve Sistem Programcilari Dernegi' : 'Association of C and System Programmers', date: '2022', description: currentLang === 'tr' ? 'Temel ve orta duzey Java programlama kazanimi.' : 'Foundational and intermediate Java programming training.', icon: <FiTerminal /> },
    { id: 8, type: 'achievement' as const, title: currentLang === 'tr' ? 'FRC Houston Dunya Sampiyonasi Finalisti' : 'FRC Houston World Championship Finalist', organization: 'FIRST Robotics Competition - Team 7840 EMONER', date: '2019', description: currentLang === 'tr' ? 'Team 7840 ile FRC Houston dunya sampiyonasi final asamasina ulasildi.' : 'Reached the world championship finals in FRC Houston with Team 7840.', icon: <FiActivity /> },
    { id: 9, type: 'achievement' as const, title: currentLang === 'tr' ? 'TUBITAK 4009 Arastirma Calismasi' : 'TUBITAK 4009 Research Work', organization: 'TUBITAK', date: '2022 - 2023', description: currentLang === 'tr' ? 'Fizik, optik ve CRISPR-Cas9 odakli arastirma katkilari.' : 'Contributed to research activities focused on physics, optics, and CRISPR-Cas9 technologies.', icon: <FiTarget /> },
    { id: 10, type: 'achievement' as const, title: currentLang === 'tr' ? 'Teknofest Sarkan UAV Butce ve Takim Yonetimi' : 'Teknofest Sarkan UAV Budget and Team Leadership', organization: currentLang === 'tr' ? 'Savronik & TUBITAK Destegi' : 'Savronik & TUBITAK Support', date: '2024 - 2025', description: currentLang === 'tr' ? '165.000 TL TUBITAK Ar-Ge hibesi dahil toplam 200.000 TL proje butcesi yonetildi, anti-jamming telemetri gelistirildi.' : 'Managed a total project budget of 200,000 TL (including a 165,000 TL TUBITAK R&D grant) and led anti-jamming telemetry development.', icon: <FiBriefcase /> },
    { id: 11, type: 'achievement' as const, title: currentLang === 'tr' ? 'IsikSchedule Uretim Olagunlugu' : 'IsikSchedule Production Maturity', organization: 'IsikSchedule', date: '2024 - Present', description: currentLang === 'tr' ? 'Masaustu surumunde ~1.000 aktif kullaniciya ulasan sistem; web urunlestirme ve 13 algoritmali optimizasyon motoru.' : 'Desktop release serving ~1,000 active users, with ongoing web productization and a 13-algorithm optimization engine.', icon: <FiCpu /> },
    { id: 12, type: 'achievement' as const, title: currentLang === 'tr' ? 'Topluluk ve Teknik Aglar' : 'Communities and Technical Networks', organization: currentLang === 'tr' ? 'IEEE AESS, CS, EMBS, RAS, KOK, T3, TJC' : 'IEEE AESS, CS, EMBS, RAS, KOK, T3, TJC', date: '2022 - Present', description: currentLang === 'tr' ? 'Birden fazla teknik toplulukta aktif uye olarak teknik paylasim ve is birligi faaliyetleri surduruluyor.' : 'Active contributor in multiple technical communities and collaborative engineering networks.', icon: <FiUsers /> },
    { id: 13, type: 'achievement' as const, title: currentLang === 'tr' ? 'TEMA ve WWF Gonullulugu' : 'TEMA and WWF Volunteering', organization: currentLang === 'tr' ? 'TEMA Vakfi & WWF Turkiye' : 'TEMA Foundation & WWF Turkiye', date: currentLang === 'tr' ? '2022 - Gunumuz' : '2022 - Present', description: currentLang === 'tr' ? 'Cevre koruma ve farkindalik projelerinde aktif gonulluluk.' : 'Active volunteering for environmental protection and awareness programs.', icon: <FiHeart /> },
    { id: 14, type: 'achievement' as const, title: currentLang === 'tr' ? 'Profesyonel Referanslar (Talep Uzerine)' : 'Professional References (Upon Request)', organization: currentLang === 'tr' ? 'Telekom, Bankacilik Teknolojileri ve Akademi' : 'Telecom, Banking Technology, and Academia', date: '2026', description: currentLang === 'tr' ? 'Referanslar, dogrudan yonetici ve teknik lider rolleri dahil ilgili kurumlar araciligiyla talep uzerine paylasilir.' : 'References are available upon request from supervisory and technical leadership roles across relevant organizations.', icon: <FiAward /> },
  ]

  const timelineItems = [
    ...experiences.map(exp => ({
      ...exp,
      type: exp.experience_type as FilterType,
      displayType: exp.experience_type as FilterType,
      itemDate: exp.end_date || exp.start_date,
      isBackendData: true as const,
    })),
    ...certifications.map(cert => ({
      ...cert,
      displayType: cert.type,
      itemDate: cert.date,
      isBackendData: false as const,
    }))
  ].sort((a, b) => {
    if (a.isBackendData && b.isBackendData) {
      const dateA = new Date(a.itemDate || '').getTime() || 0
      const dateB = new Date(b.itemDate || '').getTime() || 0
      return dateB - dateA
    }
    const yearA = a.isBackendData
      ? new Date(a.itemDate || '').getFullYear()
      : Number.parseInt(a.itemDate?.split('-').pop() || '0', 10)
    const yearB = b.isBackendData
      ? new Date(b.itemDate || '').getFullYear()
      : Number.parseInt(b.itemDate?.split('-').pop() || '0', 10)
    return yearB - yearA
  })

  const filteredItems = filter === 'all'
    ? timelineItems
    : timelineItems.filter(item => item.displayType.toLowerCase() === filter)

  const filterButtons: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: text.filters.all, icon: <FiStar size={14} /> },
    { type: 'education', label: text.filters.education, icon: <FiBookOpen size={14} /> },
    { type: 'work', label: text.filters.work, icon: <FiBriefcase size={14} /> },
    { type: 'volunteer', label: text.filters.volunteer, icon: <FiHeart size={14} /> },
    { type: 'activity', label: text.filters.activity, icon: <FiActivity size={14} /> },
    { type: 'certification', label: text.filters.certification, icon: <FiAward size={14} /> },
    { type: 'achievement', label: text.filters.achievement, icon: <FiTarget size={14} /> },
  ]

  const getBadgeClass = (displayType: string): string => {
    switch (displayType) {
      case 'work': return 'border-primary-400/30 text-primary-600 dark:text-primary-400'
      case 'certification': return 'border-amber-400/30 text-amber-600 dark:text-amber-400'
      case 'education': return 'border-emerald-400/30 text-emerald-600 dark:text-emerald-400'
      case 'volunteer': return 'border-yellow-400/30 text-yellow-600 dark:text-yellow-400'
      default: return 'border-pink-400/30 text-pink-600 dark:text-pink-400'
    }
  }

  const getExperienceYearRange = (experience: any): string => {
    const startDate = experience.start_date ? new Date(experience.start_date) : null
    const endDate = experience.end_date ? new Date(experience.end_date) : null
    const startYear = startDate && !Number.isNaN(startDate.getTime()) ? startDate.getFullYear() : text.unknown
    let endYear: string | number = text.unknown
    if (experience.is_current) endYear = text.present
    else if (endDate && !Number.isNaN(endDate.getTime())) endYear = endDate.getFullYear()
    return `${startYear} – ${endYear}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm text-gray-400 dark:text-dark-400">{text.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="sys-label mb-3 block">// {text.pageLabel}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-2xl">
            {text.pageSubtitle}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20"
        >
          <CornerFrame accent className="p-6 md:p-10">
            <span className="sys-label mb-4 block">// {text.introLabel}</span>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-dark-50 mb-6">{text.introTitle}</h2>
            <div className="space-y-4 text-gray-600 dark:text-dark-300 leading-relaxed">
              <p dangerouslySetInnerHTML={{ __html: text.introP1 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP2 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP3 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP4 }} />
            </div>
          </CornerFrame>
        </motion.section>

        <GlowBar className="mb-20" />

        {/* Skills */}
        <section className="mb-20">
          <SectionHeading index="01" label={text.skillsLabel} title={text.skillsTitle} />

          {skills.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-dark-400 font-mono text-sm py-8">{text.noSkillsData}</p>
          ) : (
            Array.from(new Set(skills.map(s => s.category))).map((category) => {
              const categorySkills = skills.filter(skill => skill.category === category)
              return (
                <div key={category} className="mb-8">
                  <h3 className="font-mono text-xs tracking-wider uppercase text-primary-600 dark:text-primary-400 mb-4 flex items-center gap-2">
                    <span className="w-4 h-px bg-primary-400" aria-hidden="true" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySkills.map((skill) => (
                      <PanelCard key={skill.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 dark:text-dark-100">{skill.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-primary-400/20 text-primary-600 dark:text-primary-400">
                          {skill.proficiency}%
                        </span>
                      </PanelCard>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </section>

        <GlowBar className="mb-20" />

        {/* Timeline */}
        <section className="mb-20">
          <SectionHeading index="02" label={text.timelineLabel} title={text.timelineTitle} />

          <div className="flex flex-wrap gap-2 mb-10">
            {filterButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs tracking-wide transition-all ${
                  filter === btn.type
                    ? 'bg-primary-400 text-dark-950 font-medium'
                    : 'border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 hover:border-primary-400/40 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-dark-400 font-mono text-sm py-8">{text.noTimelineData}</p>
          ) : (
            <div className="relative pl-6 md:pl-8 border-l border-gray-200 dark:border-dark-600">
              <AnimatePresence mode="wait">
                <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {filteredItems.map((item, index) => {
                    const isExperience = 'isBackendData' in item && item.isBackendData
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <span className="absolute -left-[33px] md:-left-[37px] top-3 w-2.5 h-2.5 rounded-full bg-primary-400 border-2 border-white dark:border-dark-950" aria-hidden="true" />

                        <PanelCard>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded border font-mono text-[10px] tracking-wide ${getBadgeClass(item.displayType)}`}>
                              {text.filters[item.displayType as keyof typeof text.filters] || item.displayType}
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 dark:text-dark-400">
                              {isExperience ? getExperienceYearRange(item as any) : (item as any).date}
                            </span>
                          </div>

                          {isExperience ? (
                            <>
                              <h3 className="font-display text-base font-semibold text-gray-900 dark:text-dark-50 mb-1">{(item as any).title}</h3>
                              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">{(item as any).organization}</p>
                              {(item as any).location && <p className="text-xs text-gray-400 dark:text-dark-400 mb-2">📍 {(item as any).location}</p>}
                              {(item as any).description && <p className="text-sm text-gray-600 dark:text-dark-300">{(item as any).description}</p>}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-gray-400 dark:text-dark-400">{(item as any).icon}</span>
                                <h3 className="font-display text-base font-semibold text-gray-900 dark:text-dark-50">{(item as any).title}</h3>
                              </div>
                              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">{(item as any).organization}</p>
                              <p className="text-sm text-gray-600 dark:text-dark-300">{(item as any).description}</p>
                            </>
                          )}
                        </PanelCard>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </section>

        <GlowBar className="mb-20" />

        {/* Interests */}
        <section className="mb-20">
          <SectionHeading index="03" label={text.interestsLabel} title={text.interestsTitle} />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3"
          >
            {text.hobbies.map((hobby) => (
              <motion.div key={hobby} variants={staggerItem}>
                <PanelCard className="text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-200">{hobby}</span>
                </PanelCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <GlowBar className="mb-20" />

        {/* GitHub Stats */}
        <section className="mb-20">
          <SectionHeading index="04" label={text.githubLabel} title={text.githubTitle} />
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <PanelCard className="flex justify-center items-center min-h-[160px]">
              <img
                src={`https://github-readme-stats.vercel.app/api?username=TurkishKEBAB&show_icons=true&theme=transparent&hide_border=true&title_color=00d4ff&icon_color=00d4ff&text_color=8888a8&locale=${currentLang}`}
                alt="GitHub Stats"
                loading="lazy"
                decoding="async"
                className="w-full max-w-md"
              />
            </PanelCard>
            <PanelCard className="flex justify-center items-center min-h-[160px]">
              <img
                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=TurkishKEBAB&layout=compact&theme=transparent&hide_border=true&title_color=00d4ff&text_color=8888a8&locale=${currentLang}`}
                alt="Top Languages"
                loading="lazy"
                decoding="async"
                className="w-full max-w-md"
              />
            </PanelCard>
          </div>

          <PanelCard className="flex justify-center items-center min-h-[140px] mb-6">
            <img
              src={`https://github-readme-streak-stats.herokuapp.com/?user=TurkishKEBAB&theme=transparent&hide_border=true&ring=00d4ff&fire=f0b400&currStreakLabel=00d4ff&sideLabels=8888a8&dates=5a5a80&locale=${currentLang}`}
              alt="GitHub Streak"
              loading="lazy"
              decoding="async"
              className="w-full max-w-2xl"
            />
          </PanelCard>

          <div className="text-center">
            <a
              href="https://github.com/TurkishKEBAB"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <FiGithub size={16} />
              <span>{text.githubBtn}</span>
            </a>
          </div>
        </section>

        <GlowBar className="mb-20" />

        {/* CTA */}
        <CornerFrame accent className="p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-dark-50 mb-4">{text.ctaTitle}</h2>
          <p className="text-gray-600 dark:text-dark-300 mb-8 max-w-2xl mx-auto">{text.ctaText}</p>
          <a href="/contact" className="btn-primary">
            {text.ctaBtn}
          </a>
        </CornerFrame>
      </div>
    </div>
  )
}


