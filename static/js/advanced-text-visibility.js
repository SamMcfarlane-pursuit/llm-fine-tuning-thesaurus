/**
 * Advanced Text Visibility
 * Provides advanced techniques to ensure text is always visible
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize advanced text visibility enhancements
    enhanceTextVisibilityAdvanced();
    
    // Listen for theme changes to re-apply enhancements
    document.addEventListener('themeChanged', function(e) {
        enhanceTextVisibilityAdvanced();
    });
    
    // Apply enhancements when content changes (for dynamic content)
    observeContentChangesAdvanced();
    
    // Apply enhancements after a short delay to ensure all content is loaded
    setTimeout(function() {
        enhanceTextVisibilityAdvanced();
    }, 500);
});

/**
 * Main function to enhance text visibility with advanced techniques
 */
function enhanceTextVisibilityAdvanced() {
    // Get current theme
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Apply contrast analysis to all text elements
    applyContrastAnalysis(isLightTheme);
    
    // Fix specific problematic elements
    fixProblemElementsAdvanced(isLightTheme);
    
    // Apply text stroke to improve visibility
    applyTextStroke(isLightTheme);
    
    // Fix text in specific sections
    fixSpecificSectionsAdvanced(isLightTheme);
    
    // Fix text in cards
    fixCardTextAdvanced(isLightTheme);
    
    // Fix text in banners
    fixBannerTextAdvanced(isLightTheme);
    
    // Fix text in code blocks
    fixCodeBlocksAdvanced(isLightTheme);
}

/**
 * Apply contrast analysis to all text elements
 */
function applyContrastAnalysis(isLightTheme) {
    // Get all text elements
    const textElements = document.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6, a');
    
    // Analyze each element
    textElements.forEach(element => {
        // Skip elements that don't contain text
        if (!element.textContent.trim()) return;
        
        // Skip elements that are part of a code block
        if (element.closest('pre') || element.closest('code')) return;
        
        // Get computed styles
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = getEffectiveBackgroundColor(element);
        
        // Calculate contrast ratio
        const contrastRatio = calculateContrastRatio(color, backgroundColor);
        
        // If contrast ratio is too low, fix it
        if (contrastRatio < 4.5) {
            fixLowContrast(element, color, backgroundColor, isLightTheme);
        }
    });
}

/**
 * Get the effective background color of an element
 * This accounts for transparent backgrounds by traversing up the DOM tree
 */
function getEffectiveBackgroundColor(element) {
    let currentElement = element;
    let backgroundColor = window.getComputedStyle(currentElement).backgroundColor;
    
    // If the background is transparent, traverse up the DOM tree
    while (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        currentElement = currentElement.parentElement;
        
        // If we've reached the root, use the body background color
        if (!currentElement) {
            backgroundColor = window.getComputedStyle(document.body).backgroundColor;
            break;
        }
        
        backgroundColor = window.getComputedStyle(currentElement).backgroundColor;
    }
    
    return backgroundColor;
}

/**
 * Calculate the contrast ratio between two colors
 */
function calculateContrastRatio(color1, color2) {
    // Parse colors to RGB
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // Default to high contrast if parsing fails
    
    // Calculate relative luminance
    const luminance1 = calculateRelativeLuminance(rgb1);
    const luminance2 = calculateRelativeLuminance(rgb2);
    
    // Calculate contrast ratio
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 */
function calculateRelativeLuminance(rgb) {
    // Convert RGB to sRGB
    const srgb = {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255
    };
    
    // Apply gamma correction
    const gamma = {
        r: srgb.r <= 0.03928 ? srgb.r / 12.92 : Math.pow((srgb.r + 0.055) / 1.055, 2.4),
        g: srgb.g <= 0.03928 ? srgb.g / 12.92 : Math.pow((srgb.g + 0.055) / 1.055, 2.4),
        b: srgb.b <= 0.03928 ? srgb.b / 12.92 : Math.pow((srgb.b + 0.055) / 1.055, 2.4)
    };
    
    // Calculate luminance
    return 0.2126 * gamma.r + 0.7152 * gamma.g + 0.0722 * gamma.b;
}

/**
 * Fix elements with low contrast
 */
function fixLowContrast(element, color, backgroundColor, isLightTheme) {
    // Parse colors to RGB
    const textColor = parseColor(color);
    const bgColor = parseColor(backgroundColor);
    
    if (!textColor || !bgColor) return;
    
    // Determine if background is dark or light
    const bgLuminance = calculateRelativeLuminance(bgColor);
    const isDarkBackground = bgLuminance < 0.5;
    
    // Apply appropriate fix based on background and theme
    if (isDarkBackground) {
        // Dark background - use white text
        element.style.color = '#ffffff';
        element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
    } else {
        // Light background - use dark text
        element.style.color = '#000000';
        element.style.textShadow = 'none';
    }
    
    // Add a data attribute to mark this element as fixed
    element.setAttribute('data-contrast-fixed', 'true');
}

/**
 * Fix specific problematic elements with advanced techniques
 */
function fixProblemElementsAdvanced(isLightTheme) {
    // Fix navigation links
    document.querySelectorAll('.navbar-nav .nav-link').forEach(element => {
        if (isLightTheme) {
            element.style.color = '#0056b3';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#5dd6ff';
            element.style.textShadow = '0 0 8px rgba(93, 214, 255, 0.3)';
        }
    });
    
    // Fix dropdown items
    document.querySelectorAll('.dropdown-item').forEach(element => {
        if (isLightTheme) {
            element.style.color = '#0056b3';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
    
    // Fix buttons
    document.querySelectorAll('.btn').forEach(element => {
        // Skip buttons with specific classes that should have different colors
        if (element.classList.contains('btn-primary') || 
            element.classList.contains('btn-secondary') || 
            element.classList.contains('btn-success') || 
            element.classList.contains('btn-danger') || 
            element.classList.contains('btn-warning') || 
            element.classList.contains('btn-info')) {
            return;
        }
        
        if (isLightTheme) {
            element.style.color = '#0056b3';
            element.style.textShadow = 'none';
        } else {
            element.style.color = '#ffffff';
            element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
        }
    });
}

/**
 * Apply text stroke to improve visibility
 */
function applyTextStroke(isLightTheme) {
    // Apply text stroke to headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(element => {
        if (isLightTheme) {
            element.style.textShadow = 'none';
        } else {
            element.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
        }
    });
}

/**
 * Fix text in specific sections with advanced techniques
 */
function fixSpecificSectionsAdvanced(isLightTheme) {
    // Fix text in workshop sections
    document.querySelectorAll('.workshop-section, .tutorial-section, .guide-section').forEach(section => {
        const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = section.querySelectorAll('p, li, span');
        
        if (isLightTheme) {
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
 * Fix text in cards with advanced techniques
 */
function fixCardTextAdvanced(isLightTheme) {
    // Fix text in cards
    document.querySelectorAll('.card').forEach(card => {
        const headings = card.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-title');
        const paragraphs = card.querySelectorAll('p, li, span, .card-text');
        
        if (isLightTheme) {
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
 * Fix text in banners with advanced techniques
 */
function fixBannerTextAdvanced(isLightTheme) {
    // Fix text in banners
    document.querySelectorAll('.banner, .header-banner, .section-banner, .blue-banner, .purple-banner').forEach(banner => {
        const headings = banner.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = banner.querySelectorAll('p, li, span');
        
        // Banners should always have white text regardless of theme
        headings.forEach(heading => {
            heading.style.color = '#ffffff';
            heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.7)';
        });
        
        paragraphs.forEach(paragraph => {
            paragraph.style.color = '#ffffff';
            paragraph.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.7)';
        });
    });
}

/**
 * Fix text in code blocks with advanced techniques
 */
function fixCodeBlocksAdvanced(isLightTheme) {
    // Fix text in code blocks
    document.querySelectorAll('pre, code').forEach(codeBlock => {
        if (isLightTheme) {
            codeBlock.style.backgroundColor = '#f8f8f2';
            codeBlock.style.color = '#282a36';
            codeBlock.style.border = '1px solid rgba(0, 86, 179, 0.2)';
        } else {
            codeBlock.style.backgroundColor = '#282a36';
            codeBlock.style.color = '#f8f8f2';
            codeBlock.style.border = '1px solid rgba(93, 214, 255, 0.2)';
        }
    });
}

/**
 * Observe DOM changes to apply fixes to dynamically added content
 */
function observeContentChangesAdvanced() {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Re-apply text visibility enhancements
                enhanceTextVisibilityAdvanced();
            }
        });
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
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
