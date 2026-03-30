// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
}

// Fullscreen
function enterFullscreen() {
  var el = document.documentElement;
  var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (rfs) {
    try { rfs.call(el); } catch (e) {}
  }
}

// Start Playing → fullscreen + show hub
function startPlaying() {
  initAudio();
  enterFullscreen();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('hub').style.display = 'flex';
}

// Open game in iframe (preserves fullscreen)
function openGame(path) {
  document.getElementById('hub').style.display = 'none';
  var frame = document.getElementById('game-frame');
  frame.src = path;
  frame.style.display = 'block';
}

// Close game, return to hub
function closeGame() {
  var frame = document.getElementById('game-frame');
  frame.style.display = 'none';
  frame.src = '';
  document.getElementById('hub').style.display = 'flex';
}

// Wire up buttons
document.addEventListener('DOMContentLoaded', function() {
  var playBtn = document.getElementById('btn-play');
  if (playBtn) playBtn.addEventListener('click', startPlaying);

  var card = document.getElementById('card-bubbles');
  if (card) card.addEventListener('click', function() { openGame('./games/pop-bubbles/'); });
});

// Escape key closes game from hub page
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var frame = document.getElementById('game-frame');
    if (frame && frame.style.display === 'block') {
      e.preventDefault();
      closeGame();
    }
  }
});
