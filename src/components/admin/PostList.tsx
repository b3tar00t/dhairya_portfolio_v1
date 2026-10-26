import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Pencil, Search, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { postKind, type BlogPost, type PostKind } from '@/hooks/useBlogStore';

interface PostListProps {
  posts: BlogPost[];
  loading: boolean;
  onEdit: (post: BlogPost) => void;
  onTogglePublish: (post: BlogPost) => Promise<void>;
  onDelete: (post: BlogPost) => Promise<void>;
}

type KindFilter = 'all' | PostKind;
type StatusFilter = 'all' | 'published' | 'draft';

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-xs ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'}`;

const PostList = ({ posts, loading, onEdit, onTogglePublish, onDelete }: PostListProps) => {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<BlogPost | null>(null);

  const shown = posts.filter((p) => {
    if (kind !== 'all' && postKind(p) !== kind) return false;
    if (status === 'published' && !p.published) return false;
    if (status === 'draft' && p.published) return false;
    const q = query.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
  });

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="hud rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <label className="relative mr-auto w-full sm:w-64">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles and tags" className="input-terminal w-full pl-9 text-sm" />
        </label>
        {(['all', 'writeup', 'blog'] as KindFilter[]).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
            {k === 'all' ? 'All types' : k === 'writeup' ? 'Writeups' : 'Blog posts'}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
          <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)} className={chip(status === s)}>
            {s === 'all' ? 'Any status' : s === 'published' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-6 text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading posts
        </div>
      ) : shown.length === 0 ? (
        <p className="p-6 text-muted-foreground">{posts.length ? 'No posts match these filters.' : 'No posts yet. Write one, or drop a .md file into the editor.'}</p>
      ) : (
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {shown.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${postKind(p) === 'writeup' ? 'bg-signal/15 text-signal' : 'bg-secondary text-foreground'}`}>
                      {postKind(p) === 'writeup' ? 'Writeup' : 'Blog'}
                    </span>
                    {p.platform && <span>{p.platform}</span>}
                    {p.difficulty && <span className="capitalize">{p.difficulty}</span>}
                    <span>{p.date}</span>
                    <span>{p.read_time}</span>
                  </p>
                  <p className="mt-1 truncate font-semibold">{p.title}</p>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={p.published} disabled={busy === p.id} onCheckedChange={() => run(p.id, () => onTogglePublish(p))} />
                  <span className={p.published ? 'text-signal' : 'text-muted-foreground'}>{p.published ? 'Live' : 'Draft'}</span>
                </label>

                <div className="flex gap-1">
                  {p.published && (
                    <Link to={`/blog/${p.slug}`} target="_blank" className="rounded-md p-2 hover:bg-secondary" aria-label={`View ${p.title} on the site`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <button type="button" onClick={() => onEdit(p)} className="rounded-md p-2 hover:bg-secondary" aria-label={`Edit ${p.title}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setConfirm(p)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label={`Delete ${p.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirm?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The post is removed from the site and the database. This can’t be undone. Uploaded images stay in storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirm && run(confirm.id, () => onDelete(confirm))}
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostList;
