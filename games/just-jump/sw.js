// Offline support: precache app shell, then stale-while-revalidate for same-origin GETs.
// Bump VERSION on release to drop old caches.
const VERSION = 'jj-v9';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './js/i18n.js', './js/audio.js', './js/skins.js', './js/player_sprite.js', './js/obstacles.js',
  './js/coins.js', './js/stages.js', './js/ui.js',
  './data/skins.json', './data/stages.json', './data/coins.json', './data/obstacles.json',
  './fonts/galmuri11.woff2', './fonts/galmuri11-bold.woff2', './fonts/dotgothic16.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // per-file add: one missing asset must not fail the whole install
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith('jj-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
