import type { EntryType } from './entries';

export interface GalleryPost {
  id: string;
  title: string;
  type: EntryType;
  /** The post's main photo, if it has one */
  main?: { file: string; alt: string };
  body?: string;
}
export interface GalleryPhoto { image: string; alt: string; caption?: string; place?: string }
export interface GalleryItem {
  /** File name in src/assets/images */
  file: string;
  alt: string;
  caption?: string;
  source?: { id: string; title: string; type: EntryType };
}

const baseName = (path: string) => path.split('?')[0].split('/').pop()!;
const byName = (file: string) => file.toLowerCase();

/** Original file name from an Astro image src (dev "/@fs/.../x.webp?..." or built "/_astro/x.HASH.webp"). */
export function fileFromSrc(src: string): string {
  const parts = baseName(src).split('.');
  return parts.length > 2 ? `${parts[0]}.${parts[parts.length - 1]}` : parts.join('.');
}

const INLINE_IMAGE = /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

/** Every photo from every post (main photo first, then in-text photos), then the extra photos list, each shown once. */
/** `key` says which files are the same picture (by default: the same name, ignoring case). */
export function galleryItems(posts: GalleryPost[], photos: GalleryPhoto[], key: (file: string) => string = byName): GalleryItem[] {
  const items = new Map<string, GalleryItem>();
  for (const p of posts) {
    const source = { id: p.id, title: p.title, type: p.type };
    const found = [
      ...(p.main ? [{ file: p.main.file, alt: p.main.alt }] : []),
      ...[...(p.body ?? '').matchAll(INLINE_IMAGE)].map((m) => ({ file: baseName(m[2]), alt: m[1] })),
    ];
    for (const f of found) {
      if (items.has(key(f.file))) continue;
      const alt = f.alt.trim() && !/^img_\d+.*\.\w+$/i.test(f.alt.trim()) ? f.alt.trim() : `Photo from ${p.title}`;
      items.set(key(f.file), { file: f.file, alt, source });
    }
  }
  for (const ph of photos) {
    const file = baseName(ph.image);
    const caption = [ph.caption, ph.place].filter((x) => x && x.trim()).join(' · ') || undefined;
    const existing = items.get(key(file));
    if (existing) existing.caption ??= caption;
    else items.set(key(file), { file, alt: ph.alt, caption });
  }
  return [...items.values()];
}
