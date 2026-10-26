-- Rate-limit the public contact form at the database, where a bot calling the
-- REST API directly can't skip it. Senders are keyed by a hash of their IP
-- (from the request headers PostgREST forwards), never the raw address.

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_hash TEXT;

CREATE INDEX IF NOT EXISTS messages_sender_recent_idx ON public.messages (sender_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.messages_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  headers JSON := NULLIF(current_setting('request.headers', true), '')::json;
  ip TEXT := split_part(COALESCE(headers->>'x-forwarded-for', headers->>'x-real-ip', 'unknown'), ',', 1);
BEGIN
  NEW.sender_hash := encode(digest(trim(ip) || ':b3ta-contact', 'sha256'), 'hex');
  NEW.read := false;

  -- Per sender: 3 messages per 10 minutes.
  IF (SELECT count(*) FROM public.messages
      WHERE sender_hash = NEW.sender_hash AND created_at > now() - interval '10 minutes') >= 3 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  -- Everyone together: 60 messages per hour, so a botnet can't flood the inbox.
  IF (SELECT count(*) FROM public.messages WHERE created_at > now() - interval '1 hour') >= 60 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_rate_limit ON public.messages;
CREATE TRIGGER messages_rate_limit
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.messages_rate_limit();
