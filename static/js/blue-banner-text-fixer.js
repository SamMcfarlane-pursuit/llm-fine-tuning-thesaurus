/**
 * Blue Banner Text Fixer
 * Fixes text visibility and styling issues in blue banners
 */

class BlueBannerTextFixer {
    constructor() {
        this.state = {
            bannerElements: [],
            textElements: [],
            originalStyles: new Map(),
            isProcessing: false,
            config: {
                bannerSelectors: [
                    '.banner',
                    '.blue-banner',
                    '[class*="banner"]',
                    '.header-banner',
                    '.notification-banner',
                    '.alert-banner',
                    '.info-banner'
                ],
                blueColorPatterns: [
                    /blue/i,
                    /rgb\(\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*1\d{2,3}\s*\)/,
                    /rgb\(\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*2[0-5][0-9]\s*\)/,
                    /#[0-9a-f]{0,2}[0-9a-f]{0,2}[89a-f][0-9a-f]/i,
                    /#0{0,2}[0-9a-f]{0,2}[89a-f][0-9a-f]/i
                ],
                textSelectors: [
                    'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'a', 'button', 'label', 'li', 'td', 'th', 'strong', 'em',
                    '.text', '.title', '.subtitle', '.content', '.message'
                ]
            }
        };
        
        this.init();
    }

    init() {
        this.findBlueBanners();
        this.fixTextInBanners();
        this.setupContrastEnhancement();
        this.setupResponsiveAdjustments();
        this.bindEvents();
    }

    findBlueBanners() {
        this.state.bannerElements = [];
        
        // Find elements by selectors
        this.state.config.bannerSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isBlueBanner(element)) {
                    this.state.bannerElements.push(element);
                }
            });
        });

        // Find elements by computed styles
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (this.isBlueBanner(element) && !this.state.bannerElements.includes(element)) {
                this.state.bannerElements.push(element);
            }
        });
    }

    isBlueBanner(element) {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const backgroundImage = computedStyle.backgroundImage;
        const className = element.className;
        
        // Check background color
        if (this.isBlueColor(backgroundColor)) {
            return true;
        }

        // Check background image for blue gradients
        if (backgroundImage && backgroundImage !== 'none') {
            if (this.hasBlueInGradient(backgroundImage)) {
                return true;
            }
        }

        // Check class names
        if (typeof className === 'string') {
            return this.state.config.blueColorPatterns.some(pattern => 
                pattern.test(className)
            );
        }

        return false;
    }

    isBlueColor(color) {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            return false;
        }

        // Parse RGB values
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch.map(Number);
            // Check if blue component is dominant
            return b > r && b > g && b > 100;
        }

        // Check hex colors
        const hexMatch = color.match(/#([0-9a-f]{6})/i);
        if (hexMatch) {
            const hex = hexMatch[1];
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return b > r && b > g && b > 100;
        }

        // Check named colors
        return /blue|navy|royal|sky|azure|cyan|teal/i.test(color);
    }

    hasBlueInGradient(backgroundImage) {
        return /blue|#[0-9a-f]*[89a-f][0-9a-f]|rgb\([^)]*,\s*[^)]*,\s*1[5-9][0-9]|rgb\([^)]*,\s*[^)]*,\s*2[0-5][0-9]/i.test(backgroundImage);
    }

    fixTextInBanners() {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;

        this.state.bannerElements.forEach(banner => {
            this.fixBannerText(banner);
        });

        this.state.isProcessing = false;
    }

    fixBannerText(banner) {
        // Find all text elements within the banner
        const textElements = this.findTextElements(banner);
        
        textElements.forEach(element => {
            this.enhanceTextVisibility(element, banner);
        });
    }

    findTextElements(container) {
        const textElements = [];
        
        this.state.config.textSelectors.forEach(selector => {
            const elements = container.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.hasTextContent(element)) {
                    textElements.push(element);
                }
            });
        });

        // Also check the container itself
        if (this.hasTextContent(container)) {
            textElements.push(container);
        }

        return textElements;
    }

    hasTextContent(element) {
        const text = element.textContent || element.innerText;
        return text && text.trim().length > 0;
    }

    enhanceTextVisibility(element, banner) {
        // Store original styles
        if (!this.state.originalStyles.has(element)) {
            this.state.originalStyles.set(element, {
                color: element.style.color,
                textShadow: element.style.textShadow,
                fontWeight: element.style.fontWeight,
                backgroundColor: element.style.backgroundColor,
                padding: element.style.padding,
                borderRadius: element.style.borderRadius
            });
        }

        const computedStyle = window.getComputedStyle(element);
        const currentColor = computedStyle.color;
        const bannerStyle = window.getComputedStyle(banner);
        const bannerBg = bannerStyle.backgroundColor;

        // Calculate contrast and apply fixes
        const contrast = this.calculateContrast(currentColor, bannerBg);
        
        if (contrast < 4.5) { // WCAG AA standard
            this.applyContrastFix(element, banner);
        }

        // Apply additional enhancements
        this.applyTextEnhancements(element);
    }

    calculateContrast(color1, color2) {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);
        
        if (!rgb1 || !rgb2) return 1; // Assume poor contrast if can't parse

        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    parseColor(color) {
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }
        return null;
    }

    getLuminance(rgb) {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    applyContrastFix(element, banner) {
        const bannerStyle = window.getComputedStyle(banner);
        const bannerBg = bannerStyle.backgroundColor;
        
        // Determine if banner is dark or light blue
        const isDarkBanner = this.isDarkColor(bannerBg);
        
        if (isDarkBanner) {
            // Dark blue banner - use light text
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        } else {
            // Light blue banner - use dark text
            element.style.color = '#1a1a1a';
            element.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.5)';
        }
    }

    isDarkColor(color) {
        const rgb = this.parseColor(color);
        if (!rgb) return false;
        
        const luminance = this.getLuminance(rgb);
        return luminance < 0.5;
    }

    applyTextEnhancements(element) {
        // Improve font weight for better readability
        const computedStyle = window.getComputedStyle(element);
        const currentWeight = computedStyle.fontWeight;
        
        if (currentWeight === 'normal' || parseInt(currentWeight) < 500) {
            element.style.fontWeight = '500';
        }

        // Add subtle background for critical text
        if (this.isCriticalText(element)) {
            element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            element.style.padding = '2px 6px';
            element.style.borderRadius = '3px';
            element.style.display = 'inline-block';
        }

        // Ensure proper line height
        if (!element.style.lineHeight) {
            element.style.lineHeight = '1.4';
        }
    }

    isCriticalText(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const text = element.textContent;
        
        // Check for headings
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            return true;
        }

        // Check for important classes
        if (typeof className === 'string') {
            const importantClasses = ['title', 'heading', 'important', 'alert', 'warning', 'error'];
            if (importantClasses.some(cls => className.includes(cls))) {
                return true;
            }
        }

        // Check for short, important text
        if (text && text.length < 50 && /^[A-Z]/.test(text.trim())) {
            return true;
        }

        return false;
    }

    setupContrastEnhancement() {
        // Add CSS for enhanced contrast
        const style = document.createElement('style');
        style.textContent = `
            .blue-banner-enhanced {
                position: relative;
            }
            
            .blue-banner-enhanced::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
                pointer-events: none;
                z-index: 1;
            }
            
            .blue-banner-enhanced > * {
                position: relative;
                z-index: 2;
            }
            
            .text-enhanced {
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            @media (prefers-contrast: high) {
                .blue-banner-enhanced {
                    border: 2px solid currentColor;
                }
                
                .text-enhanced {
                    font-weight: bold !important;
                    text-shadow: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupResponsiveAdjustments() {
        // Adjust text size and spacing for mobile
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobileAdjustments = (e) => {
            if (e.matches) {
                this.applyMobileAdjustments();
            } else {
                this.removeMobileAdjustments();
            }
        };

        mediaQuery.addListener(handleMobileAdjustments);
        handleMobileAdjustments(mediaQuery);
    }

    applyMobileAdjustments() {
        this.state.bannerElements.forEach(banner => {
            const textElements = this.findTextElements(banner);
            textElements.forEach(element => {
                element.style.fontSize = 'max(14px, 1em)';
                element.style.lineHeight = '1.5';
                element.style.wordBreak = 'break-word';
            });
        });
    }

    removeMobileAdjustments() {
        this.state.bannerElements.forEach(banner => {
            const textElements = this.findTextElements(banner);
            textElements.forEach(element => {
                element.style.fontSize = '';
                element.style.lineHeight = '';
                element.style.wordBreak = '';
            });
        });
    }

    bindEvents() {
        // Monitor for new banners added to the DOM
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            this.findBlueBanners();
                            this.fixTextInBanners();
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Re-process on window resize
        window.addEventListener('resize', this.debounce(() => {
            this.fixTextInBanners();
        }, 250));

        // Handle theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
                setTimeout(() => this.fixTextInBanners(), 100);
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    refresh() {
        this.findBlueBanners();
        this.fixTextInBanners();
    }

    restoreOriginalStyles() {
        this.state.originalStyles.forEach((styles, element) => {
            Object.keys(styles).forEach(property => {
                element.style[property] = styles[property];
            });
        });
        this.state.originalStyles.clear();
    }

    addBanner(element) {
        if (element && !this.state.bannerElements.includes(element)) {
            this.state.bannerElements.push(element);
            this.fixBannerText(element);
        }
    }

    removeBanner(element) {
        const index = this.state.bannerElements.indexOf(element);
        if (index > -1) {
            this.state.bannerElements.splice(index, 1);
            // Restore original styles for text elements in this banner
            const textElements = this.findTextElements(element);
            textElements.forEach(textElement => {
                const originalStyles = this.state.originalStyles.get(textElement);
                if (originalStyles) {
                    Object.keys(originalStyles).forEach(property => {
                        textElement.style[property] = originalStyles[property];
                    });
                    this.state.originalStyles.delete(textElement);
                }
            });
        }
    }

    getStats() {
        return {
            bannersFound: this.state.bannerElements.length,
            textElementsProcessed: this.state.originalStyles.size,
            isProcessing: this.state.isProcessing
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.blueBannerTextFixer = new BlueBannerTextFixer();
    });
} else {
    window.blueBannerTextFixer = new BlueBannerTextFixer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlueBannerTextFixer;
}