import { Briefcase, Calendar } from 'lucide-react';
import TerminalHeader from './TerminalHeader';

const experiences = [
  {
    title: 'Student Council Lead',
    company: 'CyberSecurity Council of India (NPO)',
    period: 'October 2025 – Present',
    description: [
      'Leading cybersecurity research initiatives to monitor threat trends',
      'Expanding the council\'s digital impact through strategic initiatives'
    ],
    current: true
  },
  {
    title: 'OSINT Investigator and Analyst Intern',
    company: 'DeepCytes',
    period: 'June 2024 – December 2024',
    description: [
      'Led Dark Web team and contributed to strategic cybersecurity reports',
      'Research on emerging trends in cyber threats',
      'Leveraged OSINT to assist victims of cyber fraud',
      'Developed custom toolkits for investigation purposes'
    ],
    current: false
  },
  {
    title: 'Cyber Crime Investigator',
    company: 'The Cyber Agents (NGO)',
    period: 'March 2020 – April 2022',
    description: [
      'Investigated cyber fraud and blackmail cases',
      'Contributed as a volunteer to NGO cybercrime initiatives',
      'Assisted in various cybercrime investigation cases'
    ],
    current: false
  }
];

const ExperienceSection = () => {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          Experience
        </h2>

        <div className="terminal-window">
          <TerminalHeader title="cat /var/log/career.log" />
          <div className="terminal-content">
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div 
                  key={exp.title}
                  className="relative pl-6 pb-6 border-l-2 border-border last:border-l-primary last:pb-0 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                    exp.current 
                      ? 'border-primary bg-primary animate-pulse' 
                      : 'border-border bg-background'
                  }`} />

                  <div className="card-terminal ml-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-primary text-glow">
                          {exp.title}
                        </h3>
                        <p className="text-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {exp.period}
                      </span>
                    </div>

                    <ul className="space-y-1 mt-3">
                      {exp.description.map((item, i) => (
                        <li key={i} className="text-muted-foreground text-sm flex gap-2">
                          <span className="text-primary">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {exp.current && (
                      <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary">
                        <span className="status-online" />
                        Currently Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
