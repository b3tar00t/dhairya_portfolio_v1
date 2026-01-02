import { Calendar, Clock, Tag } from 'lucide-react';

interface BlogPreviewProps {
  title: string;
  content: string;
  tags: string[];
  date?: string;
  readTime?: string;
}

const BlogPreview = ({ title, content, tags, date, readTime }: BlogPreviewProps) => {
  const normalizeMarkdownImages = (raw: string) => {
    const withLf = raw.replace(/\r\n/g, "\n");

    // Handle split-line markdown like:
    // ![alt]\n(url)
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

  // Markdown-like rendering (same as BlogPost)
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
      
      // Images (markdown format)
      const imageMatch = line.match(/!\s*\[([^\]]*)\]\s*\(\s*([^)]+?)\s*\)/);
      if (imageMatch) {
        const alt = imageMatch[1] ?? '';
        const src = (imageMatch[2] ?? '').trim();

        return (
          <div key={index} className="my-6">
            <img 
              src={src}
              alt={alt}
              loading="lazy"
              className="max-w-full h-auto rounded border border-cyan-900/50"
            />
            {alt && (
              <p className="text-cyan-400/50 text-xs mt-2 text-center">{alt}</p>
            )}
          </div>
        );
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
      
      // Regular list items
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-cyan-400/70 mb-2 flex gap-2">
            <span className="text-cyan-400">→</span>
            <span>{line.slice(2)}</span>
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
              <span>{match[2]}</span>
            </li>
          );
        }
      }
      
      // Inline code
      if (line.includes('`') && !line.startsWith('```')) {
        const parts = line.split(/(`[^`]+`)/);
        return (
          <p key={index} className="text-cyan-400/70 mb-4 leading-relaxed">
            {parts.map((part, i) => 
              part.startsWith('`') && part.endsWith('`') 
                ? <code key={i} className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 font-mono text-sm rounded">{part.slice(1, -1)}</code>
                : part
            )}
          </p>
        );
      }
      
      // Regular paragraphs
      if (line.trim() && !line.startsWith('```')) {
        return (
          <p key={index} className="text-cyan-400/70 mb-4 leading-relaxed">
            {line}
          </p>
        );
      }
      
      return null;
    });
  };

  return (
    <div className="blog-theme">
      <div className="terminal-window-cyan">
        <div className="terminal-header-cyan">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
          </div>
          <span className="flex-1 text-center text-xs text-cyan-400/60 font-mono">
            Preview Mode
          </span>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-cyan-400/50 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date || new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime || '1 min read'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-cyan-400 mb-4" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
            {title || 'Untitled Post'}
          </h1>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-cyan-900/30">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-cyan-900 text-cyan-400/70"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose-terminal">
            {content ? renderContent(content) : (
              <p className="text-cyan-400/50 italic">No content yet...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;
