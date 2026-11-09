const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Build an internal link that includes the site's base folder. */
export function url(path: string): string {
  if (ABSOLUTE.test(path)) return path;
  const base = String(import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
  const rest = path.replace(/^\/+/, '');
  return `${base}/${rest}`;
}
