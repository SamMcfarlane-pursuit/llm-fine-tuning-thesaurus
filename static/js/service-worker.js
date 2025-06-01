/**
 * Service Worker for Visual LLM PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'visual-llm-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
    '/',
    '/learn',
    '/workshops',
    '/tutorials',
    '/static/css/style.css',
    '/static/css/custom-dark-mode.css',
    '/static/css/balanced-brightness-theme.css',
    '/static/js/theme-toggle.js',
    '/static/js/balanced-brightness-enhancer.js',
    '/static/js/advanced-progress-tracking.js',
    '/static/js/realtime-collaboration.js',
    '/static/js/pwa-support.js',
    '/static/images/icon-192x192.png',
    '/static/images/icon-512x512.png'
];

// Resources to cache on demand
const RUNTIME_CACHE_PATTERNS = [
    /^https:\/\/cdn\.jsdelivr\.net\//,
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:js|css)$/
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching essential resources');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        if (isNavigationRequest(request)) {
            event.respondWith(handleNavigationRequest(request));
        } else if (shouldCacheResource(url)) {
            event.respondWith(handleResourceRequest(request));
        } else if (isAPIRequest(url)) {
            event.respondWith(handleAPIRequest(request));
        }
    } else if (request.method === 'POST') {
        if (isAPIRequest(url)) {
            event.respondWith(handleAPIPostRequest(request));
        }
    }
});

// Background sync event
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/static/images/icon-192x192.png',
        badge: '/static/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/static/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/static/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Visual LLM', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper functions
function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function shouldCacheResource(url) {
    return RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

function isAPIRequest(url) {
    return url.pathname.startsWith('/api/');
}

async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);

        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page
        return caches.match(OFFLINE_URL);
    }
}

async function handleResourceRequest(request) {
    try {
        // Try cache first for resources
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Resource request failed:', error);

        // Return fallback for images
        if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return new Response(
                '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Image unavailable</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }

        throw error;
    }
}

async function handleAPIRequest(request) {
    try {
        // Always try network first for API requests
        const networkResponse = await fetch(request);

        // Cache GET requests that succeed
        if (request.method === 'GET' && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('API request failed:', error);

        // For GET requests, try cache
        if (request.method === 'GET') {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        // Return offline response
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This feature requires an internet connection'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function handleAPIPostRequest(request) {
    try {
        // Try network first
        return await fetch(request);
    } catch (error) {
        console.log('API POST failed, queuing for sync:', error);

        // Queue for background sync
        const requestData = {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await request.text()
        };

        await queueForBackgroundSync(requestData);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Request queued for sync when online',
                queued: true
            }),
            {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function handleBackgroundSync() {
    console.log('Processing background sync queue');

    try {
        const syncQueue = await getSyncQueue();

        for (const item of syncQueue) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body
                });

                if (response.ok) {
                    console.log('Synced item successfully:', item.url);
                    await removeFromSyncQueue(item);
                } else {
                    console.error('Sync failed for item:', item.url, response.status);
                }
            } catch (error) {
                console.error('Sync error for item:', item.url, error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function queueForBackgroundSync(requestData) {
    // Store in IndexedDB or cache for background sync
    const cache = await caches.open('sync-queue');
    const queueKey = `sync-${Date.now()}-${Math.random()}`;

    await cache.put(
        queueKey,
        new Response(JSON.stringify(requestData))
    );
}

async function getSyncQueue() {
    const cache = await caches.open('sync-queue');
    const keys = await cache.keys();
    const items = [];

    for (const key of keys) {
        const response = await cache.match(key);
        const data = await response.json();
        items.push({ ...data, _key: key.url });
    }

    return items;
}

async function removeFromSyncQueue(item) {
    const cache = await caches.open('sync-queue');
    await cache.delete(item._key);
}

// Message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Sync content in the background
    try {
        const response = await fetch('/api/content/sync');
        if (response.ok) {
            const data = await response.json();

            // Update cache with new content
            const cache = await caches.open(CACHE_NAME);
            // Process and cache updated content

            // Notify clients of update
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'CONTENT_UPDATED',
                    data: data
                });
            });
        }
    } catch (error) {
        console.error('Content sync failed:', error);
    }
}
