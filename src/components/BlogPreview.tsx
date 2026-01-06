import { Calendar, Clock, Tag } from 'lucide-react';

interface BlogPreviewProps {
  title: string;
  content: string;
  tags: string[];
  date?: string;
  readTime?: string;
}

const BlogPreview = ({ title, content, tags, date, readTime }: BlogPreviewProps) => {

  /* ---------------- NORMALIZATION ---------------- */

  const normalizeMarkdownImages = (raw: string) => {
    const withLf = raw.replace(/\r\n/g, '\n');
    return withLf.replace(
      /!\s*\[([^\]]*)\]\s*\n\s*\(\s*([^)]+?)\s*\)/g,
      '![$1]($2)'
    );
  };

  /* ---------------- INLINE PARSER ---------------- */

  const parseInlineElements = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length) {
      const img = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (img) {
        elements.push(
          <img
            key={key++}
            src={img[2]}
            alt={img[1]}
            loading="lazy"
            className="max-w-full rounded my-4 border border-cyan-900/50"
          />
        );
        remaining = remaining.slice(img[0].length);
        continue;
      }

      const link = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (link) {
        elements.push(
          <a
            key={key++}
            href={link[2]}
            className="text-cyan-300 underline hover:text-cyan-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link[1]}
          </a>
        );
        remaining = remaining.slice(link[0].length);
        continue;
      }

      const bold = remaining.match(/^\*\*([^*]+)\*\*/);
      if (bold) {
        elements.push(<strong key={key++} className="text-cyan-300">{bold[1]}</strong>);
        remaining = remaining.slice(bold[0].length);
        continue;
      }

      const italic = remaining.match(/^\*([^*]+)\*/);
      if (italic) {
        elements.push(<em key={key++} className="text-cyan-300/90">{italic[1]}</em>);
        remaining = remaining.slice(italic[0].length);
        continue;
      }

      const code = remaining.match(/^`([^`]+)`/);
      if (code) {
        elements.push(
          <code key={key++} className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded text-sm">
            {code[1]}
          </code>
        );
        remaining = remaining.slice(code[0].length);
        continue;
      }

      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return elements;
  };

  /* ---------------- MARKDOWN RENDERER ---------------- */

  const renderContent = (raw: string) => {
    const lines = normalizeMarkdownImages(raw).split('\n');
    const elements: React.ReactNode[] = [];

    let inCode = false;
    let codeBuffer: string[] = [];
    let listBuffer: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (!listType || !listBuffer.length) return;
      elements.push(
        listType === 'ul'
          ? <ul key={elements.length} className="my-4 space-y-2">{listBuffer}</ul>
          : <ol key={elements.length} className="my-4 space-y-2">{listBuffer}</ol>
      );
      listBuffer = [];
      listType = null;
    };

    lines.forEach((line, index) => {

      /* CODE BLOCKS */
      if (line.startsWith('```')) {
        if (inCode) {
          elements.push(
            <pre key={index} className="my-4 p-4 bg-cyan-950 text-cyan-300 rounded overflow-x-auto text-sm">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCode = false;
        } else {
          flushList();
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeBuffer.push(line);
        return;
      }

      /* HEADINGS (order matters) */
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-cyan-300 mt-6 mb-3">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-bold text-cyan-400 mt-8 mb-4">
            {line.slice(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold text-cyan-400 mt-10 mb-6"
            style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}
          >
            {line.slice(2)}
          </h1>
        );
        return;
      }

      /* BLOCKQUOTE */
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-2 border-cyan-400 pl-4 my-4 text-cyan-400/70 italic">
            {parseInlineElements(line.slice(2))}
          </blockquote>
        );
        return;
      }

      /* ORDERED LIST */
      if (/^\d+\. /.test(line)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const [, num, text] = line.match(/^(\d+)\. (.+)/)!;
        listBuffer.push(
          <li key={index} className="flex gap-2 text-cyan-400/70">
            <span className="font-mono">{num}.</span>
            <span>{parseInlineElements(text)}</span>
          </li>
        );
        return;
      }

      /* UNORDERED LIST */
      if (line.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listBuffer.push(
          <li key={index} className="flex gap-2 text-cyan-400/70">
            <span>→</span>
            <span>{parseInlineElements(line.slice(2))}</span>
          </li>
        );
        return;
      }

      /* STANDALONE IMAGE */
      const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (img) {
        flushList();
        elements.push(
          <img
            key={index}
            src={img[2]}
            alt={img[1]}
            loading="lazy"
            className="max-w-full rounded my-6 border border-cyan-900/50"
          />
        );
        return;
      }

      /* PARAGRAPH */
      if (line.trim()) {
        flushList();
        elements.push(
          <p key={index} className="text-cyan-400/70 mb-4 leading-relaxed">
            {parseInlineElements(line)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  /* ---------------- JSX ---------------- */

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
          <div className="flex gap-4 text-xs text-cyan-400/50 mb-4">
            <span><Calendar className="inline w-3 h-3 mr-1" />{date || new Date().toLocaleDateString()}</span>
            <span><Clock className="inline w-3 h-3 mr-1" />{readTime || '1 min read'}</span>
          </div>

          <h1 className="text-2xl font-bold text-cyan-400 mb-4">
            {title || 'Untitled Post'}
          </h1>

          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6 border-b border-cyan-900/30 pb-6">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs border border-cyan-900 text-cyan-400/70 flex gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

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
