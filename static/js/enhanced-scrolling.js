/**
 * Enhanced Scrolling JavaScript
 * Provides cutting-edge, professional scrolling experience with visual indicators
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create scroll progress indicator
    createScrollProgressIndicator();

    // Create scroll-to-top button
    createScrollToTopButton();

    // Initialize scroll indicators
    initScrollIndicators();

    // Add smooth scrolling to anchor links
    initSmoothScrolling();

    // Add scroll restoration
    initScrollRestoration();

    // Add scroll position memory for tabs and accordions
    initScrollMemory();

    // Add parallax effect to certain elements
    initParallaxEffects();
});

/**
 * Initialize scroll indicators for overflowing content
 */
function initScrollIndicators() {
    // Add scroll detection to elements
    function updateScrollIndicators() {
        // Vertical scroll indicators
        document.querySelectorAll('.tutorial-card .card-body, .has-scroll-indicator, .modal-body, .sidebar-content, .concept-description, .thesaurus-results, .learning-module-content').forEach(el => {
            if (el.scrollHeight > el.clientHeight + 10) { // Add small threshold to avoid false positives
                el.classList.add('can-scroll');

                // Add scroll shadow class if not already present
                if (!el.classList.contains('scroll-shadow') &&
                    !el.classList.contains('tutorial-card') &&
                    !el.classList.contains('card-body')) {
                    el.classList.add('scroll-shadow');
                }
            } else {
                el.classList.remove('can-scroll');
                el.classList.remove('scroll-shadow');
            }

            // Add scroll event listener to show/hide indicators based on scroll position
            if (!el.hasScrollListener) {
                el.addEventListener('scroll', function() {
                    updateElementScrollState(this);
                });
                el.hasScrollListener = true;
            }

            // Update initial state
            updateElementScrollState(el);
        });

        // Horizontal scroll indicators
        document.querySelectorAll('pre, .table-responsive, .code-block, .overflow-x-auto').forEach(el => {
            if (el.scrollWidth > el.clientWidth + 10) { // Add small threshold to avoid false positives
                el.classList.add('can-scroll-x');
            } else {
                el.classList.remove('can-scroll-x');
            }

            // Add scroll event listener for horizontal scrolling
            if (!el.hasHorizontalScrollListener) {
                el.addEventListener('scroll', function() {
                    updateElementHorizontalScrollState(this);
                });
                el.hasHorizontalScrollListener = true;
            }

            // Update initial state
            updateElementHorizontalScrollState(el);
        });
    }

    // Update scroll state for a specific element (vertical)
    function updateElementScrollState(el) {
        // Check if scrolled to bottom
        const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 5;

        // Check if scrolled to top
        const isAtTop = el.scrollTop < 5;

        // Update classes based on scroll position
        if (isAtBottom) {
            el.classList.add('scrolled-bottom');
            el.classList.remove('scrolled-middle');
        } else if (isAtTop) {
            el.classList.add('scrolled-top');
            el.classList.remove('scrolled-middle');
        } else {
            el.classList.add('scrolled-middle');
            el.classList.remove('scrolled-top');
            el.classList.remove('scrolled-bottom');
        }
    }

    // Update scroll state for a specific element (horizontal)
    function updateElementHorizontalScrollState(el) {
        // Check if scrolled to right edge
        const isAtRight = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 5;

        // Check if scrolled to left edge
        const isAtLeft = el.scrollLeft < 5;

        // Update classes based on scroll position
        if (isAtRight) {
            el.classList.add('scrolled-right');
            el.classList.remove('scrolled-middle-x');
        } else if (isAtLeft) {
            el.classList.add('scrolled-left');
            el.classList.remove('scrolled-middle-x');
        } else {
            el.classList.add('scrolled-middle-x');
            el.classList.remove('scrolled-left');
            el.classList.remove('scrolled-right');
        }
    }

    // Run on load
    updateScrollIndicators();

    // Run on resize
    window.addEventListener('resize', updateScrollIndicators);

    // Run when content changes
    const observer = new MutationObserver(function(mutations) {
        // Check if any mutations affected the DOM structure
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' ||
                (mutation.type === 'attributes' &&
                 (mutation.attributeName === 'class' ||
                  mutation.attributeName === 'style'))) {
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            // Delay the update to ensure DOM is fully updated
            setTimeout(updateScrollIndicators, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // Add to window object for external access
    window.updateScrollIndicators = updateScrollIndicators;
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    // Get all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target element
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                // Calculate offset for fixed headers
                const headerOffset = 80; // Adjust based on your header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Scroll smoothly to the target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without scrolling
                history.pushState(null, null, `#${targetId}`);

                // Set focus to the target for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });

                // Remove tabindex after focus
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });
}

/**
 * Initialize scroll restoration for page navigation
 */
function initScrollRestoration() {
    // Store scroll position before leaving page
    window.addEventListener('beforeunload', function() {
        // Store current scroll position in session storage
        sessionStorage.setItem('scrollPosition', window.pageYOffset);

        // Store positions of scrollable elements
        const scrollableElements = document.querySelectorAll('.can-scroll, .can-scroll-x');
        const scrollPositions = {};

        scrollableElements.forEach((el, index) => {
            const id = el.id || `scrollable-${index}`;
            scrollPositions[id] = {
                scrollTop: el.scrollTop,
                scrollLeft: el.scrollLeft
            };
        });

        sessionStorage.setItem('elementScrollPositions', JSON.stringify(scrollPositions));
    });

    // Restore scroll position on page load
    if (sessionStorage.getItem('scrollPosition')) {
        // Restore main scroll position
        const scrollPosition = parseInt(sessionStorage.getItem('scrollPosition'));

        // Use setTimeout to ensure the page is fully loaded
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);

            // Restore element scroll positions
            if (sessionStorage.getItem('elementScrollPositions')) {
                const scrollPositions = JSON.parse(sessionStorage.getItem('elementScrollPositions'));

                Object.keys(scrollPositions).forEach(id => {
                    const el = document.getElementById(id) || document.querySelector(`[data-scroll-id="${id}"]`);
                    if (el) {
                        el.scrollTop = scrollPositions[id].scrollTop;
                        el.scrollLeft = scrollPositions[id].scrollLeft;
                    }
                });
            }

            // Clear storage after restoration
            sessionStorage.removeItem('scrollPosition');
            sessionStorage.removeItem('elementScrollPositions');
        }, 100);
    }
}

/**
 * Initialize scroll position memory for tabs and accordions
 */
function initScrollMemory() {
    // Store scroll positions when switching tabs
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');

    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('shown.bs.tab', function(e) {
            // Store the previous tab's scroll position
            const previousTab = document.querySelector(e.relatedTarget.getAttribute('href'));
            if (previousTab) {
                previousTab.dataset.scrollPosition = window.pageYOffset;
            }

            // Restore this tab's scroll position if it exists
            const currentTab = document.querySelector(e.target.getAttribute('href'));
            if (currentTab && currentTab.dataset.scrollPosition) {
                setTimeout(() => {
                    window.scrollTo(0, parseInt(currentTab.dataset.scrollPosition));
                }, 10);
            }
        });
    });

    // Store scroll positions when toggling accordions
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Store current scroll position
            this.dataset.scrollPosition = window.pageYOffset;
        });

        // When accordion is shown, restore scroll position
        const accordionId = button.getAttribute('data-bs-target') ||
                           button.getAttribute('href');

        if (accordionId) {
            const accordionContent = document.querySelector(accordionId);
            if (accordionContent) {
                accordionContent.addEventListener('shown.bs.collapse', function() {
                    const button = document.querySelector(`[data-bs-target="${accordionId}"], [href="${accordionId}"]`);
                    if (button && button.dataset.scrollPosition) {
                        setTimeout(() => {
                            window.scrollTo(0, parseInt(button.dataset.scrollPosition));
                        }, 10);
                    }
                });
            }
        }
    });
}

/**
 * Creates a scroll progress indicator at the top of the page
 */
function createScrollProgressIndicator() {
    // Check if it already exists
    if (document.querySelector('.scroll-progress-container')) {
        return;
    }

    // Check if user is authenticated
    const isAuthenticated = document.body.getAttribute('data-user-logged-in') === 'true';

    // Only add progress indicator for authenticated users
    if (!isAuthenticated) {
        console.log('Scroll progress indicator not added: User not authenticated');
        return;
    }

    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';

    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);

    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;

        progressBar.style.width = scrollProgress + '%';
    });
}

/**
 * Creates a scroll-to-top button that appears when scrolling down
 */
function createScrollToTopButton() {
    // Check if it already exists
    if (document.querySelector('.scroll-indicator')) {
        return;
    }

    const scrollButton = document.createElement('div');
    scrollButton.className = 'scroll-indicator';
    scrollButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    scrollButton.setAttribute('role', 'button');
    scrollButton.setAttribute('tabindex', '0');

    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (document.documentElement.scrollTop > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    // Scroll to top when clicked
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Keyboard accessibility
    scrollButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

/**
 * Initialize parallax effects for certain elements
 */
function initParallaxEffects() {
    // Add subtle parallax to header backgrounds
    const headerElements = document.querySelectorAll('.pipeline-demo-header, .section-header, .hero-section');

    if (headerElements.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;

            headerElements.forEach(element => {
                const speed = 0.15; // Adjust for more/less movement
                const yPos = -(scrollY * speed);
                element.style.backgroundPosition = `center ${yPos}px`;
            });
        });
    }

    // Add subtle movement to feature cards on hover
    const featureCards = document.querySelectorAll('.feature-card, .resource-card');

    featureCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            // Apply subtle rotation
            card.style.transform = `perspective(1000px) rotateX(${-deltaY * 5}deg) rotateY(${deltaX * 5}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}
