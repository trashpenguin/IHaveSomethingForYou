const { readFile } = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer(async (req, res) => {
  try {
    const file = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  let failures = 0;
  async function check(name, run) {
    try { await run(); console.log('PASS', name); }
    catch (error) { failures++; console.log('FAIL', name, error.message); }
  }
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const page = await plain.newPage();
  await check('Invitation readable with JavaScript disabled', async () => {
    await page.goto('http://127.0.0.1:4173/');
    assert.match(await page.locator('h1').innerText(), /I have something\s+for you/i);
    assert(await page.getByRole('link', { name: 'Open your gift' }).isVisible());
  });
  await check('Bouquet and message visible with JavaScript disabled', async () => {
    await page.goto('http://127.0.0.1:4173/flower.html');
    assert.match(await page.locator('h1').innerText(), /I love you/i);
    assert.equal(await page.locator('.bloom').first().evaluate(el => getComputedStyle(el).animationPlayState), 'running');
  });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  context.setDefaultTimeout(3000);
  context.setDefaultNavigationTimeout(5000);
  await context.route('https://open.spotify.com/**', route => route.fulfill(route.request().url().includes('/iframe-api/v1')
    ? { body: '/* Spotify API disabled for offline layout checks. */', contentType: 'application/javascript' }
    : { body: '<p>Music embed</p>', contentType: 'text/html' }));
  const app = await context.newPage();
  const errors = [];
  app.on('pageerror', error => errors.push(error.message));
  await check('Music opens and closes using the keyboard', async () => {
    await app.goto('http://127.0.0.1:4173/flower.html');
    const control = app.locator('summary');
    await control.focus({ timeout: 2000 });
    await app.keyboard.press('Enter');
    assert(await app.locator('iframe').isVisible());
    await app.keyboard.press('Enter');
    assert.equal(await app.locator('iframe').isVisible(), false);
  });
  await check('Reduced motion displays complete, stable message and flowers', async () => {
    await app.goto('http://127.0.0.1:4173/flower.html');
    assert.match(await app.locator('h1').innerText(), /I love you/i);
    assert.equal(await app.locator('.bloom').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    const message = await app.locator('h1').innerText();
    await app.waitForTimeout(1200);
    assert.equal(await app.locator('h1').innerText(), message);
  });
  await check('Both pages fit mobile, tablet, desktop, and short landscape screens', async () => {
    for (const [width, height] of [[375, 812], [768, 1024], [1440, 900], [667, 375]]) {
      await app.setViewportSize({ width, height });
      for (const url of ['/', '/flower.html']) {
        await app.goto('http://127.0.0.1:4173' + url);
        assert(await app.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${url} overflows at ${width}`);
        const box = await app.locator('h1').boundingBox();
        assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, `Heading outside ${width}x${height}`);
      }
    }
  });
  await check('No JavaScript errors', async () => assert.deepEqual(errors, []));
  await check('Bouquet petals do not overlap the message', async () => {
    for (const [width, height] of [[375, 812], [768, 1024], [1440, 900], [667, 375]]) {
      await app.setViewportSize({ width, height });
      await app.goto('http://127.0.0.1:4173/flower.html');
      const message = await app.locator('.garden-message').boundingBox();
      const petals = await app.locator('.bloom').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
      assert(petals.every(r => r.y >= message.y + message.height || r.x >= message.x + message.width || r.x + r.width <= message.x || r.y + r.height <= message.y), `Bouquet overlaps message at ${width}x${height}`);
    }
  });
  await check('Gift navigation and pause/resume work', async () => {
    await app.emulateMedia({ reducedMotion: 'no-preference' });
    await app.setViewportSize({ width: 375, height: 812 });
    await app.goto('http://127.0.0.1:4173/');
    await app.getByRole('link', { name: 'Open your gift' }).click();
    await app.waitForURL('**/flower.html?music=1');
    const button = app.locator('#motion-toggle');
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await app.locator('.sprig').first().evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    const message = await app.locator('h1').innerText();
    await app.waitForTimeout(4700);
    assert.equal(await app.locator('h1').innerText(), message);
    await app.getByRole('button', { name: 'Resume messages' }).click();
    await app.waitForTimeout(4700);
    assert.notEqual(await app.locator('h1').innerText(), message);
    assert.equal(await app.locator('#title').getAttribute('lang'), 'tl');
    await app.emulateMedia({ reducedMotion: 'reduce' });
    await app.getByRole('button', { name: 'Pause messages', exact: true }).waitFor();
  });
  const music = await browser.newContext();
  music.setDefaultTimeout(3000);
  music.setDefaultNavigationTimeout(5000);
  await music.route('https://open.spotify.com/**', async route => {
    if (route.request().url().includes('/iframe-api/v1')) {
      await route.fulfill({ contentType: 'application/javascript', body: `
        window.onSpotifyIframeApiReady({ createController(element, options, callback) {
          const iframe = document.createElement('iframe');
          iframe.title = 'Spotify test player';
          iframe.src = 'https://open.spotify.com/embed/playlist/test';
          element.replaceWith(iframe);
          const listeners = {};
          window.spotifyPlayRequests = 0;
          window.spotifyPauseRequests = 0;
          const controller = {
            addListener(name, listener) { listeners[name] = listener; },
            play() {
              window.spotifyPlayRequests++;
              if (!window.simulateBlockedPlayback) {
                listeners.playback_started?.({ data: { playingURI: options.uri } });
                listeners.playback_update?.({ data: { isPaused: false, isBuffering: false } });
              }
            },
            pause() {
              window.spotifyPauseRequests++;
              listeners.playback_update?.({ data: { isPaused: true, isBuffering: false } });
            }
          };
          callback(controller);
          setTimeout(() => listeners.ready?.(), 50);
        }});
      ` });
    } else {
      await route.fulfill({ body: '<p>Music player test placeholder</p>', contentType: 'text/html' });
    }
  });
  const gift = await music.newPage();
  await check('Opening gift animates the invitation and requests music playback', async () => {
    await gift.goto('http://127.0.0.1:4173/');
    assert.notEqual(await gift.locator('.envelope').evaluate(el => getComputedStyle(el).animationName), 'none');
    await gift.getByRole('link', { name: 'Open your gift' }).click();
    assert(await gift.locator('body').evaluate(el => el.classList.contains('gift-opening')));
    await gift.waitForURL('**/flower.html?music=1');
    await gift.getByText('Music is playing.', { exact: true }).waitFor();
    assert.equal(await gift.evaluate(() => window.spotifyPlayRequests), 1);
    assert.equal(await gift.locator('.music-panel').getAttribute('open'), '');
    await gift.getByRole('button', { name: 'Pause music', exact: true }).click();
    assert.equal(await gift.evaluate(() => window.spotifyPauseRequests), 1);
    assert.equal(await gift.getByRole('button', { name: 'Play music', exact: true }).isVisible(), true);
  });
  await check('Direct garden visits do not start music automatically', async () => {
    await gift.goto('http://127.0.0.1:4173/flower.html');
    await gift.locator('summary').click();
    await gift.getByRole('button', { name: 'Play music', exact: true }).waitFor();
    assert.equal(await gift.evaluate(() => window.spotifyPlayRequests), 0);
  });
  await check('Blocked autoplay leaves a working manual play control', async () => {
    await gift.addInitScript(() => { window.simulateBlockedPlayback = true; });
    await gift.goto('http://127.0.0.1:4173/flower.html?music=1');
    await gift.getByText('Tap Play music to start the playlist.', { exact: true }).waitFor({ timeout: 10000 });
    assert.equal(await gift.getByRole('button', { name: 'Play music', exact: true }).isVisible(), true);
    await gift.evaluate(() => { window.simulateBlockedPlayback = false; });
    await gift.getByRole('button', { name: 'Play music', exact: true }).click();
    await gift.getByText('Music is playing.', { exact: true }).waitFor();
    assert.equal(await gift.evaluate(() => window.spotifyPlayRequests), 2);
  });
  await check('All fifteen languages render and can be selected with reduced motion', async () => {
    await app.emulateMedia({ reducedMotion: 'reduce' });
    await app.setViewportSize({ width: 375, height: 812 });
    await app.goto('http://127.0.0.1:4173/flower.html');
    const expected = ['English', 'Tagalog', 'Japanese', 'Korean', 'Chinese', 'French', 'Spanish', 'German', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Swedish', 'Dutch', 'Polish'];
    for (const name of expected) {
      assert.equal(await app.locator('#language-name').innerText(), name);
      assert((await app.locator('#title').innerText()).length > 0);
      const message = await app.locator('.garden-message').boundingBox();
      const petals = await app.locator('.bloom').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top));
      assert(Math.min(...petals) >= message.y + message.height, `${name} overlaps the bouquet`);
      await app.getByRole('button', { name: 'Show the next language' }).click();
    }
    assert.equal(await app.locator('#title').innerText(), 'I love you');
  });
  await check('Languages change automatically with reduced motion enabled', async () => {
    await app.bringToFront();
    await app.goto('http://127.0.0.1:4173/flower.html');
    await app.waitForTimeout(4700);
    assert.equal(await app.locator('#title').innerText(), 'Mahal kita');
    assert.equal(await app.locator('#language-name').innerText(), 'Tagalog');
    await app.getByRole('button', { name: 'Pause messages', exact: true }).click();
    await app.waitForTimeout(4700);
    assert.equal(await app.locator('#title').innerText(), 'Mahal kita');
  });
  await check('Flower animations start automatically without an animation button', async () => {
    await app.emulateMedia({ reducedMotion: 'no-preference' });
    await app.goto('http://127.0.0.1:4173/flower.html');
    assert.notEqual(await app.locator('.sprig').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await app.getByRole('button', { name: 'Pause flowers' }).count(), 0);
    assert.equal(await app.getByRole('button', { name: 'Animate flowers' }).count(), 0);
  });
  await browser.close();
  server.close();
  process.exitCode = failures ? 1 : 0;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
