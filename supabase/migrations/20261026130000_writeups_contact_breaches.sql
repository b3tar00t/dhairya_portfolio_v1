-- Writeups share the blogs table, distinguished by kind.
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'blog' CHECK (kind IN ('blog', 'writeup')),
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'insane')),
  ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS blogs_kind_date_idx ON public.blogs (kind, date DESC);

-- Contact form messages: anyone may send, only admins may read or delete.
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email LIKE '%_@_%'),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a message"
ON public.messages FOR INSERT
TO anon, authenticated
WITH CHECK (read = false);

CREATE POLICY "Admins read messages"
ON public.messages FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins update messages"
ON public.messages FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete messages"
ON public.messages FOR DELETE
USING (public.is_admin());

-- Breach counter for the gate scoreboard. The table is not directly
-- writable; visitors go through record_breach(), which only increments.
CREATE TABLE IF NOT EXISTS public.breach_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  solved BIGINT NOT NULL DEFAULT 0,
  skipped BIGINT NOT NULL DEFAULT 0
);

INSERT INTO public.breach_stats (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.breach_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read breach stats"
ON public.breach_stats FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.record_breach(method TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF method = 'solved' THEN
    UPDATE public.breach_stats SET solved = solved + 1 WHERE id = 'main';
  ELSIF method = 'skipped' THEN
    UPDATE public.breach_stats SET skipped = skipped + 1 WHERE id = 'main';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.record_breach(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_breach(TEXT) TO anon, authenticated;
