// Minimal Service Worker — required for Chrome/Android PWA installability
const CACHE_NAME = 'second-brain-v1';
const STATIC_ASSETS = ['/', '/login', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip API calls — always go to network
  if (event.request.url.includes('/api/')) return;

  // For navigation requests: network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // For static assets: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
