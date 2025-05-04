/**
 * Home Features JavaScript
 * Handles functionality for the homepage feature cards and buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feature cards
    initFeatureCards();

    // Initialize feature CTAs
    initFeatureCTAs();

    // Add hover effects to feature cards
    addFeatureCardHoverEffects();

    // Initialize feature links
    initFeatureLinks();

    // Initialize accordion items in exercises section
    initExerciseAccordion();
});

/**
 * Initialize feature cards with click handlers
 */
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        // Make the entire card clickable
        card.addEventListener('click', function(e) {
            // Don't trigger if a link inside was clicked
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }

            // Find the CTA button in this card and click it
            const cta = this.querySelector('.feature-cta');
            if (cta) {
                cta.click();
            }
        });
    });
}

/**
 * Initialize feature CTA buttons with tracking
 */
function initFeatureCTAs() {
    const featureCTAs = document.querySelectorAll('.feature-cta');

    featureCTAs.forEach(cta => {
        cta.addEventListener('click', function(e) {
            // Track the click for analytics
            if (typeof trackFeatureClick === 'function') {
                const featureType = this.closest('.feature-card').classList[1];
                const featureTitle = this.closest('.feature-card').querySelector('.feature-title').textContent;

                trackFeatureClick(featureType, featureTitle, this.href);
            }
        });
    });
}

/**
 * Add hover effects to feature cards
 */
function addFeatureCardHoverEffects() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('feature-card-hover');

            // Animate the icon
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.classList.add('icon-pulse');
            }
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('feature-card-hover');

            // Remove icon animation
            const icon = this.querySelector('.feature-icon i');
            if (icon) {
                icon.classList.remove('icon-pulse');
            }
        });
    });
}

/**
 * Initialize feature links with click handlers
 */
function initFeatureLinks() {
    const featureLinks = document.querySelectorAll('.feature-link');

    featureLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track the click for analytics
            if (typeof trackFeatureClick === 'function') {
                const featureCard = this.closest('.feature-card');
                const featureType = featureCard ? featureCard.classList[1] : 'unknown';
                const featureTitle = this.textContent.trim();

                trackFeatureClick(featureType + '-link', featureTitle, this.href);
            }
        });
    });
}

/**
 * Initialize exercise accordion items
 */
function initExerciseAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        const collapseId = button.getAttribute('data-bs-target');
        const collapseElement = document.querySelector(collapseId);

        // Add click handler for the "Try in Colab" buttons
        const colabButton = item.querySelector('a[href*="colab.research.google.com"]');
        if (colabButton) {
            colabButton.addEventListener('click', function(e) {
                // Track the click for analytics
                if (typeof trackFeatureClick === 'function') {
                    const exerciseTitle = item.querySelector('.accordion-button').textContent.trim();
                    trackFeatureClick('exercise-colab', exerciseTitle, this.href);
                }
            });
        }
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
