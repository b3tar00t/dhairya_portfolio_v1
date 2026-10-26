import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'b3ta:theme';

// public/theme-init.js applies the stored or system theme before first paint.
const current = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => {
    const onChange = () => setTheme(current());
    window.addEventListener('b3ta:theme', onChange);
    return () => window.removeEventListener('b3ta:theme', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage unavailable: theme lasts for this visit only.
    }
    window.dispatchEvent(new Event('b3ta:theme'));
  }, []);

  return { theme, toggle };
};
