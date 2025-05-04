/**
 * Enhanced Notebook Viewer JavaScript
 * Provides interactive functionality for Jupyter notebook viewing
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize notebook viewer
    initNotebookViewer();
    
    // Initialize progress tracking
    initProgressTracking();
    
    // Initialize Google/Colab integration
    initColabIntegration();
    
    // Handle responsive behavior
    handleResponsive();
    
    // Add touch events for mobile and iPad
    initTouchEvents();
});

/**
 * Initialize notebook viewer functionality
 */
function initNotebookViewer() {
    const notebookIframe = document.querySelector('.notebook-iframe');
    const loadingIndicator = document.querySelector('.notebook-loading');
    const progressBar = document.querySelector('.notebook-progress-bar');
    
    if (!notebookIframe) return;
    
    // Show loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    
    // Animate progress bar
    if (progressBar) {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) {
                progress = 90;
                clearInterval(progressInterval);
            }
            progressBar.style.width = `${progress}%`;
        }, 300);
    }
    
    // Handle iframe load event
    notebookIframe.addEventListener('load', function() {
        // Hide loading indicator after a short delay
        setTimeout(() => {
            if (loadingIndicator) {
                loadingIndicator.style.opacity = '0';
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 300);
            }
            
            // Complete progress bar
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }, 500);
        
        // Try to adjust iframe content for better mobile viewing
        try {
            const iframeDocument = notebookIframe.contentDocument || notebookIframe.contentWindow.document;
            
            // Add viewport meta tag for responsive behavior
            const head = iframeDocument.querySelector('head');
            if (head) {
                const viewportMeta = iframeDocument.createElement('meta');
                viewportMeta.name = 'viewport';
                viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                head.appendChild(viewportMeta);
                
                // Add custom styles for better mobile viewing
                const style = iframeDocument.createElement('style');
                style.textContent = `
                    body { font-size: 16px; }
                    pre { white-space: pre-wrap; word-break: break-word; }
                    table { display: block; width: 100%; overflow-x: auto; }
                    img { max-width: 100%; height: auto; }
                    
                    @media (max-width: 768px) {
                        body { font-size: 14px; }
                        .cell { padding: 5px !important; }
                        .prompt { display: none !important; }
                    }
                `;
                head.appendChild(style);
            }
        } catch (error) {
            console.warn('Could not modify iframe content:', error);
        }
    });
    
    // Handle iframe load errors
    notebookIframe.addEventListener('error', function() {
        handleNotebookError('Failed to load notebook');
    });
    
    // Set a timeout for loading
    setTimeout(() => {
        if (loadingIndicator && loadingIndicator.style.display !== 'none') {
            handleNotebookError('Notebook loading timed out');
        }
    }, 30000);
}

/**
 * Handle notebook loading errors
 * @param {string} message - Error message to display
 */
function handleNotebookError(message) {
    const notebookContainer = document.querySelector('.enhanced-notebook-container');
    const loadingIndicator = document.querySelector('.notebook-loading');
    
    if (!notebookContainer) return;
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Create error element if it doesn't exist
    let errorElement = document.querySelector('.notebook-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'notebook-error';
        errorElement.innerHTML = `
            <div class="notebook-error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div class="notebook-error-title">Failed to Load Notebook</div>
            <div class="notebook-error-message">${message}</div>
            <div class="notebook-error-actions">
                <button class="notebook-btn primary" onclick="location.reload()">
                    <i class="bi bi-arrow-repeat"></i>Retry
                </button>
                <a href="/tutorials" class="notebook-btn outline">
                    <i class="bi bi-arrow-left"></i>Back to Tutorials
                </a>
            </div>
        `;
        notebookContainer.appendChild(errorElement);
    } else {
        // Update error message
        const errorMessage = errorElement.querySelector('.notebook-error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorElement.style.display = 'flex';
    }
}

/**
 * Initialize progress tracking
 */
function initProgressTracking() {
    const markCompletedBtn = document.getElementById('mark-completed-btn');
    
    if (!markCompletedBtn) return;
    
    markCompletedBtn.addEventListener('click', function() {
        const tutorialId = this.getAttribute('data-tutorial-id');
        const currentStatus = this.getAttribute('data-status');
        const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
        
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Updating...';
        this.disabled = true;
        
        // Make AJAX request to update progress
        fetch('/api/update-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tutorial_id: tutorialId,
                status: newStatus
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update button state
            if (newStatus === 'completed') {
                this.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Completed';
                this.classList.remove('outline');
                this.classList.add('success');
            } else {
                this.innerHTML = '<i class="bi bi-check-circle me-2"></i>Mark as Completed';
                this.classList.remove('success');
                this.classList.add('outline');
            }
            
            // Update data attribute
            this.setAttribute('data-status', newStatus);
            
            // Show success message
            showNotification('Progress updated successfully!', 'success');
        })
        .catch(error => {
            console.error('Error updating progress:', error);
            
            // Reset button
            this.innerHTML = originalText;
            this.disabled = false;
            
            // Show error message
            showNotification('Failed to update progress. Please try again.', 'error');
        });
    });
}

/**
 * Initialize Google/Colab integration
 */
function initColabIntegration() {
    const colabBtn = document.querySelector('.notebook-btn[data-colab-url]');
    
    if (!colabBtn) return;
    
    const colabUrl = colabBtn.getAttribute('data-colab-url');
    
    // Check if Google API is available
    if (typeof gapi !== 'undefined' && gapi.auth2) {
        // Check if user is signed in
        const auth2 = gapi.auth2.getAuthInstance();
        
        if (auth2.isSignedIn.get()) {
            const profile = auth2.currentUser.get().getBasicProfile();
            const userName = profile.getName();
            const profilePic = profile.getImageUrl();
            
            // Update button with user info
            colabBtn.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${profilePic}" alt="${userName}" class="rounded-circle me-2" style="width: 24px; height: 24px;">
                    <span>Open in Colab as ${userName.split(' ')[0]}</span>
                </div>
            `;
        }
        
        // Add click handler for signed-in users
        colabBtn.addEventListener('click', function(e) {
            if (auth2.isSignedIn.get()) {
                e.preventDefault();
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Preparing...';
                this.disabled = true;
                
                // Simulate creating a copy in user's Drive
                setTimeout(() => {
                    window.open(colabUrl, '_blank');
                    
                    // Reset button
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
            }
        });
    }
}

/**
 * Handle responsive behavior
 */
function handleResponsive() {
    const updateLayout = () => {
        const width = window.innerWidth;
        const actionButtons = document.querySelectorAll('.notebook-btn');
        
        if (width <= 576) {
            // For very small screens, simplify button text
            actionButtons.forEach(button => {
                const icon = button.querySelector('i');
                const text = button.textContent.trim();
                
                if (icon && text) {
                    // Store original text if not already stored
                    if (!button.getAttribute('data-original-text')) {
                        button.setAttribute('data-original-text', text);
                    }
                    
                    // Simplify text
                    const simplifiedText = text.split(' ')[0];
                    button.innerHTML = '';
                    button.appendChild(icon);
                    button.appendChild(document.createTextNode(simplifiedText));
                }
            });
        } else {
            // Restore original button text
            actionButtons.forEach(button => {
                const originalText = button.getAttribute('data-original-text');
                
                if (originalText) {
                    const icon = button.querySelector('i');
                    
                    if (icon) {
                        button.innerHTML = '';
                        button.appendChild(icon);
                        button.appendChild(document.createTextNode(originalText));
                    }
                }
            });
        }
    };
    
    // Initial update
    updateLayout();
    
    // Update on resize
    window.addEventListener('resize', updateLayout);
}

/**
 * Initialize touch events for mobile and iPad
 */
function initTouchEvents() {
    // Check if device is mobile or iPad
    const isMobileOrIPad = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobileOrIPad) {
        // Add touch-specific styles
        const notebookIframe = document.querySelector('.notebook-iframe');
        
        if (notebookIframe) {
            notebookIframe.style.webkitOverflowScrolling = 'touch';
        }
        
        // Make buttons more touch-friendly
        const actionButtons = document.querySelectorAll('.notebook-btn');
        
        actionButtons.forEach(button => {
            button.style.padding = '12px 20px';
            
            // Add touch feedback
            button.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            
            button.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
            
            button.addEventListener('touchcancel', function() {
                this.style.opacity = '1';
            });
        });
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}
