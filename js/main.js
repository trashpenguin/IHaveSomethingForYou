// The full message and bouquet already exist in HTML for visitors without JavaScript.
const title = document.getElementById('title');
const motionButton = document.getElementById('motion-toggle');
const languageName = document.getElementById('language-name');
const nextLanguage = document.getElementById('next-language');
const languageNames = ['English', 'Tagalog', 'Japanese', 'Korean', 'Chinese', 'French', 'Spanish', 'German', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Swedish', 'Dutch', 'Polish'];
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const phrases = [
  ['I love you', 'en'], ['Mahal kita', 'tl'], ['愛してる', 'ja'],
  ['사랑해', 'ko'], ['我爱你', 'zh'], ['Je t’aime', 'fr'],
  ['Te amo', 'es'], ['Ich liebe dich', 'de'], ['Ti amo', 'it'],
  ['Я тебя люблю', 'ru'], ['أحبك', 'ar'], ['मैं तुमसे प्यार करता हूँ', 'hi'],
  ['Jag älskar dig', 'sv'], ['Ik hou van jou', 'nl'], ['Kocham cię', 'pl'],
];
let phraseIndex = 1;
let paused = false;
let timer;
let starsTimer;
const enableAnimations = document.getElementById('enable-animations');
try {
  if (sessionStorage.getItem('gift-motion-enabled') === 'true') document.body.classList.add('motion-enabled');
} catch { /* Animation controls also work when browser storage is unavailable. */ }
function motionReduced() {
  return preference.matches && !document.body.classList.contains('motion-enabled');
}
if (enableAnimations) {
  enableAnimations.addEventListener('click', () => {
    document.body.classList.add('motion-enabled');
    try { sessionStorage.setItem('gift-motion-enabled', 'true'); } catch {}
    updateMotion();
    window.dispatchEvent(new Event('gift-motion-change'));
  });
}

function stopTimers() {
  clearTimeout(timer);
  clearTimeout(starsTimer);
}

function showPhrase(manual = false) {
  if (!title || (!manual && (paused || document.hidden))) return;
  clearTimeout(timer);
  const [text, language] = phrases[phraseIndex];
  title.textContent = text;
  title.lang = language;
  languageName.textContent = languageNames[phraseIndex];
  if (!motionReduced() && !paused) {
    title.animate([{ opacity: 0, transform: 'translateY(7px)', filter: 'blur(3px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 650, easing: 'ease-out' });
  }
  phraseIndex = (phraseIndex + 1) % phrases.length;
  if (!paused && !document.hidden) timer = setTimeout(showPhrase, 4500);
}

function updateMotion() {
  stopTimers();
  const stopped = motionReduced();
  if (enableAnimations) enableAnimations.hidden = !stopped;
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.textContent = paused ? 'Resume messages' : 'Pause messages';
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  if (!paused && !document.hidden) {
    timer = setTimeout(showPhrase, 4500);
  }
  if (!stopped && !document.hidden) starsTimer = setTimeout(() => document.body.classList.add('stars-visible'), 7000);
}

if (motionButton) {
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => {
    paused = !paused;
    updateMotion();
  });
}
preference.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('tab-hidden', document.hidden);
  updateMotion();
});
window.addEventListener('pagehide', stopTimers);
window.addEventListener('pageshow', updateMotion);
if (nextLanguage) {
  nextLanguage.hidden = false;
  nextLanguage.addEventListener('click', () => showPhrase(true));
}
updateMotion();
