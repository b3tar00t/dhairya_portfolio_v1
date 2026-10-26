import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Scramble from '@/components/motion/Scramble';
import { useMotionTier } from '@/hooks/useMotionTier';
import { STAGES, type StageId } from './stages';

interface SectionProps {
  id: StageId;
  children: React.ReactNode;
  /** Short line under the heading. */
  lede?: React.ReactNode;
}

const Section = ({ id, children, lede }: SectionProps) => {
  const index = STAGES.findIndex((s) => s.id === id);
  const stage = STAGES[index];
  const tier = useMotionTier();
  const ref = useRef<HTMLElement>(null);

  // The section tips up from the page as it scrolls in, like a file lifted off a desk.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 35%'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [tier === 'full' ? 14 : 6, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [tier === 'full' ? 80 : 30, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.25, 1]);
  const still = tier === 'none';

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border py-16 sm:py-20"
      style={{ perspective: 1400 }}
    >
      <motion.div
        style={still ? undefined : { rotateX, y, opacity, transformOrigin: '50% 0%' }}
      >
        <p className="font-mono text-sm text-muted-foreground">
          <span className="text-signal">{String(index + 1).padStart(2, '0')}</span> {stage.label}
        </p>
        <h2 id={`${id}-title`} className="display mt-3 text-[clamp(2rem,5vw,3.5rem)]">
          <Scramble text={stage.title} />
        </h2>
        {lede && <p className="measure mt-5 text-lg text-muted-foreground">{lede}</p>}
        <div className="mt-12">{children}</div>
      </motion.div>
    </section>
  );
};

export default Section;
