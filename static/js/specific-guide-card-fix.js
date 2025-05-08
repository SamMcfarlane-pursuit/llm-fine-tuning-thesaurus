/**
 * Specific Guide Card Fix
 * Directly targets the exact guide cards shown in the image for maximum readability
 */

(function() {
    // Function to apply purple text to specific guide cards
    function applyPurpleTextToSpecificGuideCards() {
        console.log('Applying purple text to specific guide cards...');
        
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
                        applyPurpleTextToSpecificCard(card);
                    }
                }
            });
        } else {
            // For each "View Guide" button, find the parent card
            viewGuideButtons.forEach(button => {
                const card = button.closest('.card');
                if (card) {
                    applyPurpleTextToSpecificCard(card);
                }
            });
        }
        
        // Find all cards with potential guide content
        const potentialGuideCards = document.querySelectorAll('[data-potential-guide-card="true"]');
        
        potentialGuideCards.forEach(card => {
            // Check if card has "View Guide" button
            const hasViewGuideButton = card.innerHTML.includes('View Guide');
            
            // Check if card has difficulty badge
            const hasDifficultyBadge = card.innerHTML.includes('Intermediate') || 
                                      card.innerHTML.includes('Advanced') || 
                                      card.innerHTML.includes('Beginner');
            
            // If card has guide-related content, apply purple text
            if (hasViewGuideButton || hasDifficultyBadge) {
                applyPurpleTextToSpecificCard(card);
            }
        });
        
        // Find all white cards in a grid layout
        const whiteCardsInGrid = document.querySelectorAll('.row .col-md-4 .card.bg-white, .row .col-md-6 .card.bg-white');
        
        whiteCardsInGrid.forEach(card => {
            // Check if card has a button
            const hasButton = card.querySelector('.btn');
            
            // If card has a button, apply purple text
            if (hasButton) {
                applyPurpleTextToSpecificCard(card);
            }
        });
        
        // Find all cards with pink "View Guide" buttons like in the image
        const pinkButtons = document.querySelectorAll('.btn-primary[style*="background-color: #ff69b4"], .btn-primary[style*="background-color: pink"], .btn-primary[style*="background: #ff69b4"], .btn-primary[style*="background: pink"], .btn[style*="background-color: #ff69b4"], .btn[style*="background-color: pink"], .btn[style*="background: #ff69b4"], .btn[style*="background: pink"]');
        
        pinkButtons.forEach(button => {
            // Check if button text is "View Guide"
            if (button.textContent.includes('View Guide')) {
                // Find the parent card
                const card = button.closest('.card');
                if (card) {
                    applyPurpleTextToSpecificCard(card);
                }
            }
        });
    }
    
    // Function to apply purple text to a specific card
    function applyPurpleTextToSpecificCard(card) {
        // Skip if already processed
        if (card.hasAttribute('data-purple-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.setAttribute('data-purple-text-applied', 'true');
        
        // Apply purple text to all text elements except buttons
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
        
        // Add a subtle purple border
        card.style.border = '1px solid rgba(128, 0, 128, 0.3)';
        
        // Add a subtle shadow
        card.style.boxShadow = '0 4px 8px rgba(128, 0, 128, 0.1)';
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyPurpleTextToSpecificGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applyPurpleTextToSpecificGuideCards, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        applyPurpleTextToSpecificGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
