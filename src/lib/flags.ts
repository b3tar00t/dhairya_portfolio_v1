// The site's capture-the-flag layer. Only SHA-256 hashes live in the bundle;
// the flags themselves are hidden in the page source, console, response
// headers, robots.txt and security.txt.

export interface Flag {
  id: string;
  hint: string;
  hash: string;
}

export const FLAGS: Flag[] = [
  { id: 'source', hint: 'Read the page source.', hash: '525d1031416bcafcc5af67b8a8efc547342d3ff613d2b08f16135dc2d0cc5e00' },
  { id: 'console', hint: 'Open the browser console.', hash: '1ed3fe384269c9ba6af0302ced8a074ae94ce0d97bc72e3b851c4215e5f4d88c' },
  { id: 'headers', hint: 'Inspect the HTTP response headers.', hash: '1bcdc9c472735cb65ca27edf468049a8bc3894b7932119b56cd3743ee6811701' },
  { id: 'robots', hint: 'Ask what crawlers are not allowed to see.', hash: 'e56dbeff5e81e014a99dc2233fd32626bde88d763f96b271c208996c2cfc90a1' },
  { id: 'security', hint: 'Find how to report a vulnerability here.', hash: 'ca016573d6085a22d4d0d93a15f29f607e1f034fc3ed32f039a106b7331f9d66' },
];

const FOUND_KEY = 'b3ta:flags';

const sha256 = async (text: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

/** Returns the matching flag, or null when the submission is wrong. */
export const checkFlag = async (submission: string): Promise<Flag | null> => {
  const hash = await sha256(submission.trim());
  return FLAGS.find((f) => f.hash === hash) ?? null;
};

export const readFoundFlags = (): string[] => {
  try {
    const raw = localStorage.getItem(FOUND_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => FLAGS.some((f) => f.id === id)) : [];
  } catch {
    return [];
  }
};

export const saveFoundFlag = (id: string): string[] => {
  const found = Array.from(new Set([...readFoundFlags(), id]));
  try {
    localStorage.setItem(FOUND_KEY, JSON.stringify(found));
  } catch {
    // Storage unavailable (private mode): progress lasts for this visit only.
  }
  window.dispatchEvent(new CustomEvent('b3ta:flags', { detail: found }));
  return found;
};
