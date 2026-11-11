// Fade post rows and photos in as they scroll into view (styles in global.css hide them first).
const targets = [...document.querySelectorAll<HTMLElement>('.prose > .photo-row, .prose > p:has(> img)')];
const show = (t: Element) => t.classList.add('in');
if (!('IntersectionObserver' in window)) {
  targets.forEach(show);
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  // Anything already on screen when the page opens shows straight away
  targets.forEach((t) => (t.getBoundingClientRect().top < window.innerHeight * 0.88 ? show(t) : io.observe(t)));
}
