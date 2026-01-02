export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  readTime: string;
}

// Add your blog posts here - they will be published directly to the website
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'introduction-to-osint',
    title: 'Introduction to OSINT: The Art of Digital Investigation',
    excerpt: 'Open Source Intelligence (OSINT) is the collection and analysis of information gathered from publicly available sources. Learn the fundamentals of this critical cybersecurity skill.',
    content: `
## What is OSINT?

Open Source Intelligence (OSINT) refers to the collection, analysis, and dissemination of information that is publicly available and legally accessible. Unlike classified intelligence, OSINT leverages data from sources anyone can access.

## Why OSINT Matters

In today's digital age, the amount of publicly available information has exploded. Social media, public records, news articles, and countless other sources provide a wealth of data for those who know how to look.

### Key OSINT Sources:
- **Social Media Platforms** - Twitter, LinkedIn, Facebook, Instagram
- **Public Records** - Court records, property records, business registrations
- **News & Media** - Online publications, press releases, archives
- **Technical Sources** - WHOIS data, DNS records, IP information
- **Dark Web** - Forums, marketplaces (requires specialized tools)

## Getting Started

\`\`\`bash
# Essential OSINT tools to explore
$ theHarvester -d example.com -b all
$ maltego
$ shodan search "apache"
\`\`\`

## Best Practices

1. **Document Everything** - Keep detailed notes of your findings
2. **Verify Sources** - Cross-reference information from multiple sources
3. **Stay Legal** - Always operate within legal boundaries
4. **Use VPNs** - Protect your identity during investigations

## Conclusion

OSINT is a powerful skill for any cybersecurity professional. Start with the basics, practice regularly, and always stay curious.

> "The best place to hide information is in plain sight." - Unknown
    `,
    date: '2024-12-26',
    tags: ['OSINT', 'Cybersecurity', 'Investigation'],
    readTime: '5 min read'
  },
  {
    id: '2',
    slug: 'dark-web-investigation-basics',
    title: 'Dark Web Investigation: What You Need to Know',
    excerpt: 'A guide to understanding the dark web and how cybersecurity professionals navigate this hidden layer of the internet for threat intelligence.',
    content: `
## Understanding the Dark Web

The dark web is a part of the internet that isn't indexed by standard search engines and requires special software to access, most commonly the Tor browser.

## The Three Layers of the Internet

\`\`\`
Surface Web (4%)     → Indexed, publicly accessible
Deep Web (90%)       → Not indexed, requires authentication
Dark Web (6%)        → Encrypted, requires special software
\`\`\`

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

Stay safe, stay legal, stay curious.
    `,
    date: '2024-12-20',
    tags: ['Dark Web', 'Threat Intelligence', 'Security Research'],
    readTime: '4 min read'
  },
  {
    id: '3',
    slug: 'social-engineering-defense',
    title: 'Defending Against Social Engineering Attacks',
    excerpt: 'Social engineering remains one of the most effective attack vectors. Learn how to recognize and defend against these psychological manipulation techniques.',
    content: `
## The Human Vulnerability

No matter how strong your technical defenses are, humans remain the weakest link in security. Social engineering exploits human psychology rather than technical vulnerabilities.

## Common Attack Types

### Phishing
\`\`\`
[!] Suspicious indicators:
    - Urgent language
    - Mismatched URLs
    - Generic greetings
    - Spelling errors
    - Requests for sensitive info
\`\`\`

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
5. **Simulated Attacks** - Test your organization's resilience

## Red Flags to Watch

- Urgency or pressure tactics
- Requests to bypass normal procedures
- Unsolicited contact asking for sensitive info
- Too-good-to-be-true offers
- Emotional manipulation

## Building ASSET

This is why I developed **ASSET** (Anti Social Engineering and Education Toolkit) - to help organizations detect, prevent, and train against these attacks.

Remember: Trust, but verify.
    `,
    date: '2024-12-15',
    tags: ['Social Engineering', 'Security Awareness', 'Defense'],
    readTime: '4 min read'
  }
];

export const getPublishedBlogs = () => blogPosts;

export const getBlogBySlug = (slug: string) => 
  blogPosts.find(post => post.slug === slug);
