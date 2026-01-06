import TerminalHeader from './TerminalHeader';

const technicalSkills = [
  { name: 'OSINT & Intelligence', level: 95 },
  { name: 'Penetration Testing', level: 90 },
  { name: 'Digital Forensics', level: 85 },
  { name: 'Vulnerability Assessment', level: 88 },
  { name: 'Cyber Threat Hunting', level: 85 },
  { name: 'Log Analysis', level: 80 },
  { name: 'Python', level: 90 },
  { name: 'Bash Scripting', level: 80 },
  { name: 'C/C++', level: 75 },
  { name: 'Java', level: 70 },
];

const tools = [
  'Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 
  'John the Ripper', 'Hydra', 'SQLMap', 'Nessus',
  'Maltego', 'theHarvester', 'Shodan', 'Amass',
  'Nuclei', 'Volatility', 'FTK Imager', 'Ghidra'
];

const softSkills = [
  'Problem Solving', 'Critical Thinking', 'Leadership',
  'Teamwork', 'Adaptability', 'Event Management', 'Consistency'
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          Skills
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Technical Skills */}
          <div className="terminal-window">
            <TerminalHeader title="./skills --technical" />
            <div className="terminal-content">
              <p className="text-muted-foreground mb-4">
                <span className="text-primary">$</span> Scanning skill levels...
              </p>
              <div className="space-y-3">
                {technicalSkills.map((skill, index) => (
                  <div 
                    key={skill.name}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{skill.name}</span>
                      <span className="text-primary">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-bar-fill"
                        style={{ 
                          width: `${skill.level}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tools & Soft Skills */}
          <div className="space-y-6">
            {/* Tools */}
            <div className="terminal-window">
              <TerminalHeader title="ls ~/tools/" />
              <div className="terminal-content">
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool, index) => (
                    <span 
                      key={tool}
                      className="tag animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Soft Skills */}
            <div className="terminal-window">
              <TerminalHeader title="cat soft_skills.txt" />
              <div className="terminal-content">
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill, index) => (
                    <span 
                      key={skill}
                      className="tag border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
