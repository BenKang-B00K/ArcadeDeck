// Bump VERSION with each release so old caches are dropped.
const VERSION = 'tandem-v3.11.2';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'coop.js',
  'src/main.js', 'src/game.js', 'src/view.js', 'src/levels.js', 'src/input.js', 'src/audio.js', 'src/i18n.js',
  'vendor/three.module.min.js', 'vendor/three.core.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/splash.webp',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith('tandem-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network-first so updates land on the next load; cache keeps it playable offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request)
    .then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
