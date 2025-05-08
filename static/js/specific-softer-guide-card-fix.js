/**
 * Specific Softer Guide Card Fix
 * Directly targets the exact guide cards shown in the image with softer purple tones
 */

(function() {
    // Define softer purple color variables
    const softPurpleHeading = '#7e57c2';  // Softer purple for headings
    const softPurpleText = '#9575cd';     // Softer purple for regular text
    const softPurpleLink = '#b39ddb';     // Softer purple for links
    const softPurpleBorder = 'rgba(126, 87, 194, 0.2)'; // Softer purple for borders
    const softPurpleShadow = 'rgba(126, 87, 194, 0.1)'; // Softer purple for shadows
    
    // Function to apply softer purple text to specific guide cards
    function applySofterPurpleTextToSpecificGuideCards() {
        console.log('Applying softer purple text to specific guide cards...');
        
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
                        applySofterPurpleTextToSpecificCard(card);
                    }
                }
            });
        } else {
            // For each "View Guide" button, find the parent card
            viewGuideButtons.forEach(button => {
                const card = button.closest('.card');
                if (card) {
                    applySofterPurpleTextToSpecificCard(card);
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
            
            // If card has guide-related content, apply softer purple text
            if (hasViewGuideButton || hasDifficultyBadge) {
                applySofterPurpleTextToSpecificCard(card);
            }
        });
        
        // Find all white cards in a grid layout
        const whiteCardsInGrid = document.querySelectorAll('.row .col-md-4 .card.bg-white, .row .col-md-6 .card.bg-white');
        
        whiteCardsInGrid.forEach(card => {
            // Check if card has a button
            const hasButton = card.querySelector('.btn');
            
            // If card has a button, apply softer purple text
            if (hasButton) {
                applySofterPurpleTextToSpecificCard(card);
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
                    applySofterPurpleTextToSpecificCard(card);
                }
            }
        });
    }
    
    // Function to apply softer purple text to a specific card
    function applySofterPurpleTextToSpecificCard(card) {
        // Skip if already processed
        if (card.hasAttribute('data-softer-purple-text-applied')) {
            return;
        }
        
        // Mark as processed
        card.setAttribute('data-softer-purple-text-applied', 'true');
        
        // Apply softer purple text to all text elements except buttons
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
        
        // Add a subtle purple border
        card.style.border = `1px solid ${softPurpleBorder}`;
        
        // Add a subtle shadow
        card.style.boxShadow = `0 4px 8px ${softPurpleShadow}`;
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applySofterPurpleTextToSpecificGuideCards();
        
        // Run periodically to catch dynamically added cards
        setInterval(applySofterPurpleTextToSpecificGuideCards, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        applySofterPurpleTextToSpecificGuideCards();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
