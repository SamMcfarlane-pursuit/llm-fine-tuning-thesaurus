/**
 * Image Enhancer Script
 * Automatically enhances the visibility of images on the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply enhancements to all images
    enhanceAllImages();
    
    // Set up a mutation observer to enhance images that are added dynamically
    observeDynamicImages();
    
    // Add image error handling
    setupImageErrorHandling();
});

/**
 * Enhances all images on the page for better visibility
 */
function enhanceAllImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Skip images that already have enhancement classes
        if (img.classList.contains('enhanced-image')) return;
        
        // Add enhancement class
        img.classList.add('enhanced-image');
        
        // Add loading attribute for better performance
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add alt text if missing
        if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
            const imgSrc = img.getAttribute('src');
            const fileName = imgSrc.split('/').pop().split('.')[0];
            img.setAttribute('alt', `Image: ${fileName.replace(/-|_/g, ' ')}`);
        }
        
        // Add click to enlarge functionality
        img.addEventListener('click', function() {
            openImageModal(this);
        });
        
        // Add title attribute for hover tooltip if missing
        if (!img.hasAttribute('title')) {
            img.setAttribute('title', 'Click to enlarge');
        }
    });
}

/**
 * Sets up a mutation observer to enhance images that are added dynamically
 */
function observeDynamicImages() {
    // Create an observer instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if nodes were added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(function(node) {
                    // If the added node is an image, enhance it
                    if (node.nodeName === 'IMG') {
                        enhanceSingleImage(node);
                    }
                    // If the added node contains images, enhance them
                    else if (node.nodeType === 1) { // ELEMENT_NODE
                        const images = node.querySelectorAll('img');
                        images.forEach(img => enhanceSingleImage(img));
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Enhances a single image
 * @param {HTMLImageElement} img - The image to enhance
 */
function enhanceSingleImage(img) {
    // Skip images that already have enhancement classes
    if (img.classList.contains('enhanced-image')) return;
    
    // Add enhancement class
    img.classList.add('enhanced-image');
    
    // Add loading attribute for better performance
    if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
    }
    
    // Add alt text if missing
    if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        const imgSrc = img.getAttribute('src');
        const fileName = imgSrc.split('/').pop().split('.')[0];
        img.setAttribute('alt', `Image: ${fileName.replace(/-|_/g, ' ')}`);
    }
    
    // Add click to enlarge functionality
    img.addEventListener('click', function() {
        openImageModal(this);
    });
    
    // Add title attribute for hover tooltip if missing
    if (!img.hasAttribute('title')) {
        img.setAttribute('title', 'Click to enlarge');
    }
}

/**
 * Sets up error handling for images
 */
function setupImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
        
        // Check if image is already broken
        if (img.complete && img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
}

/**
 * Handles image loading errors
 * @param {HTMLImageElement} img - The image that failed to load
 */
function handleImageError(img) {
    // Add error class
    img.classList.add('image-error');
    
    // Create error message container if it doesn't exist
    if (!img.nextElementSibling || !img.nextElementSibling.classList.contains('image-error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.classList.add('image-error-message');
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image could not be loaded';
        
        // Insert error message after the image
        img.parentNode.insertBefore(errorMsg, img.nextSibling);
    }
}

/**
 * Opens an image in a modal for better viewing
 * @param {HTMLImageElement} img - The image to display in the modal
 */
function openImageModal(img) {
    // Check if modal already exists
    let modal = document.getElementById('imageModal');
    
    // Create modal if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img class="image-modal-img">
                <div class="image-modal-caption"></div>
                <div class="image-modal-controls">
                    <button class="image-modal-zoom-in"><i class="bi bi-zoom-in"></i></button>
                    <button class="image-modal-zoom-out"><i class="bi bi-zoom-out"></i></button>
                    <button class="image-modal-reset"><i class="bi bi-arrow-counterclockwise"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners for modal controls
        const closeBtn = modal.querySelector('.image-modal-close');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Add zoom controls functionality
        let zoomLevel = 1;
        const zoomIn = modal.querySelector('.image-modal-zoom-in');
        const zoomOut = modal.querySelector('.image-modal-zoom-out');
        const zoomReset = modal.querySelector('.image-modal-reset');
        const modalImg = modal.querySelector('.image-modal-img');
        
        zoomIn.addEventListener('click', function() {
            zoomLevel += 0.2;
            modalImg.style.transform = `scale(${zoomLevel})`;
        });
        
        zoomOut.addEventListener('click', function() {
            zoomLevel = Math.max(0.5, zoomLevel - 0.2);
            modalImg.style.transform = `scale(${zoomLevel})`;
        });
        
        zoomReset.addEventListener('click', function() {
            zoomLevel = 1;
            modalImg.style.transform = `scale(${zoomLevel})`;
        });
    }
    
    // Update modal content
    const modalImg = modal.querySelector('.image-modal-img');
    const modalCaption = modal.querySelector('.image-modal-caption');
    
    modalImg.src = img.src;
    modalCaption.textContent = img.alt || 'Image';
    
    // Reset zoom level
    modalImg.style.transform = 'scale(1)';
    
    // Display modal
    modal.style.display = 'flex';
}
