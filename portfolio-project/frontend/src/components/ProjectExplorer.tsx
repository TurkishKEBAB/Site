"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowRight, FiExternalLink, FiGithub, FiX } from "react-icons/fi";

export interface LocalizedProjectView {
  slug: string;
  title: string;
  summary: string;
  description: string;
  impact: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

interface ProjectExplorerProps {
  locale: "en" | "tr";
  projects: LocalizedProjectView[];
}

const copy = {
  en: {
    featured: "Featured",
    project: "Project",
    impact: "Impact",
    technology: "Technology stack",
    source: "Source",
    demo: "Live demo",
    close: "Close project details",
  },
  tr: {
    featured: "One cikan",
    project: "Proje",
    impact: "Etki",
    technology: "Teknoloji seti",
    source: "Kaynak",
    demo: "Canli demo",
    close: "Proje detaylarini kapat",
  },
} as const;

export default function ProjectExplorer({ locale, projects }: ProjectExplorerProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const text = copy[locale];

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedSlug) ?? null,
    [projects, selectedSlug],
  );

  useEffect(() => {
    if (!selectedProject) return undefined;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSlug(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  return (
    <>
      <div className="border-t border-gray-200 dark:border-dark-600">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setSelectedSlug(project.slug)}
            className="nx-row group relative grid w-full grid-cols-[40px,1fr] items-center gap-5 border-b border-gray-200 px-2 py-6 text-left transition-all hover:bg-primary-400/[0.04] hover:pl-4 dark:border-dark-600 md:grid-cols-[64px,1fr,auto] md:gap-6"
          >
            <span className="font-mono text-[13px] text-gray-400 transition-colors group-hover:text-primary-500 dark:text-dark-400 dark:group-hover:text-primary-400">
              {String(index).padStart(2, "0")}
            </span>
            <div>
              <h3 className="flex flex-wrap items-center gap-3 font-display text-[clamp(1.15rem,2.3vw,1.5rem)] font-semibold text-gray-900 dark:text-dark-50">
                {project.title}
                {project.featured && (
                  <span className="rounded-full bg-amber-400 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-dark-950">
                    {text.featured}
                  </span>
                )}
              </h3>
              <p className="mt-1.5 max-w-[46rem] text-[13.5px] text-gray-500 dark:text-dark-300">{project.summary}</p>
            </div>
            <div className="hidden items-center gap-5 md:flex">
              <span className="max-w-[210px] text-right font-mono text-[11px] text-gray-400 dark:text-dark-400">
                {project.technologies.slice(0, 4).join(" · ")}
              </span>
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-hover:-rotate-45 group-hover:border-primary-400/40 group-hover:text-primary-500 dark:border-dark-600 dark:text-dark-400 dark:group-hover:text-primary-400">
                <FiArrowRight size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-dark-950/60 p-4 backdrop-blur-sm md:p-6"
            onClick={() => setSelectedSlug(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              role="dialog"
              aria-modal="true"
              className="max-h-[86vh] w-full max-w-[660px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-8 dark:border-dark-600 dark:bg-dark-900 md:p-9"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
                    {selectedProject.featured ? text.featured : text.project}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-[26px]">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  aria-label={text.close}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-300 dark:hover:text-primary-400"
                >
                  <FiX size={16} />
                </button>
              </div>

              <p className="text-[15px] leading-[1.7] text-gray-700 dark:text-dark-200">{selectedProject.description}</p>

              <div className="my-5 rounded border border-primary-400/30 bg-primary-400/[0.05] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                  {text.impact}
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-gray-700 dark:text-dark-200">
                  {selectedProject.impact}
                </p>
              </div>

              <h4 className="mb-2.5 font-display text-base font-semibold text-gray-900 dark:text-dark-50">
                {text.technology}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies.map((tech) => (
                  <span
                    key={`${selectedProject.slug}-modal-${tech}`}
                    className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {(selectedProject.githubUrl || selectedProject.demoUrl) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedProject.demoUrl && (
                    <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
                      <FiExternalLink size={13} />
                      {text.demo}
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                      <FiGithub size={13} />
                      {text.source}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
