/**
 * Concept Map Heading Fix
 * Specifically targets and enhances the "Explore the Concept Map" heading
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix the concept map heading
    fixConceptMapHeading();

    // Re-apply fix when theme changes
    document.addEventListener('themeChanged', function() {
        fixConceptMapHeading();
    });

    // Observe DOM changes to fix dynamically added headings
    observeConceptMapHeadingChanges();
});

/**
 * Fix the "Explore the Concept Map" heading
 */
function fixConceptMapHeading() {
    console.log('Fixing Explore the Concept Map heading...');

    // Find all h4 headings that contain the text "Explore the Concept Map"
    const headings = document.querySelectorAll('h4');

    headings.forEach(heading => {
        const text = heading.textContent.trim();

        // Skip if already fixed
        if (heading.classList.contains('concept-map-heading-fixed')) {
            return;
        }

        // Check if this is the specific heading we're looking for
        if (text.includes('Explore the Concept Map')) {
            console.log('Found Explore the Concept Map heading:', heading);

            // Mark as fixed
            heading.classList.add('concept-map-heading-fixed');
            heading.classList.add('concept-map-heading');

            // Add a wrapper div for better styling control
            const parent = heading.parentNode;
            const wrapper = document.createElement('div');
            wrapper.classList.add('concept-map-heading-wrapper');

            // Clone the heading
            const newHeading = heading.cloneNode(true);

            // Replace the original heading with the wrapper and new heading
            wrapper.appendChild(newHeading);
            parent.replaceChild(wrapper, heading);

            // Apply enhanced styles
            enhanceConceptMapHeading(newHeading);
        }
    });

    // Also target headings in the instructional guide
    const guideStepHeadings = document.querySelectorAll('.guide-step .step-content h4');

    guideStepHeadings.forEach(heading => {
        const text = heading.textContent.trim();

        // Skip if already fixed
        if (heading.classList.contains('concept-map-heading-fixed')) {
            return;
        }

        // Check if this is the specific heading we're looking for
        if (text.includes('Explore the Concept Map')) {
            console.log('Found Explore the Concept Map heading in guide step:', heading);

            // Mark as fixed
            heading.classList.add('concept-map-heading-fixed');
            heading.classList.add('concept-map-heading');

            // Apply enhanced styles
            enhanceConceptMapHeading(heading);
        }
    });
}

/**
 * Apply enhanced styles to the concept map heading
 */
function enhanceConceptMapHeading(heading) {
    // Get current theme
    const isLightTheme = document.body.classList.contains('light-theme');

    // Apply appropriate styles based on theme with optimal contrast ratios
    if (isLightTheme) {
        // Light theme - dark navy blue text on light blue background (contrast ratio > 7:1)
        heading.style.color = '#00348d'; // Darker blue for better contrast
        heading.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        heading.style.webkitTextStroke = '0.5px rgba(0, 0, 0, 0.2)';
        heading.style.background = 'linear-gradient(90deg, rgba(230, 240, 255, 0.9), rgba(220, 235, 255, 0.9), rgba(230, 240, 255, 0.9))';
        heading.style.border = '2px solid rgba(0, 52, 141, 0.5)';
        heading.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    } else {
        // Dark theme - white text on dark purple background (contrast ratio > 7:1)
        heading.style.color = '#ffffff';
        heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 255, 255, 0.6)';
        heading.style.webkitTextStroke = '1px rgba(0, 0, 0, 0.8)';
        heading.style.background = 'linear-gradient(90deg, rgba(55, 0, 110, 0.9), rgba(75, 0, 130, 0.9), rgba(55, 0, 110, 0.9))';
        heading.style.border = '2px solid rgba(255, 255, 255, 0.7)';
        heading.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
    }

    // Common styles
    heading.style.fontWeight = '900';
    heading.style.letterSpacing = '1px';
    heading.style.padding = '0.75rem 1rem';
    heading.style.borderRadius = '6px';
    heading.style.marginBottom = '1rem';
    heading.style.display = 'inline-block';
    heading.style.position = 'relative';
    heading.style.zIndex = '5';

    // Add a glow effect
    const glow = document.createElement('div');
    glow.classList.add('concept-map-heading-glow');
    glow.style.position = 'absolute';
    glow.style.top = '0';
    glow.style.left = '0';
    glow.style.width = '100%';
    glow.style.height = '100%';
    glow.style.background = 'linear-gradient(90deg, rgba(93, 214, 255, 0), rgba(93, 214, 255, 0.2), rgba(93, 214, 255, 0))';
    glow.style.zIndex = '-1';
    glow.style.borderRadius = '6px';
    glow.style.animation = 'concept-map-heading-glow 3s infinite';

    // Add the glow effect to the heading
    heading.style.overflow = 'hidden';
    heading.appendChild(glow);

    // Add the animation if it doesn't exist
    if (!document.getElementById('concept-map-heading-glow-animation')) {
        const style = document.createElement('style');
        style.id = 'concept-map-heading-glow-animation';
        style.textContent = `
            @keyframes concept-map-heading-glow {
                0% {
                    opacity: 0.3;
                    transform: translateX(-100%);
                }
                100% {
                    opacity: 0.7;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Observe DOM changes to fix dynamically added headings
 */
function observeConceptMapHeadingChanges() {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes contain the heading we're looking for
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is an h4 with the text we're looking for
                        if (node.tagName === 'H4' && node.textContent.includes('Explore the Concept Map')) {
                            fixConceptMapHeading();
                        }

                        // Check if the node contains any h4 elements with the text we're looking for
                        const headings = node.querySelectorAll('h4');
                        if (headings.length > 0) {
                            fixConceptMapHeading();
                        }
                    }
                });
            }
        });
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
}
