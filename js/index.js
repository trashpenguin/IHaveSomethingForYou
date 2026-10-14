const giftLink = document.querySelector('.gift-button');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let openingTimer;

giftLink?.addEventListener('click', event => {
  // Keep new-tab clicks and the HTML link's no-JavaScript fallback working.
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (reducedMotion.matches) return;
  event.preventDefault();
  if (document.body.classList.contains('gift-opening')) return;
  document.body.classList.add('gift-opening');
  giftLink.setAttribute('aria-busy', 'true');
  openingTimer = setTimeout(() => window.location.assign(giftLink.href), 800);
});

window.addEventListener('pageshow', () => {
  clearTimeout(openingTimer);
  document.body.classList.remove('gift-opening');
  giftLink?.removeAttribute('aria-busy');
});
