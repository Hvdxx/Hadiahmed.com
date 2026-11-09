import { describe, expect, it } from 'vitest';
import { filterRows } from './filter-logic';

// 10 rows: newest first; rows 8 and 9 (0-based) are past the home page limit
const rows = ['work', 'project', 'personal', 'work', 'project', 'writing', 'project', 'personal', 'work', 'writing'].map((type, i) => ({
  type,
  extra: i >= 8,
}));

describe('filterRows', () => {
  it('shows only the first rows for All when there are more than the limit', () => {
    const r = filterRows(rows, 'all', 'All');
    expect(r.show.filter(Boolean)).toHaveLength(8);
    expect(r.show[8]).toBe(false);
    expect(r.message).toBe('Showing 8 of 10 entries');
  });
  it('includes rows past the limit when filtering by a type', () => {
    const r = filterRows(rows, 'work', 'Work');
    expect(r.show.filter(Boolean)).toHaveLength(3);
    expect(r.show[8]).toBe(true);
    expect(r.message).toBe('Showing 3 Work entries');
  });
  it('says all when nothing is cut off', () => {
    expect(filterRows(rows.slice(0, 6), 'all', 'All').message).toBe('Showing all 6 entries');
  });
  it('uses the singular for one entry', () => {
    expect(filterRows(rows, 'writing', 'Writing').message).toBe('Showing 2 Writing entries');
    expect(filterRows(rows.slice(0, 6), 'writing', 'Writing').message).toBe('Showing 1 Writing entry');
  });
});
