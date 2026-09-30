// Minimal offline-capable service worker (no Workbox).
const CACHE = 'tt-v5.6.0';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

// Keep the 2 newest tt-* caches (a stale tab may still lazy-load the previous build's hashed chunks), drop older ones.
// Names sort by version, so compare numerically.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => {
        const v = (k) => k.slice(4).split('.').map(Number);
        const old = keys.filter((k) => k.startsWith('tt-') && k !== CACHE)
          .sort((a, b) => { const x = v(a), y = v(b); return (y[0] - x[0]) || (y[1] - x[1]) || (y[2] - x[2]); });
        return Promise.all(old.slice(1).map((k) => caches.delete(k)));
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Pages: network-first, offline fallback to cached index.html.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.open(CACHE).then((c) => c.match('./index.html')).then((r) => r || Response.error())));
    return;
  }

  // Only hashed Vite bundles and icons are cache-first. Anything else (dev-server /src, /@vite, /node_modules)
  // goes straight to the network so a stale copy can never shadow fresh code.
  const path = new URL(req.url).pathname;
  if (!/\/(assets|icons)\//.test(path)) return;
  // Look only in our own cache: caches.match() would also search other apps' caches on a shared localhost origin
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) c.put(req, res.clone());
      return res;
    })))
  );
});
