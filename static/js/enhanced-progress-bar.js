/**
 * Enhanced Progress Bar JavaScript
 * Provides interactive functionality for the progress tracking system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize circular progress animations
    initCircularProgress();
    
    // Initialize linear progress animations
    initLinearProgress();
    
    // Add hover effects to stat items
    initStatItems();
    
    // Initialize module cards
    initModuleCards();
    
    // Handle responsive behavior
    handleResponsive();
    
    // Add scroll animations
    initScrollAnimations();
});

/**
 * Initialize circular progress animations
 */
function initCircularProgress() {
    const circularProgress = document.querySelectorAll('.progress-ring');
    
    if (circularProgress.length === 0) return;
    
    // Set initial progress to 0
    circularProgress.forEach(progress => {
        const targetProgress = progress.getAttribute('data-progress') + '%';
        const progressColor = progress.getAttribute('data-color') || 'var(--bs-primary)';
        
        // Set custom properties
        progress.style.setProperty('--progress-color', progressColor);
        progress.style.setProperty('--progress', '0%');
        
        // Animate progress after a short delay
        setTimeout(() => {
            progress.style.setProperty('--progress', targetProgress);
        }, 300);
    });
}

/**
 * Initialize linear progress animations
 */
function initLinearProgress() {
    const linearProgress = document.querySelectorAll('.linear-progress-bar');
    
    if (linearProgress.length === 0) return;
    
    // Set initial width to 0
    linearProgress.forEach(progress => {
        const targetWidth = progress.getAttribute('data-progress') + '%';
        
        // Set initial width
        progress.style.width = '0%';
        
        // Set target width as a custom property
        progress.style.setProperty('--progress-width', targetWidth);
        
        // Add animation class after a short delay
        setTimeout(() => {
            progress.classList.add('animate-progress');
            progress.style.width = targetWidth;
        }, 500);
    });
}

/**
 * Initialize stat items with hover effects
 */
function initStatItems() {
    const statItems = document.querySelectorAll('.stat-item');
    
    if (statItems.length === 0) return;
    
    statItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * Initialize module cards with hover effects
 */
function initModuleCards() {
    const moduleCards = document.querySelectorAll('.workshop-module-card');
    
    if (moduleCards.length === 0) return;
    
    moduleCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Initialize module buttons
    const moduleButtons = document.querySelectorAll('.module-btn');
    
    moduleButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(1px)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
}

/**
 * Handle responsive behavior
 */
function handleResponsive() {
    const updateLayout = () => {
        const width = window.innerWidth;
        const progressHeader = document.querySelector('.progress-header');
        const progressBody = document.querySelector('.progress-body');
        const statItems = document.querySelectorAll('.stat-item');
        
        if (!progressHeader || !progressBody) return;
        
        if (width <= 576) {
            progressHeader.style.padding = '15px';
            progressBody.style.padding = '15px';
            
            statItems.forEach(item => {
                item.style.padding = '8px';
                item.style.minWidth = '60px';
            });
        } else if (width <= 768) {
            progressHeader.style.padding = '20px';
            progressBody.style.padding = '20px';
            
            statItems.forEach(item => {
                item.style.padding = '10px';
                item.style.minWidth = '70px';
            });
        } else {
            progressHeader.style.padding = '25px';
            progressBody.style.padding = '25px';
            
            statItems.forEach(item => {
                item.style.padding = '15px';
                item.style.minWidth = '100px';
            });
        }
    };
    
    // Initial update
    updateLayout();
    
    // Update on resize
    window.addEventListener('resize', updateLayout);
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.workshop-module-card, .stat-item, .circular-progress');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            // Check if element is in viewport
            if (elementTop < windowHeight && elementBottom > 0) {
                element.classList.add('visible');
                
                if (element.classList.contains('workshop-module-card')) {
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                }
                
                if (element.classList.contains('stat-item')) {
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                }
                
                if (element.classList.contains('circular-progress')) {
                    const ring = element.querySelector('.progress-ring');
                    if (ring) {
                        const targetProgress = ring.getAttribute('data-progress') + '%';
                        ring.style.setProperty('--progress', targetProgress);
                    }
                }
            }
        });
    };
    
    // Set initial state
    document.querySelectorAll('.workshop-module-card, .stat-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Animate elements in viewport on load
    setTimeout(animateOnScroll, 300);
    
    // Animate elements on scroll
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * Update progress data via AJAX
 * @param {string} workshopId - The ID of the workshop
 * @param {string} moduleId - The ID of the module
 * @param {string} status - The new status (completed, in_progress, not_started)
 */
function updateProgress(workshopId, moduleId, status) {
    // Show loading indicator
    const moduleCard = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (moduleCard) {
        const actionButton = moduleCard.querySelector('.module-btn');
        if (actionButton) {
            const originalText = actionButton.innerHTML;
            actionButton.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Updating...';
            actionButton.disabled = true;
            
            // Simulate AJAX request (replace with actual AJAX in production)
            setTimeout(() => {
                // Update UI
                const statusBadge = moduleCard.querySelector('.module-status');
                const progressBar = moduleCard.querySelector('.module-progress-bar');
                const headerSection = moduleCard.querySelector('.module-card-header');
                
                if (statusBadge) {
                    statusBadge.className = `module-status ${status}`;
                    statusBadge.textContent = status.replace('_', ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                
                if (headerSection) {
                    headerSection.className = `module-card-header ${status}`;
                }
                
                if (progressBar) {
                    progressBar.className = `module-progress-bar ${status}`;
                    
                    if (status === 'completed') {
                        progressBar.style.width = '100%';
                    } else if (status === 'in-progress') {
                        progressBar.style.width = '50%';
                    } else {
                        progressBar.style.width = '0%';
                    }
                }
                
                // Reset button
                actionButton.innerHTML = originalText;
                actionButton.disabled = false;
                
                // Show success message
                showToast('Progress updated successfully!', 'success');
                
                // Update overall progress (this would be calculated server-side in production)
                updateOverallProgress();
            }, 1000);
        }
    }
}

/**
 * Update overall progress indicators
 */
function updateOverallProgress() {
    // This would typically be calculated server-side
    // For demo purposes, we'll just update the UI with new values
    
    const completedModules = document.querySelectorAll('.module-status.completed').length;
    const inProgressModules = document.querySelectorAll('.module-status.in-progress').length;
    const totalModules = document.querySelectorAll('.module-status').length;
    
    const completedPercentage = Math.round((completedModules / totalModules) * 100);
    const inProgressPercentage = Math.round((inProgressModules / totalModules) * 100);
    
    // Update circular progress
    const circularProgress = document.querySelector('.progress-ring');
    if (circularProgress) {
        circularProgress.style.setProperty('--progress', completedPercentage + '%');
        
        const percentageText = document.querySelector('.progress-percentage');
        if (percentageText) {
            percentageText.textContent = completedPercentage + '%';
        }
    }
    
    // Update linear progress bars
    const completedBar = document.querySelector('.linear-progress-bar.completed');
    const inProgressBar = document.querySelector('.linear-progress-bar.in-progress');
    
    if (completedBar) {
        completedBar.style.width = completedPercentage + '%';
    }
    
    if (inProgressBar) {
        inProgressBar.style.width = inProgressPercentage + '%';
    }
    
    // Update stat values
    const completedStat = document.querySelector('.stat-value.completed');
    const inProgressStat = document.querySelector('.stat-value.in-progress');
    
    if (completedStat) {
        completedStat.textContent = completedModules;
    }
    
    if (inProgressStat) {
        inProgressStat.textContent = inProgressModules;
    }
    
    // Update progress legend
    const completedLegend = document.querySelector('.progress-legend span:first-child');
    const inProgressLegend = document.querySelector('.progress-legend span:nth-child(2)');
    const notStartedLegend = document.querySelector('.progress-legend span:last-child');
    
    if (completedLegend) {
        completedLegend.textContent = completedPercentage + '% Completed';
    }
    
    if (inProgressLegend) {
        inProgressLegend.textContent = inProgressPercentage + '% In Progress';
    }
    
    if (notStartedLegend) {
        const notStartedPercentage = 100 - completedPercentage - inProgressPercentage;
        notStartedLegend.textContent = notStartedPercentage + '% Not Started';
    }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
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
