function initTouch(canvas) {
  // Prevent scrolling, zooming, pull-to-refresh
  document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
  document.addEventListener('gestureend', function(e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('dblclick', function(e) { e.preventDefault(); });

  function getTouchPos(touch) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  return { getTouchPos: getTouchPos };
}

// For DOM-based games (no canvas), just prevent gestures
function initTouchDOM() {
  document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
  document.addEventListener('gestureend', function(e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('dblclick', function(e) { e.preventDefault(); });
}
