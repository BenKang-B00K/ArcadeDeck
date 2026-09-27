// Offline cache. vite.config.js fills in the file list + a version hash at build time.
const CACHE = 'csr-9753f83e9f';
const PRECACHE = ["./assets/index-CB3_qUuT.js","./assets/BlackHanSans-CbNzE0MB.woff2","./assets/NotoSansJP-lDnqFinl.woff2","./assets/NotoSansKR-Dd99iHs2.woff2","./assets/index-DTYgBOGm.css","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/favicon.png"];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', ...PRECACHE])));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Page: network first (pick up new builds), cache when offline. Assets: hashed → cache first.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); return res; })
      .catch(() => caches.match('./')));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
