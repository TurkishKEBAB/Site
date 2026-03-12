import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

const t = {
  tr: {
    title: 'Sayfa Bulunamadi',
    description: 'Aradiginiz sayfa mevcut degil.',
    goHome: 'Ana Sayfaya Don',
  },
  en: {
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist.",
    goHome: 'Go Home',
  },
} as const;

export default function NotFound() {
  const { language } = useLanguage();
  const text = t[language === 'en' ? 'en' : 'tr'];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {text.description}
          </p>
          <Link to="/" className="btn-primary">
            {text.goHome}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
