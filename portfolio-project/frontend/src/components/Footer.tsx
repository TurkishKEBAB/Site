import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi'
import { motion } from 'framer-motion'

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com/TurkishKEBAB', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://www.linkedin.com/in/yi%C4%9Fit-okur-050b5b278/', label: 'LinkedIn' },
  { icon: FiTwitter, href: 'https://x.com/biznedenokuruz', label: 'Twitter' },
  { icon: FiMail, href: 'mailto:yigitokur@ieee.org', label: 'Email' },
]

const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Projects', path: '/projects' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
]

export default function Footer() {
  return (
    <footer className="relative bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4"
            >
              Yiğit Okur
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cloud/DevOps Engineer passionate about building scalable infrastructure and automation solutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Get in Touch
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="mailto:yigitokur@ieee.org"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  yigitokur@ieee.org
                </a>
              </li>
              <li>Istanbul, Turkey 🇹🇷</li>
              <li>Available for freelance work</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} Yiğit Okur. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0">
              Built with ❤️ using React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
