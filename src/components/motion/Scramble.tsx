import { useEffect, useRef, useState } from 'react';
import { useMotionTier } from '@/hooks/useMotionTier';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFX';

interface ScrambleProps {
  text: string;
  /** Total decode time in ms. */
  duration?: number;
}

/**
 * Text that decrypts from random glyphs the first time it scrolls into view,
 * and re-scrambles on hover. Screen readers always get the real text.
 */
const Scramble = ({ text, duration = 700 }: ScrambleProps) => {
  const tier = useMotionTier();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);
  const [active, setActive] = useState(false);
  const frame = useRef(0);

  const run = () => {
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    setActive(true);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      setShown(
        text
          .split('')
          .map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else setActive(false);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (tier === 'none' || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entry.target.closest('[inert]')) {
          run();
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, text]);

  return (
    <span ref={ref} onPointerEnter={tier === 'full' ? run : undefined} className="relative inline-block">
      <span className="sr-only">{text}</span>
      <span aria-hidden className={active ? 'glitching' : undefined}>
        {shown}
      </span>
    </span>
  );
};

export default Scramble;
