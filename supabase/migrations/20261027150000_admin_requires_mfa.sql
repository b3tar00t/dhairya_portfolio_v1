-- Once an admin has enrolled an authenticator app, their writes require a
-- session that passed the 2FA check (aal2). A stolen password alone can
-- then sign in but can't change anything. Admins without a verified factor
-- keep working at aal1, so enabling 2FA can't lock anyone out mid-setup.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
    AND (
      COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      OR NOT EXISTS (
        SELECT 1 FROM auth.mfa_factors
        WHERE user_id = auth.uid() AND status = 'verified'
      )
    );
$$;
