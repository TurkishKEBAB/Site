import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import { GlowBar } from './ui'

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com/TurkishKEBAB', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://www.linkedin.com/in/yigit-okur-050b5b278/', label: 'LinkedIn' },
  { icon: FiTwitter, href: 'https://x.com/biznedenokuruz', label: 'Twitter/X' },
  { icon: FiMail, href: 'mailto:yigitokur@ieee.org', label: 'Email' },
]

export default function Footer() {
  const { t } = useLanguage()

  const footerLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_about'), path: '/about' },
    { name: t('nav_projects'), path: '/projects' },
    { name: t('nav_blog'), path: '/blog' },
    { name: t('nav_contact'), path: '/contact' },
  ]

  return (
    <footer className="relative border-t border-gray-200 dark:border-dark-600/40 bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
      <GlowBar />

      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-50 tracking-tighter mb-3">
              YO<span className="text-primary-500 dark:text-primary-400">.sys</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-300 leading-relaxed mb-5 max-w-sm">
              {t('footer_description')}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 dark:hover:border-primary-400/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="sys-label mb-4">// {t('footer_nav')}</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="sys-label mb-4">// {t('footer_contact')}</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-300">
              <li>
                <a
                  href="mailto:yigitokur@ieee.org"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-mono text-xs"
                >
                  yigitokur@ieee.org
                </a>
              </li>
              <li>Istanbul, Turkey</li>
              <li className="text-gray-400 dark:text-dark-400 text-xs">
                {t('footer_open_to_collab')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-600/40">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-gray-400 dark:text-dark-400">
            <p>© {new Date().getFullYear()} Yiğit Okur</p>
            <p>React · TypeScript · Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
