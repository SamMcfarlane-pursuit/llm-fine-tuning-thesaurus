/**
 * Load Auth Buttons Fix
 * This script ensures the direct-auth-buttons-fix.js script is loaded and executed
 */

(function() {
    console.log('Load Auth Buttons Fix: Initializing...');

    // Check if the direct-auth-buttons-fix.js script is already loaded
    const scriptLoaded = document.querySelector('script[src*="direct-auth-buttons-fix.js"]');

    if (!scriptLoaded) {
        console.log('Load Auth Buttons Fix: Loading direct-auth-buttons-fix.js...');

        // Create the script element
        const script = document.createElement('script');
        script.src = '/static/js/direct-auth-buttons-fix.js';
        script.async = true;
        script.defer = true;

        // Add the script to the head
        document.head.appendChild(script);

        console.log('Load Auth Buttons Fix: direct-auth-buttons-fix.js loaded');
    } else {
        console.log('Load Auth Buttons Fix: direct-auth-buttons-fix.js already loaded');
    }

    // Execute the fixAuthButtons function if it exists
    if (typeof fixAuthButtons === 'function') {
        console.log('Load Auth Buttons Fix: Executing fixAuthButtons...');
        fixAuthButtons();
    } else {
        console.log('Load Auth Buttons Fix: fixAuthButtons function not found, will try again later...');

        // Set an interval to check if the function exists and execute it
        const interval = setInterval(function() {
            if (typeof fixAuthButtons === 'function') {
                console.log('Load Auth Buttons Fix: Executing fixAuthButtons...');
                fixAuthButtons();
                clearInterval(interval);
            }
        }, 100);

        // Clear the interval after 5 seconds to prevent infinite checking
        setTimeout(function() {
            clearInterval(interval);
        }, 5000);
    }
})();
