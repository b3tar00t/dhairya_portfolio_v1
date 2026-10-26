import { useEffect, useState } from 'react';
import { Loader2, RotateCcw, Save } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useSiteContent, type ContentKey, type SiteContent } from '@/content/ContentProvider';
import { ArrayEditor, FieldInput, ObjectEditor } from './FieldEditor';
import { SECTIONS, type SectionSchema } from './contentSchema';

type Obj = Record<string, unknown>;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;

/** Fills ids and slugs, and drops empty optional parts, before saving. */
const normalise = (key: ContentKey, data: unknown): unknown => {
  if (key === 'experience' || key === 'volunteering') {
    return (data as Obj[]).map((x) => ({ ...x, id: (x.id as string) || slugify(`${x.org}-${x.role}`) }));
  }
  if (key === 'projects') {
    return (data as Obj[]).map((x) => {
      const p: Obj = { ...x, slug: slugify((x.slug as string) || (x.name as string) || '') };
      const sample = p.sample as Obj | undefined;
      if (!sample || (!sample.label && !sample.code)) delete p.sample;
      if (!p.stars) delete p.stars;
      return p;
    });
  }
  if (key === 'research') {
    const r = data as Obj;
    return { ...r, hallOfFame: (r.hallOfFame as Obj[]).map((h) => (h.url ? h : { org: h.org, via: h.via })) };
  }
  return data;
};

const SectionForm = ({ schema }: { schema: SectionSchema }) => {
  const { toast } = useToast();
  const { content, overridden, save, reset } = useSiteContent();
  const [draft, setDraft] = useState<unknown>(() => structuredClone(content[schema.key]));
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(content[schema.key]);

  // Reload the form when the saved value changes (after save or reset).
  const savedJson = JSON.stringify(content[schema.key]);
  useEffect(() => setDraft(JSON.parse(savedJson)), [savedJson]);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const onSave = async () => {
    setBusy(true);
    try {
      await save(schema.key, normalise(schema.key, draft) as SiteContent[typeof schema.key]);
      toast({ title: `${schema.title} saved`, description: 'It’s live on the site now.' });
    } catch (e) {
      toast({ title: 'Couldn’t save', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    setBusy(true);
    try {
      await reset(schema.key);
      toast({ title: `${schema.title} restored`, description: 'Showing the version from the code again.' });
    } catch (e) {
      toast({ title: 'Couldn’t restore', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hud rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-xl font-bold">{schema.title}</h2>
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        </div>
        <div className="flex gap-2">
          {overridden.has(schema.key) && (
            <button type="button" onClick={() => setConfirmReset(true)} disabled={busy} className="btn-terminal gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden /> Restore default
            </button>
          )}
          <button type="button" onClick={onSave} disabled={busy || !dirty} className="btn-terminal-filled gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {dirty ? 'Save and publish' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="p-5">
        {schema.shape === 'object' && <ObjectEditor fields={schema.fields!} value={draft as Obj} onChange={setDraft} />}
        {schema.shape === 'array' && <ArrayEditor item={schema.item!} itemTitle={schema.itemTitle!} value={draft as Obj[]} onChange={setDraft} />}
        {schema.shape === 'list' && <FieldInput field={{ key: schema.key, label: schema.title, type: 'list' }} value={draft} onChange={setDraft} />}
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore “{schema.title}” to the code version?</AlertDialogTitle>
            <AlertDialogDescription>Your saved edits to this section are removed, and the site shows the content from src/data/profile.ts.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my edits</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>Restore default</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/** Pick a section on the left, edit it on the right. */
const ContentEditor = () => {
  const { overridden } = useSiteContent();
  const [active, setActive] = useState<ContentKey>('experience');
  const schema = SECTIONS.find((s) => s.key === active)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
      <nav aria-label="Content sections" className="space-y-1 lg:sticky lg:top-24 lg:self-start">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-current={s.key === active ? 'page' : undefined}
            onClick={() => setActive(s.key)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
              s.key === active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            {s.title}
            {overridden.has(s.key) && (
              <span className={`text-xs ${s.key === active ? '' : 'text-signal'}`} title="Edited from the admin panel">
                edited
              </span>
            )}
          </button>
        ))}
      </nav>
      <SectionForm key={active} schema={schema} />
    </div>
  );
};

export default ContentEditor;
