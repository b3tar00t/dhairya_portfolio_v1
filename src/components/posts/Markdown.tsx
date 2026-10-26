import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';

/** Code block with a copy button. */
const CodeBlock = ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const text = e.currentTarget.parentElement?.querySelector('code')?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the text is still selectable.
    }
  };

  return (
    <div className="group relative not-prose my-6">
      <pre {...props} className="overflow-x-auto rounded-md border border-border bg-card p-4 font-mono text-sm leading-relaxed">
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute right-2 top-2 rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground opacity-0 transition-opacity duration-quick hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4 text-signal" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const components: Components = {
  pre: ({ node: _node, ...props }) => <CodeBlock {...props} />,
  a: ({ node: _node, href, ...props }) => {
    const external = href?.startsWith('http');
    return <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />;
  },
  img: ({ node: _node, alt, ...props }) => <img alt={alt ?? ''} loading="lazy" className="rounded-md border border-border" {...props} />,
};

/**
 * Renders post markdown. Raw HTML in the source is not rendered, so a post
 * cannot inject script into the page.
 */
const Markdown = ({ content }: { content: string }) => (
  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-signal prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-blockquote:border-l-signal">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
);

export default Markdown;
