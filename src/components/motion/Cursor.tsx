import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMotionTier } from '@/hooks/useMotionTier';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

/**
 * Crosshair cursor: a dot that tracks exactly and a ring that trails on a
 * spring, growing over anything clickable. Desktop only; the system cursor
 * stays visible underneath so nothing is lost if this fails.
 */
const Cursor = () => {
  const tier = useMotionTier();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (tier !== 'full') return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHot(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
    };
  }, [tier, x, y]);

  if (tier !== 'full') return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] mix-blend-difference print:hidden">
      <motion.span
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ x, y }}
      />
      <motion.span
        className="absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-white"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: down ? 0.7 : hot ? 1.6 : 1, opacity: hot ? 1 : 0.6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  );
};

export default Cursor;
