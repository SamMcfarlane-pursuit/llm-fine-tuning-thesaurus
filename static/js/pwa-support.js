/**
 * Progressive Web App (PWA) Support
 * Enables offline functionality, caching, and app-like experience
 */

class PWASupport {
    constructor() {
        this.isOnline = navigator.onLine;
        this.serviceWorker = null;
        this.cache = null;
        this.offlineQueue = [];
        this.syncQueue = [];
        this.installPrompt = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupOfflineDetection();
        this.setupInstallPrompt();
        this.createOfflineUI();
        this.setupCaching();
        this.setupBackgroundSync();
        this.setupNotifications();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/static/js/service-worker.js');
                this.serviceWorker = registration;

                console.log('Service Worker registered successfully');

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });

                // Check for existing service worker
                if (registration.active) {
                    this.setupMessageChannel();
                }

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
            }
        });
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h6><i class="bi bi-download"></i> Update Available</h6>
                <p>A new version of the app is available. Refresh to update.</p>
                <div class="notification-actions">
                    <button class="btn btn-primary btn-sm" onclick="pwaSupport.updateApp()">Update Now</button>
                    <button class="btn btn-secondary btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
    }

    updateApp() {
        window.location.reload();
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // Initial status check
        this.handleConnectionStatus();
    }

    handleOnlineStatus() {
        this.updateConnectionIndicator(true);
        this.hideOfflineMessage();
        this.enableOnlineFeatures();
    }

    handleOfflineStatus() {
        this.updateConnectionIndicator(false);
        this.showOfflineMessage();
        this.enableOfflineMode();
    }

    handleConnectionStatus() {
        if (this.isOnline) {
            this.handleOnlineStatus();
        } else {
            this.handleOfflineStatus();
        }
    }

    createOfflineUI() {
        const offlineHTML = `
            <div id="offline-message" class="offline-message" style="display: none;">
                <div class="offline-content">
                    <i class="bi bi-wifi-off"></i>
                    <h5>You're offline</h5>
                    <p>Some features may be limited. Your changes will sync when you're back online.</p>
                    <button class="btn btn-primary" onclick="pwaSupport.retryConnection()">
                        <i class="bi bi-arrow-clockwise"></i> Retry
                    </button>
                </div>
            </div>

            <div id="install-prompt" class="install-prompt" style="display: none;">
                <div class="install-content">
                    <i class="bi bi-download"></i>
                    <div class="install-text">
                        <h6>Install Visual LLM</h6>
                        <p>Get the full app experience</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="pwaSupport.installApp()">Install</button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="pwaSupport.dismissInstallPrompt()">×</button>
                </div>
            </div>
        `;

        if (!document.getElementById('offline-message')) {
            document.body.insertAdjacentHTML('beforeend', offlineHTML);
        }
    }

    updateConnectionIndicator(online) {
        // Connection indicator removed - no longer needed
        // Status is now handled internally without UI display
    }

    showOfflineMessage() {
        const message = document.getElementById('offline-message');
        if (message) {
            message.style.display = 'flex';
        }
    }

    hideOfflineMessage() {
        const message = document.getElementById('offline-message');
        if (message) {
            message.style.display = 'none';
        }
    }

    retryConnection() {
        // Force a network check
        fetch('/api/ping', { method: 'HEAD' })
            .then(() => {
                this.isOnline = true;
                this.handleOnlineStatus();
            })
            .catch(() => {
                this.isOnline = false;
                this.handleOfflineStatus();
            });
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallPrompt();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            this.hideInstallPrompt();
            this.showInstallSuccessMessage();
        });
    }

    showInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt && !localStorage.getItem('installPromptDismissed')) {
            prompt.style.display = 'flex';
        }
    }

    hideInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    async installApp() {
        if (this.installPrompt) {
            const result = await this.installPrompt.prompt();
            console.log('Install prompt result:', result);
            this.installPrompt = null;
            this.hideInstallPrompt();
        }
    }

    dismissInstallPrompt() {
        this.hideInstallPrompt();
        localStorage.setItem('installPromptDismissed', 'true');
    }

    showInstallSuccessMessage() {
        const toast = document.createElement('div');
        toast.className = 'pwa-toast success';
        toast.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>App installed successfully!</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupCaching() {
        // Cache critical resources
        this.cacheResources([
            '/',
            '/static/css/style.css',
            '/static/css/dark-mode.css',
            '/static/js/theme-toggle.js',
            '/static/js/main.js',
            '/learn',
            '/workshops',
            '/tutorials'
        ]);
    }

    async cacheResources(urls) {
        if ('caches' in window) {
            try {
                const cache = await caches.open('visual-llm-v1');
                // Cache resources individually to handle 404s gracefully
                const cachePromises = urls.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response);
                        } else {
                            console.warn(`Failed to cache ${url}: ${response.status}`);
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch ${url}:`, error.message);
                    }
                });
                await Promise.all(cachePromises);
                console.log('Resources cached successfully');
            } catch (error) {
                console.error('Caching failed:', error);
            }
        }
    }

    enableOfflineMode() {
        // Disable features that require internet
        const onlineOnlyElements = document.querySelectorAll('[data-requires-online]');
        onlineOnlyElements.forEach(element => {
            element.disabled = true;
            element.title = 'This feature requires an internet connection';
        });

        // Enable offline features
        this.enableOfflineQuizzes();
        this.enableOfflineNotes();
    }

    enableOnlineFeatures() {
        // Re-enable online features
        const onlineOnlyElements = document.querySelectorAll('[data-requires-online]');
        onlineOnlyElements.forEach(element => {
            element.disabled = false;
            element.title = '';
        });
    }

    enableOfflineQuizzes() {
        // Load cached quiz data
        const cachedQuizzes = this.getFromCache('quizzes');
        if (cachedQuizzes) {
            this.displayOfflineQuizzes(cachedQuizzes);
        }
    }

    enableOfflineNotes() {
        // Enable local note-taking
        const noteElements = document.querySelectorAll('.note-input');
        noteElements.forEach(element => {
            element.addEventListener('input', (e) => {
                this.saveToLocalStorage('notes', e.target.value);
            });
        });
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Register for background sync
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            });
        }
    }

    queueForSync(data) {
        this.syncQueue.push({
            ...data,
            timestamp: Date.now(),
            id: this.generateSyncId()
        });

        this.saveToLocalStorage('syncQueue', this.syncQueue);

        if (this.isOnline) {
            this.processSyncQueue();
        }
    }

    async processSyncQueue() {
        while (this.syncQueue.length > 0 && this.isOnline) {
            const item = this.syncQueue.shift();

            try {
                await this.syncItem(item);
                console.log('Synced item:', item.id);
            } catch (error) {
                console.error('Sync failed for item:', item.id, error);
                // Re-queue the item
                this.syncQueue.unshift(item);
                break;
            }
        }

        this.saveToLocalStorage('syncQueue', this.syncQueue);
    }

    async syncItem(item) {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error('Sync failed');
        }

        return response.json();
    }

    async syncOfflineData() {
        // Sync any offline changes when coming back online
        const offlineData = this.getFromLocalStorage('offlineData') || [];

        for (const data of offlineData) {
            try {
                await this.syncItem(data);
            } catch (error) {
                console.error('Failed to sync offline data:', error);
            }
        }

        // Clear synced data
        this.saveToLocalStorage('offlineData', []);
    }

    setupNotifications() {
        if ('Notification' in window) {
            // Request permission for notifications
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/static/images/icon-192x192.png',
                badge: '/static/images/badge-72x72.png',
                ...options
            });
        }
    }

    // Utility methods
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return null;
        }
    }

    getFromCache(key) {
        return this.getFromLocalStorage(`cache_${key}`);
    }

    saveToCache(key, data) {
        this.saveToLocalStorage(`cache_${key}`, data);
    }

    generateSyncId() {
        return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupMessageChannel() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                console.log('Cache updated by service worker');
            }
        });
    }
}

// Initialize PWA support
let pwaSupport;
document.addEventListener('DOMContentLoaded', () => {
    pwaSupport = new PWASupport();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWASupport;
}
