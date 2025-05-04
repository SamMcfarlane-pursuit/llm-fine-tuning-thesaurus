/**
 * Help Button JavaScript
 * Provides functionality for the accessible floating help button
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create and add the help button to the page
    function createHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'help-button';
        helpButton.setAttribute('aria-label', 'Get help');
        helpButton.setAttribute('title', 'Get help');
        helpButton.setAttribute('id', 'help-button');
        helpButton.setAttribute('tabindex', '0');
        
        // Create the help icon
        helpButton.innerHTML = `
            <div class="help-icon">
                <div class="help-icon-circle"></div>
                <span class="help-icon-text">?</span>
            </div>
            <span class="sr-only">Get help</span>
        `;
        
        // Add to the document
        document.body.appendChild(helpButton);
        
        // Add click event listener
        helpButton.addEventListener('click', showHelpModal);
        
        // Add keyboard event listener for accessibility
        helpButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showHelpModal();
            }
        });
    }
    
    // Create and show the help modal
    function showHelpModal() {
        // Check if modal already exists
        if (document.getElementById('help-modal')) {
            document.getElementById('help-modal').classList.add('show');
            return;
        }
        
        // Create the modal
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.id = 'help-modal';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'help-modal-title');
        helpModal.setAttribute('aria-modal', 'true');
        
        // Get current page information
        const currentPage = window.location.pathname;
        const pageTitle = document.title;
        
        // Create modal content based on current page
        helpModal.innerHTML = `
            <div class="help-modal-header">
                <h3 class="help-modal-title" id="help-modal-title">
                    <i class="bi bi-question-circle me-2"></i>
                    Help & Support
                </h3>
                <button class="help-modal-close" aria-label="Close help">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="help-modal-body">
                <h4>How can we help you?</h4>
                <p>You're currently on: <strong>${pageTitle}</strong></p>
                
                <h4>Common Questions</h4>
                <ul>
                    <li>How do I navigate between different sections?</li>
                    <li>Where can I find more information about LLM fine-tuning?</li>
                    <li>How do I access the exercises and tutorials?</li>
                    <li>What's the difference between LoRA and QLoRA?</li>
                </ul>
                
                <h4>Keyboard Shortcuts</h4>
                <ul>
                    <li><strong>Alt + S</strong>: Focus on search</li>
                    <li><strong>Alt + H</strong>: Open this help dialog</li>
                    <li><strong>Esc</strong>: Close dialogs</li>
                </ul>
                
                <h4>Accessibility Features</h4>
                <p>This site is designed to be accessible to all users. If you're experiencing any accessibility issues, please contact us using the button below.</p>
            </div>
            <div class="help-modal-footer">
                <button class="help-dismiss-btn">
                    <i class="bi bi-x-circle me-1"></i> Dismiss
                </button>
                <a href="/contact" class="help-contact-btn">
                    <i class="bi bi-envelope me-1"></i> Contact Support
                </a>
            </div>
        `;
        
        // Add to the document
        document.body.appendChild(helpModal);
        
        // Show the modal
        setTimeout(() => {
            helpModal.classList.add('show');
        }, 10);
        
        // Add event listeners
        const closeButton = helpModal.querySelector('.help-modal-close');
        const dismissButton = helpModal.querySelector('.help-dismiss-btn');
        
        closeButton.addEventListener('click', hideHelpModal);
        dismissButton.addEventListener('click', hideHelpModal);
        
        // Close on Escape key
        document.addEventListener('keydown', function escapeListener(e) {
            if (e.key === 'Escape') {
                hideHelpModal();
                document.removeEventListener('keydown', escapeListener);
            }
        });
        
        // Close when clicking outside the modal
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) {
                hideHelpModal();
            }
        });
    }
    
    // Hide the help modal
    function hideHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.remove('show');
        }
    }
    
    // Add keyboard shortcut for help (Alt+H)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            showHelpModal();
        }
    });
    
    // Initialize
    createHelpButton();
});
