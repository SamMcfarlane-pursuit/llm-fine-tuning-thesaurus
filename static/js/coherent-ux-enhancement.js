/**
 * Coherent UX Enhancement JavaScript
 * Improves overall coherence and user experience across the entire website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSmoothScrolling();
    initCardHoverEffects();
    initFeatureCardInteractions();
    initProgressiveDisclosure();
    initAccessibilityImprovements();
    initResponsiveAdjustments();
    initPageTransitions();
    initLearningPathHighlight();
    initConceptMapInteractions();
    initSearchEnhancements();
    
    // Add a class to body when page is fully loaded
    document.body.classList.add('page-loaded');
});

/**
 * Initialize smooth scrolling for all anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's a dropdown toggle or other special link
            if (targetId === '#' || this.getAttribute('data-bs-toggle')) {
                return;
            }
            
            e.preventDefault();
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Add highlight effect to target element
                targetElement.classList.add('highlight-target');
                setTimeout(() => {
                    targetElement.classList.remove('highlight-target');
                }, 2000);
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize card hover effects for better visual feedback
 */
function initCardHoverEffects() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
        });
    });
}

/**
 * Initialize feature card interactions for better engagement
 */
function initFeatureCardInteractions() {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('feature-card-active');
            
            // Animate the icon
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.classList.add('feature-icon-pulse');
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('feature-card-active');
            
            // Remove icon animation
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.classList.remove('feature-icon-pulse');
            }
        });
    });
}

/**
 * Initialize progressive disclosure for complex content
 */
function initProgressiveDisclosure() {
    document.querySelectorAll('.disclosure-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const isExpanded = targetElement.classList.contains('expanded');
                
                // Toggle expanded state
                if (isExpanded) {
                    targetElement.classList.remove('expanded');
                    this.setAttribute('aria-expanded', 'false');
                    this.innerHTML = this.innerHTML.replace('Less', 'More');
                } else {
                    targetElement.classList.add('expanded');
                    this.setAttribute('aria-expanded', 'true');
                    this.innerHTML = this.innerHTML.replace('More', 'Less');
                }
                
                // Smooth height transition is handled by CSS
            }
        });
    });
}

/**
 * Initialize accessibility improvements
 */
function initAccessibilityImprovements() {
    // Add focus indicators
    document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focus-visible');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focus-visible');
        });
    });
    
    // Improve keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Show focus outlines when using keyboard navigation
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // Hide focus outlines when using mouse
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

/**
 * Initialize responsive adjustments
 */
function initResponsiveAdjustments() {
    // Function to apply responsive adjustments
    function applyResponsiveAdjustments() {
        const windowWidth = window.innerWidth;
        
        // Adjust navigation for mobile
        if (windowWidth < 768) {
            document.querySelectorAll('.navbar .dropdown-menu').forEach(menu => {
                menu.classList.add('mobile-dropdown');
            });
        } else {
            document.querySelectorAll('.navbar .dropdown-menu').forEach(menu => {
                menu.classList.remove('mobile-dropdown');
            });
        }
        
        // Adjust card layouts for different screen sizes
        if (windowWidth < 576) {
            document.querySelectorAll('.card-body').forEach(body => {
                body.classList.add('compact-card-body');
            });
        } else {
            document.querySelectorAll('.card-body').forEach(body => {
                body.classList.remove('compact-card-body');
            });
        }
    }
    
    // Apply on load
    applyResponsiveAdjustments();
    
    // Apply on resize
    window.addEventListener('resize', applyResponsiveAdjustments);
}

/**
 * Initialize page transitions for smoother navigation
 */
function initPageTransitions() {
    // Add transition class to body when navigating away
    document.querySelectorAll('a:not([href^="#"]):not([target="_blank"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if it's a dropdown toggle or other special link
            if (this.getAttribute('data-bs-toggle') || this.getAttribute('href') === '#') {
                return;
            }
            
            // Add transition-out class to body
            document.body.classList.add('page-transition-out');
            
            // Allow time for transition before navigating
            const href = this.getAttribute('href');
            if (href && !href.startsWith('javascript:')) {
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
}

/**
 * Initialize learning path highlight
 */
function initLearningPathHighlight() {
    const currentPath = window.location.pathname;
    
    // Highlight current page in navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.includes(href) && href !== '/')) {
            link.classList.add('active-nav-link');
            
            // If it's in a dropdown, also highlight the parent
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.classList.add('active-nav-link');
                }
            }
        }
    });
}

/**
 * Initialize concept map interactions
 */
function initConceptMapInteractions() {
    document.querySelectorAll('.node').forEach(node => {
        node.addEventListener('mouseenter', function() {
            this.classList.add('node-highlight');
            
            // Highlight connected nodes
            const connections = this.getAttribute('data-connections');
            if (connections) {
                connections.split(',').forEach(id => {
                    const connectedNode = document.getElementById(id);
                    if (connectedNode) {
                        connectedNode.classList.add('node-connected');
                    }
                });
            }
        });
        
        node.addEventListener('mouseleave', function() {
            this.classList.remove('node-highlight');
            
            // Remove highlight from connected nodes
            document.querySelectorAll('.node-connected').forEach(connectedNode => {
                connectedNode.classList.remove('node-connected');
            });
        });
    });
}

/**
 * Initialize search enhancements
 */
function initSearchEnhancements() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    
    searchInputs.forEach(input => {
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear-button';
        clearButton.innerHTML = '&times;';
        clearButton.setAttribute('type', 'button');
        clearButton.setAttribute('aria-label', 'Clear search');
        clearButton.style.display = 'none';
        
        // Insert after input
        input.parentNode.insertBefore(clearButton, input.nextSibling);
        
        // Show/hide clear button based on input content
        input.addEventListener('input', function() {
            clearButton.style.display = this.value ? 'block' : 'none';
        });
        
        // Clear input when button is clicked
        clearButton.addEventListener('click', function() {
            input.value = '';
            input.focus();
            this.style.display = 'none';
            
            // Trigger input event to update search results
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
        });
    });
}
