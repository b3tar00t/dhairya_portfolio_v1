// The dossier follows an attack chain. Each stage is a section of the page.
export const STAGES = [
  { id: 'recon', label: 'Recon', title: 'Who this is' },
  { id: 'initial', label: 'Initial access', title: 'How I got in' },
  { id: 'arsenal', label: 'Arsenal', title: 'Tools and techniques' },
  { id: 'exploit', label: 'Exploit', title: 'Things I built' },
  { id: 'access', label: 'Access', title: 'Where I’ve worked' },
  { id: 'disclosure', label: 'Disclosure', title: 'Bugs I reported' },
  { id: 'persist', label: 'Persist', title: 'Wins and credentials' },
  { id: 'intel', label: 'Intel', title: 'Writeups and blog' },
  { id: 'hardening', label: 'Hardening', title: 'How this site defends itself' },
  { id: 'exfil', label: 'Exfil', title: 'Get in touch' },
] as const;

export type StageId = (typeof STAGES)[number]['id'];
