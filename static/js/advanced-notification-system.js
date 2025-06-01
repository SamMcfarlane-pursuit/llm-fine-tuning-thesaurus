/**
 * Advanced Notification System
 * Provides intelligent notifications, alerts, and real-time updates
 */

class AdvancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.notificationQueue = [];
        this.settings = {
            enabled: true,
            sound: true,
            desktop: true,
            email: false,
            frequency: 'normal'
        };
        this.channels = new Map();
        this.templates = new Map();
        this.init();
    }

    init() {
        this.createNotificationUI();
        this.setupEventListeners();
        this.loadSettings();
        this.initializeChannels();
        this.setupTemplates();
        this.requestPermissions();
        this.startNotificationProcessor();
    }

    createNotificationUI() {
        const notificationHTML = `
            <div id="notification-center" class="notification-center">
                <div class="notification-header">
                    <h5><i class="bi bi-bell"></i> Notifications</h5>
                    <div class="notification-controls">
                        <button class="btn btn-sm btn-outline-light" id="mark-all-read">
                            <i class="bi bi-check-all"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light" id="notification-settings">
                            <i class="bi bi-gear"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light" id="toggle-notifications">
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                </div>

                <div class="notification-content">
                    <div class="notification-filters">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="unread">Unread</button>
                        <button class="filter-btn" data-filter="important">Important</button>
                        <button class="filter-btn" data-filter="system">System</button>
                    </div>

                    <div class="notifications-list"></div>
                </div>
            </div>

            <div id="notification-toast-container" class="toast-container"></div>

            <div id="notification-settings-modal" class="notification-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5>Notification Settings</h5>
                        <button class="btn btn-sm btn-outline-secondary" onclick="notificationSystem.closeSettings()">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="enable-notifications" checked>
                                Enable Notifications
                            </label>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="enable-sound" checked>
                                Sound Notifications
                            </label>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="enable-desktop" checked>
                                Desktop Notifications
                            </label>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="enable-email">
                                Email Notifications
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>Notification Frequency:</label>
                            <select id="notification-frequency" class="form-select">
                                <option value="minimal">Minimal</option>
                                <option value="normal" selected>Normal</option>
                                <option value="all">All Updates</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('notification-center')) {
            document.body.insertAdjacentHTML('beforeend', notificationHTML);
        }
    }

    setupEventListeners() {
        // Toggle notification center
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toggle-notifications') {
                this.toggleNotificationCenter();
            }

            if (e.target.id === 'mark-all-read') {
                this.markAllAsRead();
            }

            if (e.target.id === 'notification-settings') {
                this.openSettings();
            }
        });

        // Filter notifications
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.filterNotifications(e.target.dataset.filter);
            }
        });

        // Settings changes
        document.addEventListener('change', (e) => {
            if (e.target.id.startsWith('enable-') || e.target.id === 'notification-frequency') {
                this.updateSettings();
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.toggleNotificationCenter();
            }
        });
    }

    initializeChannels() {
        // Define notification channels
        this.channels.set('system', {
            name: 'System',
            priority: 'high',
            sound: true,
            desktop: true,
            color: '#dc3545'
        });

        this.channels.set('learning', {
            name: 'Learning Progress',
            priority: 'medium',
            sound: false,
            desktop: true,
            color: '#28a745'
        });

        this.channels.set('collaboration', {
            name: 'Collaboration',
            priority: 'medium',
            sound: true,
            desktop: true,
            color: '#007bff'
        });

        this.channels.set('achievements', {
            name: 'Achievements',
            priority: 'low',
            sound: true,
            desktop: false,
            color: '#ffc107'
        });

        this.channels.set('updates', {
            name: 'Updates',
            priority: 'low',
            sound: false,
            desktop: false,
            color: '#6f42c1'
        });
    }

    setupTemplates() {
        // Define notification templates
        this.templates.set('quiz_completed', {
            title: 'Quiz Completed!',
            body: 'You scored {score}% on the {topic} quiz',
            icon: 'bi-trophy',
            channel: 'learning',
            actions: [
                { action: 'view_results', title: 'View Results' },
                { action: 'next_quiz', title: 'Next Quiz' }
            ]
        });

        this.templates.set('workshop_progress', {
            title: 'Workshop Progress',
            body: 'You completed step {step} of {total} in {workshop}',
            icon: 'bi-check-circle',
            channel: 'learning'
        });

        this.templates.set('collaboration_invite', {
            title: 'Collaboration Invite',
            body: '{user} invited you to collaborate on {document}',
            icon: 'bi-people',
            channel: 'collaboration',
            actions: [
                { action: 'accept', title: 'Accept' },
                { action: 'decline', title: 'Decline' }
            ]
        });

        this.templates.set('achievement_unlocked', {
            title: 'Achievement Unlocked!',
            body: 'You earned the "{achievement}" badge',
            icon: 'bi-award',
            channel: 'achievements',
            actions: [
                { action: 'view_badge', title: 'View Badge' }
            ]
        });

        this.templates.set('system_update', {
            title: 'System Update',
            body: '{message}',
            icon: 'bi-info-circle',
            channel: 'system'
        });
    }

    async requestPermissions() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                this.settings.desktop = permission === 'granted';
                this.saveSettings();
            }
        }
    }

    createNotification(type, data = {}, options = {}) {
        const template = this.templates.get(type);
        if (!template) {
            console.error('Unknown notification type:', type);
            return;
        }

        const notification = {
            id: this.generateNotificationId(),
            type: type,
            title: this.interpolateTemplate(template.title, data),
            body: this.interpolateTemplate(template.body, data),
            icon: template.icon,
            channel: template.channel,
            timestamp: Date.now(),
            read: false,
            important: options.important || false,
            actions: template.actions || [],
            data: data,
            ...options
        };

        this.addNotification(notification);
        return notification;
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.updateNotificationsList();
        this.showToast(notification);

        if (this.settings.desktop && this.shouldShowDesktop(notification)) {
            this.showDesktopNotification(notification);
        }

        if (this.settings.sound && this.shouldPlaySound(notification)) {
            this.playNotificationSound(notification);
        }

        // Trigger analytics
        this.trackNotification(notification);
    }

    interpolateTemplate(template, data) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${notification.channel}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-header">
                    <i class="${notification.icon}"></i>
                    <strong>${notification.title}</strong>
                    <button class="toast-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="toast-body">${notification.body}</div>
                ${notification.actions.length > 0 ? `
                    <div class="toast-actions">
                        ${notification.actions.map(action => `
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="notificationSystem.handleAction('${notification.id}', '${action.action}')">
                                ${action.title}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        const container = document.getElementById('notification-toast-container');
        container.appendChild(toast);

        // Auto-remove after delay
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, this.getToastDuration(notification));
    }

    showDesktopNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const desktopNotification = new Notification(notification.title, {
                body: notification.body,
                icon: '/static/images/icon-192x192.png',
                badge: '/static/images/badge-72x72.png',
                tag: notification.id,
                data: notification.data,
                actions: notification.actions.map(action => ({
                    action: action.action,
                    title: action.title
                }))
            });

            desktopNotification.onclick = () => {
                this.handleNotificationClick(notification);
                desktopNotification.close();
            };
        }
    }

    playNotificationSound(notification) {
        const channel = this.channels.get(notification.channel);
        if (channel && channel.sound) {
            const audio = new Audio('/static/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Could not play notification sound:', e));
        }
    }

    updateNotificationsList() {
        const container = document.querySelector('.notifications-list');
        if (!container) return;

        const filteredNotifications = this.getFilteredNotifications();

        container.innerHTML = filteredNotifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} ${notification.important ? 'important' : ''}"
                 data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h6>${notification.title}</h6>
                        <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                    </div>
                    <p>${notification.body}</p>
                    ${notification.actions.length > 0 ? `
                        <div class="notification-actions">
                            ${notification.actions.map(action => `
                                <button class="btn btn-sm btn-outline-primary"
                                        onclick="notificationSystem.handleAction('${notification.id}', '${action.action}')">
                                    ${action.title}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="notification-dismiss" onclick="notificationSystem.dismissNotification('${notification.id}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');

        this.updateNotificationBadge();
    }

    getFilteredNotifications() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

        switch (activeFilter) {
            case 'unread':
                return this.notifications.filter(n => !n.read);
            case 'important':
                return this.notifications.filter(n => n.important);
            case 'system':
                return this.notifications.filter(n => n.channel === 'system');
            default:
                return this.notifications;
        }
    }

    handleAction(notificationId, action) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        notification.read = true;
        this.updateNotificationsList();

        // Handle specific actions
        switch (action) {
            case 'view_results':
                window.location.href = '/quiz/results';
                break;
            case 'next_quiz':
                window.location.href = '/quiz';
                break;
            case 'accept':
                this.handleCollaborationAccept(notification.data);
                break;
            case 'decline':
                this.handleCollaborationDecline(notification.data);
                break;
            case 'view_badge':
                window.location.href = '/achievements';
                break;
        }

        this.trackNotificationAction(notification, action);
    }

    handleNotificationClick(notification) {
        notification.read = true;
        this.updateNotificationsList();

        // Default click behavior based on type
        switch (notification.type) {
            case 'quiz_completed':
                window.location.href = '/quiz/results';
                break;
            case 'workshop_progress':
                window.location.href = '/workshops';
                break;
            case 'collaboration_invite':
                window.location.href = '/collaboration';
                break;
        }
    }

    dismissNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationsList();
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationsList();
    }

    filterNotifications(filter) {
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.updateNotificationsList();
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');

        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    // Utility methods
    generateNotificationId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return Math.floor(diff / 86400000) + 'd ago';
    }

    getToastDuration(notification) {
        const channel = this.channels.get(notification.channel);
        switch (channel?.priority) {
            case 'high': return 8000;
            case 'medium': return 5000;
            default: return 3000;
        }
    }

    shouldShowDesktop(notification) {
        const channel = this.channels.get(notification.channel);
        return channel?.desktop && this.settings.desktop;
    }

    shouldPlaySound(notification) {
        const channel = this.channels.get(notification.channel);
        return channel?.sound && this.settings.sound;
    }

    toggleNotificationCenter() {
        const center = document.getElementById('notification-center');
        center.classList.toggle('open');
    }

    openSettings() {
        document.getElementById('notification-settings-modal').style.display = 'flex';
    }

    closeSettings() {
        document.getElementById('notification-settings-modal').style.display = 'none';
    }

    updateSettings() {
        this.settings = {
            enabled: document.getElementById('enable-notifications').checked,
            sound: document.getElementById('enable-sound').checked,
            desktop: document.getElementById('enable-desktop').checked,
            email: document.getElementById('enable-email').checked,
            frequency: document.getElementById('notification-frequency').value
        };

        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    applySettings() {
        document.getElementById('enable-notifications').checked = this.settings.enabled;
        document.getElementById('enable-sound').checked = this.settings.sound;
        document.getElementById('enable-desktop').checked = this.settings.desktop;
        document.getElementById('enable-email').checked = this.settings.email;
        document.getElementById('notification-frequency').value = this.settings.frequency;
    }

    startNotificationProcessor() {
        // Process queued notifications
        setInterval(() => {
            this.processNotificationQueue();
        }, 1000);
    }

    processNotificationQueue() {
        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            this.addNotification(notification);
        }
    }

    trackNotification(notification) {
        // Analytics tracking
        if (typeof advancedTracker !== 'undefined') {
            advancedTracker.trackInteraction('notification_shown', {
                type: notification.type,
                channel: notification.channel
            });
        }
    }

    trackNotificationAction(notification, action) {
        // Analytics tracking
        if (typeof advancedTracker !== 'undefined') {
            advancedTracker.trackInteraction('notification_action', {
                type: notification.type,
                action: action
            });
        }
    }
}

// Initialize notification system - now integrated with AI Assistant
let notificationSystem;
document.addEventListener('DOMContentLoaded', () => {
    // Check if AI Assistant is available and use its notification system
    if (window.aiAssistant && window.aiAssistant.isInitialized) {
        notificationSystem = window.aiAssistant;
        console.log('Using AI Assistant notification system');
    } else {
        // Fallback to standalone notification system if AI Assistant is not available
        notificationSystem = new AdvancedNotificationSystem();
        console.log('Using standalone notification system');
    }
});

// Global function to create notifications that works with both systems
window.createNotification = function(type, data = {}, options = {}) {
    if (window.aiAssistant && window.aiAssistant.isInitialized) {
        // Use AI Assistant notification system
        const notification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: data.title || 'Notification',
            body: data.body || data.message || '',
            icon: data.icon || 'bi bi-info-circle',
            type: type,
            timestamp: Date.now(),
            read: false,
            important: options.important || false,
            actions: data.actions || [],
            ...options
        };
        window.aiAssistant.addNotification(notification);
        return notification;
    } else if (notificationSystem && notificationSystem.createNotification) {
        // Use standalone notification system
        return notificationSystem.createNotification(type, data, options);
    } else {
        console.warn('No notification system available');
        return null;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedNotificationSystem;
}
