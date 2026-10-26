import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import Section from './Section';
import Tilt from '@/components/motion/Tilt';
import { useMotionTier } from '@/hooks/useMotionTier';
import { DEFAULT_CONTENT, useContent } from '@/content/ContentProvider';

type Chapter = (typeof DEFAULT_CONTENT.origin)[number];

const ChapterCard = ({ c, i }: { c: Chapter; i: number }) => {
  const { profile } = useContent();
  return (
  <Tilt className="hud flex h-full flex-col rounded-lg border border-border bg-card p-7" max={7}>
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-sm text-signal">{c.when}</span>
      <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs">{c.tag}</span>
    </div>
    <p className="mt-1 font-mono text-xs text-muted-foreground">chapter {String(i + 1).padStart(2, '0')}</p>
    <h3 className="display mt-6 text-3xl">{c.title}</h3>
    <p className="mt-4 text-muted-foreground">{c.text}</p>
    {'repos' in c && c.repos && (
      <ul className="mt-auto flex flex-wrap gap-2 pt-6">
        {c.repos.map((r) => (
          <li key={r}>
            <a
              href={`${profile.github}/${r}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-md border border-border px-3 py-1.5 font-mono text-sm hover:border-signal hover:text-signal"
            >
              {r}
            </a>
          </li>
        ))}
      </ul>
    )}
  </Tilt>
  );
};

/** One card in the pinned track; it swings in 3D as it passes the centre. */
const TrackCard = ({ c, i, progress }: { c: Chapter; i: number; progress: MotionValue<number> }) => {
  const { origin } = useContent();
  const step = 1 / (origin.length - 1);
  const center = i * step;
  const rotateY = useTransform(progress, [center - step, center, center + step], [28, 0, -28]);
  const scale = useTransform(progress, [center - step, center, center + step], [0.88, 1, 0.88]);
  const opacity = useTransform(progress, [center - step * 1.6, center, center + step * 1.6], [0.35, 1, 0.35]);

  return (
    <motion.li className="h-[24rem] w-[min(26rem,80vw)] shrink-0" style={{ rotateY, scale, opacity, transformPerspective: 1200 }}>
      <ChapterCard c={c} i={i} />
    </motion.li>
  );
};

/**
 * How it started, as the "initial access" stage. On desktop the section pins
 * and scrolling drives the chapters sideways along a timeline; elsewhere it's
 * a vertical list.
 */
const Origin = () => {
  const { origin } = useContent();
  const tier = useMotionTier();
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  // Slide the track so its last card ends where the viewport column ends.
  const trackRef = useRef<HTMLOListElement>(null);
  const [overflow, setOverflow] = useState(0);
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (track?.parentElement) setOverflow(Math.max(0, track.scrollWidth - track.parentElement.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tier]);
  const x = useTransform(progress, (p) => -p * overflow);
  const lineScale = useTransform(progress, [0, 1], [0, 1]);
  const [current, setCurrent] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => setCurrent(Math.round(p * (origin.length - 1))));

  const lede = 'Before the bug bounties and internships: games, robots, and one video about Wi-Fi.';

  if (tier !== 'full') {
    return (
      <Section id="initial" lede={lede}>
        <ol className="relative space-y-6 border-l border-border pl-6">
          {origin.map((c, i) => (
            <li key={c.title} className="relative">
              <span aria-hidden className="absolute -left-[1.85rem] top-8 h-3 w-3 rounded-full border-2 border-signal bg-background" />
              <ChapterCard c={c} i={i} />
            </li>
          ))}
        </ol>
      </Section>
    );
  }

  return (
    <Section id="initial" lede={lede}>
      {/* Tall wrapper gives the pinned track room to scroll through. */}
      <div ref={pinRef} style={{ height: `${origin.length * 55}vh` }} className="relative -mx-4">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden">
          <div className="relative mx-4 mb-8">
            <div className="h-px w-full bg-border" />
            <motion.div className="absolute inset-x-0 top-0 h-px origin-left bg-signal shadow-[0_0_10px_hsl(var(--signal))]" style={{ scaleX: lineScale }} />
            <ol className="absolute inset-x-0 -top-1.5 flex justify-between">
              {origin.map((c, i) => (
                <li key={c.title} className="relative">
                  <motion.span
                    aria-hidden
                    className="block h-3 w-3 rounded-full border-2"
                    animate={{
                      backgroundColor: i <= current ? 'hsl(var(--signal))' : 'hsl(var(--background))',
                      borderColor: i <= current ? 'hsl(var(--signal))' : 'hsl(var(--border))',
                      scale: i === current ? 1.5 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                  <span
                    className={`absolute top-5 whitespace-nowrap font-mono text-xs ${
                      i === 0 ? 'left-0' : i === origin.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    } ${i === current ? 'text-signal' : 'text-muted-foreground'}`}
                  >
                    {c.when}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <motion.ol ref={trackRef} className="mt-10 flex w-max gap-8 px-4" style={{ x }}>
            {origin.map((c, i) => (
              <TrackCard key={c.title} c={c} i={i} progress={progress} />
            ))}
          </motion.ol>

          <p className="mx-4 mt-8 font-mono text-xs text-muted-foreground" aria-hidden>
            scroll to advance
          </p>
        </div>
      </div>
    </Section>
  );
};

export default Origin;
