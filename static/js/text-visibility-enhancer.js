/**
 * Text Visibility Enhancer
 * Dynamically fixes text visibility issues by analyzing contrast and applying fixes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize text visibility enhancement
    enhanceTextVisibility();
    
    // Listen for theme changes to re-apply enhancements
    document.addEventListener('themeChanged', function(e) {
        enhanceTextVisibility();
    });
    
    // Apply enhancements when content changes (for dynamic content)
    observeContentChanges();
});

/**
 * Main function to enhance text visibility across the site
 */
function enhanceTextVisibility() {
    // Get current theme
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Apply appropriate fixes based on theme
    if (isLightTheme) {
        fixLightModeTextVisibility();
    } else {
        fixDarkModeTextVisibility();
    }
    
    // Fix specific problematic elements
    fixProblemElements();
    
    // Fix text on colored backgrounds
    fixTextOnColoredBackgrounds();
    
    // Fix text in specific sections
    fixSpecificSections();
}

/**
 * Fix text visibility issues in light mode
 */
function fixLightModeTextVisibility() {
    // Add class to body for CSS targeting
    document.body.classList.add('text-visibility-fixed');
    
    // Fix any white text on light backgrounds
    document.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6').forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        
        // Check if text is white or very light on a light background
        if (isLightColor(color) && isLightBackground(backgroundColor)) {
            element.style.color = '#000000';
            element.style.textShadow = 'none';
        }
    });
}

/**
 * Fix text visibility issues in dark mode
 */
function fixDarkModeTextVisibility() {
    // Add class to body for CSS targeting
    document.body.classList.add('text-visibility-fixed');
    
    // Fix any dark text on dark backgrounds
    document.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6').forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        
        // Check if text is dark on a dark background
        if (isDarkColor(color) && isDarkBackground(backgroundColor)) {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
}

/**
 * Fix specific elements known to have visibility issues
 */
function fixProblemElements() {
    // Fix workshop section text
    document.querySelectorAll('.workshop-section p, .workshop-section li, .workshop-section a').forEach(element => {
        if (document.body.classList.contains('light-theme')) {
            element.style.color = '#000000';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
    
    // Fix tutorial section text
    document.querySelectorAll('.tutorial-section p, .tutorial-section li, .tutorial-section a').forEach(element => {
        if (document.body.classList.contains('light-theme')) {
            element.style.color = '#000000';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
    
    // Fix card text
    document.querySelectorAll('.card-title, .card-subtitle, .card-text').forEach(element => {
        if (document.body.classList.contains('light-theme')) {
            element.style.color = '#000000';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
}

/**
 * Fix text on colored backgrounds
 */
function fixTextOnColoredBackgrounds() {
    // Find elements with background colors
    document.querySelectorAll('*').forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        
        // Skip elements with transparent backgrounds
        if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
            return;
        }
        
        // Fix text on blue backgrounds
        if (isBlueBackground(backgroundColor)) {
            const textElements = element.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6, a');
            textElements.forEach(textElement => {
                textElement.style.color = '#ffffff';
                textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            });
        }
        
        // Fix text on purple backgrounds
        if (isPurpleBackground(backgroundColor)) {
            const textElements = element.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6, a');
            textElements.forEach(textElement => {
                textElement.style.color = '#ffffff';
                textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            });
        }
    });
}

/**
 * Fix text in specific sections that are known to have issues
 */
function fixSpecificSections() {
    // Fix text in guide cards
    document.querySelectorAll('.guide-card, .instructional-guide').forEach(element => {
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = element.querySelectorAll('p, li, span');
        
        if (document.body.classList.contains('light-theme')) {
            headings.forEach(heading => {
                heading.style.color = '#0056b3';
                heading.style.textShadow = 'none';
            });
            
            paragraphs.forEach(paragraph => {
                paragraph.style.color = '#000000';
                paragraph.style.textShadow = 'none';
            });
        } else {
            headings.forEach(heading => {
                heading.style.color = '#5dd6ff';
                heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
            });
            
            paragraphs.forEach(paragraph => {
                paragraph.style.color = '#ffffff';
                paragraph.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            });
        }
    });
}

/**
 * Observe DOM changes to apply fixes to dynamically added content
 */
function observeContentChanges() {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Re-apply text visibility enhancements
                enhanceTextVisibility();
            }
        });
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Helper function to check if a color is light
 */
function isLightColor(color) {
    // Parse the color to RGB
    const rgb = parseColor(color);
    if (!rgb) return false;
    
    // Calculate luminance (perceived brightness)
    // Formula: 0.299*R + 0.587*G + 0.114*B
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Consider colors with luminance > 0.7 as light
    return luminance > 0.7;
}

/**
 * Helper function to check if a color is dark
 */
function isDarkColor(color) {
    // Parse the color to RGB
    const rgb = parseColor(color);
    if (!rgb) return false;
    
    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Consider colors with luminance < 0.3 as dark
    return luminance < 0.3;
}

/**
 * Helper function to check if a background is light
 */
function isLightBackground(backgroundColor) {
    // Parse the color to RGB
    const rgb = parseColor(backgroundColor);
    if (!rgb) return false;
    
    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Consider backgrounds with luminance > 0.5 as light
    return luminance > 0.5;
}

/**
 * Helper function to check if a background is dark
 */
function isDarkBackground(backgroundColor) {
    // Parse the color to RGB
    const rgb = parseColor(backgroundColor);
    if (!rgb) return false;
    
    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    // Consider backgrounds with luminance < 0.5 as dark
    return luminance < 0.5;
}

/**
 * Helper function to check if a background is blue
 */
function isBlueBackground(backgroundColor) {
    // Parse the color to RGB
    const rgb = parseColor(backgroundColor);
    if (!rgb) return false;
    
    // Check if blue is the dominant channel
    return rgb.b > rgb.r && rgb.b > rgb.g;
}

/**
 * Helper function to check if a background is purple
 */
function isPurpleBackground(backgroundColor) {
    // Parse the color to RGB
    const rgb = parseColor(backgroundColor);
    if (!rgb) return false;
    
    // Check if red and blue are both high (purple is a mix of red and blue)
    return rgb.r > 100 && rgb.b > 100 && rgb.g < rgb.r && rgb.g < rgb.b;
}

/**
 * Helper function to parse a CSS color into RGB values
 */
function parseColor(color) {
    // Handle rgba format
    let match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10)
        };
    }
    
    // Handle hex format
    match = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (match) {
        return {
            r: parseInt(match[1], 16),
            g: parseInt(match[2], 16),
            b: parseInt(match[3], 16)
        };
    }
    
    // Handle shorthand hex format
    match = color.match(/#([0-9a-f])([0-9a-f])([0-9a-f])/i);
    if (match) {
        return {
            r: parseInt(match[1] + match[1], 16),
            g: parseInt(match[2] + match[2], 16),
            b: parseInt(match[3] + match[3], 16)
        };
    }
    
    return null;
}
