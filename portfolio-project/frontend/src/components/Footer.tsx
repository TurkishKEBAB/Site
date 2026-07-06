"use client";

import Link from "next/link";
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from "react-icons/fi";

import { getLocaleValue, siteConfig, uiDictionary } from "@/content/site";
import { GlowBar } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const socialLinks = [
  { icon: FiGithub, href: siteConfig.github, label: "GitHub" },
  { icon: FiLinkedin, href: siteConfig.linkedin, label: "LinkedIn" },
  { icon: FiTwitter, href: siteConfig.twitter, label: "Twitter/X" },
  { icon: FiMail, href: `mailto:${siteConfig.email}`, label: "Email" },
];

export default function Footer() {
  const { language: locale } = useLanguage();
  const copy = uiDictionary[locale];

  const footerLinks = [
    { name: copy.navHome, path: "/" },
    { name: copy.navAbout, path: "/about" },
    { name: copy.navProjects, path: "/projects" },
    { name: copy.navBlog, path: "/blog" },
    { name: copy.navContact, path: "/contact" },
  ];

  return (
    <footer className="relative border-t border-gray-200 dark:border-dark-600/40 bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
      <GlowBar />
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-dark-50 tracking-tighter mb-3">
              YO<span className="text-primary-500 dark:text-primary-400">.sys</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-300 leading-relaxed mb-5 max-w-sm">
              {getLocaleValue(
                {
                  en: "Software engineer focused on backend systems, cloud-native architecture, and durable product delivery.",
                  tr: "Backend sistemleri, cloud-native mimari ve dayanikli urun teslimine odaklanan yazilim muhendisi.",
                },
                locale,
              )}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 dark:hover:border-primary-400/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="sys-label mb-4">// {copy.footerNavigation}</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm text-gray-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="sys-label mb-4">// {copy.footerContact}</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-300">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-mono text-xs"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>{getLocaleValue(siteConfig.location, locale)}</li>
              <li className="text-gray-400 dark:text-dark-400 text-xs">
                {copy.footerAvailability}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-600/40">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-gray-400 dark:text-dark-400">
            <p>© {new Date().getFullYear()} Yiğit Okur</p>
            <p>{copy.footerStack}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
