/**
 * Enhanced Service Worker for Visual LLM Platform
 * Provides advanced offline capabilities and caching strategies
 */

const CACHE_NAME = 'visual-llm-v1.0.0';
const OFFLINE_CACHE = 'visual-llm-offline-v1.0.0';
const AI_CACHE = 'visual-llm-ai-responses-v1.0.0';

// Cache strategies for different content types
const CACHE_STRATEGIES = {
    'static': 'cache-first',      // CSS, JS, images
    'api': 'network-first',       // API calls
    'pages': 'stale-while-revalidate', // HTML pages
    'ai': 'network-only'          // AI responses (always fresh)
};

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/static/css/main.css',
    '/static/css/enhanced-theme.css',
    '/static/js/final-ai-assistant.js',
    '/static/js/theme-toggle.js',
    '/static/images/logo.png',
    '/static/images/llm-diagram.svg',
    '/offline.html'
];

// Essential pages for offline access
const OFFLINE_PAGES = [
    '/',
    '/learn',
    '/workshops',
    '/tutorials',
    '/ai-assistant',
    '/offline.html'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
    console.log('📱 Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME).then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Cache offline pages
            caches.open(OFFLINE_CACHE).then(cache => {
                console.log('📄 Caching offline pages...');
                return cache.addAll(OFFLINE_PAGES);
            })
        ]).then(() => {
            console.log('✅ Service Worker: Installation complete');
            self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== OFFLINE_CACHE && 
                        cacheName !== AI_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/ai/')) {
        // AI API requests - always try network first
        event.respondWith(handleAIRequest(request));
    } else if (url.pathname.startsWith('/api/')) {
        // Other API requests - network first with cache fallback
        event.respondWith(handleAPIRequest(request));
    } else if (url.pathname.startsWith('/static/')) {
        // Static assets - cache first
        event.respondWith(handleStaticRequest(request));
    } else {
        // HTML pages - stale while revalidate
        event.respondWith(handlePageRequest(request));
    }
});

// Handle AI API requests
async function handleAIRequest(request) {
    try {
        console.log('🤖 Fetching AI response from network...');
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache successful AI responses for offline fallback
            const cache = await caches.open(AI_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('📱 Network failed, checking AI cache...');
        
        // Try to get cached AI response
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Add offline indicator to cached response
            const modifiedResponse = new Response(
                JSON.stringify({
                    response: "I'm currently offline, but here's a cached response that might help. " +
                             "Please check your connection for the most up-to-date information.",
                    cached: true,
                    offline: true
                }),
                {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return modifiedResponse;
        }
        
        // Return offline AI response
        return new Response(
            JSON.stringify({
                response: "I'm currently offline. Please check your internet connection to use the AI assistant.",
                offline: true,
                error: "No network connection"
            }),
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle API requests
async function handleAPIRequest(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response(
            JSON.stringify({ error: 'Offline - no cached data available' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static asset requests
async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('📱 Failed to fetch static asset:', request.url);
        return new Response('Asset not available offline', { status: 404 });
    }
}

// Handle page requests
async function handlePageRequest(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(OFFLINE_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        const offlinePage = await caches.match('/offline.html');
        return offlinePage || new Response('Offline - page not available', { status: 404 });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncUserProgress());
    } else if (event.tag === 'sync-ai-queries') {
        event.waitUntil(syncPendingAIQueries());
    }
});

// Sync user progress when back online
async function syncUserProgress() {
    try {
        const pendingProgress = await getStoredProgress();
        
        for (const progress of pendingProgress) {
            await fetch('/api/user/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress)
            });
        }
        
        await clearStoredProgress();
        console.log('✅ User progress synced successfully');
    } catch (error) {
        console.log('❌ Failed to sync user progress:', error);
    }
}

// Sync pending AI queries when back online
async function syncPendingAIQueries() {
    try {
        const pendingQueries = await getStoredAIQueries();
        
        for (const query of pendingQueries) {
            await fetch('/api/ai/free/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query)
            });
        }
        
        await clearStoredAIQueries();
        console.log('✅ AI queries synced successfully');
    } catch (error) {
        console.log('❌ Failed to sync AI queries:', error);
    }
}

// Helper functions for IndexedDB storage
async function getStoredProgress() {
    // Implementation for retrieving stored progress
    return [];
}

async function clearStoredProgress() {
    // Implementation for clearing stored progress
}

async function getStoredAIQueries() {
    // Implementation for retrieving stored AI queries
    return [];
}

async function clearStoredAIQueries() {
    // Implementation for clearing stored AI queries
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('📬 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
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
                title: 'Open Visual LLM',
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
        self.registration.showNotification('Visual LLM Platform', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('📱 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('📱 Enhanced Service Worker loaded successfully!');
