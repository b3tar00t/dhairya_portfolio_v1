import { lazy, Suspense, useEffect, useState } from 'react';
import { PALETTE_EVENT } from './events';
import { track } from '@/lib/analytics';
import type { Mode } from './PaletteDialog';

const PaletteDialog = lazy(() => import('./PaletteDialog'));

/**
 * Listens for Ctrl/Cmd+K, the backtick key and openPalette() calls. The
 * dialog itself loads the first time it's opened and stays mounted after,
 * so its close animation still plays.
 */
const CommandPalette = ({ resumeUrl }: { resumeUrl: string }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('commands');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setLoaded(true);
      track('palette_open', mode);
    }
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

  if (!loaded) return null;

  return (
    <Suspense fallback={null}>
      <PaletteDialog open={open} setOpen={setOpen} mode={mode} setMode={setMode} resumeUrl={resumeUrl} />
    </Suspense>
  );
};

export default CommandPalette;
