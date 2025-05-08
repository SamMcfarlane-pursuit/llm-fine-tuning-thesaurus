/**
 * Text Accessibility Fix
 * This script ensures all text on the website is perfectly readable and accessible
 * It dynamically applies high-contrast text colors and fixes any text visibility issues
 */

(function() {
    console.log('Text Accessibility Fix: Initializing...');
    
    // Execute immediately
    fixTextAccessibility();
    
    // Also execute when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Text Accessibility Fix: DOM Content Loaded');
        fixTextAccessibility();
        setupMutationObserver();
        
        // Set an interval to periodically check and fix text accessibility
        setInterval(fixTextAccessibility, 2000);
    });
    
    // Also execute when window is loaded (all resources loaded)
    window.addEventListener('load', function() {
        console.log('Text Accessibility Fix: Window Loaded');
        fixTextAccessibility();
    });
})();

/**
 * Set up a mutation observer to watch for DOM changes
 * This will reapply our text accessibility fixes if other scripts modify the DOM
 */
function setupMutationObserver() {
    try {
        // Create a new observer
        const observer = new MutationObserver(function(mutations) {
            // If the DOM changes, reapply our text accessibility fixes
            fixTextAccessibility();
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            characterData: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('Text Accessibility Fix: Mutation observer set up successfully');
    } catch (error) {
        console.error('Text Accessibility Fix: Error setting up mutation observer', error);
    }
}

/**
 * Fix text accessibility by ensuring all text has proper contrast
 */
function fixTextAccessibility() {
    try {
        console.log('Text Accessibility Fix: Applying text accessibility fixes...');
        
        // Get the current theme
        const isLightTheme = document.body.classList.contains('light-theme');
        const isHighContrastMode = document.body.classList.contains('high-contrast-mode');
        
        // Define colors based on theme
        let textPrimary, textSecondary, linkColor, linkHoverColor;
        
        if (isHighContrastMode) {
            // High contrast mode colors
            textPrimary = '#ffffff';
            textSecondary = '#ffffff';
            linkColor = '#ffff00';
            linkHoverColor = '#ffff00';
        } else if (isLightTheme) {
            // Light theme colors
            textPrimary = '#121212';
            textSecondary = '#333333';
            linkColor = '#0056b3';
            linkHoverColor = '#003d80';
        } else {
            // Dark theme colors
            textPrimary = '#ffffff';
            textSecondary = '#e6e6e6';
            linkColor = '#7cc7ff';
            linkHoverColor = '#b3dfff';
        }
        
        // Fix text colors for all text elements
        fixTextElements(textPrimary, textSecondary, linkColor, linkHoverColor);
        
        // Fix specific components
        fixNavigation(textPrimary, linkColor);
        fixCards(textPrimary, linkColor);
        fixButtons(isLightTheme);
        fixForms(textPrimary, textSecondary);
        fixTables(textPrimary, linkColor);
        
        console.log('Text Accessibility Fix: Text accessibility fixes applied successfully');
    } catch (error) {
        console.error('Text Accessibility Fix: Error applying text accessibility fixes', error);
    }
}

/**
 * Fix text colors for all text elements
 * @param {string} textPrimary - Primary text color
 * @param {string} textSecondary - Secondary text color
 * @param {string} linkColor - Link color
 * @param {string} linkHoverColor - Link hover color
 */
function fixTextElements(textPrimary, textSecondary, linkColor, linkHoverColor) {
    try {
        // Fix headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6');
        headings.forEach(heading => {
            heading.style.color = textPrimary;
            heading.style.fontWeight = '700';
        });
        
        // Fix paragraphs and general text
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, input, textarea, select');
        textElements.forEach(element => {
            // Skip elements that are part of buttons or have background colors
            if (!element.closest('.btn') && !element.closest('.badge')) {
                element.style.color = textPrimary;
            }
        });
        
        // Fix links
        const links = document.querySelectorAll('a:not(.btn):not(.badge):not(.nav-link)');
        links.forEach(link => {
            link.style.color = linkColor;
            link.style.textDecoration = 'underline';
            link.style.textUnderlineOffset = '2px';
            link.style.fontWeight = '500';
            
            // Add hover effect
            link.addEventListener('mouseenter', function() {
                this.style.color = linkHoverColor;
                this.style.textUnderlineOffset = '3px';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.color = linkColor;
                this.style.textUnderlineOffset = '2px';
            });
        });
        
        // Fix code blocks
        const codeBlocks = document.querySelectorAll('pre, code');
        codeBlocks.forEach(code => {
            if (document.body.classList.contains('light-theme')) {
                code.style.color = '#121212';
                code.style.backgroundColor = '#f5f5f5';
            } else {
                code.style.color = '#e6e6e6';
                code.style.backgroundColor = '#1a1a1a';
            }
        });
        
        // Fix inline code
        const inlineCode = document.querySelectorAll('code');
        inlineCode.forEach(code => {
            code.style.color = linkColor;
            code.style.fontWeight = '500';
        });
        
        // Fix blockquotes
        const blockquotes = document.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
            blockquote.style.color = textPrimary;
            blockquote.style.borderLeft = `4px solid ${linkColor}`;
            blockquote.style.paddingLeft = '1rem';
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing text elements', error);
    }
}

/**
 * Fix navigation elements
 * @param {string} textPrimary - Primary text color
 * @param {string} linkColor - Link color
 */
function fixNavigation(textPrimary, linkColor) {
    try {
        // Fix navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.color = textPrimary;
            link.style.fontWeight = '600';
            
            // Add hover effect
            link.addEventListener('mouseenter', function() {
                this.style.color = linkColor;
            });
            
            link.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.color = textPrimary;
                }
            });
        });
        
        // Fix active navigation links
        const activeNavLinks = document.querySelectorAll('.nav-link.active');
        activeNavLinks.forEach(link => {
            link.style.color = linkColor;
            link.style.fontWeight = '700';
        });
        
        // Fix dropdown items
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.style.color = textPrimary;
            item.style.fontWeight = '500';
            
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.style.color = textPrimary;
                this.style.backgroundColor = 'rgba(124, 199, 255, 0.2)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.color = textPrimary;
                this.style.backgroundColor = 'transparent';
            });
        });
        
        // Fix dropdown headers
        const dropdownHeaders = document.querySelectorAll('.dropdown-header');
        dropdownHeaders.forEach(header => {
            header.style.color = linkColor;
            header.style.fontWeight = '700';
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing navigation', error);
    }
}

/**
 * Fix card elements
 * @param {string} textPrimary - Primary text color
 * @param {string} linkColor - Link color
 */
function fixCards(textPrimary, linkColor) {
    try {
        // Fix card titles
        const cardTitles = document.querySelectorAll('.card-title');
        cardTitles.forEach(title => {
            title.style.color = linkColor;
            title.style.fontWeight = '700';
        });
        
        // Fix card text
        const cardText = document.querySelectorAll('.card-text');
        cardText.forEach(text => {
            text.style.color = textPrimary;
        });
        
        // Fix card headers
        const cardHeaders = document.querySelectorAll('.card-header');
        cardHeaders.forEach(header => {
            header.style.fontWeight = '600';
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing cards', error);
    }
}

/**
 * Fix button elements
 * @param {boolean} isLightTheme - Whether the current theme is light
 */
function fixButtons(isLightTheme) {
    try {
        // Fix all buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.style.fontWeight = '600';
            button.style.letterSpacing = '0.3px';
        });
        
        // Fix dark buttons
        const darkButtons = document.querySelectorAll('.btn-primary, .btn-success, .btn-danger, .btn-dark');
        darkButtons.forEach(button => {
            button.style.color = '#ffffff';
        });
        
        // Fix light buttons
        const lightButtons = document.querySelectorAll('.btn-light, .btn-warning, .btn-info');
        lightButtons.forEach(button => {
            button.style.color = '#121212';
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing buttons', error);
    }
}

/**
 * Fix form elements
 * @param {string} textPrimary - Primary text color
 * @param {string} textSecondary - Secondary text color
 */
function fixForms(textPrimary, textSecondary) {
    try {
        // Fix labels
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            label.style.color = textPrimary;
            label.style.fontWeight = '600';
        });
        
        // Fix form controls
        const formControls = document.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.style.color = textPrimary;
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing forms', error);
    }
}

/**
 * Fix table elements
 * @param {string} textPrimary - Primary text color
 * @param {string} linkColor - Link color
 */
function fixTables(textPrimary, linkColor) {
    try {
        // Fix tables
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            table.style.color = textPrimary;
        });
        
        // Fix table headers
        const tableHeaders = document.querySelectorAll('th');
        tableHeaders.forEach(header => {
            header.style.color = linkColor;
            header.style.fontWeight = '700';
        });
    } catch (error) {
        console.error('Text Accessibility Fix: Error fixing tables', error);
    }
}
