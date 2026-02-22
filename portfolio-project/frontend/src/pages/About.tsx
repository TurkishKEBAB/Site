import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { skillService, experienceService, Skill, Experience } from '../services';

type FilterType = 'all' | 'education' | 'work' | 'volunteer' | 'activity' | 'certification' | 'achievement';

export default function About() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
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

  // Certifications & Achievements from CV
  const certifications = [
    // Certifications
    {
      id: 1,
      type: 'certification' as const,
      title: 'Miuul Machine Learning Bootcamp',
      organization: 'Miuul',
      date: 'July - August 2024',
      description: 'Comprehensive bootcamp covering machine learning fundamentals, supervised/unsupervised learning, deep learning algorithms, and practical implementation with scikit-learn and Python.',
      icon: '🤖'
    },
    {
      id: 2,
      type: 'certification' as const,
      title: 'DevSecOps Certificate',
      organization: 'Professional Training',
      date: '2024',
      description: 'Security-focused DevOps practices, CI/CD security, container security, and secure software development lifecycle.',
      icon: '🔒'
    },
    {
      id: 3,
      type: 'certification' as const,
      title: 'OOP Teaching Certificate',
      organization: 'Işık University',
      date: '2024',
      description: 'Certified teaching assistant for Object-Oriented Programming courses, mentoring students in advanced programming concepts, design patterns, and software architecture.',
      icon: '👨‍🏫'
    },
    {
      id: 4,
      type: 'certification' as const,
      title: 'TalentCoders TechCamp',
      organization: 'TalentCoders',
      date: '2024',
      description: 'Intensive programming bootcamp focused on modern software development practices and technologies.',
      icon: '💻'
    },
    {
      id: 5,
      type: 'certification' as const,
      title: 'C1 English Proficiency Certificate',
      organization: 'Amerikan Kültür',
      date: '2023',
      description: 'Advanced English language proficiency certification demonstrating professional fluency.',
      icon: '🗣️'
    },
    {
      id: 6,
      type: 'certification' as const,
      title: 'Cambridge International Education Certificate',
      organization: 'Cambridge',
      date: '2023',
      description: 'International English language certification recognized globally.',
      icon: '📚'
    },
    {
      id: 7,
      type: 'certification' as const,
      title: 'Programlamaya Giriş (Introduction to Programming)',
      organization: 'C ve Sistem Programcıları Derneği',
      date: '2022',
      description: 'Foundational programming concepts and C programming language certification.',
      icon: '⌨️'
    },
    
    // Achievements
    {
      id: 8,
      type: 'achievement' as const,
      title: 'TÜBİTAK 2209-A Research Grant',
      organization: 'TÜBİTAK',
      date: '2024',
      description: 'Awarded ₺65,000 research grant for Sarkan UAV project development focusing on anti-jamming communication systems for UAV telemetry and control.',
      icon: '💰'
    },
    {
      id: 9,
      type: 'achievement' as const,
      title: 'Savronik Corporate Sponsorship',
      organization: 'Savronik Defense Industry',
      date: '2024',
      description: 'Secured major corporate sponsorship for Sarkan UAV project, contributing to ₺200,000 (~$6,000) total project budget.',
      icon: '🚁'
    },
    {
      id: 10,
      type: 'achievement' as const,
      title: 'IEEEXtreme 18.0 Competition Participant',
      organization: 'IEEE',
      date: 'October 2024',
      description: '24-hour global programming competition focusing on algorithms, data structures, and competitive problem-solving.',
      icon: '🏆'
    },
    {
      id: 11,
      type: 'achievement' as const,
      title: 'FRC Competition Experience',
      organization: 'FIRST Robotics - Team EMONER 7840',
      date: '2019 - 2023',
      description: '4 years of competitive robotics experience developing autonomous systems, robot control software, and participating in international competitions.',
      icon: '🤖'
    },
    {
      id: 12,
      type: 'achievement' as const,
      title: 'AI & Technology Academy Hackathon',
      organization: 'EHS Hackathon 2023',
      date: '2023',
      description: 'Participated in AI-focused hackathon developing innovative technology solutions.',
      icon: '🚀'
    },
    {
      id: 13,
      type: 'achievement' as const,
      title: 'TEMA & WWF Volunteering',
      organization: 'TEMA Foundation & WWF Turkey',
      date: '2022 - Present',
      description: 'Active volunteer in environmental protection, reforestation projects, and wildlife conservation programs.',
      icon: '🌲'
    },
    {
      id: 14,
      type: 'achievement' as const,
      title: 'IEEE Technical Workshops',
      organization: 'Işık University IEEE Student Branch',
      date: '2023 - 2024',
      description: 'Organized and participated in 35+ technical workshops covering software development, cloud computing, and emerging technologies.',
      icon: '🎓'
    }
  ];

  // Combined timeline items (experiences + certifications)
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
    // Sort by date (newest first)
    // For backend data, use actual dates
    if (a.isBackendData && b.isBackendData) {
      const dateA = new Date(a.itemDate || '').getTime() || 0;
      const dateB = new Date(b.itemDate || '').getTime() || 0;
      return dateB - dateA;
    }
    // For certifications, try to parse year from date string
    const yearA = a.isBackendData ? new Date(a.itemDate || '').getFullYear() : parseInt(a.itemDate?.split('-').pop() || '0');
    const yearB = b.isBackendData ? new Date(b.itemDate || '').getFullYear() : parseInt(b.itemDate?.split('-').pop() || '0');
    return yearB - yearA;
  });

  // Filter timeline items
  const filteredItems = filter === 'all' 
    ? timelineItems 
    : timelineItems.filter(item => item.displayType.toLowerCase() === filter);

  const filterButtons: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'All', icon: '📋' },
    { type: 'education', label: 'Education', icon: '🎓' },
    { type: 'work', label: 'Work', icon: '💼' },
    { type: 'volunteer', label: 'Volunteer', icon: '🤝' },
    { type: 'activity', label: 'Activities', icon: '🎯' },
    { type: 'certification', label: 'Certifications', icon: '📜' },
    { type: 'achievement', label: 'Achievements', icon: '🏆' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-2xl">Loading...</div>
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
            About <span className="text-primary-400">Me</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cloud & DevOps Engineering student passionate about UAV systems, robotics, and building scalable solutions
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
            <h2 className="text-3xl font-bold text-white mb-6">Introduction</h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                👋 Hi! I'm <span className="text-primary-400 font-semibold">Yiğit Okur</span>, a passionate Cloud & DevOps Engineering student
                with a strong foundation in software development and systems design.
              </p>
              <p>
                🚀 My experience ranges from developing automation and integration tools to leading technical projects that bridge
                hardware and software systems. Through my involvement in the <strong>FIRST Robotics Competition (FRC)</strong>, I gained hands-on 
                experience in system optimization, teamwork under pressure, and technical leadership.
              </p>
              <p>
                💻 Skilled in <strong>Java</strong>, <strong>C++</strong>, <strong>C#</strong>, <strong>Python</strong>, and <strong>R</strong>, 
                and experienced with Git/GitHub workflows, I am eager to contribute to cloud-based infrastructure, CI/CD pipelines, 
                and scalable system architectures.
              </p>
              <p>
                🎯 I am particularly interested in how companies drive digital transformation through innovative cloud and communication technologies,
                and I aim to be part of that evolution. Currently pursuing my Bachelor of Software Engineering at <strong>Işık University</strong>,
                where I serve as Vice President of the IEEE Student Branch and work as a Student Assistant in the CSE Department.
              </p>
              <p>
                🌍 Beyond academics, I lead the <strong>Sarkan UAV</strong> project (secured ₺200,000 funding), organize technical events,
                and actively contribute to open-source communities including <strong>Türkiye Teknoloji Takımı</strong> and <strong>Türkiye Java Community</strong>.
              </p>
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Technical Skills</h2>
          
          {skills.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>No skills data available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Group skills by category */}
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
                              {skill.icon && <span className="text-2xl">{skill.icon}</span>}
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

        {/* Experience Timeline with Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">My Journey</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((btn) => (
              <motion.button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === btn.type
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </motion.button>
            ))}
          </div>

          {/* Timeline */}
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>No items found for this filter.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 via-pink-500 to-primary-600 transform md:-translate-x-1/2" />

              {/* Timeline Items */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={filter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {filteredItems.map((item, index) => {
                    const isExperience = 'isBackendData' in item && item.isBackendData;
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex items-center ${
                          index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                        } flex-col md:gap-8`}
                      >
                        {/* Timeline Dot */}
                        <motion.div 
                          whileHover={{ scale: 1.5 }}
                          className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full border-4 border-gray-900 z-10 shadow-lg shadow-primary-500/50" 
                        />

                        {/* Content Card */}
                        <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-20 md:pl-0`}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-primary-500/50 transition-all shadow-xl"
                          >
                            {/* Badge & Date */}
                            <div className={`flex items-center gap-2 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.displayType === 'work' ? 'bg-primary-600/30 text-primary-300' :
                                item.displayType === 'education' ? 'bg-green-600/30 text-green-300' :
                                item.displayType === 'volunteer' ? 'bg-yellow-600/30 text-yellow-300' :
                                item.displayType === 'certification' ? 'bg-primary-600/30 text-primary-300' :
                                'bg-pink-600/30 text-pink-300'
                              }`}>
                                {item.displayType.charAt(0).toUpperCase() + item.displayType.slice(1)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {isExperience 
                                  ? (() => {
                                      const exp = item as any;
                                      const startDate = exp.start_date ? new Date(exp.start_date) : null;
                                      const endDate = exp.end_date ? new Date(exp.end_date) : null;
                                      const startYear = startDate && !isNaN(startDate.getTime()) ? startDate.getFullYear() : 'N/A';
                                      const endYear = exp.is_current ? 'Present' : (endDate && !isNaN(endDate.getTime()) ? endDate.getFullYear() : 'N/A');
                                      return `${startYear} - ${endYear}`;
                                    })()
                                  : (item as any).date
                                }
                              </span>
                            </div>

                            {/* Title & Organization */}
                            {isExperience ? (
                              <>
                                <h3 className="text-xl font-bold text-white mb-1">{(item as any).title}</h3>
                                <p className="text-primary-400 font-medium mb-1">{(item as any).organization}</p>
                                {(item as any).location && <p className="text-gray-400 text-sm mb-3">📍 {(item as any).location}</p>}
                                {(item as any).description && <p className="text-gray-300 mb-3">{(item as any).description}</p>}
                              </>
                            ) : (
                              <>
                                <div className={`text-4xl mb-3 ${index % 2 === 0 ? 'md:text-right' : ''}`}>{(item as any).icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{(item as any).title}</h3>
                                <p className="text-primary-400 font-medium mb-2">{(item as any).organization}</p>
                                <p className="text-gray-300 text-sm">{(item as any).description}</p>
                              </>
                            )}
                          </motion.div>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="hidden md:block w-1/2" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Certifications section removed - now in timeline */}

        {/* Interests & Hobbies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Interests & Hobbies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              '✍️ Poetry Writing',
              '🎬 Series & Cinema',
              '🎸 Guitar & Piano',
              '🌲 Environmental Activism',
              '🏊 Swimming & Fitness',
              '♟️ Chess & Strategy Games',
              '🎼 Anatolian Rock',
              '🧩 Sudoku & Puzzles'
            ].map((hobby) => (
              <motion.div
                key={hobby}
                whileHover={{ scale: 1.1, rotate: 5 }}
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">GitHub Activity</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* GitHub Stats Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <img 
                src="https://github-readme-stats.vercel.app/api?username=TurkishKEBAB&show_icons=true&theme=radical&hide_border=true&bg_color=00000000" 
                alt="GitHub Stats"
                className="w-full rounded-lg"
              />
            </div>
            
            {/* Top Languages */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <img 
                src="https://github-readme-stats.vercel.app/api/top-langs/?username=TurkishKEBAB&layout=compact&theme=radical&hide_border=true&bg_color=00000000" 
                alt="Top Languages"
                className="w-full rounded-lg"
              />
            </div>
          </div>
          
          {/* GitHub Streak */}
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <img 
              src="https://github-readme-streak-stats.herokuapp.com/?user=TurkishKEBAB&theme=radical&hide_border=true&background=00000000" 
              alt="GitHub Streak"
              className="w-full rounded-lg"
            />
          </div>

          {/* GitHub Profile Link */}
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
              <span className="font-medium">View GitHub Profile</span>
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
          <h2 className="text-3xl font-bold text-white mb-4">Let's Work Together!</h2>
          <p className="text-xl text-white/90 mb-8">
            I'm always open to new opportunities and collaborations
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get In Touch →
          </a>
        </motion.div>
      </div>
    </div>
  );
}

