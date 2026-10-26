import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Github, Star, X } from 'lucide-react';
import type { Project } from '@/data/profile';
import { useMotionTier } from '@/hooks/useMotionTier';
import { track } from '@/lib/analytics';

const statusLabel: Record<Project['status'], string> = {
  active: 'Active',
  beta: 'Beta',
  stable: 'Stable',
  archived: 'Archived',
};

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };

/** The visible face of a case file. Shared by the deck and the opened view. */
const Folder = ({ p, index }: { p: Project; index: number }) => (
  <>
    <div className="absolute -top-7 left-6 h-8 w-40 rounded-t-lg border border-b-0 border-border bg-card px-4 pt-1.5 font-mono text-xs text-muted-foreground">
      Case {String(index + 1).padStart(2, '0')}
    </div>
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono text-sm text-muted-foreground">{p.year}</span>
      <span className="stamp text-xs">{statusLabel[p.status]}</span>
    </div>
    <h3 className="display mt-6 text-4xl sm:text-5xl">{p.name}</h3>
    <p className="mt-3 text-lg">{p.tagline}</p>
    <ul className="mt-6 flex flex-wrap gap-2">
      {p.stack.slice(0, 4).map((s) => (
        <li key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          {s}
        </li>
      ))}
    </ul>
    {p.stars ? (
      <p className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Star className="h-4 w-4" aria-hidden /> {p.stars} stars
      </p>
    ) : null}
  </>
);

/**
 * Projects as a 3D deck of case files. Drag or use the arrows to flip
 * through; click the front file to lift it out and open it.
 */
const CaseDeck = ({ projects }: { projects: Project[] }) => {
  const tier = useMotionTier();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<Project | null>(null);
  const count = projects.length;
  // A drag ends with a click event; ignore that click so a flip doesn't also open.
  const dragged = useRef(false);
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (dragged.current = false), 0);
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const flat = tier === 'none';

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div className="relative h-[26rem] sm:h-[24rem]" style={{ perspective: 1400 }}>
        {projects.map((p, i) => {
          // Offset from the front card, wrapped so the deck loops.
          let o = i - index;
          if (o > count / 2) o -= count;
          if (o < -count / 2) o += count;
          const front = o === 0;
          const hidden = Math.abs(o) > 2;
          return (
            <motion.div
              key={p.slug}
              className="absolute inset-x-0 top-8 mx-auto w-full max-w-xl"
              style={{ zIndex: 10 - Math.abs(o), transformStyle: 'preserve-3d' }}
              initial={false}
              animate={
                flat
                  ? { opacity: front ? 1 : 0, x: 0 }
                  : {
                      x: `${o * 34}%`,
                      z: -Math.abs(o) * 160,
                      rotateY: o * -24,
                      opacity: hidden ? 0 : 1,
                      filter: front ? 'brightness(1)' : `brightness(${1 - Math.abs(o) * 0.18})`,
                      scale: front ? 1 : 0.92,
                    }
              }
              transition={SPRING}
              aria-hidden={!front}
            >
              <motion.button
                type="button"
                tabIndex={front ? 0 : -1}
                onClick={() => {
                  if (dragged.current) return;
                  if (front) {
                    setOpen(p);
                    track('project_open', p.slug);
                  }
                  else setIndex(i);
                }}
                onDragStart={() => (dragged.current = true)}
                drag={front && !flat ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={onDragEnd}
                whileTap={front ? { scale: 0.98 } : undefined}
                className="hud relative block w-full rounded-lg border border-border bg-card p-7 text-left shadow-[0_30px_60px_-30px_hsl(var(--ink)/0.45)] sm:p-9"
                aria-label={front ? `${p.name}: ${p.tagline}. Open case file.` : `Show ${p.name}`}
              >
                <Folder p={p} index={i} />
                {front && <p className="mt-6 text-sm font-semibold text-signal">Click to open, drag to flip</p>}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label="Previous project" className="rounded-full border border-border p-2.5 hover:border-foreground/40">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Choose project">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={p.name}
              onClick={() => setIndex(i)}
              className="relative h-2 w-6 overflow-hidden rounded-full bg-border"
            >
              {i === index && <motion.span layoutId="deck-dot" className="absolute inset-0 bg-signal" transition={SPRING} />}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next project" className="rounded-full border border-border p-2.5 hover:border-foreground/40">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Opened case file: lifts up and tips toward the viewer. Portalled so the
          section's 3D transform doesn't trap the fixed overlay. */}
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button type="button" aria-label="Close case file" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(null)} />
            <motion.div
              initial={flat ? { opacity: 0 } : { opacity: 0, y: 60, rotateX: 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={flat ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
              style={{ transformPerspective: 1200 }}
              role="dialog"
              aria-modal="true"
              aria-label={open.name}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-7 pt-16 sm:p-10 sm:pt-16"
              transition={SPRING}
            >
              <button type="button" autoFocus onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 rounded-md p-2 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
              <Folder p={open} index={projects.indexOf(open)} />
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <p className="mt-6 text-muted-foreground">{open.problem}</p>
                <ul className="mt-6 space-y-3">
                  {open.results.map((r) => (
                    <li key={r} className="border-l-2 border-signal pl-4 text-sm">
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={`/projects/${open.slug}`} className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
                    Read the full case file
                  </Link>
                  <a href={open.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-semibold">
                    <Github className="h-4 w-4" aria-hidden /> Source
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
};

export default CaseDeck;
