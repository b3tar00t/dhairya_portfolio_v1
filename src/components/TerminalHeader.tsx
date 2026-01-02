import { useState, useEffect } from 'react';

interface TerminalHeaderProps {
  title?: string;
}

const TerminalHeader = ({ title = "root@b3tar00t:~" }: TerminalHeaderProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="terminal-header">
      <div className="flex gap-2">
        <div className="terminal-dot bg-cyber-red" />
        <div className="terminal-dot bg-cyber-yellow" />
        <div className="terminal-dot bg-primary" />
      </div>
      <span className="flex-1 text-center text-xs text-muted-foreground font-mono">
        {title}
      </span>
      <span className="text-xs text-muted-foreground font-mono">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
    </div>
  );
};

export default TerminalHeader;
