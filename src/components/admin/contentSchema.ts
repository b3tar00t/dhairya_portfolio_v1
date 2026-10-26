import type { ContentKey } from '@/content/ContentProvider';

// Describes each editable section so the admin forms can be generated.
// To make a new field editable, add it here; no form code needs to change.

export type Field =
  | { key: string; label: string; type: 'text' | 'url' | 'textarea' | 'number'; hint?: string }
  | { key: string; label: string; type: 'list'; hint?: string }
  | { key: string; label: string; type: 'bool'; hint?: string }
  | { key: string; label: string; type: 'select'; options: string[]; hint?: string }
  | { key: string; label: string; type: 'object'; fields: Field[]; hint?: string }
  | { key: string; label: string; type: 'array'; item: Field[]; itemTitle: string; hint?: string };

export interface SectionSchema {
  key: ContentKey;
  title: string;
  description: string;
  /** Shape of the stored value. */
  shape: 'object' | 'array' | 'list';
  fields?: Field[];
  item?: Field[];
  /** Field shown as each array item's heading. */
  itemTitle?: string;
}

const t = (key: string, label: string, hint?: string): Field => ({ key, label, type: 'text', hint });
const area = (key: string, label: string, hint?: string): Field => ({ key, label, type: 'textarea', hint });
const list = (key: string, label: string, hint = 'One per line'): Field => ({ key, label, type: 'list', hint });

export const SECTIONS: SectionSchema[] = [
  {
    key: 'profile',
    title: 'Intro and links',
    description: 'Name, role, summary and contact links used across the site.',
    shape: 'object',
    fields: [
      t('name', 'Name'),
      t('handle', 'Handle'),
      t('role', 'Role'),
      t('focus', 'Focus'),
      area('summary', 'Summary'),
      t('location', 'Location'),
      t('email', 'Email'),
      { key: 'github', label: 'GitHub URL', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
      { key: 'site', label: 'Site URL', type: 'url' },
      t('resume', 'Fallback resume path', 'Used only when no resume is uploaded in the Resume tab'),
      { key: 'education', label: 'Education', type: 'object', fields: [t('school', 'School'), t('degree', 'Degree'), t('years', 'Years'), t('cgpa', 'CGPA')] },
    ],
  },
  {
    key: 'stats',
    title: 'Hero numbers',
    description: 'The four counters under your name.',
    shape: 'array',
    itemTitle: 'label',
    item: [t('value', 'Value', 'Number first, e.g. 8, 20+, 5×'), t('label', 'Label'), t('detail', 'Detail')],
  },
  {
    key: 'origin',
    title: 'Origin story',
    description: 'Chapters of the "How I got in" timeline.',
    shape: 'array',
    itemTitle: 'title',
    item: [t('when', 'When'), t('title', 'Title'), area('text', 'Text'), t('tag', 'Tag'), list('repos', 'GitHub repos to link', 'Repo names, one per line')],
  },
  {
    key: 'skills',
    title: 'Skills and tools',
    description: 'Arsenal groups and the tools in each.',
    shape: 'array',
    itemTitle: 'group',
    item: [t('group', 'Group'), list('items', 'Tools and techniques')],
  },
  {
    key: 'softSkills',
    title: 'Soft skills',
    description: 'The "Beyond the tools" line.',
    shape: 'list',
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'Case files in the deck, in order. The slug becomes the page address.',
    shape: 'array',
    itemTitle: 'name',
    item: [
      t('name', 'Name'),
      t('slug', 'Slug', 'Lowercase, used in /projects/<slug>. Left empty, it’s made from the name'),
      t('tagline', 'Tagline'),
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'beta', 'stable', 'archived'] },
      t('year', 'Year'),
      { key: 'repo', label: 'Repository URL', type: 'url' },
      { key: 'stars', label: 'GitHub stars', type: 'number' },
      list('stack', 'Stack'),
      area('problem', 'The problem'),
      list('approach', 'How it works', 'One step per line'),
      list('results', 'Results', 'One result per line'),
      { key: 'sample', label: 'Code sample (optional)', type: 'object', fields: [t('label', 'Heading'), area('code', 'Code')] },
    ],
  },
  {
    key: 'earlyArsenal',
    title: '2020 archive',
    description: 'Early tools under "Show the 2020 archive".',
    shape: 'array',
    itemTitle: 'name',
    item: [t('name', 'Name'), t('year', 'Year'), { key: 'repo', label: 'Repository URL', type: 'url' }, { key: 'stars', label: 'Stars', type: 'number' }, t('text', 'Description')],
  },
  {
    key: 'experience',
    title: 'Experience',
    description: 'Internships and jobs, newest first.',
    shape: 'array',
    itemTitle: 'org',
    item: [
      t('role', 'Role'),
      t('org', 'Organisation'),
      t('period', 'Period', 'e.g. Jan 2026 – June 2026'),
      { key: 'current', label: 'Current role', type: 'bool' },
      area('summary', 'One-line summary'),
      list('points', 'Bullet points', 'One per line'),
      list('tags', 'Tags'),
    ],
  },
  {
    key: 'volunteering',
    title: 'Leadership and volunteering',
    description: 'Roles that aren’t jobs or internships.',
    shape: 'array',
    itemTitle: 'org',
    item: [t('role', 'Role'), t('org', 'Organisation'), t('period', 'Period'), { key: 'current', label: 'Current', type: 'bool' }, list('points', 'Bullet points')],
  },
  {
    key: 'featuredChain',
    title: 'Featured attack chain',
    description: 'The scroll-driven chain under Experience.',
    shape: 'object',
    fields: [
      t('title', 'Title'),
      t('context', 'Context line'),
      { key: 'steps', label: 'Steps', type: 'array', itemTitle: 'stage', item: [t('stage', 'Stage'), area('text', 'What happened')] },
    ],
  },
  {
    key: 'research',
    title: 'Bug bounty and Hall of Fame',
    description: 'Finding counts and acknowledgements.',
    shape: 'object',
    fields: [
      area('summary', 'Summary'),
      {
        key: 'findings',
        label: 'Findings by severity',
        type: 'array',
        itemTitle: 'severity',
        item: [{ key: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low', 'Other'] }, { key: 'count', label: 'Count', type: 'number' }, t('note', 'Note')],
      },
      {
        key: 'hallOfFame',
        label: 'Hall of Fame and thanks',
        type: 'array',
        itemTitle: 'org',
        item: [t('org', 'Organisation'), t('via', 'Recognition', 'e.g. Hall of Fame 2024, Letter of thanks'), { key: 'url', label: 'Public record URL (optional)', type: 'url' }],
      },
    ],
  },
  {
    key: 'achievements',
    title: 'Achievements',
    description: 'Wins, hackathons, CTFs and talks.',
    shape: 'array',
    itemTitle: 'title',
    item: [t('title', 'Title'), area('text', 'Details')],
  },
  {
    key: 'certifications',
    title: 'Certifications',
    description: 'Earned and in-progress certifications.',
    shape: 'array',
    itemTitle: 'short',
    item: [t('short', 'Short name'), t('name', 'Full name'), { key: 'status', label: 'Status', type: 'select', options: ['earned', 'in progress'] }],
  },
];

/** An empty value for a field, used when adding array items. */
export const emptyFor = (f: Field): unknown => {
  switch (f.type) {
    case 'number':
      return 0;
    case 'bool':
      return false;
    case 'list':
    case 'array':
      return [];
    case 'select':
      return f.options[0];
    case 'object':
      return Object.fromEntries(f.fields.map((x) => [x.key, emptyFor(x)]));
    default:
      return '';
  }
};

export const emptyItem = (fields: Field[]) => Object.fromEntries(fields.map((f) => [f.key, emptyFor(f)]));
