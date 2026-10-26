// Metadata for every route that exists at build time. Relative imports only:
// vite.config.ts loads this file, and the @ alias isn't available there.
import { profile, projects } from '../data/profile';
import type { PageMeta } from './meta';

export const HOME_META: PageMeta = {
  title: 'Dhairya Shukla — Offensive Security Engineer',
  description: 'Breach the site, or skip straight to the dossier. LLM, cloud and API security.',
  path: '/',
};

export const BRIEF_META: PageMeta = {
  title: 'One-page brief | Dhairya Shukla',
  description: `${profile.role}. ${profile.focus}. Experience, projects, bug bounty record and skills on one printable page.`,
  path: '/brief',
};

export const BLOG_META: PageMeta = {
  title: 'Writeups and blog | Dhairya Shukla',
  description: 'CTF and lab writeups written as findings, plus notes on security research and tooling.',
  path: '/blog',
};

export const projectMeta = (slug: string): PageMeta | null => {
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: `${p.name}: ${p.tagline} | Dhairya Shukla`, description: p.problem, path: `/projects/${p.slug}` } : null;
};

export const postMeta = (post: { slug: string; title: string; excerpt: string }): PageMeta => ({
  title: `${post.title} | Dhairya Shukla`,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
});

export const staticRouteMeta = (): PageMeta[] => [
  BRIEF_META,
  BLOG_META,
  { ...BLOG_META, path: '/writeups', title: 'Writeups | Dhairya Shukla' },
  ...projects.map((p) => projectMeta(p.slug)!),
];
