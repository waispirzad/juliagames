function preventDefaults(e) {
  if (e.cancelable) e.preventDefault();
}

function initTouch(canvas) {
  // Prevent scrolling, zooming, pull-to-refresh
  document.addEventListener('touchmove', preventDefaults, { passive: false });
  document.addEventListener('gesturestart', preventDefaults);
  document.addEventListener('gesturechange', preventDefaults);
  document.addEventListener('gestureend', preventDefaults);
  document.addEventListener('contextmenu', preventDefaults);
  document.addEventListener('dblclick', preventDefaults);

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
  document.addEventListener('touchmove', preventDefaults, { passive: false });
  document.addEventListener('gesturestart', preventDefaults);
  document.addEventListener('gesturechange', preventDefaults);
  document.addEventListener('gestureend', preventDefaults);
  document.addEventListener('contextmenu', preventDefaults);
  document.addEventListener('dblclick', preventDefaults);
}
