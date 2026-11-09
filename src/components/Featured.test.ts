import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Featured from './Featured.astro';

describe('Featured', () => {
  it('uses a text-only layout when the entry has no photo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Featured, {
      props: { entry: { id: 'x', data: { title: 'T', date: new Date('2026-01-01'), type: 'writing' }, body: 'hello' } },
    });
    expect(html).toContain('no-image');
    expect(html).not.toContain('<img');
    expect(html).toContain('T');
  });
});
