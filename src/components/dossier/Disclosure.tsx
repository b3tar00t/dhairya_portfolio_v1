import Section from './Section';
import Redact from './Redact';
import Tilt from '@/components/motion/Tilt';
import { ArrowUpRight } from 'lucide-react';
import { useContent } from '@/content/ContentProvider';

const severityColor: Record<string, string> = {
  Critical: 'bg-stamp',
  High: 'bg-[hsl(28_90%_52%)]',
  Medium: 'bg-[hsl(45_95%_55%)]',
  Low: 'bg-[hsl(200_60%_55%)]',
  Other: 'bg-muted-foreground/50',
};

const Disclosure = () => {
  const { research } = useContent();
  const total = research.findings.reduce((sum, f) => sum + f.count, 0);

  return (
    <Section id="disclosure" lede={research.summary}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-muted-foreground">
            <span className="display text-6xl text-foreground">{total}</span>
            <span className="ml-3">valid vulnerabilities, responsibly disclosed</span>
          </p>

          {/* Severity mix as one stacked bar */}
          <div className="mt-8 flex h-3 overflow-hidden rounded-full" role="img" aria-label={research.findings.map((f) => `${f.count} ${f.severity}`).join(', ')}>
            {research.findings.map((f) => (
              <span key={f.severity} className={severityColor[f.severity]} style={{ width: `${(f.count / total) * 100}%` }} />
            ))}
          </div>
          <dl className="mt-6 space-y-3">
            {research.findings.map((f) => (
              <div key={f.severity} className="grid grid-cols-[0.625rem_6.5rem_1fr] items-baseline gap-3">
                <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${severityColor[f.severity]}`} />
                <dt className="whitespace-nowrap font-semibold">
                  {f.count} {f.severity}
                </dt>
                <dd className="text-muted-foreground">{f.note}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xl font-bold">Hall of Fame and thanks</h3>
          <p className="mt-2 text-muted-foreground">Organisations that acknowledged my reports. Open one to see the public record.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {research.hallOfFame.map((h, i) => {
              const body = (
                <Tilt className="hud h-full rounded-md border border-border bg-card px-4 py-4" max={12}>
                  <span className="block text-lg font-semibold">
                    <Redact delay={i * 70}>{h.org}</Redact>
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {h.via}
                    {h.url && <ArrowUpRight className="h-3 w-3" aria-hidden />}
                  </span>
                </Tilt>
              );
              return (
                <li key={h.org}>
                  {h.url ? (
                    <a href={h.url} target="_blank" rel="noreferrer" className="block h-full hover:text-signal" aria-label={`${h.org}, ${h.via} (opens the public record)`}>
                      {body}
                    </a>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default Disclosure;
