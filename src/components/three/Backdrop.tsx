import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useMotionTier } from '@/hooks/useMotionTier';
import { useTheme } from '@/hooks/useTheme';

const NetworkField = lazy(() => import('./NetworkField'));

// Read a palette token from CSS so the 3D scene follows the theme.
const cssColor = (token: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v ? `hsl(${v.split(' ').join(', ')})` : '#888';
};

interface BackdropProps {
  /** 'dossier' follows the page theme; 'perimeter' is the gate's amber-on-navy. */
  variant?: 'dossier' | 'perimeter';
}

/**
 * Fixed full-screen 3D network behind the content. Scroll flies the camera
 * through it; the pointer steers it. Skipped entirely under reduced motion.
 */
const Backdrop = ({ variant = 'dossier' }: BackdropProps) => {
  const tier = useMotionTier();
  const { theme } = useTheme();
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(document.hidden);
  const [colors, setColors] = useState({ fg: '#888', bg: '#fff' });

  useEffect(() => {
    if (variant === 'perimeter') setColors({ fg: cssColor('--phosphor'), bg: cssColor('--perimeter') });
    else setColors({ fg: cssColor('--signal'), bg: cssColor('--background') });
  }, [theme, variant]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    const onPointer = (e: PointerEvent) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    const onVisibility = () => setHidden(document.hidden);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (tier === 'none') return null;

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 print:hidden ${variant === 'perimeter' ? '' : '-z-10 opacity-60 dark:opacity-80'}`}>
      <Suspense fallback={null}>
        <NetworkField
          nodes={tier === 'full' ? 170 : 70}
          dpr={tier === 'full' ? undefined : 1}
          color={colors.fg}
          background={colors.bg}
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          paused={hidden}
        />
      </Suspense>
    </div>
  );
};

export default Backdrop;
