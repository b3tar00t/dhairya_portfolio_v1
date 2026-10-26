import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { BLOG_META } from '@/lib/routeMeta';
import PostMetaLine from '@/components/posts/PostMetaLine';
import { postKind, useBlogStore, type PostKind } from '@/hooks/useBlogStore';

type KindFilter = 'all' | PostKind;

const KIND_LABELS: Record<KindFilter, string> = { all: 'Everything', writeup: 'Writeups', blog: 'Blog posts' };

const chipClass = (active: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm transition-colors duration-quick ${
    active ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/40'
  }`;

const Blog = ({ initialKind = 'all' }: { initialKind?: KindFilter }) => {
  const { getPublishedBlogs, loading } = useBlogStore();
  const posts = getPublishedBlogs();
  const [kind, setKind] = useState<KindFilter>(initialKind);
  const [platform, setPlatform] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const platforms = useMemo(
    () => Array.from(new Set(posts.map((p) => p.platform).filter((p): p is string => !!p))).sort(),
    [posts],
  );
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);

  const filtered = posts.filter((p) => {
    if (kind !== 'all' && postKind(p) !== kind) return false;
    if (platform && p.platform !== platform) return false;
    if (tag && !p.tags.includes(tag)) return false;
    if (query) {
      const q = query.toLowerCase();
      return [p.title, p.excerpt, p.category ?? '', ...p.tags].some((s) => s.toLowerCase().includes(q));
    }
    return true;
  });

  const clearFilters = () => {
    setKind('all');
    setPlatform(null);
    setTag(null);
    setQuery('');
  };

  return (
    <PageShell meta={initialKind === 'writeup' ? { ...BLOG_META, path: '/writeups', title: 'Writeups | Dhairya Shukla' } : BLOG_META}>
      <header className="max-w-3xl">
        <h1 className="display text-[clamp(2.75rem,8vw,5rem)]">Writeups and blog</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Writeups cover retired CTF challenges and labs, written as findings: what was vulnerable, why, the impact and
          the fix. Blog posts are longer notes on research and tooling.
        </p>
      </header>

      <div className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Post type">
          {(Object.keys(KIND_LABELS) as KindFilter[]).map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chipClass(kind === k)}>
              {KIND_LABELS[k]}
            </button>
          ))}
          <label className="relative ml-auto w-full sm:w-64">
            <span className="sr-only">Search posts</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-input bg-card py-1.5 pl-9 pr-4 text-sm focus:border-signal focus:outline-none"
            />
          </label>
        </div>

        {platforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Platform">
            <span className="mr-1 text-sm text-muted-foreground">Platform</span>
            {platforms.map((p) => (
              <button key={p} type="button" aria-pressed={platform === p} onClick={() => setPlatform(platform === p ? null : p)} className={chipClass(platform === p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Topic">
            <span className="mr-1 text-sm text-muted-foreground">Topic</span>
            {tags.map((t) => (
              <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)} className={chipClass(tag === t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="mt-10" aria-live="polite">
        {loading ? (
          <ul className="space-y-4" aria-busy="true" aria-label="Loading posts">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-28 animate-pulse rounded-md bg-secondary" />
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No posts match these filters.</p>
            <button type="button" onClick={clearFilters} className="mt-3 text-signal hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {filtered.map((post) => (
              <li key={post.id}>
                <Link to={`/blog/${post.slug}`} className="group grid gap-2 py-7 md:grid-cols-[1fr_auto] md:gap-8">
                  <div>
                    <PostMetaLine post={post} />
                    <h2 className="mt-2 text-2xl font-bold group-hover:text-signal">{post.title}</h2>
                    <p className="measure mt-2 text-muted-foreground">{post.excerpt}</p>
                  </div>
                  {post.category && <p className="text-sm text-muted-foreground md:text-right">{post.category}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
};

export default Blog;
