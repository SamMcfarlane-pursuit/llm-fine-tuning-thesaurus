// Image Handler Fixed
// Comprehensive image handling with error recovery and optimization

(function() {
    'use strict';

    // Configuration
    const config = {
        retryAttempts: 3,
        retryDelay: 1000,
        lazyLoadOffset: 100,
        placeholderQuality: 10,
        enableWebP: true,
        enableAVIF: true,
        enableProgressiveJPEG: true,
        maxImageSize: 5 * 1024 * 1024, // 5MB
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'],
        fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==',
        loadingImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY3ZWVhIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1kYXNoYXJyYXk9IjMxLjQxNiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjMxLjQxNiI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiBhdHRyaWJ1dGVUeXBlPSJYTUwiIHR5cGU9InJvdGF0ZSIgZHVyPSIycyIgZnJvbT0iMCAxNTAgMTAwIiB0bz0iMzYwIDE1MCAxMDAiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4='
    };

    // State management
    let state = {
        loadedImages: new Map(),
        failedImages: new Set(),
        retryCount: new Map(),
        observer: null,
        formatSupport: {
            webp: false,
            avif: false
        },
        isInitialized: false,
        loadQueue: [],
        isProcessingQueue: false
    };

    // Add image handler styles
    function addImageStyles() {
        const style = document.createElement('style');
        style.id = 'image-handler-styles';
        style.textContent = `
            /* Image Handler Fixed Styles */
            .img-container {
                position: relative;
                display: inline-block;
                overflow: hidden;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .img-container img {
                display: block;
                width: 100%;
                height: auto;
                transition: all 0.3s ease;
            }
            
            .img-loading {
                opacity: 0.7;
                filter: blur(2px);
            }
            
            .img-loaded {
                opacity: 1;
                filter: none;
            }
            
            .img-error {
                opacity: 0.6;
                filter: grayscale(100%);
            }
            
            .img-placeholder {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                           linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                opacity: 0.1;
                z-index: 1;
            }
            
            .img-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .img-container:hover .img-overlay {
                opacity: 1;
            }
            
            .img-loader {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #667eea;
                animation: imgSpin 1s ease-in-out infinite;
                margin-bottom: 10px;
            }
            
            @keyframes imgSpin {
                to { transform: rotate(360deg); }
            }
            
            .img-error-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .img-error-text {
                font-size: 14px;
                text-align: center;
                margin-bottom: 15px;
            }
            
            .img-retry-btn {
                padding: 8px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s ease;
            }
            
            .img-retry-btn:hover {
                background: #5a67d8;
            }
            
            .img-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.7));
                color: white;
                padding: 20px 15px 15px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 5;
            }
            
            .img-container:hover .img-info {
                opacity: 1;
            }
            
            .img-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 6;
            }
            
            .img-container:hover .img-controls {
                opacity: 1;
            }
            
            .img-control-btn {
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                background: rgba(0,0,0,0.7);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .img-control-btn:hover {
                background: rgba(0,0,0,0.9);
                transform: scale(1.1);
            }
            
            .img-progressive {
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                filter: blur(5px);
                transform: scale(1.1);
                transition: all 0.3s ease;
            }
            
            .img-progressive.loaded {
                filter: none;
                transform: scale(1);
            }
            
            .img-lazy {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease;
            }
            
            .img-lazy.loaded {
                opacity: 1;
                transform: translateY(0);
            }
            
            .img-zoom-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .img-zoom-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .img-zoom-content {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            
            .img-zoom-modal.active .img-zoom-content {
                transform: scale(1);
            }
            
            .img-zoom-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                color: white;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .img-zoom-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            /* Responsive images */
            .img-responsive {
                width: 100%;
                height: auto;
            }
            
            /* High DPI support */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .img-container img {
                    image-rendering: -webkit-optimize-contrast;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .img-container {
                    background: #2d3748;
                }
                
                .img-placeholder {
                    background: linear-gradient(45deg, #4a5568 25%, transparent 25%), 
                               linear-gradient(-45deg, #4a5568 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #4a5568 75%), 
                               linear-gradient(-45deg, transparent 75%, #4a5568 75%);
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .img-container img,
                .img-overlay,
                .img-info,
                .img-controls,
                .img-progressive,
                .img-lazy,
                .img-zoom-modal,
                .img-zoom-content {
                    transition: none;
                }
                
                .img-loader {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Check format support
    function checkFormatSupport() {
        return new Promise((resolve) => {
            let checks = 0;
            const totalChecks = 2;
            
            function checkComplete() {
                checks++;
                if (checks === totalChecks) {
                    resolve();
                }
            }
            
            // Check WebP support
            const webpImg = new Image();
            webpImg.onload = webpImg.onerror = () => {
                state.formatSupport.webp = webpImg.width > 0 && webpImg.height > 0;
                checkComplete();
            };
            webpImg.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            
            // Check AVIF support
            const avifImg = new Image();
            avifImg.onload = avifImg.onerror = () => {
                state.formatSupport.avif = avifImg.width > 0 && avifImg.height > 0;
                checkComplete();
            };
            avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
        });
    }

    // Get optimal image source
    function getOptimalSource(img, originalSrc) {
        if (!originalSrc) return null;
        
        // If it's already a data URL, return as is
        if (originalSrc.startsWith('data:')) {
            return originalSrc;
        }
        
        try {
            const url = new URL(originalSrc, window.location.href);
            const params = new URLSearchParams(url.search);
            
            // Add format preference
            if (config.enableAVIF && state.formatSupport.avif) {
                params.set('format', 'avif');
            } else if (config.enableWebP && state.formatSupport.webp) {
                params.set('format', 'webp');
            }
            
            // Add quality parameter
            if (!params.has('quality') && !params.has('q')) {
                params.set('q', '85');
            }
            
            // Add device pixel ratio
            const dpr = window.devicePixelRatio || 1;
            if (dpr > 1) {
                params.set('dpr', Math.min(dpr, 3).toString());
            }
            
            // Add responsive sizing
            const rect = img.getBoundingClientRect();
            if (rect.width > 0) {
                params.set('w', Math.ceil(rect.width * dpr).toString());
            }
            
            url.search = params.toString();
            return url.toString();
        } catch (error) {
            console.warn('Failed to optimize image URL:', error);
            return originalSrc;
        }
    }

    // Create image container
    function createImageContainer(img) {
        if (img.closest('.img-container')) {
            return img.closest('.img-container');
        }
        
        const container = document.createElement('div');
        container.className = 'img-container';
        
        // Copy dimensions
        if (img.width) container.style.width = img.width + 'px';
        if (img.height) container.style.height = img.height + 'px';
        
        // Create placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'img-placeholder';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'img-overlay';
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'img-controls';
        controls.innerHTML = `
            <button class="img-control-btn" data-action="zoom" title="Zoom">🔍</button>
            <button class="img-control-btn" data-action="download" title="Download">⬇️</button>
            <button class="img-control-btn" data-action="info" title="Info">ℹ️</button>
        `;
        
        // Create info panel
        const info = document.createElement('div');
        info.className = 'img-info';
        
        // Wrap image
        img.parentNode.insertBefore(container, img);
        container.appendChild(placeholder);
        container.appendChild(img);
        container.appendChild(overlay);
        container.appendChild(controls);
        container.appendChild(info);
        
        // Setup control events
        setupImageControls(container, img);
        
        return container;
    }

    // Setup image controls
    function setupImageControls(container, img) {
        const controls = container.querySelector('.img-controls');
        
        controls.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            switch (action) {
                case 'zoom':
                    showImageZoom(img);
                    break;
                case 'download':
                    downloadImage(img);
                    break;
                case 'info':
                    toggleImageInfo(container, img);
                    break;
            }
        });
    }

    // Show image zoom
    function showImageZoom(img) {
        const modal = document.createElement('div');
        modal.className = 'img-zoom-modal';
        
        const zoomImg = document.createElement('img');
        zoomImg.className = 'img-zoom-content';
        zoomImg.src = img.src;
        zoomImg.alt = img.alt;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'img-zoom-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.appendChild(zoomImg);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
        
        // Trigger animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeBtn.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Download image
    function downloadImage(img) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = img.alt || 'image';
        link.click();
    }

    // Toggle image info
    function toggleImageInfo(container, img) {
        const info = container.querySelector('.img-info');
        const isVisible = info.style.opacity === '1';
        
        if (isVisible) {
            info.style.opacity = '0';
        } else {
            const rect = img.getBoundingClientRect();
            const fileSize = img.complete ? 'Loaded' : 'Loading...';
            
            info.innerHTML = `
                <div><strong>Dimensions:</strong> ${img.naturalWidth || '?'} × ${img.naturalHeight || '?'}</div>
                <div><strong>Display:</strong> ${Math.round(rect.width)} × ${Math.round(rect.height)}</div>
                <div><strong>Status:</strong> ${fileSize}</div>
                <div><strong>Alt:</strong> ${img.alt || 'No description'}</div>
            `;
            
            info.style.opacity = '1';
        }
    }

    // Show loading state
    function showLoadingState(img, container) {
        img.classList.add('img-loading');
        
        const overlay = container.querySelector('.img-overlay');
        overlay.innerHTML = `
            <div class="img-loader"></div>
            <div>Loading image...</div>
        `;
        overlay.style.opacity = '1';
    }

    // Show error state
    function showErrorState(img, container, error) {
        img.classList.remove('img-loading');
        img.classList.add('img-error');
        
        const overlay = container.querySelector('.img-overlay');
        const retryCount = state.retryCount.get(img) || 0;
        
        overlay.innerHTML = `
            <div class="img-error-icon">⚠️</div>
            <div class="img-error-text">
                Failed to load image<br>
                ${error ? error.message : 'Unknown error'}
            </div>
            ${retryCount < config.retryAttempts ? 
                '<button class="img-retry-btn" onclick="ImageHandler.retryImage(this)">Retry</button>' : 
                '<div style="font-size: 12px; opacity: 0.7;">Max retries reached</div>'
            }
        `;
        overlay.style.opacity = '1';
    }

    // Show success state
    function showSuccessState(img, container) {
        img.classList.remove('img-loading');
        img.classList.add('img-loaded');
        
        const overlay = container.querySelector('.img-overlay');
        overlay.style.opacity = '0';
        
        // Add entrance animation for lazy loaded images
        if (img.classList.contains('img-lazy')) {
            img.classList.add('loaded');
        }
    }

    // Load image with retry logic
    function loadImageWithRetry(img, src, retryCount = 0) {
        return new Promise((resolve, reject) => {
            const container = createImageContainer(img);
            
            if (retryCount === 0) {
                showLoadingState(img, container);
            }
            
            const newImg = new Image();
            
            // Set up crossorigin if needed
            if (src.includes('://') && !src.startsWith(window.location.origin)) {
                newImg.crossOrigin = 'anonymous';
            }
            
            newImg.onload = () => {
                // Validate image
                if (newImg.naturalWidth === 0 || newImg.naturalHeight === 0) {
                    reject(new Error('Invalid image dimensions'));
                    return;
                }
                
                // Check file size if possible
                if (newImg.src.startsWith('data:')) {
                    const sizeMatch = newImg.src.match(/data:image\/[^;]+;base64,(.+)/);
                    if (sizeMatch) {
                        const size = (sizeMatch[1].length * 3) / 4;
                        if (size > config.maxImageSize) {
                            reject(new Error('Image too large'));
                            return;
                        }
                    }
                }
                
                // Update original image
                img.src = newImg.src;
                img.onload = () => {
                    showSuccessState(img, container);
                    state.loadedImages.set(img, src);
                    resolve(img);
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to update image source'));
                };
            };
            
            newImg.onerror = () => {
                const error = new Error(`Failed to load image (attempt ${retryCount + 1})`);
                
                if (retryCount < config.retryAttempts) {
                    // Retry with delay
                    setTimeout(() => {
                        state.retryCount.set(img, retryCount + 1);
                        loadImageWithRetry(img, src, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, config.retryDelay * (retryCount + 1));
                } else {
                    // Max retries reached, show error
                    img.src = config.fallbackImage;
                    showErrorState(img, container, error);
                    state.failedImages.add(img);
                    reject(error);
                }
            };
            
            // Start loading
            newImg.src = src;
        });
    }

    // Process image
    function processImage(img) {
        if (state.loadedImages.has(img) || state.failedImages.has(img)) {
            return Promise.resolve(img);
        }
        
        const originalSrc = img.dataset.src || img.src;
        if (!originalSrc || originalSrc === window.location.href) {
            return Promise.reject(new Error('No image source'));
        }
        
        // Check if format is supported
        const extension = originalSrc.split('.').pop()?.toLowerCase();
        if (extension && !config.supportedFormats.includes(extension)) {
            return Promise.reject(new Error(`Unsupported format: ${extension}`));
        }
        
        const optimalSrc = getOptimalSource(img, originalSrc);
        return loadImageWithRetry(img, optimalSrc);
    }

    // Setup lazy loading
    function setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll('img[data-src]').forEach(processImage);
            return;
        }
        
        state.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('img-lazy');
                    
                    processImage(img).catch((error) => {
                        console.warn('Failed to load lazy image:', error);
                    });
                    
                    state.observer.unobserve(img);
                }
            });
        }, {
            root: null,
            rootMargin: `${config.lazyLoadOffset}px`,
            threshold: 0.1
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach((img) => {
            state.observer.observe(img);
        });
    }

    // Process existing images
    function processExistingImages() {
        const images = document.querySelectorAll('img:not([data-src])');
        
        images.forEach((img) => {
            if (img.complete && img.naturalWidth > 0) {
                // Image already loaded
                const container = createImageContainer(img);
                showSuccessState(img, container);
                state.loadedImages.set(img, img.src);
            } else if (img.src && img.src !== window.location.href) {
                // Image still loading or failed
                processImage(img).catch((error) => {
                    console.warn('Failed to process existing image:', error);
                });
            }
        });
    }

    // Setup mutation observer for dynamic content
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        
                        images.forEach((img) => {
                            if (img.dataset.src) {
                                // Lazy load image
                                if (state.observer) {
                                    img.classList.add('img-lazy');
                                    state.observer.observe(img);
                                }
                            } else {
                                // Process immediately
                                processImage(img).catch((error) => {
                                    console.warn('Failed to process dynamic image:', error);
                                });
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Retry image loading
    function retryImage(button) {
        const container = button.closest('.img-container');
        const img = container.querySelector('img');
        
        if (img) {
            // Reset state
            state.failedImages.delete(img);
            state.retryCount.delete(img);
            img.classList.remove('img-error');
            
            // Retry loading
            processImage(img).catch((error) => {
                console.warn('Retry failed:', error);
            });
        }
    }

    // Preload images
    function preloadImages(urls) {
        return Promise.all(urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
                img.src = url;
            });
        }));
    }

    // Initialize the system
    function init() {
        if (state.isInitialized) {
            return;
        }
        
        addImageStyles();
        
        checkFormatSupport().then(() => {
            setupLazyLoading();
            processExistingImages();
            setupMutationObserver();
            
            state.isInitialized = true;
            
            // Dispatch initialization event
            document.dispatchEvent(new CustomEvent('imageHandlerInitialized', {
                detail: {
                    formatSupport: state.formatSupport,
                    config: config
                }
            }));
        });
    }

    // Public API
    window.ImageHandler = {
        init,
        processImage,
        retryImage,
        preloadImages,
        config,
        state
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();