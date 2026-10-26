import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { STAGES, type StageId } from './stages';
import { useMotionTier } from '@/hooks/useMotionTier';

const GLYPHS = '#%&*+=/\\<>[]{}01xX@$';

// Stable cipher text per stage, so locked labels don't flicker between renders.
const cipher = (text: string, seed: number) =>
  text
    .split('')
    .map((_, i) => GLYPHS[(seed * 7 + i * 13 + text.length) % GLYPHS.length])
    .join('');

/** Tracks which stage is on screen. */
const useActiveStage = () => {
  const [active, setActive] = useState<StageId>('recon');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id as StageId);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
};

/** A label that stays encrypted until unlocked, then decrypts in place. */
const Decrypt = ({ text, seed, locked }: { text: string; seed: number; locked: boolean }) => {
  const tier = useMotionTier();
  const [shown, setShown] = useState(() => (locked ? cipher(text, seed) : text));
  const wasLocked = useRef(locked);

  useEffect(() => {
    if (locked) {
      setShown(cipher(text, seed));
      wasLocked.current = true;
      return;
    }
    if (!wasLocked.current || tier === 'none') {
      setShown(text);
      return;
    }
    wasLocked.current = false;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 600);
      const settled = Math.floor(p * text.length);
      setShown(text.split('').map((ch, i) => (i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [locked, text, seed, tier]);

  return <span className={locked ? 'font-mono tracking-wider' : undefined}>{shown}</span>;
};

/**
 * The attack chain as a progress rail. Stages ahead of the reader are
 * encrypted; each one decrypts the first time it's reached. A packet rides
 * the line down to the current stage.
 */
const Rail = () => {
  const active = useActiveStage();
  const activeIndex = STAGES.findIndex((s) => s.id === active);
  const [reached, setReached] = useState(0);
  const tier = useMotionTier();

  useEffect(() => {
    setReached((r) => Math.max(r, activeIndex));
  }, [activeIndex]);

  const progress = (activeIndex + 1) / STAGES.length;
  const compromised = reached + 1;

  return (
    <>
      <nav aria-label="Sections" className="sticky top-24 hidden self-start lg:block">
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          kill chain{' '}
          <span className="text-signal">
            {compromised}/{STAGES.length}
          </span>
        </p>
        <ol className="relative space-y-1">
          <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-border" />
          <motion.span
            aria-hidden
            className="absolute left-[5px] top-2 w-px origin-top bg-signal shadow-[0_0_8px_hsl(var(--signal))]"
            style={{ height: 'calc(100% - 1rem)' }}
            animate={{ scaleY: activeIndex / (STAGES.length - 1) }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          {STAGES.map((s, i) => {
            const isActive = s.id === active;
            const locked = i > reached;
            return (
              <li key={s.id} className="relative">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={locked ? `${s.label} (not yet reached)` : s.label}
                  title={locked ? 'Encrypted. Keep scrolling to decrypt.' : s.title}
                  className={`group flex items-center gap-3 py-1.5 text-sm transition-colors duration-quick ${
                    isActive ? 'font-semibold text-foreground' : locked ? 'text-muted-foreground/60' : 'text-foreground/70'
                  } hover:text-signal`}
                >
                  <span aria-hidden className="relative flex h-[11px] w-[11px] items-center justify-center">
                    <span
                      className={`h-[7px] w-[7px] rounded-full border ${
                        isActive ? 'border-signal bg-signal' : locked ? 'border-border bg-background' : 'border-signal/70 bg-signal/40'
                      }`}
                    />
                    {isActive && tier !== 'none' && (
                      <motion.span
                        className="absolute inset-0 rounded-full border border-signal"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 2.6, opacity: 0 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </span>
                  <span className="font-mono text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <Decrypt text={s.label} seed={i} locked={locked} />
                  <AnimatePresence>
                    {locked && (
                      <motion.span
                        aria-hidden
                        exit={{ opacity: 0, scale: 0.5, rotate: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Lock className="h-3 w-3" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Small screens: progress strip plus the current stage */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-30 h-0.5 bg-border/60 lg:hidden">
        <motion.div
          className="h-full origin-left bg-signal shadow-[0_0_8px_hsl(var(--signal))]"
          animate={{ scaleX: progress }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <p
        aria-hidden
        className="fixed bottom-4 left-4 z-30 rounded-sm border border-border bg-card/90 px-3 py-1.5 font-mono text-xs backdrop-blur lg:hidden"
      >
        <span className="text-signal">{String(activeIndex + 1).padStart(2, '0')}/{STAGES.length}</span> {STAGES[activeIndex].label}
      </p>
    </>
  );
};

export default Rail;
