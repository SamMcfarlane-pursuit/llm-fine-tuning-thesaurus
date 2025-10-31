// Absolute Banner Visibility Fix
// Advanced banner positioning and visibility management

(function() {
    'use strict';

    // Configuration
    const config = {
        bannerSelectors: [
            '.banner',
            '.hero-banner',
            '.promo-banner',
            '.notification-banner',
            '.alert-banner',
            '.top-banner',
            '.sticky-banner',
            '[data-banner]',
            '.banner-container'
        ],
        visibilityThreshold: 0.1,
        scrollThreshold: 100,
        animationDuration: 300,
        zIndexBase: 1000,
        enableAutoHide: true,
        enableStickyBehavior: true,
        enableResponsiveAdjustments: true,
        debugMode: false
    };

    // State management
    let state = {
        banners: new Map(),
        scrollPosition: 0,
        isScrolling: false,
        observer: null,
        resizeObserver: null,
        isInitialized: false,
        hiddenBanners: new Set(),
        stickyBanners: new Set()
    };

    // Add banner styles
    function addBannerStyles() {
        const style = document.createElement('style');
        style.id = 'absolute-banner-visibility-styles';
        style.textContent = `
            /* Absolute Banner Visibility Fix Styles */
            .banner-fixed {
                position: fixed !important;
                top: 0;
                left: 0;
                right: 0;
                z-index: ${config.zIndexBase};
                transform: translateY(0);
                transition: transform ${config.animationDuration}ms ease-in-out,
                           opacity ${config.animationDuration}ms ease-in-out;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .banner-sticky {
                position: sticky !important;
                top: 0;
                z-index: ${config.zIndexBase - 1};
                transition: all ${config.animationDuration}ms ease-in-out;
            }
            
            .banner-absolute {
                position: absolute !important;
                top: 0;
                left: 0;
                right: 0;
                z-index: ${config.zIndexBase - 2};
            }
            
            .banner-hidden {
                transform: translateY(-100%) !important;
                opacity: 0 !important;
                pointer-events: none;
            }
            
            .banner-visible {
                transform: translateY(0) !important;
                opacity: 1 !important;
                pointer-events: auto;
            }
            
            .banner-sliding-up {
                animation: bannerSlideUp ${config.animationDuration}ms ease-out;
            }
            
            .banner-sliding-down {
                animation: bannerSlideDown ${config.animationDuration}ms ease-out;
            }
            
            @keyframes bannerSlideUp {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100%);
                    opacity: 0;
                }
            }
            
            @keyframes bannerSlideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .banner-overlay {
                position: relative;
                z-index: 1;
            }
            
            .banner-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity ${config.animationDuration}ms ease-in-out;
                pointer-events: none;
                z-index: -1;
            }
            
            .banner-backdrop.active {
                opacity: 1;
                pointer-events: auto;
            }
            
            .banner-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                z-index: 10;
            }
            
            .banner-control-btn {
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                background: rgba(255,255,255,0.9);
                color: #333;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            .banner-control-btn:hover {
                background: white;
                transform: scale(1.1);
            }
            
            .banner-minimize {
                transform: translateY(-50%);
                opacity: 0.7;
            }
            
            .banner-minimize:hover {
                opacity: 1;
            }
            
            .banner-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transform-origin: left;
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }
            
            .banner-progress.active {
                transform: scaleX(1);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .banner-fixed,
                .banner-sticky {
                    position: relative !important;
                    transform: none !important;
                }
                
                .banner-controls {
                    top: 5px;
                    right: 5px;
                }
                
                .banner-control-btn {
                    width: 25px;
                    height: 25px;
                    font-size: 12px;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .banner-fixed,
                .banner-sticky {
                    border: 2px solid currentColor;
                }
                
                .banner-control-btn {
                    background: white;
                    border: 1px solid #333;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .banner-fixed,
                .banner-sticky,
                .banner-absolute,
                .banner-control-btn,
                .banner-backdrop,
                .banner-progress {
                    transition: none !important;
                    animation: none !important;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .banner-control-btn {
                    background: rgba(0,0,0,0.9);
                    color: white;
                }
                
                .banner-control-btn:hover {
                    background: black;
                }
            }
            
            /* Print styles */
            @media print {
                .banner-fixed,
                .banner-sticky {
                    position: static !important;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                .banner-controls,
                .banner-backdrop {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Debug logging
    function debug(...args) {
        if (config.debugMode) {
            console.log('[Banner Visibility]', ...args);
        }
    }

    // Get banner info
    function getBannerInfo(banner) {
        const rect = banner.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(banner);
        
        return {
            element: banner,
            rect: rect,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            isVisible: rect.top < window.innerHeight && rect.bottom > 0,
            isInViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
            distanceFromTop: rect.top,
            height: rect.height
        };
    }

    // Setup banner controls
    function setupBannerControls(banner) {
        if (banner.querySelector('.banner-controls')) {
            return; // Already setup
        }
        
        const controls = document.createElement('div');
        controls.className = 'banner-controls';
        controls.innerHTML = `
            <button class="banner-control-btn" data-action="minimize" title="Minimize">−</button>
            <button class="banner-control-btn" data-action="close" title="Close">×</button>
            <button class="banner-control-btn" data-action="pin" title="Pin/Unpin">📌</button>
        `;
        
        banner.style.position = 'relative';
        banner.appendChild(controls);
        
        // Setup control events
        controls.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            handleBannerAction(banner, action);
        });
    }

    // Handle banner actions
    function handleBannerAction(banner, action) {
        debug('Banner action:', action, banner);
        
        switch (action) {
            case 'minimize':
                toggleBannerMinimize(banner);
                break;
            case 'close':
                closeBanner(banner);
                break;
            case 'pin':
                toggleBannerPin(banner);
                break;
        }
    }

    // Toggle banner minimize
    function toggleBannerMinimize(banner) {
        const isMinimized = banner.classList.contains('banner-minimize');
        
        if (isMinimized) {
            banner.classList.remove('banner-minimize');
            banner.style.height = '';
            state.hiddenBanners.delete(banner);
        } else {
            banner.classList.add('banner-minimize');
            banner.style.height = '40px';
            state.hiddenBanners.add(banner);
        }
        
        // Update other banners' positions
        updateBannerPositions();
    }

    // Close banner
    function closeBanner(banner) {
        banner.classList.add('banner-sliding-up');
        
        setTimeout(() => {
            banner.style.display = 'none';
            state.banners.delete(banner);
            state.hiddenBanners.add(banner);
            updateBannerPositions();
        }, config.animationDuration);
    }

    // Toggle banner pin
    function toggleBannerPin(banner) {
        const isPinned = state.stickyBanners.has(banner);
        
        if (isPinned) {
            state.stickyBanners.delete(banner);
            banner.classList.remove('banner-sticky');
            banner.classList.add('banner-absolute');
        } else {
            state.stickyBanners.add(banner);
            banner.classList.remove('banner-absolute');
            banner.classList.add('banner-sticky');
        }
        
        updateBannerPositions();
    }

    // Update banner positions
    function updateBannerPositions() {
        let topOffset = 0;
        
        state.banners.forEach((info, banner) => {
            if (state.hiddenBanners.has(banner)) {
                return;
            }
            
            const bannerInfo = getBannerInfo(banner);
            
            if (banner.classList.contains('banner-fixed')) {
                banner.style.top = topOffset + 'px';
                topOffset += bannerInfo.height;
            }
        });
        
        // Adjust body padding to account for fixed banners
        document.body.style.paddingTop = topOffset + 'px';
    }

    // Setup intersection observer
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }
        
        state.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const banner = entry.target;
                const isVisible = entry.isIntersecting;
                
                debug('Banner visibility changed:', banner, isVisible);
                
                if (isVisible) {
                    banner.classList.add('banner-visible');
                    banner.classList.remove('banner-hidden');
                } else if (config.enableAutoHide) {
                    banner.classList.add('banner-hidden');
                    banner.classList.remove('banner-visible');
                }
                
                state.banners.set(banner, getBannerInfo(banner));
            });
        }, {
            threshold: config.visibilityThreshold,
            rootMargin: '0px'
        });
    }

    // Setup resize observer
    function setupResizeObserver() {
        if (!('ResizeObserver' in window)) {
            return;
        }
        
        state.resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const banner = entry.target;
                state.banners.set(banner, getBannerInfo(banner));
            });
            
            updateBannerPositions();
        });
    }

    // Handle scroll events
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        const scrollDirection = currentScroll > state.scrollPosition ? 'down' : 'up';
        
        state.scrollPosition = currentScroll;
        
        if (!state.isScrolling) {
            state.isScrolling = true;
            
            state.banners.forEach((info, banner) => {
                if (config.enableAutoHide && !state.stickyBanners.has(banner)) {
                    if (scrollDirection === 'down' && currentScroll > config.scrollThreshold) {
                        banner.classList.add('banner-hidden');
                        banner.classList.remove('banner-visible');
                    } else if (scrollDirection === 'up') {
                        banner.classList.add('banner-visible');
                        banner.classList.remove('banner-hidden');
                    }
                }
            });
            
            // Reset scrolling flag
            setTimeout(() => {
                state.isScrolling = false;
            }, 100);
        }
    }

    // Process banner
    function processBanner(banner) {
        if (state.banners.has(banner)) {
            return;
        }
        
        debug('Processing banner:', banner);
        
        const info = getBannerInfo(banner);
        state.banners.set(banner, info);
        
        // Determine positioning strategy
        const shouldBeFixed = banner.dataset.position === 'fixed' || 
                             banner.classList.contains('fixed') ||
                             info.position === 'fixed';
        
        const shouldBeSticky = banner.dataset.position === 'sticky' || 
                              banner.classList.contains('sticky') ||
                              config.enableStickyBehavior;
        
        // Apply positioning
        if (shouldBeFixed) {
            banner.classList.add('banner-fixed');
            state.stickyBanners.add(banner);
        } else if (shouldBeSticky) {
            banner.classList.add('banner-sticky');
        } else {
            banner.classList.add('banner-absolute');
        }
        
        // Setup controls
        setupBannerControls(banner);
        
        // Add to observers
        if (state.observer) {
            state.observer.observe(banner);
        }
        
        if (state.resizeObserver) {
            state.resizeObserver.observe(banner);
        }
        
        // Add progress bar for timed banners
        if (banner.dataset.timeout) {
            addProgressBar(banner, parseInt(banner.dataset.timeout));
        }
    }

    // Add progress bar
    function addProgressBar(banner, timeout) {
        const progress = document.createElement('div');
        progress.className = 'banner-progress';
        banner.appendChild(progress);
        
        // Animate progress
        setTimeout(() => {
            progress.classList.add('active');
            progress.style.transition = `transform ${timeout}ms linear`;
        }, 100);
        
        // Auto-close after timeout
        setTimeout(() => {
            closeBanner(banner);
        }, timeout);
    }

    // Find and process banners
    function findAndProcessBanners() {
        config.bannerSelectors.forEach(selector => {
            const banners = document.querySelectorAll(selector);
            banners.forEach(processBanner);
        });
        
        updateBannerPositions();
    }

    // Setup mutation observer for dynamic content
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node itself is a banner
                        config.bannerSelectors.forEach(selector => {
                            if (node.matches && node.matches(selector)) {
                                processBanner(node);
                            }
                        });
                        
                        // Check for banners within the node
                        config.bannerSelectors.forEach(selector => {
                            const banners = node.querySelectorAll && node.querySelectorAll(selector);
                            if (banners) {
                                banners.forEach(processBanner);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Handle window resize
    function handleResize() {
        if (config.enableResponsiveAdjustments) {
            updateBannerPositions();
        }
    }

    // Initialize the system
    function init() {
        if (state.isInitialized) {
            return;
        }
        
        debug('Initializing banner visibility system');
        
        addBannerStyles();
        setupIntersectionObserver();
        setupResizeObserver();
        findAndProcessBanners();
        setupMutationObserver();
        
        // Setup event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        
        state.isInitialized = true;
        
        // Dispatch initialization event
        document.dispatchEvent(new CustomEvent('bannerVisibilityInitialized', {
            detail: {
                bannerCount: state.banners.size,
                config: config
            }
        }));
        
        debug('Banner visibility system initialized');
    }

    // Public API
    window.BannerVisibilityFix = {
        init,
        processBanner,
        updateBannerPositions,
        config,
        state
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();