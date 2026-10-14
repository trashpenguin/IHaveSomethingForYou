// A live, locally drawn night sky: no photographs or external assets.
(() => {
  const host = document.querySelector('.night, .night-sky');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'living-sky';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, stars = [], clouds = [], frame, last = 0, time = 0;
  let pointer = { x: 0, y: 0 }, drift = { x: 0, y: 0 };
  let meteor = null, nextMeteor = 7;
  const random = (a, b) => a + Math.random() * (b - a);
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(1700, Math.round(width * height / 600)) }, () => ({
      x: Math.random(), y: Math.random(), radius: random(.3, 1.25),
      phase: random(0, Math.PI * 2), rate: random(.35, 1.1), depth: random(.2, 1), blue: Math.random() > .7,
    }));
    clouds = Array.from({ length: 28 }, (_, i) => ({
      y: i / 27, x: .5 + Math.sin(i * .37) * .09 + random(-.06, .06),
      size: random(.10, .22), alpha: random(.025, .065),
    }));
    if (reduced.matches) paint();
  }
  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050b15'; ctx.fillRect(0, 0, width, height);
    for (const cloud of clouds) {
      const x = cloud.x * width + Math.sin(time * .035 + cloud.y * 6) * 16;
      const y = cloud.y * height;
      const radius = Math.max(width, height) * cloud.size;
      const fog = ctx.createRadialGradient(x, y, 0, x, y, radius);
      fog.addColorStop(0, `rgba(99,140,183,${cloud.alpha})`);
      fog.addColorStop(.5, `rgba(53,88,133,${cloud.alpha * .5})`);
      fog.addColorStop(1, 'rgba(30,60,100,0)');
      ctx.fillStyle = fog; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    drift.x += (pointer.x - drift.x) * .025;
    drift.y += (pointer.y - drift.y) * .025;
    for (const star of stars) {
      const x = (star.x * width + time * star.depth * .7 + drift.x * star.depth + width) % width;
      const y = (star.y * height + Math.sin(time * .025 + star.phase) * 7 + drift.y * star.depth + height) % height;
      const alpha = .35 + .45 * (.5 + .5 * Math.sin(time * star.rate + star.phase));
      ctx.fillStyle = star.blue ? `rgba(167,203,255,${alpha})` : `rgba(240,244,255,${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, star.radius, 0, Math.PI * 2); ctx.fill();
      if (star.radius > 1.17) {
        ctx.fillStyle = `rgba(190,215,255,${alpha * .07})`;
        ctx.beginPath(); ctx.arc(x, y, star.radius * 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (!reduced.matches && time > nextMeteor) {
      meteor = { born: time, x: random(.1, .8) * width, y: random(.04, .35) * height };
      nextMeteor = time + random(9, 17);
    }
    if (meteor) {
      const age = time - meteor.born;
      if (age > 1.2) meteor = null;
      else {
        const x = meteor.x + age * 230, y = meteor.y + age * 130;
        const tail = ctx.createLinearGradient(x - 90, y - 51, x, y);
        tail.addColorStop(0, 'rgba(190,215,255,0)');
        tail.addColorStop(1, `rgba(224,238,255,${Math.sin(age / 1.2 * Math.PI) * .8})`);
        ctx.strokeStyle = tail; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x - 90, y - 51); ctx.lineTo(x, y); ctx.stroke();
      }
    }
  }
  function animate(now) {
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now; paint(); frame = requestAnimationFrame(animate);
  }
  function start() {
    cancelAnimationFrame(frame); last = 0;
    if (document.hidden) return;
    if (reduced.matches) { meteor = null; paint(); }
    else frame = requestAnimationFrame(animate);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    pointer.x = (event.clientX / width - .5) * 18;
    pointer.y = (event.clientY / height - .5) * 12;
  }, { passive: true });
  document.addEventListener('visibilitychange', start);
  reduced.addEventListener('change', start);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  window.addEventListener('pageshow', start);
  resize(); start();
})();
