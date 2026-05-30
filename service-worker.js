const CACHE_NAME = 'abgp-public-dashboard-v2-no-private-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/metrics.sample.json'
];

function isPrivatePath(url) {
  const scopePath = new URL(self.registration.scope).pathname;
  return url.origin === location.origin && url.pathname.startsWith(scopePath + 'private/');
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.map(path => new Request(path, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).then(() => caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.map(path => new Request(path, { cache: 'reload' })))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (isPrivatePath(url)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
