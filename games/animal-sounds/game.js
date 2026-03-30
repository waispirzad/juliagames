(function() {
  var GAME_NAME = 'animal-sounds';
  var sessionStart = Date.now();
  var soundsLoaded = false;

  initTouchDOM();
  initTracker();
  trackEvent(GAME_NAME, 'session_start');
  setupBackButton(document.getElementById('back-btn'));

  // Animal sound frequencies for synthetic fallback
  // (used until real MP3s are added to assets/sounds/)
  var animalTones = {
    cow:     { freq: 150, duration: 0.8, type: 'sawtooth' },
    cat:     { freq: 600, duration: 0.4, type: 'sine' },
    dog:     { freq: 250, duration: 0.3, type: 'square' },
    duck:    { freq: 500, duration: 0.25, type: 'sine' },
    sheep:   { freq: 350, duration: 0.5, type: 'triangle' },
    horse:   { freq: 200, duration: 0.6, type: 'sawtooth' },
    pig:     { freq: 180, duration: 0.35, type: 'square' },
    chicken: { freq: 700, duration: 0.2, type: 'sine' },
  };

  function playAnimalSound(animal) {
    // Try loaded MP3 first, fall back to synthetic
    if (soundBuffers[animal]) {
      playSound(animal);
    } else {
      var tone = animalTones[animal];
      if (tone) {
        playTone(tone.freq, tone.duration, tone.type);
        // Add a second note for more character
        setTimeout(function() {
          playTone(tone.freq * 1.1, tone.duration * 0.7, tone.type);
        }, tone.duration * 400);
      }
    }
  }

  // Only load sounds that actually exist as MP3 files
  var availableMp3s = ['cow', 'sheep', 'horse', 'pig', 'chicken'];
  var loadAttempted = false;

  function tryLoadSounds() {
    if (loadAttempted) return;
    loadAttempted = true;
    var loaded = 0;
    availableMp3s.forEach(function(animal) {
      loadSound(animal, '../../assets/sounds/' + animal + '.mp3')
        .then(function() {
          loaded++;
          if (loaded === availableMp3s.length) soundsLoaded = true;
        })
        .catch(function() {});
    });
  }

  // Handle card taps
  var cards = document.querySelectorAll('.animal-card');
  cards.forEach(function(card) {
    function handleTap(e) {
      e.preventDefault();
      initAudio();

      // Load sounds on first interaction
      if (!soundsLoaded && audioCtx) tryLoadSounds();

      var animal = card.getAttribute('data-animal');
      playAnimalSound(animal);

      // Wobble animation
      card.classList.remove('playing');
      void card.offsetWidth; // force reflow to restart animation
      card.classList.add('playing');

      // Background color flash
      document.body.style.backgroundColor = randomColor();
      setTimeout(function() {
        document.body.style.backgroundColor = '#1a1a2e';
      }, 400);

      // Track
      trackEvent(GAME_NAME, 'tap', { target: animal });
    }

    card.addEventListener('touchstart', handleTap);
    card.addEventListener('click', handleTap);
  });

  // Track session end
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      endSession(GAME_NAME, Date.now() - sessionStart);
    }
  });
})();
