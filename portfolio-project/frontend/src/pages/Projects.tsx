import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const skipRef = useRef(0);

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
      });

      const items = Array.isArray(response.items) ? response.items : [];
      const normalized = normalizeProjects(items);

      setTotalCount(typeof response.total === 'number' ? response.total : null);
      setErrorMessage('');

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
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            My <span className="text-purple-400">Projects</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A collection of my work showcasing various technologies and solutions
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
              placeholder="Search projects by name, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <p className="text-sm text-center text-gray-400">
            Loaded {projects.length}
            {typeof totalCount === 'number' ? ` of ${totalCount}` : ''} projects • Showing {filteredProjects.length}
          </p>
          {errorMessage && projects.length === 0 && (
            <div className="mt-4 text-center text-sm text-red-300 space-y-3">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => loadProjects({ reset: true })}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Retry
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
            <div className="text-6xl mb-4">📁</div>
            <p className="text-2xl text-gray-400">No projects available yet</p>
            <p className="text-sm text-gray-500">Check back soon for new projects!</p>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">No projects match your search</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project) => {
              const techList = Array.isArray(project.technologies) ? project.technologies : [];

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group relative z-20 overflow-hidden rounded-2xl border border-purple-200 bg-white text-gray-900 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-purple-400 dark:border-purple-500 dark:bg-slate-900 dark:text-gray-50 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600">
                      <span className="text-6xl">🚀</span>
                    </div>
                  )}
                  {project.featured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Featured
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="space-y-4 p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-300">
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
                        className="rounded-full bg-purple-600 px-3 py-1 text-sm font-medium text-white shadow"
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
                        className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-purple-700"
                      >
                        Demo
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
                        GitHub
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
                  Loading...
                </span>
              ) : (
                'Load more projects'
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
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </div>
  );
}

// Project Detail Modal Component
const ProjectDetailModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  const techList = Array.isArray(project.technologies) ? project.technologies : [];
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
        className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right text-white/60 hover:text-white text-3xl leading-none"
          >
            ×
          </button>

          {/* Project Cover Image */}
          {project.cover_image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={project.cover_image}
                alt={project.title}
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
            <h3 className="text-2xl font-semibold text-white mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-3">
              {techList.map((tech) => (
                <span
                  key={tech.id}
                  className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg font-medium"
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                View Demo →
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                View Code →
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
