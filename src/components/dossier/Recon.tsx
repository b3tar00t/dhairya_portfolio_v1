import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Download } from 'lucide-react';
import Redact from './Redact';
import HeroTarget from './HeroTarget';
import Magnetic from '@/components/motion/Magnetic';
import Tilt from '@/components/motion/Tilt';
import CountUp from '@/components/motion/CountUp';
import { track } from '@/lib/analytics';
import { useContent } from '@/content/ContentProvider';
import { STAGES } from './stages';
import type { AccessMethod } from '@/hooks/useAccess';

interface ReconProps {
  access: AccessMethod | null;
  resumeUrl: string;
  /** True on the visit where the gate just opened: play the stamp. */
  justEntered: boolean;
}

const Recon = ({ access, resumeUrl, justEntered }: ReconProps) => {
  const { profile, stats } = useContent();
  const reduceMotion = useReducedMotion();
  const stampAnimation = justEntered && !reduceMotion
    ? { initial: { scale: 1.6, opacity: 0, rotate: -12 }, animate: { scale: 1, opacity: 1, rotate: -3 } }
    : { initial: false as const, animate: { scale: 1, opacity: 1, rotate: -3 } };

  return (
    <section id="recon" aria-labelledby="recon-title" className="scroll-mt-24 pb-16 pt-12 sm:pb-20 sm:pt-20">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="font-mono text-sm text-muted-foreground">
          <span className="text-signal">01</span> {STAGES[0].label}
        </p>
        <motion.span
          className="stamp text-sm"
          {...stampAnimation}
          transition={{ duration: 0.34, ease: [0.175, 0.885, 0.32, 1.275], delay: justEntered ? 0.15 : 0 }}
        >
          {access === 'solved' ? 'Breached' : 'Declassified'}
        </motion.span>
      </div>

      <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div>
      <h1 id="recon-title" className="display glow mt-6 text-[clamp(3rem,9vw,7.5rem)]" aria-label={profile.name}>
        {profile.name.split(' ').map((word) => (
          <span key={word} className="block whitespace-nowrap" aria-hidden>
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block transition-colors duration-quick hover:text-signal"
                whileHover={reduceMotion ? undefined : { y: -14, rotate: i % 2 ? 6 : -6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>

      <p className="mt-6 text-xl font-medium sm:text-2xl">
        {profile.role}. {profile.focus}.
      </p>

      <p className="measure mt-6 text-lg leading-relaxed text-muted-foreground">
        <Redact>{profile.summary}</Redact> Currently an infrastructure and security engineer intern at{' '}
        <Redact delay={180}>CyBE Global</Redact>, and a B.Tech IT student at {profile.education.school}.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Magnetic>
        <a
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track('resume_download', 'hero')}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform duration-quick ease-signature active:scale-[0.97]"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download resume
        </a>
        </Magnetic>
        <Magnetic>
        <Link
          to="/brief"
          className="inline-flex items-center rounded-md border border-border px-5 py-3 font-semibold hover:border-foreground/40"
        >
          Read the one-page brief
        </Link>
        </Magnetic>
        <a
          href="#exfil"
          className="inline-flex items-center rounded-md px-5 py-3 font-semibold text-signal hover:underline"
        >
          Get in touch
        </a>
      </div>
      </div>
      <HeroTarget />
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 md:grid-cols-4">
        {stats.map((s) => (
          <Tilt key={s.label} className="rounded-md p-3 -m-3" max={10}>
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-1">
              <span className="display text-4xl"><CountUp value={s.value} /></span>
              <span className="mt-1 block text-sm">{s.detail}</span>
            </dd>
          </Tilt>
        ))}
      </dl>
    </section>
  );
};

export default Recon;
