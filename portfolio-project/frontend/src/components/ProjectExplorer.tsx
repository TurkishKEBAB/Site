"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiExternalLink, FiGithub, FiX } from "react-icons/fi";

import { PanelCard } from "@/components/ui";

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
    impact: "Impact",
    technology: "Technology stack",
    source: "Source",
    demo: "Demo",
    details: "Details",
    close: "Close project details",
  },
  tr: {
    featured: "One cikan",
    impact: "Etki",
    technology: "Teknoloji seti",
    source: "Kaynak kod",
    demo: "Demo",
    details: "Detaylar",
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSlug(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => (
          <PanelCard
            key={project.slug}
            as="article"
            className="flex flex-col gap-4"
            onClick={() => setSelectedSlug(project.slug)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                  {project.summary}
                </p>
              </div>
              {project.featured && (
                <span className="rounded-full bg-amber-400 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-dark-950">
                  {text.featured}
                </span>
              )}
            </div>

            <div className="rounded border border-primary-400/20 bg-primary-400/5 p-4">
              <p className="sys-label mb-2">// {text.impact}</p>
              <p className="text-sm text-gray-700 dark:text-dark-200">{project.impact}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={`${project.slug}-${tech}`}
                  className="rounded-full border border-gray-200 dark:border-dark-600 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="btn-secondary text-xs"
                >
                  <FiGithub size={12} />
                  {text.source}
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="btn-primary text-xs"
                >
                  <FiExternalLink size={12} />
                  {text.demo}
                </a>
              )}
            </div>
          </PanelCard>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
            onClick={() => setSelectedSlug(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-900 p-6 md:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="sys-label mb-2">// {text.details}</p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 dark:text-dark-50">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="rounded border border-gray-200 dark:border-dark-600 p-2 text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50"
                  aria-label={text.close}
                >
                  <FiX size={16} />
                </button>
              </div>

              <p className="text-base leading-relaxed text-gray-700 dark:text-dark-200">
                {selectedProject.description}
              </p>

              <div className="mt-6 rounded border border-primary-400/20 bg-primary-400/5 p-5">
                <p className="sys-label mb-2">// {text.impact}</p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-dark-200">
                  {selectedProject.impact}
                </p>
              </div>

              <div className="mt-6">
                <p className="sys-label mb-3">// {text.technology}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech) => (
                    <span
                      key={`${selectedProject.slug}-modal-${tech}`}
                      className="rounded-full border border-gray-200 dark:border-dark-600 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <FiGithub size={14} />
                    {text.source}
                  </a>
                )}
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <FiExternalLink size={14} />
                    {text.demo}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
