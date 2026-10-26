import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Download, FileText, FolderGit2, Hash, Moon, SquareTerminal } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import Terminal from './Terminal';
import { PALETTE_EVENT } from './events';
import { track } from '@/lib/analytics';
import { STAGES } from '@/components/dossier/stages';
import { useTheme } from '@/hooks/useTheme';
import { useContent } from '@/content/ContentProvider';

type Mode = 'commands' | 'terminal';

const CommandPalette = ({ resumeUrl }: { resumeUrl: string }) => {
  const { projects } = useContent();
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('commands');

  useEffect(() => {
    if (open) track('palette_open', mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setMode('commands');
        setOpen((o) => !o);
      } else if (e.key === '`' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setMode('terminal');
        setOpen(true);
      }
    };
    const onOpen = (e: Event) => {
      setMode((e as CustomEvent<Mode>).detail ?? 'commands');
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  const go = (action: () => void) => {
    setOpen(false);
    action();
  };

  const goToSection = (id: string) =>
    go(() => {
      if (window.location.pathname !== '/') navigate(`/#${id}`);
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <DialogTitle className="sr-only">{mode === 'terminal' ? 'Terminal' : 'Command palette'}</DialogTitle>
        {mode === 'terminal' ? (
          <Terminal onClose={() => setOpen(false)} resumeUrl={resumeUrl} />
        ) : (
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5">
            <CommandInput placeholder="Jump to a section, project or action" />
            <CommandList className="max-h-[min(60vh,24rem)]">
              <CommandEmpty>No match. Try “terminal” or a project name.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => go(() => { track('resume_download', 'palette'); window.open(resumeUrl, '_blank', 'noopener'); })}>
                  <Download className="mr-2 h-4 w-4" /> Download resume
                </CommandItem>
                <CommandItem onSelect={() => go(() => navigate('/brief'))}>
                  <FileText className="mr-2 h-4 w-4" /> Read the one-page brief
                </CommandItem>
                <CommandItem onSelect={() => setMode('terminal')} value="terminal shell console">
                  <SquareTerminal className="mr-2 h-4 w-4" /> Open the terminal
                </CommandItem>
                <CommandItem onSelect={() => go(toggle)}>
                  <Moon className="mr-2 h-4 w-4" /> Toggle light and dark theme
                </CommandItem>
                <CommandItem onSelect={() => go(() => navigate('/blog'))}>
                  <BookOpen className="mr-2 h-4 w-4" /> Browse writeups and blog
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Projects">
                {projects.map((p) => (
                  <CommandItem key={p.slug} value={`${p.name} ${p.tagline}`} onSelect={() => go(() => navigate(`/projects/${p.slug}`))}>
                    <FolderGit2 className="mr-2 h-4 w-4" /> {p.name}
                    <span className="ml-2 truncate text-muted-foreground">{p.tagline}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Sections">
                {STAGES.map((s) => (
                  <CommandItem key={s.id} value={`${s.label} ${s.title}`} onSelect={() => goToSection(s.id)}>
                    <Hash className="mr-2 h-4 w-4" /> {s.label}
                    <span className="ml-2 text-muted-foreground">{s.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
