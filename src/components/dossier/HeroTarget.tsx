import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotionTier } from '@/hooks/useMotionTier';
import { useTheme } from '@/hooks/useTheme';

const Target = lazy(() => import('@/components/three/Target'));

const cssColor = (token: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v ? `hsl(${v.split(' ').join(', ')})` : '#888';
};

const LINES = [
  'Breach logged.',
  'It rebuilt itself. Try again.',
  'Persistent, aren’t you.',
  'This is what my job feels like.',
  'Fine. You win. Now read the dossier.',
];

/** Interactive 3D object in the hero: drag to spin, click (or Enter) to shatter. */
const HeroTarget = () => {
  const tier = useMotionTier();
  const { theme } = useTheme();
  const [breaches, setBreaches] = useState(0);
  const [colors, setColors] = useState({ color: '#888', accent: '#888' });
  const dragRef = useRef({ dx: 0, dy: 0, dragging: false });
  const last = useRef({ x: 0, y: 0, moved: 0 });

  useEffect(() => {
    setColors({ color: cssColor('--foreground'), accent: cssColor('--signal') });
  }, [theme]);

  if (tier === 'none') return null;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current.dragging = true;
    last.current = { x: e.clientX, y: e.clientY, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    dragRef.current.dx += dx;
    dragRef.current.dy += dy;
    last.current = { x: e.clientX, y: e.clientY, moved: last.current.moved + Math.abs(dx) + Math.abs(dy) };
  };
  const onPointerUp = () => {
    dragRef.current.dragging = false;
    // A press without much movement is a click: breach it.
    if (last.current.moved < 6) setBreaches((b) => b + 1);
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
      <button
        type="button"
        aria-label="3D target. Drag to rotate, press Enter to shatter it."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragRef.current.dragging = false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setBreaches((b) => b + 1);
          }
        }}
        className="absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing"
      >
        <Suspense fallback={<span className="block h-full w-full animate-pulse rounded-full bg-secondary/40" />}>
          <Target
            color={colors.color}
            accent={colors.accent}
            breaches={breaches}
            detail={tier === 'full' ? 2 : 1}
            dragRef={dragRef}
          />
        </Suspense>
      </button>
      <p className="pointer-events-none absolute inset-x-0 -bottom-2 text-center font-mono text-sm text-muted-foreground" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.span
            key={breaches}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            {breaches === 0 ? 'Drag to inspect. Click to breach.' : LINES[Math.min(breaches, LINES.length) - 1]}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
};

export default HeroTarget;
