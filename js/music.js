// Spotify controls the audio. A successful play() request is not a playback confirmation.
const musicPanel = document.querySelector('.music-panel');
const musicStatus = document.getElementById('music-status');
const musicToggle = document.getElementById('music-toggle');
const autoplayRequested = new URLSearchParams(window.location.search).get('music') === '1';
let controller;
let ready = false;
let isPlaying = false;
let wantPlayback = autoplayRequested;
let apiRequested = false;
let playbackTimeout;
let loadingTimeout;

function showFallback() {
  clearTimeout(playbackTimeout);
  musicStatus.textContent = ready
    ? 'Tap Play music to start the playlist.'
    : 'Use Spotify’s play button to start the playlist.';
}

function requestPlayback() {
  if (!ready) return;
  wantPlayback = true;
  musicStatus.textContent = 'Starting your music…';
  clearTimeout(playbackTimeout);
  playbackTimeout = setTimeout(showFallback, 6000);
  try {
    controller.play();
  } catch {
    showFallback();
  }
}

function setPlaybackState(playing) {
  isPlaying = playing;
  musicToggle.textContent = playing ? 'Pause music' : 'Play music';
  musicToggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  if (playing) {
    clearTimeout(playbackTimeout);
    musicStatus.textContent = 'Music is playing.';
  } else {
    musicStatus.textContent = 'Music is paused.';
  }
}

window.onSpotifyIframeApiReady = api => {
  const placeholder = document.getElementById('spotify-player');
  if (!placeholder) return;
  try {
    api.createController(placeholder, {
      uri: 'spotify:playlist:4Wqs29Qvc1o9vVAx6taHP2',
      width: '100%',
      height: 152,
    }, embedController => {
      controller = embedController;
      const iframe = musicPanel.querySelector('iframe');
      if (iframe) iframe.title = 'A playlist for you on Spotify';
      controller.addListener('ready', () => {
        ready = true;
        clearTimeout(loadingTimeout);
        musicToggle.hidden = false;
        if (wantPlayback) requestPlayback();
      });
      controller.addListener('playback_started', () => setPlaybackState(true));
      controller.addListener('playback_update', event => {
        if (event.data.isBuffering) return;
        // Ignore Spotify's initial paused state while the opening request is pending.
        if (!event.data.isPaused || isPlaying || !wantPlayback) {
          setPlaybackState(!event.data.isPaused);
        }
      });
    });
  } catch {
    showFallback();
  }
};

function loadPlayer() {
  if (apiRequested) return;
  apiRequested = true;
  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  script.addEventListener('error', showFallback);
  loadingTimeout = setTimeout(showFallback, 10000);
  document.head.append(script);
}

musicToggle?.addEventListener('click', () => {
  if (!ready) return;
  if (isPlaying) {
    wantPlayback = false;
    clearTimeout(playbackTimeout);
    try { controller.pause(); } catch { showFallback(); }
  } else {
    requestPlayback();
  }
});

musicPanel?.addEventListener('toggle', () => {
  if (musicPanel.open) loadPlayer();
});

if (autoplayRequested && musicPanel) {
  musicPanel.open = true;
  musicStatus.textContent = 'Loading your music…';
  loadPlayer();
}

window.addEventListener('pagehide', () => {
  clearTimeout(loadingTimeout);
  clearTimeout(playbackTimeout);
});
