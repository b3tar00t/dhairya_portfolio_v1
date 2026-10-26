import { motion } from 'framer-motion';
import { Download, Printer } from 'lucide-react';
import Scramble from '@/components/motion/Scramble';
import Redact from '@/components/dossier/Redact';
import Tilt from '@/components/motion/Tilt';
import PageShell from '@/components/PageShell';
import { BRIEF_META } from '@/lib/routeMeta';
import { track } from '@/lib/analytics';
import { useResumeUrl } from '@/hooks/useResumeUrl';
import { useContent } from '@/content/ContentProvider';

// Each block rises into place as it scrolls in; printing forces everything visible.
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
} as const;

/** Recruiter mode: everything on one printable page, with light motion. */
const Brief = () => {
  const { achievements, certifications, experience, profile, projects, research, skills, volunteering } = useContent();
  const resumeUrl = useResumeUrl();

  return (
    <PageShell meta={BRIEF_META}>
      <article className="mx-auto max-w-3xl print:max-w-none">
        <header className="hud border-b border-border p-6 pb-8">
          <h1 className="display glow text-5xl"><Scramble text={profile.name} duration={900} /></h1>
          <p className="mt-3 text-xl">
            {profile.role}. {profile.focus}.
          </p>
          <p className="mt-3 text-muted-foreground">
            {profile.email} | github.com/{profile.handle} | {profile.education.degree}, {profile.education.years}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <a href={resumeUrl} target="_blank" rel="noreferrer" onClick={() => track('resume_download', 'brief')} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">
              <Download className="h-4 w-4" aria-hidden /> Resume PDF
            </a>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-semibold">
              <Printer className="h-4 w-4" aria-hidden /> Print this page
            </button>
          </div>
        </header>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="In short" /></h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li><Redact>{profile.summary}</Redact></li>
            <li>
              {research.findings.reduce((n, f) => n + f.count, 0)} vulnerabilities disclosed (4 critical), Hall of Fame at{' '}
              {research.hallOfFame.map((h) => h.org).join(', ')}.
            </li>
            <li>5× CTF winner; led the red team for the Rwanda government’s cybersecurity training (RISA).</li>
            <li>{certifications.map((c) => `${c.short}${c.status === 'earned' ? '' : ' (in progress)'}`).join(', ')}.</li>
          </ul>
        </motion.section>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="Experience" /></h2>
          {experience.map((j) => (
            <Tilt key={j.id} max={3} className="-mx-3 mt-4 rounded-md p-3">
              <p className="flex flex-wrap justify-between gap-x-4">
                <span className="font-semibold">
                  {j.role}, {j.org}
                </span>
                <span className="text-sm text-muted-foreground">{j.period}</span>
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {j.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Tilt>
          ))}
        </motion.section>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="Leadership and volunteering" /></h2>
          <ul className="mt-3 space-y-1 text-sm">
            {volunteering.map((v) => (
              <li key={v.id}>
                <span className="font-semibold">{v.role}</span>, {v.org} <span className="text-muted-foreground">({v.period})</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="Projects" /></h2>
          <ul className="mt-3 space-y-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <span className="font-semibold">{p.name}</span>: {p.tagline}. <span className="text-sm text-muted-foreground">{p.stack.join(', ')}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="Skills" /></h2>
          <dl className="mt-3 space-y-1 text-sm">
            {skills.map((g) => (
              <div key={g.group}>
                <dt className="inline font-semibold">{g.group}: </dt>
                <dd className="inline">{g.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </motion.section>

        <motion.section className="mt-8" {...reveal}>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-signal"><Scramble text="Achievements" /></h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {achievements.map((a) => (
              <li key={a.title}>
                <span className="font-semibold">{a.title}.</span> {a.text}
              </li>
            ))}
          </ul>
        </motion.section>
      </article>
    </PageShell>
  );
};

export default Brief;
