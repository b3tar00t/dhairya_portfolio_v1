import type { Difficulty, PostKind, PostMeta } from '@/hooks/useBlogStore';

interface PostMetaFieldsProps {
  value: PostMeta;
  onChange: (value: PostMeta) => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'insane'];

/** Post type, plus the extra fields a writeup carries. */
const PostMetaFields = ({ value, onChange }: PostMetaFieldsProps) => {
  const kind: PostKind = value.kind ?? 'blog';

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-1 block text-sm text-muted-foreground">Type</legend>
        <div className="flex gap-2">
          {(['blog', 'writeup'] as PostKind[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => onChange({ ...value, kind: k })}
              className={`btn-terminal ${kind === k ? 'border-primary bg-primary text-primary-foreground hover:bg-primary' : ''}`}
            >
              {k === 'blog' ? 'Blog post' : 'Writeup'}
            </button>
          ))}
        </div>
      </fieldset>

      {kind === 'writeup' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="meta-platform" className="mb-1 block text-sm text-muted-foreground">Platform</label>
            <input
              id="meta-platform"
              value={value.platform ?? ''}
              onChange={(e) => onChange({ ...value, platform: e.target.value || null })}
              className="input-terminal w-full"
              placeholder="HackTheBox, TryHackMe, picoCTF"
            />
          </div>
          <div>
            <label htmlFor="meta-difficulty" className="mb-1 block text-sm text-muted-foreground">Difficulty</label>
            <select
              id="meta-difficulty"
              value={value.difficulty ?? ''}
              onChange={(e) => onChange({ ...value, difficulty: (e.target.value || null) as Difficulty | null })}
              className="input-terminal w-full"
            >
              <option value="">Not set</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="meta-category" className="mb-1 block text-sm text-muted-foreground">Category</label>
            <input
              id="meta-category"
              value={value.category ?? ''}
              onChange={(e) => onChange({ ...value, category: e.target.value || null })}
              className="input-terminal w-full"
              placeholder="Web, Pwn, Forensics, Cloud"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostMetaFields;
