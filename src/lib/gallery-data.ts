import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { publishedEntries } from './entries';
import { fileFromSrc, galleryItems, type GalleryItem } from './gallery';
import { photos } from './data';
import { imageByName } from './images';

/** Every photo on the site (post photos first, newest post first), for the Gallery page and the home slideshow. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const entries = publishedEntries(await getCollection('posts'));
  return galleryItems(
    entries.map((e) => {
      const img = e.data.image as ImageMetadata | undefined;
      return {
        id: e.id,
        title: e.data.title,
        type: e.data.type,
        main: img ? { file: fileFromSrc(img.src), alt: e.data.imageAlt ?? '' } : undefined,
        body: e.body,
      };
    }),
    photos,
    // Identical files are stored once, so the stored image is what makes two names the same picture
    (file) => imageByName(file)?.src ?? file.toLowerCase(),
  );
}
