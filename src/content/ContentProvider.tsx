import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import * as bundled from '@/data/profile';

/**
 * Site content: the defaults bundled in code (src/data/profile.ts), with any
 * section saved from the admin panel layered on top. A section missing from
 * the database, or a database that can't be reached, falls back to code.
 */
export const DEFAULT_CONTENT = {
  profile: bundled.profile,
  stats: bundled.stats,
  origin: bundled.origin,
  skills: bundled.skills,
  softSkills: bundled.softSkills,
  projects: bundled.projects,
  earlyArsenal: bundled.earlyArsenal,
  experience: bundled.experience,
  volunteering: bundled.volunteering,
  featuredChain: bundled.featuredChain,
  research: bundled.research,
  achievements: bundled.achievements,
  certifications: bundled.certifications,
};

export type SiteContent = typeof DEFAULT_CONTENT;
export type ContentKey = keyof SiteContent;

interface ContentContextValue {
  content: SiteContent;
  /** Sections that currently come from the database rather than code. */
  overridden: Set<ContentKey>;
  save: <K extends ContentKey>(key: K, data: SiteContent[K]) => Promise<void>;
  reset: (key: ContentKey) => Promise<void>;
}

const CACHE_KEY = 'b3ta:content';

// Last fetched overrides, so a returning visitor sees edits on first paint.
const readCache = (): Partial<SiteContent> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const ContentContext = createContext<ContentContextValue | null>(null);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [overrides, setOverrides] = useState<Partial<SiteContent>>(readCache);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, data')
      .then(({ data, error }) => {
        if (error || !data) return;
        const next: Partial<SiteContent> = {};
        for (const row of data) {
          if (row.key in DEFAULT_CONTENT) (next as Record<string, unknown>)[row.key] = row.data;
        }
        setOverrides(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          // Cache is optional.
        }
      });
  }, []);

  const save = useCallback(async <K extends ContentKey>(key: K, data: SiteContent[K]) => {
    const { error } = await supabase.from('site_content').upsert({ key, data: data as unknown as Json });
    if (error) throw error;
    setOverrides((o) => ({ ...o, [key]: data }));
  }, []);

  const reset = useCallback(async (key: ContentKey) => {
    const { error } = await supabase.from('site_content').delete().eq('key', key);
    if (error) throw error;
    setOverrides((o) => {
      const next = { ...o };
      delete next[key];
      return next;
    });
  }, []);

  const content = { ...DEFAULT_CONTENT, ...overrides } as SiteContent;
  const overridden = new Set(Object.keys(overrides) as ContentKey[]);

  return <ContentContext.Provider value={{ content, overridden, save, reset }}>{children}</ContentContext.Provider>;
};

export const useSiteContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside ContentProvider');
  return ctx;
};

/** The merged content, for components that only read it. */
export const useContent = () => useSiteContent().content;
