/**
 * Enhanced Workshop Steps JavaScript
 * Provides functionality for stunning, professional workshop step visuals
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize workshop steps
    enhanceWorkshopSteps();
    
    // Initialize lazy loading for step images
    initStepImagesLazyLoading();
    
    // Initialize step image error handling
    initStepImageErrorHandling();
});

/**
 * Enhance workshop steps
 */
function enhanceWorkshopSteps() {
    // Get all workshop step containers
    const stepContainers = document.querySelectorAll('.workshop-steps-container');
    
    stepContainers.forEach(container => {
        // Get all steps in this container
        const steps = container.querySelectorAll('.workshop-step');
        
        // Add progress indicators between steps
        for (let i = 0; i < steps.length - 1; i++) {
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'step-progress';
            
            // Insert after current step
            steps[i].after(progressIndicator);
        }
        
        // Add special classes based on step content
        steps.forEach(step => {
            const title = step.querySelector('.step-title').textContent.toLowerCase();
            
            if (title.includes('install') || title.includes('library')) {
                step.classList.add('install');
            } else if (title.includes('model') || title.includes('load')) {
                step.classList.add('model');
            } else if (title.includes('train')) {
                step.classList.add('train');
            } else if (title.includes('evaluate') || title.includes('test')) {
                step.classList.add('evaluate');
            }
        });
    });
    
    // Enhance step images
    enhanceStepImages();
}

/**
 * Enhance step images
 */
function enhanceStepImages() {
    // Get all step images
    const stepImages = document.querySelectorAll('.step-image');
    
    stepImages.forEach(image => {
        // Add loading class
        image.classList.add('loading');
        
        // Remove loading class when image is loaded
        image.addEventListener('load', function() {
            image.classList.remove('loading');
        });
        
        // Add native lazy loading
        image.setAttribute('loading', 'lazy');
        
        // Add alt text if missing
        if (!image.hasAttribute('alt') || image.getAttribute('alt') === '') {
            const step = image.closest('.workshop-step');
            if (step) {
                const title = step.querySelector('.step-title');
                if (title) {
                    image.setAttribute('alt', title.textContent + ' visualization');
                } else {
                    image.setAttribute('alt', 'Workshop step visualization');
                }
            }
        }
    });
}

/**
 * Initialize lazy loading for step images
 */
function initStepImagesLazyLoading() {
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
        const lazyImages = document.querySelectorAll('.step-image[data-src]');
        
        // Observe each image
        lazyImages.forEach(image => {
            observer.observe(image);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const lazyImages = document.querySelectorAll('.step-image[data-src]');
        
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }
}

/**
 * Initialize step image error handling
 */
function initStepImageErrorHandling() {
    // Get all step images
    const stepImages = document.querySelectorAll('.step-image');
    
    // Add error handling to each image
    stepImages.forEach(image => {
        image.addEventListener('error', function() {
            // Add error class
            image.classList.add('image-error');
            
            // Remove loading class
            image.classList.remove('loading');
            
            // Create a placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'step-image-placeholder';
            placeholder.innerHTML = `
                <i class="bi bi-image"></i>
                <p>Image could not be loaded</p>
            `;
            
            // Replace the image with the placeholder
            image.parentNode.insertBefore(placeholder, image);
            image.style.display = 'none';
        });
    });
}

/**
 * Add parallax effect to step images
 */
function addParallaxEffect() {
    const stepContainers = document.querySelectorAll('.workshop-step');
    
    stepContainers.forEach(container => {
        container.addEventListener('mousemove', function(e) {
            const image = container.querySelector('.step-image');
            if (!image) return;
            
            // Get position of mouse relative to container
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate percentage
            const xPercent = (x / rect.width - 0.5) * 2; // -1 to 1
            const yPercent = (y / rect.height - 0.5) * 2; // -1 to 1
            
            // Apply subtle transform
            image.style.transform = `scale(1.05) translate(${xPercent * 5}px, ${yPercent * 5}px)`;
        });
        
        container.addEventListener('mouseleave', function() {
            const image = container.querySelector('.step-image');
            if (!image) return;
            
            // Reset transform
            image.style.transform = '';
        });
    });
}

// Call parallax effect function after DOM is loaded
document.addEventListener('DOMContentLoaded', addParallaxEffect);
