// Shared Phaser config for all games
function createPhaserConfig(sceneClass) {
  return {
    type: Phaser.AUTO,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    audio: { noAudio: true },
    input: { touch: { capture: true } },
    scene: sceneClass,
  };
}

// Prevent browser gestures that interfere with gameplay
function preventBrowserGestures() {
  function pd(e) { if (e.cancelable) e.preventDefault(); }
  document.addEventListener('gesturestart', pd);
  document.addEventListener('gesturechange', pd);
  document.addEventListener('gestureend', pd);
  document.addEventListener('contextmenu', pd);
}

// Back button — double-tap to go back (parent-only safety)
function setupBackButton() {
  var lastTap = 0;

  function goBack() {
    if (window.parent && window.parent.closeGame) {
      window.parent.closeGame();
    } else {
      window.location.replace('/');
    }
  }

  var btn = document.getElementById('back-btn');
  if (btn) {
    function onTap(e) {
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (now - lastTap < 800) goBack();
      lastTap = now;
    }
    btn.addEventListener('touchstart', onTap);
    btn.addEventListener('click', onTap);
  }

  // Escape key — immediate back
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      goBack();
    }
  }, true);
}

// Session tracking
function initGameSession(gameName) {
  initTracker();
  trackEvent(gameName, 'session_start');
  var start = Date.now();
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      endSession(gameName, Date.now() - start);
    }
  });
}
