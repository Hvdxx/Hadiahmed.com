export type EntryType = 'personal' | 'writing' | 'project' | 'work';

export const TYPES: readonly { id: EntryType; label: string; path: string }[] = [
  { id: 'personal', label: 'Personal', path: 'personal' },
  { id: 'writing', label: 'Writing', path: 'writing' },
  { id: 'project', label: 'Project', path: 'projects' },
  { id: 'work', label: 'Work', path: 'work' },
] as const;

export const TYPE_IDS = TYPES.map((t) => t.id) as [EntryType, ...EntryType[]];

export function typeInfo(id: EntryType) {
  return TYPES.find((t) => t.id === id)!;
}

export interface EntryLike {
  id: string;
  data: {
    title: string;
    date: Date;
    type: EntryType;
    draft?: boolean;
    image?: unknown;
    imageAlt?: string;
    summary?: string;
  };
  body?: string;
}

const WORDS_PER_MINUTE = 220;

/** Minutes to read a Markdown body: words / 220, rounded up, at least 1. */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]+/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Non-draft entries, newest first; same-day entries by title A to Z. */
export function publishedEntries<T extends EntryLike>(all: T[]): T[] {
  return all
    .filter((e) => !e.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}

export function featured<T extends EntryLike>(sorted: T[]): T | undefined {
  return sorted[0];
}

export function countsByType(entries: EntryLike[]): Record<EntryType | 'all', number> {
  const counts = { all: entries.length, personal: 0, writing: 0, project: 0, work: 0 };
  for (const e of entries) counts[e.data.type]++;
  return counts;
}
