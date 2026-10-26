import { useEffect, useRef, useState } from 'react';

interface RedactProps {
  children: React.ReactNode;
  /** Delay after entering view, so a line of redactions peels in sequence. */
  delay?: number;
}

/**
 * Text under a redaction bar that peels away the first time it scrolls into
 * view. Screen readers always get the text; reduced motion shows it at once.
 */
const Redact = ({ children, delay = 0 }: RedactProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | undefined;
    let waitingForGate = false;
    const reveal = () => {
      timer = window.setTimeout(() => setRevealed(true), delay);
    };
    // Behind the locked gate, hold the reveal until the visitor gets in.
    const onGranted = () => {
      if (waitingForGate) reveal();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (el.closest('[inert]')) waitingForGate = true;
        else reveal();
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(el);
    window.addEventListener('b3ta:granted', onGranted);
    return () => {
      observer.disconnect();
      window.removeEventListener('b3ta:granted', onGranted);
      window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <span ref={ref} className="redact" data-revealed={revealed}>
      {children}
    </span>
  );
};

export default Redact;
