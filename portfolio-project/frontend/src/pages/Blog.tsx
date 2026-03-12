import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { useBlogPosts } from '../hooks/useBlog';

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const { language, t } = useLanguage();

  const { data: postsResponse, isLoading: loading, error: fetchError, refetch } = useBlogPosts({ published_only: true, language });
  const posts = useMemo(() => {
    const items = postsResponse?.items;
    return Array.isArray(items) ? items : [];
  }, [postsResponse]);
  const errorMessage = fetchError ? t('blog_fetch_error') : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (selectedTag !== 'all') {
      filtered = filtered.filter((post) => post.tags?.includes(selectedTag));
    }

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [posts, selectedTag, debouncedSearch]);

  const allTags = useMemo(
    () => ['all', ...new Set(posts.flatMap((post) => post.tags || []))],
    [posts],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <BlogSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
            {t('blog_title_prefix')} <span className="text-primary-600 dark:text-primary-400">{t('blog_title_highlight')}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">{t('blog_subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="mb-6">
            <input
              type="text"
              placeholder={t('blog_search_placeholder')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 px-6 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 dark:backdrop-blur-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-6 py-2 font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                }`}
              >
                {tag === 'all' ? t('common_all') : tag}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-300">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700"
              >
                {t('common_retry')}
              </button>
            </div>
          )}

          {(searchQuery || selectedTag !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <span className="inline-flex items-center rounded-full border border-primary-200 dark:border-primary-500/30 bg-primary-100 dark:bg-primary-600/20 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300">
                {filteredPosts.length} {filteredPosts.length === 1 ? t('blog_result') : t('blog_results')}{' '}
                {t('blog_found')}
              </span>
            </motion.div>
          )}
        </motion.div>

        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <p className="text-2xl text-gray-500 dark:text-gray-400">{t('blog_empty')}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 dark:backdrop-blur-lg transition-all hover:border-gray-300 dark:hover:border-white/30"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-600 to-pink-600">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-6xl">Blog</span>
                    </div>
                  )}
                  {post.is_featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-black">
                      {t('blog_featured')}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary-100 dark:bg-primary-600/30 px-3 py-1 text-xs capitalize text-primary-600 dark:text-primary-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="mb-2 line-clamp-2 text-2xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {post.title}
                  </h2>

                  <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-300">{post.excerpt}</p>

                  <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      {post.reading_time ?? 5} {t('blog_min_read')}
                    </span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300"
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
  );
}

function BlogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-16 text-center">
        <div className="h-12 w-64 mx-auto mb-4 rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-6 w-96 mx-auto rounded bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="mb-6">
        <div className="h-14 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="flex justify-center gap-3 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10">
            <div className="h-48 bg-gray-200 dark:bg-white/10" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-6 w-full rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
