import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { projectService, skillService } from '../services'
import { Project, Skill } from '../services/types'

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [topSkills, setTopSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    loadData()
  }, [language])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectsResponse, skillsData] = await Promise.all([
        projectService.getProjects({ featured_only: true, limit: 3, language }),
        skillService.getSkills(language)
      ])
      
      const projectItems = Array.isArray(projectsResponse.items)
        ? projectsResponse.items
        : []
      setFeaturedProjects(projectItems)
      // Get top 8 skills sorted by proficiency
      const sortedSkills = [...skillsData].sort((a, b) => b.proficiency - a.proficiency).slice(0, 8)
      setTopSkills(sortedSkills)
    } catch (error) {
      console.error('Failed to load data:', error)
      // Keep empty arrays on error
      setFeaturedProjects([])
      setTopSkills([])
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="pt-16 relative">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative z-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-6"
              >
                Hi, I'm{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Yiğit Okur
                </span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-6"
              >
                Cloud & DevOps Engineering Student
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
              >
                Passionate about building scalable cloud infrastructure, automating workflows,
                and leading technical projects. Currently studying Software Engineering at Işık University
                while serving as IEEE Student Branch Vice President. Let's build something amazing together! 🚀
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Link to="/contact" className="btn-primary inline-flex items-center space-x-2">
                  <span>Get in Touch</span>
                  <FiArrowRight />
                </Link>
                <Link to="/projects" className="btn-secondary inline-flex items-center space-x-2">
                  <span>View Projects</span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <a
                  href="https://github.com/TurkishKEBAB"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="p-3 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-primary-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <FiGithub size={24} />
                </a>
                <a
                  href="https://www.linkedin.com/in/yiğit-okur-050b5b278"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="p-3 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-primary-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <FiLinkedin size={24} />
                </a>
                <a
                  href="mailto:yigitokur@ieee.org"
                  aria-label="Send an email"
                  className="p-3 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-primary-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <FiMail size={24} />
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full h-[600px] bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl transform rotate-3 opacity-20"></div>
                <div className="absolute inset-0 w-full h-[600px] bg-gradient-to-tl from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-9xl font-bold opacity-20">YO</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick About Section */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="section-title text-center">About Me</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              I'm a Cloud & DevOps Engineering student at Işık University with hands-on experience in software development,
              system optimization, and technical leadership. Through my work on the Sarkan UAV project and FIRST Robotics Competition,
              I've developed expertise in building reliable systems and leading cross-functional teams. Passionate about cloud infrastructure,
              automation, and creating scalable solutions that drive innovation.
            </p>
            <Link to="/about" className="btn-primary inline-flex items-center space-x-2">
              <span>Learn More About Me</span>
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gray-900/10 relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Skills & Technologies</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Technologies I work with to build scalable and reliable systems
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : topSkills.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No skills data available
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {topSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card text-center hover:shadow-lg transition-shadow"
                >
                  {skill.icon && <div className="text-4xl mb-3">{skill.icon}</div>}
                  <h3 className="font-semibold mb-2">{skill.name}</h3>
                  <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.proficiency}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Featured Projects</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Recent work showcasing my DevOps and development expertise
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No featured projects available
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card group hover:shadow-xl transition-all"
                >
                  {project.cover_image && (
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {project.short_description || project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full text-sm"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/projects" className="btn-primary inline-flex items-center space-x-2">
              <span>View All Projects</span>
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-400">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Birlikte Harika Projeler Geliştirelim</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Yeni projeler, işbirlikleri ve kariyer fırsatları için her zaman açığım
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-medium hover:shadow-xl transform hover:-translate-y-1 transition"
            >
              <span>İletişime Geç</span>
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
