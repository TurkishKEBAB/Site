import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSkills } from '../hooks/useSkills';
import { useExperiences } from '../hooks/useExperiences';
import type { Experience } from '../services/types';
import {
  FiBookOpen, FiShield, FiCode, FiAward, FiGlobe,
  FiCpu, FiTarget, FiUsers, FiActivity, FiBriefcase,
  FiHeart, FiStar, FiTerminal, FiDatabase
} from 'react-icons/fi';
import type { ReactNode } from 'react';

type FilterType = 'all' | 'education' | 'work' | 'volunteer' | 'activity' | 'certification' | 'achievement';

type BackendTimelineItem = Experience & {
  type: FilterType;
  displayType: FilterType;
  itemDate: string | undefined;
  isBackendData: true;
};

type StaticTimelineItem = {
  id: number;
  type: FilterType;
  title: string;
  organization: string;
  date: string;
  description: string;
  icon: ReactNode;
  displayType: FilterType;
  itemDate: string;
  isBackendData: false;
};

type TimelineItem = BackendTimelineItem | StaticTimelineItem;

const t = {
  tr: {
    pageTitle: 'Hakkimda',
    pageSubtitle: 'Enterprise backend sistemleri, cloud-native mimari ve DevOps otomasyonu odaginda ureten bir yazilim muhendisi adayi.',
    introTitle: 'Kisaca Ben',
    introP1: "Merhaba, ben <span class='text-primary-600 dark:text-primary-400 font-semibold'>Yigit Okur</span>. Isik Universitesi'nde 3. sinif Yazilim Muhendisligi ogrencisiyim ve kurumsal backend, cloud ve otomasyon odakli calisiyorum.",
    introP2: 'NETAS stajimda Java mikroservis platformuna katkida bulundum; YAML ve ELK analiziyle kritik bir timezone uyumsuzlugunu tespit ederek 600+ satir test ile dokumante ettim.',
    introP3: "IsikSchedule, Agentic IDE ve Teknofest Sarkan UAV projelerinde mimari tasarim, algoritma optimizasyonu ve urunlestirme sureclerini yonettim.",
    introP4: "IEEE Isik Ogrenci Kolu'nda baskan yardimciligi ve proje koordinasyonu yaparak 1.100+ ogrenciye ulasan teknik etkinliklerin organizasyonunu surduruyorum.",
    skillsTitle: 'Teknik Yetkinlikler',
    noSkillsData: 'Su an icin yetenek verisi bulunmamaktadir.',
    timelineTitle: 'Zaman Cizelgesi',
    noTimelineData: 'Bu filtreye uygun kayit bulunamadi.',
    interestsTitle: 'Ilgi Alanlari',
    githubTitle: 'GitHub Aktivitem',
    githubBtn: 'GitHub Profilime Goz At',
    ctaTitle: 'Birlikte Calisalim',
    ctaText: 'Yazilim muhendisligi, cloud altyapi, optimizasyon ve AI-native urunler uzerine birlikte uretmek istersen ulasabilirsin.',
    ctaBtn: 'Iletisime Gec ->',
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
    pageTitle: 'About Me',
    pageSubtitle: 'A software engineering student focused on enterprise backend systems, cloud-native architecture, and DevOps automation.',
    introTitle: 'Briefly About Me',
    introP1: "Hi, I'm <span class='text-primary-600 dark:text-primary-400 font-semibold'>Yigit Okur</span>. I'm a 3rd-year Software Engineering student at Isik University, focusing on enterprise backend, cloud, and automation workflows.",
    introP2: 'During my NETAS internship, I contributed to a Java microservices platform and identified a critical timezone mismatch through YAML and ELK analysis, then documented remediation with 600+ lines of tests.',
    introP3: 'Through IsikSchedule, Agentic IDE, and Teknofest Sarkan UAV, I have worked on architecture, optimization algorithms, and productization.',
    introP4: 'As IEEE Isik Student Branch Vice President and Project Coordinator, I continue organizing high-impact technical events for 1,100+ students.',
    skillsTitle: 'Technical Skills',
    noSkillsData: 'No skills data available at the moment.',
    timelineTitle: 'Timeline',
    noTimelineData: 'No records found for this filter.',
    interestsTitle: 'Interests',
    githubTitle: 'My GitHub Activity',
    githubBtn: 'View My GitHub Profile',
    ctaTitle: "Let's Work Together",
    ctaText: 'If you want to collaborate on software engineering, cloud infrastructure, optimization, or AI-native products, feel free to reach out.',
    ctaBtn: 'Get In Touch ->',
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
} as const;

export default function About() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { language } = useLanguage();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: skills = [], isLoading: skillsLoading } = useSkills(language);
  const { data: experiencesData, isLoading: experiencesLoading } = useExperiences({ language });
  const experiences = Array.isArray(experiencesData) ? experiencesData : [];
  const loading = skillsLoading || experiencesLoading;

  const currentLang = language === 'en' ? 'en' : 'tr';
  const text = t[currentLang];

  // --- DİNAMİK SERTİFİKALAR ---
  // İçeriklerin de dile göre değişmesi gerekiyor
  const certifications = [
    {
      id: 1,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Cloud ve DevOps Egitim Serisi' : 'Cloud and DevOps Learning Track',
      organization: currentLang === 'tr' ? 'Udemy / Siber Kulupler Birligi' : 'Udemy / Cyber Clubs Union',
      date: currentLang === 'tr' ? '2024 - 2025' : '2024 - 2025',
      description: currentLang === 'tr'
        ? 'Linux for Cloud & DevOps Engineers, Master System Design & Software Architecture, CCNA temelleri ve DevSecOps egitimleri tamamlandi.'
        : 'Completed Linux for Cloud & DevOps Engineers, Master System Design & Software Architecture, networking fundamentals (CCNA), and DevSecOps trainings.',
      icon: <FiShield />,
    },
    {
      id: 2,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Complete AI & Machine Learning Bootcamp' : 'Complete AI & Machine Learning Bootcamp',
      organization: 'Miuul',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Makine ogrenmesi ve AI temellerini uygulamali olarak kapsayan yogun egitim programi.'
        : 'Intensive hands-on program covering machine learning and AI fundamentals.',
      icon: <FiDatabase />,
    },
    {
      id: 3,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Master the Coding Interview: Data Structures + Algorithms' : 'Master the Coding Interview: Data Structures + Algorithms',
      organization: 'Udemy',
      date: '2025',
      description: currentLang === 'tr'
        ? 'Veri yapilari ve algoritma odakli ileri seviye problem cozme egitimi.'
        : 'Advanced problem-solving training focused on data structures and algorithms.',
      icon: <FiCpu />,
    },
    {
      id: 4,
      type: 'certification' as const,
      title: 'TalentCoders TechCamp',
      organization: 'TalentCoders',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Modern yazilim gelistirme pratikleri odakli teknik kamp.'
        : 'Technical camp focused on modern software development practices.',
      icon: <FiCode />,
    },
    {
      id: 5,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Ingilizce C1 Yeterlilik' : 'English C1 Proficiency',
      organization: currentLang === 'tr' ? 'Cambridge & American Culture Institute' : 'Cambridge & American Culture Institute',
      date: '2023',
      description: currentLang === 'tr'
        ? 'Profesyonel iletisim icin ileri seviye Ingilizce yeterlilik sertifikasi.'
        : 'Advanced English proficiency certificate for professional communication.',
      icon: <FiGlobe />,
    },
    {
      id: 6,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Diksiyon ve Etkili Konusma Egitimi' : 'Diction and Effective Public Speaking Training',
      organization: currentLang === 'tr' ? 'Baskent Iletisim Akademisi' : 'Baskent Communication Academy',
      date: '2023',
      description: currentLang === 'tr'
        ? 'Sahne ve sunum odakli etkili iletisim yetkinligi kazandirildi.'
        : 'Training focused on effective communication, stage presence, and presentation quality.',
      icon: <FiBookOpen />,
    },
    {
      id: 7,
      type: 'certification' as const,
      title: currentLang === 'tr' ? 'Java Programlama Egitimi' : 'Java Programming Training',
      organization: currentLang === 'tr' ? 'C ve Sistem Programcilari Dernegi' : 'Association of C and System Programmers',
      date: '2022',
      description: currentLang === 'tr'
        ? 'Temel ve orta duzey Java programlama kazanimi.'
        : 'Foundational and intermediate Java programming training.',
      icon: <FiTerminal />,
    },
    {
      id: 8,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'FRC Houston Dunya Sampiyonasi Finalisti' : 'FRC Houston World Championship Finalist',
      organization: 'FIRST Robotics Competition - Team 7840 EMONER',
      date: '2019',
      description: currentLang === 'tr'
        ? 'Team 7840 ile FRC Houston dunya sampiyonasi final asamasina ulasildi.'
        : 'Reached the world championship finals in FRC Houston with Team 7840.',
      icon: <FiActivity />,
    },
    {
      id: 9,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'TUBITAK 4009 Arastirma Calismasi' : 'TUBITAK 4009 Research Work',
      organization: 'TUBITAK',
      date: '2022 - 2023',
      description: currentLang === 'tr'
        ? 'Fizik, optik ve CRISPR-Cas9 odakli arastirma katkilari.'
        : 'Contributed to research activities focused on physics, optics, and CRISPR-Cas9 technologies.',
      icon: <FiTarget />,
    },
    {
      id: 10,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'Teknofest Sarkan UAV Butce ve Takim Yonetimi' : 'Teknofest Sarkan UAV Budget and Team Leadership',
      organization: currentLang === 'tr' ? 'Savronik & TUBITAK Destegi' : 'Savronik & TUBITAK Support',
      date: '2024 - 2025',
      description: currentLang === 'tr'
        ? '165.000 TL TUBITAK Ar-Ge hibesi dahil toplam 200.000 TL proje butcesi yonetildi, anti-jamming telemetri gelistirildi.'
        : 'Managed a total project budget of 200,000 TL (including a 165,000 TL TUBITAK R&D grant) and led anti-jamming telemetry development.',
      icon: <FiBriefcase />,
    },
    {
      id: 11,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'IsikSchedule Uretim Olagunlugu' : 'IsikSchedule Production Maturity',
      organization: 'IsikSchedule',
      date: '2024 - Present',
      description: currentLang === 'tr'
        ? 'Masaustu surumunde ~1.000 aktif kullaniciya ulasan sistem; web urunlestirme ve 13 algoritmali optimizasyon motoru.'
        : 'Desktop release serving ~1,000 active users, with ongoing web productization and a 13-algorithm optimization engine.',
      icon: <FiCpu />,
    },
    {
      id: 12,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'Topluluk ve Teknik Aglar' : 'Communities and Technical Networks',
      organization: currentLang === 'tr' ? 'IEEE AESS, CS, EMBS, RAS, KOK, T3, TJC' : 'IEEE AESS, CS, EMBS, RAS, KOK, T3, TJC',
      date: '2022 - Present',
      description: currentLang === 'tr'
        ? 'Birden fazla teknik toplulukta aktif uye olarak teknik paylasim ve is birligi faaliyetleri surduruluyor.'
        : 'Active contributor in multiple technical communities and collaborative engineering networks.',
      icon: <FiUsers />,
    },
    {
      id: 13,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'TEMA ve WWF Gonullulugu' : 'TEMA and WWF Volunteering',
      organization: currentLang === 'tr' ? 'TEMA Vakfi & WWF Turkiye' : 'TEMA Foundation & WWF Turkiye',
      date: currentLang === 'tr' ? '2022 - Gunumuz' : '2022 - Present',
      description: currentLang === 'tr'
        ? 'Cevre koruma ve farkindalik projelerinde aktif gonulluluk.'
        : 'Active volunteering for environmental protection and awareness programs.',
      icon: <FiHeart />,
    },
    {
      id: 14,
      type: 'achievement' as const,
      title: currentLang === 'tr' ? 'Profesyonel Referanslar (Talep Uzerine)' : 'Professional References (Upon Request)',
      organization: currentLang === 'tr' ? 'Telekom, Bankacilik Teknolojileri ve Akademi' : 'Telecom, Banking Technology, and Academia',
      date: '2026',
      description: currentLang === 'tr'
        ? 'Referanslar, dogrudan yonetici ve teknik lider rolleri dahil ilgili kurumlar araciligiyla talep uzerine paylasilir.'
        : 'References are available upon request from supervisory and technical leadership roles across relevant organizations.',
      icon: <FiAward />,
    },
  ];

  const timelineItems: TimelineItem[] = [
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
      const dateA = new Date(a.itemDate || '').getTime() || 0;
      const dateB = new Date(b.itemDate || '').getTime() || 0;
      return dateB - dateA;
    }
    const yearA = a.isBackendData
      ? new Date(a.itemDate || '').getFullYear()
      : Number.parseInt(a.itemDate?.split('-').pop() || '0', 10);
    const yearB = b.isBackendData
      ? new Date(b.itemDate || '').getFullYear()
      : Number.parseInt(b.itemDate?.split('-').pop() || '0', 10);
    return yearB - yearA;
  });

  const filteredItems = filter === 'all'
    ? timelineItems
    : timelineItems.filter(item => item.displayType.toLowerCase() === filter);

  const filterButtons: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: text.filters.all, icon: <FiStar /> },
    { type: 'education', label: text.filters.education, icon: <FiBookOpen /> },
    { type: 'work', label: text.filters.work, icon: <FiBriefcase /> },
    { type: 'volunteer', label: text.filters.volunteer, icon: <FiHeart /> },
    { type: 'activity', label: text.filters.activity, icon: <FiActivity /> },
    { type: 'certification', label: text.filters.certification, icon: <FiAward /> },
    { type: 'achievement', label: text.filters.achievement, icon: <FiTarget /> },
  ];

  const getDisplayTypeBadgeClass = (displayType: string): string => {
    switch (displayType) {
      case 'work':
      case 'certification':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-600/30 dark:text-primary-300';
      case 'education':
        return 'bg-green-100 text-green-700 dark:bg-green-600/30 dark:text-green-300';
      case 'volunteer':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600/30 dark:text-yellow-300';
      default:
        return 'bg-pink-100 text-pink-700 dark:bg-pink-600/30 dark:text-pink-300';
    }
  };

  const getExperienceYearRange = (experience: BackendTimelineItem): string => {
    const startDate = experience.start_date ? new Date(experience.start_date) : null;
    const endDate = experience.end_date ? new Date(experience.end_date) : null;
    const startYear = startDate && !Number.isNaN(startDate.getTime()) ? startDate.getFullYear() : text.unknown;

    let endYear: string | number = text.unknown;
    if (experience.is_current) {
      endYear = text.present;
    } else if (endDate && !Number.isNaN(endDate.getTime())) {
      endYear = endDate.getFullYear();
    }

    return `${startYear} - ${endYear}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-900 dark:text-white text-2xl">{text.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 md:pt-10 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {text.pageSubtitle}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-2xl p-8 border border-gray-200 dark:border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{text.introTitle}</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              <p dangerouslySetInnerHTML={{ __html: text.introP1 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP2 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP3 }} />
              <p dangerouslySetInnerHTML={{ __html: text.introP4 }} />
            </div>
          </div>
        </motion.section>

        {/* Skills Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{text.skillsTitle}</h2>

          {skills.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>{text.noSkillsData}</p>
            </div>
          ) : (
            <>
              {Array.from(new Set(skills.map(s => s.category))).map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category);
                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <motion.div
                          key={skill.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-xl p-4 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white font-medium">{skill.name}</span>
                            </div>
                            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.proficiency}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="bg-gradient-to-r from-primary-600 to-pink-600 h-2 rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </motion.section>

        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{text.timelineTitle}</h2>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((btn) => (
              <motion.button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${filter === btn.type
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </motion.button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>{text.noTimelineData}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-pink-300 to-primary-300 dark:from-primary-600 dark:via-pink-500 dark:to-primary-600 transform md:-translate-x-1/2" />
              <AnimatePresence mode="wait">
                <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                  {filteredItems.map((item, index) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: isMobile ? 0 : (index % 2 === 0 ? -50 : 50) }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.5 }}
                          className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full border-4 border-white dark:border-gray-900 z-10"
                        />
                        <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-20 md:pl-0`}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 dark:backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 transition-all shadow-lg dark:shadow-none"
                          >
                            <div className={`flex items-center gap-2 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDisplayTypeBadgeClass(item.displayType)}`}>
                                {text.filters[item.displayType as keyof typeof text.filters] || item.displayType}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {item.isBackendData
                                  ? getExperienceYearRange(item)
                                  : item.date
                                }
                              </span>
                            </div>

                            {item.isBackendData ? (
                              <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">{item.organization}</p>
                                {item.location && <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">📍 {item.location}</p>}
                                {item.description && <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>}
                              </>
                            ) : (
                              <>
                                <div className={`text-3xl text-gray-600 dark:text-gray-300 mb-4 ${index % 2 === 0 ? 'flex justify-end' : 'flex justify-start'}`}>
                                  {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">{item.organization}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                              </>
                            )}
                          </motion.div>
                        </div>
                        <div className="hidden md:block w-1/2" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Interests & Hobbies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{text.interestsTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {text.hobbies.map((hobby) => (
              <motion.div
                key={hobby}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 text-center"
              >
                <span className="text-gray-900 dark:text-white text-lg font-medium">{hobby}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* GitHub Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{text.githubTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 flex justify-center items-center">
              {/* API URL'sine geçerli dili ekliyoruz */}
              <img
                src={`https://github-readme-stats.vercel.app/api?username=TurkishKEBAB&show_icons=true&theme=radical&hide_border=true&bg_color=00000000&locale=${currentLang}`}
                alt="GitHub Stats"
                loading="lazy"
                decoding="async"
                className="w-full max-w-md rounded-lg"
              />
            </div>

            <div className="bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 flex justify-center items-center">
              <img
                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=TurkishKEBAB&layout=compact&theme=radical&hide_border=true&bg_color=00000000&locale=${currentLang}`}
                alt="Top Languages"
                loading="lazy"
                decoding="async"
                className="w-full max-w-md rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 flex justify-center items-center">
            <img
              src={`https://github-readme-streak-stats.herokuapp.com/?user=TurkishKEBAB&theme=radical&hide_border=true&background=00000000&locale=${currentLang}`}
              alt="GitHub Streak"
              loading="lazy"
              decoding="async"
              className="w-full max-w-2xl rounded-lg"
            />
          </div>

          <div className="text-center mt-8">
            <a
              href="https://github.com/TurkishKEBAB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 dark:backdrop-blur-lg text-gray-900 dark:text-white px-6 py-3 rounded-lg border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 transition-all"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{text.githubBtn}</span>
            </a>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-primary-600 to-pink-600 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">{text.ctaTitle}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {text.ctaText}
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {text.ctaBtn}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
