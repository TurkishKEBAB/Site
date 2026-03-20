import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'
import { FiArrowLeft, FiShare2 } from 'react-icons/fi'

import { useLanguage } from '../contexts/LanguageContext'
import { useBlogPost, useBlogPosts } from '../hooks/useBlog'
import { PanelCard } from '../components/ui'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { language, t } = useLanguage()

  const { data: post, isLoading: postLoading, error: postError, refetch: refetchPost } = useBlogPost(slug || '', language)
  const { data: allPostsResponse } = useBlogPosts({ published_only: true, language })

  const allPosts = useMemo(() => {
    const items = allPostsResponse?.items
    return Array.isArray(items) ? items : []
  }, [allPostsResponse])

  const loading = postLoading
  const error = postError ? t('blog_post_load_failed') : null
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) navigate(-1)
    else navigate('/blog')
  }

  const relatedPosts = useMemo(() => {
    if (!post || allPosts.length === 0) return []
    return allPosts.filter((item) => item.id !== post.id && item.tags?.some((tag) => post.tags?.includes(tag))).slice(0, 3)
  }, [allPosts, post])

  const latestPosts = useMemo(() => {
    if (allPosts.length === 0) return []
    return allPosts.filter((item) => item.id !== post?.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
  }, [allPosts, post?.id])

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        {/* Back */}
        <button type="button" onClick={handleBack} className="mb-8 inline-flex items-center gap-2 font-mono text-xs tracking-wide text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
          <FiArrowLeft size={14} /> {t('blog_back')}
        </button>

        {loading ? (
          <BlogDetailSkeleton />
        ) : error && !post ? (
          <PanelCard className="text-center py-12">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => void refetchPost()} className="btn-primary text-xs">{t('common_retry')}</button>
              <Link to="/blog" className="btn-secondary text-xs">{t('blog_view_all_posts')}</Link>
            </div>
          </PanelCard>
        ) : post ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main article */}
            <div className="lg:col-span-2">
              <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="panel overflow-hidden">
                {post.cover_image ? (
                  <div className="h-64 md:h-80 border-b border-gray-200 dark:border-dark-600">
                    <img src={post.cover_image} alt={post.title} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800">
                    <span className="font-display text-6xl font-bold text-gray-200 dark:text-dark-600">{post.title.charAt(0)}</span>
                  </div>
                )}

                <div className="p-6 md:p-10 space-y-6">
                  {/* Meta */}
                  <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-wider text-gray-400 dark:text-dark-400 uppercase">
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
                          : new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </span>
                      {(post.reading_time || post.read_time) && (
                        <span>· {post.reading_time || post.read_time} {t('blog_min_read')}</span>
                      )}
                      <span>· {post.views ?? post.view_count ?? 0} {t('blog_views')}</span>
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-50 leading-tight">{post.title}</h1>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 font-mono text-[10px] tracking-wide border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-300 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  {/* Content */}
                  <section className="blog-markdown text-base leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {post.content}
                    </ReactMarkdown>
                  </section>

                  {/* Footer */}
                  <footer className="flex flex-col gap-4 border-t border-gray-200 dark:border-dark-600 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-[10px] tracking-wider text-gray-400 dark:text-dark-400 uppercase">
                      {t('blog_last_updated')} {new Date(post.updated_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                    </span>
                    <div className="flex gap-2">
                      <Link to="/blog" className="btn-secondary text-xs">{t('blog_back_to_blog')}</Link>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs"
                      >
                        <FiShare2 size={12} /> {t('blog_share')}
                      </a>
                    </div>
                  </footer>
                </div>
              </motion.article>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:col-span-1">
              {relatedPosts.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <PanelCard>
                    <h3 className="sys-label mb-4">// {t('blog_related_posts')}</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((rp) => (
                        <Link key={rp.id} to={`/blog/${rp.slug}`} className="group flex gap-3">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-dark-600 bg-gray-100 dark:bg-dark-800">
                            {rp.cover_image ? (
                              <img src={rp.cover_image} alt={rp.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-gray-300 dark:text-dark-600">{rp.title.charAt(0)}</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-dark-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{rp.title}</h4>
                            <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-dark-400">{rp.reading_time || rp.read_time || 0} {t('blog_min_read')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </PanelCard>
                </motion.div>
              )}

              {latestPosts.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <PanelCard>
                    <h3 className="sys-label mb-4">// {t('blog_latest_posts')}</h3>
                    <div className="space-y-4">
                      {latestPosts.map((lp) => (
                        <Link key={lp.id} to={`/blog/${lp.slug}`} className="group flex gap-3">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-dark-600 bg-gray-100 dark:bg-dark-800">
                            {lp.cover_image ? (
                              <img src={lp.cover_image} alt={lp.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-gray-300 dark:text-dark-600">{lp.title.charAt(0)}</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-dark-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lp.title}</h4>
                            <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-dark-400">
                              {new Date(lp.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </PanelCard>
                </motion.div>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BlogDetailSkeleton() {
  return (
    <div className="panel overflow-hidden animate-pulse">
      <div className="h-80 bg-gray-100 dark:bg-dark-700" />
      <div className="p-10 space-y-6">
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-dark-700 rounded" />
        <div className="h-8 w-3/4 bg-gray-100 dark:bg-dark-700 rounded" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 dark:bg-dark-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 dark:bg-dark-700 rounded" />
          <div className="h-4 w-4/6 bg-gray-100 dark:bg-dark-700 rounded" />
        </div>
      </div>
    </div>
  )
}
