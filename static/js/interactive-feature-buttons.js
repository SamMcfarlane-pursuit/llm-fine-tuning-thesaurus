/**
 * Interactive Feature Buttons JavaScript
 * Handles functionality for the interactive feature buttons on the homepage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive feature buttons
    initInteractiveFeatureButtons();
    
    // Initialize category visualization cards
    initCategoryVisualizationCards();
    
    // Initialize quick access feature buttons
    initQuickAccessFeatureButtons();
});

/**
 * Initialize interactive feature buttons with click handlers and animations
 */
function initInteractiveFeatureButtons() {
    const featureButtons = document.querySelectorAll('.interactive-feature-button');
    
    featureButtons.forEach(button => {
        // Add click tracking
        button.addEventListener('click', function(e) {
            // Track the click for analytics if the function exists
            if (typeof trackFeatureClick === 'function') {
                const featureType = this.classList[1].replace('-btn', '');
                const featureText = this.querySelector('.feature-text').textContent;
                
                trackFeatureClick(featureType, featureText, this.href);
            }
        });
        
        // Add hover animations
        button.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.classList.add('icon-pulse');
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.classList.remove('icon-pulse');
            }
        });
    });
}

/**
 * Initialize category visualization cards with click handlers
 */
function initCategoryVisualizationCards() {
    const categoryCards = document.querySelectorAll('.category-visualization-card');
    
    categoryCards.forEach(card => {
        // Add click tracking
        card.addEventListener('click', function(e) {
            // Track the click for analytics if the function exists
            if (typeof trackFeatureClick === 'function') {
                const categoryType = this.classList[1];
                const categoryTitle = this.querySelector('h4').textContent;
                
                trackFeatureClick('category-visualization', categoryTitle, this.href);
            }
        });
        
        // Add hover animations
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.classList.add('icon-pulse');
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.classList.remove('icon-pulse');
            }
        });
    });
}

/**
 * Initialize quick access feature buttons in the top bar
 */
function initQuickAccessFeatureButtons() {
    const quickAccessButtons = document.querySelectorAll('.feature-button');
    
    quickAccessButtons.forEach(button => {
        // Add click tracking
        button.addEventListener('click', function(e) {
            // Track the click for analytics if the function exists
            if (typeof trackFeatureClick === 'function') {
                const iconClass = this.querySelector('i').className;
                let featureType = 'unknown';
                
                // Determine feature type based on icon
                if (iconClass.includes('diagram-3')) {
                    featureType = 'concept-maps';
                } else if (iconClass.includes('code-square')) {
                    featureType = 'exercises';
                } else if (iconClass.includes('book')) {
                    featureType = 'learning';
                } else if (iconClass.includes('journal-check')) {
                    featureType = 'quizzes';
                }
                
                trackFeatureClick('quick-access', featureType, this.href);
            }
        });
    });
}

/**
 * Track feature clicks for analytics
 * @param {string} featureType - The type of feature (concept-maps, exercises, knowledge)
 * @param {string} featureTitle - The title of the feature
 * @param {string} featureUrl - The URL the user is navigating to
 */
function trackFeatureClick(featureType, featureTitle, featureUrl) {
    // Check if analytics tracking is available
    if (typeof apiEndpoints !== 'undefined' && apiEndpoints.analyticsTrack) {
        // Send tracking data to the server
        fetch(apiEndpoints.analyticsTrack, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify({
                event_type: 'feature_click',
                feature_type: featureType,
                feature_title: featureTitle,
                feature_url: featureUrl,
                timestamp: new Date().toISOString()
            })
        }).catch(error => {
            console.error('Error tracking feature click:', error);
        });
    }
}
