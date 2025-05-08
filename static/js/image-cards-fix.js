/**
 * Image Cards Fix
 * Directly targets the exact cards shown in the image with inline styles for maximum visibility
 */

(function() {
    // Define color variables for both modes
    // Light mode colors - very dark purple for maximum contrast on white
    const lightModeHeading = '#2e1065';  // Very dark purple for headings in light mode
    const lightModeText = '#3b0764';     // Very dark purple for text in light mode
    const lightModeLink = '#4c1d95';     // Dark purple for links in light mode
    
    // Dark mode colors - very bright purple for maximum contrast on dark
    const darkModeHeading = '#f5f3ff';   // Almost white purple for headings in dark mode
    const darkModeText = '#e9d5ff';      // Very bright purple for text in dark mode
    const darkModeLink = '#f3e8ff';      // Almost white purple for links in dark mode
    
    // Border and shadow
    const purpleBorder = 'rgba(91, 33, 182, 0.7)';  // Medium-dark purple for borders
    const purpleShadow = 'rgba(91, 33, 182, 0.5)';  // Medium-dark purple for shadows
    
    // Function to apply fix to the specific cards in the image
    function applyFixToImageCards() {
        console.log('Applying fix to image cards...');
        
        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode') || document.body.classList.contains('dark');
        
        // Find all cards in a grid layout like the one in the image
        const cardsInGrid = document.querySelectorAll(
            '.row .col-md-4 .card, ' +
            '.row .col-md-6 .card, ' +
            '.row .col-lg-4 .card, ' +
            '.row .col-lg-6 .card, ' +
            '.row .col-sm-6 .card, ' +
            '.row .col-sm-4 .card, ' +
            '.card-deck .card'
        );
        
        cardsInGrid.forEach(card => {
            applyFixToImageCard(card, isDarkMode);
        });
        
        // Find all cards with difficulty badges
        const cardsWithBadges = document.querySelectorAll(
            '.card:has(.badge:contains("Intermediate")), ' +
            '.card:has(.badge:contains("Advanced")), ' +
            '.card:has(.badge:contains("Beginner")), ' +
            '.card:has(.difficulty-badge), ' +
            '.card:has(.level-badge), ' +
            '.card:has(.badge-intermediate), ' +
            '.card:has(.badge-advanced), ' +
            '.card:has(.badge-beginner)'
        );
        
        // If :has() selector is not supported, use alternative approach
        if (cardsWithBadges.length === 0) {
            // Find all cards
            const allCards = document.querySelectorAll('.card');
            
            // Check each card for badges
            allCards.forEach(card => {
                // Check if card has a badge
                const hasBadge = card.querySelector('.badge, .difficulty-badge, .level-badge, .badge-intermediate, .badge-advanced, .badge-beginner');
                
                // If card has a badge, apply fix
                if (hasBadge) {
                    applyFixToImageCard(card, isDarkMode);
                }
            });
        } else {
            // Apply fix to all found cards with badges
            cardsWithBadges.forEach(card => {
                applyFixToImageCard(card, isDarkMode);
            });
        }
        
        // Find all cards with "View Guide" buttons
        const viewGuideButtons = document.querySelectorAll('a.btn:contains("View Guide"), button:contains("View Guide")');
        
        // If direct selector doesn't work, use alternative approach
        if (viewGuideButtons.length === 0) {
            // Find all buttons
            const allButtons = document.querySelectorAll('a.btn, button.btn, .btn');
            
            // Check each button for "View Guide" text
            allButtons.forEach(button => {
                if (button.textContent.includes('View Guide')) {
                    // Find the parent card
                    const card = button.closest('.card');
                    if (card) {
                        applyFixToImageCard(card, isDarkMode);
                    }
                }
            });
        } else {
            // For each "View Guide" button, find the parent card
            viewGuideButtons.forEach(button => {
                const card = button.closest('.card');
                if (card) {
                    applyFixToImageCard(card, isDarkMode);
                }
            });
        }
    }
    
    // Function to apply fix to a single card
    function applyFixToImageCard(card, isDarkMode) {
        // Skip if already processed
        if (card.hasAttribute('data-image-fix-applied')) {
            return;
        }
        
        // Mark as processed
        card.setAttribute('data-image-fix-applied', 'true');
        
        // Add a distinct purple border
        card.style.border = `3px solid ${purpleBorder}`;
        
        // Add a shadow for depth
        card.style.boxShadow = `0 6px 16px ${purpleShadow}`;
        
        // Apply fix to all text elements except buttons and badges
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
            
            // Apply fix based on dark mode
            if (element.tagName.toLowerCase().startsWith('h')) {
                // Headings
                if (isDarkMode) {
                    element.style.color = darkModeHeading;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 1)';
                    element.style.fontWeight = '900';
                } else {
                    element.style.color = lightModeHeading;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 1)';
                    element.style.fontWeight = '900';
                }
            } else if (element.tagName.toLowerCase() === 'p') {
                // Paragraphs
                if (isDarkMode) {
                    element.style.color = darkModeText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 1)';
                    element.style.fontWeight = '700';
                } else {
                    element.style.color = lightModeText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 1)';
                    element.style.fontWeight = '700';
                }
            } else if (element.tagName.toLowerCase() === 'a' && !element.classList.contains('btn')) {
                // Links
                if (isDarkMode) {
                    element.style.color = darkModeLink;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 1)';
                    element.style.fontWeight = 'bold';
                } else {
                    element.style.color = lightModeLink;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 1)';
                    element.style.fontWeight = 'bold';
                }
                element.style.textDecoration = 'underline';
            } else {
                // Other elements
                if (isDarkMode) {
                    element.style.color = darkModeText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 1)';
                    element.style.fontWeight = '700';
                } else {
                    element.style.color = lightModeText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 1)';
                    element.style.fontWeight = '700';
                }
            }
        });
    }
    
    // Function to handle theme changes
    function handleThemeChange() {
        // Remove the processed flag from all cards
        document.querySelectorAll('[data-image-fix-applied]').forEach(card => {
            card.removeAttribute('data-image-fix-applied');
        });
        
        // Reapply fix
        applyFixToImageCards();
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyFixToImageCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyFixToImageCards, 2000);
        
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
        applyFixToImageCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
})();
