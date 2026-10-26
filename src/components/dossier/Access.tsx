import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import Section from './Section';
import Tilt from '@/components/motion/Tilt';
import { useContent } from '@/content/ContentProvider';

/**
 * The cloud engagement as a kill chain. Scrolling through it advances the
 * chain one hop at a time; with reduced motion every hop is shown at once.
 */
const Chain = () => {
  const { featuredChain } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const total = featuredChain.steps.length;
  const [reached, setReached] = useState(reduceMotion ? total : 1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduceMotion) return;
    setReached(Math.min(total, Math.max(1, Math.ceil(v * total + 0.001))));
  });

  return (
    <div ref={ref} className="hud mt-16 rounded-lg border border-border bg-card p-6 sm:p-10">
      <p className="text-sm text-muted-foreground">{featuredChain.context}</p>
      <h3 className="display mt-2 text-3xl sm:text-4xl">{featuredChain.title}</h3>

      <ol className="relative mt-10 space-y-8">
        <span aria-hidden className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-border" />
        <motion.span
          aria-hidden
          className="absolute left-[0.6875rem] top-2 w-px origin-top bg-stamp"
          style={{ height: 'calc(100% - 1rem)' }}
          animate={{ scaleY: total > 1 ? (reached - 1) / (total - 1) : 1 }}
          transition={{ duration: 0.34, ease: [0.2, 0, 0, 1] }}
        />
        {featuredChain.steps.map((step, i) => {
          const on = i < reached;
          return (
            <li key={step.stage} className="relative grid grid-cols-[1.5rem_1fr] gap-5">
              <motion.span
                aria-hidden
                className="relative z-10 mt-1 h-6 w-6 rounded-full border-2"
                animate={{
                  scale: on ? 1 : 0.8,
                  backgroundColor: on ? 'hsl(var(--stamp))' : 'hsl(var(--card))',
                  borderColor: on ? 'hsl(var(--stamp))' : 'hsl(var(--border))',
                }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              />
              <motion.div
                animate={{ opacity: on ? 1 : 0.4, x: on ? 0 : -6 }}
                transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
              >
                <p className="font-semibold">{step.stage}</p>
                <p className="text-muted-foreground">{step.text}</p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const Access = () => {
  const { experience, volunteering } = useContent();
  return (
  <Section id="access" lede="Three security internships, each a step further from the textbook.">
    <ol className="space-y-14">
      {experience.map((job) => (
        <li key={job.id} className="grid gap-4 md:grid-cols-[13rem_1fr] md:gap-10">
          <div>
            <p className="font-mono text-sm text-muted-foreground">{job.period}</p>
            {job.current && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-signal">
                <span className="h-2 w-2 rounded-full bg-signal" aria-hidden /> Current
              </p>
            )}
          </div>
          <Tilt max={3} className="-m-4 rounded-lg p-4">
            <h3 className="text-2xl font-bold">{job.role}</h3>
            <p className="mt-1 text-lg">{job.org}</p>
            <p className="measure mt-3 text-muted-foreground">{job.summary}</p>
            <ul className="measure mt-5 space-y-3">
              {job.points.map((p) => (
                <li key={p} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-foreground/40">
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </p>
          </Tilt>
        </li>
      ))}
    </ol>

    <h3 className="mt-20 font-mono text-sm uppercase tracking-widest text-muted-foreground">Leadership and volunteering</h3>
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {volunteering.map((v) => (
        <li key={v.id}>
          <Tilt max={5} className="hud h-full rounded-lg border border-border bg-card p-6">
            <p className="flex items-center justify-between gap-3 font-mono text-sm text-muted-foreground">
              {v.period}
              {v.current && (
                <span className="inline-flex items-center gap-2 text-signal">
                  <span className="h-2 w-2 rounded-full bg-signal" aria-hidden /> Current
                </span>
              )}
            </p>
            <p className="mt-3 text-xl font-bold">{v.role}</p>
            <p className="text-muted-foreground">{v.org}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {v.points.map((pt) => (
                <li key={pt} className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-signal">
                  {pt}
                </li>
              ))}
            </ul>
          </Tilt>
        </li>
      ))}
    </ul>

    <Chain />
  </Section>
  );
};

export default Access;
