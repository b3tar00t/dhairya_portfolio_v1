import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Table2, LineChart as LineIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import CountUp from '@/components/motion/CountUp';

interface Summary {
  since: string;
  totals: Record<string, number>;
  visitors: number;
  daily: { day: string; views: number; visitors: number; resumes: number }[];
  top_paths: { path: string; n: number }[];
  top_referrers: { referrer: string; n: number }[];
  top_labels: { event: string; label: string; n: number }[];
}

const RANGES = [7, 30, 90] as const;

const TILES: { key: string; label: string }[] = [
  { key: 'page_view', label: 'Page views' },
  { key: 'visitors', label: 'Unique visitors' },
  { key: 'resume_download', label: 'Resume downloads' },
  { key: 'project_open', label: 'Project opens' },
  { key: 'gate_solved', label: 'Gate breached' },
  { key: 'gate_skipped', label: 'Front door used' },
  { key: 'flag_found', label: 'Flags found' },
  { key: 'contact_sent', label: 'Messages sent' },
];

const SERIES = [
  { key: 'views', name: 'Page views', color: 'var(--chart-1)' },
  { key: 'visitors', name: 'Unique visitors', color: 'var(--chart-2)' },
] as const;

const Ranked = ({ title, rows, empty }: { title: string; rows: { name: string; n: number }[]; empty: string }) => {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="hud rounded-lg border border-border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="relative flex items-center justify-between gap-3 text-sm">
              <span aria-hidden className="absolute inset-y-0 left-0 rounded-sm bg-signal/10" style={{ width: `${(r.n / max) * 100}%` }} />
              <span className="relative truncate px-2 py-1 font-mono">{r.name}</span>
              <span className="relative px-2 tabular-nums">{r.n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Visits, downloads and gate activity from the site's own anonymous events. */
const Metrics = () => {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asTable, setAsTable] = useState(false);

  useEffect(() => {
    setData(null);
    setError(null);
    supabase.rpc('analytics_summary', { days }).then(({ data: d, error: e }) => {
      if (e) setError(e.message);
      else setData(d as unknown as Summary);
    });
  }, [days]);

  const value = (key: string) => (key === 'visitors' ? data?.visitors ?? 0 : data?.totals[key] ?? 0);
  const daily = (data?.daily ?? []).map((d) => ({ ...d, label: format(new Date(d.day), 'd MMM') }));
  const projects = (data?.top_labels ?? []).filter((l) => l.event === 'project_open').map((l) => ({ name: l.label, n: l.n }));

  return (
    <div className="space-y-6">
      {/* Filters in one row above everything */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={days === r}
            onClick={() => setDays(r)}
            className={`rounded-full border px-4 py-1.5 text-sm ${days === r ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'}`}
          >
            Last {r} days
          </button>
        ))}
        <p className="ml-auto text-xs text-muted-foreground">No cookies, no stored IPs. Your own visits to /admin aren’t counted.</p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn’t load metrics: {error}. If this says the function doesn’t exist, run the analytics migration.
        </p>
      ) : !data ? (
        <div className="flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading metrics
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {TILES.map((t) => (
              <div key={t.key} className="hud rounded-lg border border-border bg-card p-4">
                <dt className="text-sm text-muted-foreground">{t.label}</dt>
                <dd className="display mt-2 text-3xl tabular-nums">
                  <CountUp value={String(value(t.key))} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="hud rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Traffic per day</h3>
              <div className="flex items-center gap-4">
                <ul className="flex gap-4 text-sm" aria-label="Legend">
                  {SERIES.map((s) => (
                    <li key={s.key} className="flex items-center gap-2">
                      <span aria-hidden className="h-0.5 w-4 rounded" style={{ background: s.color }} />
                      {s.name}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setAsTable((v) => !v)} className="btn-terminal gap-2 px-3 py-1.5 text-xs" aria-pressed={asTable}>
                  {asTable ? <LineIcon className="h-4 w-4" aria-hidden /> : <Table2 className="h-4 w-4" aria-hidden />}
                  {asTable ? 'Chart' : 'Table'}
                </button>
              </div>
            </div>

            {asTable ? (
              <div className="mt-4 max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 font-medium">Day</th>
                      <th className="py-2 text-right font-medium">Page views</th>
                      <th className="py-2 text-right font-medium">Unique visitors</th>
                      <th className="py-2 text-right font-medium">Resume downloads</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {[...daily].reverse().map((d) => (
                      <tr key={d.day} className="border-t border-border">
                        <td className="py-1.5">{d.label}</td>
                        <td className="py-1.5 text-right">{d.views}</td>
                        <td className="py-1.5 text-right">{d.visitors}</td>
                        <td className="py-1.5 text-right">{d.resumes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 h-72" role="img" aria-label={`Page views and unique visitors per day, last ${days} days. Use the Table button for exact numbers.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                    <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '3 3' }}
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    {SERIES.map((s) => (
                      <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Ranked title="Top pages" rows={data.top_paths.map((p) => ({ name: p.path, n: p.n }))} empty="No page views yet." />
            <Ranked title="Where visitors came from" rows={data.top_referrers.map((r) => ({ name: r.referrer, n: r.n }))} empty="No external referrers yet." />
            <Ranked title="Most opened projects" rows={projects} empty="No project opens yet." />
          </div>
        </>
      )}
    </div>
  );
};

export default Metrics;
