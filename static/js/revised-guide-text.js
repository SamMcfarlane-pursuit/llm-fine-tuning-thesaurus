/**
 * Revised Guide Text
 * Ensures text in guide cards is clearly visible in both light and dark modes
 */

(function() {
    // Define color variables for both modes
    // Light mode colors - darker purple for better contrast on white
    const lightModeHeading = '#4c1d95';  // Very dark purple for headings in light mode
    const lightModeText = '#5b21b6';     // Dark purple for text in light mode
    const lightModeLink = '#6d28d9';     // Medium-dark purple for links in light mode
    
    // Dark mode colors - bright purple for better contrast on dark
    const darkModeHeading = '#c4b5fd';   // Bright purple for headings in dark mode
    const darkModeText = '#ddd6fe';      // Very bright purple for text in dark mode
    const darkModeLink = '#ede9fe';      // Almost white purple for links in dark mode
    
    // Border and shadow
    const purpleBorder = 'rgba(91, 33, 182, 0.6)';  // Medium-dark purple for borders
    const purpleShadow = 'rgba(91, 33, 182, 0.4)';  // Medium-dark purple for shadows
    
    // Function to apply revised text to all cards
    function applyRevisedTextToCards() {
        console.log('Applying revised text to cards...');
        
        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode') || document.body.classList.contains('dark');
        
        // Find all cards
        const allCards = document.querySelectorAll('.card');
        
        // Apply revised text to all cards
        allCards.forEach(card => {
            applyRevisedTextToCard(card, isDarkMode);
        });
    }
    
    // Function to apply revised text to a single card
    function applyRevisedTextToCard(card, isDarkMode) {
        // Skip if already processed
        if (card.hasAttribute('data-revised-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.setAttribute('data-revised-text-applied', 'true');
        
        // Add a distinct purple border
        card.style.border = `2px solid ${purpleBorder}`;
        
        // Add a shadow for depth
        card.style.boxShadow = `0 4px 12px ${purpleShadow}`;
        
        // Apply revised text to all text elements except buttons and badges
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div:not(.btn), li, a:not(.btn)');
        
        textElements.forEach(element => {
            // Skip elements that are part of buttons
            if (element.closest('.btn') || element.classList.contains('btn')) {
                return;
            }
            
            // Skip elements that are badges
            if (element.classList.contains('badge')) {
                return;
            }
            
            // Apply revised text based on dark mode
            if (element.tagName.toLowerCase().startsWith('h')) {
                // Headings
                if (isDarkMode) {
                    element.style.color = darkModeHeading;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.8)';
                    element.style.fontWeight = '800';
                } else {
                    element.style.color = lightModeHeading;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.9)';
                    element.style.fontWeight = '800';
                }
            } else if (element.tagName.toLowerCase() === 'p') {
                // Paragraphs
                if (isDarkMode) {
                    element.style.color = darkModeText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.7)';
                    element.style.fontWeight = '600';
                } else {
                    element.style.color = lightModeText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.9)';
                    element.style.fontWeight = '600';
                }
            } else if (element.tagName.toLowerCase() === 'a' && !element.classList.contains('btn')) {
                // Links
                if (isDarkMode) {
                    element.style.color = darkModeLink;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.7)';
                    element.style.fontWeight = 'bold';
                } else {
                    element.style.color = lightModeLink;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.9)';
                    element.style.fontWeight = 'bold';
                }
                element.style.textDecoration = 'underline';
            } else {
                // Other elements
                if (isDarkMode) {
                    element.style.color = darkModeText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.7)';
                    element.style.fontWeight = '600';
                } else {
                    element.style.color = lightModeText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.9)';
                    element.style.fontWeight = '600';
                }
            }
        });
        
        // Make sure buttons remain visible
        const buttons = card.querySelectorAll('.btn, button, a.btn');
        
        buttons.forEach(button => {
            button.style.color = 'white';
            button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
            button.style.fontWeight = 'bold';
            
            // Also apply to child elements
            const buttonChildren = button.querySelectorAll('*');
            buttonChildren.forEach(child => {
                child.style.color = 'white';
                child.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
            });
        });
        
        // Make sure badges remain visible
        const badges = card.querySelectorAll('.badge');
        
        badges.forEach(badge => {
            badge.style.color = 'white';
            badge.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
            badge.style.fontWeight = 'bold';
        });
    }
    
    // Function to handle theme changes
    function handleThemeChange() {
        // Remove the processed flag from all cards
        document.querySelectorAll('[data-revised-text-applied]').forEach(card => {
            card.removeAttribute('data-revised-text-applied');
        });
        
        // Reapply revised text
        applyRevisedTextToCards();
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyRevisedTextToCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyRevisedTextToCards, 2000);
        
        // Listen for theme changes
        const themeToggleButton = document.querySelector('.theme-toggle, #theme-toggle, [data-theme-toggle], .dark-mode-toggle, #dark-mode-toggle');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for the theme to change
                setTimeout(handleThemeChange, 100);
            });
        }
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        // Check if the theme has changed
        mutations.forEach(mutation => {
            if (mutation.target === document.body && 
                (mutation.attributeName === 'class' || 
                 mutation.target.classList.contains('dark-mode') || 
                 mutation.target.classList.contains('dark'))) {
                handleThemeChange();
            }
        });
        
        // Apply to new content
        applyRevisedTextToCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
})();
