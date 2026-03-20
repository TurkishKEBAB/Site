import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import { CornerFrame } from '../components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <CornerFrame accent className="max-w-lg w-full p-10 md:p-14 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary-500 dark:text-primary-400 mb-4">
            // ERROR
          </div>
          <h1 className="font-display text-8xl md:text-9xl font-bold text-gray-900 dark:text-dark-50 tracking-tighter mb-2">
            404
          </h1>
          <h2 className="font-display text-xl font-semibold text-gray-700 dark:text-dark-200 mb-3">
            Page Not Found
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-8 font-mono">
            The requested resource could not be located.
          </p>
          <Link to="/" className="btn-primary">
            <FiArrowLeft size={14} />
            Go Home
          </Link>
        </motion.div>
      </CornerFrame>
    </div>
  )
}
