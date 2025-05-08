/**
 * Purple Guide Text
 * Dynamically applies purple text to guide cards for better readability
 */

(function() {
    // Function to apply purple text to guide cards
    function applyPurpleTextToGuideCards() {
        console.log('Applying purple text to guide cards...');
        
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
                
                // If card has guide-related content, apply purple text
                if (hasViewGuideButton || hasGuideClass) {
                    applyPurpleTextToCard(card);
                }
            });
        } else {
            // Apply purple text to all found guide cards
            guideCards.forEach(card => {
                applyPurpleTextToCard(card);
            });
        }
        
        // Also find all white cards and apply purple text
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
            
            // If card has a "View Guide" button, apply purple text
            if (hasViewGuideButton) {
                applyPurpleTextToCard(card);
            }
        });
    }
    
    // Function to apply purple text to a single card
    function applyPurpleTextToCard(card) {
        // Skip if already processed
        if (card.classList.contains('purple-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.classList.add('purple-text-applied');
        
        // Apply purple text to all text elements except buttons
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div:not(.btn), li, a:not(.btn)');
        
        textElements.forEach(element => {
            // Skip elements that are part of buttons
            if (element.closest('.btn') || element.classList.contains('btn')) {
                return;
            }
            
            // Apply purple text
            if (element.tagName.toLowerCase().startsWith('h')) {
                // Headings get darker purple
                element.style.color = '#4b0082';
                element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.7)';
                element.style.fontWeight = 'bold';
            } else if (element.tagName.toLowerCase() === 'p') {
                // Paragraphs get medium purple
                element.style.color = '#6a0dad';
                element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
                element.style.fontWeight = '500';
            } else if (element.tagName.toLowerCase() === 'a' && !element.classList.contains('btn')) {
                // Links get bright purple
                element.style.color = '#8a2be2';
                element.style.textDecoration = 'underline';
                element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
            } else {
                // Other elements get standard purple
                element.style.color = '#6a0dad';
                element.style.textShadow = '0 0 1px rgba(255, 255, 255, 0.5)';
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
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyPurpleTextToGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyPurpleTextToGuideCards, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        applyPurpleTextToGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
