// Improved Accessibility Controls
// Enhances accessibility features and provides user controls for better usability

(function() {
    'use strict';

    // Configuration
    const config = {
        controlsId: 'accessibility-controls',
        panelId: 'accessibility-panel',
        toggleId: 'accessibility-toggle',
        storagePrefix: 'accessibility_',
        animationDuration: 300
    };

    // Accessibility state
    let accessibilityState = {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        focusIndicators: true,
        screenReaderMode: false,
        keyboardNavigation: true,
        colorBlindFriendly: false
    };

    // Add accessibility styles
    function addAccessibilityStyles() {
        const style = document.createElement('style');
        style.id = 'accessibility-styles';
        style.textContent = `
            /* Accessibility Controls Panel */
            #accessibility-controls {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            #accessibility-toggle {
                background: #007bff;
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            #accessibility-toggle:hover {
                background: #0056b3;
                transform: scale(1.1);
            }
            
            #accessibility-toggle:focus {
                outline: 3px solid #ffc107;
                outline-offset: 2px;
            }
            
            #accessibility-panel {
                position: absolute;
                top: 60px;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 20px;
                width: 300px;
                max-height: 400px;
                overflow-y: auto;
                transform: translateY(-10px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            #accessibility-panel.show {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .accessibility-option {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .accessibility-option:hover {
                background-color: #f8f9fa;
            }
            
            .accessibility-option label {
                font-weight: 500;
                cursor: pointer;
                flex: 1;
                margin-right: 10px;
            }
            
            .accessibility-toggle-switch {
                position: relative;
                width: 50px;
                height: 24px;
                background: #ccc;
                border-radius: 12px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .accessibility-toggle-switch.active {
                background: #007bff;
            }
            
            .accessibility-toggle-switch::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .accessibility-toggle-switch.active::after {
                transform: translateX(26px);
            }
            
            .accessibility-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .accessibility-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .accessibility-section h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #333;
            }
            
            .accessibility-description {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
                line-height: 1.4;
            }
            
            /* High Contrast Mode */
            body.high-contrast {
                background: #000 !important;
                color: #fff !important;
            }
            
            body.high-contrast * {
                background-color: #000 !important;
                color: #fff !important;
                border-color: #fff !important;
            }
            
            body.high-contrast a {
                color: #ffff00 !important;
            }
            
            body.high-contrast button,
            body.high-contrast input,
            body.high-contrast select,
            body.high-contrast textarea {
                background: #333 !important;
                color: #fff !important;
                border: 2px solid #fff !important;
            }
            
            /* Large Text Mode */
            body.large-text {
                font-size: 120% !important;
            }
            
            body.large-text h1 { font-size: 2.4em !important; }
            body.large-text h2 { font-size: 2.0em !important; }
            body.large-text h3 { font-size: 1.6em !important; }
            body.large-text h4 { font-size: 1.4em !important; }
            body.large-text h5 { font-size: 1.2em !important; }
            body.large-text h6 { font-size: 1.1em !important; }
            
            /* Reduced Motion */
            body.reduced-motion *,
            body.reduced-motion *::before,
            body.reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            /* Enhanced Focus Indicators */
            body.enhanced-focus *:focus {
                outline: 3px solid #ffc107 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 5px rgba(255, 193, 7, 0.3) !important;
            }
            
            /* Screen Reader Mode */
            body.screen-reader-mode .sr-only {
                position: static !important;
                width: auto !important;
                height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                clip: auto !important;
                white-space: normal !important;
            }
            
            /* Color Blind Friendly */
            body.color-blind-friendly {
                filter: contrast(1.2) saturate(1.3);
            }
            
            /* Keyboard Navigation Helpers */
            .keyboard-nav-helper {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .keyboard-nav-helper.show {
                opacity: 1;
                visibility: visible;
            }
            
            /* Skip Links */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 0 0 4px 4px;
                z-index: 10002;
                transition: top 0.3s ease;
            }
            
            .skip-link:focus {
                top: 0;
            }
            
            /* ARIA Live Region */
            .aria-live-region {
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            }
            
            @media (max-width: 768px) {
                #accessibility-controls {
                    top: 10px;
                    right: 10px;
                }
                
                #accessibility-panel {
                    width: 280px;
                    right: -10px;
                }
                
                #accessibility-toggle {
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Create accessibility controls panel
    function createAccessibilityControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.id = config.controlsId;
        
        controlsContainer.innerHTML = `
            <button id="${config.toggleId}" aria-label="Open accessibility controls" title="Accessibility Options">
                ♿
            </button>
            <div id="${config.panelId}" role="dialog" aria-labelledby="accessibility-title" aria-hidden="true">
                <div class="accessibility-section">
                    <h3 id="accessibility-title">Accessibility Options</h3>
                </div>
                
                <div class="accessibility-section">
                    <h3>Visual</h3>
                    <div class="accessibility-option">
                        <label for="high-contrast-toggle">High Contrast</label>
                        <div class="accessibility-toggle-switch" data-option="highContrast" id="high-contrast-toggle" role="switch" aria-checked="false" tabindex="0">
                        </div>
                        <div class="accessibility-description">Increases contrast for better visibility</div>
                    </div>
                    
                    <div class="accessibility-option">
                        <label for="large-text-toggle">Large Text</label>
                        <div class="accessibility-toggle-switch" data-option="largeText" id="large-text-toggle" role="switch" aria-checked="false" tabindex="0">
                        </div>
                        <div class="accessibility-description">Increases text size for easier reading</div>
                    </div>
                    
                    <div class="accessibility-option">
                        <label for="color-blind-toggle">Color Blind Friendly</label>
                        <div class="accessibility-toggle-switch" data-option="colorBlindFriendly" id="color-blind-toggle" role="switch" aria-checked="false" tabindex="0">
                        </div>
                        <div class="accessibility-description">Adjusts colors for color vision deficiency</div>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h3>Motion & Animation</h3>
                    <div class="accessibility-option">
                        <label for="reduced-motion-toggle">Reduce Motion</label>
                        <div class="accessibility-toggle-switch" data-option="reducedMotion" id="reduced-motion-toggle" role="switch" aria-checked="false" tabindex="0">
                        </div>
                        <div class="accessibility-description">Minimizes animations and transitions</div>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h3>Navigation</h3>
                    <div class="accessibility-option">
                        <label for="focus-indicators-toggle">Enhanced Focus</label>
                        <div class="accessibility-toggle-switch" data-option="focusIndicators" id="focus-indicators-toggle" role="switch" aria-checked="true" tabindex="0">
                        </div>
                        <div class="accessibility-description">Highlights focused elements clearly</div>
                    </div>
                    
                    <div class="accessibility-option">
                        <label for="keyboard-nav-toggle">Keyboard Navigation</label>
                        <div class="accessibility-toggle-switch" data-option="keyboardNavigation" id="keyboard-nav-toggle" role="switch" aria-checked="true" tabindex="0">
                        </div>
                        <div class="accessibility-description">Enables keyboard-only navigation</div>
                    </div>
                    
                    <div class="accessibility-option">
                        <label for="screen-reader-toggle">Screen Reader Mode</label>
                        <div class="accessibility-toggle-switch" data-option="screenReaderMode" id="screen-reader-toggle" role="switch" aria-checked="false" tabindex="0">
                        </div>
                        <div class="accessibility-description">Optimizes for screen reader users</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(controlsContainer);
    }

    // Add skip links
    function addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    // Add ARIA live region
    function addAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.className = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.id = 'aria-live-region';
        
        document.body.appendChild(liveRegion);
    }

    // Announce to screen readers
    function announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Load saved preferences
    function loadPreferences() {
        Object.keys(accessibilityState).forEach(key => {
            const saved = localStorage.getItem(config.storagePrefix + key);
            if (saved !== null) {
                accessibilityState[key] = saved === 'true';
            }
        });
    }

    // Save preferences
    function savePreference(key, value) {
        localStorage.setItem(config.storagePrefix + key, value);
    }

    // Apply accessibility settings
    function applyAccessibilitySettings() {
        const body = document.body;
        
        // High contrast
        body.classList.toggle('high-contrast', accessibilityState.highContrast);
        
        // Large text
        body.classList.toggle('large-text', accessibilityState.largeText);
        
        // Reduced motion
        body.classList.toggle('reduced-motion', accessibilityState.reducedMotion);
        
        // Enhanced focus
        body.classList.toggle('enhanced-focus', accessibilityState.focusIndicators);
        
        // Screen reader mode
        body.classList.toggle('screen-reader-mode', accessibilityState.screenReaderMode);
        
        // Color blind friendly
        body.classList.toggle('color-blind-friendly', accessibilityState.colorBlindFriendly);
        
        // Update toggle states
        updateToggleStates();
    }

    // Update toggle switch states
    function updateToggleStates() {
        Object.keys(accessibilityState).forEach(key => {
            const toggle = document.querySelector(`[data-option="${key}"]`);
            if (toggle) {
                const isActive = accessibilityState[key];
                toggle.classList.toggle('active', isActive);
                toggle.setAttribute('aria-checked', isActive);
            }
        });
    }

    // Handle toggle clicks
    function handleToggleClick(option) {
        accessibilityState[option] = !accessibilityState[option];
        savePreference(option, accessibilityState[option]);
        applyAccessibilitySettings();
        
        const optionName = option.replace(/([A-Z])/g, ' $1').toLowerCase();
        const state = accessibilityState[option] ? 'enabled' : 'disabled';
        announceToScreenReader(`${optionName} ${state}`);
    }

    // Setup event listeners
    function setupEventListeners() {
        const toggle = document.getElementById(config.toggleId);
        const panel = document.getElementById(config.panelId);
        
        // Toggle panel visibility
        toggle.addEventListener('click', () => {
            const isVisible = panel.classList.contains('show');
            panel.classList.toggle('show');
            panel.setAttribute('aria-hidden', isVisible);
            toggle.setAttribute('aria-expanded', !isVisible);
            
            if (!isVisible) {
                announceToScreenReader('Accessibility controls opened');
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${config.controlsId}`)) {
                panel.classList.remove('show');
                panel.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Handle toggle switches
        panel.addEventListener('click', (e) => {
            const toggle = e.target.closest('.accessibility-toggle-switch');
            if (toggle) {
                const option = toggle.dataset.option;
                if (option) {
                    handleToggleClick(option);
                }
            }
        });
        
        // Keyboard support for toggles
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const toggle = e.target.closest('.accessibility-toggle-switch');
                if (toggle) {
                    e.preventDefault();
                    const option = toggle.dataset.option;
                    if (option) {
                        handleToggleClick(option);
                    }
                }
            }
        });
        
        // Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('show')) {
                panel.classList.remove('show');
                panel.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    // Enhance existing elements for accessibility
    function enhanceExistingElements() {
        // Add missing alt attributes to images
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            img.setAttribute('alt', 'Image');
        });
        
        // Add labels to form inputs without labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            if (!input.closest('label') && input.type !== 'hidden') {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
        
        // Add role attributes to navigation elements
        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => {
            nav.setAttribute('role', 'navigation');
        });
        
        // Add main landmark if missing
        if (!document.querySelector('main, [role="main"]')) {
            const mainContent = document.querySelector('.main-content, .content, #content, .container');
            if (mainContent) {
                mainContent.setAttribute('role', 'main');
                mainContent.id = 'main-content';
            }
        }
        
        // Enhance buttons without proper labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('i, svg, .icon');
                if (icon) {
                    button.setAttribute('aria-label', 'Button');
                }
            }
        });
    }

    // Keyboard navigation helper
    function showKeyboardHelper(message) {
        let helper = document.querySelector('.keyboard-nav-helper');
        if (!helper) {
            helper = document.createElement('div');
            helper.className = 'keyboard-nav-helper';
            document.body.appendChild(helper);
        }
        
        helper.textContent = message;
        helper.classList.add('show');
        
        setTimeout(() => {
            helper.classList.remove('show');
        }, 3000);
    }

    // Monitor keyboard navigation
    function monitorKeyboardNavigation() {
        let isUsingKeyboard = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                if (accessibilityState.keyboardNavigation) {
                    showKeyboardHelper('Use Tab to navigate, Enter to activate');
                }
            }
        });
        
        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
        });
        
        // Add focus indicators for keyboard users
        document.addEventListener('focusin', (e) => {
            if (isUsingKeyboard && accessibilityState.focusIndicators) {
                e.target.classList.add('keyboard-focused');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('keyboard-focused');
        });
    }

    // Initialize accessibility controls
    function init() {
        addAccessibilityStyles();
        createAccessibilityControls();
        addSkipLinks();
        addAriaLiveRegion();
        loadPreferences();
        applyAccessibilitySettings();
        setupEventListeners();
        enhanceExistingElements();
        monitorKeyboardNavigation();
        
        // Announce that accessibility controls are available
        setTimeout(() => {
            announceToScreenReader('Accessibility controls are available in the top right corner');
        }, 2000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();