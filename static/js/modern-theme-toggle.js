/**
 * Modern Theme Toggle - Visual LLM Platform
 * Clean, accessible theme switching with smooth transitions
 * Integrates with the new design system
 */

(function() {
    'use strict';

    // Theme configuration
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    const STORAGE_KEY = 'visual-llm-theme';
    const THEME_ATTRIBUTE = 'data-theme';

    // Theme toggle functionality
    class ThemeToggle {
        constructor() {
            this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
            this.button = null;
            this.icon = null;
            
            this.init();
        }

        init() {
            // Apply initial theme
            this.applyTheme(this.currentTheme);
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupToggle());
            } else {
                this.setupToggle();
            }

            // Listen for system theme changes
            this.watchSystemTheme();
        }

        setupToggle() {
            this.button = document.getElementById('themeToggle');
            this.icon = document.getElementById('themeIcon');

            if (!this.button || !this.icon) {
                console.warn('Theme toggle elements not found, retrying...');
                setTimeout(() => this.setupToggle(), 500);
                return;
            }

            // Set initial icon
            this.updateIcon();

            // Add click handler
            this.button.addEventListener('click', () => this.toggle());

            // Add keyboard support
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });

            console.log('✅ Theme toggle initialized successfully');
        }

        toggle() {
            const newTheme = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
            this.setTheme(newTheme);
        }

        setTheme(theme) {
            if (!Object.values(THEMES).includes(theme)) {
                console.warn(`Invalid theme: ${theme}`);
                return;
            }

            this.currentTheme = theme;
            this.applyTheme(theme);
            this.storeTheme(theme);
            this.updateIcon();
            this.announceThemeChange(theme);
        }

        applyTheme(theme) {
            // Remove existing theme classes/attributes
            document.documentElement.removeAttribute(THEME_ATTRIBUTE);
            document.body.classList.remove('light-theme', 'dark-theme');

            // Apply new theme
            document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
            document.body.classList.add(`${theme}-theme`);

            // Update meta theme-color for mobile browsers
            this.updateMetaThemeColor(theme);

            console.log(`🎨 Theme applied: ${theme}`);
        }

        updateIcon() {
            if (!this.icon) return;

            // Update icon based on current theme
            if (this.currentTheme === THEMES.DARK) {
                this.icon.className = 'bi bi-moon-fill';
                this.button.title = 'Switch to light mode';
            } else {
                this.icon.className = 'bi bi-sun-fill';
                this.button.title = 'Switch to dark mode';
            }
        }

        updateMetaThemeColor(theme) {
            let themeColorMeta = document.querySelector('meta[name="theme-color"]');
            
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                document.head.appendChild(themeColorMeta);
            }

            // Set theme color based on current theme
            const themeColors = {
                [THEMES.LIGHT]: '#eef5eb',
                [THEMES.DARK]: '#0d140a'
            };

            themeColorMeta.content = themeColors[theme];
        }

        announceThemeChange(theme) {
            // Create accessible announcement for screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Theme changed to ${theme} mode`;
            
            document.body.appendChild(announcement);
            
            // Remove announcement after screen readers have processed it
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }

        getStoredTheme() {
            try {
                return localStorage.getItem(STORAGE_KEY);
            } catch (e) {
                console.warn('localStorage not available for theme storage');
                return null;
            }
        }

        storeTheme(theme) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {
                console.warn('localStorage not available for theme storage');
            }
        }

        getSystemTheme() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return THEMES.DARK;
            }
            return THEMES.LIGHT;
        }

        watchSystemTheme() {
            if (!window.matchMedia) return;

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleSystemThemeChange = (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!this.getStoredTheme()) {
                    const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                    this.setTheme(systemTheme);
                }
            };

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleSystemThemeChange);
            } else {
                // Fallback for older browsers
                mediaQuery.addListener(handleSystemThemeChange);
            }
        }
    }

    // Initialize theme toggle
    const themeToggle = new ThemeToggle();

    // Expose to global scope for debugging
    window.visualLLMTheme = {
        toggle: () => themeToggle.toggle(),
        setTheme: (theme) => themeToggle.setTheme(theme),
        getCurrentTheme: () => themeToggle.currentTheme,
        getSystemTheme: () => themeToggle.getSystemTheme()
    };

    console.log('🎨 Modern Theme Toggle System Loaded');

})();
