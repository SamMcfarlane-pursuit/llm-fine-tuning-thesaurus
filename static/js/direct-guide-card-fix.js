/**
 * Direct Guide Card Fix
 * Directly targets the exact guide cards shown in the image with inline styles for maximum contrast
 */

(function() {
    // Define high-contrast purple color variables
    // Dark mode colors
    const darkModePurpleHeading = '#d8b4fe';  // Very bright purple for headings in dark mode
    const darkModePurpleText = '#e9d5ff';     // Very bright purple for text in dark mode
    const darkModePurpleLink = '#f3e8ff';     // Very bright purple for links in dark mode
    
    // Light mode colors
    const lightModePurpleHeading = '#6b21a8';  // Dark purple for headings in light mode
    const lightModePurpleText = '#7e22ce';     // Dark purple for text in light mode
    const lightModePurpleLink = '#9333ea';     // Medium purple for links in light mode
    
    // Border and shadow
    const purpleBorder = 'rgba(147, 51, 234, 0.5)';  // Medium purple for borders
    const purpleShadow = 'rgba(147, 51, 234, 0.3)';  // Medium purple for shadows
    
    // Function to apply high-contrast purple text to specific guide cards
    function applyDirectFixToGuideCards() {
        console.log('Applying direct fix to guide cards...');
        
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
            applyDirectFixToCard(card, isDarkMode);
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
                
                // If card has a badge, apply direct fix
                if (hasBadge) {
                    applyDirectFixToCard(card, isDarkMode);
                }
            });
        } else {
            // Apply direct fix to all found cards with badges
            cardsWithBadges.forEach(card => {
                applyDirectFixToCard(card, isDarkMode);
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
                        applyDirectFixToCard(card, isDarkMode);
                    }
                }
            });
        } else {
            // For each "View Guide" button, find the parent card
            viewGuideButtons.forEach(button => {
                const card = button.closest('.card');
                if (card) {
                    applyDirectFixToCard(card, isDarkMode);
                }
            });
        }
    }
    
    // Function to apply direct fix to a single card
    function applyDirectFixToCard(card, isDarkMode) {
        // Skip if already processed
        if (card.hasAttribute('data-direct-fix-applied')) {
            return;
        }
        
        // Mark as processed
        card.setAttribute('data-direct-fix-applied', 'true');
        
        // Add a distinct purple border
        card.style.border = `2px solid ${purpleBorder}`;
        
        // Add a shadow for depth
        card.style.boxShadow = `0 4px 12px ${purpleShadow}`;
        
        // Apply high-contrast purple text to all text elements except buttons and badges
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
            
            // Apply high-contrast purple text based on dark mode
            if (element.tagName.toLowerCase().startsWith('h')) {
                // Headings
                if (isDarkMode) {
                    element.style.color = darkModePurpleHeading;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.7)';
                } else {
                    element.style.color = lightModePurpleHeading;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.7)';
                }
                element.style.fontWeight = 'bold';
            } else if (element.tagName.toLowerCase() === 'p') {
                // Paragraphs
                if (isDarkMode) {
                    element.style.color = darkModePurpleText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.5)';
                } else {
                    element.style.color = lightModePurpleText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
                }
                element.style.fontWeight = '500';
            } else if (element.tagName.toLowerCase() === 'a' && !element.classList.contains('btn')) {
                // Links
                if (isDarkMode) {
                    element.style.color = darkModePurpleLink;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.5)';
                } else {
                    element.style.color = lightModePurpleLink;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
                }
                element.style.textDecoration = 'underline';
            } else {
                // Other elements
                if (isDarkMode) {
                    element.style.color = darkModePurpleText;
                    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.5)';
                } else {
                    element.style.color = lightModePurpleText;
                    element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
                }
            }
        });
    }
    
    // Function to handle theme changes
    function handleThemeChange() {
        // Remove the processed flag from all cards
        document.querySelectorAll('[data-direct-fix-applied]').forEach(card => {
            card.removeAttribute('data-direct-fix-applied');
        });
        
        // Reapply direct fix
        applyDirectFixToGuideCards();
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyDirectFixToGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyDirectFixToGuideCards, 2000);
        
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
        applyDirectFixToGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
})();
