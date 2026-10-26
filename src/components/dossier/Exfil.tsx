import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Linkedin, Loader2, Mail, Send } from 'lucide-react';
import Section from './Section';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/analytics';
import { useContent } from '@/content/ContentProvider';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'limited';

// Real people take longer than this to write a message.
const MIN_FILL_MS = 3000;

const fieldClass =
  'w-full rounded-md border border-input bg-card px-4 py-3 text-base placeholder:text-muted-foreground/70 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30';

const Exfil = () => {
  const { profile } = useContent();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [trap, setTrap] = useState('');
  const openedAt = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Bots fill the hidden field or submit instantly: act as if it worked and drop it.
    if (trap || Date.now() - openedAt.current < MIN_FILL_MS) {
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      return;
    }
    const { error } = await supabase.from('messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    if (error) {
      setStatus(error.message.includes('rate_limited') ? 'limited' : 'error');
      return;
    }
    setStatus('sent');
    setForm({ name: '', email: '', message: '' });
    track('contact_sent');
  };

  return (
    <Section id="exfil" lede="Hiring for security, or want a second pair of eyes on your app? Send a message, or reach me directly.">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot: hidden from people and assistive tech, irresistible to form bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold">Name</label>
              <input id="c-name" required maxLength={120} autoComplete="name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="c-email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="c-email" type="email" required maxLength={254} autoComplete="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="c-message" className="mb-1.5 block text-sm font-semibold">Message</label>
            <textarea id="c-message" required maxLength={5000} rows={6} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} className={fieldClass} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform duration-quick ease-signature active:scale-[0.97] disabled:opacity-60"
            >
              {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {status === 'sending' ? 'Sending' : 'Send message'}
            </button>
            {/* The message leaves as a packet. */}
            <AnimatePresence>
              {status === 'sent' && (
                <motion.span
                  key="packet"
                  aria-hidden
                  className="pointer-events-none absolute left-6 top-2 text-signal"
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{ x: [0, 90, 240], y: [0, -70, -40], opacity: [1, 1, 0], rotate: [0, -20, 10], scale: [1, 1.3, 0.6] }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
                >
                  <Send className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
            </div>
            <p role="status" aria-live="polite" className="text-sm">
              <AnimatePresence mode="wait">
                {status === 'sent' && (
                  <motion.span key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }} className="inline-block font-semibold text-signal">
                    Message sent. I’ll reply by email.
                  </motion.span>
                )}
                {status === 'limited' && (
                  <motion.span key="limited" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[hsl(var(--amber))]">
                    Too many messages in a short time. Try again in a few minutes, or email {profile.email}.
                  </motion.span>
                )}
                {status === 'error' && (
                  <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-stamp">
                    The message didn’t send. Email me at {profile.email} instead.
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
          </div>
        </form>

        <ul className="space-y-4">
          <li>
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-signal">
              <Mail className="h-5 w-5" aria-hidden /> {profile.email}
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-signal">
              <Linkedin className="h-5 w-5" aria-hidden /> LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-signal">
              <Github className="h-5 w-5" aria-hidden /> GitHub, @{profile.handle}
            </a>
          </li>
        </ul>
      </div>
    </Section>
  );
};

export default Exfil;
