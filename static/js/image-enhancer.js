// Image Enhancement System
// Provides lazy loading, error handling, and progressive enhancement for images

(function() {
    'use strict';

    // Configuration
    const config = {
        lazyClass: 'lazy-load',
        loadedClass: 'image-loaded',
        errorClass: 'image-error',
        placeholderClass: 'image-placeholder',
        rootMargin: '50px',
        threshold: 0.1
    };

    // Create placeholder SVG
    function createPlaceholder(width = 300, height = 200) {
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
                    Loading...
                </text>
            </svg>
        `)}`;
    }

    // Create error placeholder
    function createErrorPlaceholder(width = 300, height = 200) {
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="#f8f8f8" stroke="#ddd" stroke-width="1"/>
                <text x="50%" y="45%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial, sans-serif" font-size="12">
                    Image not available
                </text>
                <text x="50%" y="60%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="10">
                    📷
                </text>
            </svg>
        `)}`;
    }

    // Lazy loading with Intersection Observer
    function setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll(`img[data-src]`).forEach(loadImage);
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });

        document.querySelectorAll(`img[data-src]`).forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Load individual image
    function loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = function() {
            img.src = src;
            img.classList.add(config.loadedClass);
            img.classList.remove(config.lazyClass);
            
            // Add fade-in effect
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in-out';
            setTimeout(() => {
                img.style.opacity = '1';
            }, 10);
        };
        
        imageLoader.onerror = function() {
            handleImageError(img);
        };
        
        imageLoader.src = src;
    }

    // Handle image loading errors
    function handleImageError(img) {
        img.classList.add(config.errorClass);
        img.classList.remove(config.lazyClass);
        
        const width = img.getAttribute('width') || img.offsetWidth || 300;
        const height = img.getAttribute('height') || img.offsetHeight || 200;
        
        img.src = createErrorPlaceholder(width, height);
        img.alt = img.alt || 'Image not available';
    }

    // Setup image error handling for all images
    function setupErrorHandling() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                img.addEventListener('error', () => handleImageError(img));
            }
        });
    }

    // Setup responsive images
    function setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-responsive]');
        
        images.forEach(img => {
            const breakpoints = {
                small: img.dataset.small,
                medium: img.dataset.medium,
                large: img.dataset.large
            };
            
            function updateImageSrc() {
                const width = window.innerWidth;
                let newSrc;
                
                if (width <= 768 && breakpoints.small) {
                    newSrc = breakpoints.small;
                } else if (width <= 1024 && breakpoints.medium) {
                    newSrc = breakpoints.medium;
                } else if (breakpoints.large) {
                    newSrc = breakpoints.large;
                }
                
                if (newSrc && img.src !== newSrc) {
                    img.src = newSrc;
                }
            }
            
            updateImageSrc();
            window.addEventListener('resize', updateImageSrc);
        });
    }

    // Setup image zoom functionality
    function setupImageZoom() {
        const zoomableImages = document.querySelectorAll('img[data-zoom]');
        
        zoomableImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function() {
                createImageModal(this);
            });
        });
    }

    // Create image modal for zoom
    function createImageModal(img) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-backdrop">
                <div class="image-modal-content">
                    <img src="${img.src}" alt="${img.alt}" class="image-modal-img">
                    <button class="image-modal-close">&times;</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .image-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .image-modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            .image-modal-img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            .image-modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                padding: 5px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Close modal handlers
        const closeModal = () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        };
        
        modal.querySelector('.image-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.image-modal-backdrop').addEventListener('click', closeModal);
        
        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Initialize all image enhancements
    function init() {
        setupLazyLoading();
        setupErrorHandling();
        setupResponsiveImages();
        setupImageZoom();
        
        // Setup placeholders for images with data-src
        document.querySelectorAll('img[data-src]:not([src])').forEach(img => {
            const width = img.getAttribute('width') || 300;
            const height = img.getAttribute('height') || 200;
            img.src = createPlaceholder(width, height);
            img.classList.add(config.lazyClass);
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();