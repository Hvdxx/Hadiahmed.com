import { describe, expect, it } from 'vitest';
import { countsByType, featured, publishedEntries, readingTime, TYPES, type EntryLike } from './entries';

const e = (id: string, date: string, type: EntryLike['data']['type'], extra: Partial<EntryLike['data']> = {}): EntryLike => ({
  id,
  data: { title: id, date: new Date(date), type, ...extra },
});

describe('readingTime', () => {
  it('is one minute per 220 words, rounded up', () => {
    expect(readingTime('word '.repeat(220))).toBe(1);
    expect(readingTime('word '.repeat(221))).toBe(2);
  });
  it('is never less than one minute', () => {
    expect(readingTime('')).toBe(1);
  });
  it('ignores code blocks, links and markdown symbols', () => {
    const md = '# Title\n\n```js\n' + 'code '.repeat(500) + '\n```\n\n[link](https://example.com/a/b) **bold** ' + 'w '.repeat(219);
    expect(readingTime(md)).toBe(2); // Title + link + bold + 219 = 222 words
  });
});

describe('publishedEntries', () => {
  it('drops drafts', () => {
    const out = publishedEntries([e('a', '2026-01-01', 'work'), e('b', '2026-02-01', 'work', { draft: true })]);
    expect(out.map((x) => x.id)).toEqual(['a']);
  });
  it('sorts newest first', () => {
    const out = publishedEntries([e('may', '2024-05-01', 'work'), e('apr', '2026-04-01', 'project'), e('mar', '2026-03-01', 'project')]);
    expect(out.map((x) => x.id)).toEqual(['apr', 'mar', 'may']);
  });
  it('breaks ties by title A to Z', () => {
    const out = publishedEntries([e('Zeta', '2026-01-01', 'work'), e('Alpha', '2026-01-01', 'work')]);
    expect(out.map((x) => x.id)).toEqual(['Alpha', 'Zeta']);
  });
});

describe('featured', () => {
  it('is undefined with no entries', () => {
    expect(featured([])).toBeUndefined();
  });
  it('is the first of the sorted list', () => {
    const list = publishedEntries([e('old', '2020-01-01', 'work'), e('new', '2026-01-01', 'writing')]);
    expect(featured(list)?.id).toBe('new');
  });
});

describe('countsByType', () => {
  it('counts each type and the total', () => {
    expect(countsByType([e('a', '2026-01-01', 'project'), e('b', '2026-01-01', 'project'), e('c', '2026-01-01', 'work')]))
      .toEqual({ all: 3, project: 2, work: 1, writing: 0, personal: 0 });
  });
});

describe('TYPES', () => {
  it('lists the four types with their page paths', () => {
    expect(TYPES.map((t) => [t.id, t.label, t.path])).toEqual([
      ['personal', 'Personal', 'personal'],
      ['writing', 'Writing', 'writing'],
      ['project', 'Project', 'projects'],
      ['work', 'Work', 'work'],
    ]);
  });
});
