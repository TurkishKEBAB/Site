import { motion } from 'framer-motion'

const lines = [
  { prompt: true, text: '$ whoami' },
  { prompt: false, text: '> software-engineer' },
  { prompt: true, text: '$ cat skills.json' },
  { prompt: false, text: '> {' },
  { prompt: false, text: '    "backend": "FastAPI, Spring Boot",' },
  { prompt: false, text: '    "cloud":   "AWS, Docker, K8s",' },
  { prompt: false, text: '    "devops":  "CI/CD, Terraform"' },
  { prompt: false, text: '  }' },
  { prompt: true, text: '$ echo "Let\'s build together! 🚀"' },
]

export default function CodeBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="rounded-2xl overflow-hidden border border-gray-200/60 dark:border-dark-700 shadow-lg dark:shadow-2xl dark:shadow-black/20 bg-white dark:bg-dark-800">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-dark-900 border-b border-gray-200/60 dark:border-dark-700">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
            ~/yigitokur
          </span>
        </div>

        {/* Code lines */}
        <div className="p-5 font-mono text-sm leading-relaxed space-y-1">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              className={
                line.prompt
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300'
              }
            >
              {line.text}
            </motion.div>
          ))}
          {/* Blinking cursor */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1.8, duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary-500 dark:bg-primary-400 rounded-sm ml-0.5 align-middle"
          />
        </div>
      </div>
    </motion.div>
  )
}
