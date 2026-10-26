// Browser half of meta.ts, kept separate so vite.config.ts never touches the DOM.
import { DEFAULT_IMAGE, SITE, type PageMeta } from './meta';

/** Updates the live document's head when the route changes. */
export const applyMetaToDocument = (m: PageMeta) => {
  document.title = m.title;
  const put = (selector: string, value: string, attr = 'content') =>
    document.head.querySelector(selector)?.setAttribute(attr, value);
  const url = `${SITE}${m.path}`;
  put('meta[name="description"]', m.description);
  put('meta[property="og:title"]', m.title);
  put('meta[property="og:description"]', m.description);
  put('meta[property="og:url"]', url);
  put('meta[property="og:image"]', m.image ?? DEFAULT_IMAGE);
  put('meta[name="twitter:title"]', m.title);
  put('meta[name="twitter:description"]', m.description);
  put('link[rel="canonical"]', url, 'href');
};
