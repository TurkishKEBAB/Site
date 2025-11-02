import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '../services';
import { BlogPost } from '../services/types';
import { mockPosts } from './blogMockData';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!slug) {
      setError('Post not found.');
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const [postResponse, postsResponse] = await Promise.all([
          blogService.getPost(slug),
          blogService.getPosts({ is_published: true })
        ]);
        
        if (!ignore) {
          setPost(postResponse);
          setAllPosts(Array.isArray(postsResponse.items) ? postsResponse.items : []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
        if (!ignore) {
          const fallback = mockPosts.find((item) => item.slug === slug);
          if (fallback) {
            setPost(fallback);
            setAllPosts(mockPosts);
            setError('Showing sample content while the API is offline.');
          } else {
            setError('Unable to load this blog post.');
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      ignore = true;
    };
  }, [slug]);

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

  // Get related posts (same tags, excluding current post)
  const relatedPosts = post && allPosts.length > 0
    ? allPosts
        .filter(p => p.id !== post.id && p.tags?.some(tag => post.tags?.includes(tag)))
        .slice(0, 3)
    : [];

  // Get latest posts (excluding current post)
  const latestPosts = allPosts.length > 0
    ? allPosts
        .filter(p => p.id !== post?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center text-sm text-purple-300 hover:text-purple-100 transition-colors"
        >
          ← Back
        </button>

        {loading ? (
          <BlogDetailSkeleton />
        ) : error && !post ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center border border-white/20">
            <p className="text-lg text-red-300 mb-6">{error}</p>
            <Link
              to="/blog"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              View all posts
            </Link>
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden"
              >
                {post.cover_image ? (
                  <div className="h-80 bg-black/20">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-6xl">📝</span>
                  </div>
                )}

                <div className="p-10 md:p-14 space-y-8">
                  <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-purple-200">
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}</span>
                      {post.read_time && <span>• {post.read_time} min read</span>}
                      <span>• {post.view_count} views</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{post.title}</h1>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-purple-600/30 text-purple-200 text-xs uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-yellow-300">{error}</p>
                    )}
                  </header>

                  <section className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
                    {post.content}
                  </section>

                  <footer className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-400">
                      Last updated {new Date(post.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/blog"
                        className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        Back to Blog
                      </Link>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        Share
                      </a>
                    </div>
                  </footer>
                </div>
              </motion.article>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔗</span>
                    Related Posts
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        to={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                            {relatedPost.cover_image ? (
                              <img
                                src={relatedPost.cover_image}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📝
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
                              {relatedPost.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {relatedPost.read_time} min read
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Latest Posts */}
              {latestPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>✨</span>
                    Latest Posts
                  </h3>
                  <div className="space-y-4">
                    {latestPosts.map((latestPost) => (
                      <Link
                        key={latestPost.id}
                        to={`/blog/${latestPost.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                            {latestPost.cover_image ? (
                              <img
                                src={latestPost.cover_image}
                                alt={latestPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📝
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
                              {latestPost.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(latestPost.created_at).toLocaleDateString()}
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
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden animate-pulse">
      <div className="h-80 bg-white/5" />
      <div className="p-10 md:p-14 space-y-8">
        <div className="h-4 w-1/3 bg-white/10 rounded" />
        <div className="h-12 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/10 rounded" />
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
          <div className="h-4 bg-white/10 rounded w-4/6" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
          <div className="h-4 bg-white/10 rounded w-3/6" />
        </div>
        <div className="h-10 w-40 bg-white/10 rounded" />
      </div>
    </div>
  );
}
