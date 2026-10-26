import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts the numeric part of a stat ("20+", "5×") up from zero when it comes into view. */
const CountUp = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const [n, setN] = useState(match && !reduce ? 0 : target);
  // Behind the locked gate the count waits; the gate opening retries it.
  const [gateTick, setGateTick] = useState(0);

  useEffect(() => {
    const onGranted = () => setGateTick((t) => t + 1);
    window.addEventListener('b3ta:granted', onGranted);
    return () => window.removeEventListener('b3ta:granted', onGranted);
  }, []);

  useEffect(() => {
    if (!match || reduce || !inView || ref.current?.closest('[inert]')) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, target, gateTick]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden>
        {n}
        {suffix}
      </span>
    </span>
  );
};

export default CountUp;
