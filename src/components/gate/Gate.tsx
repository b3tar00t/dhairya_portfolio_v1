import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FLAGS } from '@/lib/flags';
import { useBreachStats, useFlags, type AccessMethod } from '@/hooks/useAccess';
import { useContent } from '@/content/ContentProvider';
import Backdrop from '@/components/three/Backdrop';
import BreachSequence from './BreachSequence';

interface GateProps {
  onGranted: (method: AccessMethod) => void;
}

type Phase = 'locked' | 'denied' | 'granted' | 'sequence' | 'opening';

const DOORS_MS = 620;

const formatCount = (n: number) => new Intl.NumberFormat('en').format(n);

/**
 * The perimeter. Visitors either submit a flag hidden somewhere on the site,
 * or take the front door. Either way the blast doors open onto the dossier.
 */
const Gate = ({ onGranted }: GateProps) => {
  const { profile } = useContent();
  const reduceMotion = useReducedMotion();
  const { submit } = useFlags();
  const stats = useBreachStats();
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<Phase>('locked');
  const [showHints, setShowHints] = useState(false);
  const [message, setMessage] = useState('');
  const skipRef = useRef<HTMLButtonElement>(null);
  const [sequence, setSequence] = useState<{ method: AccessMethod; flagId?: string } | null>(null);

  useEffect(() => {
    // Start the dossier from the top, whatever scroll position the visitor left it at.
    window.scrollTo({ top: 0 });
    skipRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const openDoors = (method: AccessMethod) => {
    setPhase('opening');
    window.setTimeout(() => onGranted(method), reduceMotion ? 0 : DOORS_MS);
  };

  // Both paths run the breach sequence before the doors part.
  const startSequence = (method: AccessMethod, flagId?: string) => {
    if (reduceMotion) {
      openDoors(method);
      return;
    }
    setSequence({ method, flagId });
    setPhase('sequence');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || phase === 'granted' || phase === 'sequence' || phase === 'opening') return;
    const { flag } = await submit(value);
    if (!flag) {
      setPhase('denied');
      setMessage('That isn’t a valid flag. Flags look like flag{...}.');
      window.setTimeout(() => setPhase('locked'), 400);
      return;
    }
    setPhase('granted');
    setMessage(`Flag accepted: ${flag.id}. Opening the dossier.`);
    window.setTimeout(() => startSequence('solved', flag.id), reduceMotion ? 0 : 600);
  };

  const handleSkip = () => {
    if (phase === 'sequence' || phase === 'opening') return;
    setMessage('Opening the dossier.');
    startSequence('skipped');
  };

  const opening = phase === 'opening';
  const sequencing = phase === 'sequence';
  const doorTransition = { duration: reduceMotion ? 0 : DOORS_MS / 1000, ease: [0.3, 0, 1, 1] as const };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-50 text-[hsl(var(--phosphor))]"
    >
      {/* Blast doors: two halves of the perimeter that part on entry */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2 bg-perimeter"
        animate={{ y: opening ? '-100%' : 0 }}
        transition={doorTransition}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-perimeter"
        animate={{ y: opening ? '100%' : 0 }}
        transition={doorTransition}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: opening ? 0 : 0.55 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      >
        <Backdrop variant="perimeter" />
      </motion.div>

      {/* Seam of light where the doors meet, flaring as they part */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-phosphor shadow-[0_0_24px_4px_hsl(var(--phosphor))]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={opening ? { scaleX: [0, 1, 1], opacity: [0, 1, 0] } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : DOORS_MS / 1000, times: [0, 0.3, 1] }}
      />

      {sequencing && sequence && (
        <BreachSequence method={sequence.method} flagId={sequence.flagId} onDone={() => openDoors(sequence.method)} />
      )}

      <motion.div
        className="relative h-full overflow-y-auto"
        animate={{ opacity: opening || sequencing ? 0 : 1, filter: sequencing ? 'blur(4px)' : 'blur(0px)' }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'linear' }}
      >
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 py-12 sm:px-8">
          <p className="font-mono text-sm text-phosphor/70">
            target: {profile.site.replace('https://', '')}
          </p>

          <h1 id="gate-title" className="display mt-4 text-[clamp(2.5rem,8vw,5.5rem)] text-phosphor">
            {phase === 'granted' ? (
              <motion.span
                className="inline-block"
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.34, ease: [0.175, 0.885, 0.32, 1.275] }}
              >
                Access granted
              </motion.span>
            ) : (
              'Access restricted'
            )}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[hsl(37_60%_88%)]">
            This is the portfolio of {profile.name}, an offensive security engineer. Breach it to get
            in: five flags are hidden around the site, and any one of them opens the door.
          </p>

          <div className="mt-8 flex flex-col gap-4 rounded-md border border-phosphor/25 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[hsl(37_60%_88%)]">Short on time?</p>
              <p className="text-sm text-phosphor/60">
                {stats
                  ? `${formatCount(stats.solved)} visitors breached it. ${formatCount(stats.skipped)} used the front door.`
                  : 'No judgement. Most recruiters use the front door.'}
              </p>
            </div>
            <button
              ref={skipRef}
              type="button"
              onClick={handleSkip}
              className="rounded-md border border-phosphor px-6 py-3 font-semibold text-phosphor transition-colors duration-quick hover:bg-phosphor hover:text-perimeter"
            >
              I’m hiring, let me in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-10" noValidate>
            <label htmlFor="flag-input" className="block font-mono text-sm text-phosphor/80">
              Submit a flag
            </label>
            <div className={`mt-2 flex flex-col gap-3 sm:flex-row ${phase === 'denied' ? 'animate-shake' : ''}`}>
              <input
                id="flag-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="flag{...}"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={phase === 'denied'}
                aria-describedby="gate-status"
                className="min-w-0 flex-1 rounded-md border border-phosphor/40 bg-transparent px-4 py-3 font-mono text-base text-phosphor placeholder:text-phosphor/35 focus:border-phosphor focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-phosphor px-6 py-3 font-semibold text-perimeter transition-transform duration-quick ease-signature active:scale-[0.97]"
              >
                Breach
              </button>
            </div>
          </form>

          <p id="gate-status" role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] font-mono text-sm">
            <AnimatePresence mode="wait">
              {message && (
                <motion.span
                  key={message}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
                  className={phase === 'denied' ? 'text-[hsl(352_100%_72%)]' : 'text-phosphor'}
                >
                  {message}
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowHints((s) => !s)}
              aria-expanded={showHints}
              className="font-mono text-sm text-phosphor/80 underline decoration-phosphor/40 underline-offset-4 hover:decoration-phosphor"
            >
              {showHints ? 'Hide hints' : 'Need a hint?'}
            </button>
            <AnimatePresence initial={false}>
              {showHints && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
                  className="mt-3 space-y-1 overflow-hidden font-mono text-sm text-[hsl(37_60%_88%)]"
                >
                  {FLAGS.map((f) => (
                    <li key={f.id}>{f.hint}</li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Gate;
