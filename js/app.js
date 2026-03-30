// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function() {});
}

// Fullscreen entry — required for immersive tablet experience
function enterFullscreen() {
  var el = document.documentElement;
  var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (rfs) rfs.call(el);
}

// Show the game hub, hide the start screen
function startPlaying() {
  initAudio();
  enterFullscreen();

  var startScreen = document.getElementById('start-screen');
  var hub = document.getElementById('hub');
  startScreen.style.display = 'none';
  hub.style.display = 'flex';
}

// Navigate to a game (replace — no back history)
function goToGame(path) {
  window.location.replace(path);
}

// Parent-only back button (double-tap within 500ms)
function setupBackButton(btn) {
  var lastTap = 0;
  btn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var now = Date.now();
    if (now - lastTap < 500) {
      window.location.replace('../../index.html');
    }
    lastTap = now;
  });
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    var now = Date.now();
    if (now - lastTap < 500) {
      window.location.replace('../../index.html');
    }
    lastTap = now;
  });
}
