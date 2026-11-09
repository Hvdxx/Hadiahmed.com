export interface FilterRow { type: string; /** Past the page's row limit: only shown when filtering by type */ extra: boolean }

/** Which rows to show for a filter, and the sentence to announce. */
export function filterRows(rows: FilterRow[], f: string, label: string): { show: boolean[]; message: string } {
  const show = rows.map((r) => (f === 'all' ? !r.extra : r.type === f));
  const n = show.filter(Boolean).length;
  if (f === 'all') {
    return { show, message: n === rows.length ? `Showing all ${n} entries` : `Showing ${n} of ${rows.length} entries` };
  }
  return { show, message: `Showing ${n} ${label} ${n === 1 ? 'entry' : 'entries'}` };
}
