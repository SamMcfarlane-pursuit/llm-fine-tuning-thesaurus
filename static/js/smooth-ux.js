/**
 * Smooth UX Enhancement Script
 * Provides silky smooth scrolling, animations, and UI enhancements
 * for the LLM Fine-Tuning Thesaurus website
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing smooth UX enhancements...');
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize page transitions
    initPageTransitions();
    
    // Initialize hover effects
    initHoverEffects();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize focus states
    initFocusStates();
    
    // Initialize loading indicators
    initLoadingIndicators();
    
    // Initialize responsive behaviors
    initResponsiveBehaviors();
    
    console.log('Smooth UX enhancements initialized successfully!');
});

/**
 * Initialize smooth scrolling for all internal links
 */
function initSmoothScrolling() {
    // Get all internal links
    const internalLinks = document.querySelectorAll('a[href^="#"], a[href^="/"]:not([href^="//"])');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip links that open in new tabs or have download attribute
            if (this.getAttribute('target') === '_blank' || this.hasAttribute('download')) {
                return;
            }
            
            const href = this.getAttribute('href');
            
            // Handle internal anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for header
                        behavior: 'smooth'
                    });
                    
                    // Update URL without reloading
                    history.pushState(null, null, href);
                }
            }
            // Handle internal page links with smooth transition
            else if (href.startsWith('/') && !href.startsWith('//')) {
                // Don't prevent default for page navigation
                // But add a subtle transition effect
                document.body.classList.add('page-transition-out');
                
                // Small delay to allow transition to complete
                setTimeout(() => {
                    // Navigation will happen naturally
                }, 150);
            }
        });
    });
    
    // Make scrolling smoother for mouse wheel
    document.body.style.scrollBehavior = 'smooth';
    
    // Smooth scroll on navigation using browser back/forward buttons
    window.addEventListener('popstate', function() {
        // Get the hash from the URL
        const hash = window.location.hash;
        
        // If there's a hash, scroll to it
        if (hash) {
            const targetElement = document.getElementById(hash.substring(1));
            
            if (targetElement) {
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header
                    behavior: 'smooth'
                });
            }
        } else {
            // If no hash, scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

/**
 * Initialize page transitions
 */
function initPageTransitions() {
    // Add transition classes to body
    document.body.classList.add('page-transition');
    
    // Add transition-in class after page load
    window.addEventListener('load', function() {
        document.body.classList.add('page-transition-in');
    });
    
    // Add transition-out class before page unload
    window.addEventListener('beforeunload', function() {
        document.body.classList.add('page-transition-out');
    });
}

/**
 * Initialize hover effects for interactive elements
 */
function initHoverEffects() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Add hover effects to navigation items
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Initialize scroll animations for elements
 */
function initScrollAnimations() {
    // Get all elements to animate
    const animatedElements = document.querySelectorAll('.card, .workshop-module, .feature-card, .concept-card, .progress-card');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class when element is in viewport
                entry.target.classList.add('scroll-visible');
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe each element
    animatedElements.forEach((element, index) => {
        // Add base animation class
        element.classList.add('scroll-animation');
        
        // Add staggered delay based on index
        element.style.transitionDelay = `${index * 0.05}s`;
        
        // Start observing
        observer.observe(element);
    });
}

/**
 * Initialize focus states for accessibility
 */
function initFocusStates() {
    // Add focus styles to interactive elements
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focus-visible');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focus-visible');
        });
    });
}

/**
 * Initialize loading indicators for async operations
 */
function initLoadingIndicators() {
    // Add loading indicator to buttons that trigger async operations
    const asyncButtons = document.querySelectorAll('.btn[data-async="true"]');
    
    asyncButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Store original text
            const originalText = this.innerHTML;
            
            // Show loading state
            this.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
            `;
            this.disabled = true;
            
            // Simulate async operation (remove in production)
            setTimeout(() => {
                // Restore original state
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        });
    });
}

/**
 * Initialize responsive behaviors
 */
function initResponsiveBehaviors() {
    // Handle responsive adjustments
    function handleResponsiveChanges() {
        const windowWidth = window.innerWidth;
        
        // Adjust UI based on screen size
        if (windowWidth < 768) {
            // Mobile adjustments
            document.body.classList.add('mobile-view');
            document.body.classList.remove('tablet-view', 'desktop-view');
        } else if (windowWidth < 1200) {
            // Tablet adjustments
            document.body.classList.add('tablet-view');
            document.body.classList.remove('mobile-view', 'desktop-view');
        } else {
            // Desktop adjustments
            document.body.classList.add('desktop-view');
            document.body.classList.remove('mobile-view', 'tablet-view');
        }
    }
    
    // Initial call
    handleResponsiveChanges();
    
    // Listen for resize events
    window.addEventListener('resize', handleResponsiveChanges);
}

// Add CSS for smooth UX enhancements
const style = document.createElement('style');
style.textContent = `
    /* Page Transitions */
    .page-transition {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    
    .page-transition-out {
        opacity: 0.8;
    }
    
    .page-transition-in {
        opacity: 1;
    }
    
    /* Scroll Animations */
    .scroll-animation {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .scroll-animation.scroll-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Focus States */
    .focus-visible {
        outline: 2px solid var(--bs-primary) !important;
        outline-offset: 2px !important;
    }
    
    /* Smooth Scrolling */
    html {
        scroll-behavior: smooth;
    }
    
    /* Interactive Hover Effects */
    .btn, .card, .nav-link {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    /* Responsive Classes */
    .mobile-view .desktop-only {
        display: none !important;
    }
    
    .tablet-view .mobile-only {
        display: none !important;
    }
    
    .desktop-view .mobile-only {
        display: none !important;
    }
`;

document.head.appendChild(style);
