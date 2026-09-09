const CACHE_NAME = 'triangle-battle-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './image/main_bg.png',
  './image/game_bg.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
