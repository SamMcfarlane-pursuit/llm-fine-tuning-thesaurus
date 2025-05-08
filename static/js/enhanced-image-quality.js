/**
 * Enhanced Image Quality JavaScript
 * Improves image loading, rendering, and interaction for a silky smooth experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply enhanced image container to all images in tutorial cards
    enhanceTutorialImages();
    
    // Apply lazy loading with smooth fade-in
    setupLazyLoading();
    
    // Setup image zoom functionality
    setupImageZoom();
    
    // Handle image errors gracefully
    handleImageErrors();
    
    // Apply high-resolution image optimizations
    optimizeForHighDPI();
});

/**
 * Enhance tutorial images with better containers and effects
 */
function enhanceTutorialImages() {
    // Find all images in tutorial cards
    const tutorialImages = document.querySelectorAll('.tutorial-card img:not(.enhanced)');
    
    tutorialImages.forEach(img => {
        // Skip small icons and badges
        if (img.width < 50 || img.height < 50 || img.closest('.badge') || img.closest('button')) {
            return;
        }
        
        // Create enhanced container
        const container = document.createElement('div');
        container.className = 'enhanced-image-container';
        
        // Clone the image and add enhanced class
        const enhancedImg = img.cloneNode(true);
        enhancedImg.classList.add('enhanced-image', 'enhanced');
        
        // Add loading animation
        enhancedImg.classList.add('loading-image');
        
        // Replace original image with enhanced container
        container.appendChild(enhancedImg);
        img.parentNode.replaceChild(container, img);
        
        // Add caption if alt text exists
        if (enhancedImg.alt && enhancedImg.alt.trim() !== '') {
            const caption = document.createElement('div');
            caption.className = 'image-caption';
            caption.textContent = enhancedImg.alt;
            container.appendChild(caption);
        }
        
        // Remove loading class when image loads
        enhancedImg.onload = function() {
            enhancedImg.classList.remove('loading-image');
            enhancedImg.classList.add('image-loaded');
        };
    });
}

/**
 * Setup lazy loading with smooth fade-in effect
 */
function setupLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.classList.add('fade-in');
                        img.onload = function() {
                            img.classList.add('loaded');
                            img.classList.remove('loading-image');
                        };
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Find all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
        });
    }
}

/**
 * Setup image zoom functionality
 */
function setupImageZoom() {
    // Find all images that should be zoomable
    const zoomableImages = document.querySelectorAll('.enhanced-image, .diagram-image, .content-image');
    
    zoomableImages.forEach(img => {
        // Skip small images
        if (img.naturalWidth < 100 || img.naturalHeight < 100) {
            return;
        }
        
        // Add zoomable class
        img.classList.add('zoomable');
        
        // Create modal for zoomed view
        img.addEventListener('click', function() {
            // Create modal if it doesn't exist
            let modal = document.getElementById('image-zoom-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'image-zoom-modal';
                modal.className = 'image-modal';
                
                const modalContent = document.createElement('img');
                modalContent.className = 'modal-content';
                
                const closeBtn = document.createElement('span');
                closeBtn.className = 'modal-close';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    modal.classList.remove('active');
                });
                
                modal.appendChild(modalContent);
                modal.appendChild(closeBtn);
                
                // Close modal when clicking outside the image
                modal.addEventListener('click', function() {
                    modal.classList.remove('active');
                });
                
                document.body.appendChild(modal);
            }
            
            // Set image source and show modal
            const modalImg = modal.querySelector('.modal-content');
            modalImg.src = this.src;
            modal.classList.add('active');
        });
    });
}

/**
 * Handle image errors gracefully
 */
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.onerror = function() {
            // Skip if already handled
            if (img.classList.contains('image-error')) {
                return;
            }
            
            img.classList.add('image-error');
            
            // Create error message container
            const container = img.closest('.enhanced-image-container') || img.parentNode;
            
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'image-error-message';
            errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Image could not be loaded';
            
            // Add retry button
            const retryBtn = document.createElement('button');
            retryBtn.className = 'image-retry-button';
            retryBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Retry';
            retryBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Remove error classes
                img.classList.remove('image-error');
                
                // Force reload by appending timestamp
                const originalSrc = img.getAttribute('data-original-src') || img.src;
                img.setAttribute('data-original-src', originalSrc);
                img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime();
                
                // Remove error message
                if (errorMsg.parentNode) {
                    errorMsg.parentNode.removeChild(errorMsg);
                }
            });
            
            errorMsg.appendChild(retryBtn);
            container.appendChild(errorMsg);
        };
    });
}

/**
 * Optimize images for high-DPI displays
 */
function optimizeForHighDPI() {
    // Check if device has high-DPI display
    const isHighDPI = window.devicePixelRatio > 1.5;
    
    if (isHighDPI) {
        // Find all images that might have high-res versions
        const images = document.querySelectorAll('img:not([srcset])');
        
        images.forEach(img => {
            const src = img.src;
            
            // Check if there might be a 2x version available
            if (src && !src.includes('@2x') && !src.includes('data:')) {
                // Try to load 2x version
                const ext = src.substring(src.lastIndexOf('.'));
                const base = src.substring(0, src.lastIndexOf('.'));
                const highResSrc = base + '@2x' + ext;
                
                // Create a test image to see if high-res version exists
                const testImg = new Image();
                testImg.onload = function() {
                    // If high-res version exists, use it
                    img.src = highResSrc;
                };
                testImg.src = highResSrc;
            }
        });
    }
}

// Re-apply enhancements when content changes (for dynamic content)
document.addEventListener('contentChanged', function() {
    enhanceTutorialImages();
    setupLazyLoading();
    setupImageZoom();
    handleImageErrors();
});

// Re-apply enhancements when new content is loaded via AJAX
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOnReadyStateChange = xhr.onreadystatechange;
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Wait for DOM to update
            setTimeout(function() {
                enhanceTutorialImages();
                setupLazyLoading();
                setupImageZoom();
                handleImageErrors();
            }, 100);
        }
        
        if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(this, arguments);
        }
    };
    
    return xhr;
};
