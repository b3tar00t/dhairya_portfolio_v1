import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BarChart3, FileText, Inbox, LayoutList, Loader2, LogOut, PenSquare, Plus, Upload, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBlogStore, type BlogPost } from '@/hooks/useBlogStore';
import { useResumeStore } from '@/hooks/useResumeStore';
import { supabase } from '@/integrations/supabase/client';
import PostEditor, { type PostDraft } from '@/components/admin/PostEditor';
import PostList from '@/components/admin/PostList';
import AdminInbox from '@/components/admin/AdminInbox';
import ContentEditor from '@/components/admin/ContentEditor';
import Metrics from '@/components/admin/Metrics';
import AccountPanel from '@/components/admin/AccountPanel';

type Tab = 'metrics' | 'posts' | 'content' | 'inbox' | 'resume' | 'account';

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'posts', label: 'Posts', icon: PenSquare },
  { id: 'content', label: 'Content', icon: LayoutList },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'account', label: 'Account', icon: UserCog },
];

const tagsFrom = (text: string) => {
  const tags = text.split(',').map((t) => t.trim()).filter(Boolean);
  return tags.length ? tags : ['General'];
};

/** Sign-in form. Accounts are created in Supabase only; there is no sign-up here. */
const Login = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast({ title: 'Sign-in failed', description: error.message, variant: 'destructive' });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="hud w-full max-w-sm rounded-lg border border-border bg-card p-7">
        <p className="font-mono text-sm text-muted-foreground">sudo login</p>
        <h1 className="display mt-2 text-3xl">Admin</h1>
        <label htmlFor="admin-email" className="mt-6 block text-sm text-muted-foreground">Email</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-terminal mt-1 w-full" />
        <label htmlFor="admin-password" className="mt-4 block text-sm text-muted-foreground">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-terminal mt-1 w-full" />
        <button type="submit" disabled={busy} className="btn-terminal-filled mt-6 w-full gap-2">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Sign in
        </button>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the site
        </Link>
      </form>
    </main>
  );
};

/** Resume upload with drag and drop. */
const ResumePanel = () => {
  const { toast } = useToast();
  const { settings, loading, uploadResume } = useResumeStore();
  const [file, setFile] = useState<File | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const pick = (f?: File) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast({ title: 'Upload a PDF', description: `${f.name} isn’t a PDF.`, variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadResume(file);
      setFile(null);
      toast({ title: 'Resume updated', description: 'The site now serves the new file.' });
    } catch (e) {
      toast({ title: 'Upload failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hud space-y-5 rounded-lg border border-border bg-card p-6">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-10 text-center transition-colors ${over ? 'border-signal bg-signal/5' : 'border-border hover:border-foreground/40'}`}
      >
        <Upload className="h-10 w-10 text-muted-foreground" aria-hidden />
        <span className="font-semibold">{file ? file.name : 'Drop your resume PDF here, or choose a file'}</span>
        <span className="text-sm text-muted-foreground">PDF only</span>
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </label>

      {file && (
        <button type="button" onClick={upload} disabled={busy} className="btn-terminal-filled gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />} Replace the live resume
        </button>
      )}

      <div className="text-sm text-muted-foreground">
        {loading ? (
          'Checking the current resume…'
        ) : settings?.resume_url ? (
          <>
            Live now: <span className="text-foreground">{settings.resume_filename || 'resume.pdf'}</span>, updated{' '}
            {new Date(settings.updated_at).toLocaleDateString()}.{' '}
            <a href={settings.resume_url} target="_blank" rel="noreferrer" className="text-signal hover:underline">
              Open it
            </a>
          </>
        ) : (
          'No uploaded resume. The site serves the PDF bundled with the code.'
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<'loading' | 'in' | 'out'>('loading');
  const [tab, setTab] = useState<Tab>('metrics');
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null);
  const { blogs, loading, addBlog, updateBlog, deleteBlog, togglePublish, refetch } = useBlogStore();

  useEffect(() => {
    document.title = 'Admin | Dhairya Shukla';
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? 'in' : 'out');
      if (s) refetch();
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ? 'in' : 'out'));
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-signal" aria-hidden />
        <span className="sr-only">Checking session</span>
      </div>
    );
  }
  if (session === 'out') return <Login />;

  const save = async (draft: PostDraft) => {
    const tags = tagsFrom(draft.tagsText);
    if (editing === 'new') {
      await addBlog(draft.title, draft.content, tags, draft.meta);
      toast({ title: 'Draft saved', description: 'Publish it from the list when it’s ready.' });
    } else if (editing) {
      await updateBlog(editing.id, {
        title: draft.title,
        content: draft.content,
        tags,
        kind: draft.meta.kind ?? 'blog',
        platform: draft.meta.platform ?? null,
        difficulty: draft.meta.difficulty ?? null,
        category: draft.meta.category ?? null,
        ...(draft.meta.date ? { date: draft.meta.date } : {}),
      });
      toast({ title: 'Changes saved' });
    }
    setEditing(null);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="container flex h-16 max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Site
          </Link>
          <nav aria-label="Admin sections" className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => setTab(id)}
                className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm ${tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" aria-hidden /> <span className="hidden md:inline">{label}</span>
                {tab === id && <motion.span layoutId="admin-tab" className="absolute inset-x-2 -bottom-[13px] h-0.5 bg-signal" />}
              </button>
            ))}
          </nav>
          <button type="button" onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === 'posts' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="display text-3xl">Posts</h1>
                  {!editing && (
                    <button type="button" onClick={() => setEditing('new')} className="btn-terminal-filled gap-2">
                      <Plus className="h-4 w-4" aria-hidden /> New post
                    </button>
                  )}
                </div>
                {editing ? (
                  <PostEditor
                    key={editing === 'new' ? 'new' : editing.id}
                    post={editing === 'new' ? undefined : editing}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <PostList
                    posts={blogs}
                    loading={loading}
                    onEdit={setEditing}
                    onTogglePublish={async (p) => {
                      await togglePublish(p.id);
                      toast({ title: p.published ? 'Moved back to drafts' : 'Published' });
                    }}
                    onDelete={async (p) => {
                      await deleteBlog(p.id);
                      toast({ title: 'Post deleted' });
                    }}
                  />
                )}
              </div>
            )}
            {tab === 'metrics' && (
              <div className="space-y-6">
                <h1 className="display text-3xl">Metrics</h1>
                <Metrics />
              </div>
            )}
            {tab === 'content' && (
              <div className="space-y-6">
                <div>
                  <h1 className="display text-3xl">Content</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Edit what the site shows. Saving publishes immediately; “Restore default” goes back to the version in code.</p>
                </div>
                <ContentEditor />
              </div>
            )}
            {tab === 'account' && (
              <div className="space-y-6">
                <h1 className="display text-3xl">Account</h1>
                <AccountPanel />
              </div>
            )}
            {tab === 'inbox' && (
              <div className="space-y-6">
                <h1 className="display text-3xl">Inbox</h1>
                <AdminInbox />
              </div>
            )}
            {tab === 'resume' && (
              <div className="max-w-2xl space-y-6">
                <h1 className="display text-3xl">Resume</h1>
                <ResumePanel />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
