import { useEffect, useState } from 'react';

/**
 * How much motion this device gets.
 * - full: desktop with a fine pointer — WebGL scenes, tilt, cursor effects
 * - mid: phones and tablets — lighter WebGL, no hover-only effects
 * - none: prefers-reduced-motion — static fallbacks, opacity fades only
 */
export type MotionTier = 'full' | 'mid' | 'none';

const QUERIES = {
  reduce: '(prefers-reduced-motion: reduce)',
  fine: '(hover: hover) and (pointer: fine) and (min-width: 1024px)',
};

const read = (): MotionTier => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'mid';
  if (window.matchMedia(QUERIES.reduce).matches) return 'none';
  return window.matchMedia(QUERIES.fine).matches ? 'full' : 'mid';
};

export const useMotionTier = (): MotionTier => {
  const [tier, setTier] = useState<MotionTier>(read);

  useEffect(() => {
    // Users can flip the OS setting or resize without a reload.
    const lists = Object.values(QUERIES).map((q) => window.matchMedia(q));
    const onChange = () => setTier(read());
    lists.forEach((l) => l.addEventListener('change', onChange));
    return () => lists.forEach((l) => l.removeEventListener('change', onChange));
  }, []);

  return tier;
};
