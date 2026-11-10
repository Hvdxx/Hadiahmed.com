import { describe, expect, it } from 'vitest';
import { fileFromSrc, galleryItems } from './gallery';

const post = (id: string, title: string, body = '', main?: { file: string; alt: string }) => ({
  id,
  title,
  type: 'personal' as const,
  main,
  body,
});

describe('fileFromSrc', () => {
  it('reads the file name from a built image path', () => {
    expect(fileFromSrc('/Hadiahmed.com/_astro/IMG_3194-1.Bx12aZ9.jpg')).toBe('IMG_3194-1.jpg');
  });
  it('reads the file name from a dev image path', () => {
    expect(fileFromSrc('/@fs/home/x/src/assets/images/desk-zelda.webp?origWidth=1600&origHeight=1200')).toBe('desk-zelda.webp');
  });
});

describe('galleryItems', () => {
  const posts = [
    post('kanye', 'Kanye Concert', 'text\n\n![Stage lights](../../assets/images/IMG_3122-1.jpg)\n\n![](../../assets/images/IMG_3069.jpg)', { file: 'IMG_3112-1.jpg', alt: 'Flashing lights' }),
    post('embedded', 'Embedded Device', '![Desk](../../assets/images/desk-zelda.webp)\n![Desk 2](../../assets/images/desk-persona.webp "title")'),
    post('azure', 'Azure', 'no photos here'),
  ];
  const photos = [
    { image: 'stone-lantern.webp', alt: 'A stone lantern', caption: 'Stone lantern', place: 'Japanese Garden' },
    { image: '../../assets/images/desk-zelda.webp', alt: 'Desk again', caption: 'Zelda desk', place: 'Home' },
  ];
  const items = galleryItems(posts, photos);

  it('collects the main photo and every photo inside each post, in post order', () => {
    expect(items.map((i) => i.file)).toEqual([
      'IMG_3112-1.jpg', 'IMG_3122-1.jpg', 'IMG_3069.jpg', 'desk-zelda.webp', 'desk-persona.webp', 'stone-lantern.webp',
    ]);
  });

  it('links each post photo back to its post', () => {
    expect(items[1].source).toEqual({ id: 'kanye', title: 'Kanye Concert', type: 'personal' });
    expect(items[5].source).toBeUndefined();
  });

  it('shows a photo used in a post and in the photo list only once, keeping the post link and the caption', () => {
    const zelda = items.filter((i) => i.file === 'desk-zelda.webp');
    expect(zelda).toHaveLength(1);
    expect(zelda[0].source?.id).toBe('embedded');
    expect(zelda[0].caption).toBe('Zelda desk · Home');
  });

  it('falls back to the post title when a photo has no description', () => {
    expect(items[2].alt).toBe('Photo from Kanye Concert');
  });

  it('treats a bare file name as no description', () => {
    const [only] = galleryItems([post('k', 'Kanye Concert', '![IMG_3122.jpg](../../assets/images/IMG_3122-1.jpg)')], []);
    expect(only.alt).toBe('Photo from Kanye Concert');
  });
});
