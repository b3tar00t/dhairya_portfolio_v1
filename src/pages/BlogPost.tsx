import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Terminal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useBlogStore } from '@/hooks/useBlogStore';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogBySlug, getPublishedBlogs, loading } = useBlogStore();
  const post = slug ? getBlogBySlug(slug) : null;
  const allPosts = getPublishedBlogs();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const normalizeMarkdownImages = (raw: string) => {
    const withLf = raw.replace(/\r\n/g, "\n");

    // Handle split-line markdown like:
    // ![alt]
    // (url)
    const fixSplit = withLf.replace(
      /!\s*\[([^\]]*)\]\s*\n\s*\(\s*([^)]+?)\s*\)/g,
      "![$1]($2)"
    );

    // Normalize extra spaces inside the image syntax
    const fixSpaces = fixSplit.replace(
      /!\s*\[([^\]]*)\]\s*\(\s*([^)]+?)\s*\)/g,
      "![$1]($2)"
    );

    return fixSpaces;
  };

  // Parse inline elements (bold, italic, links, images, code)
  const parseInlineElements = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Image: ![alt](url)
      const imgMatch = remaining.match(/^!\s*\[([^\]]*)\]\s*\(\s*([^)]+?)\s*\)/);
      if (imgMatch) {
        const alt = imgMatch[1] ?? '';
        const src = (imgMatch[2] ?? '').trim();

        elements.push(
          <img
            key={key++}
            src={src}
            alt={alt}
            loading="lazy"
            className="max-w-full h-auto rounded my-4 border border-cyan-900/50"
          />
        );
        remaining = remaining.slice(imgMatch[0].length);
        continue;
      }

      // Link: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a 
            key={key++} 
            href={linkMatch[2]} 
            className="text-cyan-300 underline hover:text-cyan-400 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        elements.push(<strong key={key++} className="text-cyan-300">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        elements.push(<em key={key++} className="text-cyan-300/90">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <code key={key++} className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 font-mono text-sm rounded">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Regular character
      const nextSpecial = remaining.search(/[!\[*`]/);
      if (nextSpecial === -1) {
        elements.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        elements.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        elements.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return elements;
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const normalized = normalizeMarkdownImages(content);

    return normalized.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-cyan-400 mt-8 mb-4" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}>
            <span className="text-cyan-400/50"># </span>{line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-cyan-300 mt-6 mb-3">
            <span className="text-cyan-400/50">## </span>{line.slice(4)}
          </h3>
        );
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        return null; // Handle in a more sophisticated way if needed
      }
      
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-2 border-cyan-400 pl-4 my-4 text-cyan-400/70 italic">
            {line.slice(2)}
          </blockquote>
        );
      }
      
      // List items with bold
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\* - (.+)/);
        if (match) {
          return (
            <li key={index} className="text-cyan-400/70 mb-2 flex gap-2">
              <span className="text-cyan-400">→</span>
              <span><strong className="text-cyan-300">{match[1]}</strong> - {match[2]}</span>
            </li>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-cyan-400/70 mb-2 flex gap-2">
            <span className="text-cyan-400">→</span>
            <span>{parseInlineElements(line.slice(2))}</span>
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\. /.test(line)) {
        const match = line.match(/^(\d+)\. (.+)/);
        if (match) {
          return (
            <li key={index} className="text-cyan-400/70 mb-2 flex gap-2">
              <span className="text-cyan-400 font-mono">{match[1]}.</span>
              <span>{parseInlineElements(match[2])}</span>
            </li>
          );
        }
      }

      // Image on its own line
      const imageMatch = line.trim().match(/^!\s*\[([^\]]*)\]\s*\(\s*([^)]+?)\s*\)$/);
      if (imageMatch) {
        const alt = imageMatch[1] ?? '';
        const src = (imageMatch[2] ?? '').trim();

        return (
          <img
            key={index}
            src={src}
            alt={alt}
            loading="lazy"
            className="max-w-full h-auto rounded my-4 border border-cyan-900/50"
          />
        );
      }
      
      // Regular paragraphs with inline elements
      if (line.trim() && !line.startsWith('```')) {
        return (
          <p key={index} className="text-cyan-400/70 mb-4 leading-relaxed">
            {parseInlineElements(line)}
          </p>
        );
      }
      
      return null;
    });
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
            <Link to="/blog" className="flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              All Posts
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Article Header */}
          <article className="terminal-window-cyan">
            <div className="terminal-header-cyan">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>
              <span className="flex-1 text-center text-xs text-cyan-400/60 font-mono">
                cat ~/blog/{post.slug}.md
              </span>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-400/50 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.read_time}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-4" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                {post.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-cyan-900/30">
                {post.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-cyan-900 text-cyan-400/70"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="prose-terminal">
                {renderContent(post.content)}
              </div>

              {/* End marker */}
              <div className="mt-12 pt-8 border-t border-cyan-900/30 text-center">
                <p className="text-cyan-400/50 text-sm font-mono">
                  <span className="text-cyan-400">[EOF]</span> End of article
                </p>
              </div>
            </div>
          </article>

          {/* Navigation */}
          <div className="flex justify-between mt-8 gap-4">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="flex-1 terminal-window-cyan p-4 hover:border-cyan-400 transition-colors group"
              >
                <div className="flex items-center gap-2 text-cyan-400/50 text-xs mb-2">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </div>
                <p className="text-cyan-300 group-hover:text-cyan-400 transition-colors text-sm truncate">
                  {prevPost.title}
                </p>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="flex-1 terminal-window-cyan p-4 hover:border-cyan-400 transition-colors group text-right"
              >
                <div className="flex items-center justify-end gap-2 text-cyan-400/50 text-xs mb-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </div>
                <p className="text-cyan-300 group-hover:text-cyan-400 transition-colors text-sm truncate">
                  {nextPost.title}
                </p>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
