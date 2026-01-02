-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  read_time TEXT NOT NULL DEFAULT '1 min read',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read published blogs
CREATE POLICY "Anyone can read published blogs" 
ON public.blogs 
FOR SELECT 
USING (published = true);

-- Create policy to allow authenticated users to manage all blogs
CREATE POLICY "Authenticated users can manage blogs" 
ON public.blogs 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default blog posts
INSERT INTO public.blogs (id, slug, title, excerpt, content, date, tags, read_time, published) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'introduction-to-osint', 'Introduction to OSINT: The Art of Digital Investigation', 'Open Source Intelligence (OSINT) is the collection and analysis of information gathered from publicly available sources. Learn the fundamentals of this critical cybersecurity skill.', '## What is OSINT?

Open Source Intelligence (OSINT) refers to the collection, analysis, and dissemination of information that is publicly available and legally accessible. Unlike classified intelligence, OSINT leverages data from sources anyone can access.

## Why OSINT Matters

In today''s digital age, the amount of publicly available information has exploded. Social media, public records, news articles, and countless other sources provide a wealth of data for those who know how to look.

### Key OSINT Sources:
- **Social Media Platforms** - Twitter, LinkedIn, Facebook, Instagram
- **Public Records** - Court records, property records, business registrations
- **News & Media** - Online publications, press releases, archives
- **Technical Sources** - WHOIS data, DNS records, IP information
- **Dark Web** - Forums, marketplaces (requires specialized tools)

## Getting Started

```bash
# Essential OSINT tools to explore
$ theHarvester -d example.com -b all
$ maltego
$ shodan search "apache"
```

## Best Practices

1. **Document Everything** - Keep detailed notes of your findings
2. **Verify Sources** - Cross-reference information from multiple sources
3. **Stay Legal** - Always operate within legal boundaries
4. **Use VPNs** - Protect your identity during investigations

## Conclusion

OSINT is a powerful skill for any cybersecurity professional. Start with the basics, practice regularly, and always stay curious.

> "The best place to hide information is in plain sight." - Unknown', '2024-12-26', ARRAY['OSINT', 'Cybersecurity', 'Investigation'], '5 min read', true),

('550e8400-e29b-41d4-a716-446655440002', 'dark-web-investigation-basics', 'Dark Web Investigation: What You Need to Know', 'A guide to understanding the dark web and how cybersecurity professionals navigate this hidden layer of the internet for threat intelligence.', '## Understanding the Dark Web

The dark web is a part of the internet that isn''t indexed by standard search engines and requires special software to access, most commonly the Tor browser.

## The Three Layers of the Internet

```
Surface Web (4%)     → Indexed, publicly accessible
Deep Web (90%)       → Not indexed, requires authentication
Dark Web (6%)        → Encrypted, requires special software
```

## Why Investigate the Dark Web?

- **Threat Intelligence** - Monitor for stolen credentials
- **Brand Protection** - Identify counterfeit goods or impersonation
- **Fraud Prevention** - Track financial crime discussions
- **Law Enforcement** - Criminal investigations

## Safety First

Before diving into dark web research:

1. **Use a dedicated machine** - Never use your primary system
2. **Tor Browser** - The gateway to .onion sites
3. **VPN Layer** - Additional anonymity (Tor over VPN)
4. **No personal info** - Never reveal your identity
5. **Document carefully** - Screenshot with metadata stripped

## Common Dark Web Platforms

- Forums for threat actors
- Marketplaces for stolen data
- Paste sites for leaked credentials
- Communication channels

## Legal Considerations

Simply accessing the dark web is not illegal. However, engaging in illegal activities or purchasing illegal goods is a crime. Always operate within the bounds of the law.

Stay safe, stay legal, stay curious.', '2024-12-20', ARRAY['Dark Web', 'Threat Intelligence', 'Security Research'], '4 min read', true),

('550e8400-e29b-41d4-a716-446655440003', 'social-engineering-defense', 'Defending Against Social Engineering Attacks', 'Social engineering remains one of the most effective attack vectors. Learn how to recognize and defend against these psychological manipulation techniques.', '## The Human Vulnerability

No matter how strong your technical defenses are, humans remain the weakest link in security. Social engineering exploits human psychology rather than technical vulnerabilities.

## Common Attack Types

### Phishing
```
[!] Suspicious indicators:
    - Urgent language
    - Mismatched URLs
    - Generic greetings
    - Spelling errors
    - Requests for sensitive info
```

### Pretexting
Attackers create a fabricated scenario to extract information.

### Baiting
Using curiosity or greed (free USB drives, downloads).

### Tailgating
Physical access by following authorized personnel.

## Defense Strategies

1. **Security Awareness Training** - Regular education for all employees
2. **Verification Protocols** - Always verify unusual requests
3. **Multi-Factor Authentication** - Limit damage from credential theft
4. **Incident Reporting** - Make it easy to report suspicious activity
5. **Simulated Attacks** - Test your organization''s resilience

## Red Flags to Watch

- Urgency or pressure tactics
- Requests to bypass normal procedures
- Unsolicited contact asking for sensitive info
- Too-good-to-be-true offers
- Emotional manipulation

## Building ASSET

This is why I developed **ASSET** (Anti Social Engineering and Education Toolkit) - to help organizations detect, prevent, and train against these attacks.

Remember: Trust, but verify.', '2024-12-15', ARRAY['Social Engineering', 'Security Awareness', 'Defense'], '4 min read', true);