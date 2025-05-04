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

    // Store the original source for retry attempts
    const originalSrc = img.getAttribute('data-original-src') || img.src;

    // If this is the first error, store the original source and try to reload
    if (!img.hasAttribute('data-original-src')) {
        img.setAttribute('data-original-src', originalSrc);

        // Try to reload the image with a cache-busting parameter
        const timestamp = new Date().getTime();
        const cacheBustUrl = originalSrc + (originalSrc.includes('?') ? '&' : '?') + '_cb=' + timestamp;

        console.log('Attempting to reload image with cache busting:', cacheBustUrl);
        img.src = cacheBustUrl;

        // Set a retry count
        img.setAttribute('data-retry-count', '1');

        // Return early to give the reload a chance
        return;
    }

    // If we've already tried reloading, check retry count
    const retryCount = parseInt(img.getAttribute('data-retry-count') || '0', 10);

    // Try up to 3 times with increasing delays
    if (retryCount < 3) {
        const nextRetryCount = retryCount + 1;
        img.setAttribute('data-retry-count', nextRetryCount.toString());

        // Add increasing delay for each retry
        const delay = retryCount * 1000; // 1s, 2s, 3s

        console.log(`Retry ${nextRetryCount}/3 for image ${originalSrc} after ${delay}ms delay`);

        setTimeout(() => {
            const timestamp = new Date().getTime();
            const cacheBustUrl = originalSrc + (originalSrc.includes('?') ? '&' : '?') + '_cb=' + timestamp + '_retry=' + nextRetryCount;
            img.src = cacheBustUrl;
        }, delay);

        return;
    }

    // After all retries, use fallback image
    console.error(`Image failed to load after 3 retries: ${originalSrc}`);

    // Try to determine the type of image for appropriate fallback
    let fallbackImage = '/static/img/image-placeholder.svg';

    // Check if it's an avatar
    if (originalSrc.includes('avatar') || img.classList.contains('rounded-circle')) {
        fallbackImage = '/static/img/default-avatar.svg';
    }
    // Check if it's a diagram
    else if (img.classList.contains('diagram-image') || img.classList.contains('exercise-diagram') ||
             originalSrc.includes('diagram') || originalSrc.includes('flow')) {
        fallbackImage = '/static/img/diagram-placeholder-hd.svg';
    }
    // Check if it's an error page image
    else if (originalSrc.includes('404.svg')) {
        fallbackImage = '/static/img/404-placeholder.svg';
    }
    else if (originalSrc.includes('500.svg')) {
        fallbackImage = '/static/img/500-placeholder.svg';
    }

    // Add error styling
    img.classList.add('image-error');

    // Set fallback image with absolute path to ensure it works
    img.src = fallbackImage;

    // Add error message if not already present
    if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('image-error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error-message';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image could not be loaded';

        // Add a retry button
        const retryButton = document.createElement('button');
        retryButton.className = 'image-retry-button';
        retryButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Retry';
        retryButton.addEventListener('click', function(e) {
            e.stopPropagation();
            // Remove error styling
            img.classList.remove('image-error');
            // Reset retry count
            img.setAttribute('data-retry-count', '0');
            // Try loading the original image again
            img.src = originalSrc;
            // Remove error message
            if (errorMsg.parentNode) {
                errorMsg.parentNode.removeChild(errorMsg);
            }
        });

        errorMsg.appendChild(retryButton);

        // Only add error message if the image is not tiny (like an icon)
        if (img.width > 50 && img.height > 50) {
            if (img.parentNode) {
                // Create a wrapper if it doesn't exist
                if (!img.parentNode.classList.contains('image-container')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-container';
                    img.parentNode.insertBefore(wrapper, img);
                    wrapper.appendChild(img);
                }

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
