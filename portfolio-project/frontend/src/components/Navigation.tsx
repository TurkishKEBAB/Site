import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGlobe, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';

import { Language } from '../contexts/LanguageContext';
import { useLanguage } from '../contexts/LanguageContext';

const languages: Array<{ code: Language; name: string; label: string }> = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'tr', name: 'Turkce', label: 'TR' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { key: 'nav_home', path: '/' },
    { key: 'nav_about', path: '/about' },
    { key: 'nav_projects', path: '/projects' },
    { key: 'nav_blog', path: '/blog' },
    { key: 'nav_contact', path: '/contact' },
  ];

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {
        setIsDark(event.newValue === 'dark');
      }
      if (event.key === 'lang' && (event.newValue === 'en' || event.newValue === 'tr')) {
        setLanguage(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLanguage]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
            >
              YO
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t(item.key)}
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300"
              aria-label={t('nav_theme')}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300"
                aria-label={t('nav_language')}
              >
                <FiGlobe size={20} />
              </motion.button>

              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 py-2"
                >
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${
                        language === item.code
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setIsOpen(false);
                      }}
                      className={`px-4 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        language === item.code
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
