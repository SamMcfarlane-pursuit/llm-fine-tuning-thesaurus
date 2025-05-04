/**
 * Image Handler Script
 * Enhances image loading, display, and interaction
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for images
    initLazyLoading();

    // Add image zoom functionality
    addImageZoom();

    // Format code blocks with syntax highlighting
    formatCodeBlocks();

    // Add captions to images that don't have them
    addImageCaptions();
});

/**
 * Initialize enhanced lazy loading for images with error handling and retries
 */
function initLazyLoading() {
    // Get all images that should be lazy loaded
    const lazyImages = document.querySelectorAll('img[data-src]');

    // Also handle all regular images for error handling
    const allImages = document.querySelectorAll('img:not([data-src])');

    // Create an intersection observer with options for earlier loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the image is in the viewport or close to it
            if (entry.isIntersecting) {
                const img = entry.target;

                // Add loading animation before the image loads
                img.classList.add('image-loading');

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
                    // Add a fade-in class
                    img.classList.add('fade-in');
                    // Add success class for subtle highlight
                    img.classList.add('image-loaded');

                    // Add loaded class after a small delay to trigger the transform
                    setTimeout(() => {
                        img.classList.add('loaded');
                    }, 50);
                    // Stop observing the image
                    observer.unobserve(img);
                };

                // Set up error handling with retries
                let retryCount = 0;
                const maxRetries = 3;

                tempImg.onerror = function() {
                    // Try to reload a few times before giving up
                    if (retryCount < maxRetries) {
                        console.warn(`Retry ${retryCount + 1}/${maxRetries} loading image:`, img.dataset.src);
                        retryCount++;
                        // Wait a bit before retrying
                        setTimeout(() => {
                            tempImg.src = img.dataset.src + '?retry=' + retryCount; // Add cache-busting parameter
                        }, 1000 * retryCount); // Increasing delay for each retry
                        return;
                    }

                    // Handle image loading error after all retries failed
                    console.error('Error loading image after retries:', img.dataset.src);
                    // Remove loading class
                    img.classList.remove('image-loading');
                    // Add error class
                    img.classList.add('image-error');
                    // Replace with a placeholder or error message
                    img.src = 'static/img/image-placeholder.svg';
                    // Add error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'image-error-message';
                    errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image failed to load';

                    // Only append error message if it doesn't already exist
                    if (!img.parentNode.querySelector('.image-error-message')) {
                        img.parentNode.appendChild(errorMsg);
                    }

                    // Stop observing the image
                    observer.unobserve(img);
                };

                // Start loading the image
                tempImg.src = img.dataset.src;
            }
        });
    }, {
        rootMargin: '200px', // Start loading when image is 200px from viewport for earlier loading
        threshold: 0.01 // Trigger when even a tiny part of the image is visible
    });

    // Observe each lazy-loaded image
    lazyImages.forEach(img => {
        // Add placeholder styling
        img.classList.add('image-placeholder');
        // Start observing
        imageObserver.observe(img);
    });

    // Handle all regular images for error handling
    allImages.forEach(img => {
        // Skip images that already loaded successfully
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('image-loaded');
            return;
        }

        // Handle load success
        img.addEventListener('load', function() {
            this.classList.add('image-loaded');
        });

        // Set up error handling with retries for regular images
        let retryCount = 0;
        const maxRetries = 3;
        const originalSrc = img.src;

        img.addEventListener('error', function() {
            // Try to reload a few times before giving up
            if (retryCount < maxRetries) {
                console.warn(`Retry ${retryCount + 1}/${maxRetries} loading image:`, originalSrc);
                retryCount++;
                // Wait a bit before retrying
                setTimeout(() => {
                    this.src = originalSrc + '?retry=' + retryCount; // Add cache-busting parameter
                }, 1000 * retryCount); // Increasing delay for each retry
                return;
            }

            // Handle image loading error after all retries failed
            console.error('Error loading image after retries:', originalSrc);
            // Add error class
            this.classList.add('image-error');
            // Replace with a placeholder
            this.src = 'static/img/image-placeholder.svg';
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'image-error-message';
            errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Image failed to load';

            // Only append error message if it doesn't already exist
            if (!this.parentNode.querySelector('.image-error-message')) {
                this.parentNode.appendChild(errorMsg);
            }
        });
    });

    // Add special handling for SVG diagrams
    document.querySelectorAll('.exercise-diagram, .diagram-image').forEach(img => {
        img.addEventListener('load', function() {
            // Add a subtle animation to make SVGs more noticeable
            this.style.animation = 'pulse 2s ease-in-out';
            this.classList.add('svg-loaded');
        });
    });
}

/**
 * Toggle fullscreen for an element
 * @param {HTMLElement} element - The element to toggle fullscreen for
 */
function toggleFullscreen(element) {
    try {
        if (!document.fullscreenElement) {
            // Try to make the element fullscreen
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.warn("Element fullscreen failed, trying document", err);
                    // If element fullscreen fails, try the document
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    }
                });
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen().catch(err => {
                    console.warn("Element webkit fullscreen failed, trying document", err);
                    if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen();
                    }
                });
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen().catch(err => {
                    console.warn("Element MS fullscreen failed, trying document", err);
                    if (document.documentElement.msRequestFullscreen) {
                        document.documentElement.msRequestFullscreen();
                    }
                });
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen().catch(err => {
                    console.warn("Element Moz fullscreen failed, trying document", err);
                    if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    }
                });
            } else {
                // If element methods aren't available, try the document
                console.log("Element fullscreen methods not available, trying document");
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                }
            }

            // Update fullscreen button
            const fullscreenBtn = document.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
                fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }

            // Update fullscreen button
            const fullscreenBtn = document.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
                fullscreenBtn.setAttribute('title', 'Fullscreen');
            }
        }
    } catch (e) {
        console.error('Error toggling fullscreen:', e);
        alert("Fullscreen mode failed. This may be due to browser restrictions.");
    }

    // Add event listener for fullscreen change
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

/**
 * Update fullscreen button based on fullscreen state
 */
function updateFullscreenButton() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        if (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
        } else {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            fullscreenBtn.setAttribute('title', 'Fullscreen');
        }
    }
}

/**
 * Add enhanced zoom functionality to images
 */
function addImageZoom() {
    // Get all content images
    const contentImages = document.querySelectorAll('.content-image, .diagram-image, .image-container img');

    contentImages.forEach(img => {
        // Create a wrapper for the image if it doesn't have one
        if (!img.parentElement.classList.contains('image-container')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-container');
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);

            // Add zoom indicator
            const zoomIndicator = document.createElement('div');
            zoomIndicator.classList.add('zoom-indicator');
            zoomIndicator.innerHTML = '<i class="bi bi-zoom-in"></i>';
            wrapper.appendChild(zoomIndicator);
        } else if (!img.parentElement.querySelector('.zoom-indicator')) {
            // Add zoom indicator if it doesn't exist
            const zoomIndicator = document.createElement('div');
            zoomIndicator.classList.add('zoom-indicator');
            zoomIndicator.innerHTML = '<i class="bi bi-zoom-in"></i>';
            img.parentElement.appendChild(zoomIndicator);
        }

        // Add click event for zooming
        img.addEventListener('click', function() {
            try {
                // Create a modal for the zoomed image
                const modal = document.createElement('div');
                modal.classList.add('image-modal');

                // Get image caption from alt text or parent container
                let caption = this.alt || '';
                if (!caption && this.parentElement && this.parentElement.querySelector('.image-caption')) {
                    caption = this.parentElement.querySelector('.image-caption').textContent;
                }

                // Get the highest resolution version of the image
                const highResImage = this.getAttribute('data-original-src') || this.src;

                modal.innerHTML = `
                    <div class="image-modal-content">
                        <span class="image-modal-close">&times;</span>
                        <div class="image-modal-loading">
                            <div class="spinner"></div>
                            <div>Loading high-resolution image...</div>
                        </div>
                        <img src="${highResImage}" alt="${caption || 'Image'}" class="image-modal-img">
                        <div class="image-modal-caption">${caption || ''}</div>
                        <div class="image-modal-controls">
                            <button class="modal-control-btn zoom-in-btn" title="Zoom In"><i class="bi bi-zoom-in"></i></button>
                            <button class="modal-control-btn zoom-out-btn" title="Zoom Out"><i class="bi bi-zoom-out"></i></button>
                            <button class="modal-control-btn reset-btn" title="Reset"><i class="bi bi-arrow-counterclockwise"></i></button>
                            <button class="modal-control-btn fullscreen-btn" title="Fullscreen"><i class="bi bi-fullscreen"></i></button>
                            <button class="modal-control-btn download-btn" title="Download"><i class="bi bi-download"></i></button>
                        </div>
                    </div>
                `;

            // Add the modal to the body
            document.body.appendChild(modal);

            // Show the modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);

            // Get the modal image and loading indicator
            const modalImg = modal.querySelector('.image-modal-img');
            const loadingIndicator = modal.querySelector('.image-modal-loading');

            // Hide loading indicator when image loads
            modalImg.addEventListener('load', function() {
                loadingIndicator.style.display = 'none';
                modalImg.classList.add('loaded');
            });

            // Show error if image fails to load
            modalImg.addEventListener('error', function() {
                loadingIndicator.innerHTML = `
                    <div class="error-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
                    <div>Failed to load high-resolution image</div>
                    <button class="retry-btn">Retry</button>
                `;

                // Add retry functionality
                modal.querySelector('.retry-btn').addEventListener('click', function() {
                    loadingIndicator.innerHTML = `
                        <div class="spinner"></div>
                        <div>Retrying...</div>
                    `;

                    // Add cache-busting parameter
                    const timestamp = new Date().getTime();
                    modalImg.src = highResImage + (highResImage.includes('?') ? '&' : '?') + '_cb=' + timestamp;
                });
            });

            let scale = 1;
            let translateX = 0;
            let translateY = 0;

            // Track if modal is still open
            let isModalOpen = true;

            // Add zoom in functionality
            modal.querySelector('.zoom-in-btn').addEventListener('click', function() {
                scale += 0.2;
                updateTransform();
            });

            // Add zoom out functionality
            modal.querySelector('.zoom-out-btn').addEventListener('click', function() {
                scale = Math.max(0.5, scale - 0.2);
                updateTransform();
            });

            // Add reset functionality
            modal.querySelector('.reset-btn').addEventListener('click', function() {
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform();
            });

            // Add download functionality
            modal.querySelector('.download-btn').addEventListener('click', function() {
                const link = document.createElement('a');
                link.href = modalImg.src;
                link.download = 'image-' + new Date().getTime() + '.jpg';
                link.click();
            });

            // Add fullscreen functionality
            modal.querySelector('.fullscreen-btn').addEventListener('click', function() {
                toggleFullscreen(modalImg);
            });

            // Update transform with will-change optimization
            function updateTransform() {
                if (!isModalOpen) return;

                // Add will-change before transform
                modalImg.style.willChange = 'transform';

                // Apply transform
                modalImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;

                // Remove will-change after transform is complete
                setTimeout(() => {
                    if (isModalOpen) {
                        modalImg.style.willChange = 'auto';
                    }
                }, 300);
            }

            // Add drag functionality for both mouse and touch
            let isDragging = false;
            let startX, startY, startTranslateX, startTranslateY;

            // Mouse events
            modalImg.addEventListener('mousedown', function(e) {
                if (scale > 1) {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startTranslateX = translateX;
                    startTranslateY = translateY;
                    modalImg.style.cursor = 'grabbing';
                    e.preventDefault();
                }
            });

            document.addEventListener('mousemove', function(e) {
                if (isDragging && isModalOpen) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    translateX = startTranslateX + dx / scale;
                    translateY = startTranslateY + dy / scale;
                    updateTransform();
                }
            });

            document.addEventListener('mouseup', function() {
                if (isDragging && isModalOpen) {
                    isDragging = false;
                    modalImg.style.cursor = 'grab';
                }
            });

            // Touch events for mobile
            modalImg.addEventListener('touchstart', function(e) {
                if (scale > 1 && e.touches.length === 1) {
                    isDragging = true;
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    startTranslateX = translateX;
                    startTranslateY = translateY;
                    e.preventDefault();
                }
            });

            document.addEventListener('touchmove', function(e) {
                if (isDragging && isModalOpen && e.touches.length === 1) {
                    const dx = e.touches[0].clientX - startX;
                    const dy = e.touches[0].clientY - startY;
                    translateX = startTranslateX + dx / scale;
                    translateY = startTranslateY + dy / scale;
                    updateTransform();
                    e.preventDefault();
                }
            });

            document.addEventListener('touchend', function() {
                if (isDragging && isModalOpen) {
                    isDragging = false;
                }
            });

            // Pinch zoom for mobile
            let initialDistance = 0;
            let initialScale = 1;

            modalImg.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    // Get initial distance between two fingers
                    initialDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    initialScale = scale;
                    e.preventDefault();
                }
            });

            modalImg.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2 && isModalOpen) {
                    // Calculate new distance
                    const currentDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );

                    // Calculate new scale
                    scale = Math.min(5, Math.max(0.5, initialScale * (currentDistance / initialDistance)));
                    updateTransform();
                    e.preventDefault();
                }
            });

            // Add wheel zoom functionality
            modalImg.addEventListener('wheel', function(e) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    // Zoom in
                    scale = Math.min(5, scale + 0.2);
                } else {
                    // Zoom out
                    scale = Math.max(0.5, scale - 0.2);
                }
                updateTransform();
            });

            // Close the modal when clicking the close button
            modal.querySelector('.image-modal-close').addEventListener('click', function() {
                closeModal();
            });

            // Close the modal when pressing Escape key
            const escKeyHandler = function(e) {
                if (e.key === 'Escape' && isModalOpen) {
                    closeModal();
                }
            };
            document.addEventListener('keydown', escKeyHandler);

            // Close the modal when clicking outside the image
            modal.addEventListener('click', function(e) {
                if (e.target === modal && isModalOpen) {
                    closeModal();
                }
            });

            // Function to close modal and clean up
            function closeModal() {
                isModalOpen = false;
                modal.classList.remove('show');

                // Clean up event listeners
                document.removeEventListener('keydown', escKeyHandler);

                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Error opening image modal:', error);
            alert('There was an error displaying the image. Please try again.');
        }
        });
    });
}

/**
 * Format code blocks with syntax highlighting
 */
function formatCodeBlocks() {
    // Get all code blocks
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(codeBlock => {
        // Add line numbers
        const code = codeBlock.innerHTML;
        const lines = code.split('\n');
        let formattedCode = '';

        lines.forEach((line, index) => {
            // Skip the last empty line
            if (index === lines.length - 1 && line.trim() === '') return;

            // Add a span for each line
            formattedCode += `<span class="code-line">${line}</span>\n`;
        });

        // Update the code block
        codeBlock.innerHTML = formattedCode;

        // Add line numbers class to parent
        codeBlock.parentElement.classList.add('with-line-numbers');

        // Apply syntax highlighting
        applySyntaxHighlighting(codeBlock);
    });
}

/**
 * Apply syntax highlighting to a code block
 */
function applySyntaxHighlighting(codeBlock) {
    // Simple syntax highlighting for Python
    const pythonKeywords = ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'in', 'not', 'and', 'or', 'True', 'False', 'None'];
    const pythonBuiltins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'open', 'file', 'object', 'super'];

    // Get all lines
    const lines = codeBlock.querySelectorAll('.code-line');

    lines.forEach(line => {
        // First, clean up any existing class attributes that might be showing in the rendered output
        let content = line.innerHTML;

        // Remove any visible class attributes that might be showing in the rendered output
        content = content.replace(/class=["'][^"']*["']/g, '');
        content = content.replace(/class-class=["'][^"']*["']/g, '');

        // Highlight strings - make sure to do this first to avoid conflicts
        content = content.replace(/(["'])(.*?)\1/g, '<span class="string">$&</span>');

        // Highlight comments
        content = content.replace(/(#.*$)/g, '<span class="comment">$&</span>');

        // Highlight numbers
        content = content.replace(/\b(\d+)\b/g, '<span class="number">$&</span>');

        // Highlight keywords
        pythonKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            content = content.replace(regex, '<span class="keyword">$&</span>');
        });

        // Highlight builtins
        pythonBuiltins.forEach(builtin => {
            const regex = new RegExp(`\\b(${builtin})\\b`, 'g');
            content = content.replace(regex, '<span class="builtin">$&</span>');
        });

        // Highlight function definitions
        content = content.replace(/\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="keyword">def</span> <span class="function">$2</span>');

        // Highlight class definitions
        content = content.replace(/\b(class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="keyword">class</span> <span class="class">$2</span>');

        // Highlight function calls
        content = content.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="function">$1</span>(');

        // Update the line content
        line.innerHTML = content;
    });
}

/**
 * Add captions to images that don't have them
 */
function addImageCaptions() {
    // Get all images that don't have captions
    const images = document.querySelectorAll('img:not(.image-container img):not(.content-image):not(.diagram-image)');

    images.forEach(img => {
        // If the image has an alt text, use it as a caption
        if (img.alt && !img.parentElement.classList.contains('image-container')) {
            // Create a wrapper for the image
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-container');
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);

            // Add a caption
            const caption = document.createElement('div');
            caption.classList.add('image-caption');
            caption.textContent = img.alt;
            wrapper.appendChild(caption);
        }
    });
}

// Add CSS for the image modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
/* Loading indicator for image modal */
.image-modal-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 16px;
    z-index: 10;
    gap: 15px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #4287f5;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-icon {
    color: #dc3545;
    font-size: 30px;
    margin-bottom: 10px;
}

.retry-btn {
    background-color: #4287f5;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
}

.retry-btn:hover {
    background-color: #2d6ad9;
    transform: translateY(-2px);
}

.retry-btn:active {
    transform: translateY(1px);
}
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.97);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
}

.image-modal.show {
    opacity: 1;
}

.image-modal-content {
    position: relative;
    max-width: 98%;
    max-height: 98%;
    margin: auto;
    transform: scale(0.9) translateY(20px);
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(66, 135, 245, 0.3);
    border: 3px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(10, 10, 10, 0.5);
    padding: 5px;
}

.image-modal.show .image-modal-content {
    transform: scale(1) translateY(0);
}

.image-modal-img {
    max-width: 100%;
    max-height: 90vh;
    display: block;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
    filter: brightness(1.08) contrast(1.08) saturate(1.05);
    transition: all 0.4s ease;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    will-change: transform, filter;
}

.image-modal-img:hover {
    filter: brightness(1.12) contrast(1.12) saturate(1.08);
}

.image-modal-close {
    position: absolute;
    top: -45px;
    right: 0;
    color: white;
    font-size: 36px;
    font-weight: bold;
    cursor: pointer;
    width: 55px;
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
    border: 3px solid rgba(255, 255, 255, 0.2);
    z-index: 1001;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.image-modal-close:hover {
    background-color: rgba(220, 53, 69, 0.9);
    transform: scale(1.15) rotate(90deg);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 30px rgba(220, 53, 69, 0.5);
}

.image-modal-caption {
    color: white;
    text-align: center;
    padding: 18px;
    font-style: italic;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 1.15rem;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
    transform: translateY(100%);
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    letter-spacing: 0.5px;
    line-height: 1.5;
}

.image-modal-content:hover .image-modal-caption {
    transform: translateY(0);
}

/* Add a subtle glow effect to the modal content */
@keyframes modalGlow {
    0% { box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(66, 135, 245, 0.2); }
    50% { box-shadow: 0 0 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(66, 135, 245, 0.4); }
    100% { box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(66, 135, 245, 0.2); }
}

.image-modal.show .image-modal-content {
    animation: modalGlow 3s infinite alternate ease-in-out;
}

/* Zoom indicator */
.zoom-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
    cursor: pointer;
    z-index: 5;
    font-size: 1.2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.image-container:hover .zoom-indicator {
    opacity: 0.8;
}

.zoom-indicator:hover {
    opacity: 1 !important;
    transform: scale(1.1);
    background-color: rgba(66, 135, 245, 0.8);
}

/* Modal controls */
.image-modal-controls {
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: flex;
    gap: 10px;
    z-index: 1001;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 50px;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-modal-content:hover .image-modal-controls {
    opacity: 1;
}

.modal-control-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(30, 30, 30, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
}

.modal-control-btn:hover {
    background-color: rgba(66, 135, 245, 0.8);
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.4);
}

.modal-control-btn:active {
    transform: translateY(1px);
}

.image-modal-img {
    cursor: grab;
    transition: transform 0.3s ease, filter 0.3s ease;
}

.fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

/* Image loading states */
.image-placeholder {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(10, 10, 10, 0.9));
    min-height: 100px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
}

.image-loading {
    position: relative;
}

.image-loading::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 1.5s infinite;
    z-index: 1;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.image-loaded {
    box-shadow: 0 0 20px rgba(66, 135, 245, 0.3);
    animation: successPulse 1s ease-out;
}

@keyframes successPulse {
    0% { box-shadow: 0 0 0 rgba(66, 135, 245, 0); }
    50% { box-shadow: 0 0 30px rgba(66, 135, 245, 0.5); }
    100% { box-shadow: 0 0 20px rgba(66, 135, 245, 0.3); }
}

.image-error {
    opacity: 0.7;
    filter: grayscale(1);
    border: 2px solid rgba(220, 53, 69, 0.5);
}

.image-error-message {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(220, 53, 69, 0.8);
    color: white;
    padding: 10px;
    text-align: center;
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 5;
}

/* SVG Animation */
@keyframes pulse {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.01); filter: brightness(1.05); }
    100% { transform: scale(1); filter: brightness(1); }
}

.svg-loaded {
    animation: pulse 2s ease-in-out infinite;
}
`;
document.head.appendChild(modalStyle);
