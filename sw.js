const CACHE_NAME = 'gp-sahayak-cache-v20';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/privacy.html',
  '/disclaimer.html',
  '/style.css',
  '/manifest.json',
  '/images/panchayat_logo.png',
  '/images/panchayat_favicon.png',
  '/hindi-office-editor.html'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker & Delete Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Avoid intercepting non-GET requests or external APIs/Firestore/Google Translate
  if (event.request.method !== 'GET' || 
      requestUrl.origin !== self.location.origin || 
      event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('pagead2.googlesyndication.com') ||
      event.request.url.includes('translate.google.com') ||
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  const acceptHeader = event.request.headers.get('accept') || '';
  const isCodeAsset = acceptHeader.includes('text/html') || 
                      requestUrl.pathname.endsWith('.js') || 
                      requestUrl.pathname.endsWith('.css');

  // Network-First for HTML, JS and CSS to ensure live site on GitHub Pages always gets latest code
  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
  } else {
    // Cache-First for static assets (Images, Fonts, Manifest)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
    );
  }
});
