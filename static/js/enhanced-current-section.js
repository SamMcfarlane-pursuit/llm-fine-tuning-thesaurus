// Enhanced Current Section Highlighter
// Highlights the current section in navigation and provides smooth scrolling

(function() {
    'use strict';

    // Configuration
    const config = {
        activeClass: 'current-section',
        offset: 100,
        smoothScrollDuration: 800
    };

    // Get all navigation links and sections
    const navLinks = document.querySelectorAll('nav a[href^="#"], .nav-link[href^="#"]');
    const sections = document.querySelectorAll('section[id], div[id], article[id]');

    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Update active navigation link
    function updateActiveSection() {
        const scrollPosition = window.scrollY + config.offset;
        
        let currentSection = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        // Update navigation links
        navLinks.forEach(link => {
            link.classList.remove(config.activeClass);
            if (currentSection && link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add(config.activeClass);
            }
        });
    }

    // Smooth scroll to section
    function smoothScrollTo(target) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - config.offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, config.smoothScrollDuration);
            window.scrollTo(0, run);
            if (timeElapsed < config.smoothScrollDuration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Initialize
    function init() {
        // Add click handlers to navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    smoothScrollTo(href);
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });

        // Add scroll listener
        window.addEventListener('scroll', throttle(updateActiveSection, 100));
        
        // Initial update
        updateActiveSection();

        // Handle hash on page load
        if (window.location.hash) {
            setTimeout(() => {
                smoothScrollTo(window.location.hash);
            }, 100);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();