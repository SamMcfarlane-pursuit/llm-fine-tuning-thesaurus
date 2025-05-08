/**
 * High-Contrast Purple Text
 * Dynamically applies high-contrast purple text to guide cards for maximum readability
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
    
    // Function to apply high-contrast purple text to guide cards
    function applyHighContrastPurpleTextToGuideCards() {
        console.log('Applying high-contrast purple text to guide cards...');
        
        // Check if dark mode is active
        const isDarkMode = document.body.classList.contains('dark-mode') || document.body.classList.contains('dark');
        
        // Find all cards with "View Guide" buttons
        const guideCards = document.querySelectorAll(
            '.card:has(a:contains("View Guide")), ' +
            '.card:has(button:contains("View Guide")), ' +
            '.card:has(a.btn[href*="guide"]), ' +
            '.card:has(.view-guide), ' +
            '.guide-card, ' +
            '.guide-item, ' +
            '.guide-container, ' +
            '.guide-box, ' +
            '.guide-content, ' +
            '.guide-wrapper, ' +
            '.framework-card, ' +
            '.framework-item, ' +
            '.framework-container, ' +
            '.framework-box, ' +
            '.framework-content, ' +
            '.framework-wrapper, ' +
            '.tutorial-card, ' +
            '.tutorial-item, ' +
            '.tutorial-container, ' +
            '.tutorial-box, ' +
            '.tutorial-content, ' +
            '.tutorial-wrapper, ' +
            '.workshop-card, ' +
            '.workshop-item, ' +
            '.workshop-container, ' +
            '.workshop-box, ' +
            '.workshop-content, ' +
            '.workshop-wrapper, ' +
            '.card-with-guide-button, ' +
            '.card-with-view-guide, ' +
            '.card[data-card-type="guide"], ' +
            '.card-with-guide, ' +
            '.view-guide-container'
        );
        
        // If :has() selector is not supported, use alternative approach
        if (guideCards.length === 0) {
            // Find all cards
            const allCards = document.querySelectorAll('.card');
            
            // Check each card for guide-related content
            allCards.forEach(card => {
                // Check if card has "View Guide" button
                const hasViewGuideButton = card.querySelector('a:contains("View Guide"), button:contains("View Guide"), a.btn[href*="guide"], .view-guide');
                
                // Check if card has guide-related class
                const hasGuideClass = card.classList.contains('guide-card') || 
                                     card.classList.contains('guide-item') || 
                                     card.classList.contains('guide-container') || 
                                     card.classList.contains('guide-box') || 
                                     card.classList.contains('guide-content') || 
                                     card.classList.contains('guide-wrapper');
                
                // If card has guide-related content, apply high-contrast purple text
                if (hasViewGuideButton || hasGuideClass) {
                    applyHighContrastPurpleTextToCard(card, isDarkMode);
                }
            });
        } else {
            // Apply high-contrast purple text to all found guide cards
            guideCards.forEach(card => {
                applyHighContrastPurpleTextToCard(card, isDarkMode);
            });
        }
        
        // Also find all white cards and apply high-contrast purple text
        const whiteCards = document.querySelectorAll(
            '.card.bg-white, ' +
            '.card.bg-light, ' +
            '.card[style*="background-color: white"], ' +
            '.card[style*="background-color: #fff"], ' +
            '.card[style*="background-color: #ffffff"], ' +
            '.card[style*="background: white"], ' +
            '.card[style*="background: #fff"], ' +
            '.card[style*="background: #ffffff"]'
        );
        
        whiteCards.forEach(card => {
            // Check if card has a "View Guide" button
            const hasViewGuideButton = card.innerHTML.includes('View Guide') || 
                                      card.innerHTML.includes('view-guide') || 
                                      card.innerHTML.includes('guide-button');
            
            // If card has a "View Guide" button, apply high-contrast purple text
            if (hasViewGuideButton) {
                applyHighContrastPurpleTextToCard(card, isDarkMode);
            }
        });
    }
    
    // Function to apply high-contrast purple text to a single card
    function applyHighContrastPurpleTextToCard(card, isDarkMode) {
        // Skip if already processed
        if (card.classList.contains('high-contrast-purple-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.classList.add('high-contrast-purple-text-applied');
        
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
        
        // Make sure "View Guide" buttons remain visible
        const viewGuideButtons = card.querySelectorAll('a.btn, button.btn, .btn');
        
        viewGuideButtons.forEach(button => {
            // Check if this is a "View Guide" button
            if (button.textContent.includes('View Guide') || 
                button.classList.contains('view-guide') || 
                button.classList.contains('guide-button')) {
                // Ensure text is white and visible
                button.style.color = 'white';
                button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
                button.style.fontWeight = 'bold';
                
                // Also apply to child elements
                const buttonChildren = button.querySelectorAll('*');
                buttonChildren.forEach(child => {
                    child.style.color = 'white';
                    child.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
                });
            }
        });
        
        // Make sure difficulty badges remain visible
        const badges = card.querySelectorAll('.badge');
        
        badges.forEach(badge => {
            badge.style.color = 'white';
            badge.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            badge.style.fontWeight = 'bold';
        });
    }
    
    // Function to handle theme changes
    function handleThemeChange() {
        // Remove the processed flag from all cards
        document.querySelectorAll('.high-contrast-purple-text-applied').forEach(card => {
            card.classList.remove('high-contrast-purple-text-applied');
        });
        
        // Reapply high-contrast purple text
        applyHighContrastPurpleTextToGuideCards();
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyHighContrastPurpleTextToGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyHighContrastPurpleTextToGuideCards, 2000);
        
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
        applyHighContrastPurpleTextToGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
})();
