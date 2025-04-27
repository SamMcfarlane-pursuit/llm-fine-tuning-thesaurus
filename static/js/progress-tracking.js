/**
 * Progress Tracking
 * Handles tracking user progress through tutorials, exercises, and quizzes.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    initProgressTracking();
    
    // Update progress buttons based on current progress
    updateProgressButtons();
});

/**
 * Initialize progress tracking
 */
function initProgressTracking() {
    // Add event listeners to progress buttons
    const markCompletedBtn = document.getElementById('mark-completed-btn');
    if (markCompletedBtn) {
        markCompletedBtn.addEventListener('click', function() {
            const tutorialId = this.getAttribute('data-tutorial-id');
            markTutorialCompleted(tutorialId);
        });
    }
    
    // Add event listeners to progress indicators in tutorials list
    document.querySelectorAll('.progress-indicator').forEach(indicator => {
        indicator.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tutorialId = this.getAttribute('data-tutorial-id');
            const currentStatus = this.getAttribute('data-status');
            
            // Toggle status
            let newStatus;
            if (currentStatus === 'not_started') {
                newStatus = 'in_progress';
            } else if (currentStatus === 'in_progress') {
                newStatus = 'completed';
            } else {
                newStatus = 'not_started';
            }
            
            updateTutorialProgress(tutorialId, newStatus);
        });
    });
}

/**
 * Update progress buttons based on current progress
 */
function updateProgressButtons() {
    // Update mark completed button
    const markCompletedBtn = document.getElementById('mark-completed-btn');
    if (markCompletedBtn) {
        const tutorialId = markCompletedBtn.getAttribute('data-tutorial-id');
        const progressStatus = markCompletedBtn.getAttribute('data-status');
        
        if (progressStatus === 'completed') {
            markCompletedBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Completed';
            markCompletedBtn.classList.remove('btn-success');
            markCompletedBtn.classList.add('btn-outline-success');
        } else {
            markCompletedBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Mark as Completed';
            markCompletedBtn.classList.remove('btn-outline-success');
            markCompletedBtn.classList.add('btn-success');
        }
    }
}

/**
 * Mark a tutorial as completed
 * @param {string} tutorialId - ID of the tutorial
 */
function markTutorialCompleted(tutorialId) {
    updateTutorialProgress(tutorialId, 'completed');
}

/**
 * Update tutorial progress
 * @param {string} tutorialId - ID of the tutorial
 * @param {string} status - Status of progress (not_started, in_progress, completed)
 */
function updateTutorialProgress(tutorialId, status) {
    // Check if user is authenticated
    const isAuthenticated = document.body.classList.contains('user-authenticated');
    
    if (isAuthenticated) {
        // Send AJAX request to update progress
        fetch('/api/progress/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                content_type: 'tutorial',
                content_id: tutorialId,
                status: status
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI
                updateProgressUI(tutorialId, status);
                
                // Show success message
                showToast('Progress updated!', 'success');
            } else {
                showToast('Failed to update progress', 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating progress:', error);
            showToast('Error updating progress', 'danger');
        });
    } else {
        // Store progress in localStorage for anonymous users
        const progressKey = `progress_tutorial_${tutorialId}`;
        const progressData = {
            content_type: 'tutorial',
            content_id: tutorialId,
            status: status,
            updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        
        // Update UI
        updateProgressUI(tutorialId, status);
        
        // Show login prompt
        showToast('Progress saved locally. Sign in to sync across devices!', 'info');
    }
}

/**
 * Update progress UI elements
 * @param {string} tutorialId - ID of the tutorial
 * @param {string} status - Status of progress
 */
function updateProgressUI(tutorialId, status) {
    // Update mark completed button
    const markCompletedBtn = document.getElementById('mark-completed-btn');
    if (markCompletedBtn && markCompletedBtn.getAttribute('data-tutorial-id') === tutorialId) {
        markCompletedBtn.setAttribute('data-status', status);
        
        if (status === 'completed') {
            markCompletedBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Completed';
            markCompletedBtn.classList.remove('btn-success');
            markCompletedBtn.classList.add('btn-outline-success');
        } else {
            markCompletedBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Mark as Completed';
            markCompletedBtn.classList.remove('btn-outline-success');
            markCompletedBtn.classList.add('btn-success');
        }
    }
    
    // Update progress indicators in tutorials list
    document.querySelectorAll(`.progress-indicator[data-tutorial-id="${tutorialId}"]`).forEach(indicator => {
        indicator.setAttribute('data-status', status);
        
        // Update icon and color
        const icon = indicator.querySelector('i');
        if (icon) {
            icon.className = ''; // Clear existing classes
            
            if (status === 'completed') {
                icon.classList.add('bi', 'bi-check-circle-fill', 'text-success');
                indicator.setAttribute('title', 'Completed');
            } else if (status === 'in_progress') {
                icon.classList.add('bi', 'bi-hourglass-split', 'text-warning');
                indicator.setAttribute('title', 'In Progress');
            } else {
                icon.classList.add('bi', 'bi-circle', 'text-secondary');
                indicator.setAttribute('title', 'Not Started');
            }
        }
    });
    
    // Update progress bars
    updateProgressBars();
}

/**
 * Update progress bars
 */
function updateProgressBars() {
    // Get all tutorials
    const tutorials = document.querySelectorAll('.tutorial-card');
    if (tutorials.length === 0) return;
    
    // Count completed tutorials
    let completedCount = 0;
    let totalCount = 0;
    
    tutorials.forEach(tutorial => {
        const progressIndicator = tutorial.querySelector('.progress-indicator');
        if (progressIndicator) {
            totalCount++;
            if (progressIndicator.getAttribute('data-status') === 'completed') {
                completedCount++;
            }
        }
    });
    
    // Calculate progress percentage
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Update progress bars
    document.querySelectorAll('.progress-bar').forEach(progressBar => {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
        progressBar.textContent = `${progressPercentage}%`;
    });
    
    // Update progress text
    document.querySelectorAll('.progress-text').forEach(progressText => {
        progressText.textContent = `${completedCount} of ${totalCount} completed`;
    });
}

/**
 * Get CSRF token from meta tag
 * @returns {string} CSRF token
 */
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, danger, warning, info)
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
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('id', toastId);
    
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
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}
