# I Have Something For You

A personal gift in two pages: an illustrated invitation, followed by an animated flower garden. Built with HTML, CSS, and vanilla JavaScript; no application dependencies or build step required.

## Preview

Visit https://trashpenguin.github.io/IHaveSomethingForYou/ for the published version. Local changes appear there after you push them to the branch used by GitHub Pages.

```sh
git clone https://github.com/trashpenguin/IHaveSomethingForYou.git
cd IHaveSomethingForYou
```

Open `index.html` directly, or run a local server:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. The garden and messages work offline; the optional Spotify playlist requires an internet connection and playback depends on Spotify.

## Experience

- Midnight blue, rose, and mint palette with a hand-drawn flower note.
- Floating envelope, shimmering stars, a letter-opening transition, and an animated garden message. Reduced motion skips the transition.
- An illustrated bouquet of cream and blush flowers, blue forget-me-nots, sage leaves, blue wrapping, and a pink ribbon. Stems grow, blossoms open in sequence, and individual sprigs sway automatically.
- A live canvas starfield inspired by the reference: drifting stars, changing brightness, soft Milky Way clouds, pointer parallax, and occasional meteors. No background photo is used.
- Complete messages rotate through 15 languages every 4.5 seconds with a soft fade, a language label, and the correct language attribute. Use Next language to switch manually, including with reduced motion enabled. No partial characters or rapidly deleting text.
- Pause messages preserves the current language and pauses only message rotation. Flower animations start automatically.
- Opening the gift requests music playback automatically using Spotify’s official iFrame API. The panel opens so its controls are available immediately.
- Playback status reflects Spotify’s confirmation. If a browser blocks autoplay, the Play music button retries from a direct tap; the embedded Spotify controls remain available.
- Visiting `flower.html` directly keeps music off. The gift link uses `flower.html?music=1` to request playback.
- Reduced-motion preferences keep the bouquet still and disable text transitions; languages still change automatically every 4.5 seconds. Pause messages stops the rotation. An Enable animations button appears when reduced motion is active; choosing it enables flower and sky motion for this tab session.
- The invitation, gift link, bouquet, and first message work without JavaScript.
- Layouts accommodate phones, tablets, desktops, and short landscape screens.

## Customize

Edit the invitation text in `index.html` and the first garden message in `flower.html`. Edit `phrases` in `js/main.js` to change the rotating messages and their language codes. Keep the first HTML message and the first entry in `phrases` in sync; `phraseIndex` starts at 1 so the first message has time to be read.

Replace the playlist ID in the Spotify iframe in `flower.html` with your playlist ID. Keep the iframe title descriptive.
Also update the `uri` in `js/music.js` to the same playlist ID. The iframe provides the fallback player; the URI configures the controllable player.

Spotify playback requires internet access and depends on the browser and Spotify account. [Spotify documents that autoplay is not available for every browser or user](https://developer.spotify.com/documentation/embeds/references/iframe-api). Playback is requested, but never reported as playing until Spotify confirms it.

Shared palette, typography, focus styles, and motion preferences live in `css/theme.css`. Landing-page styles live in `css/index.css`; garden layout and controls live in `css/garden.css`.

The bouquet is inline SVG in `flower.html`; its growth, blooming, and sway animations live in `css/bouquet.css`. Edit the SVG fills and shapes to customize the flowers. The original CSS/SCSS artwork remains in the repository for reference.

## Automated checks

Node.js is needed only for development checks. Install the test dependency and Chromium, then run the browser checks:

```sh
npm install
npx playwright install chromium
npm test
```

The checks cover gift navigation and the opening transition, keyboard music controls, pause/resume, reduced motion, JavaScript-disabled content, and layout at four screen sizes. Music integration checks simulate Spotify’s API to verify automatic play requests, playback confirmation, pause controls, blocked-autoplay recovery, and silent direct visits. Actual Spotify audio playback is not exercised by the automated tests.

To use an already installed Chrome instead, set `BROWSER_CHANNEL=chrome` before running `npm test`.

## Before publishing

Check both pages at phone and desktop sizes, navigate using Tab and Enter, open and close the music panel, pause and resume messages, and enable reduced motion. Also check the pages with JavaScript disabled. Spotify is an external service; test playback separately with your own account.

## Credits

The original repository created the CSS flower garden and multilingual love-message concept. This redesign adds a new illustrated bouquet alongside the invitation illustration, unified styling, accessible controls, and more reliable text rendering.

No license file is currently included. Add a license you choose before explicitly granting reuse permissions.
