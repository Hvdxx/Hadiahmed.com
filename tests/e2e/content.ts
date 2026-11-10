// Reads the real entries so tests keep passing as Hadi adds posts.
import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';

export interface Entry { id: string; title: string; date: string; type: string; image?: string; draft?: boolean }

const DIR = 'src/content/posts';

export const all: Entry[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = readFileSync(`${DIR}/${f}`, 'utf8').match(/^---\n([\s\S]*?)\n---/)![1];
    const d = load(fm) as Record<string, unknown>;
    const date = d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date);
    return { id: f.replace(/\.md$/, ''), title: String(d.title).trim(), date, type: String(d.type), image: d.image as string | undefined, draft: d.draft === true };
  });

/** Published entries, newest first, same order as the site */
export const published = all
  .filter((e) => !e.draft)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

export const newest = published[0];
export const countOf = (type: string) => published.filter((e) => e.type === type).length;

/** "Apr 15, 2026" */
export const pretty = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

export const profile = load(readFileSync('src/data/profile.yml', 'utf8')) as {
  intro: string; status: string;
  contact: { email: string; phone: string; phoneHref: string; instagramHandle: string };
  experience: { role: string }[]; education: { gpa: string }[]; leadership: { role: string }[];
};
export const photos = load(readFileSync('src/data/photos.yml', 'utf8')) as { image: string; alt: string }[];
/** First published entry with a main photo */
export const withImage = published.find((e) => e.image)!;

/** Does this post have a main photo or any photo in its text? */
export const hasPhotos = (id: string) => /^image:|!\[/m.test(readFileSync(`${DIR}/${id}.md`, 'utf8'));
