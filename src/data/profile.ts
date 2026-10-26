// Single source of truth for portfolio content. Sourced from the resume
// (public/resume/Dhairya_Shukla_Resume.pdf) and the GitHub repositories.

export const profile = {
  name: 'Dhairya Shukla',
  handle: 'b3tar00t',
  role: 'Offensive security engineer',
  focus: 'LLM, cloud and API security',
  summary:
    'I break AI-integrated products, cloud infrastructure and APIs before someone else does, then help the team close the gap.',
  location: 'Mumbai, India',
  email: 'dhairya.shukla2005@gmail.com',
  github: 'https://github.com/b3tar00t',
  linkedin: 'https://linkedin.com/in/dhairyashukla7',
  site: 'https://b3tar00t-dhairyashukla.vercel.app',
  resume: '/resume/Dhairya_Shukla_Resume.pdf',
  education: {
    school: 'Dwarkadas J. Sanghvi College of Engineering',
    degree: 'B.Tech in Information Technology',
    years: '2023 – 2027',
    cgpa: '8.8 / 10',
  },
};

export const stats = [
  { value: '8', label: 'vulnerabilities disclosed', detail: '4 critical, 1 high' },
  { value: '5×', label: 'CTF wins', detail: 'incl. Ciphathon’26, 1st place' },
  { value: '20+', label: 'bug bounty programs tested', detail: 'web and API surfaces' },
  { value: '3', label: 'security internships', detail: '2024 – present' },
];

export interface Experience {
  id: string;
  role: string;
  org: string;
  period: string;
  current?: boolean;
  summary: string;
  points: string[];
  tags: string[];
}

export const experience: Experience[] = [
  {
    id: 'cybe',
    role: 'Infrastructure and Security Engineer Intern',
    org: 'CyBE Global / CSA Bangalore',
    period: 'June 2026 – present',
    current: true,
    summary: 'Hardening training infrastructure and access control for AI security courses.',
    points: [
      'Validated AI cybersecurity course content and hands-on labs across 3 courses, resolving 50+ issues: broken Docker environments, missing files, incorrect commands and validation errors.',
      'Built a scoped, read-only SRM admin role for CAIGL cohort registrations: least-privilege boundaries across the admin route tree and a fixed-event API projection that excludes login tokens and payment identifiers.',
      'Added authorization regression tests for cross-event access and prohibited write operations.',
      'Wrote two Workshop Arena sessions on shadow AI discovery and vendor AI risk, with scenarios, facilitator notes and validated answer keys.',
    ],
    tags: ['Access control', 'Docker', 'AI security'],
  },
  {
    id: 'meeraai',
    role: 'Product Security Intern',
    org: 'MeeraAI Technologies',
    period: 'Jan 2026 – June 2026',
    summary: 'Owned offensive testing of an AI product across mobile, API, LLM and cloud.',
    points: [
      'Found a JWT response exposing user phone numbers, and a mobile client shipping the Gemini API key and full system prompt. Reported both with remediation steps.',
      'Found a Razorpay payment API secret returned in plaintext by an authenticated API response; documented the impact and validated the fix with developers.',
      'Ran a cloud penetration engagement chaining DNS enumeration, exposed EC2 hosts, direct backend access bypassing the Nginx reverse proxy, and an IAM role with production S3 permissions. Traced the root cause to security groups allowing unrestricted inbound TCP.',
      'Flagged email-spoofing risk from missing SPF, DMARC and DKIM, and wrote the product privacy policy after a pre-launch DPDPA audit.',
    ],
    tags: ['LLM security', 'AWS', 'API', 'DPDPA'],
  },
  {
    id: 'deepcytes',
    role: 'OSINT Investigator & Analyst Intern',
    org: 'DeepCytes',
    period: 'June 2024 – Dec 2024',
    summary: 'Investigated fraud, account takeover and data exposure for clients.',
    points: [
      'Ran reconnaissance across 10+ incidents involving fraud, account takeover and exposed data, using manual techniques and custom automation.',
      'Researched dark web forums and marketplaces over Tor to source leaked databases, then analysed them to scope exposure for client intelligence reports.',
    ],
    tags: ['OSINT', 'Threat intel', 'Dark web'],
  },
];

// The cloud engagement at MeeraAI, told as an attack chain on the dossier.
export const featuredChain = {
  title: 'From a DNS record to production S3',
  context: 'Cloud penetration test, MeeraAI Technologies, 2026',
  steps: [
    { stage: 'Recon', text: 'DNS enumeration mapped the product’s infrastructure.' },
    { stage: 'Exposure', text: 'It led to EC2 infrastructure exposed to the internet.' },
    { stage: 'Bypass', text: 'The backend answered directly, skipping the Nginx reverse proxy and its controls.' },
    { stage: 'Escalation', text: 'An IAM role on that infrastructure held permissions on production S3.' },
    { stage: 'Root cause', text: 'Traced back to security groups permitting unrestricted inbound TCP.' },
  ],
};

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  status: 'active' | 'beta' | 'stable' | 'archived';
  year: string;
  stack: string[];
  repo: string;
  stars?: number;
  featured?: boolean;
  problem: string;
  approach: string[];
  results: string[];
  sample?: { label: string; code: string };
}

export const projects: Project[] = [
  {
    slug: 'firellm',
    name: 'FireLLM',
    tagline: 'Adversarial testing framework for LLM-integrated applications',
    status: 'active',
    year: '2026',
    stack: ['Python', 'ChromaDB', 'SQLite', 'sentence-transformers', 'pytest'],
    repo: 'https://github.com/b3tar00t/firellm',
    featured: true,
    problem:
      'Companies are wiring LLMs into support bots, copilots, RAG assistants and autonomous agents with no standard way to test them. Traditional scanners don’t understand model behaviour, can’t test prompt injection reliably and miss RAG poisoning and agent tool abuse entirely.',
    approach: [
      'Profiles a target from its responses alone: model family, RAG usage, system prompt constraints and available tools.',
      'Fingerprints the target’s defences, then generates payloads calibrated to get past them.',
      'Detects intent across languages and encodings (Urdu, French, base64, leetspeak, roleplay framing) with sentence-transformers and a deterministic fallback.',
      'Confirms agent abuse only when an attack drives a real, logged tool call. Otherwise the finding is reported as informational.',
      'Stores attack payloads in its own .fllm format.',
    ],
    results: [
      'Blind test against an externally built RAG app: fingerprinted a semantic guard, chose a leetspeak bypass and confirmed credential exfiltration with zero false positives.',
      '1.0 precision on confirmed findings against two purpose-built vulnerable RAG systems.',
      '167 passing tests, all offline and deterministic.',
    ],
    sample: {
      label: 'Pipeline',
      code: 'target  ─▶ profile ─▶ fingerprint defences\n        ─▶ inject / poison RAG / abuse agent\n        ─▶ behavioural delta ─▶ confirmed finding ─▶ report',
    },
  },
  {
    slug: 'fath0m',
    name: 'fath0m',
    tagline: 'Service-aware vulnerability and exploit correlation scanner',
    status: 'stable',
    year: '2026',
    stack: ['Python', 'Nmap', 'NVD CVE 2.0 API', 'Rich'],
    repo: 'https://github.com/b3tar00t/fath0m',
    stars: 3,
    featured: true,
    problem:
      'Basic scanners flag every CVE as exploitable, ignore version ranges and crash on malformed data. The output is loud, and teams stop trusting it.',
    approach: [
      'Fingerprints services with Nmap across four scan profiles, from stealth to insane.',
      'Correlates versions against NVD CPE ranges and handles non-semantic versions safely.',
      'Scores confidence: HIGH for an exact version-bounded match, MEDIUM for a product and range match.',
      'Shows exploit signals from Exploit-DB, Metasploit, PacketStorm and public PoCs only when references exist.',
    ],
    results: [
      'Behaves like a conservative unauthenticated scanner: fewer false positives, transparent confidence.',
      'Design rule: better to be honest and conservative than loud and wrong.',
    ],
    sample: {
      label: 'Sample output',
      code: 'Port  Service        Version  CVE            Risk (Confidence)  Exploit\n80    http | nginx   1.19.0   CVE-2013-0337  7.5 HIGH (MEDIUM)  No',
    },
  },
  {
    slug: 'onesteg',
    name: 'OneSteg',
    tagline: 'Pipeline-based steganography detection for CTFs and forensics',
    status: 'beta',
    year: '2025',
    stack: ['Python', 'pytest'],
    repo: 'https://github.com/b3tar00t/OneSteg',
    featured: true,
    problem:
      'Steganography challenges send you through a dozen single-purpose tools — zsteg, binwalk, stegseek, exiftool — before you find the flag.',
    approach: [
      'Chains detectors, extractors, decoders and a flag finder into one modular pipeline.',
      'Format-aware extraction: PNG text chunks, data after IEND, EXIF comments, audio LSB and zero-width text.',
      'Decodes Base64, Base85, ROT13/47, gzip and zlib, with XOR brute force behind an opt-in --deep flag.',
    ],
    results: ['One command from file to flag, with confidence scores and a user-supplied flag regex.'],
    sample: {
      label: 'Usage',
      code: 'onesteg --file steg_meta.png --flag-format "CTF\\{[A-Za-z0-9_]+\\}"\n🏁 CTF{hidden_in_metadata}  (confidence=1.00)',
    },
  },
  {
    slug: 'puropt',
    name: 'PurOpt',
    tagline: 'Finds servers that accept HTTP PURGE from anyone',
    status: 'stable',
    year: '2025',
    stack: ['Python', 'HTTP'],
    repo: 'https://github.com/b3tar00t/PurOpt',
    stars: 1,
    problem:
      'Caches that accept unauthenticated PURGE requests let anyone flush content, a cheap denial-of-service and cache-poisoning primitive that is easy to miss.',
    approach: ['Enumerates allowed HTTP methods on a target and specifically tests whether PURGE is honoured.'],
    results: ['A focused check used during web assessments and bug bounty recon.'],
  },
  {
    slug: 'socosint',
    name: 'SocOSINT',
    tagline: 'Username reconnaissance across 70+ social platforms',
    status: 'archived',
    year: '2020',
    stack: ['Python'],
    repo: 'https://github.com/b3tar00t/SocOSINT',
    stars: 20,
    problem: 'Mapping a person’s online footprint by hand means checking dozens of sites one by one.',
    approach: ['Checks a username against 70+ websites and reports where an account exists.'],
    results: ['My most-starred repository.'],
  },
];

// Early tools from 2020, kept as an archive of where this started.
export const earlyArsenal = [
  { name: 'Cluven', year: '2020', repo: 'https://github.com/b3tar00t/Cluven', stars: 3, text: 'IP address intelligence lookup.' },
  { name: 'SuperWhois', year: '2020', repo: 'https://github.com/b3tar00t/SuperWhois', stars: 5, text: 'WHOIS lookups for .com, .net and .edu domains.' },
  { name: 'Xmper', year: '2020', repo: 'https://github.com/b3tar00t/Xmper', stars: 2, text: 'Synthetic identity and test-data generator.' },
  { name: 'FloodKing', year: '2020', repo: 'https://github.com/b3tar00t/FloodKing', stars: 2, text: 'HTTP load and stress testing for your own sites.' },
];

export const research = {
  summary: 'Manual testing across 20+ bug bounty programs on web and API attack surfaces.',
  findings: [
    { severity: 'Critical', count: 4, note: 'incl. SQL injection and XSS leading to account takeover' },
    { severity: 'High', count: 1, note: 'sensitive information disclosure' },
    { severity: 'Other', count: 3, note: 'valid, responsibly disclosed' },
  ],
  // Public acknowledgements. Entries without a link were thanked privately.
  hallOfFame: [
    { org: 'APNIC', via: 'HackerOne', url: 'https://hackerone.com/apnic/thanks?type=team' },
    { org: 'Hemi', via: 'HackerOne VDP', url: 'https://hackerone.com/b3tar00t?type=user' },
    { org: 'NCIIPC', via: 'Letter of thanks' },
    { org: 'Skoda', via: 'Letter of thanks' },
    { org: 'Drexel University', via: 'Hall of Fame 2024', url: 'https://drexel.edu/it/security/services-processes/bug-bounty/' },
    { org: 'Inholland', via: 'Wall of Fame', url: 'https://www.inholland.nl/inhollandcom/responsible-disclosure/#wall_of_fame' },
    { org: 'Locus', via: 'Hall of Fame', url: 'https://locus.sh/trust/responsible-vulnerability-disclosure-policy/' },
    { org: 'ASTRON', via: 'Hall of Fame', url: 'https://web.archive.org/web/20241202003758/https://www.astron.nl/contact/hall-of-fame-responsible-disclosure/' },
  ],
};

export const achievements = [
  {
    title: 'Red Team lead, Rwanda government cybersecurity training',
    text: 'Led the red team component of a four-week engagement for the Rwanda Information Society Authority (RISA), coordinated by Bizoneer IT Consulting. Facilitated an OWASP Juice Shop exercise and designed and delivered VulnCastle, a red team challenge.',
  },
  {
    title: 'Hardware attack demonstrations',
    text: 'Delivered WiFi Pineapple and USB Rubber Ducky demonstrations, supporting CyberBit simulation-based training alongside the blue team lead.',
  },
  {
    title: 'Yellow Network Hackathon, 1st place',
    text: 'Blockchain hackathon, September 2025. Built a system to prevent chargeback fraud in crypto payment environments.',
  },
  {
    title: '5× CTF winner',
    text: 'Including Ciphathon’26, a national-level CTF, 1st place. With RootRunners: 1st in Italy, 71st worldwide, as competitor and supervisor.',
  },
];

export const certifications = [
  { name: 'APIsec Certified Practitioner', short: 'ACP', status: 'earned' },
  { name: 'Certified Network Security Practitioner', short: 'CNSP', status: 'earned' },
  { name: 'Certified Cyber Criminologist, VCL Cyber Labs, 2021', short: 'CCC', status: 'earned' },
  { name: 'CompTIA Security+', short: 'Security+', status: 'in progress' },
];

export const skills = [
  { group: 'Web and API', items: ['Burp Suite', 'SQLMap', 'ffuf', 'Nuclei', 'IDOR', 'Auth testing', 'OWASP Top 10'] },
  { group: 'Recon and OSINT', items: ['Nmap', 'Amass', 'Shodan', 'theHarvester', 'Maltego', 'Wireshark'] },
  { group: 'Exploitation', items: ['Metasploit', 'Hydra', 'John the Ripper', 'Nessus', 'SQL injection', 'XSS', 'Misconfiguration'] },
  { group: 'Cloud', items: ['AWS EC2', 'IAM misconfiguration', 'Security groups', 'Exposure detection'] },
  { group: 'LLM security', items: ['Prompt injection', 'RAG poisoning', 'Agent abuse', 'Attack-surface mapping'] },
  { group: 'Forensics and RE', items: ['Volatility', 'FTK Imager', 'Ghidra'] },
  { group: 'Code', items: ['Python', 'Bash', 'C', 'Java', 'Lua'] },
  { group: 'Governance', items: ['DPDPA', 'GDPR', 'NIST CSF'] },
];

export const softSkills = ['Problem solving', 'Critical thinking', 'Leadership', 'Teamwork', 'Adaptability', 'Event management', 'Consistency'];

// Not jobs: leadership and volunteer work, shown separately from internships.
export const volunteering = [
  {
    id: 'csci',
    role: 'Student Council Lead',
    org: 'CyberSecurity Council of India (non-profit)',
    period: 'Oct 2025 – present',
    current: true,
    points: [
      'Leads the council’s cybersecurity research initiatives that track threat trends.',
      'Drives initiatives to grow the council’s digital reach.',
    ],
  },
  {
    id: 'cyberagents',
    role: 'Cybercrime Investigator, volunteer',
    org: 'The Cyber Agents (NGO)',
    period: 'Mar 2020 – Apr 2022',
    points: [
      'Investigated cyber fraud and blackmail cases as a volunteer.',
      'Assisted on cybercrime investigations and contributed to the NGO’s initiatives.',
    ],
  },
];

// How it started. Told as the "initial access" stage of the attack chain.
export const origin = [
  {
    when: '2017 – 2019',
    title: 'Building games',
    text: 'Started out making games in Roblox Studio and picked up Lua scripting along the way. Coding was the first thing that hooked me.',
    tag: 'Lua',
  },
  {
    when: '2017 – 2019',
    title: 'Robotics',
    text: 'Moved on to robotics and wrote Arduino code, learning how software drives real hardware.',
    tag: 'Arduino',
  },
  {
    when: 'The turn',
    title: 'The first hack',
    text: 'A video about hacking Wi-Fi, and using Lucky Patcher to mod a game, showed me that software can be bent. I wanted to know how.',
    tag: 'Curiosity',
  },
  {
    when: '2020',
    title: 'Learning by building',
    text: 'Learned Python and wrote a tool for every concept I studied: Cluven and SuperWhois while learning networking, SocOSINT while learning OSINT.',
    tag: 'Python',
    repos: ['Cluven', 'SuperWhois', 'SocOSINT'],
  },
  {
    when: '2020 – 2022',
    title: 'Real cases',
    text: 'Volunteered with The Cyber Agents on cyber fraud and blackmail investigations, and became a certified cyber criminologist.',
    tag: 'Investigation',
  },
  {
    when: '2024 – now',
    title: 'Offensive security',
    text: 'Bug bounty Hall of Fames, three security internships, CTF wins and FireLLM. Everything below this point.',
    tag: 'Today',
  },
];
