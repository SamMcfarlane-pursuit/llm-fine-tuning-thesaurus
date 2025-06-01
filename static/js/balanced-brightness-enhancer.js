/**
 * Balanced Brightness Enhancer
 * Ensures optimal brightness and contrast when switching between light and dark modes
 * Provides coherent visual experience across all components
 */

(function() {
    'use strict';

    // Enhanced theme management
    class BalancedBrightnessManager {
        constructor() {
            this.init();
        }

        init() {
            this.setupThemeObserver();
            this.enhanceBrightness();
            this.setupTransitions();
            this.monitorThemeChanges();
        }

        setupThemeObserver() {
            // Watch for theme changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        this.enhanceBrightness();
                    }
                });
            });

            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        enhanceBrightness() {
            const isLightMode = document.body.classList.contains('light-theme');

            if (isLightMode) {
                this.applyLightModeEnhancements();
            } else {
                this.applyDarkModeEnhancements();
            }
        }

        applyLightModeEnhancements() {
            // Apply new green-based light mode colors (main website colors)
            document.documentElement.style.setProperty('--text', '#162211');
            document.documentElement.style.setProperty('--background', '#eef5eb');
            document.documentElement.style.setProperty('--primary', '#3c6430');
            document.documentElement.style.setProperty('--secondary', '#919fca');
            document.documentElement.style.setProperty('--accent', '#7350a5');

            this.enhanceTextContrast('light');
            this.enhanceNavigationBrightness('light');
            this.enhanceCardBrightness('light');
            this.enhanceButtonContrast('light');
        }

        applyDarkModeEnhancements() {
            // Apply new green/purple dark mode colors
            document.documentElement.style.setProperty('--text', '#e3efde');
            document.documentElement.style.setProperty('--background', '#0d140a');
            document.documentElement.style.setProperty('--primary', '#a6ce9a');
            document.documentElement.style.setProperty('--secondary', '#36446f');
            document.documentElement.style.setProperty('--accent', '#7e5bb0');

            this.enhanceTextContrast('dark');
            this.enhanceNavigationBrightness('dark');
            this.enhanceCardBrightness('dark');
            this.enhanceButtonContrast('dark');
        }

        enhanceTextContrast(mode) {
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li');

            textElements.forEach(element => {
                if (mode === 'light') {
                    // Ensure dark green text on light green backgrounds
                    if (!element.style.color || element.style.color === 'inherit') {
                        element.style.color = '#162211';
                        element.style.fontWeight = element.style.fontWeight || '500';
                    }
                } else {
                    // Ensure bright green text on dark backgrounds
                    if (!element.style.color || element.style.color === 'inherit') {
                        element.style.color = '#e3efde';
                        element.style.fontWeight = element.style.fontWeight || '500';
                    }
                }
            });
        }

        enhanceNavigationBrightness(mode) {
            const navbar = document.querySelector('.navbar');
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

            if (navbar) {
                if (mode === 'light') {
                    navbar.style.backgroundColor = 'rgba(238, 245, 235, 0.98)';
                    navbar.style.backdropFilter = 'blur(12px)';
                    navbar.style.boxShadow = '0 4px 24px rgba(60, 100, 48, 0.12)';
                } else {
                    navbar.style.backgroundColor = 'rgba(13, 20, 10, 0.98)';
                    navbar.style.backdropFilter = 'blur(12px)';
                    navbar.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.5)';
                }
            }

            navLinks.forEach(link => {
                if (mode === 'light') {
                    link.style.color = '#2a3527';
                    link.style.fontWeight = '500';
                } else {
                    link.style.color = '#d4e6ce';
                    link.style.fontWeight = '500';
                }
            });
        }

        enhanceCardBrightness(mode) {
            const cards = document.querySelectorAll('.card');

            cards.forEach(card => {
                if (mode === 'light') {
                    card.style.backgroundColor = '#f8fbf6';
                    card.style.border = '1px solid rgba(22, 34, 17, 0.12)';
                    card.style.boxShadow = '0 4px 24px rgba(22, 34, 17, 0.08)';
                } else {
                    card.style.backgroundColor = '#1a2517';
                    card.style.border = '1px solid rgba(227, 239, 222, 0.15)';
                    card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                }
            });
        }

        enhanceButtonContrast(mode) {
            const buttons = document.querySelectorAll('.btn');

            buttons.forEach(button => {
                if (button.classList.contains('btn-primary')) {
                    if (mode === 'light') {
                        button.style.backgroundColor = '#3c6430';
                        button.style.borderColor = '#3c6430';
                        button.style.color = '#ffffff';
                        button.style.fontWeight = '600';
                    } else {
                        button.style.backgroundColor = '#a6ce9a';
                        button.style.borderColor = '#a6ce9a';
                        button.style.color = '#0d140a';
                        button.style.fontWeight = '600';
                    }
                }
            });
        }

        setupTransitions() {
            // Add smooth transitions for brightness changes
            const style = document.createElement('style');
            style.textContent = `
                * {
                    transition: background-color 0.3s ease,
                                color 0.3s ease,
                                border-color 0.3s ease,
                                box-shadow 0.3s ease !important;
                }

                .navbar {
                    transition: background-color 0.3s ease,
                                box-shadow 0.3s ease !important;
                }

                .card {
                    transition: background-color 0.3s ease,
                                border-color 0.3s ease,
                                box-shadow 0.3s ease !important;
                }

                .btn {
                    transition: background-color 0.3s ease,
                                border-color 0.3s ease,
                                color 0.3s ease !important;
                }
            `;
            document.head.appendChild(style);
        }

        monitorThemeChanges() {
            // Listen for theme toggle button clicks
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-theme-toggle]') ||
                    e.target.closest('.theme-toggle') ||
                    e.target.closest('#theme-toggle')) {

                    // Delay enhancement to allow theme change to complete
                    setTimeout(() => {
                        this.enhanceBrightness();
                    }, 100);
                }
            });

            // Listen for keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                    setTimeout(() => {
                        this.enhanceBrightness();
                    }, 100);
                }
            });
        }

        // Force brightness enhancement for specific elements
        forceEnhancement() {
            // Target specific problematic elements
            const problematicElements = document.querySelectorAll(
                '.text-muted, .text-secondary, .navbar-text, .dropdown-item'
            );

            problematicElements.forEach(element => {
                const isLightMode = document.body.classList.contains('light-theme');

                if (isLightMode) {
                    element.style.color = '#334155';
                    element.style.fontWeight = '500';
                } else {
                    element.style.color = '#e0f2f0';
                    element.style.fontWeight = '500';
                }
            });
        }

        // Accessibility enhancements
        enhanceAccessibility() {
            // Check for high contrast preference
            if (window.matchMedia('(prefers-contrast: high)').matches) {
                const isLightMode = document.body.classList.contains('light-theme');

                if (isLightMode) {
                    document.documentElement.style.setProperty('--light-text-primary', '#000000');
                    document.documentElement.style.setProperty('--light-border-color', 'rgba(0, 0, 0, 0.3)');
                } else {
                    document.documentElement.style.setProperty('--dark-text-primary', '#ffffff');
                    document.documentElement.style.setProperty('--dark-border-color', 'rgba(255, 255, 255, 0.3)');
                }
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new BalancedBrightnessManager();
        });
    } else {
        new BalancedBrightnessManager();
    }

    // Re-enhance when new content is loaded
    window.addEventListener('load', () => {
        const manager = new BalancedBrightnessManager();
        manager.forceEnhancement();
        manager.enhanceAccessibility();
    });

})();
