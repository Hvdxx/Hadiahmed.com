import { afterEach, describe, expect, it, vi } from 'vitest';
import { url } from './url';

describe('url', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('prefixes paths with the site base', () => {
    vi.stubEnv('BASE_URL', '/hadiahmed.com/');
    expect(url('about')).toBe('/hadiahmed.com/about');
    expect(url('/about')).toBe('/hadiahmed.com/about');
  });

  it('returns the base with a trailing slash for an empty path', () => {
    vi.stubEnv('BASE_URL', '/hadiahmed.com/');
    expect(url('')).toBe('/hadiahmed.com/');
  });

  it('works when the base has no trailing slash', () => {
    vi.stubEnv('BASE_URL', '/hadiahmed.com');
    expect(url('posts/a')).toBe('/hadiahmed.com/posts/a');
  });

  it('leaves absolute, mail and phone links alone', () => {
    vi.stubEnv('BASE_URL', '/hadiahmed.com/');
    expect(url('https://x.com')).toBe('https://x.com');
    expect(url('mailto:a@b.c')).toBe('mailto:a@b.c');
    expect(url('tel:+12819655448')).toBe('tel:+12819655448');
  });

  it('keeps fragments', () => {
    vi.stubEnv('BASE_URL', '/hadiahmed.com/');
    expect(url('#contact')).toBe('/hadiahmed.com/#contact');
  });
});
