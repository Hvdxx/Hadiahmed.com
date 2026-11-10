import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { photos, profile } from './data';

describe('profile', () => {
  it('has working contact details', () => {
    expect(profile.contact.phoneHref).toMatch(/^tel:\+\d{10,15}$/);
    expect(profile.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
    expect(profile.contact.linkedin).toMatch(/^https:\/\//);
    expect(profile.contact.instagram).toMatch(/^https:\/\//);
    expect(profile.contact.instagramHandle).toMatch(/^@/);
  });
  it('has an intro and a status', () => {
    expect(profile.intro.trim().length).toBeGreaterThan(20);
    expect(profile.status.trim()).not.toBe('');
  });
  it('keeps skills with commas in their name as one item', () => {
    // A YAML flow list like [Azure (Functions, Insights)] splits at the comma; every item must have balanced parentheses
    for (const group of Object.values(profile.skills)) {
      for (const item of group) expect((item.match(/\(/g) ?? []).length, item).toBe((item.match(/\)/g) ?? []).length);
    }
  });
});

describe('photos', () => {
  it('every photo has a description', () => {
    for (const p of photos) expect(p.alt.trim(), p.image).not.toBe('');
  });
  it('only points at images that exist', () => {
    for (const p of photos) expect(existsSync(`src/assets/images/${p.image.split('/').pop()}`), p.image).toBe(true);
  });
});
