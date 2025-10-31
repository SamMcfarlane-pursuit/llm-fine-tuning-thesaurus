/**
 * Specific Back Button Fix
 * Provides enhanced back button functionality with smart navigation
 */

class SpecificBackButtonFix {
    constructor() {
        this.state = {
            navigationHistory: [],
            currentPage: window.location.pathname,
            previousPage: null,
            backButtonElements: [],
            isNavigating: false,
            customBackHandlers: new Map(),
            preventDefaultBack: false
        };
        
        this.init();
    }

    init() {
        this.setupNavigationTracking();
        this.findBackButtons();
        this.setupBackButtonHandlers();
        this.setupBrowserBackButton();
        this.setupKeyboardShortcuts();
        this.bindEvents();
    }

    setupNavigationTracking() {
        // Track initial page load
        this.state.navigationHistory.push({
            url: window.location.href,
            pathname: window.location.pathname,
            timestamp: Date.now(),
            title: document.title,
            scrollPosition: { x: 0, y: 0 }
        });

        // Track navigation changes
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        // Override pushState and replaceState to track programmatic navigation
        this.overrideHistoryMethods();
    }

    overrideHistoryMethods() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            originalPushState.apply(history, args);
            this.trackNavigation('push');
        };

        history.replaceState = (...args) => {
            originalReplaceState.apply(history, args);
            this.trackNavigation('replace');
        };
    }

    trackNavigation(type = 'unknown') {
        const currentEntry = {
            url: window.location.href,
            pathname: window.location.pathname,
            timestamp: Date.now(),
            title: document.title,
            scrollPosition: { x: window.scrollX, y: window.scrollY },
            navigationType: type
        };

        if (type === 'push') {
            this.state.navigationHistory.push(currentEntry);
        } else if (type === 'replace') {
            this.state.navigationHistory[this.state.navigationHistory.length - 1] = currentEntry;
        }

        // Keep history manageable (last 50 entries)
        if (this.state.navigationHistory.length > 50) {
            this.state.navigationHistory = this.state.navigationHistory.slice(-50);
        }

        this.state.previousPage = this.state.currentPage;
        this.state.currentPage = window.location.pathname;
        this.updateBackButtonStates();
    }

    findBackButtons() {
        const selectors = [
            '[data-back-button]',
            '.back-button',
            '.btn-back',
            'button[aria-label*="back" i]',
            'button[title*="back" i]',
            'a[href="javascript:history.back()"]',
            'a[onclick*="history.back"]'
        ];

        this.state.backButtonElements = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!this.state.backButtonElements.includes(element)) {
                    this.state.backButtonElements.push(element);
                }
            });
        });
    }

    setupBackButtonHandlers() {
        this.state.backButtonElements.forEach(button => {
            button.addEventListener('click', (event) => {
                this.handleBackButtonClick(event, button);
            });

            // Add visual feedback
            this.enhanceBackButton(button);
        });
    }

    enhanceBackButton(button) {
        // Add accessibility attributes
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', 'Go back to previous page');
        }

        // Add keyboard support
        button.setAttribute('tabindex', '0');
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });

        // Add visual states
        button.classList.add('enhanced-back-button');
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateX(-2px)';
            button.style.transition = 'transform 0.2s ease';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateX(0)';
        });
    }

    handleBackButtonClick(event, button) {
        event.preventDefault();
        
        if (this.state.isNavigating) {
            return; // Prevent double-clicks
        }

        this.state.isNavigating = true;

        // Check for custom handler
        const customHandler = this.state.customBackHandlers.get(button);
        if (customHandler) {
            const result = customHandler(event, button);
            if (result === false) {
                this.state.isNavigating = false;
                return; // Custom handler prevented default behavior
            }
        }

        // Determine the best back navigation
        this.performSmartBack();

        setTimeout(() => {
            this.state.isNavigating = false;
        }, 500);
    }

    performSmartBack() {
        const canGoBack = this.canGoBack();
        
        if (!canGoBack) {
            // No valid back navigation, go to home or default page
            this.goToFallbackPage();
            return;
        }

        // Check if we have internal navigation history
        if (this.state.navigationHistory.length > 1) {
            const previousEntry = this.state.navigationHistory[this.state.navigationHistory.length - 2];
            
            // If the previous page is from the same domain, use it
            if (this.isSameDomain(previousEntry.url)) {
                this.navigateToHistoryEntry(previousEntry);
                return;
            }
        }

        // Fallback to browser back
        try {
            window.history.back();
        } catch (error) {
            console.warn('Browser back failed:', error);
            this.goToFallbackPage();
        }
    }

    canGoBack() {
        return window.history.length > 1;
    }

    isSameDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    navigateToHistoryEntry(entry) {
        // Remove current entry from history
        this.state.navigationHistory.pop();
        
        // Navigate to the previous entry
        window.location.href = entry.url;
    }

    goToFallbackPage() {
        // Define fallback pages in order of preference
        const fallbackPages = [
            '/',
            '/home',
            '/index.html',
            '/dashboard'
        ];

        for (const page of fallbackPages) {
            if (page !== window.location.pathname) {
                window.location.href = page;
                return;
            }
        }

        // If all else fails, reload the current page
        window.location.reload();
    }

    setupBrowserBackButton() {
        window.addEventListener('popstate', (event) => {
            if (this.state.preventDefaultBack) {
                event.preventDefault();
                // Handle custom back behavior
                this.handleCustomBack(event);
            }
        });
    }

    handlePopState(event) {
        // Update current page tracking
        this.state.previousPage = this.state.currentPage;
        this.state.currentPage = window.location.pathname;
        
        // Restore scroll position if available
        if (event.state && event.state.scrollPosition) {
            setTimeout(() => {
                window.scrollTo(event.state.scrollPosition.x, event.state.scrollPosition.y);
            }, 100);
        }

        this.updateBackButtonStates();
    }

    handleCustomBack(event) {
        // Implement custom back logic here
        console.log('Custom back navigation triggered');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Alt + Left Arrow (common back shortcut)
            if (event.altKey && event.key === 'ArrowLeft') {
                event.preventDefault();
                this.performSmartBack();
            }

            // Backspace (when not in input fields)
            if (event.key === 'Backspace' && !this.isInInputField(event.target)) {
                event.preventDefault();
                this.performSmartBack();
            }
        });
    }

    isInInputField(element) {
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(element.tagName) || element.contentEditable === 'true';
    }

    updateBackButtonStates() {
        const canGoBack = this.canGoBack();
        
        this.state.backButtonElements.forEach(button => {
            if (canGoBack) {
                button.removeAttribute('disabled');
                button.classList.remove('disabled');
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            } else {
                button.setAttribute('disabled', 'true');
                button.classList.add('disabled');
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            }
        });
    }

    bindEvents() {
        // Monitor for new back buttons added to the DOM
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            this.findBackButtons();
                            this.setupBackButtonHandlers();
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateBackButtonStates();
            }
        });

        // Track beforeunload to save scroll position
        window.addEventListener('beforeunload', () => {
            if (this.state.navigationHistory.length > 0) {
                const currentEntry = this.state.navigationHistory[this.state.navigationHistory.length - 1];
                currentEntry.scrollPosition = { x: window.scrollX, y: window.scrollY };
            }
        });
    }

    // Public API methods
    addCustomBackHandler(button, handler) {
        if (button && typeof handler === 'function') {
            this.state.customBackHandlers.set(button, handler);
        }
    }

    removeCustomBackHandler(button) {
        this.state.customBackHandlers.delete(button);
    }

    setPreventDefaultBack(prevent) {
        this.state.preventDefaultBack = prevent;
    }

    getNavigationHistory() {
        return [...this.state.navigationHistory];
    }

    clearNavigationHistory() {
        this.state.navigationHistory = [{
            url: window.location.href,
            pathname: window.location.pathname,
            timestamp: Date.now(),
            title: document.title,
            scrollPosition: { x: window.scrollX, y: window.scrollY }
        }];
    }

    forceBack() {
        this.performSmartBack();
    }

    addBackButton(element) {
        if (element && !this.state.backButtonElements.includes(element)) {
            this.state.backButtonElements.push(element);
            this.enhanceBackButton(element);
            element.addEventListener('click', (event) => {
                this.handleBackButtonClick(event, element);
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.specificBackButtonFix = new SpecificBackButtonFix();
    });
} else {
    window.specificBackButtonFix = new SpecificBackButtonFix();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpecificBackButtonFix;
}