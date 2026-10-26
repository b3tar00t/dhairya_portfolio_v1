-- Restrict all content writes to explicitly listed admin accounts.
-- Previously any authenticated user (including self-signed-up accounts)
-- could manage blogs, site settings and uploaded files.

-- Admin allowlist. RLS on with no policies: only the SQL editor / service role can change it.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

-- RESTRICTIVE policies are ANDed with every existing permissive policy,
-- so they lock things down without needing to know older policy names.

-- blogs: drafts visible to admins only; writes admin only
CREATE POLICY "Only admins see drafts"
ON public.blogs AS RESTRICTIVE FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "Only admins insert blogs"
ON public.blogs AS RESTRICTIVE FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins update blogs"
ON public.blogs AS RESTRICTIVE FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins delete blogs"
ON public.blogs AS RESTRICTIVE FOR DELETE
USING (public.is_admin());

-- site_settings: public read stays as-is; writes admin only
DO $$
BEGIN
  IF to_regclass('public.site_settings') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Only admins insert settings" ON public.site_settings AS RESTRICTIVE FOR INSERT WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Only admins update settings" ON public.site_settings AS RESTRICTIVE FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Only admins delete settings" ON public.site_settings AS RESTRICTIVE FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

-- storage: uploads to the site buckets admin only; public reads unaffected
CREATE POLICY "Only admins upload site files"
ON storage.objects AS RESTRICTIVE FOR INSERT
WITH CHECK (bucket_id NOT IN ('resumes', 'blog-images') OR public.is_admin());

CREATE POLICY "Only admins update site files"
ON storage.objects AS RESTRICTIVE FOR UPDATE
USING (bucket_id NOT IN ('resumes', 'blog-images') OR public.is_admin())
WITH CHECK (bucket_id NOT IN ('resumes', 'blog-images') OR public.is_admin());

CREATE POLICY "Only admins delete site files"
ON storage.objects AS RESTRICTIVE FOR DELETE
USING (bucket_id NOT IN ('resumes', 'blog-images') OR public.is_admin());
