import { useEffect, useMemo, useRef, useState } from 'react';

interface SkillSphereProps {
  groups: { group: string; items: string[] }[];
  active: string | null;
  onPick: (group: string) => void;
  /** Sphere radius in px. */
  radius: number;
}

/**
 * Every skill placed on a 3D sphere (CSS transforms, no WebGL). It spins on
 * its own; drag to throw it, click a skill to highlight its group.
 */
const SkillSphere = ({ groups, active, onPick, radius }: SkillSphereProps) => {
  const items = useMemo(() => groups.flatMap((g) => g.items.map((label) => ({ label, group: g.group }))), [groups]);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const rot = useRef({ x: -0.2, y: 0 });
  const vel = useRef({ x: 0.0008, y: 0.0035 });
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [, force] = useState(0);

  // Fibonacci sphere: even spacing for any number of points.
  const points = useMemo(
    () =>
      items.map((_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / items.length);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return { x: Math.cos(theta) * Math.sin(phi), y: Math.cos(phi), z: Math.sin(theta) * Math.sin(phi) };
      }),
    [items],
  );

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!drag.current) {
        // Ease back to a slow idle spin after a throw.
        vel.current.x += (0.0008 - vel.current.x) * 0.02;
        vel.current.y += (0.0035 - vel.current.y) * 0.02;
      }
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;
      const { x: ax, y: ay } = rot.current;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      points.forEach((p, i) => {
        const el = nodes.current[i];
        if (!el) return;
        // Rotate around Y, then X.
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        el.style.transform = `translate3d(${x1 * radius}px, ${y2 * radius}px, 0) translate(-50%, -50%) scale(${0.6 + depth * 0.55})`;
        el.style.opacity = String(0.25 + depth * 0.75);
        el.style.zIndex = String(Math.round(depth * 100));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points, radius]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    vel.current = { x: -dy * 0.0009, y: dx * 0.0009 };
    drag.current = { x: e.clientX, y: e.clientY, moved: drag.current.moved + Math.abs(dx) + Math.abs(dy) };
  };
  const onUp = (e: React.PointerEvent) => {
    const wasClick = drag.current && drag.current.moved < 6;
    drag.current = null;
    if (wasClick) {
      // Pointer capture retargets the event to the container; find the skill under the pointer.
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-group]');
      if (hit?.dataset.group) onPick(hit.dataset.group);
      force((n) => n + 1);
    }
  };

  return (
    <div
      className="relative mx-auto cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ width: radius * 2 + 120, height: radius * 2 + 60 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => (drag.current = null)}
    >
      <div className="absolute left-1/2 top-1/2">
        {items.map((it, i) => {
          const on = active === it.group;
          return (
            <button
              key={`${it.group}-${it.label}`}
              ref={(el) => (nodes.current[i] = el)}
              type="button"
              data-group={it.group}
              tabIndex={-1}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-quick ${
                on ? 'bg-signal text-primary-foreground' : active ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSphere;
