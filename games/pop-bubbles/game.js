(function() {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W, H;
  var bubbles = [];
  var sparkles = [];
  var sessionStart = Date.now();
  var GAME_NAME = 'pop-bubbles';

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  var touch = initTouch(canvas);
  initTracker();
  trackEvent(GAME_NAME, 'session_start');
  setupBackButton(document.getElementById('back-btn'));

  // Bubble
  function Bubble() {
    this.radius = randomBetween(40, 70);
    this.x = randomBetween(this.radius + 10, W - this.radius - 10);
    this.y = H + this.radius;
    this.vy = randomBetween(-1.2, -0.4);
    this.wobbleSpeed = randomBetween(0.015, 0.04);
    this.wobbleAmount = randomBetween(0.8, 2.5);
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.color = randomColor();
    this.popped = false;
    this.popProgress = 0;
    this.time = 0;
  }

  Bubble.prototype.update = function() {
    if (this.popped) {
      this.popProgress += 0.04;
      return;
    }
    this.time++;
    this.y += this.vy;
    this.x += Math.sin(this.time * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmount;
  };

  Bubble.prototype.draw = function(ctx) {
    if (this.popped) {
      // Pop animation: expanding ring + particles
      var scale = 1 + this.popProgress * 2.5;
      var alpha = 1 - this.popProgress;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Expanding ring
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Flying particles
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var dist = this.radius * scale * 1.3;
        var pSize = 5 * (1 - this.popProgress);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
          this.x + Math.cos(angle) * dist,
          this.y + Math.sin(angle) * dist,
          pSize, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // Draw bubble with gradient
    ctx.save();
    var grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
      this.x, this.y, this.radius
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, this.color + '88');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Small highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(
      this.x - this.radius * 0.25,
      this.y - this.radius * 0.3,
      this.radius * 0.2,
      this.radius * 0.12,
      -0.5, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  };

  Bubble.prototype.containsPoint = function(px, py) {
    var dx = px - this.x;
    var dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  };

  // Mini sparkle for missed taps
  function Sparkle(x, y) {
    this.x = x;
    this.y = y;
    this.life = 1;
    this.color = randomColor();
    this.size = randomBetween(3, 8);
  }

  Sparkle.prototype.update = function() {
    this.life -= 0.04;
    this.size *= 0.97;
  };

  Sparkle.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2;
      var dist = 15 * (1 - this.life) + 5;
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(angle) * dist,
        this.y + Math.sin(angle) * dist,
        this.size, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  };

  // Spawn bubbles periodically
  var lastSpawn = 0;
  var spawnInterval = 1200;

  function maybeSpawnBubble(now) {
    if (now - lastSpawn > spawnInterval && bubbles.length < 15) {
      bubbles.push(new Bubble());
      lastSpawn = now;
      spawnInterval = randomBetween(800, 1500);
    }
  }

  // Touch handler
  function handleTap(px, py) {
    initAudio();
    var hit = false;

    // Check from top (last drawn) to bottom
    for (var i = bubbles.length - 1; i >= 0; i--) {
      if (!bubbles[i].popped && bubbles[i].containsPoint(px, py)) {
        bubbles[i].popped = true;
        playPop();
        hit = true;
        trackEvent(GAME_NAME, 'hit', {
          x: px / W,
          y: py / H,
          target: 'bubble',
        });
        break;
      }
    }

    if (!hit) {
      // Missed — still give positive feedback
      sparkles.push(new Sparkle(px, py));
      playSparkle();
      trackEvent(GAME_NAME, 'miss', { x: px / W, y: py / H });
    }
  }

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var pos = touch.getTouchPos(e.changedTouches[i]);
      handleTap(pos.x / dpr, pos.y / dpr);
    }
  });

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    handleTap(e.clientX - rect.left, e.clientY - rect.top);
  });

  // Spawn initial bubbles
  for (var b = 0; b < 5; b++) {
    var bubble = new Bubble();
    bubble.y = randomBetween(H * 0.2, H * 0.8);
    bubbles.push(bubble);
  }

  // Game loop
  function gameLoop() {
    var now = Date.now();

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    maybeSpawnBubble(now);

    // Update and draw bubbles
    for (var i = bubbles.length - 1; i >= 0; i--) {
      bubbles[i].update();
      bubbles[i].draw(ctx);

      // Remove if floated off top or pop animation done
      if (bubbles[i].y < -bubbles[i].radius || bubbles[i].popProgress >= 1) {
        bubbles.splice(i, 1);
      }
    }

    // Update and draw sparkles
    for (var j = sparkles.length - 1; j >= 0; j--) {
      sparkles[j].update();
      sparkles[j].draw(ctx);
      if (sparkles[j].life <= 0) {
        sparkles.splice(j, 1);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  // Track session end
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      endSession(GAME_NAME, Date.now() - sessionStart);
    }
  });
})();
