import { supabase } from '@/integrations/supabase/client';

export type AnalyticsEvent =
  | 'page_view'
  | 'resume_download'
  | 'gate_solved'
  | 'gate_skipped'
  | 'project_open'
  | 'flag_found'
  | 'contact_sent'
  | 'palette_open';

// Respect Do Not Track, and never count the admin panel.
const disabled = () =>
  typeof navigator === 'undefined' ||
  navigator.doNotTrack === '1' ||
  window.location.pathname.startsWith('/admin');

const externalReferrer = () => {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).host;
    return host && host !== window.location.host ? host : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Records an anonymous event. Fire-and-forget: tracking never blocks or
 * breaks the page. The database hashes the visitor; nothing is stored here.
 */
export const track = (event: AnalyticsEvent, label?: string) => {
  if (disabled()) return;
  supabase
    .rpc('track_event', {
      p_event: event,
      p_path: window.location.pathname,
      p_referrer: event === 'page_view' ? externalReferrer() : undefined,
      p_label: label,
    })
    .then(
      () => undefined,
      () => undefined,
    );
};
