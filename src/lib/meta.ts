// Page metadata, shared by the browser (usePageMeta) and the build step that
// writes per-route HTML for link previews (vite.config.ts).

export const SITE = 'https://b3tar00t-dhairyashukla.vercel.app';
export const DEFAULT_IMAGE = `${SITE}/og.png`;

export interface PageMeta {
  title: string;
  description: string;
  /** Path starting with "/". */
  path: string;
  image?: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rewrites the head of index.html for one route. Used at build time. */
export const applyMetaToHtml = (html: string, m: PageMeta): string => {
  const url = `${SITE}${m.path}`;
  const image = m.image ?? DEFAULT_IMAGE;
  const set = (attr: 'name' | 'property', key: string, value: string) => (h: string) =>
    h.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);

  return [
    (h: string) => h.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`),
    (h: string) => h.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`),
    set('name', 'description', m.description),
    set('property', 'og:title', m.title),
    set('property', 'og:description', m.description),
    set('property', 'og:url', url),
    set('property', 'og:image', image),
    set('name', 'twitter:title', m.title),
    set('name', 'twitter:description', m.description),
    set('name', 'twitter:image', image),
  ].reduce((h, f) => f(h), html);
};
