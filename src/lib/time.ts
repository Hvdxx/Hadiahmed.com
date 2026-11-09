const DAY = 86_400_000;

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Nov 4, 2026". Post dates are calendar dates, so they're read in UTC. */
export function formatDate(d: Date): string {
  return dateFormat.format(d);
}

/** "2026-11-04" */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * How long ago a post went up, in whole days. The post date is a calendar date (UTC);
 * "now" is the viewer's own calendar date.
 */
export function timeAgo(d: Date, now: Date): string {
  const posted = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - posted) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const m = Math.max(1, Math.round(days / 30));
    return m === 1 ? '1 month ago' : `${m} months ago`;
  }
  const y = Math.max(1, Math.round(days / 365));
  return y === 1 ? '1 year ago' : `${y} years ago`;
}
