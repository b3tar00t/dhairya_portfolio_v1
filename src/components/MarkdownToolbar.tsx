import { Bold, Italic, Heading1, Heading2, Heading3, Link, Code, List, Quote } from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
}

const MarkdownToolbar = ({ onInsert }: MarkdownToolbarProps) => {
  const tools = [
    { icon: Heading1, label: 'H1', action: () => onInsert('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'H2', action: () => onInsert('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'H3', action: () => onInsert('### ', '', 'Heading 3') },
    { icon: Bold, label: 'Bold', action: () => onInsert('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => onInsert('*', '*', 'italic text') },
    { icon: Link, label: 'Link', action: () => onInsert('[', '](url)', 'link text') },
    { icon: Code, label: 'Code', action: () => onInsert('`', '`', 'code') },
    { icon: List, label: 'List', action: () => onInsert('- ', '', 'list item') },
    { icon: Quote, label: 'Quote', action: () => onInsert('> ', '', 'quote') },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-secondary/30 border border-border rounded-t mb-0">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={tool.action}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onInsert('\n```\n', '\n```\n', 'code block')}
        className="px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors font-mono"
        title="Code Block"
      >
        {'</>'}
      </button>
    </div>
  );
};

export default MarkdownToolbar;
