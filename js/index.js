const giftLink = document.querySelector('.gift-button');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let openingTimer;
const enableAnimations = document.getElementById('enable-animations');
const motionReduced = () => reducedMotion.matches && !document.body.classList.contains('motion-enabled');
function syncMotion() {
  try {
    if (sessionStorage.getItem('gift-motion-enabled') === 'true') document.body.classList.add('motion-enabled');
  } catch { /* Keep the control working when storage is unavailable. */ }
  if (enableAnimations) enableAnimations.hidden = !motionReduced();
  window.dispatchEvent(new Event('gift-motion-change'));
}
enableAnimations?.addEventListener('click', () => {
  document.body.classList.add('motion-enabled');
  try { sessionStorage.setItem('gift-motion-enabled', 'true'); } catch {}
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
window.addEventListener('pageshow', syncMotion);
syncMotion();

giftLink?.addEventListener('click', event => {
  // Keep new-tab clicks and the HTML link's no-JavaScript fallback working.
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (motionReduced()) return;
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
