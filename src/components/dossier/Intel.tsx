import { Link } from 'react-router-dom';
import Section from './Section';
import PostMetaLine from '@/components/posts/PostMetaLine';
import { useBlogStore } from '@/hooks/useBlogStore';

const Intel = () => {
  const { getPublishedBlogs, loading } = useBlogStore();
  const latest = getPublishedBlogs().slice(0, 4);

  return (
    <Section
      id="intel"
      lede="CTF and lab writeups written like findings: what was vulnerable, why, the impact and the fix. Plus longer notes on research."
    >
      {loading ? (
        <ul className="space-y-4" aria-busy="true" aria-label="Loading posts">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-md bg-secondary" />
          ))}
        </ul>
      ) : latest.length === 0 ? (
        <p className="text-muted-foreground">Nothing published yet. The first writeups are on the way.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {latest.map((post) => (
            <li key={post.id}>
              <Link to={`/blog/${post.slug}`} className="group block py-6">
                <PostMetaLine post={post} />
                <h3 className="mt-2 text-xl font-bold group-hover:text-signal">{post.title}</h3>
                <p className="measure mt-2 text-muted-foreground">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/blog" className="mt-8 inline-block font-semibold text-signal hover:underline">
        Browse all writeups and posts
      </Link>
    </Section>
  );
};

export default Intel;
