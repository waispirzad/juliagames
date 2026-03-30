(function() {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var particles = [];
  var sessionStart = Date.now();
  var GAME_NAME = 'tap-react';

  // Size canvas to viewport
  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  var touch = initTouch(canvas);
  initTracker();
  trackEvent(GAME_NAME, 'session_start');
  setupBackButton(document.getElementById('back-btn'));

  // Particle shapes
  var SHAPES = ['circle', 'star', 'square', 'triangle'];

  function Particle(x, y) {
    this.x = x;
    this.y = y;
    var angle = Math.random() * Math.PI * 2;
    var speed = randomBetween(3, 10);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - randomBetween(2, 6);
    this.size = randomBetween(8, 35);
    this.color = randomColor();
    this.life = 1.0;
    this.decay = randomBetween(0.008, 0.025);
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = randomBetween(-0.15, 0.15);
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.25; // gravity
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
  };

  Particle.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    var s = this.size;
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      ctx.fillRect(-s / 2, -s / 2, s, s);
    } else if (this.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(-s / 2, s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'star') {
      drawStar(ctx, 0, 0, 5, s / 2, s / 4);
    }

    ctx.restore();
  };

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    var rot = Math.PI / 2 * 3;
    var step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (var i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  function spawnExplosion(x, y) {
    var count = Math.floor(randomBetween(15, 25));
    for (var i = 0; i < count; i++) {
      particles.push(new Particle(x, y));
    }
    // Cap particles
    if (particles.length > 300) {
      particles.splice(0, particles.length - 300);
    }
  }

  // Random sound per tap
  var sounds = [playPop, playSparkle, playBounce, playChime];
  function playRandomSound() {
    sounds[Math.floor(Math.random() * sounds.length)]();
  }

  // Touch handler
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    initAudio();

    for (var i = 0; i < e.changedTouches.length; i++) {
      var pos = touch.getTouchPos(e.changedTouches[i]);
      spawnExplosion(pos.x / dpr, pos.y / dpr);
      playRandomSound();
      trackEvent(GAME_NAME, 'tap', {
        x: pos.x / canvas.width,
        y: pos.y / canvas.height,
      });
    }
  });

  // Also handle mouse clicks for desktop testing
  canvas.addEventListener('click', function(e) {
    initAudio();
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    spawnExplosion(x, y);
    playRandomSound();
    trackEvent(GAME_NAME, 'tap', {
      x: x / rect.width,
      y: y / rect.height,
    });
  });

  // Background color cycling
  var bgHue = 0;
  var tapCount = 0;

  // Game loop
  function gameLoop() {
    // Semi-transparent clear for trail effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.15)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Update and draw particles
    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  // Track session end on page hide
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      endSession(GAME_NAME, Date.now() - sessionStart);
    }
  });
})();
