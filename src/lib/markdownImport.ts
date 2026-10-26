import type { Difficulty, PostKind, PostMeta } from '@/hooks/useBlogStore';

export interface ImportedPost {
  title: string;
  tags: string[];
  meta: PostMeta;
  content: string;
}

const DIFFICULTIES = ['easy', 'medium', 'hard', 'insane'];

const unquote = (v: string) => v.trim().replace(/^["']|["']$/g, '');

/**
 * Minimal YAML front matter: `key: value`, `key: [a, b]` and `- item` lists.
 * Enough for Obsidian, Hugo and Jekyll style headers; anything else is ignored.
 */
const parseFrontMatter = (raw: string): { fields: Record<string, string | string[]>; body: string } => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fields: {}, body: raw };

  const fields: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      (fields[listKey] as string[]).push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const value = kv[2].trim();
    if (value === '') {
      fields[key] = [];
      listKey = key;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      fields[key] = value.slice(1, -1).split(',').map(unquote).filter(Boolean);
      listKey = null;
    } else {
      fields[key] = unquote(value);
      listKey = null;
    }
  }
  return { fields, body: raw.slice(match[0].length) };
};

const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : v);

/** Turns a markdown file's text into editor fields. */
export const parseMarkdownPost = (raw: string, fileName: string): ImportedPost => {
  const { fields, body } = parseFrontMatter(raw.replace(/\r\n/g, '\n'));
  let content = body.trimStart();

  // Title: front matter, else the first H1 (removed from the body), else the file name.
  let title = asString(fields.title) ?? '';
  if (!title) {
    const h1 = content.match(/^#\s+(.+)\n?/);
    if (h1) {
      title = h1[1].trim();
      content = content.slice(h1[0].length).trimStart();
    } else {
      title = fileName.replace(/\.(md|markdown)$/i, '').replace(/[-_]+/g, ' ');
    }
  }

  const rawTags = fields.tags ?? fields.categories ?? [];
  const tags = (Array.isArray(rawTags) ? rawTags : rawTags.split(',')).map((t) => t.trim()).filter(Boolean);

  const kindField = (asString(fields.type) ?? asString(fields.kind) ?? '').toLowerCase();
  const difficulty = (asString(fields.difficulty) ?? '').toLowerCase();
  const platform = asString(fields.platform) ?? null;
  const looksLikeWriteup = kindField === 'writeup' || !!platform || DIFFICULTIES.includes(difficulty);

  const meta: PostMeta = {
    kind: (looksLikeWriteup ? 'writeup' : 'blog') as PostKind,
    platform,
    difficulty: DIFFICULTIES.includes(difficulty) ? (difficulty as Difficulty) : null,
    category: asString(fields.category) ?? null,
    date: /^\d{4}-\d{2}-\d{2}/.test(asString(fields.date) ?? '') ? asString(fields.date)!.slice(0, 10) : undefined,
  };

  return { title, tags, meta, content };
};

const basename = (path: string) => decodeURIComponent(path.split(/[\\/]/).pop() ?? path).toLowerCase();

/** Relative image paths referenced by the markdown, including Obsidian `![[x.png]]` embeds. */
export const localImageRefs = (content: string): string[] => {
  const refs = new Set<string>();
  for (const m of content.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    if (!/^(https?:|data:)/i.test(m[1])) refs.add(basename(m[1]));
  }
  for (const m of content.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) refs.add(basename(m[1]));
  return [...refs];
};

/** Points local image references at their uploaded URLs. `urls` is keyed by lower-case file name. */
export const rewriteImageLinks = (content: string, urls: Map<string, string>): string =>
  content
    .replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?((?:\s+"[^"]*")?)\s*\)/g, (whole, alt, path, title) => {
      if (/^(https?:|data:)/i.test(path)) return whole;
      const url = urls.get(basename(path));
      return url ? `![${alt}](${url}${title})` : whole;
    })
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (whole, path, alt) => {
      const url = urls.get(basename(path));
      return url ? `![${alt ?? ''}](${url})` : whole;
    });
