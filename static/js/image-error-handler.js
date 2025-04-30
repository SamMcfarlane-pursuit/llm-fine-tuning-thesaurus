/**
 * Image Error Handler
 * This script checks for 404 errors on images and provides fallbacks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check all images on the page
    checkAllImages();
    
    // Add event listener for dynamic content
    observeDynamicContent();
});

/**
 * Check all images on the page for errors
 */
function checkAllImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Skip images that already have error handlers
        if (img.hasAttribute('data-error-handled')) {
            return;
        }
        
        // Mark as handled
        img.setAttribute('data-error-handled', 'true');
        
        // Add error handler
        img.addEventListener('error', function(e) {
            handleImageError(this);
        });
        
        // Check if image is already broken (for images that failed before script loaded)
        if (img.complete && img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
}

/**
 * Handle image loading errors
 * @param {HTMLImageElement} img - The image element that failed to load
 */
function handleImageError(img) {
    console.warn('Image failed to load:', img.src);
    
    // Try to determine the type of image
    let fallbackImage = 'static/img/image-placeholder.svg';
    
    // Check if it's an avatar
    if (img.src.includes('avatar') || img.classList.contains('rounded-circle')) {
        fallbackImage = 'static/img/default-avatar.svg';
    }
    // Check if it's a diagram
    else if (img.classList.contains('diagram-image') || img.classList.contains('exercise-diagram')) {
        fallbackImage = 'static/img/diagram-placeholder.svg';
    }
    // Check if it's an error page image
    else if (img.src.includes('404.svg')) {
        fallbackImage = 'static/img/404-placeholder.svg';
    }
    else if (img.src.includes('500.svg')) {
        fallbackImage = 'static/img/500-placeholder.svg';
    }
    
    // Add error styling
    img.classList.add('image-error');
    
    // Set fallback image
    img.src = fallbackImage;
    
    // Add error message if not already present
    if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('image-error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error-message';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image could not be loaded';
        
        // Only add error message if the image is not tiny (like an icon)
        if (img.width > 50 && img.height > 50) {
            if (img.parentNode) {
                // Insert after the image
                if (img.nextSibling) {
                    img.parentNode.insertBefore(errorMsg, img.nextSibling);
                } else {
                    img.parentNode.appendChild(errorMsg);
                }
            }
        }
    }
}

/**
 * Observe dynamic content for new images
 */
function observeDynamicContent() {
    // Create a mutation observer to watch for new images
    const observer = new MutationObserver(function(mutations) {
        let hasNewImages = false;
        
        mutations.forEach(function(mutation) {
            // Check for new nodes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    
                    // Check if the node is an element
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node is an image
                        if (node.tagName === 'IMG') {
                            hasNewImages = true;
                        }
                        // Check if the node contains images
                        else if (node.querySelectorAll) {
                            const images = node.querySelectorAll('img');
                            if (images.length > 0) {
                                hasNewImages = true;
                            }
                        }
                    }
                }
            }
        });
        
        // If new images were added, check them
        if (hasNewImages) {
            checkAllImages();
        }
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
