// JDIH Kabupaten Banjarnegara - Service Worker PWA
const CACHE_NAME = 'jdih-bna-v1';
const PRECACHE_ASSETS = [
    '/mobile',
    '/manifest.json',
    '/favicon.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install: Cache offline essentials
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Precache notice:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network-first for HTML pages with fallback to cache
self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // Ignore non-GET requests and admin/API routes
    if (request.method !== 'GET') return;
    if (request.url.includes('/admin') || request.url.includes('/livewire') || request.url.includes('/ai/ask')) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/mobile').then((fallback) => {
                    return fallback || caches.match(request);
                });
            })
        );
        return;
    }

    // Static assets: cache with network fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then((networkResponse) => {
                // Cache valid response for icons, fonts, images
                if (networkResponse && networkResponse.status === 200 && (
                    request.url.includes('/icons/') || 
                    request.url.includes('/images/') || 
                    request.url.includes('fonts.bunny.net')
                )) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback for images
                return null;
            });
        })
    );
});
