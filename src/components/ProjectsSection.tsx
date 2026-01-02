import { Github, ExternalLink, Shield, Code } from 'lucide-react';
import TerminalHeader from './TerminalHeader';

const projects = [
  {
    name: 'ASSET',
    fullName: 'Anti Social Engineering and Education Toolkit',
    description: 'Tool for detecting, preventing, and training against social engineering attacks.',
    tags: ['Python', 'Security', 'Awareness Training'],
    github: '#',
    demo: '#',
    featured: true
  },
  {
    name: 'GitHub Projects',
    fullName: 'Security Tools Repository',
    description: '5+ repositories focused on cybersecurity tools with ongoing development of additional projects.',
    tags: ['Python', 'Bash', 'Security Tools'],
    github: 'https://github.com/b3tar00t',
    featured: false
  }
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          Projects
        </h2>

        <div className="terminal-window mb-6">
          <TerminalHeader title="ls -la ~/projects/" />
          <div className="terminal-content">
            <div className="text-muted-foreground text-sm mb-4">
              <p>total {projects.length}</p>
              <p className="text-primary">drwxr-xr-x  {projects.length} b3tar00t  security  4096 Dec 26 ./</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {projects.map((project, index) => (
            <div 
              key={project.name}
              className="terminal-window hover-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TerminalHeader title={`cat ${project.name.toLowerCase().replace(/\s/g, '_')}/README.md`} />
              <div className="terminal-content">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {project.featured ? (
                        <Shield className="w-5 h-5 text-primary" />
                      ) : (
                        <Code className="w-5 h-5 text-muted-foreground" />
                      )}
                      <h3 className="text-xl font-bold text-primary text-glow">
                        {project.name}
                      </h3>
                      {project.featured && (
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-medium mb-2">{project.fullName}</p>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-terminal flex items-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      <span>Source</span>
                    </a>
                    {project.demo && project.demo !== '#' && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-terminal-filled flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More projects CTA */}
        <div className="text-center mt-8">
          <a
            href="https://github.com/b3tar00t"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-terminal inline-flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            View All Repositories
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
