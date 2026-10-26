import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AccessMethod } from '@/hooks/useAccess';

interface BreachSequenceProps {
  method: AccessMethod;
  flagId?: string;
  onDone: () => void;
}

const LINE_MS = 170;

const script = (method: AccessMethod, flagId?: string) =>
  method === 'solved'
    ? [`$ submit --flag ${flagId}`, 'flag verified against sha256 ledger', 'escalating privileges: user → root', 'decrypting dossier']
    : ['$ ./front-door --as recruiter', 'visitor verified: hiring intent detected', 'skipping 5 flags (no judgement)', 'decrypting dossier'];

/**
 * The beat between "you're in" and the doors opening: a fast terminal
 * transcript, a progress bar filling, then a glitch flash and ACCESS GRANTED.
 */
const BreachSequence = ({ method, flagId, onDone }: BreachSequenceProps) => {
  const lines = script(method, flagId);
  const [count, setCount] = useState(0);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const timers = lines.map((_, i) => window.setTimeout(() => setCount(i + 1), i * LINE_MS));
    const barDone = lines.length * LINE_MS + 260;
    timers.push(window.setTimeout(() => setGranted(true), barDone));
    timers.push(window.setTimeout(onDone, barDone + 520));
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-4" role="status" aria-live="assertive">
      <div className="w-full max-w-xl font-mono text-sm sm:text-base">
        {lines.slice(0, count).map((l, i) => (
          <motion.p
            key={l}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={i === 0 ? 'text-phosphor' : 'text-[hsl(37_60%_88%)]'}
          >
            {i === 0 ? l : `> ${l}`}
          </motion.p>
        ))}
        {count >= lines.length && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-phosphor/15">
            <motion.div
              className="h-full origin-left bg-phosphor shadow-[0_0_12px_hsl(var(--phosphor))]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        )}
        {granted && (
          <motion.p
            className="display mt-8 text-center text-[clamp(2.5rem,8vw,5rem)] text-phosphor"
            initial={{ opacity: 0, scale: 1.25, filter: 'blur(6px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              x: [0, -6, 5, -3, 0],
              textShadow: ['4px 0 #ff2e4d, -4px 0 #00e5ff', '-3px 0 #ff2e4d, 3px 0 #00e5ff', '0 0 24px hsl(37 100% 61% / 0.6)'],
            }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            Access granted
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default BreachSequence;
