import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{webp,jpg,jpeg,png}', { eager: true });

/** Look up an image in src/assets/images by file name (any folder prefix the editor saves is ignored). */
export function imageByName(name: string): ImageMetadata {
  const file = name.split('/').pop()!;
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${file}`));
  if (!hit) throw new Error(`Image not found in src/assets/images: ${name}`);
  return hit[1].default;
}
