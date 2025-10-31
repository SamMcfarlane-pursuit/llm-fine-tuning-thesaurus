// Razor Sharp Images Enhanced
// Advanced image optimization and enhancement system

(function() {
    'use strict';

    // Configuration
    const config = {
        lazyLoading: true,
        retina: true,
        webpSupport: false,
        avifSupport: false,
        quality: 85,
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
        errorPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=',
        observerOptions: {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        },
        resizeBreakpoints: [320, 480, 768, 1024, 1200, 1920],
        formats: ['avif', 'webp', 'jpg'],
        enableSharpening: true,
        enableContrast: true,
        enableSaturation: true
    };

    // State management
    let state = {
        observer: null,
        loadedImages: new Set(),
        failedImages: new Set(),
        processingQueue: [],
        isProcessing: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
    };

    // Add enhanced image styles
    function addImageStyles() {
        const style = document.createElement('style');
        style.id = 'razor-sharp-images-styles';
        style.textContent = `
            /* Enhanced Image Styles */
            .razor-image {
                transition: all 0.3s ease;
                will-change: transform, opacity;
            }
            
            .razor-image.loading {
                opacity: 0.7;
                filter: blur(2px);
            }
            
            .razor-image.loaded {
                opacity: 1;
                filter: none;
            }
            
            .razor-image.error {
                opacity: 0.5;
                filter: grayscale(100%);
            }
            
            .razor-image.enhanced {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                backface-visibility: hidden;
                transform: translateZ(0);
            }
            
            .razor-image.sharp {
                filter: contrast(1.1) saturate(1.05) unsharp-mask(amount(0.5) radius(0.5) threshold(0));
            }
            
            .razor-image-container {
                position: relative;
                overflow: hidden;
                background: #f8f9fa;
            }
            
            .razor-image-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                           linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                opacity: 0.1;
                z-index: 1;
            }
            
            .razor-image-container img {
                position: relative;
                z-index: 2;
                width: 100%;
                height: auto;
                display: block;
            }
            
            .razor-image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.1);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 3;
                pointer-events: none;
            }
            
            .razor-image-container:hover .razor-image-overlay {
                opacity: 1;
            }
            
            .razor-image-loader {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 4;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .razor-image-container.loading .razor-image-loader {
                opacity: 1;
            }
            
            .razor-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: razorSpin 1s linear infinite;
            }
            
            @keyframes razorSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .razor-image-info {
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
            
            .razor-image-container:hover .razor-image-info {
                opacity: 1;
            }
            
            .razor-image-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 6;
            }
            
            .razor-image-container:hover .razor-image-controls {
                opacity: 1;
            }
            
            .razor-control-btn {
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
            
            .razor-control-btn:hover {
                background: rgba(0,0,0,0.9);
                transform: scale(1.1);
            }
            
            .razor-zoom-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .razor-zoom-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .razor-zoom-image {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            
            .razor-zoom-overlay.active .razor-zoom-image {
                transform: scale(1);
            }
            
            .razor-zoom-close {
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
            
            .razor-zoom-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            .razor-progressive {
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            }
            
            .razor-progressive.loaded {
                background-image: none !important;
            }
            
            /* Responsive images */
            .razor-responsive {
                width: 100%;
                height: auto;
            }
            
            /* High DPI support */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .razor-image.retina {
                    image-rendering: -webkit-optimize-contrast;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .razor-image-container {
                    background: #2d3748;
                }
                
                .razor-image-container::before {
                    background: linear-gradient(45deg, #4a5568 25%, transparent 25%), 
                               linear-gradient(-45deg, #4a5568 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #4a5568 75%), 
                               linear-gradient(-45deg, transparent 75%, #4a5568 75%);
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .razor-image,
                .razor-image-overlay,
                .razor-image-loader,
                .razor-image-info,
                .razor-image-controls,
                .razor-zoom-overlay,
                .razor-zoom-image {
                    transition: none;
                }
                
                .razor-spinner {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Check format support
    function checkFormatSupport() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            
            // Check WebP support
            canvas.toBlob((blob) => {
                config.webpSupport = blob && blob.type === 'image/webp';
                
                // Check AVIF support (simplified check)
                const avifImg = new Image();
                avifImg.onload = () => {
                    config.avifSupport = true;
                    resolve();
                };
                avifImg.onerror = () => {
                    config.avifSupport = false;
                    resolve();
                };
                avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
            }, 'image/webp');
        });
    }

    // Get optimal image source
    function getOptimalSource(img) {
        const src = img.dataset.src || img.src;
        if (!src) return null;
        
        const url = new URL(src, window.location.href);
        const params = new URLSearchParams();
        
        // Add quality parameter
        params.set('q', config.quality);
        
        // Add device pixel ratio
        if (config.retina && state.devicePixelRatio > 1) {
            params.set('dpr', Math.min(state.devicePixelRatio, 3));
        }
        
        // Add viewport dimensions for responsive sizing
        const rect = img.getBoundingClientRect();
        if (rect.width > 0) {
            const targetWidth = Math.ceil(rect.width * state.devicePixelRatio);
            const breakpoint = config.resizeBreakpoints.find(bp => bp >= targetWidth) || config.resizeBreakpoints[config.resizeBreakpoints.length - 1];
            params.set('w', breakpoint);
        }
        
        // Add format preference
        if (config.avifSupport) {
            params.set('f', 'avif');
        } else if (config.webpSupport) {
            params.set('f', 'webp');
        }
        
        // Only add params if the URL supports them (has query params or is a service)
        if (url.pathname.includes('/api/') || url.pathname.includes('/image/') || url.search) {
            url.search = params.toString();
        }
        
        return url.toString();
    }

    // Create image container
    function createImageContainer(img) {
        if (img.closest('.razor-image-container')) return;
        
        const container = document.createElement('div');
        container.className = 'razor-image-container';
        
        // Copy dimensions if specified
        if (img.width) container.style.width = img.width + 'px';
        if (img.height) container.style.height = img.height + 'px';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'razor-image-overlay';
        
        // Create loader
        const loader = document.createElement('div');
        loader.className = 'razor-image-loader';
        loader.innerHTML = '<div class="razor-spinner"></div>';
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'razor-image-controls';
        controls.innerHTML = `
            <button class="razor-control-btn" data-action="zoom" title="Zoom">🔍</button>
            <button class="razor-control-btn" data-action="download" title="Download">⬇️</button>
            <button class="razor-control-btn" data-action="info" title="Info">ℹ️</button>
        `;
        
        // Create info panel
        const info = document.createElement('div');
        info.className = 'razor-image-info';
        
        // Wrap image
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(overlay);
        container.appendChild(loader);
        container.appendChild(controls);
        container.appendChild(info);
        
        // Setup control events
        setupImageControls(container, img);
        
        return container;
    }

    // Setup image controls
    function setupImageControls(container, img) {
        const controls = container.querySelector('.razor-image-controls');
        
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
        const overlay = document.createElement('div');
        overlay.className = 'razor-zoom-overlay';
        
        const zoomImg = document.createElement('img');
        zoomImg.className = 'razor-zoom-image';
        zoomImg.src = img.src;
        zoomImg.alt = img.alt;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'razor-zoom-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };
        
        overlay.appendChild(zoomImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
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
        const info = container.querySelector('.razor-image-info');
        const isVisible = info.style.opacity === '1';
        
        if (isVisible) {
            info.style.opacity = '0';
        } else {
            // Gather image information
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

    // Load image with enhancements
    function loadImage(img) {
        if (state.loadedImages.has(img) || state.failedImages.has(img)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const container = createImageContainer(img);
            container.classList.add('loading');
            
            // Set placeholder
            if (!img.src || img.src === window.location.href) {
                img.src = config.placeholder;
            }
            
            // Get optimal source
            const optimalSrc = getOptimalSource(img);
            if (!optimalSrc) {
                reject(new Error('No source available'));
                return;
            }
            
            // Create new image for loading
            const newImg = new Image();
            
            newImg.onload = () => {
                // Apply enhancements
                img.src = newImg.src;
                img.classList.add('razor-image', 'loaded');
                
                if (config.enableSharpening) {
                    img.classList.add('enhanced', 'sharp');
                }
                
                if (config.retina && state.devicePixelRatio > 1) {
                    img.classList.add('retina');
                }
                
                container.classList.remove('loading');
                state.loadedImages.add(img);
                
                // Progressive enhancement
                applyProgressiveEnhancement(img);
                
                resolve();
            };
            
            newImg.onerror = () => {
                img.src = config.errorPlaceholder;
                img.classList.add('razor-image', 'error');
                container.classList.remove('loading');
                state.failedImages.add(img);
                reject(new Error('Failed to load image'));
            };
            
            // Start loading
            newImg.src = optimalSrc;
        });
    }

    // Apply progressive enhancement
    function applyProgressiveEnhancement(img) {
        // Add responsive class
        img.classList.add('razor-responsive');
        
        // Apply filters based on configuration
        const filters = [];
        
        if (config.enableContrast) {
            filters.push('contrast(1.05)');
        }
        
        if (config.enableSaturation) {
            filters.push('saturate(1.02)');
        }
        
        if (filters.length > 0) {
            img.style.filter = filters.join(' ');
        }
        
        // Add loading animation
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        
        requestAnimationFrame(() => {
            img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        });
    }

    // Setup lazy loading
    function setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll('img[data-src]').forEach(loadImage);
            return;
        }
        
        state.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img).catch(console.error);
                    state.observer.unobserve(img);
                }
            });
        }, config.observerOptions);
        
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
                img.classList.add('razor-image', 'loaded');
                createImageContainer(img);
                applyProgressiveEnhancement(img);
                state.loadedImages.add(img);
            } else {
                // Image still loading
                loadImage(img).catch(console.error);
            }
        });
    }

    // Handle viewport changes
    function handleViewportChange() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        if (Math.abs(newWidth - state.viewportWidth) > 100 || 
            Math.abs(newHeight - state.viewportHeight) > 100) {
            
            state.viewportWidth = newWidth;
            state.viewportHeight = newHeight;
            
            // Reload visible images with new dimensions
            const visibleImages = document.querySelectorAll('.razor-image.loaded');
            visibleImages.forEach((img) => {
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Image is visible, consider reloading with new size
                    const optimalSrc = getOptimalSource(img);
                    if (optimalSrc && optimalSrc !== img.src) {
                        state.loadedImages.delete(img);
                        loadImage(img).catch(console.error);
                    }
                }
            });
        }
    }

    // Setup mutation observer for dynamic content
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for new images
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        
                        images.forEach((img) => {
                            if (img.dataset.src) {
                                // Lazy load image
                                if (state.observer) {
                                    state.observer.observe(img);
                                }
                            } else {
                                // Process immediately
                                loadImage(img).catch(console.error);
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

    // Initialize the system
    function init() {
        addImageStyles();
        
        checkFormatSupport().then(() => {
            if (config.lazyLoading) {
                setupLazyLoading();
            }
            
            processExistingImages();
            setupMutationObserver();
            
            // Handle viewport changes
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleViewportChange, 250);
            });
            
            // Handle device pixel ratio changes
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(min-resolution: 2dppx)');
                mediaQuery.addListener(() => {
                    state.devicePixelRatio = window.devicePixelRatio || 1;
                    handleViewportChange();
                });
            }
        });
    }

    // Public API
    window.RazorSharpImages = {
        init,
        loadImage,
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