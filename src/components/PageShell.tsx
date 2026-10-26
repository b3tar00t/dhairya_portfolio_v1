import { useEffect } from 'react';
import TopBar from '@/components/dossier/TopBar';
import Footer from '@/components/dossier/Footer';
import Backdrop from '@/components/three/Backdrop';
import Cursor from '@/components/motion/Cursor';
import type { PageMeta } from '@/lib/meta';
import { applyMetaToDocument } from '@/lib/metaDom';

interface PageShellProps {
  meta: PageMeta;
  children: React.ReactNode;
}

/** Layout for every page except the dossier: top bar, content, footer. */
const PageShell = ({ meta, children }: PageShellProps) => {
  useEffect(() => {
    applyMetaToDocument(meta);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.path, meta.title]);

  return (
    <>
      <Backdrop />
      <Cursor />
      <TopBar />
      <main id="main" className="container min-h-[70vh] py-12 sm:py-16">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default PageShell;
