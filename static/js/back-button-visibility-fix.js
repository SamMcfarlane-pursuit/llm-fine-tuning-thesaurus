/**
 * Back Button Visibility Fix
 * Ensures back buttons are properly visible and functional across all pages
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // Find all back buttons
        const backButtons = document.querySelectorAll('.back-button, [data-back], .btn-back');
        
        backButtons.forEach(function(button) {
            // Ensure button is visible
            if (button.style.display === 'none') {
                button.style.display = 'inline-block';
            }
            
            // Add proper styling if missing
            if (!button.classList.contains('btn')) {
                button.classList.add('btn', 'btn-secondary');
            }
            
            // Ensure click handler exists
            if (!button.onclick && !button.href) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Try to go back in history
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        // Fallback to home page
                        window.location.href = '/';
                    }
                });
            }
        });
        
        // Add back button to pages that might need one
        const currentPath = window.location.pathname;
        const needsBackButton = [
            '/learn',
            '/tutorials',
            '/exercises',
            '/quiz',
            '/workshops',
            '/profile'
        ];
        
        if (needsBackButton.some(path => currentPath.startsWith(path))) {
            const existingBackButton = document.querySelector('.back-button, [data-back], .btn-back');
            
            if (!existingBackButton) {
                const backButton = document.createElement('button');
                backButton.className = 'btn btn-secondary back-button';
                backButton.innerHTML = '← Back';
                backButton.style.marginBottom = '20px';
                
                backButton.addEventListener('click', function() {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = '/';
                    }
                });
                
                // Insert at the beginning of main content
                const mainContent = document.querySelector('main, .main-content, .container');
                if (mainContent) {
                    mainContent.insertBefore(backButton, mainContent.firstChild);
                }
            }
        }
    });
    
})();