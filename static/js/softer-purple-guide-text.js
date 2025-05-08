/**
 * Softer Purple Guide Text
 * Dynamically applies softer purple text to guide cards for better readability with reduced contrast
 */

(function() {
    // Define softer purple color variables
    const softPurpleHeading = '#7e57c2';  // Softer purple for headings
    const softPurpleText = '#9575cd';     // Softer purple for regular text
    const softPurpleLink = '#b39ddb';     // Softer purple for links
    const softPurpleBorder = 'rgba(126, 87, 194, 0.2)'; // Softer purple for borders
    const softPurpleShadow = 'rgba(126, 87, 194, 0.1)'; // Softer purple for shadows
    
    // Function to apply softer purple text to guide cards
    function applySofterPurpleTextToGuideCards() {
        console.log('Applying softer purple text to guide cards...');
        
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
                
                // If card has guide-related content, apply softer purple text
                if (hasViewGuideButton || hasGuideClass) {
                    applySofterPurpleTextToCard(card);
                }
            });
        } else {
            // Apply softer purple text to all found guide cards
            guideCards.forEach(card => {
                applySofterPurpleTextToCard(card);
            });
        }
        
        // Also find all white cards and apply softer purple text
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
            
            // If card has a "View Guide" button, apply softer purple text
            if (hasViewGuideButton) {
                applySofterPurpleTextToCard(card);
            }
        });
    }
    
    // Function to apply softer purple text to a single card
    function applySofterPurpleTextToCard(card) {
        // Skip if already processed
        if (card.classList.contains('softer-purple-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.classList.add('softer-purple-text-applied');
        
        // Apply softer purple text to all text elements except buttons
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div:not(.btn), li, a:not(.btn)');
        
        textElements.forEach(element => {
            // Skip elements that are part of buttons
            if (element.closest('.btn') || element.classList.contains('btn')) {
                return;
            }
            
            // Apply softer purple text
            if (element.tagName.toLowerCase().startsWith('h')) {
                // Headings get softer purple
                element.style.color = softPurpleHeading;
                element.style.textShadow = 'none';
                element.style.fontWeight = '600';
            } else if (element.tagName.toLowerCase() === 'p') {
                // Paragraphs get medium softer purple
                element.style.color = softPurpleText;
                element.style.textShadow = 'none';
                element.style.fontWeight = 'normal';
            } else if (element.tagName.toLowerCase() === 'a' && !element.classList.contains('btn')) {
                // Links get bright softer purple
                element.style.color = softPurpleLink;
                element.style.textDecoration = 'underline';
                element.style.textShadow = 'none';
            } else {
                // Other elements get standard softer purple
                element.style.color = softPurpleText;
                element.style.textShadow = 'none';
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
                button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                button.style.fontWeight = 'normal';
                
                // Also apply to child elements
                const buttonChildren = button.querySelectorAll('*');
                buttonChildren.forEach(child => {
                    child.style.color = 'white';
                    child.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                });
            }
        });
        
        // Make sure difficulty badges remain visible
        const badges = card.querySelectorAll('.badge');
        
        badges.forEach(badge => {
            badge.style.color = 'white';
            badge.style.textShadow = '0 1px 1px rgba(0, 0, 0, 0.3)';
            badge.style.fontWeight = 'normal';
        });
        
        // Add a subtle purple border
        card.style.borderColor = softPurpleBorder;
        
        // Add a subtle shadow
        card.style.boxShadow = `0 4px 8px ${softPurpleShadow}`;
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applySofterPurpleTextToGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applySofterPurpleTextToGuideCards, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        applySofterPurpleTextToGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
