/**
 * Learn Page Enhanced Functionality
 * Provides robust, coherent, and interactive learning experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all learn page components
    initConceptVisualization();
    initExerciseNavigation();
    initProgressTracking();
    initAccessibilityFeatures();
    initResponsiveFeatures();
    initSmoothScrolling();
    
    console.log('Learn page initialized successfully');
});

/**
 * Initialize concept visualization with enhanced error handling
 */
function initConceptVisualization() {
    const conceptsContainer = document.getElementById('concepts-visualization');
    if (!conceptsContainer) return;

    // Show loading state
    showVisualizationLoading(conceptsContainer);

    // Fetch concepts visualization with timeout
    const fetchTimeout = setTimeout(() => {
        showVisualizationError(conceptsContainer, 'Request timeout. Please try again.');
    }, 10000);

    fetch('/api/llm-concepts-visualization')
        .then(response => {
            clearTimeout(fetchTimeout);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            renderConceptVisualization(conceptsContainer, data);
        })
        .catch(error => {
            console.error('Error loading concept visualization:', error);
            showVisualizationError(conceptsContainer, error.message);
        });
}

/**
 * Show loading state for visualization
 */
function showVisualizationLoading(container) {
    container.innerHTML = `
        <div class="visualization-loading">
            <div class="spinner"></div>
            <p>Loading interactive concept map...</p>
            <small class="text-muted">This may take a few moments</small>
        </div>
    `;
}

/**
 * Show error state for visualization
 */
function showVisualizationError(container, message) {
    container.innerHTML = `
        <div class="visualization-loading">
            <div style="color: #dc3545; font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
            <p style="color: #dc3545; font-weight: 600;">Failed to load concept map</p>
            <small class="text-muted">${message}</small>
            <div class="mt-3">
                <button class="btn btn-learn btn-sm" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
            </div>
        </div>
    `;
}

/**
 * Render concept visualization
 */
function renderConceptVisualization(container, data) {
    try {
        if (data.visualization_path) {
            // Load iframe visualization
            const iframe = document.createElement('iframe');
            iframe.src = data.visualization_path;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.setAttribute('title', 'LLM Fine-tuning Concept Map');
            
            container.innerHTML = '';
            container.appendChild(iframe);
            
            // Setup zoom controls for iframe
            setupZoomControls(iframe);
        } else {
            // Create fallback visualization
            createFallbackVisualization(container);
        }
    } catch (error) {
        console.error('Error rendering visualization:', error);
        showVisualizationError(container, 'Failed to render visualization');
    }
}

/**
 * Create fallback visualization when API fails
 */
function createFallbackVisualization(container) {
    container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #3c6430;">🧠</div>
            <h4 style="color: #3c6430; margin-bottom: 1rem;">Concept Map Coming Soon</h4>
            <p style="color: #6c757d; max-width: 400px; line-height: 1.6;">
                We're working on an interactive concept map to help you visualize the relationships between LLM fine-tuning concepts. 
                In the meantime, explore the exercises below to start your learning journey.
            </p>
            <div class="mt-3">
                <a href="#exercises" class="btn btn-learn">
                    <i class="bi bi-arrow-down me-2"></i>Start Learning
                </a>
            </div>
        </div>
    `;
}

/**
 * Setup zoom controls for visualization
 */
function setupZoomControls(iframe) {
    const zoomInBtn = document.getElementById('concepts-zoom-in-btn');
    const zoomOutBtn = document.getElementById('concepts-zoom-out-btn');
    const resetZoomBtn = document.getElementById('concepts-reset-zoom-btn');

    if (zoomInBtn && zoomOutBtn && resetZoomBtn) {
        zoomInBtn.addEventListener('click', () => {
            try {
                iframe.contentWindow.postMessage({ action: 'zoomIn' }, '*');
            } catch (error) {
                console.warn('Zoom control not available for this visualization');
            }
        });

        zoomOutBtn.addEventListener('click', () => {
            try {
                iframe.contentWindow.postMessage({ action: 'zoomOut' }, '*');
            } catch (error) {
                console.warn('Zoom control not available for this visualization');
            }
        });

        resetZoomBtn.addEventListener('click', () => {
            try {
                iframe.contentWindow.postMessage({ action: 'resetZoom' }, '*');
            } catch (error) {
                console.warn('Zoom control not available for this visualization');
            }
        });
    }
}

/**
 * Initialize exercise navigation
 */
function initExerciseNavigation() {
    const exerciseItems = document.querySelectorAll('.exercise-item');
    
    exerciseItems.forEach(item => {
        // Add keyboard navigation
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Add hover effects with accessibility
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        // Track exercise clicks
        item.addEventListener('click', function() {
            const exerciseTitle = this.querySelector('.exercise-title').textContent;
            console.log(`Exercise clicked: ${exerciseTitle}`);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

/**
 * Initialize progress tracking
 */
function initProgressTracking() {
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Learn LLM Fine-Tuning',
            page_location: window.location.href
        });
    }

    // Track scroll progress
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestone scrolls
            if (maxScroll >= 25 && maxScroll < 50) {
                console.log('User scrolled 25% of learn page');
            } else if (maxScroll >= 50 && maxScroll < 75) {
                console.log('User scrolled 50% of learn page');
            } else if (maxScroll >= 75) {
                console.log('User scrolled 75% of learn page');
            }
        }
    });
}

/**
 * Initialize accessibility features
 */
function initAccessibilityFeatures() {
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#exercises';
    skipLink.textContent = 'Skip to exercises';
    skipLink.className = 'sr-only sr-only-focusable btn btn-learn';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '10px';
    skipLink.style.left = '10px';
    skipLink.style.zIndex = '9999';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Enhance focus management
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Add ARIA labels to interactive elements
    const interactiveElements = document.querySelectorAll('.exercise-item, .concept-card, .zoom-controls button');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            const text = element.textContent.trim().substring(0, 50);
            element.setAttribute('aria-label', text);
        }
    });
}

/**
 * Initialize responsive features
 */
function initResponsiveFeatures() {
    // Handle mobile-specific interactions
    if (window.innerWidth <= 768) {
        // Reduce animation intensity on mobile
        const style = document.createElement('style');
        style.textContent = `
            .exercise-item:hover {
                transform: translateY(-1px) !important;
            }
            .concept-card:hover {
                transform: translateY(-1px) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Recalculate visualization dimensions
            const visualization = document.getElementById('concepts-visualization');
            if (visualization) {
                visualization.style.height = '600px';
            }
        }, 100);
    });
}

/**
 * Initialize smooth scrolling
 */
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for external use
window.learnPage = {
    showNotification,
    initConceptVisualization,
    setupZoomControls
};
