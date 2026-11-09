import { describe, expect, it } from 'vitest';
import { formatDate, isoDate, timeAgo } from './time';

const now = new Date('2026-11-09T03:00:00Z');
const daysBefore = (n: number) => new Date(Date.UTC(2026, 10, 9 - n));

describe('formatDate', () => {
  it('shows the calendar date from the file, whatever the timezone', () => {
    expect(formatDate(new Date('2026-11-04'))).toBe('Nov 4, 2026');
    expect(formatDate(new Date('2024-09-01'))).toBe('Sep 1, 2024');
  });
});

describe('isoDate', () => {
  it('returns YYYY-MM-DD', () => {
    expect(isoDate(new Date('2026-11-04'))).toBe('2026-11-04');
  });
});

describe('timeAgo', () => {
  it('counts whole days', () => {
    expect(timeAgo(new Date('2026-11-04'), now)).toBe('5 days ago');
  });
  it('says Today and Yesterday', () => {
    expect(timeAgo(daysBefore(0), now)).toBe('Today');
    expect(timeAgo(daysBefore(1), now)).toBe('Yesterday');
  });
  it('switches to months after 30 days', () => {
    expect(timeAgo(daysBefore(31), now)).toBe('1 month ago');
    expect(timeAgo(daysBefore(45), now)).toBe('2 months ago');
  });
  it('switches to years after 365 days', () => {
    expect(timeAgo(daysBefore(400), now)).toBe('1 year ago');
    expect(timeAgo(daysBefore(800), now)).toBe('2 years ago');
  });
  it('treats future dates as Today', () => {
    expect(timeAgo(new Date('2027-01-01'), now)).toBe('Today');
  });
});
