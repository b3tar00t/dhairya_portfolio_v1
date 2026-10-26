import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Gate from '@/components/gate/Gate';
import TopBar from '@/components/dossier/TopBar';
import Rail from '@/components/dossier/Rail';
import Recon from '@/components/dossier/Recon';
import Origin from '@/components/dossier/Origin';
import Arsenal from '@/components/dossier/Arsenal';
import Exploit from '@/components/dossier/Exploit';
import Access from '@/components/dossier/Access';
import Disclosure from '@/components/dossier/Disclosure';
import Persist from '@/components/dossier/Persist';
import Intel from '@/components/dossier/Intel';
import Hardening from '@/components/dossier/Hardening';
import Exfil from '@/components/dossier/Exfil';
import Footer from '@/components/dossier/Footer';
import Backdrop from '@/components/three/Backdrop';
import Cursor from '@/components/motion/Cursor';
import { useAccess, type AccessMethod } from '@/hooks/useAccess';
import { useResumeUrl } from '@/hooks/useResumeUrl';
import { applyMetaToDocument } from '@/lib/metaDom';
import { HOME_META } from '@/lib/routeMeta';

const Index = () => {
  const { access, grant } = useAccess();
  const resumeUrl = useResumeUrl();
  const { hash } = useLocation();
  const [justEntered, setJustEntered] = useState(false);
  const locked = access === null;
  const dossierRef = useRef<HTMLDivElement>(null);

  // React 18 has no typed `inert` prop; set the attribute directly.
  useEffect(() => {
    dossierRef.current?.toggleAttribute('inert', locked);
  }, [locked]);

  useEffect(() => applyMetaToDocument(HOME_META), []);

  // Deep links (/#exploit) land on their section once the dossier is open.
  useEffect(() => {
    if (!locked && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [locked, hash]);

  const handleGranted = (method: AccessMethod) => {
    setJustEntered(true);
    grant(method);
    window.scrollTo({ top: 0 });
    // Let held redactions peel once the stamp has landed.
    window.setTimeout(() => window.dispatchEvent(new Event('b3ta:granted')), 350);
  };

  return (
    <>
      {locked && <Gate onGranted={handleGranted} />}
      {!locked && <Backdrop />}
      <Cursor />

      {/* The dossier is always rendered, so crawlers and the brief see it; it is inert behind the gate. */}
      <div ref={dossierRef} aria-hidden={locked || undefined}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          Skip to content
        </a>
        <TopBar />
        <div className="container grid gap-12 lg:grid-cols-[11rem_minmax(0,1fr)]">
          <Rail />
          <main id="main" className="min-w-0">
            <Recon access={access} resumeUrl={resumeUrl} justEntered={justEntered} />
            <Origin />
            <Arsenal />
            <Exploit />
            <Access />
            <Disclosure />
            <Persist />
            <Intel />
            <Hardening />
            <Exfil />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;
