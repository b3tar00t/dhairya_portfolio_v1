import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ChevronDown } from 'lucide-react';
import TypewriterText from './TypewriterText';
import TerminalHeader from './TerminalHeader';
import { supabase } from '@/integrations/supabase/client';

const ASCII_LOGO = `
    ██████╗ ██████╗ ████████╗ █████╗ ██████╗  ██████╗  ██████╗ ████████╗
    ██╔══██╗╚════██╗╚══██╔══╝██╔══██╗██╔══██╗██╔═████╗██╔═████╗╚══██╔══╝
    ██████╔╝ █████╔╝   ██║   ███████║██████╔╝██║██╔██║██║██╔██║   ██║   
    ██╔══██╗ ╚═══██╗   ██║   ██╔══██║██╔══██╗████╔╝██║████╔╝██║   ██║   
    ██████╔╝██████╔╝   ██║   ██║  ██║██║  ██║╚██████╔╝╚██████╔╝   ██║   
    ╚═════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   
`;

const HeroSection = () => {
  const [showContent, setShowContent] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  const [resumeUrl, setResumeUrl] = useState<string>('/resume/DhairyaShukla_Resume.pdf');

  useEffect(() => {
    const timers = [
      setTimeout(() => setBootSequence(1), 500),
      setTimeout(() => setBootSequence(2), 1000),
      setTimeout(() => setBootSequence(3), 1500),
      setTimeout(() => setShowContent(true), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const fetchResumeUrl = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('resume_url')
        .eq('id', 'main')
        .maybeSingle();

      if (data?.resume_url) {
        setResumeUrl(data.resume_url);
      }
    };

    fetchResumeUrl();
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative px-4 pt-16">
      <div className="max-w-4xl w-full">
        <div className="terminal-window">
          <TerminalHeader title="root@b3tar00t:~/portfolio" />
          <div className="terminal-content min-h-[400px]">
            {/* Boot sequence */}
            <div className="space-y-1 mb-6">
              {bootSequence >= 1 && (
                <p className="text-muted-foreground animate-fade-in">
                  <span className="text-primary">[*]</span> Initializing secure connection...
                </p>
              )}
              {bootSequence >= 2 && (
                <p className="text-muted-foreground animate-fade-in">
                  <span className="text-primary">[*]</span> Loading portfolio modules...
                </p>
              )}
              {bootSequence >= 3 && (
                <p className="text-primary animate-fade-in">
                  <span className="text-primary">[✓]</span> System ready.
                </p>
              )}
            </div>

            {showContent && (
              <>
                {/* ASCII Logo */}
                <pre className="ascii-art text-[8px] sm:text-[10px] md:text-xs mb-6 animate-fade-in overflow-x-auto">
                  {ASCII_LOGO}
                </pre>

                {/* Main content */}
                <div className="space-y-4">
                  <div className="animate-fade-in stagger-1">
                    <span className="text-muted-foreground">$ whoami</span>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary text-glow mt-1">
                      Dhairya Shukla
                    </h1>
                  </div>

                  <div className="animate-fade-in stagger-2">
                    <span className="text-muted-foreground">$ cat role.txt</span>
                    <p className="text-lg md:text-xl text-foreground mt-1">
                      <TypewriterText 
                        text="Cybersecurity Researcher | OSINT Investigator | Penetration Tester" 
                        delay={30}
                      />
                    </p>
                  </div>

                  <div className="animate-fade-in stagger-3">
                    <span className="text-muted-foreground">$ cat status.txt</span>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="status-online" />
                      Available for opportunities
                    </p>
                  </div>

                  {/* Social links */}
                  <div className="animate-fade-in stagger-4 pt-4">
                    <span className="text-muted-foreground block mb-3">$ ls -la ~/social/</span>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="https://github.com/b3tar00t"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-terminal flex items-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                      <a
                        href="https://linkedin.com/in/dhairyashukla7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-terminal flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                      <a
                        href="mailto:dhairya.shukla2005@gmail.com"
                        className="btn-terminal flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div className="animate-fade-in stagger-5 pt-4">
                    <span className="text-muted-foreground block mb-3">$ cat ~/quick_links.txt</span>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/blog"
                        className="btn-terminal-filled flex items-center gap-2"
                      >
                        <span>Read Blog</span>
                      </a>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-terminal flex items-center gap-2"
                      >
                        <span>Download Resume</span>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-8 animate-bounce">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
