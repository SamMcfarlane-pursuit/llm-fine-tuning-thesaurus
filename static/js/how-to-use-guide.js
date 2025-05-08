/**
 * How to Use Guide JavaScript
 * Handles the behavior of the "How to Use This Site" modal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    
    // If this is the first visit, show the modal automatically
    if (!hasVisitedBefore) {
        // Wait a short time to ensure the page is fully loaded
        setTimeout(function() {
            const howToUseModal = new bootstrap.Modal(document.getElementById('howToUseModal'));
            howToUseModal.show();
            
            // Set the flag in localStorage to indicate the user has visited before
            localStorage.setItem('hasVisitedBefore', 'true');
        }, 1500);
    }
    
    // Handle the "Start Exploring" button click
    document.getElementById('startExploringBtn').addEventListener('click', function() {
        // Scroll to the quick access navigation
        const quickAccessNav = document.querySelector('.quick-access-nav');
        if (quickAccessNav) {
            quickAccessNav.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Add a click event to reset the "first visit" flag (for testing)
    // This is hidden in the UI but can be triggered by developers
    const resetVisitFlagBtn = document.createElement('button');
    resetVisitFlagBtn.id = 'resetVisitFlagBtn';
    resetVisitFlagBtn.style.display = 'none';
    resetVisitFlagBtn.addEventListener('click', function() {
        localStorage.removeItem('hasVisitedBefore');
        console.log('First visit flag has been reset. Refresh the page to see the modal again.');
    });
    document.body.appendChild(resetVisitFlagBtn);
});
