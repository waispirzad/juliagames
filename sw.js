var CACHE_NAME = 'julia-games-v1';
var ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './js/app.js',
  './js/audio.js',
  './js/touch.js',
  './js/tracker.js',
  './js/utils.js',
  './games/tap-react/index.html',
  './games/tap-react/game.js',
  './games/pop-bubbles/index.html',
  './games/pop-bubbles/game.js',
  './games/animal-sounds/index.html',
  './games/animal-sounds/game.js',
  './manifest.json',
  './assets/icons/favicon-196.png',
  './assets/icons/apple-icon-180.png',
  './assets/icons/manifest-icon-192.maskable.png',
  './assets/icons/manifest-icon-512.maskable.png',
  './assets/sounds/chicken.mp3',
  './assets/sounds/cow.mp3',
  './assets/sounds/horse.mp3',
  './assets/sounds/pig.mp3',
  './assets/sounds/sheep.mp3',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Don't cache Supabase API calls
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
