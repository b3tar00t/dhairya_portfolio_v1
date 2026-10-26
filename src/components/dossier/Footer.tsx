import { FLAGS } from '@/lib/flags';
import { useFlags } from '@/hooks/useAccess';
import { openPalette } from '@/components/palette/events';
import { useContent } from '@/content/ContentProvider';

const Footer = () => {
  const { profile } = useContent();
  const { found } = useFlags();

  return (
    <footer className="border-t border-border py-10 print:hidden text-sm text-muted-foreground">
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name}, {new Date().getFullYear()}. Report a vulnerability via{' '}
          <a href="/.well-known/security.txt" className="link-underline">security.txt</a>.
        </p>
        <button type="button" onClick={() => openPalette('terminal')} className="text-left hover:text-foreground">
          Flags found: <span className="font-mono text-foreground">{found.length}/{FLAGS.length}</span>
          {found.length < FLAGS.length ? ', open the terminal to submit more' : ', every one. Respect.'}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
