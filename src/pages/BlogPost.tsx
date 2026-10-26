import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { ArrowLeft, Check, Link2, Loader2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { postMeta } from '@/lib/routeMeta';
import Markdown from '@/components/posts/Markdown';
import PostMetaLine from '@/components/posts/PostMetaLine';
import { useBlogStore } from '@/hooks/useBlogStore';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogBySlug, getPublishedBlogs, loading } = useBlogStore();
  const { scrollYProgress } = useScroll();
  const [copied, setCopied] = useState(false);

  const post = slug ? getBlogBySlug(slug) : undefined;
  const allPosts = getPublishedBlogs();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-signal" aria-hidden />
        <span className="sr-only">Loading post</span>
      </div>
    );
  }

  if (!post) return <Navigate to="/blog" replace />;

  const index = allPosts.findIndex((p) => p.slug === slug);
  const newer = index > 0 ? allPosts[index - 1] : null;
  const older = index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the address bar still works.
    }
  };

  return (
    <PageShell meta={postMeta(post)}>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-signal" style={{ scaleX: scrollYProgress }} />

      <article className="mx-auto max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All writeups and posts
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <PostMetaLine post={post} />
          <h1 className="display mt-4 text-[clamp(2.25rem,6vw,3.75rem)]">{post.title}</h1>
          {post.category && <p className="mt-3 text-muted-foreground">{post.category}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-sm">
                {t}
              </span>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground/40"
            >
              {copied ? <Check className="h-4 w-4 text-signal" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
        </header>

        <div className="mt-10">
          <Markdown content={post.content} />
        </div>

        {(newer || older) && (
          <nav aria-label="More posts" className="mt-16 grid gap-6 border-t border-border pt-8 sm:grid-cols-2">
            {older ? (
              <Link to={`/blog/${older.slug}`} className="group">
                <span className="text-sm text-muted-foreground">Older</span>
                <span className="mt-1 block font-semibold group-hover:text-signal">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link to={`/blog/${newer.slug}`} className="group sm:text-right">
                <span className="text-sm text-muted-foreground">Newer</span>
                <span className="mt-1 block font-semibold group-hover:text-signal">{newer.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>
    </PageShell>
  );
};

export default BlogPost;
