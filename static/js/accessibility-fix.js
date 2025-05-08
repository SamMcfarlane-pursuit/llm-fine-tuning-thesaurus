/**
 * Accessibility Fix
 * This script ensures all accessibility features are working correctly
 */

(function() {
    console.log('Accessibility Fix: Initializing...');

    // Execute immediately
    fixAccessibility();

    // Also execute when DOM is loaded
    document.addEventListener('DOMContentLoaded', fixAccessibility);

    // Also execute when window is loaded
    window.addEventListener('load', fixAccessibility);

    // Set an interval to periodically check and fix accessibility
    setInterval(fixAccessibility, 1000);
})();

/**
 * Fix accessibility features
 */
function fixAccessibility() {
    try {
        console.log('Accessibility Fix: Attempting to fix accessibility features...');

        // Fix skip to content link
        fixSkipToContentLink();

        // Fix ARIA attributes
        fixAriaAttributes();

        // Fix focus styles
        fixFocusStyles();

        // Fix keyboard navigation
        fixKeyboardNavigation();

        // Fix screen reader text
        fixScreenReaderText();

        // Fix color contrast
        fixColorContrast();

        // Fix font sizes
        fixFontSizes();

        console.log('Accessibility Fix: Accessibility features fixed successfully');
    } catch (error) {
        console.error('Accessibility Fix: Error fixing accessibility features', error);
    }
}

/**
 * Fix skip to content link
 */
function fixSkipToContentLink() {
    // Check if the skip to content link exists
    let skipToContentLink = document.querySelector('.skip-to-content');

    // If it doesn't exist, create it
    if (!skipToContentLink) {
        console.log('Accessibility Fix: Creating skip to content link...');

        // Create the skip to content link
        skipToContentLink = document.createElement('a');
        skipToContentLink.className = 'skip-to-content';
        skipToContentLink.href = '#main-content';
        skipToContentLink.textContent = 'Skip to content';
        skipToContentLink.style.position = 'absolute';
        skipToContentLink.style.top = '-40px';
        skipToContentLink.style.left = '0';
        skipToContentLink.style.backgroundColor = '#2e0054';
        skipToContentLink.style.color = 'white';
        skipToContentLink.style.padding = '10px';
        skipToContentLink.style.zIndex = '9999';
        skipToContentLink.style.transition = 'top 0.3s';

        // Add focus styles
        skipToContentLink.addEventListener('focus', function() {
            this.style.top = '0';
        });

        skipToContentLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });

        // Add the skip to content link to the body
        const body = document.body;
        const firstChild = body.firstChild;

        if (firstChild) {
            body.insertBefore(skipToContentLink, firstChild);
        } else {
            body.appendChild(skipToContentLink);
        }

        console.log('Accessibility Fix: Skip to content link created and added to the DOM');
    } else {
        console.log('Accessibility Fix: Skip to content link already exists, ensuring it is properly styled...');

        // Ensure the skip to content link is properly styled
        skipToContentLink.style.position = 'absolute';
        skipToContentLink.style.top = '-40px';
        skipToContentLink.style.left = '0';
        skipToContentLink.style.backgroundColor = '#2e0054';
        skipToContentLink.style.color = 'white';
        skipToContentLink.style.padding = '10px';
        skipToContentLink.style.zIndex = '9999';
        skipToContentLink.style.transition = 'top 0.3s';

        // Add focus styles
        skipToContentLink.addEventListener('focus', function() {
            this.style.top = '0';
        });

        skipToContentLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
    }
}

/**
 * Fix ARIA attributes
 */
function fixAriaAttributes() {
    // Add ARIA attributes to navigation
    const nav = document.querySelector('nav');
    if (nav) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main Navigation');
    }

    // Add ARIA attributes to main content
    const main = document.querySelector('main');
    if (main) {
        main.setAttribute('role', 'main');
    }

    // Add ARIA attributes to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.hasAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent || 'Button');
        }
    });

    // Add ARIA attributes to links
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (!link.hasAttribute('aria-label') && !link.textContent.trim()) {
            link.setAttribute('aria-label', 'Link');
        }
    });
}

/**
 * Fix focus styles
 */
function fixFocusStyles() {
    // Add a style element if it doesn't exist
    let style = document.getElementById('accessibility-focus-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'accessibility-focus-styles';
        document.head.appendChild(style);
    }

    // Add focus styles
    style.textContent = `
        *:focus {
            outline: 3px solid #00c3ff !important;
            outline-offset: 2px !important;
        }
        
        a:focus, button:focus, input:focus, select:focus, textarea:focus {
            outline: 3px solid #00c3ff !important;
            outline-offset: 2px !important;
        }
    `;
}

/**
 * Fix keyboard navigation
 */
function fixKeyboardNavigation() {
    // Make all interactive elements focusable
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    interactiveElements.forEach(element => {
        if (element.getAttribute('tabindex') === '-1') {
            element.setAttribute('tabindex', '0');
        }
    });
}

/**
 * Fix screen reader text
 */
function fixScreenReaderText() {
    // Add screen reader text to icons
    const icons = document.querySelectorAll('.bi');
    icons.forEach(icon => {
        const parent = icon.parentElement;
        if (parent && parent.tagName === 'A' && !parent.textContent.trim()) {
            const ariaLabel = parent.getAttribute('aria-label');
            if (!ariaLabel) {
                parent.setAttribute('aria-label', 'Link with icon');
            }
        }
    });
}

/**
 * Fix color contrast
 */
function fixColorContrast() {
    // Ensure text has sufficient contrast
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, input, select, textarea');
    textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // If the element has a transparent background, don't change it
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            return;
        }

        // If the element has a light background, ensure dark text
        if (isLightColor(backgroundColor)) {
            element.style.color = '#000000';
        }
        // If the element has a dark background, ensure light text
        else if (isDarkColor(backgroundColor)) {
            element.style.color = '#ffffff';
        }
    });
}

/**
 * Fix font sizes
 */
function fixFontSizes() {
    // Ensure text is readable
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, input, select, textarea');
    textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);

        // If the font size is too small, increase it
        if (fontSize < 12) {
            element.style.fontSize = '12px';
        }
    });
}

/**
 * Check if a color is light
 * @param {string} color - The color to check
 * @returns {boolean} - Whether the color is light
 */
function isLightColor(color) {
    // Convert the color to RGB
    const rgb = colorToRgb(color);
    if (!rgb) return false;

    // Calculate the brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    // Return whether the color is light
    return brightness > 128;
}

/**
 * Check if a color is dark
 * @param {string} color - The color to check
 * @returns {boolean} - Whether the color is dark
 */
function isDarkColor(color) {
    // Convert the color to RGB
    const rgb = colorToRgb(color);
    if (!rgb) return false;

    // Calculate the brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    // Return whether the color is dark
    return brightness <= 128;
}

/**
 * Convert a color to RGB
 * @param {string} color - The color to convert
 * @returns {object|null} - The RGB values or null if the color is invalid
 */
function colorToRgb(color) {
    // Check if the color is in RGB format
    const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }

    // Check if the color is in RGBA format
    const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3])
        };
    }

    // Check if the color is in hex format
    const hexMatch = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hexMatch) {
        return {
            r: parseInt(hexMatch[1], 16),
            g: parseInt(hexMatch[2], 16),
            b: parseInt(hexMatch[3], 16)
        };
    }

    // Check if the color is in short hex format
    const shortHexMatch = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shortHexMatch) {
        return {
            r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
            g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
            b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16)
        };
    }

    // Return null if the color is invalid
    return null;
}
