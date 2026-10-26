import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Linked only from robots.txt's Disallow list.
const Vault = () => {
  useEffect(() => {
    document.title = 'Vault';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main className="flex min-h-screen items-center bg-perimeter px-4 text-phosphor">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-sm text-phosphor/70">/vault</p>
        <h1 className="display mt-4 text-5xl">You read robots.txt.</h1>
        <p className="mt-6 text-[hsl(37_60%_88%)]">
          Disallow lists tell crawlers where not to look, which tells everyone else exactly where to look.
        </p>
        <p className="mt-8 rounded-md border border-phosphor/40 px-4 py-3 font-mono">flag{'{'}r0b0ts_kn0w_th3_w4y{'}'}</p>
        <Link to="/" className="mt-10 inline-block font-semibold underline underline-offset-4">
          Back to the gate
        </Link>
      </div>
    </main>
  );
};

export default Vault;
