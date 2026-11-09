import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { postSchema } from './schema';

const schema = postSchema(() => z.string());

describe('post schema', () => {
  it('accepts a minimal entry and defaults draft to false', () => {
    const r = schema.parse({ title: 'a', date: '2026-01-01', type: 'project' });
    expect(r.draft).toBe(false);
    expect(r.date).toBeInstanceOf(Date);
  });
  it('requires alt text when there is a photo', () => {
    const r = schema.safeParse({ title: 'a', date: '2026-01-01', type: 'project', image: 'x.webp' });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('imageAlt is required when image is set');
  });
  it('rejects blank alt text with a photo', () => {
    const r = schema.safeParse({ title: 'a', date: '2026-01-01', type: 'project', image: 'x.webp', imageAlt: '   ' });
    expect(r.success).toBe(false);
  });
  it('rejects unknown types', () => {
    expect(schema.safeParse({ title: 'a', date: '2026-01-01', type: 'blog' }).success).toBe(false);
  });
  it('rejects an empty title', () => {
    expect(schema.safeParse({ title: '', date: '2026-01-01', type: 'work' }).success).toBe(false);
  });
});
