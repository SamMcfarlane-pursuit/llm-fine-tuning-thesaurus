/**
 * Auth-Only Progress Bar
 * Prevents progress bars from being added for non-authenticated users
 */

(function() {
    // Check if user is authenticated (with null check for document.body)
    const isAuthenticated = document.body && document.body.getAttribute('data-user-logged-in') === 'true';
    
    // If user is not authenticated, override progress bar creation functions
    if (!isAuthenticated) {
        console.log('User not authenticated. Disabling progress bars...');
        
        // Override functions that create progress bars
        window.addReadingProgressIndicator = function() {
            console.log('Progress bar creation prevented: User not authenticated');
            return null;
        };
        
        window.initScrollProgress = function() {
            console.log('Scroll progress initialization prevented: User not authenticated');
            return null;
        };
        
        window.initProgressBar = function() {
            console.log('Progress bar initialization prevented: User not authenticated');
            return null;
        };
        
        window.createProgressBar = function() {
            console.log('Progress bar creation prevented: User not authenticated');
            return null;
        };
        
        window.updateProgress = function() {
            console.log('Progress update prevented: User not authenticated');
            return null;
        };
        
        window.initScrollProgressIndicator = function() {
            console.log('Scroll progress indicator initialization prevented: User not authenticated');
            return null;
        };
        
        // Remove any existing progress bars
        function removeExistingProgressBars() {
            const progressElements = document.querySelectorAll(
                '.reading-progress-container, ' +
                '.scroll-progress-container, ' +
                '.scroll-progress-bar, ' +
                '.scroll-progress-indicator, ' +
                '.section-indicator-progress, ' +
                '.section-indicator-progress-bar, ' +
                '.holographic-progress-navigation, ' +
                '.progress-tracker, ' +
                '.exercise-progress, ' +
                '.progress-stats, ' +
                '.workshop-progress-bar, ' +
                '.workshop-progress-text, ' +
                '.progress-circle, ' +
                '.progress-circle-inner, ' +
                '.progress-percentage, ' +
                '.progress-label, ' +
                '.progress-indicator, ' +
                '.tutorial-progress, ' +
                '.module-progress, ' +
                '.module-progress-bar, ' +
                '.quiz-progress, ' +
                '.quiz-progress-bar'
            );
            
            progressElements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        }
        
        // Run immediately
        removeExistingProgressBars();
        
        // Also run after DOM content loaded
        document.addEventListener('DOMContentLoaded', removeExistingProgressBars);
        
        // Run periodically to catch dynamically added progress bars
        setInterval(removeExistingProgressBars, 1000);
        
        // Monitor DOM changes to remove any dynamically added progress bars
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Only process Element nodes
                            // Check if the added node is a progress bar
                            if (node.className && typeof node.className === 'string' && 
                                (node.className.includes('progress') || 
                                 node.id && node.id.includes('progress'))) {
                                if (node.parentNode) {
                                    node.parentNode.removeChild(node);
                                }
                            }
                            
                            // Also check children of the added node
                            const progressChildren = node.querySelectorAll('[class*="progress"], [id*="progress"]');
                            progressChildren.forEach(child => {
                                if (child.parentNode) {
                                    child.parentNode.removeChild(child);
                                }
                            });
                        }
                    }
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
})();
