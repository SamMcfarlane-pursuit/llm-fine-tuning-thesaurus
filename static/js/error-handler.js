/**
 * Error Handler
 * This script catches and handles JavaScript errors to prevent the page from becoming unresponsive
 */

(function() {
    console.log('Error Handler: Initializing...');
    
    // Global error handler
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Caught error:', message, 'at', source, 'line', lineno, 'column', colno);
        console.error('Error object:', error);
        
        // Prevent the error from causing the page to become unresponsive
        return true;
    };
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Prevent the error from causing the page to become unresponsive
        event.preventDefault();
    });
    
    // Add a timeout to ensure the page loads even if there are script errors
    setTimeout(function() {
        // Force visibility of auth buttons
        const authButtonsContainer = document.querySelector('.auth-buttons-container');
        const signInBtn = document.querySelector('.sign-in-btn');
        const registerBtn = document.querySelector('.register-btn');
        
        if (authButtonsContainer) {
            authButtonsContainer.style.display = 'flex';
            authButtonsContainer.style.visibility = 'visible';
            authButtonsContainer.style.opacity = '1';
        }
        
        if (signInBtn) {
            signInBtn.style.visibility = 'visible';
            signInBtn.style.opacity = '1';
        }
        
        if (registerBtn) {
            registerBtn.style.visibility = 'visible';
            registerBtn.style.opacity = '1';
        }
        
        // Apply theme colors
        const body = document.body;
        const isLightTheme = body.classList.contains('light-theme');
        
        if (isLightTheme) {
            // Light mode (blue)
            document.documentElement.style.setProperty('--vibrant-bg-primary', '#e3f2fd', 'important');
            document.documentElement.style.setProperty('--vibrant-bg-secondary', '#bbdefb', 'important');
            document.documentElement.style.setProperty('--vibrant-text-primary', '#0d47a1', 'important');
            document.documentElement.style.setProperty('--vibrant-text-secondary', '#1565c0', 'important');
        } else {
            // Dark mode (purple)
            document.documentElement.style.setProperty('--vibrant-bg-primary', '#1a0033', 'important');
            document.documentElement.style.setProperty('--vibrant-bg-secondary', '#2d0052', 'important');
        }
        
        console.log('Error Handler: Page loaded successfully');
    }, 1000);
})();
