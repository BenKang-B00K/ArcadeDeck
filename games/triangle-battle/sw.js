const CACHE_NAME = 'triangle-battle-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './coop.js',
  './image/main_bg.webp',
  './image/icon-512.png',
  './image/game_bg.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Drop old caches — caches.match() searches every cache, so stale versions would win otherwise
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
