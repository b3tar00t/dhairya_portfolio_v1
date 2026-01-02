import { Shield, Code, Search, Award } from 'lucide-react';
import TerminalHeader from './TerminalHeader';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          About
        </h2>

        <div className="terminal-window">
          <TerminalHeader title="cat about.md" />
          <div className="terminal-content">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-primary">$</span> B.Tech IT student with nearly{' '}
                <span className="text-primary text-glow">5 years of experience</span> in cybersecurity, 
                including OSINT, cybercrime investigation, and penetration testing.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <span className="text-primary">$</span> Strong in debugging, problem-solving, and adapting 
                to challenges with a resilient, never-give-up mindset. Passionate about cybersecurity, 
                IoT, and emerging technologies.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <span className="text-primary">$</span> Active participant in CTF competitions and 
                continuous learner in the ever-evolving field of cybersecurity.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Shield, label: 'Security', desc: 'Threat Hunting' },
                { icon: Search, label: 'OSINT', desc: 'Investigation' },
                { icon: Code, label: 'Pentesting', desc: 'Vulnerability Assessment' },
                { icon: Award, label: 'CTFs', desc: 'Active Player' },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="card-terminal text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-foreground font-medium">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="mt-8 terminal-window">
          <TerminalHeader title="cat education.txt" />
          <div className="terminal-content">
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4">
                <p className="text-primary text-glow">Dwarkadas J. Sanghvi College of Engineering</p>
                <p className="text-foreground">B.Tech in Information Technology</p>
                <p className="text-muted-foreground text-sm">2023 – 2027</p>
              </div>
              <div className="border-l-2 border-border pl-4">
                <p className="text-muted-foreground">Nirmala Memorial Foundation College of Engineering</p>
                <p className="text-sm text-muted-foreground">2021 – 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
