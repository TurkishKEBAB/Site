import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { blogService } from '../services';
import { BlogPost } from '../services/types';
import { mockPosts } from './blogMockData';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language } = useLanguage();

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [language]);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedTag, debouncedSearch]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await blogService.getPosts({ published_only: true, language });
      const items = Array.isArray(response.items) ? response.items : [];
      setPosts(items);
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      setPosts(mockPosts);
      setErrorMessage('Showing sample posts while the API is offline.');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag));
    }

    // Search filter (using debounced value)
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  };

  // Extract all unique tags from posts
  const allTags = ['all', ...new Set(posts.flatMap(post => post.tags || []))];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading blog posts...</div>
      </div>
    );
  }

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
            My <span className="text-primary-400">Blog</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about software development
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
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-2 rounded-full font-medium transition-all capitalize ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {errorMessage && (
            <p className="mt-4 text-center text-sm text-yellow-300">
              {errorMessage}
            </p>
          )}
          
          {/* Result Count Badge */}
          {(searchQuery || selectedTag !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-300 text-sm font-medium">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} found
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">No posts found</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-primary-500/50 transition-all group"
              >
                {/* Post Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-600 to-pink-600">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">📝</span>
                    </div>
                  )}
                  {post.is_featured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="p-6">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary-600/30 text-primary-300 rounded-full text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{post.reading_time || post.read_time || '5'} min read</span>
                  </div>

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  >
                    Read More →
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


