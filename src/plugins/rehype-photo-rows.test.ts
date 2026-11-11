import { describe, expect, it } from 'vitest';
import { photoRows } from './rehype-photo-rows';

type N = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: N[] };
const t = (value: string): N => ({ type: 'text', value });
const el = (tagName: string, children: N[] = [], properties: Record<string, unknown> = {}): N => ({ type: 'element', tagName, properties, children });
const img = (src: string) => el('img', [], { src, alt: src });
const p = (...children: N[]) => el('p', children);
const root = (...children: N[]): N => ({ type: 'root', children });
const ws = t('\n');

const run = (tree: N) => { photoRows()(tree as never); return tree; };
const shape = (tree: N): unknown[] =>
  tree.children!.filter((c) => c.type === 'element').map((c) =>
    c.tagName === 'div' ? { row: (c.children ?? []).filter((k) => k.type === 'element').map((k) => (k.properties!.className as string[])[0]) } : c.tagName,
  );

describe('photoRows', () => {
  it('puts a paragraph and the single photo right after it side by side', () => {
    const tree = run(root(p(t('Hello')), ws, p(img('a.jpg'))));
    expect(shape(tree)).toEqual([{ row: ['row-text', 'row-media'] }]);
    const row = tree.children!.find((c) => c.tagName === 'div')!;
    expect(row.properties!.className).toEqual(['photo-row']);
  });

  it('makes a row for every paragraph-and-photo pair', () => {
    const tree = run(root(p(t('One')), p(img('a.jpg')), p(t('Two')), p(img('b.jpg')), p(t('Three'))));
    expect(shape(tree)).toEqual([{ row: ['row-text', 'row-media'] }, { row: ['row-text', 'row-media'] }, 'p']);
  });

  it('keeps an italic caption line with its photo', () => {
    const tree = run(root(p(t('Text')), p(img('a.jpg')), p(el('em', [t('Caption')]))));
    const media = tree.children![0].children!.find((k) => (k.properties?.className as string[])?.[0] === 'row-media')!;
    expect(media.children!.map((c) => c.tagName)).toEqual(['p', 'p']);
    expect(shape(tree)).toHaveLength(1);
  });

  it('pairs a list with the photo after it', () => {
    expect(shape(run(root(el('ul', [el('li', [t('x')])]), p(img('a.jpg')))))).toEqual([{ row: ['row-text', 'row-media'] }]);
  });

  it('leaves photos alone when there is no text right before them', () => {
    expect(shape(run(root(el('h2', [t('Head')]), p(img('a.jpg')), p(img('b.jpg')))))).toEqual(['h2', 'p', 'p']);
  });

  it('leaves a group of photos (several on one line) alone', () => {
    expect(shape(run(root(p(t('Text')), p(img('a.jpg'), t('\n'), img('b.jpg')))))).toEqual(['p', 'p']);
  });

  it('does not pair a paragraph that already contains a photo', () => {
    expect(shape(run(root(p(t('x'), img('a.jpg')), p(img('b.jpg')))))).toEqual(['p', 'p']);
  });
});
