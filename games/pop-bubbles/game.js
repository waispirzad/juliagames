(function() {
  var GAME_NAME = 'pop-bubbles';
  var MAX_BUBBLES = 15;
  var SPAWN_MIN = 800;
  var SPAWN_MAX = 1500;

  // --- Bubble ---
  function Bubble(W, H, placeOnScreen) {
    this.radius = randomBetween(40, 70);
    this.x = randomBetween(this.radius + 10, W - this.radius - 10);
    this.y = placeOnScreen ? randomBetween(H * 0.2, H * 0.8) : H + this.radius;
    this.vy = randomBetween(-1.2, -0.4);
    this.wobbleSpeed = randomBetween(0.015, 0.04);
    this.wobbleAmp = randomBetween(0.8, 2.5);
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.baseX = this.x;
    this.color = randomColor();
    this.colorInt = Phaser.Display.Color.HexStringToColor(this.color).color;
    this.time = 0;
  }

  Bubble.prototype.update = function() {
    this.time++;
    this.y += this.vy;
    this.x = this.baseX + Math.sin(this.time * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmp;
  };

  Bubble.prototype.hits = function(px, py) {
    var dx = px - this.x, dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  };

  Bubble.prototype.draw = function(gfx) {
    var r = this.radius;
    gfx.fillStyle(this.colorInt, 0.7);
    gfx.fillCircle(this.x, this.y, r);
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillCircle(this.x - r * 0.15, this.y - r * 0.15, r * 0.7);
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillEllipse(this.x - r * 0.25, this.y - r * 0.3, r * 0.4, r * 0.24);
    gfx.lineStyle(2, this.colorInt, 0.3);
    gfx.strokeCircle(this.x, this.y, r);
  };

  // --- Pop effect ---
  function PopEffect(bubble) {
    this.x = bubble.x;
    this.y = bubble.y;
    this.radius = bubble.radius;
    this.colorInt = bubble.colorInt;
    this.t = 0;
  }

  PopEffect.prototype.update = function() { this.t += 0.04; };
  PopEffect.prototype.done = function() { return this.t >= 1; };

  PopEffect.prototype.draw = function(gfx) {
    var scale = 1 + this.t * 2.5;
    var alpha = 1 - this.t;
    gfx.lineStyle(3, this.colorInt, alpha);
    gfx.strokeCircle(this.x, this.y, this.radius * scale);
    var size = Math.max(0, 5 * (1 - this.t));
    gfx.fillStyle(this.colorInt, alpha);
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      var dist = this.radius * scale * 1.3;
      gfx.fillCircle(
        this.x + Math.cos(angle) * dist,
        this.y + Math.sin(angle) * dist,
        size
      );
    }
  };

  // --- Sparkle (miss feedback) ---
  function Sparkle(x, y) {
    this.x = x;
    this.y = y;
    this.life = 1;
    this.colorInt = Phaser.Display.Color.HexStringToColor(randomColor()).color;
    this.size = randomBetween(3, 8);
  }

  Sparkle.prototype.update = function() { this.life -= 0.04; this.size *= 0.97; };
  Sparkle.prototype.done = function() { return this.life <= 0; };

  Sparkle.prototype.draw = function(gfx) {
    gfx.fillStyle(this.colorInt, this.life);
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2;
      var dist = 15 * (1 - this.life) + 5;
      gfx.fillCircle(
        this.x + Math.cos(angle) * dist,
        this.y + Math.sin(angle) * dist,
        Math.max(0, this.size)
      );
    }
  };

  // --- Scene ---
  var PopBubblesScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function() {
      Phaser.Scene.call(this, { key: 'PopBubblesScene' });
    },

    create: function() {
      var self = this;
      this.bubbles = [];
      this.pops = [];
      this.sparkles = [];
      this.gfx = this.add.graphics();

      var W = this.scale.width, H = this.scale.height;
      for (var i = 0; i < 5; i++) {
        this.bubbles.push(new Bubble(W, H, true));
      }

      this.spawnTimer = this.time.addEvent({
        delay: 1200,
        loop: true,
        callback: function() {
          if (self.bubbles.length < MAX_BUBBLES) {
            self.bubbles.push(new Bubble(self.scale.width, self.scale.height, false));
          }
          self.spawnTimer.delay = randomBetween(SPAWN_MIN, SPAWN_MAX);
        },
      });

      this.input.on('pointerdown', function(pointer) {
        initAudio();
        var hit = false;

        for (var i = self.bubbles.length - 1; i >= 0; i--) {
          if (self.bubbles[i].hits(pointer.x, pointer.y)) {
            self.pops.push(new PopEffect(self.bubbles[i]));
            self.bubbles.splice(i, 1);
            playPop();
            hit = true;
            trackEvent(GAME_NAME, 'hit', {
              x: pointer.x / self.scale.width,
              y: pointer.y / self.scale.height,
              target: 'bubble',
            });
            break;
          }
        }

        if (!hit) {
          self.sparkles.push(new Sparkle(pointer.x, pointer.y));
          playSparkle();
          trackEvent(GAME_NAME, 'miss', {
            x: pointer.x / self.scale.width,
            y: pointer.y / self.scale.height,
          });
        }
      });

      initGameSession(GAME_NAME);
      setupBackButton();
      preventBrowserGestures();
    },

    update: function() {
      var gfx = this.gfx;
      gfx.clear();

      for (var i = this.bubbles.length - 1; i >= 0; i--) {
        var b = this.bubbles[i];
        b.update();
        if (b.y < -b.radius) {
          this.bubbles.splice(i, 1);
        } else {
          b.draw(gfx);
        }
      }

      for (var i = this.pops.length - 1; i >= 0; i--) {
        var p = this.pops[i];
        p.update();
        if (p.done()) { this.pops.splice(i, 1); }
        else { p.draw(gfx); }
      }

      for (var i = this.sparkles.length - 1; i >= 0; i--) {
        var s = this.sparkles[i];
        s.update();
        if (s.done()) { this.sparkles.splice(i, 1); }
        else { s.draw(gfx); }
      }
    },
  });

  new Phaser.Game(createPhaserConfig(PopBubblesScene));
})();
