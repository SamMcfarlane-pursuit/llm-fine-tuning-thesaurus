/**
 * Keyboard Navigation JavaScript
 * Enhances keyboard accessibility throughout the application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize keyboard navigation
    initKeyboardNavigation();
    
    // Add keyboard support for concept map
    initConceptMapKeyboardNavigation();
    
    // Add keyboard support for tutorial cards
    initTutorialCardsKeyboardNavigation();
    
    // Add keyboard support for category filters
    initCategoryFiltersKeyboardNavigation();
    
    // Add keyboard support for skip to content
    initSkipToContentKeyboardNavigation();
});

/**
 * Initialize general keyboard navigation
 */
function initKeyboardNavigation() {
    // Track keyboard vs mouse usage
    document.body.addEventListener('mousedown', function() {
        document.body.classList.add('using-mouse');
    });
    
    document.body.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.remove('using-mouse');
        }
    });
    
    // Add keyboard support for buttons and interactive elements
    const interactiveElements = document.querySelectorAll('[role="button"], .llm-concept, .badge[data-concept]');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('tabindex') && element.tagName.toLowerCase() !== 'button' && element.tagName.toLowerCase() !== 'a') {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

/**
 * Initialize concept map keyboard navigation
 */
function initConceptMapKeyboardNavigation() {
    // Add keyboard support for map drawer toggle
    const mapDrawerToggle = document.querySelector('.map-drawer-toggle');
    if (mapDrawerToggle) {
        mapDrawerToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    // Add keyboard navigation for map container
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.addEventListener('keydown', function(e) {
            // Arrow keys for navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                
                // If network is available, use it for navigation
                if (this._network) {
                    const position = this._network.getViewPosition();
                    const step = 50;
                    
                    switch (e.key) {
                        case 'ArrowUp':
                            this._network.moveTo({ position: { y: position.y - step } });
                            break;
                        case 'ArrowDown':
                            this._network.moveTo({ position: { y: position.y + step } });
                            break;
                        case 'ArrowLeft':
                            this._network.moveTo({ position: { x: position.x - step } });
                            break;
                        case 'ArrowRight':
                            this._network.moveTo({ position: { x: position.x + step } });
                            break;
                    }
                }
            }
            
            // Zoom controls
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                document.querySelector('.map-zoom-in')?.click();
            }
            
            if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                document.querySelector('.map-zoom-out')?.click();
            }
            
            if (e.key === '0') {
                e.preventDefault();
                document.querySelector('.map-zoom-reset')?.click();
            }
            
            // Escape to close drawer
            if (e.key === 'Escape') {
                e.preventDefault();
                if (document.querySelector('.map-drawer-container.open')) {
                    document.querySelector('.map-drawer-toggle')?.click();
                }
            }
        });
    }
}

/**
 * Initialize tutorial cards keyboard navigation
 */
function initTutorialCardsKeyboardNavigation() {
    // Add keyboard support for tutorial cards
    const tutorialCards = document.querySelectorAll('.tutorial-card .card');
    
    tutorialCards.forEach(card => {
        // Make card focusable if not already
        if (!card.getAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listener
        card.addEventListener('keydown', function(e) {
            // Enter or space to open the first link
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const primaryLink = this.querySelector('.btn-primary');
                if (primaryLink) {
                    primaryLink.click();
                }
            }
            
            // Arrow keys for navigation between cards
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                
                const cards = Array.from(document.querySelectorAll('.tutorial-card .card'));
                const currentIndex = cards.indexOf(this);
                let nextIndex;
                
                const cardsPerRow = window.innerWidth >= 992 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
                
                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = (currentIndex + 1) % cards.length;
                        break;
                    case 'ArrowLeft':
                        nextIndex = (currentIndex - 1 + cards.length) % cards.length;
                        break;
                    case 'ArrowDown':
                        nextIndex = (currentIndex + cardsPerRow) % cards.length;
                        break;
                    case 'ArrowUp':
                        nextIndex = (currentIndex - cardsPerRow + cards.length) % cards.length;
                        break;
                }
                
                if (nextIndex !== undefined && cards[nextIndex]) {
                    cards[nextIndex].focus();
                }
            }
        });
    });
}

/**
 * Initialize category filters keyboard navigation
 */
function initCategoryFiltersKeyboardNavigation() {
    // Add keyboard support for category filters
    const categoryButtons = document.querySelectorAll('[data-category]');
    
    categoryButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            // Arrow keys for navigation between buttons
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                
                const buttons = Array.from(document.querySelectorAll('[data-category]'));
                const currentIndex = buttons.indexOf(this);
                let nextIndex;
                
                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = (currentIndex + 1) % buttons.length;
                        break;
                    case 'ArrowLeft':
                        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                        break;
                }
                
                if (nextIndex !== undefined && buttons[nextIndex]) {
                    buttons[nextIndex].focus();
                }
            }
        });
    });
}

/**
 * Skip to content navigation removed per user request
 */
function initSkipToContentKeyboardNavigation() {
    // Skip to content functionality removed
}

// Re-initialize keyboard navigation when content changes
document.addEventListener('contentChanged', function() {
    initKeyboardNavigation();
    initConceptMapKeyboardNavigation();
    initTutorialCardsKeyboardNavigation();
    initCategoryFiltersKeyboardNavigation();
});
