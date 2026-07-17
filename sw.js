const CACHE_NAME = 'union-protest-portal-v40';
const ASSETS_TO_CACHE = [
  './dharna-guidelines.html',
  './dharna-guidelines.css',
  './dharna-guidelines.js',
  './styles.css',
  './dharna-premium.css',
  './dharna-mobile.css',
  './logo.webp',
  './photos/leader.jpg',
  './song.mp3',
  './flag.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local assets
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // NETWORK FIRST strategy — always try network, fall back to cache
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
        return networkResponse;
      }
      // Update cache with fresh response
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
      });
      return networkResponse;
    }).catch(() => {
      // Network failed — serve from cache (offline fallback)
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        // HTML fallback
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./dharna-guidelines.html');
        }
      });
    })
  );
});
