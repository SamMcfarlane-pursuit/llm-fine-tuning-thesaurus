/**
 * Image Handler - Fixed Version
 * Ensures all images are properly loaded and displayed
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize image handling
    initImageHandling();
});

/**
 * Initialize image handling
 */
function initImageHandling() {
    try {
        console.log('Initializing image handling...');

        // Check if image handling is already initialized to prevent duplicates
        if (window.imageHandlingInitialized) {
            console.log('Image handling already initialized');
            return;
        }

        // Add image error handling to all images
        addImageErrorHandling();

        // Add image zoom functionality
        addImageZoom();

        // Set up mutation observer to handle dynamically added images
        setupImageObserver();

        // Mark as initialized
        window.imageHandlingInitialized = true;

        console.log('Image handling initialized successfully');
    } catch (error) {
        console.error('Error initializing image handling:', error);
    }
}

/**
 * Set up mutation observer to handle dynamically added images
 */
function setupImageObserver() {
    // Create a mutation observer to watch for new images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if nodes were added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(function(node) {
                    // If the added node is an image, handle it
                    if (node.nodeName === 'IMG') {
                        handleNewImage(node);
                    }
                    // If the added node contains images, handle them
                    else if (node.nodeType === 1) { // Element node
                        const images = node.querySelectorAll('img');
                        images.forEach(function(img) {
                            handleNewImage(img);
                        });
                    }
                });
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('Image mutation observer set up');
}

/**
 * Handle a newly added image
 * @param {HTMLImageElement} img - The new image element
 */
function handleNewImage(img) {
    // Store original source
    const originalSrc = img.src;

    // Add error event listener
    img.addEventListener('error', function() {
        handleImageError(img, originalSrc);
    });

    // Add load event listener
    img.addEventListener('load', function() {
        // Add loaded class
        img.classList.add('image-loaded');
    });

    // Check if the image is large enough for zoom
    if (img.width > 100 && img.height > 100 &&
        !img.classList.contains('icon') &&
        !img.classList.contains('avatar')) {
        // Add zoom cursor
        img.style.cursor = 'zoom-in';

        // Add click event
        img.addEventListener('click', function() {
            showImageModal(img);
        });
    }
}

/**
 * Add error handling to all images
 */
function addImageErrorHandling() {
    // Get all images
    const images = document.querySelectorAll('img');

    // Add error handling to each image
    images.forEach(function(img) {
        // Store original source
        const originalSrc = img.src;

        // Add error event listener
        img.addEventListener('error', function() {
            handleImageError(img, originalSrc);
        });

        // Add load event listener
        img.addEventListener('load', function() {
            // Add loaded class
            img.classList.add('image-loaded');
        });
    });
}

/**
 * Handle image loading errors
 * @param {HTMLImageElement} img - The image element that failed to load
 * @param {string} originalSrc - The original source of the image
 */
function handleImageError(img, originalSrc) {
    console.warn('Image failed to load:', originalSrc);

    // Add error class
    img.classList.add('image-error');

    // Set fallback image
    img.src = '/static/img/image-placeholder.svg';

    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'image-error-message';
    errorMessage.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image could not be loaded';

    // Create retry button
    const retryButton = document.createElement('button');
    retryButton.className = 'image-retry-button';
    retryButton.innerHTML = 'Retry';
    retryButton.addEventListener('click', function() {
        // Remove error class
        img.classList.remove('image-error');

        // Remove error message
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }

        // Try loading the original image again
        img.src = originalSrc;
    });

    // Add retry button to error message
    errorMessage.appendChild(retryButton);

    // Add error message after the image
    if (img.parentNode) {
        if (img.nextSibling) {
            img.parentNode.insertBefore(errorMessage, img.nextSibling);
        } else {
            img.parentNode.appendChild(errorMessage);
        }
    }
}

/**
 * Add zoom functionality to images
 */
function addImageZoom() {
    // Get all images (except tiny ones and icons)
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
        // Skip small images and icons
        return img.width > 100 && img.height > 100 &&
               !img.classList.contains('icon') &&
               !img.classList.contains('avatar');
    });

    // Add click event to each image
    images.forEach(function(img) {
        // Add zoom cursor
        img.style.cursor = 'zoom-in';

        // Add click event
        img.addEventListener('click', function() {
            showImageModal(img);
        });
    });
}

/**
 * Show image in a modal
 * @param {HTMLImageElement} img - The image element to show in the modal
 */
function showImageModal(img) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';

    // Create modal content
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="image-modal-close">&times;</span>
            <img src="${img.src}" alt="${img.alt || ''}" class="image-modal-img">
            <div class="image-modal-caption">${img.alt || ''}</div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Show modal
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);

    // Add close event to close button
    modal.querySelector('.image-modal-close').addEventListener('click', function() {
        closeImageModal(modal);
    });

    // Add close event to modal background
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeImageModal(modal);
        }
    });

    // Add escape key event
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeImageModal(modal);
        }
    });
}

/**
 * Close image modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeImageModal(modal) {
    // Hide modal
    modal.classList.remove('show');

    // Remove modal after animation
    setTimeout(function() {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Add CSS for image modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
.image-modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.image-modal.show {
    opacity: 1;
    visibility: visible;
}

.image-modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90%;
    max-height: 90%;
}

.image-modal-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 5px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.image-modal-caption {
    color: white;
    padding: 10px;
    text-align: center;
    margin-top: 10px;
    max-width: 80%;
}

.image-modal-close {
    position: absolute;
    top: -30px;
    right: -30px;
    color: white;
    font-size: 30px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1;
}

.image-error-message {
    background-color: rgba(220, 53, 69, 0.9);
    color: white;
    padding: 10px;
    margin-top: 5px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.image-retry-button {
    background-color: white;
    color: #dc3545;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    margin-left: 10px;
}

.image-retry-button:hover {
    background-color: #f8f9fa;
}

@media (max-width: 768px) {
    .image-modal-content {
        max-width: 95%;
    }

    .image-modal-close {
        top: -20px;
        right: -10px;
        font-size: 24px;
    }
}
`;

// Add style to head
document.head.appendChild(modalStyle);
