import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { photos, profile } from './data';

const INTRO =
  "Hey! I'm Hadi. I'm studying Management Information Systems at the University of Houston, and I want to use technology to help businesses run better and make smarter decisions. I'm looking for a summer internship to take the next step in my career. At The Home Depot I work as a Flooring Specialist, scoping projects, building cost estimates, and turning technical specs into clear recommendations for customers. Outside of work I build with Azure, SQL and Python.";

describe('profile', () => {
  it('has the public contact details', () => {
    expect(profile.contact.phone).toBe('(281) 965-5448');
    expect(profile.contact.phoneHref).toBe('tel:+12819655448');
    expect(profile.contact.email).toBe('Hadiahmed350@gmail.com');
    expect(profile.contact.linkedin).toBe('https://linkedin.com/in/hadi-ahmed-mis');
    expect(profile.contact.instagram).toBe('https://instagram.com/_hadi.ahmed_');
    expect(profile.contact.instagramHandle).toBe('@_hadi.ahmed_');
  });
  it('uses the approved intro word for word', () => {
    expect(profile.intro.trim()).toBe(INTRO);
  });
  it('keeps skills with commas in their name as one item', () => {
    expect(profile.skills.technical).toContain('Microsoft Azure (Functions, Application Insights)');
    expect(profile.skills.technical).toContain('Microsoft Office (Excel, Word, PowerPoint)');
  });
  it('carries the resume facts', () => {
    expect(profile.education[0].gpa).toBe('3.5');
    expect(profile.experience[0].role).toBe('Flooring Specialist');
  });
});

describe('photos', () => {
  it('lists all 8 photos with alt text', () => {
    expect(photos).toHaveLength(8);
    for (const p of photos) expect(p.alt.trim()).not.toBe('');
  });
  it('only points at images that exist', () => {
    for (const p of photos) expect(existsSync(`src/assets/images/${p.image.split('/').pop()}`), p.image).toBe(true);
  });
  it('marks four photos for the home page grid', () => {
    expect(photos.filter((p) => p.featured).map((p) => p.image.split('/').pop())).toEqual([
      'stone-lantern.webp',
      'go-coogs.webp',
      'evening-pond.webp',
      'genz-team.webp',
    ]);
  });
});
