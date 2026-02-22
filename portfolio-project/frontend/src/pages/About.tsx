import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { skillService, experienceService, Skill, Experience } from '../services';
import {
  FiBookOpen, FiShield, FiCode, FiAward, FiGlobe,
  FiCpu, FiTarget, FiUsers, FiActivity, FiBriefcase,
  FiHeart, FiStar, FiTerminal, FiDatabase
} from 'react-icons/fi';

type FilterType = 'all' | 'education' | 'work' | 'volunteer' | 'activity' | 'certification' | 'achievement';

export default function About() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  // Zaten projenizde olan LanguageContext'i kullanıyoruz.
  // language değişkeninin 'tr' veya 'en' döndüğünü varsayıyoruz.
  const { language } = useLanguage();

  useEffect(() => {
    loadData();
  }, [language]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsData, experiencesData] = await Promise.all([
        skillService.getSkills(language),
        experienceService.getExperiences({ language })
      ]);
      setSkills(skillsData);
      setExperiences(Array.isArray(experiencesData) ? experiencesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setSkills([]);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  // --- DİL OBJELERİ (TRANSLATIONS) ---
  // Metinleri ayrı dosyalara (örn: locales/tr.ts) taşıyıp buraya import edersen kodun daha temiz kalır.
  const t = {
    tr: {
      pageTitle: "Hakkımda",
      pageSubtitle: "Ölçeklenebilir sistemler, bulut mimarileri ve DevOps süreçleri inşa etme tutkusuyla çalışan bir yazılım mühendisi adayı.",
      introTitle: "Kısaca Ben",
      introP1: "Merhaba, ben <span class='text-primary-400 font-semibold'>Yiğit Okur</span>. Işık Üniversitesi Yazılım Mühendisliği 3. sınıf öğrencisi olarak eğitimime devam ediyor; bulut bilişim, DevOps ve yazılım mimarileri alanlarında kendimi geliştiriyorum.",
      introP2: "Netaş'taki staj deneyimim, C# ve .NET ekosistemindeki çalışmalarım ve profesörümle yürüttüğüm <strong>\"Agentic IDE\"</strong> gibi akademik projelerim sayesinde teorik algoritmik bilgimi güçlü pratik uygulamalara dönüştürüyorum. Temel hedefim, modern otomasyon süreçleri kurmak ve sürdürülebilir altyapılar tasarlamak.",
      introP3: "Yazılımın yanı sıra donanım ve otonom sistemlere de büyük bir ilgi duyuyorum. Savronik ve TÜBİTAK destekli, bütçesi 200.000 TL'ye ulaşan <strong>Sarkan İHA</strong> projesinin liderliğini yürütüyorum. Bu projede, FIRST Robotics Competition (FRC) geçmişimden edindiğim sistem optimizasyonu, kriz yönetimi ve teknik liderlik tecrübelerimi doğrudan sahaya yansıtıyorum.",
      introP4: "Akademik ve teknik projelerimin dışında, Işık Üniversitesi <strong>IEEE Öğrenci Kolu Başkan Yardımcısı ve Sponsorluk Yöneticisi</strong> olarak teknoloji ekosistemine katkı sağlıyor, teknik etkinlikler düzenliyorum. Gelecekte şirketlerin dijital dönüşüm süreçlerinde güvenilir altyapılar kurarak kalıcı değerler yaratmayı hedefliyorum.",
      skillsTitle: "Teknik Yetkinlikler",
      noSkillsData: "Şu an için yetenek verisi bulunmamaktadır.",
      timelineTitle: "Zaman Çizelgesi",
      noTimelineData: "Bu filtreye uygun kayıt bulunamadı.",
      interestsTitle: "İlgi Alanları ve Hobiler",
      githubTitle: "GitHub Aktivitem",
      githubBtn: "GitHub Profilime Göz At",
      ctaTitle: "Birlikte Çalışalım",
      ctaText: "Yeni teknolojiler üzerine konuşmak, açık kaynak bir projeye katkı sağlamak veya DevOps süreçleriyle ilgili fikir alışverişi yapmak istersen bana her zaman ulaşabilirsin.",
      ctaBtn: "İletişime Geç →",
      loading: "Yükleniyor...",
      present: "Günümüz",
      unknown: "Bilinmiyor",
      filters: {
        all: "Tümü", education: "Eğitim", work: "İş Deneyimi", volunteer: "Gönüllülük", activity: "Aktiviteler", certification: "Sertifikalar", achievement: "Başarılar"
      },
      hobbies: ['Şiir Yazmak', 'Sinema ve Dizi', 'Gitar ve Piyano', 'Çevre Gönüllülüğü', 'Yüzme ve Fitness', 'Satranç ve Strateji', 'Anadolu Rock', 'Sudoku ve Bulmacalar']
    },
    en: {
      pageTitle: "About Me",
      pageSubtitle: "A software engineering student passionate about building scalable systems, cloud architectures, and DevOps pipelines.",
      introTitle: "Briefly About Me",
      introP1: "Hi, I'm <span class='text-primary-400 font-semibold'>Yiğit Okur</span>. I'm currently a 3rd-year Software Engineering student at Işık University, constantly improving myself in cloud computing, DevOps, and software architectures.",
      introP2: "Through my internship at Netaş, my work in the C#/.NET ecosystem, and academic projects like the <strong>\"Agentic IDE\"</strong> developed with my professor, I translate theoretical algorithmic knowledge into strong practical applications. My main goal is to build modern automation pipelines and design sustainable infrastructures.",
      introP3: "Beyond software, I have a deep interest in hardware and autonomous systems. I am currently leading the <strong>Sarkan UAV</strong> project, which is supported by Savronik and TÜBİTAK with a budget reaching ₺200,000. In this project, I directly apply the system optimization, crisis management, and technical leadership skills I gained from my FIRST Robotics Competition (FRC) background.",
      introP4: "Outside of academic and technical projects, I contribute to the technology ecosystem as the <strong>Vice President and Sponsorship Manager of the Işık University IEEE Student Branch</strong> by organizing technical events. In the future, I aim to create lasting value by building reliable infrastructures in companies' digital transformation processes.",
      skillsTitle: "Technical Skills",
      noSkillsData: "No skills data available at the moment.",
      timelineTitle: "Timeline",
      noTimelineData: "No records found for this filter.",
      interestsTitle: "Interests & Hobbies",
      githubTitle: "My GitHub Activity",
      githubBtn: "View My GitHub Profile",
      ctaTitle: "Let's Work Together",
      ctaText: "If you want to talk about new technologies, contribute to an open-source project, or exchange ideas about DevOps processes, you can always reach out to me.",
      ctaBtn: "Get In Touch →",
      loading: "Loading...",
      present: "Present",
      unknown: "Unknown",
      filters: {
        all: "All", education: "Education", work: "Experience", volunteer: "Volunteer", activity: "Activities", certification: "Certifications", achievement: "Achievements"
      },
      hobbies: ['Poetry Writing', 'Cinema & Series', 'Guitar & Piano', 'Environmental Volunteer', 'Swimming & Fitness', 'Chess & Strategy', 'Anatolian Rock', 'Sudoku & Puzzles']
    }
  };

  // Geçerli dil metinlerini bir değişkene atıyoruz (default 'tr' veya 'en')
  const currentLang = language === 'en' ? 'en' : 'tr';
  const text = t[currentLang];

  // --- DİNAMİK SERTİFİKALAR ---
  // İçeriklerin de dile göre değişmesi gerekiyor
  const certifications = [
    {
      id: 1, type: 'certification' as const,
      title: currentLang === 'tr' ? 'Miuul Makine Öğrenmesi Bootcamp' : 'Miuul Machine Learning Bootcamp',
      organization: 'Miuul',
      date: currentLang === 'tr' ? 'Temmuz - Ağustos 2024' : 'July - August 2024',
      description: currentLang === 'tr'
        ? 'Makine öğrenmesi temelleri, gözetimli/gözetimsiz öğrenme, derin öğrenme algoritmaları ve scikit-learn ile Python tabanlı pratik uygulamaları kapsayan yoğun eğitim programı.'
        : 'Intensive bootcamp covering machine learning fundamentals, supervised/unsupervised learning, deep learning algorithms, and practical applications with scikit-learn and Python.',
      icon: <FiDatabase />
    },
    {
      id: 2, type: 'certification' as const,
      title: currentLang === 'tr' ? 'DevSecOps Sertifikası' : 'DevSecOps Certificate',
      organization: currentLang === 'tr' ? 'Profesyonel Eğitim' : 'Professional Training',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Güvenlik odaklı DevOps pratikleri, CI/CD güvenliği, konteyner güvenliği ve güvenli yazılım geliştirme yaşam döngüsü (SDLC).'
        : 'Security-focused DevOps practices, CI/CD security, container security, and secure software development lifecycle (SDLC).',
      icon: <FiShield />
    },
    {
      id: 3, type: 'certification' as const,
      title: currentLang === 'tr' ? 'Nesne Yönelimli Programlama (OOP) Öğretim Asistanlığı' : 'OOP Teaching Assistantship',
      organization: currentLang === 'tr' ? 'Işık Üniversitesi' : 'Işık University',
      date: '2024',
      description: currentLang === 'tr'
        ? 'OOP dersleri için öğretim asistanlığı; öğrencilere ileri düzey programlama konseptleri, tasarım desenleri ve yazılım mimarisi konularında mentörlük.'
        : 'Teaching assistant for OOP courses; mentoring students in advanced programming concepts, design patterns, and software architecture.',
      icon: <FiBookOpen />
    },
    {
      id: 4, type: 'certification' as const,
      title: 'TalentCoders TechCamp',
      organization: 'TalentCoders',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Modern yazılım geliştirme pratikleri ve güncel teknolojiler üzerine odaklanan yoğun programlama kampı.'
        : 'Intensive programming bootcamp focused on modern software development practices and current technologies.',
      icon: <FiCode />
    },
    {
      id: 5, type: 'certification' as const,
      title: currentLang === 'tr' ? 'C1 İngilizce Yetkinlik Sertifikası' : 'C1 English Proficiency Certificate',
      organization: currentLang === 'tr' ? 'Amerikan Kültür' : 'American Culture Association',
      date: '2023',
      description: currentLang === 'tr'
        ? 'Profesyonel iş hayatında akıcılığı belgeleyen ileri düzey İngilizce yetkinlik sertifikası.'
        : 'Advanced English proficiency certificate demonstrating fluency in professional business life.',
      icon: <FiGlobe />
    },
    {
      id: 6, type: 'certification' as const,
      title: currentLang === 'tr' ? 'Cambridge Uluslararası Eğitim Sertifikası' : 'Cambridge International Education Certificate',
      organization: 'Cambridge',
      date: '2023',
      description: currentLang === 'tr'
        ? 'Küresel çapta tanınan uluslararası İngilizce dil sertifikası.'
        : 'Globally recognized international English language certificate.',
      icon: <FiAward />
    },
    {
      id: 7, type: 'certification' as const,
      title: currentLang === 'tr' ? 'Programlamaya Giriş ve C' : 'Introduction to Programming and C',
      organization: currentLang === 'tr' ? 'C ve Sistem Programcıları Derneği' : 'Association of C and System Programmers',
      date: '2022',
      description: currentLang === 'tr'
        ? 'Temel programlama konseptleri, algoritmik düşünce yapısı ve C programlama dili yetkinliği.'
        : 'Fundamental programming concepts, algorithmic thinking, and C programming language proficiency.',
      icon: <FiTerminal />
    },
    {
      id: 8, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'TÜBİTAK 2209-A Araştırma Projesi Hibesi' : 'TÜBİTAK 2209-A Research Grant',
      organization: 'TÜBİTAK',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Sarkan İHA projesinde kullanılmak üzere, İHA telemetri ve kontrol sistemleri için anti-jamming iletişim altyapısı geliştirmeye yönelik 65.000 TL araştırma hibesi.'
        : '₺65,000 research grant to develop an anti-jamming communication infrastructure for UAV telemetry and control systems, used in the Sarkan UAV project.',
      icon: <FiTarget />
    },
    {
      id: 9, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'Savronik Kurumsal Ana Sponsorluğu' : 'Savronik Corporate Main Sponsorship',
      organization: currentLang === 'tr' ? 'Savronik Savunma Sanayii' : 'Savronik Defense Industry',
      date: '2024',
      description: currentLang === 'tr'
        ? 'Sarkan İHA projesi için toplamda 200.000 TL bütçe hedefine ulaşılmasını sağlayan ana kurumsal sponsorluk anlaşmasının yönetimi.'
        : 'Management of the main corporate sponsorship agreement that enabled the Sarkan UAV project to reach its ₺200,000 budget goal.',
      icon: <FiBriefcase />
    },
    {
      id: 10, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'IEEEXtreme 18.0 Yarışmacısı' : 'IEEEXtreme 18.0 Competitor',
      organization: 'IEEE',
      date: currentLang === 'tr' ? 'Ekim 2024' : 'October 2024',
      description: currentLang === 'tr'
        ? 'Algoritmalar, veri yapıları ve rekabetçi problem çözme üzerine odaklanan 24 saatlik küresel programlama yarışması katılımı.'
        : 'Participation in a 24-hour global programming competition focusing on algorithms, data structures, and competitive problem solving.',
      icon: <FiCpu />
    },
    {
      id: 11, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'FIRST Robotics Competition (FRC) Deneyimi' : 'FIRST Robotics Competition (FRC) Experience',
      organization: 'Team EMONER 7840',
      date: '2019 - 2023',
      description: currentLang === 'tr'
        ? 'Otonom sistemler, robot kontrol yazılımları geliştirme ve uluslararası yarışmalarda sistem optimizasyonu üzerine 4 yıllık rekabetçi robotik tecrübesi.'
        : '4 years of competitive robotics experience developing autonomous systems, robot control software, and optimizing systems in international competitions.',
      icon: <FiActivity />
    },
    {
      id: 12, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'Yapay Zeka ve Teknoloji Akademisi Hackathonu' : 'AI and Tech Academy Hackathon',
      organization: 'EHS Hackathon 2023',
      date: '2023',
      description: currentLang === 'tr'
        ? 'Yenilikçi teknoloji çözümleri geliştirmeye yönelik yapay zeka odaklı hackathon katılımı.'
        : 'Participation in an AI-focused hackathon aimed at developing innovative technology solutions.',
      icon: <FiCode />
    },
    {
      id: 13, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'TEMA ve WWF Gönüllülüğü' : 'TEMA and WWF Volunteering',
      organization: currentLang === 'tr' ? 'TEMA Vakfı & WWF Türkiye' : 'TEMA Foundation & WWF Turkey',
      date: currentLang === 'tr' ? '2022 - Günümüz' : '2022 - Present',
      description: currentLang === 'tr'
        ? 'Çevre koruma, ağaçlandırma projeleri ve yaban hayatını koruma programlarında aktif gönüllülük.'
        : 'Active volunteering in environmental protection, reforestation projects, and wildlife conservation programs.',
      icon: <FiHeart />
    },
    {
      id: 14, type: 'achievement' as const,
      title: currentLang === 'tr' ? 'IEEE Teknik Eğitimler ve Organizasyon' : 'IEEE Technical Training & Organization',
      organization: currentLang === 'tr' ? 'Işık Üniversitesi IEEE Öğrenci Kolu' : 'Işık University IEEE Student Branch',
      date: '2023 - 2024',
      description: currentLang === 'tr'
        ? 'Yazılım geliştirme, bulut bilişim ve yeni nesil teknolojileri kapsayan 35\'ten fazla teknik etkinlik ve workshop organizasyonu.'
        : 'Organized over 35 technical events and workshops covering software development, cloud computing, and next-generation technologies.',
      icon: <FiUsers />
    }
  ];

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
      const dateA = new Date(a.itemDate || '').getTime() || 0;
      const dateB = new Date(b.itemDate || '').getTime() || 0;
      return dateB - dateA;
    }
    const yearA = a.isBackendData ? new Date(a.itemDate || '').getFullYear() : parseInt(a.itemDate?.split('-').pop() || '0');
    const yearB = b.isBackendData ? new Date(b.itemDate || '').getFullYear() : parseInt(b.itemDate?.split('-').pop() || '0');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-2xl">{text.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">{text.introTitle}</h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{text.skillsTitle}</h2>

          {skills.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>{text.noSkillsData}</p>
            </div>
          ) : (
            <>
              {Array.from(new Set(skills.map(s => s.category))).map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category);
                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-semibold text-primary-400 mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <motion.div
                          key={skill.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-primary-500/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{skill.name}</span>
                            </div>
                            <span className="text-primary-400 text-sm font-semibold">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{text.timelineTitle}</h2>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((btn) => (
              <motion.button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${filter === btn.type
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </motion.button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>{text.noTimelineData}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 via-pink-500 to-primary-600 transform md:-translate-x-1/2" />
              <AnimatePresence mode="wait">
                <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                  {filteredItems.map((item, index) => {
                    const isExperience = 'isBackendData' in item && item.isBackendData;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.5 }}
                          className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full border-4 border-gray-900 z-10 shadow-lg shadow-primary-500/50"
                        />
                        <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-20 md:pl-0`}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-primary-500/50 transition-all shadow-xl"
                          >
                            <div className={`flex items-center gap-2 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.displayType === 'work' ? 'bg-primary-600/30 text-primary-300' :
                                  item.displayType === 'education' ? 'bg-green-600/30 text-green-300' :
                                    item.displayType === 'volunteer' ? 'bg-yellow-600/30 text-yellow-300' :
                                      item.displayType === 'certification' ? 'bg-primary-600/30 text-primary-300' :
                                        'bg-pink-600/30 text-pink-300'
                                }`}>
                                {text.filters[item.displayType as keyof typeof text.filters] || item.displayType}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {isExperience
                                  ? (() => {
                                    const exp = item as any;
                                    const startDate = exp.start_date ? new Date(exp.start_date) : null;
                                    const endDate = exp.end_date ? new Date(exp.end_date) : null;
                                    const startYear = startDate && !isNaN(startDate.getTime()) ? startDate.getFullYear() : text.unknown;
                                    const endYear = exp.is_current ? text.present : (endDate && !isNaN(endDate.getTime()) ? endDate.getFullYear() : text.unknown);
                                    return `${startYear} - ${endYear}`;
                                  })()
                                  : (item as any).date
                                }
                              </span>
                            </div>

                            {isExperience ? (
                              <>
                                <h3 className="text-xl font-bold text-white mb-1">{(item as any).title}</h3>
                                <p className="text-primary-400 font-medium mb-1">{(item as any).organization}</p>
                                {(item as any).location && <p className="text-gray-400 text-sm mb-3">📍 {(item as any).location}</p>}
                                {(item as any).description && <p className="text-gray-300 mb-3">{(item as any).description}</p>}
                              </>
                            ) : (
                              <>
                                <div className={`text-3xl text-gray-300 mb-4 ${index % 2 === 0 ? 'flex justify-end' : 'flex justify-start'}`}>
                                  {(item as any).icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{(item as any).title}</h3>
                                <p className="text-primary-400 font-medium mb-2">{(item as any).organization}</p>
                                <p className="text-gray-300 text-sm">{(item as any).description}</p>
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{text.interestsTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {text.hobbies.map((hobby) => (
              <motion.div
                key={hobby}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
              >
                <span className="text-white text-lg font-medium">{hobby}</span>
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{text.githubTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 flex justify-center items-center">
              {/* API URL'sine geçerli dili ekliyoruz */}
              <img
                src={`https://github-readme-stats.vercel.app/api?username=TurkishKEBAB&show_icons=true&theme=radical&hide_border=true&bg_color=00000000&locale=${currentLang}`}
                alt="GitHub Stats"
                className="w-full max-w-md rounded-lg"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 flex justify-center items-center">
              <img
                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=TurkishKEBAB&layout=compact&theme=radical&hide_border=true&bg_color=00000000&locale=${currentLang}`}
                alt="Top Languages"
                className="w-full max-w-md rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 flex justify-center items-center">
            <img
              src={`https://github-readme-streak-stats.herokuapp.com/?user=TurkishKEBAB&theme=radical&hide_border=true&background=00000000&locale=${currentLang}`}
              alt="GitHub Streak"
              className="w-full max-w-2xl rounded-lg"
            />
          </div>

          <div className="text-center mt-8">
            <a
              href="https://github.com/TurkishKEBAB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-lg border border-white/20 hover:border-primary-500/50 transition-all"
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
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {text.ctaBtn}
          </a>
        </motion.div>
      </div>
    </div>
  );
}