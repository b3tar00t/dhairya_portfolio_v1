-- 1. Editable site content. One row per section (experience, skills, ...);
--    the site falls back to the content bundled in code for missing rows.
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY CHECK (key ~ '^[a-zA-Z]+$'),
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins insert site content" ON public.site_content FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update site content" ON public.site_content FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete site content" ON public.site_content FOR DELETE USING (public.is_admin());

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Privacy-friendly analytics. No cookies and no IPs stored: a visitor is a
--    hash of IP + user agent + the day + a secret salt, so it can't be
--    reversed or followed across days.
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL CHECK (event IN (
    'page_view', 'resume_download', 'gate_solved', 'gate_skipped',
    'project_open', 'flag_found', 'contact_sent', 'palette_open'
  )),
  path TEXT CHECK (char_length(path) <= 300),
  referrer TEXT CHECK (char_length(referrer) <= 200),
  label TEXT CHECK (char_length(label) <= 120),
  visitor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_time_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx ON public.analytics_events (visitor, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- No policies: the table is reachable only through the functions below.

CREATE TABLE IF NOT EXISTS public.analytics_salt (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  salt TEXT NOT NULL
);
ALTER TABLE public.analytics_salt ENABLE ROW LEVEL SECURITY;
INSERT INTO public.analytics_salt (salt)
VALUES (encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.track_event(p_event TEXT, p_path TEXT DEFAULT NULL, p_referrer TEXT DEFAULT NULL, p_label TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  headers JSON := NULLIF(current_setting('request.headers', true), '')::json;
  ip TEXT := trim(split_part(COALESCE(headers->>'x-forwarded-for', headers->>'x-real-ip', ''), ',', 1));
  ua TEXT := COALESCE(headers->>'user-agent', '');
  v TEXT;
BEGIN
  -- Ignore obvious bots.
  IF ua ~* '(bot|crawl|spider|slurp|preview|headless|lighthouse)' THEN
    RETURN;
  END IF;

  v := encode(digest(ip || '|' || ua || '|' || current_date::text || '|' || (SELECT salt FROM analytics_salt), 'sha256'), 'hex');

  -- Cap each visitor at 200 events an hour so the numbers can't be inflated cheaply.
  IF (SELECT count(*) FROM analytics_events WHERE visitor = v AND created_at > now() - interval '1 hour') >= 200 THEN
    RETURN;
  END IF;

  INSERT INTO analytics_events (event, path, referrer, label, visitor)
  VALUES (p_event, left(p_path, 300), left(p_referrer, 200), left(p_label, 120), v);
END;
$$;

REVOKE ALL ON FUNCTION public.track_event(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_event(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Admin dashboard numbers for the last `days` days.
CREATE OR REPLACE FUNCTION public.analytics_summary(days INT DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since TIMESTAMP WITH TIME ZONE := date_trunc('day', now()) - make_interval(days => GREATEST(days, 1) - 1);
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin' USING ERRCODE = '42501';
  END IF;

  SELECT json_build_object(
    'since', since,
    'totals', (
      SELECT COALESCE(json_object_agg(event, n), '{}'::json)
      FROM (SELECT event, count(*) AS n FROM analytics_events WHERE created_at >= since GROUP BY event) t
    ),
    'visitors', (SELECT count(DISTINCT visitor) FROM analytics_events WHERE created_at >= since),
    'daily', (
      SELECT COALESCE(json_agg(row_to_json(d) ORDER BY d.day), '[]'::json)
      FROM (
        SELECT g.day::date AS day,
               count(e.id) FILTER (WHERE e.event = 'page_view') AS views,
               count(DISTINCT e.visitor) AS visitors,
               count(e.id) FILTER (WHERE e.event = 'resume_download') AS resumes
        FROM generate_series(since, date_trunc('day', now()), interval '1 day') AS g(day)
        LEFT JOIN analytics_events e ON date_trunc('day', e.created_at) = g.day
        GROUP BY g.day
      ) d
    ),
    'top_paths', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM (
        SELECT path, count(*) AS n FROM analytics_events
        WHERE created_at >= since AND event = 'page_view' AND path IS NOT NULL
        GROUP BY path ORDER BY n DESC LIMIT 8
      ) p
    ),
    'top_referrers', (
      SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
      FROM (
        SELECT referrer, count(DISTINCT visitor) AS n FROM analytics_events
        WHERE created_at >= since AND event = 'page_view' AND referrer IS NOT NULL AND referrer <> ''
        GROUP BY referrer ORDER BY n DESC LIMIT 8
      ) r
    ),
    'top_labels', (
      SELECT COALESCE(json_agg(row_to_json(l)), '[]'::json)
      FROM (
        SELECT event, label, count(*) AS n FROM analytics_events
        WHERE created_at >= since AND label IS NOT NULL AND event IN ('project_open', 'flag_found', 'resume_download')
        GROUP BY event, label ORDER BY n DESC LIMIT 12
      ) l
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_summary(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_summary(INT) TO authenticated;
