import { useLocation, Link } from 'react-router-dom';
import PageShell from '@/components/PageShell';

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <PageShell meta={{ title: 'Not found | Dhairya Shukla', description: 'This page doesn’t exist.', path: pathname }}>
      <div className="max-w-2xl">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="display mt-3 text-6xl">Nothing at this path</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          <code className="font-mono text-foreground">{pathname}</code> doesn’t exist. Enumeration is a good habit, but
          this one’s a dead end.
        </p>
        <Link to="/" className="mt-8 inline-block rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
          Go to the homepage
        </Link>
      </div>
    </PageShell>
  );
};

export default NotFound;
