// Register service worker (use absolute path so it works from any page)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
}

// Fullscreen entry — required for immersive tablet experience
function enterFullscreen() {
  var el = document.documentElement;
  var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (rfs) {
    try {
      var promise = rfs.call(el);
      if (promise && promise.catch) promise.catch(function() {});
    } catch (e) {
      // Fullscreen not available — continue without it
    }
  }
}

// Show the game hub, hide the start screen
function startPlaying() {
  initAudio();
  enterFullscreen();

  var startScreen = document.getElementById('start-screen');
  var hub = document.getElementById('hub');
  if (startScreen) startScreen.style.display = 'none';
  if (hub) hub.style.display = 'flex';
}

// Navigate to a game (replace — no back history)
function goToGame(path) {
  window.location.replace(path);
}

// Parent-only back button (double-tap within 500ms)
function setupBackButton(btn) {
  if (!btn) return;
  var lastTap = 0;

  function handleBack(e) {
    e.preventDefault();
    var now = Date.now();
    if (now - lastTap < 500) {
      window.location.replace('/');
    }
    lastTap = now;
  }

  btn.addEventListener('touchstart', handleBack);
  btn.addEventListener('click', handleBack);
}
