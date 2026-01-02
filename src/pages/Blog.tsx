import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Terminal, Loader2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlogStore } from '@/hooks/useBlogStore';

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const { getPublishedBlogs, loading } = useBlogStore();
  const blogs = getPublishedBlogs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogs.forEach(blog => blog.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [blogs]);

  // Parse search query into keywords
  const searchKeywords = useMemo(() => {
    return searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  }, [searchQuery]);

  // Filter blogs based on search keywords and tags
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      // Match ALL keywords (AND logic)
      const matchesSearch = searchKeywords.length === 0 || searchKeywords.every(keyword =>
        blog.title.toLowerCase().includes(keyword) ||
        blog.excerpt.toLowerCase().includes(keyword) ||
        blog.content.toLowerCase().includes(keyword) ||
        blog.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
      
      // Match ANY selected tag (OR logic for multiple tags)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(selectedTag => blog.tags.includes(selectedTag));
      
      return matchesSearch && matchesTags;
    });
  }, [blogs, searchKeywords, selectedTags]);

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredBlogs.slice(start, start + POSTS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background blog-theme">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-cyan-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-cyan-400 font-display text-lg hover:text-cyan-300 transition-colors">
              <Terminal className="w-5 h-5" />
              <span>b3tar00t</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="terminal-window-cyan mb-8">
            <div className="terminal-header-cyan">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>
              <span className="flex-1 text-center text-xs text-cyan-400/60 font-mono">
                cat /var/log/blog.log
              </span>
            </div>
            <div className="p-6">
              <p className="text-cyan-400/60 mb-2 font-mono text-sm">
                <span className="text-cyan-400">$</span> ls ~/blog/
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                Security Blog
              </h1>
              <p className="text-cyan-400/70">
                Thoughts on cybersecurity, OSINT, and digital investigations
              </p>
              <p className="text-cyan-400/50 text-sm mt-4 font-mono">
                <span className="text-cyan-400">[*]</span> Found {filteredBlogs.length} of {blogs.length} posts
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="terminal-window-cyan mb-6">
            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full bg-cyan-950/30 border border-cyan-900/50 text-cyan-300 px-10 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400 placeholder:text-cyan-400/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50 hover:text-cyan-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-cyan-400/50 text-xs font-mono py-1">Filter by tags:</span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                          : 'border-cyan-900 text-cyan-400/70 hover:border-cyan-400 hover:text-cyan-400'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Filters */}
              {(searchQuery || selectedTags.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-cyan-400/50 text-xs font-mono">Active filters:</span>
                  {searchQuery && (
                    <span className="text-xs px-2 py-1 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="text-xs px-2 py-1 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex items-center gap-1 hover:bg-cyan-400/20"
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-cyan-400/70 hover:text-cyan-400 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Blog Posts */}
          {loading ? (
            <div className="terminal-window-cyan p-8 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-cyan-400/60 font-mono">Loading posts...</span>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="terminal-window-cyan p-8 text-center">
              <p className="text-cyan-400/60 font-mono">
                {blogs.length === 0 
                  ? 'No published blog posts yet.' 
                  : 'No posts match your search criteria.'}
              </p>
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-cyan-400 hover:underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedBlogs.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block terminal-window-cyan hover:border-cyan-400 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="terminal-header-cyan">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-cyan-400/50" />
                    </div>
                    <span className="flex-1 text-center text-xs text-cyan-400/40 font-mono">
                      {post.slug}.md
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-cyan-300 group-hover:text-cyan-400 transition-colors mb-2" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}>
                      {post.title}
                    </h2>
                    <p className="text-cyan-400/60 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-400/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                              : 'border-cyan-900 text-cyan-400/70 hover:border-cyan-400 hover:text-cyan-400'
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 text-cyan-400 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-cyan-400/60">$</span> cat {post.slug}.md <span className="animate-pulse">█</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-cyan-900/30">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-cyan-900 text-cyan-400/70 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs border transition-colors ${
                          currentPage === page
                            ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                            : 'border-cyan-900 text-cyan-400/70 hover:border-cyan-400 hover:text-cyan-400'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-cyan-900 text-cyan-400/70 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-cyan-900/30">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-cyan-400/50 text-sm font-mono">
            <span className="text-cyan-400">[EOF]</span> End of blog listing
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
