/**
 * Enhanced Razor-Sharp Images JavaScript
 * Provides functionality for stunning, professional images with silky smooth transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced images
    enhanceAllImages();
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Initialize image error handling
    initImageErrorHandling();
});

/**
 * Enhance all images on the page
 */
function enhanceAllImages() {
    // Get all images except those with the 'no-enhance' class
    const images = document.querySelectorAll('img:not(.no-enhance)');
    
    // Enhance each image
    images.forEach(image => {
        enhanceImage(image);
    });
    
    // Enhance specific images with captions
    enhanceImagesWithCaptions();
    
    // Enhance diagram images
    enhanceDiagramImages();
}

/**
 * Enhance a single image
 * @param {HTMLImageElement} image - The image to enhance
 */
function enhanceImage(image) {
    // Skip if already enhanced
    if (image.classList.contains('enhanced-image')) {
        return;
    }
    
    // Add enhanced image class
    image.classList.add('enhanced-image');
    
    // Create a container for the image if it doesn't have one
    if (!image.parentElement.classList.contains('enhanced-image-container')) {
        // Skip if the image is inside a button or link
        if (image.parentElement.tagName === 'BUTTON' || image.parentElement.tagName === 'A') {
            return;
        }
        
        // Create a container
        const container = document.createElement('div');
        container.className = 'enhanced-image-container';
        
        // Replace the image with the container
        image.parentNode.insertBefore(container, image);
        container.appendChild(image);
    }
    
    // Add loading attribute for native lazy loading
    image.setAttribute('loading', 'lazy');
    
    // Add a loading class
    image.classList.add('loading-image');
    
    // Remove the loading class when the image is loaded
    image.addEventListener('load', function() {
        image.classList.remove('loading-image');
    });
}

/**
 * Enhance images with captions
 */
function enhanceImagesWithCaptions() {
    // Get all images with the 'data-caption' attribute
    const imagesWithCaptions = document.querySelectorAll('img[data-caption]');
    
    // Enhance each image
    imagesWithCaptions.forEach(image => {
        // Skip if already enhanced
        if (image.nextElementSibling && image.nextElementSibling.classList.contains('image-caption')) {
            return;
        }
        
        // Get the caption
        const caption = image.getAttribute('data-caption');
        
        // Create a caption element
        const captionElement = document.createElement('div');
        captionElement.className = 'image-caption';
        captionElement.textContent = caption;
        
        // Add the caption to the container
        if (image.parentElement.classList.contains('enhanced-image-container')) {
            image.parentElement.appendChild(captionElement);
        }
    });
}

/**
 * Enhance diagram images
 */
function enhanceDiagramImages() {
    // Get all images with the 'diagram' class
    const diagramImages = document.querySelectorAll('img.diagram');
    
    // Enhance each diagram image
    diagramImages.forEach(image => {
        // Skip if already enhanced
        if (image.classList.contains('diagram-image')) {
            return;
        }
        
        // Add diagram image class
        image.classList.add('diagram-image');
        
        // Remove enhanced image class if present
        image.classList.remove('enhanced-image');
        
        // Remove the container if present
        if (image.parentElement.classList.contains('enhanced-image-container')) {
            const container = image.parentElement;
            container.parentNode.insertBefore(image, container);
            container.remove();
        }
    });
    
    // Get all SVG elements with the 'diagram' class
    const svgDiagrams = document.querySelectorAll('svg.diagram');
    
    // Enhance each SVG diagram
    svgDiagrams.forEach(svg => {
        // Add event listeners for hover effects
        svg.addEventListener('mouseenter', function() {
            // Enhance paths
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
                path.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                path.style.strokeWidth = '1.2';
            });
        });
        
        svg.addEventListener('mouseleave', function() {
            // Reset paths
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
                path.style.strokeWidth = '';
            });
        });
    });
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    // Check if the Intersection Observer API is available
    if ('IntersectionObserver' in window) {
        // Create an observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    
                    // Load the image
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    
                    // Stop observing the image
                    observer.unobserve(image);
                }
            });
        });
        
        // Get all images with the 'data-src' attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        // Observe each image
        lazyImages.forEach(image => {
            observer.observe(image);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }
}

/**
 * Initialize image error handling
 */
function initImageErrorHandling() {
    // Get all images
    const images = document.querySelectorAll('img');
    
    // Add error handling to each image
    images.forEach(image => {
        image.addEventListener('error', function() {
            // Add error class
            image.classList.add('image-error');
            
            // Remove other classes
            image.classList.remove('enhanced-image');
            image.classList.remove('loading-image');
            image.classList.remove('diagram-image');
            
            // Set a minimum height
            image.style.minHeight = '200px';
            
            // Hide the image
            image.style.display = 'none';
            
            // Create an error element
            const errorElement = document.createElement('div');
            errorElement.className = 'image-error';
            
            // Replace the image with the error element
            image.parentNode.insertBefore(errorElement, image);
        });
    });
}

/**
 * Apply enhanced styling to visualization iframes
 */
function enhanceVisualizationIframes() {
    // Get all visualization iframes
    const iframes = document.querySelectorAll('iframe.visualization-iframe');
    
    // Enhance each iframe
    iframes.forEach(iframe => {
        // Add event listener for load
        iframe.addEventListener('load', function() {
            // Remove loading class if present
            iframe.classList.remove('loading-image');
        });
        
        // Add loading class
        iframe.classList.add('loading-image');
    });
}
