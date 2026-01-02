import { useState } from 'react';
import { Mail, Phone, Github, Linkedin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TerminalHeader from './TerminalHeader';

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });

    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <h2 className="section-header text-2xl font-bold text-foreground">
          Contact
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="terminal-window">
            <TerminalHeader title="cat contact_info.txt" />
            <div className="terminal-content">
              <p className="text-muted-foreground mb-6">
                <span className="text-primary">$</span> Ready to collaborate or have questions? 
                Let's connect and build something secure together.
              </p>

              <div className="space-y-4">
                <a 
                  href="mailto:dhairya.shukla2005@gmail.com"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="group-hover:underline">dhairya.shukla2005@gmail.com</span>
                </a>

                <a 
                  href="tel:+918779969061"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="group-hover:underline">+91 8779969061</span>
                </a>

                <a 
                  href="https://github.com/b3tar00t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                >
                  <Github className="w-5 h-5 text-primary" />
                  <span className="group-hover:underline">github.com/b3tar00t</span>
                </a>

                <a 
                  href="https://linkedin.com/in/dhairyashukla7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                >
                  <Linkedin className="w-5 h-5 text-primary" />
                  <span className="group-hover:underline">linkedin.com/in/dhairyashukla7</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="terminal-window">
            <TerminalHeader title="./send_message.sh" />
            <div className="terminal-content">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    <span className="text-primary">$</span> Enter your name:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-terminal w-full"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    <span className="text-primary">$</span> Enter your email:
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-terminal w-full"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    <span className="text-primary">$</span> Enter your message:
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-terminal w-full h-32 resize-none"
                    placeholder="Your message here..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-terminal-filled w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
