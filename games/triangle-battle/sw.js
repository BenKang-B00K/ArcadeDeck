const CACHE_NAME = 'triangle-battle-v8';
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

// Drop our old caches (caches.match() searches every cache, so stale versions would win). Every game shares this origin: never touch another game's.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k.startsWith('triangle-battle-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
