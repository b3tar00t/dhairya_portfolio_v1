import { Terminal, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">
              <span className="text-primary">root@b3tar00t</span>:~$ echo "© {currentYear}"
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-cyber-red fill-cyber-red" />
            <span>and caffeine</span>
          </div>

          <div className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">[</span>
            Dhairya Shukla
            <span className="text-primary">]</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
