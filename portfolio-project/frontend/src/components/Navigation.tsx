import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGlobe, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'

import { Language, useLanguage } from '../contexts/LanguageContext'

const languages: Array<{ code: Language; name: string; label: string }> = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'tr', name: 'Türkçe', label: 'TR' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()

  const navItems = [
    { key: 'nav_home', path: '/' },
    { key: 'nav_about', path: '/about' },
    { key: 'nav_projects', path: '/projects' },
    { key: 'nav_blog', path: '/blog' },
    { key: 'nav_contact', path: '/contact' },
  ]

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) setIsDark(event.newValue === 'dark')
      if (event.key === 'lang' && (event.newValue === 'en' || event.newValue === 'tr')) {
        setLanguage(event.newValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [setLanguage])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setShowLangMenu(false)
  }, [location.pathname])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-dark-600/40'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-mono text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-50 tracking-tighter group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              YO
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-gray-400 dark:text-dark-400 tracking-[0.15em] uppercase">
              .sys
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50'
                  }`}
                >
                  <span className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {'['}
                  </span>
                  {t(item.key)}
                  <span className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    {']'}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-px left-3 right-3 h-px bg-primary-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={t('nav_theme')}
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Language toggle — desktop */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                aria-label={t('nav_language')}
              >
                <FiGlobe size={18} />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-800 rounded border border-gray-200 dark:border-dark-600 shadow-xl py-1 overflow-hidden"
                  >
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLanguage(item.code)
                          setShowLangMenu(false)
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center justify-between font-mono text-xs tracking-wide transition-colors ${
                          language === item.code
                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-400/10'
                            : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 border-t border-gray-200 dark:border-dark-600 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname === item.path ||
                        location.pathname.startsWith(`${item.path}/`)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2.5 rounded font-mono text-sm tracking-wide uppercase transition-colors ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-400/10'
                          : 'text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-50 dark:hover:bg-dark-800'
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  )
                })}

                {/* Mobile language switcher */}
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-dark-600">
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLanguage(item.code)
                          setIsOpen(false)
                        }}
                        className={`px-4 py-2.5 rounded font-mono text-xs tracking-wide flex items-center justify-between transition-colors ${
                          language === item.code
                            ? 'bg-primary-400 text-dark-950 font-medium'
                            : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
