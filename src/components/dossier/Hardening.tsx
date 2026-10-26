import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Section from './Section';
import LayerStack from '@/components/motion/LayerStack';
import { useMotionTier } from '@/hooks/useMotionTier';

interface Node {
  id: string;
  name: string;
  role: string;
  threats: { threat: string; control: string }[];
}

// This site's real architecture and the controls actually in place.
const NODES: Node[] = [
  {
    id: 'browser',
    name: 'Your browser',
    role: 'Runs the React app',
    threats: [
      { threat: 'Injected script (XSS) through blog content', control: 'Markdown is rendered without raw HTML, and a strict Content-Security-Policy allows scripts from this origin only.' },
      { threat: 'Clickjacking the admin panel', control: 'frame-ancestors \'none\' stops the site being framed anywhere.' },
    ],
  },
  {
    id: 'edge',
    name: 'Vercel edge',
    role: 'Serves static files and sets headers',
    threats: [
      { threat: 'Downgrade to plain HTTP', control: 'HSTS with a two-year max-age and preload.' },
      { threat: 'MIME sniffing and referrer leaks', control: 'nosniff, a strict referrer policy and a locked-down Permissions-Policy.' },
    ],
  },
  {
    id: 'auth',
    name: 'Supabase Auth',
    role: 'Admin login only',
    threats: [
      { threat: 'Anyone signs up and gains write access', control: 'Public sign-up is disabled, and authentication alone grants nothing.' },
      { threat: 'A stolen session for a non-admin account', control: 'Writes check an explicit admin allowlist, not just “is logged in”.' },
      { threat: 'A leaked admin password', control: 'Authenticator-app 2FA. Once enrolled, the database rejects admin writes from any session that skipped the code.' },
    ],
  },
  {
    id: 'db',
    name: 'Postgres',
    role: 'Posts, settings, messages',
    threats: [
      { threat: 'The public anon key is used to edit posts', control: 'Restrictive row-level security: inserts, updates and deletes require is_admin().' },
      { threat: 'Drafts or contact messages are read by visitors', control: 'Drafts are visible to admins only; messages are insert-only for the public.' },
      { threat: 'Scoreboard tampering', control: 'The counter table is read-only; a SECURITY DEFINER function can only increment it.' },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    role: 'Resume and blog images',
    threats: [
      { threat: 'Overwriting the resume with a malicious file', control: 'Uploads, updates and deletes in both buckets are admin-only.' },
    ],
  },
];

const Hardening = () => {
  const tier = useMotionTier();
  const [selected, setSelected] = useState(NODES[3].id);
  const node = NODES.find((n) => n.id === selected)!;

  return (
    <Section
      id="hardening"
      lede="A threat model of the site you’re reading, request path from top to bottom. Pull a layer out of the stack to see what could go wrong and what stops it."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
        {tier === 'none' ? (
          /* Request path, top to bottom */
        <div role="group" aria-label="Site components" className="relative flex flex-col gap-3">
          <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-border" />
          {NODES.map((n) => {
            const active = n.id === selected;
            return (
              <button
                key={n.id}
                type="button"
                aria-pressed={active}
                aria-controls="threat-panel"
                onClick={() => setSelected(n.id)}
                className={`relative flex items-center gap-4 rounded-md border px-4 py-3 text-left transition-colors duration-quick ${
                  active ? 'border-signal bg-card' : 'border-border bg-background hover:border-foreground/30'
                }`}
              >
                <span
                  aria-hidden
                  className={`relative z-10 h-4 w-4 shrink-0 rounded-full border-2 ${active ? 'border-signal bg-signal' : 'border-border bg-background'}`}
                />
                <span>
                  <span className="block font-semibold">{n.name}</span>
                  <span className="block text-sm text-muted-foreground">{n.role}</span>
                </span>
              </button>
            );
          })}
        </div>
        ) : (
          <LayerStack layers={NODES} selected={selected} onSelect={setSelected} />
        )}

        <div id="threat-panel" aria-live="polite" className="hud rounded-lg border border-border bg-card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <h3 className="text-2xl font-bold">{node.name}</h3>
              <dl className="mt-6 space-y-6">
                {node.threats.map((t) => (
                  <div key={t.threat} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="text-sm font-semibold text-stamp">Threat</dt>
                    <dd>{t.threat}</dd>
                    <dt className="text-sm font-semibold text-signal">Control</dt>
                    <dd className="text-muted-foreground">{t.control}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
};

export default Hardening;
