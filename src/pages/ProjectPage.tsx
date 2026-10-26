import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Github, Star } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { projectMeta } from '@/lib/routeMeta';
import { track } from '@/lib/analytics';
import { useContent } from '@/content/ContentProvider';

const ProjectPage = () => {
  const { projects } = useContent();
  const { slug } = useParams<{ slug: string }>();
  const index = projects.findIndex((p) => p.slug === slug);
  // Counted once per visit to the full case file.
  useEffect(() => {
    if (index !== -1 && slug) track('project_open', slug);
  }, [index, slug]);
  if (index === -1) return <Navigate to="/#exploit" replace />;

  const p = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <PageShell meta={projectMeta(p.slug) ?? { title: `${p.name}: ${p.tagline} | Dhairya Shukla`, description: p.problem, path: `/projects/${p.slug}` }}>
      <article className="max-w-4xl">
        <Link to="/#exploit" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All projects
        </Link>

        <header className="mt-8 border-b border-border pb-10">
          <p className="font-mono text-sm text-muted-foreground">
            Case file, {p.year}
          </p>
          <h1 className="display mt-3 text-[clamp(3rem,10vw,6.5rem)]">{p.name}</h1>
          <p className="mt-4 text-xl sm:text-2xl">{p.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            >
              <Github className="h-4 w-4" aria-hidden /> View source
            </a>
            {p.stars ? (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4" aria-hidden /> {p.stars} stars
              </span>
            ) : null}
          </div>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s} className="rounded-full bg-secondary px-3 py-1 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-12 space-y-14">
          <section>
            <h2 className="text-2xl font-bold">The problem</h2>
            <p className="measure mt-4 text-lg text-muted-foreground">{p.problem}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">How it works</h2>
            <ol className="measure mt-6 space-y-4">
              {p.approach.map((a, i) => (
                <li key={a} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span className="font-mono text-signal">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </section>

          {p.sample && (
            <section>
              <h2 className="text-2xl font-bold">{p.sample.label}</h2>
              <pre className="mt-4 overflow-x-auto rounded-md bg-perimeter p-5 font-mono text-sm leading-relaxed text-phosphor">
                <code>{p.sample.code}</code>
              </pre>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold">Results</h2>
            <ul className="measure mt-6 space-y-4">
              {p.results.map((r) => (
                <li key={r} className="border-l-2 border-signal pl-4">
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <nav aria-label="Next project" className="mt-20 border-t border-border pt-8">
          <Link to={`/projects/${next.slug}`} className="group block">
            <span className="text-sm text-muted-foreground">Next case file</span>
            <span className="display mt-1 block text-3xl group-hover:text-signal">{next.name}</span>
          </Link>
        </nav>
      </article>
    </PageShell>
  );
};

export default ProjectPage;
