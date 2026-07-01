"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FiMenu, FiX } from "react-icons/fi";

import { useLanguage } from "@/contexts/LanguageContext";
import BackgroundModeToggle from "@/components/BackgroundModeToggle";
import CommandPalette from "@/components/CommandPalette";
import IstanbulClock from "@/components/IstanbulClock";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wordmarkFull, setWordmarkFull] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { key: "navHome", path: "/" },
    { key: "navAbout", path: "/about" },
    { key: "navProjects", path: "/projects" },
    { key: "navBlog", path: "/blog" },
    { key: "navContact", path: "/contact" },
  ] as const;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Rotating wordmark: YO.sys <-> Yigit Okur (Y and O stay anchored).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => setWordmarkFull((prev) => !prev), 3400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-dark-600/40"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex w-[150px] items-center overflow-hidden sm:w-[172px]" aria-label="YO.sys home">
            <span
              className={`nx-wm font-mono text-lg font-bold tracking-tight text-gray-900 dark:text-dark-50 sm:text-xl ${
                wordmarkFull ? "show-full" : ""
              }`}
            >
              Y<span className="wm-exp">iğit</span>
              <span className="wm-sp"> </span>O<span className="wm-exp">kur</span>
              <b className="wm-sfx font-medium uppercase tracking-[0.15em] text-primary-600 dark:text-primary-400" style={{ fontSize: "0.6em" }}>
                .sys
              </b>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname === item.path || pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50"
                  }`}
                >
                  <span className={isActive ? "opacity-100" : "opacity-0"}>[</span>
                  {t(item.key)}
                  <span className={isActive ? "opacity-100" : "opacity-0"}>]</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-px left-3 right-3 h-px bg-primary-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <IstanbulClock />
            <BackgroundModeToggle />
            <CommandPalette />
            <ThemeToggle />
            <LanguageToggle />

            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 border-t border-gray-200 dark:border-dark-600 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? pathname === "/"
                      : pathname === item.path || pathname.startsWith(`${item.path}/`);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`block px-3 py-2.5 rounded font-mono text-sm tracking-wide uppercase transition-colors ${
                        isActive
                          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-400/10"
                          : "text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-50 dark:hover:bg-dark-800"
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
