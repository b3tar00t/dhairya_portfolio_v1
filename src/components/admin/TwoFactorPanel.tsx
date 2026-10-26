import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Enrollment {
  factorId: string;
  qr: string;
  secret: string;
}

const codeInput =
  'input-terminal w-40 text-center font-mono text-xl tracking-[0.4em]';

/** Enable or disable an authenticator-app (TOTP) second factor. */
const TwoFactorPanel = () => {
  const { toast } = useToast();
  const [factorId, setFactorId] = useState<string | null | undefined>(undefined);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOff, setConfirmOff] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactorId(data?.totp.find((f) => f.status === 'verified')?.id ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const start = async () => {
    setBusy(true);
    setError('');
    // Clear abandoned, never-verified setups first; Supabase rejects duplicates.
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const f of existing?.all ?? []) {
      if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (e || !data) {
      setError(e?.message ?? 'Couldn’t start setup.');
      return;
    }
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code: code.trim() });
    setBusy(false);
    if (err) {
      setError('That code didn’t match. Check your phone’s clock and try the newest code.');
      return;
    }
    setEnrollment(null);
    setCode('');
    await load();
    toast({ title: 'Two-factor authentication is on', description: 'You’ll enter a code from your app every time you sign in.' });
  };

  const disable = async () => {
    if (!factorId) return;
    setBusy(true);
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (err) {
      toast({ title: 'Couldn’t turn off 2FA', description: err.message, variant: 'destructive' });
      return;
    }
    await supabase.auth.refreshSession();
    await load();
    toast({ title: 'Two-factor authentication is off' });
  };

  return (
    <section className="hud max-w-lg space-y-5 rounded-lg border border-border bg-card p-6" aria-labelledby="mfa-title">
      <div className="flex items-start gap-3">
        {factorId ? <ShieldCheck className="mt-0.5 h-6 w-6 text-signal" aria-hidden /> : <ShieldOff className="mt-0.5 h-6 w-6 text-muted-foreground" aria-hidden />}
        <div>
          <h2 id="mfa-title" className="text-lg font-bold">Two-factor authentication</h2>
          <p className="text-sm text-muted-foreground">
            {factorId === undefined
              ? 'Checking…'
              : factorId
                ? 'On. Signing in needs your password and a code from your authenticator app, and the database rejects admin changes from sessions without it.'
                : 'Off. Add an authenticator app (Google Authenticator, Authy, 1Password, Bitwarden) so a leaked password alone can’t get in.'}
          </p>
        </div>
      </div>

      {factorId === null && !enrollment && (
        <button type="button" onClick={start} disabled={busy} className="btn-terminal-filled gap-2">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Set up authenticator app
        </button>
      )}

      {enrollment && (
        <form onSubmit={verify} className="space-y-4">
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              Scan this QR code with your authenticator app.
              <img src={enrollment.qr} alt="QR code for your authenticator app" className="mt-3 h-44 w-44 rounded-md bg-white p-2" />
            </li>
            <li>
              Can’t scan? Enter this key manually:
              <code className="mt-1 block break-all rounded bg-secondary px-2 py-1 font-mono text-xs">{enrollment.secret}</code>
            </li>
            <li>
              <label htmlFor="mfa-enroll-code">Enter the 6-digit code the app shows.</label>
              <input
                id="mfa-enroll-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className={`${codeInput} mt-2 block`}
              />
            </li>
          </ol>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6} className="btn-terminal-filled gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Turn on 2FA
            </button>
            <button type="button" onClick={() => { setEnrollment(null); setCode(''); setError(''); }} className="btn-terminal">
              Cancel
            </button>
          </div>
        </form>
      )}

      {factorId && (
        <button type="button" onClick={() => setConfirmOff(true)} disabled={busy} className="btn-terminal gap-2 text-destructive">
          Turn off 2FA
        </button>
      )}

      {error && !enrollment && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <AlertDialog open={confirmOff} onOpenChange={setConfirmOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off two-factor authentication?</AlertDialogTitle>
            <AlertDialogDescription>Your admin account will be protected by its password alone, and you’ll need to scan a new QR code to turn it back on.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep 2FA on</AlertDialogCancel>
            <AlertDialogAction onClick={disable} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Turn it off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default TwoFactorPanel;
