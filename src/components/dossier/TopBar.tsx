import { Link } from 'react-router-dom';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { openPalette } from '@/components/palette/events';
import { useContent } from '@/content/ContentProvider';

const TopBar = () => {
  const { profile } = useContent();
  const { theme, toggle } = useTheme();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-20 print:hidden border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-semibold tracking-tight">
          {profile.name}
          <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">@{profile.handle}</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link to="/blog" className="hidden rounded-md px-3 py-2 text-sm hover:bg-secondary sm:block">
            Writeups
          </Link>
          <Link to="/brief" className="hidden rounded-md px-3 py-2 text-sm hover:bg-secondary sm:block">
            One-page brief
          </Link>
          <button
            type="button"
            onClick={() => openPalette()}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search or run</span>
            <kbd className="hidden rounded border border-border px-1.5 font-mono text-xs sm:inline">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
            <span className="sr-only sm:hidden">Open command palette</span>
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default TopBar;
