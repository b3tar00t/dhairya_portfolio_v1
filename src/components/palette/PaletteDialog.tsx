import { useNavigate } from 'react-router-dom';
import { BookOpen, Download, FileText, FolderGit2, Hash, Moon, SquareTerminal } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import Terminal from './Terminal';
import { STAGES } from '@/components/dossier/stages';
import { useTheme } from '@/hooks/useTheme';
import { useContent } from '@/content/ContentProvider';
import { track } from '@/lib/analytics';

export type Mode = 'commands' | 'terminal';

interface PaletteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  resumeUrl: string;
}

/** The palette's dialog. Loaded on first open, so cmdk stays out of the main bundle. */
const PaletteDialog = ({ open, setOpen, mode, setMode, resumeUrl }: PaletteDialogProps) => {
  const { projects } = useContent();
  const navigate = useNavigate();
  const { toggle } = useTheme();
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

export default PaletteDialog;
