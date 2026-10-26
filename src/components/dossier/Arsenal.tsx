import { useState } from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import SkillSphere from '@/components/motion/SkillSphere';
import { useMotionTier } from '@/hooks/useMotionTier';
import { useContent } from '@/content/ContentProvider';

const Arsenal = () => {
  const { skills, softSkills } = useContent();
  const tier = useMotionTier();
  const [active, setActive] = useState<string | null>(null);
  const toggle = (group: string) => setActive((a) => (a === group ? null : group));

  return (
    <Section id="arsenal" lede="What I reach for on an engagement. Drag the sphere to spin it, or pick a surface to light up its tools.">
      <div className={`grid items-center gap-10 ${tier === 'none' ? '' : 'xl:grid-cols-[1fr_minmax(0,26rem)]'}`}>
        {tier !== 'none' && (
          <div className="overflow-hidden">
            <SkillSphere groups={skills} active={active} onPick={toggle} radius={tier === 'full' ? 190 : 130} />
          </div>
        )}

        {/* The list is the accessible version of the sphere, and its filter. */}
        <dl className="divide-y divide-border border-y border-border">
          {skills.map((g) => {
            const on = active === g.group;
            return (
              <div key={g.group} className="py-4">
                <dt>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(g.group)}
                    className={`flex w-full items-center justify-between font-semibold transition-colors duration-quick ${on ? 'text-signal' : 'hover:text-signal'}`}
                  >
                    {g.group}
                    <motion.span
                      aria-hidden
                      className="h-2 w-2 rounded-full bg-signal"
                      animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  </button>
                </dt>
                <dd className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm transition-colors duration-standard ${on ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {g.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Beyond the tools: </span>
        {softSkills.join(', ')}.
      </p>
    </Section>
  );
};

export default Arsenal;
