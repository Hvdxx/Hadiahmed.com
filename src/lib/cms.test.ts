import { existsSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

interface Field { name: string; type: string; options?: { values?: string[] }; fields?: Field[]; list?: boolean }
interface Entry { name: string; type: 'collection' | 'file'; path: string; fields: Field[]; list?: boolean }
const cfg = load(readFileSync('.pages.yml', 'utf8')) as { media: { input: string; output: string }; content: Entry[] };
const byName = (n: string) => cfg.content.find((c) => c.name === n)!;

describe('Pages CMS config', () => {
  it('only accepts photo formats the site can process', () => {
    expect((cfg.media as { extensions?: string[] }).extensions).toEqual(['jpg', 'jpeg', 'png', 'webp', 'avif']);
  });

  it('points the guide at the address that works today', () => {
    const guide = readFileSync('docs/how-to-post.md', 'utf8');
    expect(guide).toContain('hvdxx.github.io/Hadiahmed.com/admin');
    expect(guide).not.toMatch(/\*\*hadiahmed\.com\/admin\*\*/);
  });

  it('stores uploads with the other images', () => {
    expect(cfg.media.input).toBe('src/assets/images');
    expect(cfg.media.output).toBe('../../assets/images');
  });

  it('has an entry form matching the post schema', () => {
    const posts = byName('posts');
    expect(posts.type).toBe('collection');
    expect(posts.path).toBe('src/content/posts');
    const names = posts.fields.map((f) => f.name);
    for (const key of ['title', 'date', 'type', 'summary', 'image', 'imageAlt', 'draft', 'body']) expect(names).toContain(key);
    expect(posts.fields.find((f) => f.name === 'type')!.options!.values).toEqual(['personal', 'writing', 'project', 'work']);
  });

  it('photo form has no leftover home-page switch', () => {
    expect(byName('photos').fields.map((f) => f.name)).toEqual(['image', 'alt', 'caption', 'place']);
  });

  it('edits the site info and photo files that exist', () => {
    expect(existsSync(byName('profile').path)).toBe(true);
    expect(existsSync(byName('photos').path)).toBe(true);
    expect(byName('photos').list).toBe(true);
  });

  it('profile form covers every profile key', () => {
    const names = byName('profile').fields.map((f) => f.name).sort();
    const keys = Object.keys(load(readFileSync('src/data/profile.yml', 'utf8')) as object).sort();
    expect(names).toEqual(keys);
  });
});
