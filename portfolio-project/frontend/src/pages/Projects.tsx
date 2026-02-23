import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { projectService } from '../services';
import { Project } from '../services/types';

export default function Projects() {
  const PAGE_SIZE = 6;
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const skipRef = useRef(0);
  const { language } = useLanguage();

  // --- ÇEVİRİ OBJESİ (TRANSLATIONS) ---
  const t = {
    tr: {
      pageTitle: "Projelerim",
      pageSubtitle: "Bugüne kadar üzerine çalıştığım, kodladığım ve hayata geçirdiğim bazı işler.",
      searchPlaceholder: "Proje adı, açıklama veya teknolojiye göre ara...",
      statsLoaded: "Yüklenen:",
      statsOf: "/",
      statsProjects: "proje",
      statsShowing: "• Gösterilen:",
      retryBtn: "Tekrar Dene",
      emptyNoProjects: "Henüz proje bulunmuyor",
      emptyCheckBack: "Yeni projeler için yakında tekrar göz atın!",
      emptyNoMatch: "Aramanızla eşleşen proje bulunamadı.",
      cardFeatured: "Öne Çıkan",
      cardDemo: "Demo",
      cardGithub: "GitHub",
      loadMoreBtn: "Daha fazla proje yükle",
      loading: "Yükleniyor...",
      modalTech: "Kullanılan Teknolojiler",
      modalViewDemo: "Demoyu Gör →",
      modalViewCode: "Kodu İncele →",
      modalClose: "Proje detaylarını kapat"
    },
    en: {
      pageTitle: "My Projects",
      pageSubtitle: "Some of the work I've developed, coded, and brought to life so far.",
      searchPlaceholder: "Search projects by name, description, or technology...",
      statsLoaded: "Loaded",
      statsOf: "of",
      statsProjects: "projects",
      statsShowing: "• Showing",
      retryBtn: "Retry",
      emptyNoProjects: "No projects available yet",
      emptyCheckBack: "Check back soon for new projects!",
      emptyNoMatch: "No projects match your search.",
      cardFeatured: "Featured",
      cardDemo: "Demo",
      cardGithub: "GitHub",
      loadMoreBtn: "Load more projects",
      loading: "Loading...",
      modalTech: "Technologies Used",
      modalViewDemo: "View Demo →",
      modalViewCode: "View Code →",
      modalClose: "Close project details"
    }
  };

  const currentLang = language === 'en' ? 'en' : 'tr';
  const text = t[currentLang];

  const normalizeProjects = (items: unknown[]): Project[] => {
    return items.map((item) => {
      const raw = item as Project & {
        project_technologies?: Array<{ technology?: Project['technologies'][number] }>;
      };

      const directTechnologies = Array.isArray(raw.technologies) ? raw.technologies : [];
      const relationshipTechnologies = Array.isArray(raw.project_technologies)
        ? raw.project_technologies
          .map((entry) => entry?.technology)
          .filter((tech): tech is Project['technologies'][number] => Boolean(tech))
        : [];

      return {
        ...raw,
        description: raw.description ?? '',
        technologies: directTechnologies.length > 0 ? directTechnologies : relationshipTechnologies,
      };
    });
  };

  const loadProjects = useCallback(async ({ reset = false } = {}) => {
    if (reset) {
      setLoading(true);
      skipRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await projectService.getProjects({
        skip: skipRef.current,
        limit: PAGE_SIZE,
        language,
      });

      const items = Array.isArray(response.items) ? response.items : [];
      const normalized = normalizeProjects(items);

      setTotalCount(typeof response.total === 'number' ? response.total : null);
      setErrorMessage('');
      if (reset) {
        setImageLoadErrors({});
      }

      setProjects((prev) => {
        if (reset) {
          skipRef.current = normalized.length;
          return normalized;
        }

        const existingIds = new Set(prev.map((project) => project.id));
        const newItems = normalized.filter((project) => !existingIds.has(project.id));
        const combined = [...prev, ...newItems];
        skipRef.current = combined.length;
        return combined;
      });

      setHasMore(() => {
        if (typeof response.total === 'number') {
          return skipRef.current < response.total;
        }
        if (typeof response.pages === 'number' && typeof response.page === 'number') {
          return response.page < response.pages;
        }
        return normalized.length === PAGE_SIZE;
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      if (reset) {
        setProjects([]);
        setFilteredProjects([]);
        setTotalCount(null);
        setHasMore(false);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load projects.');
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [language]);

  useEffect(() => {
    loadProjects({ reset: true });
  }, [loadProjects]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      if (!query) {
        return true;
      }

      const description = project.description ?? '';
      const technologies = Array.isArray(project.technologies) ? project.technologies : [];

      return (
        project.title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        technologies.some((tech) => tech.name.toLowerCase().includes(query))
      );
    });

    setFilteredProjects(filtered);
  }, [projects, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            {text.pageTitle}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {text.pageSubtitle}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="mb-12">
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <p className="text-sm text-center text-gray-400">
            {text.statsLoaded} {projects.length}
            {typeof totalCount === 'number' ? ` ${text.statsOf} ${totalCount}` : ''} {text.statsProjects} {text.statsShowing} {filteredProjects.length}
          </p>
          {errorMessage && projects.length === 0 && (
            <div className="mt-4 text-center text-sm text-red-300 space-y-3">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => loadProjects({ reset: true })}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                {text.retryBtn}
              </button>
            </div>
          )}
        </motion.div>

        {/* Projects Grid */}
        {loading && projects.length === 0 ? (
          <ProjectsSkeleton count={PAGE_SIZE} />
        ) : projects.length === 0 && !errorMessage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <p className="text-2xl text-gray-400">{text.emptyNoProjects}</p>
            <p className="text-sm text-gray-500">{text.emptyCheckBack}</p>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">{text.emptyNoMatch}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="visible"
            animate="visible"
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project) => {
              const techList = Array.isArray(project.technologies) ? project.technologies : [];
              const showCoverImage = Boolean(project.cover_image) && !imageLoadErrors[project.id];

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group relative z-20 overflow-hidden rounded-2xl border border-primary-200 bg-white text-gray-900 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-primary-400 dark:border-primary-500 dark:bg-slate-900 dark:text-gray-50 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-600 to-pink-600">
                    {showCoverImage ? (
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                          setImageLoadErrors((prev) => ({
                            ...prev,
                            [project.id]: true,
                          }));
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-pink-600">
                        <span className="text-6xl"></span>
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {text.cardFeatured}
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="space-y-4 p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
                      {project.title}
                    </h3>
                    <p className="line-clamp-3 text-gray-700 dark:text-gray-200">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {techList.slice(0, 3).map((tech) => (
                        <span
                          key={tech.id}
                          className="rounded-full bg-primary-600 px-3 py-1 text-sm font-medium text-white shadow"
                        >
                          {tech.name}
                        </span>
                      ))}
                      {techList.length > 3 && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          +{techList.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-3">
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-primary-700"
                        >
                          {text.cardDemo}
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-center font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                          {text.cardGithub}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {loadingMore && projects.length > 0 && (
          <div className="mt-12">
            <ProjectsSkeleton count={3} />
          </div>
        )}

        {hasMore && projects.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              type="button"
              onClick={() => loadProjects({ reset: false })}
              disabled={loadingMore}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" aria-hidden="true" />
                  {text.loading}
                </span>
              ) : (
                text.loadMoreBtn
              )}
            </button>
          </div>
        )}

        {errorMessage && projects.length > 0 && (
          <p className="mt-6 text-center text-sm text-yellow-300">{errorMessage}</p>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            showCoverImage={!imageLoadErrors[selectedProject.id]}
            onCoverError={() => {
              setImageLoadErrors((prev) => ({
                ...prev,
                [selectedProject.id]: true,
              }));
            }}
            onClose={() => setSelectedProject(null)}
            text={text}
          />
        )}
      </div>
    </div>
  );
}

// Project Detail Modal Component
const ProjectDetailModal = ({
  project,
  showCoverImage,
  onCoverError,
  onClose,
  text
}: {
  project: Project;
  showCoverImage: boolean;
  onCoverError: () => void;
  onClose: () => void;
  text: any;
}) => {
  const techList = Array.isArray(project.technologies) ? project.technologies : [];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        className="bg-gradient-to-br from-gray-900 to-primary-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            ref={closeButtonRef}
            aria-label={text.modalClose}
            className="float-right text-white/60 hover:text-white text-3xl leading-none"
          >
            ×
          </button>

          {/* Project Cover Image */}
          {project.cover_image && showCoverImage && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={project.cover_image}
                alt={project.title}
                loading="lazy"
                decoding="async"
                onError={onCoverError}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Project Title */}
          <h2 className="text-4xl font-bold text-white mb-4">{project.title}</h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-6">{project.description}</p>

          {/* Technologies */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white mb-3">{text.modalTech}</h3>
            <div className="flex flex-wrap gap-3">
              {techList.map((tech) => (
                <span
                  key={tech.id}
                  className="px-4 py-2 bg-primary-600/30 text-primary-300 rounded-lg font-medium"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-4">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                {text.modalViewDemo}
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                {text.modalViewCode}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-white/5" />
          <div className="p-6 space-y-4">
            <div className="h-6 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-5/6 bg-white/10 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-white/10 rounded-full" />
              <div className="h-6 w-14 bg-white/10 rounded-full" />
              <div className="h-6 w-12 bg-white/10 rounded-full" />
            </div>
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
