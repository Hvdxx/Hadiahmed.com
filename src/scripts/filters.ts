// Turns the type links above an index into in-page filter buttons.
for (const box of document.querySelectorAll<HTMLElement>('[data-filters]')) {
  const list = document.getElementById(box.dataset.filters!);
  const live = box.parentElement?.querySelector<HTMLElement>('.idx-live');
  if (!list) continue;
  const rows = [...list.querySelectorAll<HTMLElement>('li[data-type]')];
  const buttons: HTMLButtonElement[] = [];

  for (const link of box.querySelectorAll<HTMLAnchorElement>('a[data-f]')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.f = link.dataset.f!;
    btn.innerHTML = link.innerHTML;
    btn.setAttribute('aria-pressed', link.dataset.f === 'all' ? 'true' : 'false');
    link.replaceWith(btn);
    buttons.push(btn);
  }
  box.setAttribute('role', 'group');

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const f = btn.dataset.f!;
      let n = 0;
      for (const r of rows) {
        const show = f === 'all' || r.dataset.type === f;
        r.hidden = !show;
        if (show) n++;
      }
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === btn));
      const name = btn.querySelector('.f-label')?.textContent ?? '';
      if (live) live.textContent = f === 'all' ? `Showing all ${n} entries` : `Showing ${n} ${name} ${n === 1 ? 'entry' : 'entries'}`;
    });
  }
}
