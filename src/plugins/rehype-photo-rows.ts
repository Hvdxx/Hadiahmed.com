/**
 * Post layout: a block of text followed directly by a single photo becomes a side-by-side
 * "photo row" (text | photo). CSS flips every other row. A heading right before the text
 * moves into the row above it, and an italic-only line right after the photo stays with it
 * as its caption. Everything else is left untouched.
 */
interface Node {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
}

const isWhitespace = (n: Node) => n.type === 'text' && !(n.value ?? '').trim();
const kids = (n: Node) => (n.children ?? []).filter((c) => !isWhitespace(c));
const hasImage = (n: Node): boolean => n.tagName === 'img' || (n.children ?? []).some(hasImage);

const isSinglePhoto = (n: Node) => n.tagName === 'p' && kids(n).length === 1 && kids(n)[0].tagName === 'img';
const isText = (n: Node) => ['p', 'ul', 'ol', 'blockquote'].includes(n.tagName ?? '') && !hasImage(n);
const isHeading = (n: Node) => ['h2', 'h3', 'h4'].includes(n.tagName ?? '');
const isCaption = (n: Node) => n.tagName === 'p' && kids(n).length === 1 && kids(n)[0].tagName === 'em';

const div = (className: string, children: Node[]): Node => ({
  type: 'element',
  tagName: 'div',
  properties: { className: [className] },
  children,
});

export function photoRows() {
  return (tree: Node) => {
    const blocks = kids(tree);
    const out: Node[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const cur = blocks[i];
      const next = blocks[i + 1];
      if (cur.type === 'element' && next && isText(cur) && isSinglePhoto(next)) {
        const media = [next];
        if (blocks[i + 2] && isCaption(blocks[i + 2])) media.push(blocks[i + 2]);
        const text = [cur];
        if (out.length && isHeading(out[out.length - 1])) text.unshift(out.pop()!);
        out.push(div('photo-row', [div('row-text', text), div('row-media', media)]));
        i += media.length;
      } else {
        out.push(cur);
      }
    }
    tree.children = out;
  };
}
