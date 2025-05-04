/**
 * Razor Sharp Images JS
 * Enhances image quality, loading, and interaction for a premium visual experience
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing razor-sharp image enhancements...');
    
    // Initialize enhanced image loading
    initEnhancedImageLoading();
    
    // Add image zoom functionality
    addEnhancedImageZoom();
    
    // Add image quality enhancements
    enhanceImageQuality();
    
    // Set up mutation observer to handle dynamically added images
    setupEnhancedImageObserver();
    
    console.log('Razor-sharp image enhancements initialized successfully');
});

/**
 * Initialize enhanced image loading with preloading and progressive enhancement
 */
function initEnhancedImageLoading() {
    // Get all images that should be enhanced
    const allImages = document.querySelectorAll('img');
    
    // Create an intersection observer with options for earlier loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the image is in the viewport or close to it
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Skip already processed images
                if (img.classList.contains('razor-enhanced')) {
                    return;
                }
                
                // Mark as enhanced
                img.classList.add('razor-enhanced');
                
                // Add loading animation
                img.classList.add('image-loading');
                
                // Handle data-src for lazy loaded images
                if (img.dataset.src) {
                    // Create a new image object to preload
                    const tempImg = new Image();
                    
                    // Set up event handlers for the temporary image
                    tempImg.onload = function() {
                        // Replace the src with the data-src
                        img.src = img.dataset.src;
                        // Remove the data-src attribute
                        img.removeAttribute('data-src');
                        // Remove loading class
                        img.classList.remove('image-loading');
                        // Add loaded class
                        img.classList.add('image-loaded');
                        
                        // Apply enhancements
                        applyImageEnhancements(img);
                        
                        // Stop observing the image
                        observer.unobserve(img);
                    };
                    
                    // Set up error handling with retries
                    setupImageErrorHandling(tempImg, img.dataset.src, img);
                    
                    // Start loading the image
                    tempImg.src = img.dataset.src;
                } else {
                    // For regular images, just apply enhancements
                    if (img.complete && img.naturalHeight !== 0) {
                        // Image already loaded successfully
                        img.classList.remove('image-loading');
                        img.classList.add('image-loaded');
                        applyImageEnhancements(img);
                        observer.unobserve(img);
                    } else {
                        // Image still loading
                        img.addEventListener('load', function() {
                            this.classList.remove('image-loading');
                            this.classList.add('image-loaded');
                            applyImageEnhancements(this);
                            observer.unobserve(this);
                        });
                        
                        // Set up error handling
                        setupImageErrorHandling(img, img.src);
                    }
                }
            }
        });
    }, {
        rootMargin: '300px', // Start loading when image is 300px from viewport for earlier loading
        threshold: 0.01 // Trigger when even a tiny part of the image is visible
    });
    
    // Observe each image
    allImages.forEach(img => {
        // Skip tiny images like icons
        if (img.width < 50 && img.height < 50 && 
            (img.classList.contains('icon') || img.classList.contains('avatar'))) {
            return;
        }
        
        // Start observing
        imageObserver.observe(img);
    });
}

/**
 * Set up error handling with retries for images
 * @param {HTMLImageElement} img - The image element
 * @param {string} originalSrc - The original source URL
 * @param {HTMLImageElement} targetImg - Optional target image (if different from img)
 */
function setupImageErrorHandling(img, originalSrc, targetImg = null) {
    // Store the original source for retry attempts
    img.setAttribute('data-original-src', originalSrc);
    
    // Set up error handling with retries
    let retryCount = 0;
    const maxRetries = 3;
    
    img.addEventListener('error', function() {
        const imgToUpdate = targetImg || img;
        
        // Try to reload a few times before giving up
        if (retryCount < maxRetries) {
            console.warn(`Retry ${retryCount + 1}/${maxRetries} loading image:`, originalSrc);
            retryCount++;
            
            // Wait a bit before retrying with increasing delay
            setTimeout(() => {
                const timestamp = new Date().getTime();
                const cacheBustUrl = originalSrc + (originalSrc.includes('?') ? '&' : '?') + '_cb=' + timestamp + '_retry=' + retryCount;
                img.src = cacheBustUrl;
            }, 1000 * retryCount); // Increasing delay for each retry
            
            return;
        }
        
        // After all retries, use fallback image
        console.error(`Image failed to load after ${maxRetries} retries:`, originalSrc);
        
        // Try to determine the type of image for appropriate fallback
        let fallbackImage = '/static/img/image-placeholder.svg';
        
        // Check if it's a diagram
        if (originalSrc.includes('diagram') || originalSrc.includes('flow') || 
            imgToUpdate.classList.contains('diagram-image') || 
            imgToUpdate.classList.contains('exercise-diagram')) {
            fallbackImage = '/static/img/diagram-placeholder.svg';
        }
        
        // Add error styling
        imgToUpdate.classList.remove('image-loading');
        imgToUpdate.classList.add('image-error');
        
        // Set fallback image
        imgToUpdate.src = fallbackImage;
        
        // Add retry button if not already present
        if (!imgToUpdate.nextElementSibling || !imgToUpdate.nextElementSibling.classList.contains('image-retry-button')) {
            const retryButton = document.createElement('button');
            retryButton.className = 'image-retry-button';
            retryButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Retry';
            retryButton.addEventListener('click', function(e) {
                e.stopPropagation();
                // Remove error styling
                imgToUpdate.classList.remove('image-error');
                imgToUpdate.classList.add('image-loading');
                // Reset retry count
                retryCount = 0;
                // Try loading the original image again
                img.src = originalSrc;
                // Remove retry button
                if (retryButton.parentNode) {
                    retryButton.parentNode.removeChild(retryButton);
                }
            });
            
            // Add retry button after the image
            if (imgToUpdate.parentNode) {
                imgToUpdate.parentNode.insertBefore(retryButton, imgToUpdate.nextSibling);
            }
        }
    });
}

/**
 * Apply quality enhancements to an image
 * @param {HTMLImageElement} img - The image element to enhance
 */
function applyImageEnhancements(img) {
    // Skip tiny images like icons
    if (img.width < 50 && img.height < 50 && 
        (img.classList.contains('icon') || img.classList.contains('avatar'))) {
        return;
    }
    
    // Add appropriate classes based on image type
    if (img.src.includes('diagram') || img.src.includes('flow') || 
        img.alt.toLowerCase().includes('diagram') || img.alt.toLowerCase().includes('flow')) {
        img.classList.add('diagram-image');
    }
    
    // Make image zoomable if it's large enough
    if (img.naturalWidth > 200 && img.naturalHeight > 200 && 
        !img.classList.contains('icon') && !img.classList.contains('avatar')) {
        img.classList.add('zoomable');
    }
    
    // Add image to container if not already in one
    if (!img.parentElement.classList.contains('image-container') && 
        !img.classList.contains('diagram-image') && 
        !img.classList.contains('exercise-diagram')) {
        
        // Create a wrapper for the image
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-container');
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Add a caption if the image has alt text
        if (img.alt && !img.alt.trim().startsWith('_') && img.alt.trim() !== '') {
            const caption = document.createElement('div');
            caption.classList.add('image-caption');
            caption.textContent = img.alt;
            wrapper.appendChild(caption);
        }
    }
}

/**
 * Add enhanced zoom functionality to images
 */
function addEnhancedImageZoom() {
    // Create modal elements if they don't exist
    if (!document.getElementById('razor-image-modal')) {
        const modal = document.createElement('div');
        modal.id = 'razor-image-modal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <span class="modal-close">&times;</span>
            <img class="modal-content" id="razor-modal-img">
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        // Close on click outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Get the modal elements
    const modal = document.getElementById('razor-image-modal');
    const modalImg = document.getElementById('razor-modal-img');
    
    // Add click event to all zoomable images
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('zoomable')) {
            const img = e.target;
            
            // Show the modal
            modal.classList.add('active');
            
            // Set the image source
            modalImg.src = img.src;
            
            // Set alt text if available
            if (img.alt) {
                modalImg.alt = img.alt;
            }
        }
    });
}

/**
 * Enhance image quality for all images
 */
function enhanceImageQuality() {
    // Get all images
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
        // Skip tiny images like icons
        if (img.width < 50 && img.height < 50 && 
            (img.classList.contains('icon') || img.classList.contains('avatar'))) {
            return;
        }
        
        // Apply specific enhancements based on image type
        if (img.src.includes('diagram') || img.src.includes('flow') || 
            img.alt.toLowerCase().includes('diagram') || img.alt.toLowerCase().includes('flow')) {
            
            // Enhance diagram images
            img.classList.add('diagram-image');
        } else if (img.classList.contains('content-image')) {
            // Enhance content images
            img.style.filter = 'contrast(1.08) brightness(1.03) saturate(1.05)';
        } else {
            // Default enhancement for other images
            img.style.filter = 'contrast(1.05) brightness(1.02) saturate(1.03)';
        }
    });
}

/**
 * Set up mutation observer to handle dynamically added images
 */
function setupEnhancedImageObserver() {
    // Create a mutation observer to watch for new images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check for added nodes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    // Check if the added node is an image
                    if (node.nodeName === 'IMG') {
                        // Apply enhancements to the new image
                        handleNewImage(node);
                    } else if (node.nodeType === 1) {
                        // Check for images inside the added node
                        const images = node.querySelectorAll('img');
                        images.forEach(function(img) {
                            handleNewImage(img);
                        });
                    }
                });
            }
        });
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Handle a newly added image
 * @param {HTMLImageElement} img - The new image element
 */
function handleNewImage(img) {
    // Skip already processed images
    if (img.classList.contains('razor-enhanced')) {
        return;
    }
    
    // Mark as enhanced
    img.classList.add('razor-enhanced');
    
    // Add loading animation
    img.classList.add('image-loading');
    
    // Set up load event
    img.addEventListener('load', function() {
        this.classList.remove('image-loading');
        this.classList.add('image-loaded');
        applyImageEnhancements(this);
    });
    
    // Set up error handling
    setupImageErrorHandling(img, img.src);
}

// Add CSS for modal if not included in the CSS file
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .image-retry-button {
        display: inline-block;
        margin-top: 10px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
    }
    
    .image-retry-button:hover {
        background-color: #0056b3;
    }
`;
document.head.appendChild(modalStyle);
