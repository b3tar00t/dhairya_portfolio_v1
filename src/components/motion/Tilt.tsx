import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useMotionTier } from '@/hooks/useMotionTier';

interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Max rotation in degrees. */
  max?: number;
}

const SPRING = { stiffness: 260, damping: 22 };

/**
 * Card that tilts toward the pointer in 3D, with a light glare that follows.
 * Desktop only; elsewhere it renders a plain div.
 */
const Tilt = ({ children, max = 8, className = '', ...rest }: TiltProps) => {
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), SPRING);
  const ry = useSpring(useMotionValue(0), SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareOpacity = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, hsl(var(--signal) / 0.14), transparent 55%)`;

  if (tier !== 'full') {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
    glareOpacity.set(1);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    glareOpacity.set(0);
  };

  return (
    <div style={{ perspective: 900 }} className="[transform-style:preserve-3d]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`relative ${className}`}
        {...(rest as object)}
      >
        {children}
        <motion.span aria-hidden style={{ background: glare, opacity: glareOpacity }} className="pointer-events-none absolute inset-0 rounded-[inherit]" />
      </motion.div>
    </div>
  );
};

export default Tilt;
