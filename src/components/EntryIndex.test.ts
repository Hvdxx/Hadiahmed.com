import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import EntryIndex from './EntryIndex.astro';

const types = ['work', 'project', 'personal', 'work', 'project', 'writing', 'project', 'personal', 'work', 'writing'] as const;
const entries = types.map((type, i) => ({ id: `e${i}`, data: { title: `Entry ${i}`, date: new Date(Date.UTC(2026, 0, 20 - i)), type } }));

describe('EntryIndex with a limit', () => {
  it('renders every row so filters can reach them, hiding the ones past the limit', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(EntryIndex, { props: { entries, limit: 8 } });
    expect(html.match(/<li data-type/g)).toHaveLength(10);
    expect(html.match(/data-extra[^>]*hidden|hidden[^>]*data-extra/g)).toHaveLength(2);
    expect(html).toContain('Showing 8 of 10 entries');
    expect(html).toContain('View all 10 entries');
  });
});
