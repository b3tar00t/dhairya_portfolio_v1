import { Award, Trophy, Shield, Star } from 'lucide-react';
import TerminalHeader from './TerminalHeader';

const achievements = [
  {
    icon: Award,
    title: 'Certified Network Security Practitioner (CNSP)',
    description: 'Professional certification in Network Security',
    type: 'certification'
  },
  {
    icon: Shield,
    title: 'Certified Cyber Criminologist',
    description: 'Licensed certification in cybercriminal investigation',
    type: 'certification'
  },
  {
    icon: Trophy,
    title: 'Yellow Network Hackathon Winner',
    description: 'First place in competitive hackathon',
    type: 'award'
  },
  {
    icon: Star,
    title: 'Hall of Fame Mentions',
    description: 'NASA, NCIIPC, Drexel University, Skoda, and more',
    type: 'recognition'
  },
  {
    icon: Award,
    title: 'CertiProf Cyber Security Foundation',
    description: 'Professional certification in cybersecurity fundamentals',
    type: 'certification'
  },
  {
    icon: Award,
    title: 'SIFS Crime Scene Investigation',
    description: 'Certified in forensic crime scene investigation',
    type: 'certification'
  },
  {
    icon: Award,
    title: 'ISEA Cyber Ethics Certification',
    description: 'Certified by MeitY in cyber ethics',
    type: 'certification'
  }
];

const AchievementsSection = () => {
  return (
    <section id="achievements" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          Achievements
        </h2>

        <div className="terminal-window">
          <TerminalHeader title="./achievements --list" />
          <div className="terminal-content">
            <p className="text-muted-foreground mb-4">
              <span className="text-primary">[+]</span> Loading achievements database...
            </p>
            <p className="text-primary mb-6">
              <span className="text-primary">[✓]</span> Found {achievements.length} achievements
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={achievement.title}
                  className="card-terminal group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded border ${
                      achievement.type === 'award' 
                        ? 'border-cyber-yellow text-cyber-yellow' 
                        : achievement.type === 'recognition'
                        ? 'border-cyber-cyan text-cyber-cyan'
                        : 'border-primary text-primary'
                    }`}>
                      <achievement.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium group-hover:text-primary transition-colors">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
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

export default AchievementsSection;
