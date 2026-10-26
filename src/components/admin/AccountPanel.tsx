import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RULES = [
  { test: (p: string) => p.length >= 12, label: 'At least 12 characters' },
  { test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p), label: 'Upper and lower case letters' },
  { test: (p: string) => /\d/.test(p), label: 'A number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'A symbol' },
];

/** Change the admin password. The current password is checked first. */
const AccountPanel = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const passes = RULES.every((r) => r.test(next));
  const matches = next.length > 0 && next === confirm;
  const different = next !== current;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passes || !matches || !different) return;
    setBusy(true);
    // Re-authenticate: a session left open on someone else's screen isn't enough.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (authError) {
      setBusy(false);
      setError('Your current password is incorrect.');
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setCurrent('');
    setNext('');
    setConfirm('');
    toast({ title: 'Password changed', description: 'Use the new password next time you sign in.' });
  };

  const type = show ? 'text' : 'password';

  return (
    <form onSubmit={submit} className="hud max-w-lg space-y-5 rounded-lg border border-border bg-card p-6" noValidate>
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{email || '…'}</span>
      </p>

      <div>
        <label htmlFor="pw-current" className="mb-1 block text-sm text-muted-foreground">Current password</label>
        <input id="pw-current" type={type} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input-terminal w-full" required />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="pw-new" className="text-sm text-muted-foreground">New password</label>
          <button type="button" onClick={() => setShow((s) => !s)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" aria-pressed={show}>
            {show ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
            {show ? 'Hide' : 'Show'} passwords
          </button>
        </div>
        <input id="pw-new" type={type} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="input-terminal w-full" aria-describedby="pw-rules" required />
        <ul id="pw-rules" className="mt-2 grid grid-cols-2 gap-1 text-xs">
          {RULES.map((r) => {
            const ok = r.test(next);
            return (
              <li key={r.label} className={`flex items-center gap-1.5 ${ok ? 'text-signal' : 'text-muted-foreground'}`}>
                {ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
                {r.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <label htmlFor="pw-confirm" className="mb-1 block text-sm text-muted-foreground">Confirm new password</label>
        <input id="pw-confirm" type={type} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-terminal w-full" required />
        {confirm && !matches && <p className="mt-1 text-xs text-destructive">The passwords don’t match.</p>}
        {next && current && !different && <p className="mt-1 text-xs text-destructive">Choose a password different from the current one.</p>}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy || !passes || !matches || !different || !current} className="btn-terminal-filled gap-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Change password
      </button>
    </form>
  );
};

export default AccountPanel;
