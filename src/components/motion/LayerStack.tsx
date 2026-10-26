import { motion } from 'framer-motion';

interface Layer {
  id: string;
  name: string;
  role: string;
}

interface LayerStackProps {
  layers: Layer[];
  selected: string;
  onSelect: (id: string) => void;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 28 };

/**
 * The site's architecture as an isometric stack of slabs, request path from
 * top to bottom. The selected slab slides out and lifts off the stack.
 */
const LayerStack = ({ layers, selected, onSelect }: LayerStackProps) => {
  const gap = 88;

  return (
    <div className="relative mx-auto h-[32rem] w-full max-w-[24rem]" style={{ perspective: 1600 }}>
      <div
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(56deg) rotateZ(-36deg)' }}
      >
        {layers.map((l, i) => {
          const on = l.id === selected;
          // First layer on top of the stack.
          const z = (layers.length - 1 - i) * gap - ((layers.length - 1) * gap) / 2;
          return (
            <motion.button
              key={l.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(l.id)}
              className={`absolute -left-[8.5rem] -top-[3.5rem] flex h-28 w-[17rem] flex-col justify-end rounded-xl border-2 p-4 text-left transition-colors duration-quick ${
                on ? 'border-signal bg-card' : 'border-border bg-card/80 hover:border-foreground/40'
              }`}
              style={{ transformStyle: 'preserve-3d', boxShadow: '0 1px 0 hsl(var(--border))' }}
              initial={false}
              animate={{ z: z + (on ? 44 : 0), x: on ? -30 : 0, y: on ? 30 : 0 }}
              whileHover={on ? undefined : { z: z + 12 }}
              transition={SPRING}
            >
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              <span className={`text-lg font-bold ${on ? 'text-signal' : ''}`}>{l.name}</span>
              <span className="text-sm text-muted-foreground">{l.role}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LayerStack;
