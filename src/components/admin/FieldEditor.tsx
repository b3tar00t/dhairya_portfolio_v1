import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { emptyItem, type Field } from './contentSchema';

type Obj = Record<string, unknown>;

let uid = 0;
const nextId = () => `f${++uid}`;

const Label = ({ htmlFor, field }: { htmlFor?: string; field: Field }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-sm text-muted-foreground">
    {field.label}
    {field.hint && <span className="ml-2 text-xs text-muted-foreground/70">{field.hint}</span>}
  </label>
);

/** Edits a list of strings as one item per line. */
const ListInput = ({ id, value, onChange }: { id: string; value: string[]; onChange: (v: string[]) => void }) => {
  // Keep the raw text while typing so blank lines don't vanish mid-edit.
  const [text, setText] = useState(() => (value ?? []).join('\n'));
  return (
    <textarea
      id={id}
      value={text}
      rows={Math.min(10, Math.max(3, text.split('\n').length + 1))}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean));
      }}
      className="input-terminal w-full font-mono text-sm"
    />
  );
};

/** Renders the input for one field of the schema, recursing into objects and arrays. */
export const FieldInput = ({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) => {
  const [id] = useState(nextId);

  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <div>
          <Label htmlFor={id} field={field} />
          <input id={id} type={field.type === 'url' ? 'url' : 'text'} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className="input-terminal w-full" />
        </div>
      );
    case 'number':
      return (
        <div>
          <Label htmlFor={id} field={field} />
          <input id={id} type="number" min={0} value={(value as number) ?? 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className="input-terminal w-40" />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Label htmlFor={id} field={field} />
          <textarea id={id} rows={3} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className="input-terminal w-full" />
        </div>
      );
    case 'list':
      return (
        <div>
          <Label htmlFor={id} field={field} />
          <ListInput id={id} value={(value as string[]) ?? []} onChange={onChange} />
        </div>
      );
    case 'bool':
      return (
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={!!value} onCheckedChange={(v) => onChange(v)} />
          {field.label}
        </label>
      );
    case 'select':
      return (
        <div>
          <Label htmlFor={id} field={field} />
          <select id={id} value={(value as string) ?? field.options[0]} onChange={(e) => onChange(e.target.value)} className="input-terminal">
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case 'object':
      return (
        <fieldset className="space-y-3 rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-semibold">{field.label}</legend>
          <ObjectEditor fields={field.fields} value={(value as Obj) ?? {}} onChange={onChange} />
        </fieldset>
      );
    case 'array':
      return (
        <div>
          <p className="mb-2 text-sm font-semibold">{field.label}</p>
          <ArrayEditor item={field.item} itemTitle={field.itemTitle} value={(value as Obj[]) ?? []} onChange={onChange} />
        </div>
      );
  }
};

export const ObjectEditor = ({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) => (
  <div className="space-y-4">
    {fields.map((f) => (
      <FieldInput key={f.key} field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
    ))}
  </div>
);

/** A list of items: add, edit, duplicate, reorder and remove. */
export const ArrayEditor = ({ item, itemTitle, value, onChange }: { item: Field[]; itemTitle: string; value: Obj[]; onChange: (v: Obj[]) => void }) => {
  const [open, setOpen] = useState<number | null>(null);

  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    if (open === i) setOpen(i + d);
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {value.map((v, i) => {
            const isOpen = open === i;
            const title = String(v[itemTitle] ?? '') || 'Untitled';
            return (
              <motion.li
                key={i}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
                className={`rounded-md border ${isOpen ? 'border-signal' : 'border-border'} bg-background`}
              >
                <div className="flex items-center gap-1 px-3 py-2">
                  <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-quick ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                    <span className="truncate font-medium">{title}</span>
                  </button>
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 hover:bg-secondary disabled:opacity-30" aria-label={`Move ${title} up`}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 hover:bg-secondary disabled:opacity-30" aria-label={`Move ${title} down`}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onChange([...value.slice(0, i + 1), structuredClone(v), ...value.slice(i + 1)])} className="rounded p-1.5 hover:bg-secondary" aria-label={`Duplicate ${title}`}>
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(value.filter((_, j) => j !== i));
                      setOpen(null);
                    }}
                    className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                    aria-label={`Remove ${title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {isOpen && (
                  <div className="border-t border-border p-4">
                    <ObjectEditor fields={item} value={v} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        onClick={() => {
          onChange([...value, emptyItem(item)]);
          setOpen(value.length);
        }}
        className="btn-terminal gap-2"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add
      </button>
    </div>
  );
};
