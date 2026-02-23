import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

import { useLanguage } from '../contexts/LanguageContext';
import { blogService } from '../services';
import { BlogPost } from '../services/types';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!slug) {
      setError(t('blog_post_not_found'));
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const postResponse = await blogService.getPost(slug, language);

        if (!ignore) {
          setPost(postResponse);
          setError(null);
        }

        try {
          const postsResponse = await blogService.getPosts({ published_only: true, language });
          if (!ignore) {
            setAllPosts(Array.isArray(postsResponse.items) ? postsResponse.items : []);
          }
        } catch (listError) {
          console.error('Failed to load post list for sidebar:', listError);
          if (!ignore) {
            setAllPosts([]);
          }
        }
      } catch (requestError) {
        console.error('Failed to load blog post:', requestError);
        if (!ignore) {
          setPost(null);
          setAllPosts([]);
          setError(t('blog_post_load_failed'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchPost();

    return () => {
      ignore = true;
    };
  }, [language, reloadTick, slug, t]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/blog');
    }
  };

  const relatedPosts = useMemo(() => {
    if (!post || allPosts.length === 0) {
      return [];
    }

    return allPosts
      .filter((item) => item.id !== post.id && item.tags?.some((tag) => post.tags?.includes(tag)))
      .slice(0, 3);
  }, [allPosts, post]);

  const latestPosts = useMemo(() => {
    if (allPosts.length === 0) {
      return [];
    }

    return allPosts
      .filter((item) => item.id !== post?.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [allPosts, post?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center text-sm text-primary-300 transition-colors hover:text-primary-100"
        >
          {t('blog_back')}
        </button>

        {loading ? (
          <BlogDetailSkeleton />
        ) : error && !post ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-10 text-center backdrop-blur-lg">
            <p className="mb-6 text-lg text-red-300">{error}</p>
            <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                onClick={() => setReloadTick((prev) => prev + 1)}
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-white transition-colors hover:bg-primary-700"
              >
                {t('common_retry')}
              </button>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
              >
                {t('blog_view_all_posts')}
              </Link>
            </div>
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg"
              >
                {post.cover_image ? (
                  <div className="h-80 bg-black/20">
                    <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-80 items-center justify-center bg-gradient-to-br from-primary-600 to-pink-600">
                    <span className="text-6xl">Article</span>
                  </div>
                )}

                <div className="space-y-8 p-10 md:p-14">
                  <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-primary-200">
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
                          : new Date(post.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </span>
                      {(post.reading_time || post.read_time) && (
                        <span>
                          • {post.reading_time || post.read_time} {t('blog_min_read')}
                        </span>
                      )}
                      <span>
                        • {post.views ?? post.view_count ?? 0} {t('blog_views')}
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary-600/30 px-3 py-1 text-xs uppercase tracking-wide text-primary-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  <section className="blog-markdown text-lg leading-relaxed text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {post.content}
                    </ReactMarkdown>
                  </section>

                  <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-400">
                      {t('blog_last_updated')}{' '}
                      {new Date(post.updated_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/blog"
                        className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-2 text-white transition-colors hover:bg-white/20"
                      >
                        {t('blog_back_to_blog')}
                      </Link>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2 text-white transition-colors hover:bg-primary-700"
                      >
                        {t('blog_share')}
                      </a>
                    </div>
                  </footer>
                </div>
              </motion.article>
            </div>

            <aside className="space-y-6 lg:col-span-1">
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                    <span>--</span>
                    {t('blog_related_posts')}
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group block">
                        <div className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-600 to-pink-600">
                            {relatedPost.cover_image ? (
                              <img
                                src={relatedPost.cover_image}
                                alt={relatedPost.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl">A</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-primary-300">
                              {relatedPost.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-400">
                              {relatedPost.reading_time || relatedPost.read_time || 0} {t('blog_min_read')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {latestPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                    <span>--</span>
                    {t('blog_latest_posts')}
                  </h3>
                  <div className="space-y-4">
                    {latestPosts.map((latestPost) => (
                      <Link key={latestPost.id} to={`/blog/${latestPost.slug}`} className="group block">
                        <div className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary-600 to-pink-600">
                            {latestPost.cover_image ? (
                              <img
                                src={latestPost.cover_image}
                                alt={latestPost.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl">A</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-primary-300">
                              {latestPost.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(latestPost.created_at).toLocaleDateString(
                                language === 'tr' ? 'tr-TR' : 'en-US',
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg">
      <div className="h-80 bg-white/5" />
      <div className="space-y-8 p-10 md:p-14">
        <div className="h-4 w-1/3 rounded bg-white/10" />
        <div className="h-12 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="space-y-4">
          <div className="h-4 rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-4/6 rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-3/6 rounded bg-white/10" />
        </div>
        <div className="h-10 w-40 rounded bg-white/10" />
      </div>
    </div>
  );
}
