/**
 * Page Transitions JavaScript
 * Handles smooth transitions between pages and content changes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create loading indicator
    createLoadingIndicator();
    
    // Initialize page transitions
    initPageTransitions();
    
    // Initialize section transitions
    initSectionTransitions();
    
    // Initialize card animations
    initCardAnimations();
});

/**
 * Create loading indicator element
 */
function createLoadingIndicator() {
    const loadingBar = document.createElement('div');
    loadingBar.className = 'page-loading';
    loadingBar.setAttribute('role', 'progressbar');
    loadingBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(loadingBar);
}

/**
 * Initialize page transition system
 */
function initPageTransitions() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Skip animations for users who prefer reduced motion
        return;
    }
    
    // Wrap main content in transition wrapper if not already wrapped
    const mainContent = document.getElementById('main-content');
    if (mainContent && !mainContent.querySelector('.page-transition-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-transition-wrapper';
        
        // Move all children to the wrapper
        while (mainContent.firstChild) {
            wrapper.appendChild(mainContent.firstChild);
        }
        
        // Add wrapper to main content
        mainContent.appendChild(wrapper);
        
        // Add enter animation class
        wrapper.classList.add('page-enter');
        
        // Trigger reflow
        void wrapper.offsetWidth;
        
        // Add active class to start animation
        wrapper.classList.add('page-enter-active');
    }
    
    // Handle link clicks for page transitions
    document.addEventListener('click', function(event) {
        // Only handle links within the site
        const link = event.target.closest('a');
        if (!link) return;
        
        // Skip if modifier keys are pressed or it's an external link
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank') return;
        if (link.hostname !== window.location.hostname) return;
        if (link.getAttribute('download')) return;
        if (link.getAttribute('href').startsWith('#')) return;
        if (link.getAttribute('href').startsWith('javascript:')) return;
        
        // Show loading indicator
        const loadingBar = document.querySelector('.page-loading');
        if (loadingBar) {
            loadingBar.classList.add('active');
        }
        
        // Add exit animation to current page
        const wrapper = document.querySelector('.page-transition-wrapper');
        if (wrapper) {
            event.preventDefault();
            
            wrapper.classList.add('page-exit');
            wrapper.classList.add('page-exit-active');
            
            // Navigate to new page after animation completes
            setTimeout(function() {
                window.location.href = link.href;
            }, 200);
        }
    });
}

/**
 * Initialize section transitions with Intersection Observer
 */
function initSectionTransitions() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Add transition class to sections
    const sections = document.querySelectorAll('.category-header, .row > .col-12 > h2, .row > .col-12 > .card');
    sections.forEach(section => {
        if (!section.classList.contains('section-transition')) {
            section.classList.add('section-transition');
        }
    });
    
    // Create observer for sections
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Observe all sections
    document.querySelectorAll('.section-transition').forEach(section => {
        sectionObserver.observe(section);
    });
}

/**
 * Initialize card animations with Intersection Observer
 */
function initCardAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Add card-grid class to container
    const cardContainer = document.getElementById('tutorial-cards-container');
    if (cardContainer) {
        cardContainer.classList.add('card-grid');
    }
    
    // Add enter animation class to cards
    const cards = document.querySelectorAll('.tutorial-card .card');
    cards.forEach(card => {
        card.classList.add('card-enter');
    });
    
    // Create observer for cards
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-enter-active');
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Observe all cards
    cards.forEach(card => {
        cardObserver.observe(card);
    });
}

// Handle page load complete
window.addEventListener('load', function() {
    // Hide loading indicator
    const loadingBar = document.querySelector('.page-loading');
    if (loadingBar) {
        loadingBar.classList.remove('active');
    }
});

// Handle AJAX navigation (for single page applications)
document.addEventListener('DOMContentLoaded', function() {
    // Intercept AJAX requests to show loading indicator
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const loadingBar = document.querySelector('.page-loading');
        
        xhr.addEventListener('loadstart', function() {
            if (loadingBar) loadingBar.classList.add('active');
        });
        
        xhr.addEventListener('loadend', function() {
            if (loadingBar) {
                setTimeout(function() {
                    loadingBar.classList.remove('active');
                }, 500);
            }
        });
        
        return xhr;
    };
});
