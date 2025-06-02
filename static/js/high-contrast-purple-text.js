/**
 * High-Contrast Purple Text - Makes text in guide cards high-contrast purple for maximum readability
 */

(function() {
    'use strict';

    function enhancePurpleTextContrast() {
        // Target guide cards and similar elements
        const selectors = [
            '.card-title',
            '.card-text',
            '.guide-card h5',
            '.guide-card p',
            '.workshop-card h5',
            '.workshop-card p',
            '.feature-card h5',
            '.feature-card p'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Apply high-contrast purple styling
                element.style.color = '#7350a5';
                element.style.fontWeight = '600';
                element.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
            });
        });
    }

    // Apply enhancements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhancePurpleTextContrast);
    } else {
        enhancePurpleTextContrast();
    }

    // Re-apply when new content is added
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                enhancePurpleTextContrast();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
