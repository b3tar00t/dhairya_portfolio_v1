import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkFlag, readFoundFlags, saveFoundFlag, type Flag } from '@/lib/flags';
import { track } from '@/lib/analytics';

export type AccessMethod = 'solved' | 'skipped';

const ACCESS_KEY = 'b3ta:access';

const readAccess = (): AccessMethod | null => {
  try {
    const v = localStorage.getItem(ACCESS_KEY);
    return v === 'solved' || v === 'skipped' ? v : null;
  } catch {
    return null;
  }
};

/** Gate state: whether this visitor got in, and how. */
export const useAccess = () => {
  const [access, setAccess] = useState<AccessMethod | null>(readAccess);

  const grant = useCallback((method: AccessMethod) => {
    // Upgrade a skip to a solve, never the other way round.
    if (access === 'solved' && method === 'skipped') return;
    try {
      localStorage.setItem(ACCESS_KEY, method);
    } catch {
      // Storage unavailable: access lasts for this visit only.
    }
    setAccess(method);
    if (access !== method) {
      // Scoreboard is best-effort; a failed RPC must never block entry.
      supabase.rpc('record_breach', { method }).then(() => undefined, () => undefined);
      track(method === 'solved' ? 'gate_solved' : 'gate_skipped');
    }
  }, [access]);

  return { access, grant };
};

/** Flags this visitor has found, kept in sync across components. */
export const useFlags = () => {
  const [found, setFound] = useState<string[]>(readFoundFlags);

  useEffect(() => {
    const onChange = (e: Event) => setFound((e as CustomEvent<string[]>).detail);
    window.addEventListener('b3ta:flags', onChange);
    return () => window.removeEventListener('b3ta:flags', onChange);
  }, []);

  const submit = useCallback(async (value: string): Promise<{ flag: Flag | null; isNew: boolean }> => {
    const flag = await checkFlag(value);
    if (!flag) return { flag: null, isNew: false };
    const isNew = !readFoundFlags().includes(flag.id);
    saveFoundFlag(flag.id);
    if (isNew) track('flag_found', flag.id);
    return { flag, isNew };
  }, []);

  return { found, submit };
};

export const useBreachStats = () => {
  const [stats, setStats] = useState<{ solved: number; skipped: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('breach_stats')
      .select('solved, skipped')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setStats({ solved: Number(data.solved), skipped: Number(data.skipped) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
};
