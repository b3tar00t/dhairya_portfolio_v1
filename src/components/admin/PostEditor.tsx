import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Columns2, Eye, FileUp, ImagePlus, Loader2, PenLine, Save, X } from 'lucide-react';
import MarkdownToolbar from '@/components/MarkdownToolbar';
import Markdown from '@/components/posts/Markdown';
import PostMetaFields from './PostMetaFields';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useBlogImageUpload } from '@/hooks/useBlogImageUpload';
import type { BlogPost, PostMeta } from '@/hooks/useBlogStore';
import { localImageRefs, parseMarkdownPost, rewriteImageLinks } from '@/lib/markdownImport';

export interface PostDraft {
  title: string;
  tagsText: string;
  meta: PostMeta;
  content: string;
}

interface PostEditorProps {
  post?: BlogPost;
  onSave: (draft: PostDraft) => Promise<void>;
  onCancel: () => void;
}

type View = 'write' | 'split' | 'preview';

const MAX_IMAGE_MB = 10;
const isMarkdown = (f: File) => /\.(md|markdown)$/i.test(f.name);
const isImage = (f: File) => f.type.startsWith('image/');

const fromPost = (post?: BlogPost): PostDraft => ({
  title: post?.title ?? '',
  tagsText: post?.tags.join(', ') ?? '',
  meta: {
    kind: post?.kind ?? 'blog',
    platform: post?.platform ?? null,
    difficulty: post?.difficulty ?? null,
    category: post?.category ?? null,
    date: post?.date,
  },
  content: post?.content ?? '',
});

/**
 * Write or edit a post. Accepts dropped or picked .md files (front matter
 * fills the fields) together with their images, and dropped or pasted images,
 * which upload and land at the cursor. Drafts autosave to this browser.
 */
const PostEditor = ({ post, onSave, onCancel }: PostEditorProps) => {
  const { toast } = useToast();
  const { uploadImage } = useBlogImageUpload();
  const draftKey = `b3ta:draft:${post?.id ?? 'new'}`;
  const [draft, setDraft] = useState<PostDraft>(() => fromPost(post));
  const [view, setView] = useState<View>('split');
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [restorable, setRestorable] = useState<{ draft: PostDraft; at: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const latest = useRef(draft);
  latest.current = draft;

  // Offer an unsaved draft from a previous session, if it differs from what's loaded.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { draft: PostDraft; at: number };
      if (JSON.stringify(saved.draft) !== JSON.stringify(fromPost(post))) setRestorable(saved);
    } catch {
      // Unreadable draft: ignore it.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Autosave, debounced.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (JSON.stringify(draft) === JSON.stringify(fromPost(post))) localStorage.removeItem(draftKey);
        else localStorage.setItem(draftKey, JSON.stringify({ draft, at: Date.now() }));
      } catch {
        // Storage full or blocked: autosave is a convenience only.
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [draft, draftKey, post]);

  const update = (patch: Partial<PostDraft>) => setDraft((d) => ({ ...d, ...patch }));

  /** Inserts text at the cursor (or replaces the selection) and returns the inserted range start. */
  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    const content = latest.current.content;
    const start = ta?.selectionStart ?? content.length;
    const end = ta?.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    update({ content: next });
    requestAnimationFrame(() => {
      ta?.focus();
      ta?.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const upload = async (file: File): Promise<string | null> => {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast({ title: `${file.name} is over ${MAX_IMAGE_MB} MB`, description: 'Compress it and try again.', variant: 'destructive' });
      return null;
    }
    setUploads((n) => n + 1);
    try {
      return await uploadImage(file);
    } catch (e) {
      toast({ title: `Couldn’t upload ${file.name}`, description: (e as Error).message, variant: 'destructive' });
      return null;
    } finally {
      setUploads((n) => n - 1);
    }
  };

  /** Uploads images and places each one: into a matching unresolved reference, else at the cursor. */
  const attachImages = async (images: File[]) => {
    for (const img of images) {
      const placeholder = `![Uploading ${img.name}…]()`;
      const pending = localImageRefs(latest.current.content).includes(img.name.toLowerCase());
      if (!pending) insertAtCursor(`\n${placeholder}\n`);
      const url = await upload(img);
      setDraft((d) => {
        if (pending) {
          return url ? { ...d, content: rewriteImageLinks(d.content, new Map([[img.name.toLowerCase(), url]])) } : d;
        }
        return { ...d, content: d.content.replace(placeholder, url ? `![${img.name.replace(/\.[^.]+$/, '')}](${url})` : '') };
      });
    }
  };

  const importMarkdown = async (md: File, images: File[]) => {
    const previous = latest.current;
    const parsed = parseMarkdownPost(await md.text(), md.name);
    const refs = localImageRefs(parsed.content);
    const byName = new Map(images.map((f) => [f.name.toLowerCase(), f]));

    // Upload only the images the markdown actually references.
    const urls = new Map<string, string>();
    await Promise.all(
      refs.filter((r) => byName.has(r)).map(async (r) => {
        const url = await upload(byName.get(r)!);
        if (url) urls.set(r, url);
      }),
    );

    setDraft({
      title: parsed.title,
      tagsText: parsed.tags.join(', '),
      meta: { ...previous.meta, ...parsed.meta },
      content: rewriteImageLinks(parsed.content, urls),
    });

    const missing = refs.filter((r) => !urls.has(r));
    toast({
      title: `Imported ${md.name}`,
      description: missing.length
        ? `${missing.length} image${missing.length > 1 ? 's' : ''} still needed: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''}. Drop them in to attach.`
        : urls.size
          ? `${urls.size} image${urls.size > 1 ? 's' : ''} uploaded and linked.`
          : 'Fields filled from the file.',
      action: (
        <ToastAction altText="Undo import" onClick={() => setDraft(previous)}>
          Undo
        </ToastAction>
      ),
    });

    // Images that weren't referenced go in at the cursor.
    const extra = images.filter((f) => !refs.includes(f.name.toLowerCase()));
    if (extra.length) await attachImages(extra);
  };

  const handleFiles = useCallback(async (list: FileList | File[]) => {
    const files = Array.from(list);
    const md = files.find(isMarkdown);
    const images = files.filter(isImage);
    const ignored = files.filter((f) => !isMarkdown(f) && !isImage(f));
    if (ignored.length) toast({ title: 'Some files were skipped', description: 'Only .md files and images can be added.' });
    if (md) await importMarkdown(md, images);
    else if (images.length) await attachImages(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: 'Add a title and some content first', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      localStorage.removeItem(draftKey);
    } catch (e) {
      toast({ title: 'Couldn’t save', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Ctrl/Cmd+S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const tags = draft.tagsText.split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <div
      className="hud relative rounded-lg border border-border bg-card"
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="font-mono text-sm text-muted-foreground">{post ? `Editing: ${post.slug}` : 'New post'}</p>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5" role="group" aria-label="Editor layout">
          {([
            ['write', PenLine, 'Write'],
            ['split', Columns2, 'Split'],
            ['preview', Eye, 'Preview'],
          ] as const).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {restorable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-[hsl(var(--amber)/0.12)]"
          >
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <span>Unsaved draft from {new Date(restorable.at).toLocaleString()}.</span>
              <button type="button" className="font-semibold text-signal hover:underline" onClick={() => { setDraft(restorable.draft); setRestorable(null); }}>
                Restore it
              </button>
              <button type="button" className="text-muted-foreground hover:underline" onClick={() => { localStorage.removeItem(draftKey); setRestorable(null); }}>
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <div>
            <label htmlFor="post-title" className="mb-1 block text-sm text-muted-foreground">Title</label>
            <input id="post-title" value={draft.title} onChange={(e) => update({ title: e.target.value })} className="input-terminal w-full text-lg font-semibold" placeholder="HackTheBox: Sau, from SSRF to root" />
          </div>
          <div>
            <label htmlFor="post-date" className="mb-1 block text-sm text-muted-foreground">Date</label>
            <input id="post-date" type="date" value={draft.meta.date ?? ''} onChange={(e) => update({ meta: { ...draft.meta, date: e.target.value || undefined } })} className="input-terminal w-full" />
          </div>
        </div>
        <div>
          <label htmlFor="post-tags" className="mb-1 block text-sm text-muted-foreground">Tags, comma separated</label>
          <input id="post-tags" value={draft.tagsText} onChange={(e) => update({ tagsText: e.target.value })} className="input-terminal w-full" placeholder="SSRF, Linux, Privilege escalation" />
        </div>
        <PostMetaFields value={draft.meta} onChange={(meta) => update({ meta })} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MarkdownToolbar
              onInsert={(before, after = '', placeholder = '') => {
                const ta = textareaRef.current;
                const sel = ta ? draft.content.slice(ta.selectionStart, ta.selectionEnd) : '';
                insertAtCursor(before + (sel || placeholder) + after);
              }}
            />
            <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".md,.markdown,image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-terminal gap-2">
                <FileUp className="h-4 w-4" aria-hidden /> Import .md or images
              </button>
              {uploads > 0 && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Uploading {uploads}
                </span>
              )}
            </div>
          </div>

          <div className={`mt-2 grid gap-4 ${view === 'split' ? 'lg:grid-cols-2' : ''}`}>
            {view !== 'preview' && (
              <textarea
                ref={textareaRef}
                value={draft.content}
                onChange={(e) => update({ content: e.target.value })}
                onPaste={(e) => {
                  const images = Array.from(e.clipboardData.files).filter(isImage);
                  if (images.length) {
                    e.preventDefault();
                    attachImages(images);
                  }
                }}
                aria-label="Post content in Markdown"
                spellCheck
                className="input-terminal h-[60vh] w-full resize-y font-mono text-sm leading-relaxed"
                placeholder={'Write in Markdown, or drop a .md file here.\n\nPaste a screenshot (Ctrl+V) or drop images to upload them where the cursor is.'}
              />
            )}
            {view !== 'write' && (
              <div className="h-[60vh] overflow-y-auto rounded-md border border-border bg-background p-5">
                <h1 className="display text-3xl">{draft.title || 'Untitled post'}</h1>
                {tags.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{tags.join(', ')}</p>}
                <div className="mt-6">{draft.content ? <Markdown content={draft.content} /> : <p className="italic text-muted-foreground">Nothing to preview yet.</p>}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Ctrl+S saves. Drafts autosave in this browser.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="btn-terminal gap-2" disabled={saving}>
              <X className="h-4 w-4" aria-hidden /> Close
            </button>
            <button type="button" onClick={handleSave} className="btn-terminal-filled gap-2" disabled={saving || uploads > 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              {post ? 'Save changes' : 'Save as draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Drop overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-signal bg-background/90"
          >
            <ImagePlus className="h-10 w-10 text-signal" aria-hidden />
            <p className="text-lg font-semibold">Drop to add</p>
            <p className="text-sm text-muted-foreground">A .md file imports the post. Images upload and link themselves.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostEditor;
