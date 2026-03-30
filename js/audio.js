var audioCtx = null;
var soundBuffers = {};

// Must be called from a user gesture (touchstart/click)
function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function loadSound(name, url) {
  return fetch(url)
    .then(function(response) { return response.arrayBuffer(); })
    .then(function(buffer) { return audioCtx.decodeAudioData(buffer); })
    .then(function(decoded) { soundBuffers[name] = decoded; });
}

function playSound(name) {
  if (!audioCtx || !soundBuffers[name]) return;
  var source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[name];
  source.connect(audioCtx.destination);
  source.start(0);
}

// Synthetic sounds — no files needed
function playTone(frequency, duration, type) {
  if (!audioCtx) return;
  type = type || 'sine';
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playPop() {
  playTone(800 + Math.random() * 400, 0.15, 'sine');
}

function playSparkle() {
  playTone(1200 + Math.random() * 300, 0.3, 'triangle');
}

function playBounce() {
  playTone(300 + Math.random() * 200, 0.2, 'square');
}

function playChime() {
  if (!audioCtx) return;
  var notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach(function(freq, i) {
    setTimeout(function() { playTone(freq, 0.3, 'sine'); }, i * 100);
  });
}
