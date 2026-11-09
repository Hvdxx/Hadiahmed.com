import { describe, expect, it } from 'vitest';
import { imageByName } from './images';

describe('imageByName', () => {
  it('finds an image by file name', () => {
    expect(imageByName('portrait.webp').width).toBe(684);
  });
  it('also accepts the path the editor saves', () => {
    expect(imageByName('../../assets/images/portrait.webp').width).toBe(684);
  });
  it('throws a clear error for a missing image', () => {
    expect(() => imageByName('nope.webp')).toThrow('Image not found in src/assets/images: nope.webp');
  });
});
