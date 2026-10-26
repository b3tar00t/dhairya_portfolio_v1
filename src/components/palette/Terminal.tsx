import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FLAGS } from '@/lib/flags';
import { useFlags } from '@/hooks/useAccess';
import { useTheme } from '@/hooks/useTheme';
import { track } from '@/lib/analytics';
import { useContent } from '@/content/ContentProvider';

interface Line {
  kind: 'in' | 'out' | 'err';
  text: string;
}

const HELP = [
  'help              list commands',
  'whoami            who runs this box',
  'ls                list projects',
  'open <project>    open a project case file',
  'cat resume        download the resume',
  'jobs              work history',
  'submit <flag>     submit a flag you found',
  'flags             your flag progress',
  'theme             toggle light and dark',
  'clear             clear the screen',
  'exit              close the terminal',
].join('\n');

interface TerminalProps {
  onClose: () => void;
  resumeUrl: string;
}

const Terminal = ({ onClose, resumeUrl }: TerminalProps) => {
  const { experience, profile, projects } = useContent();
  const navigate = useNavigate();
  const { found, submit } = useFlags();
  const { toggle } = useTheme();
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: `${profile.handle} shell. Type "help" to start.` }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const print = (text: string, kind: Line['kind'] = 'out') => setLines((l) => [...l, { kind, text }]);

  const run = async (raw: string) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    switch (cmd?.toLowerCase()) {
      case '':
      case undefined:
        return;
      case 'help':
        return print(HELP);
      case 'whoami':
        return print(`${profile.name} (${profile.handle})\n${profile.role}. ${profile.focus}.\n${profile.summary}`);
      case 'ls':
        return print(projects.map((p) => `${p.slug.padEnd(10)} ${p.tagline}`).join('\n'));
      case 'jobs':
        return print(experience.map((j) => `${j.period.padEnd(22)} ${j.role}, ${j.org}`).join('\n'));
      case 'open': {
        const p = projects.find((x) => x.slug === arg.toLowerCase());
        if (!p) return print(`open: no such project "${arg}". Try "ls".`, 'err');
        onClose();
        return navigate(`/projects/${p.slug}`);
      }
      case 'cat':
        if (arg === 'resume' || arg === 'resume.pdf') {
          track('resume_download', 'terminal');
          window.open(resumeUrl, '_blank', 'noopener');
          return print('Opening resume.pdf in a new tab.');
        }
        if (arg === 'flag' || arg === 'flag.txt') return print('Nice try. Flags are hidden around the site, not in here.', 'err');
        return print(`cat: ${arg || 'missing file'}: no such file. Try "cat resume".`, 'err');
      case 'submit': {
        if (!arg) return print('Usage: submit flag{...}', 'err');
        const { flag, isNew } = await submit(arg);
        if (!flag) return print('Rejected. That is not one of the five flags.', 'err');
        return print(isNew ? `Accepted: ${flag.id}. ${found.length + 1}/${FLAGS.length} found.` : `Already found: ${flag.id}.`);
      }
      case 'flags':
        return print(
          FLAGS.map((f) => `${found.includes(f.id) ? '[x]' : '[ ]'} ${found.includes(f.id) ? f.id : f.hint}`).join('\n'),
        );
      case 'theme':
        toggle();
        return print('Theme switched.');
      case 'sudo':
        return print(`${profile.handle} is not in the sudoers file. This incident will be reported.`, 'err');
      case 'rm':
        return print('Permission denied. Row-level security says no.', 'err');
      case 'clear':
        return setLines([]);
      case 'exit':
        return onClose();
      default:
        return print(`${cmd}: command not found. Type "help".`, 'err');
    }
  };

  const handleKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = input;
      setLines((l) => [...l, { kind: 'in', text: value }]);
      if (value.trim()) setHistory((h) => [value, ...h]);
      setInput('');
      setCursor(-1);
      await run(value);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setInput(next >= 0 ? history[next] : '');
    }
  };

  return (
    <div className="flex h-[min(70vh,28rem)] flex-col bg-perimeter font-mono text-sm text-phosphor">
      <div className="flex-1 overflow-y-auto p-4" aria-live="polite">
        {lines.map((l, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap break-words font-mono ${l.kind === 'err' ? 'text-[hsl(352_100%_72%)]' : l.kind === 'in' ? 'text-phosphor' : 'text-[hsl(37_60%_88%)]'}`}
          >
            {l.kind === 'in' ? `$ ${l.text}` : l.text}
          </pre>
        ))}
        <div ref={endRef} />
      </div>
      <label className="flex items-center gap-2 border-t border-phosphor/20 px-4 py-3">
        <span aria-hidden>$</span>
        <span className="sr-only">Terminal command</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-phosphor caret-phosphor focus:outline-none"
        />
      </label>
    </div>
  );
};

export default Terminal;
