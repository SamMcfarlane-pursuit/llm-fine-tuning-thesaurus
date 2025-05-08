/**
 * Enhanced UX Animations
 * Provides smooth scrolling, transitions, and UI animations for a silky user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize reveal animations
    initRevealAnimations();

    // Initialize hover effects
    initHoverEffects();

    // Initialize navigation highlighting
    initNavigationHighlighting();

    // Initialize scroll progress indicator
    initScrollProgressIndicator();

    // Initialize image loading effects
    initImageLoadingEffects();

    // Initialize button animations
    initButtonAnimations();
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    // Get all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    // Add click event listener to each anchor link
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default behavior
            e.preventDefault();

            // Get the target element
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // If target element exists, scroll to it
            if (targetElement) {
                // Get the header height for offset
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;

                // Calculate the target position
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // Scroll to the target position
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Initialize reveal animations for elements as they scroll into view
 */
function initRevealAnimations() {
    // Get all elements with reveal animation
    const revealElements = document.querySelectorAll('.card, .guide-step, .feature-button, .section-header, .visualization-container');

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add reveal class to element
                entry.target.classList.add('revealed');

                // Unobserve element after it's been revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe each element
    revealElements.forEach(element => {
        // Add initial state class
        element.classList.add('reveal-animation');

        // Observe element
        observer.observe(element);
    });

    // Add CSS for reveal animations
    addRevealAnimationStyles();
}

/**
 * Add CSS styles for reveal animations
 */
function addRevealAnimationStyles() {
    // Create style element
    const style = document.createElement('style');

    // Add CSS rules
    style.textContent = `
        .reveal-animation {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;

    // Add style element to head
    document.head.appendChild(style);
}

/**
 * Initialize hover effects for interactive elements
 */
function initHoverEffects() {
    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn, .feature-button, .nav-link');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });

    // Add hover effect to cards
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

/**
 * Initialize navigation highlighting based on scroll position
 */
function initNavigationHighlighting() {
    // Get all sections
    const sections = document.querySelectorAll('section[id]');

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        // Get current scroll position
        const scrollPosition = window.scrollY;

        // Check each section
        sections.forEach(section => {
            // Get section position and height
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            // Check if scroll position is within section
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Get corresponding navigation link
                const navLink = document.querySelector(`a[href="#${section.id}"]`);

                // If navigation link exists, highlight it
                if (navLink) {
                    // Remove active class from all navigation links
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to current navigation link
                    navLink.classList.add('active');
                }
            }
        });
    });
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgressIndicator() {
    // Check if user is authenticated
    const isAuthenticated = document.body.getAttribute('data-user-logged-in') === 'true';

    // Only add progress indicator for authenticated users
    if (!isAuthenticated) {
        console.log('Scroll progress indicator not initialized: User not authenticated');
        return;
    }

    // Create progress indicator element
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'scroll-progress-indicator';

    // Add progress indicator to body
    document.body.appendChild(progressIndicator);

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        // Calculate scroll progress
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;

        // Update progress indicator width
        progressIndicator.style.width = `${scrollProgress}%`;
    });

    // Add CSS for progress indicator
    addProgressIndicatorStyles();
}

/**
 * Add CSS styles for progress indicator
 */
function addProgressIndicatorStyles() {
    // Create style element
    const style = document.createElement('style');

    // Add CSS rules
    style.textContent = `
        .scroll-progress-indicator {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(to right, #4a94ff, #5dd6ff);
            z-index: 9999;
            width: 0;
            transition: width 0.1s ease;
            box-shadow: 0 0 10px rgba(93, 214, 255, 0.5);
        }

        body.light-mode .scroll-progress-indicator {
            background: linear-gradient(to right, #0056b3, #0088cc);
            box-shadow: 0 0 10px rgba(0, 86, 179, 0.3);
        }
    `;

    // Add style element to head
    document.head.appendChild(style);
}

/**
 * Initialize image loading effects
 */
function initImageLoadingEffects() {
    // Get all images
    const images = document.querySelectorAll('img:not(.loaded)');

    // Add load event listener to each image
    images.forEach(image => {
        // Add loading class
        image.classList.add('loading');

        // Add load event listener
        image.addEventListener('load', function() {
            // Remove loading class
            this.classList.remove('loading');

            // Add loaded class
            this.classList.add('loaded');

            // Add fade-in animation
            this.style.animation = 'fadeIn 0.5s ease forwards';
        });

        // Add error event listener
        image.addEventListener('error', function() {
            // Remove loading class
            this.classList.remove('loading');

            // Add error class
            this.classList.add('error');
        });
    });

    // Add CSS for image loading effects
    addImageLoadingStyles();
}

/**
 * Add CSS styles for image loading effects
 */
function addImageLoadingStyles() {
    // Create style element
    const style = document.createElement('style');

    // Add CSS rules
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        img.loading {
            opacity: 0.5;
            filter: blur(5px);
            transition: opacity 0.3s ease, filter 0.3s ease;
        }

        img.loaded {
            opacity: 1;
            filter: blur(0);
        }
    `;

    // Add style element to head
    document.head.appendChild(style);
}

/**
 * Initialize button animations
 */
function initButtonAnimations() {
    // Get all buttons
    const buttons = document.querySelectorAll('.btn, .feature-button');

    // Add click event listener to each button
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add ripple effect
            addRippleEffect(this, event);
        });
    });
}

/**
 * Add ripple effect to button
 */
function addRippleEffect(button, event) {
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    // Add ripple element to button
    button.appendChild(ripple);

    // Get button position
    const rect = button.getBoundingClientRect();

    // Calculate ripple position
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // Set ripple position and size
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Remove ripple element after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);

    // Add CSS for ripple effect
    addRippleEffectStyles();
}

/**
 * Add CSS styles for ripple effect
 */
function addRippleEffectStyles() {
    // Check if styles already added
    if (document.querySelector('#ripple-effect-styles')) {
        return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'ripple-effect-styles';

    // Add CSS rules
    style.textContent = `
        .btn, .feature-button {
            position: relative;
            overflow: hidden;
        }

        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;

    // Add style element to head
    document.head.appendChild(style);
}
