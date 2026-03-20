import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'

import { useLanguage } from '../contexts/LanguageContext'
import { useBlogPosts } from '../hooks/useBlog'
import { staggerContainer, staggerItem } from '../components/ui'

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const { language, t } = useLanguage()

  const { data: postsResponse, isLoading: loading, error: fetchError, refetch } = useBlogPosts({ published_only: true, language })
  const posts = useMemo(() => {
    const items = postsResponse?.items
    return Array.isArray(items) ? items : []
  }, [postsResponse])
  const errorMessage = fetchError ? t('blog_fetch_error') : null

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredPosts = useMemo(() => {
    let filtered = [...posts]
    if (selectedTag !== 'all') filtered = filtered.filter((post) => post.tags?.includes(selectedTag))
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }
    return filtered
  }, [posts, selectedTag, debouncedSearch])

  const allTags = ['all', ...new Set(posts.flatMap((post) => post.tags || []))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <span className="h-6 w-6 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="sys-label mb-3 block">// TRANSMISSIONS</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-dark-50">{t('blog_title_prefix')} </span>
            <span className="text-primary-600 dark:text-primary-400">{t('blog_title_highlight')}</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-2xl">{t('blog_subtitle')}</p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10 space-y-4">
          <div className="relative max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" size={16} />
            <input
              type="text"
              placeholder={t('blog_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800/60 text-gray-900 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 font-mono text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded font-mono text-xs tracking-wide capitalize transition-all ${
                  selectedTag === tag
                    ? 'bg-primary-400 text-dark-950 font-medium'
                    : 'border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 hover:border-primary-400/40 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {tag === 'all' ? t('common_all') : tag}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 dark:text-red-400 space-y-2">
              <p>{errorMessage}</p>
              <button onClick={() => void refetch()} className="btn-secondary text-xs">{t('common_retry')}</button>
            </div>
          )}

          {(searchQuery || selectedTag !== 'all') && (
            <p className="font-mono text-[10px] text-gray-400 dark:text-dark-400 tracking-wider">
              {filteredPosts.length} {filteredPosts.length === 1 ? t('blog_result') : t('blog_results')} {t('blog_found')}
            </p>
          )}
        </motion.div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500 dark:text-dark-300">{t('blog_empty')}</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <motion.article key={post.id} variants={staggerItem} className="panel-hover group overflow-hidden flex flex-col">
                {/* Cover */}
                <div className="relative h-44 overflow-hidden border-b border-gray-200 dark:border-dark-600 bg-gray-100 dark:bg-dark-800">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-4xl font-bold text-gray-300 dark:text-dark-600">{post.title.charAt(0)}</span>
                    </div>
                  )}
                  {post.is_featured && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider bg-amber-400 text-dark-950 font-medium">
                      {t('blog_featured')}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 font-mono text-[10px] tracking-wide border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 rounded capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-dark-50 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-dark-300 mb-4 line-clamp-2 flex-1">{post.excerpt}</p>

                  <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 dark:text-dark-400 tracking-wider mb-3">
                    <span>
                      {new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>{post.reading_time || post.read_time || '5'} {t('blog_min_read')}</span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-mono text-xs tracking-wide text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                  >
                    {t('blog_read_more')}
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
