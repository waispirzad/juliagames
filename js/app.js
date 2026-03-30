// Register service worker (use absolute path so it works from any page)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
}

// Fullscreen management
var isFullscreen = false;

function enterFullscreen() {
  var el = document.documentElement;
  var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (rfs) {
    try {
      var promise = rfs.call(el);
      if (promise && promise.then) {
        promise.then(function() { isFullscreen = true; }).catch(function() {});
      }
    } catch (e) {}
  }
}

// Re-enter fullscreen on first touch (needed after page navigation)
var fullscreenAttempted = false;
function ensureFullscreen() {
  if (!fullscreenAttempted) {
    fullscreenAttempted = true;
    enterFullscreen();
  }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', function() {
  isFullscreen = !!document.fullscreenElement;
});
document.addEventListener('webkitfullscreenchange', function() {
  isFullscreen = !!(document.webkitFullscreenElement || document.fullscreenElement);
});

// On game pages: enter fullscreen once on first touch, then stop trying.
// Don't re-attempt after user exits fullscreen (avoids jarring layout shifts).
document.addEventListener('touchstart', function() {
  initAudio();
  ensureFullscreen();
}, { once: true, passive: true });

document.addEventListener('click', function() {
  initAudio();
  ensureFullscreen();
}, { once: true });

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
