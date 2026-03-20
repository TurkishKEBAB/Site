import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { projectService } from '../services'
import { Project } from '../services/types'
import { staggerContainer, staggerItem } from '../components/ui'
import { FiExternalLink, FiGithub, FiX, FiSearch } from 'react-icons/fi'

export default function Projects() {
  const PAGE_SIZE = 6
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const skipRef = useRef(0)
  const { language } = useLanguage()

  const t = {
    tr: {
      pageLabel: 'ARSIV',
      pageTitle: 'Projelerim',
      pageSubtitle: 'Bugune kadar uzerine calistigim, kodladigim ve hayata gecirdigim bazi isler.',
      searchPlaceholder: 'Proje adi, aciklama veya teknolojiye gore ara...',
      statsLoaded: 'Yuklenen:',
      statsOf: '/',
      statsProjects: 'proje',
      statsShowing: '· Gosterilen:',
      retryBtn: 'Tekrar Dene',
      emptyNoProjects: 'Henuz proje bulunmuyor',
      emptyCheckBack: 'Yeni projeler icin yakinda tekrar goz atin!',
      emptyNoMatch: 'Aramanizla eslesen proje bulunamadi.',
      cardFeatured: 'One Cikan',
      cardDemo: 'Demo',
      cardGithub: 'Kaynak Kod',
      loadMoreBtn: 'Daha fazla proje yukle',
      loading: 'Yukleniyor...',
      modalTech: 'Kullanilan Teknolojiler',
      modalViewDemo: 'Demoyu Gor',
      modalViewCode: 'Kodu Incele',
      modalClose: 'Proje detaylarini kapat',
    },
    en: {
      pageLabel: 'ARCHIVE',
      pageTitle: 'My Projects',
      pageSubtitle: "Some of the work I've developed, coded, and brought to life so far.",
      searchPlaceholder: 'Search projects by name, description, or technology...',
      statsLoaded: 'Loaded',
      statsOf: 'of',
      statsProjects: 'projects',
      statsShowing: '· Showing',
      retryBtn: 'Retry',
      emptyNoProjects: 'No projects available yet',
      emptyCheckBack: 'Check back soon for new projects!',
      emptyNoMatch: 'No projects match your search.',
      cardFeatured: 'Featured',
      cardDemo: 'Demo',
      cardGithub: 'Source',
      loadMoreBtn: 'Load more projects',
      loading: 'Loading...',
      modalTech: 'Technologies Used',
      modalViewDemo: 'View Demo',
      modalViewCode: 'View Code',
      modalClose: 'Close project details',
    },
  }

  const currentLang = language === 'en' ? 'en' : 'tr'
  const text = t[currentLang]

  const normalizeProjects = (items: unknown[]): Project[] => {
    return items.map((item) => {
      const raw = item as Project & {
        project_technologies?: Array<{ technology?: Project['technologies'][number] }>
      }
      const directTechnologies = Array.isArray(raw.technologies) ? raw.technologies : []
      const relationshipTechnologies = Array.isArray(raw.project_technologies)
        ? raw.project_technologies.map((e) => e?.technology).filter((tech): tech is Project['technologies'][number] => Boolean(tech))
        : []
      return {
        ...raw,
        description: raw.description ?? '',
        technologies: directTechnologies.length > 0 ? directTechnologies : relationshipTechnologies,
      }
    })
  }

  const loadProjects = useCallback(async ({ reset = false } = {}) => {
    if (reset) { setLoading(true); skipRef.current = 0 } else { setLoadingMore(true) }
    try {
      const response = await projectService.getProjects({ skip: skipRef.current, limit: PAGE_SIZE, language })
      const items = Array.isArray(response.items) ? response.items : []
      const normalized = normalizeProjects(items)
      setTotalCount(typeof response.total === 'number' ? response.total : null)
      setErrorMessage('')
      if (reset) setImageLoadErrors({})
      setProjects((prev) => {
        if (reset) { skipRef.current = normalized.length; return normalized }
        const existingIds = new Set(prev.map((p) => p.id))
        const newItems = normalized.filter((p) => !existingIds.has(p.id))
        const combined = [...prev, ...newItems]
        skipRef.current = combined.length
        return combined
      })
      setHasMore(() => {
        if (typeof response.total === 'number') return skipRef.current < response.total
        if (typeof response.pages === 'number' && typeof response.page === 'number') return response.page < response.pages
        return normalized.length === PAGE_SIZE
      })
    } catch (error) {
      if (reset) { setProjects([]); setFilteredProjects([]); setTotalCount(null); setHasMore(false) }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load projects.')
    } finally {
      if (reset) setLoading(false); else setLoadingMore(false)
    }
  }, [language])

  useEffect(() => { loadProjects({ reset: true }) }, [loadProjects])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = projects.filter((project) => {
      if (!query) return true
      const technologies = Array.isArray(project.technologies) ? project.technologies : []
      return (
        project.title.toLowerCase().includes(query) ||
        (project.description ?? '').toLowerCase().includes(query) ||
        technologies.some((tech) => tech.name.toLowerCase().includes(query))
      )
    })
    setFilteredProjects(filtered)
  }, [projects, searchQuery])

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="sys-label mb-3 block">// {text.pageLabel}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">{text.pageTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-2xl">{text.pageSubtitle}</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="relative max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" size={16} />
            <input
              type="text"
              placeholder={text.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800/60 text-gray-900 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 font-mono text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>
          <p className="mt-3 font-mono text-[10px] text-gray-400 dark:text-dark-400 tracking-wider">
            {text.statsLoaded} {projects.length}
            {typeof totalCount === 'number' ? ` ${text.statsOf} ${totalCount}` : ''} {text.statsProjects} {text.statsShowing} {filteredProjects.length}
          </p>
          {errorMessage && projects.length === 0 && (
            <div className="mt-4 text-sm text-red-500 dark:text-red-400 space-y-2">
              <p>{errorMessage}</p>
              <button onClick={() => loadProjects({ reset: true })} className="btn-secondary text-xs">{text.retryBtn}</button>
            </div>
          )}
        </motion.div>

        {/* Grid */}
        {loading && projects.length === 0 ? (
          <ProjectsSkeleton count={PAGE_SIZE} />
        ) : projects.length === 0 && !errorMessage ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-lg text-gray-500 dark:text-dark-300">{text.emptyNoProjects}</p>
            <p className="text-sm text-gray-400 dark:text-dark-400">{text.emptyCheckBack}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500 dark:text-dark-300">{text.emptyNoMatch}</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const techList = Array.isArray(project.technologies) ? project.technologies : []
              const showCover = Boolean(project.cover_image) && !imageLoadErrors[project.id]
              return (
                <motion.article
                  key={project.id}
                  variants={staggerItem}
                  className="panel-hover group overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative h-44 overflow-hidden border-b border-gray-200 dark:border-dark-600 bg-gray-100 dark:bg-dark-800">
                    {showCover ? (
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageLoadErrors((p) => ({ ...p, [project.id]: true }))}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-4xl font-bold text-gray-300 dark:text-dark-600">
                          {project.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {project.featured && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider bg-amber-400 text-dark-950 font-medium">
                        {text.cardFeatured}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-dark-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-dark-300 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {techList.slice(0, 3).map((tech) => (
                        <span key={tech.id} className="px-2 py-0.5 font-mono text-[10px] tracking-wide border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 rounded">
                          {tech.name}
                        </span>
                      ))}
                      {techList.length > 3 && (
                        <span className="px-2 py-0.5 font-mono text-[10px] text-gray-400 dark:text-dark-400">+{techList.length - 3}</span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-1">
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-primary text-[10px] py-1.5 px-3">
                          <FiExternalLink size={12} /> {text.cardDemo}
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary text-[10px] py-1.5 px-3">
                          <FiGithub size={12} /> {text.cardGithub}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}

        {loadingMore && <div className="mt-8"><ProjectsSkeleton count={3} /></div>}

        {hasMore && projects.length > 0 && (
          <div className="flex justify-center mt-10">
            <button onClick={() => loadProjects({ reset: false })} disabled={loadingMore} className="btn-secondary disabled:opacity-50">
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  {text.loading}
                </span>
              ) : text.loadMoreBtn}
            </button>
          </div>
        )}

        {errorMessage && projects.length > 0 && (
          <p className="mt-6 text-center text-sm text-amber-500">{errorMessage}</p>
        )}

        {/* Modal */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            showCoverImage={!imageLoadErrors[selectedProject.id]}
            onCoverError={() => setImageLoadErrors((p) => ({ ...p, [selectedProject.id]: true }))}
            onClose={() => setSelectedProject(null)}
            text={text}
          />
        )}
      </div>
    </div>
  )
}

function ProjectDetailModal({ project, showCoverImage, onCoverError, onClose, text }: {
  project: Project; showCoverImage: boolean; onCoverError: () => void; onClose: () => void; text: any
}) {
  const techList = Array.isArray(project.technologies) ? project.technologies : []
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); prev?.focus() }
  }, [onClose])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        role="dialog" aria-modal="true" ref={dialogRef}
        className="bg-white dark:bg-dark-800 rounded border border-gray-200 dark:border-dark-600 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <span className="sys-label">// {text.pageLabel}</span>
            <button onClick={onClose} ref={closeButtonRef} aria-label={text.modalClose} className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {project.cover_image && showCoverImage && (
            <div className="mb-6 rounded overflow-hidden border border-gray-200 dark:border-dark-600">
              <img src={project.cover_image} alt={project.title} loading="lazy" decoding="async" onError={onCoverError} className="w-full max-h-80 object-cover" />
            </div>
          )}

          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-50 mb-3">{project.title}</h2>
          <p className="text-gray-600 dark:text-dark-300 mb-6 leading-relaxed">{project.description}</p>

          {techList.length > 0 && (
            <div className="mb-6">
              <h3 className="sys-label mb-3">// {text.modalTech}</h3>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech) => (
                  <span key={tech.id} className="px-3 py-1 font-mono text-xs border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-dark-300 rounded">{tech.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <FiExternalLink size={14} /> {text.modalViewDemo}
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FiGithub size={14} /> {text.modalViewCode}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProjectsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel overflow-hidden animate-pulse">
          <div className="h-44 bg-gray-100 dark:bg-dark-700" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 bg-gray-100 dark:bg-dark-700 rounded" />
            <div className="h-4 w-full bg-gray-100 dark:bg-dark-700 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-dark-700 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-gray-100 dark:bg-dark-700 rounded" />
              <div className="h-5 w-12 bg-gray-100 dark:bg-dark-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
