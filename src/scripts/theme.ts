// Light/dark toggle. With no saved choice the page follows the device setting.
const root = document.documentElement;
const dark = window.matchMedia('(prefers-color-scheme: dark)');

function current(): 'light' | 'dark' {
  const t = root.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return dark.matches ? 'dark' : 'light';
}

function label(btn: HTMLButtonElement) {
  const next = current() === 'dark' ? 'light' : 'dark';
  btn.setAttribute('aria-label', `Switch to ${next} theme`);
  btn.dataset.current = current();
}

for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  label(btn);
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* storage blocked: choice lasts this visit */ }
    label(btn);
  });
  dark.addEventListener('change', () => label(btn));
}
