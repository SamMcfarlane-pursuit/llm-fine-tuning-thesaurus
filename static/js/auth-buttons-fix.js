/**
 * Auth Buttons Fix
 * Styled to exactly match the image with proper positioning and icons
 * Enhanced with more robust initialization and error handling
 */

// Execute immediately to ensure the script runs as soon as possible
(function() {
    console.log('Auth Buttons Fix: Immediate execution started');
    
    // Try to apply styling immediately
    applyExactStyling();
    
    // Also wait for DOM content to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Auth Buttons Fix: DOM Content Loaded');
        
        // Apply the exact styling from the image
        applyExactStyling();
        
        // Add window resize listener to ensure buttons stay aligned
        window.addEventListener('resize', applyExactStyling);
        
        // Add accessibility features
        enhanceButtonAccessibility();
        
        // Set up a mutation observer to watch for DOM changes
        setupMutationObserver();
        
        // Set an interval to periodically check and reapply styles
        // This ensures the styles are applied even if other scripts modify the DOM
        setInterval(applyExactStyling, 1000);
    });
    
    // Also apply when window loads (all resources loaded)
    window.addEventListener('load', function() {
        console.log('Auth Buttons Fix: Window Loaded');
        applyExactStyling();
        enhanceButtonAccessibility();
    });
})();

/**
 * Set up a mutation observer to watch for DOM changes
 * This will reapply our styles if other scripts modify the DOM
 */
function setupMutationObserver() {
    try {
        // Create a new observer
        const observer = new MutationObserver(function(mutations) {
            // Check if any of the mutations affect our elements
            const shouldReapply = mutations.some(mutation => {
                // Check if the mutation affects the auth buttons
                return mutation.target.classList && 
                      (mutation.target.classList.contains('auth-links') || 
                       mutation.target.classList.contains('auth-buttons-container') ||
                       mutation.target.classList.contains('sign-in-btn') ||
                       mutation.target.classList.contains('register-btn') ||
                       mutation.target.classList.contains('top-auth-bar') ||
                       mutation.target.classList.contains('feature-button'));
            });
            
            // If our elements are affected, reapply the styling
            if (shouldReapply) {
                console.log('Auth Buttons Fix: DOM mutation detected, reapplying styles');
                applyExactStyling();
            }
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        console.log('Auth Buttons Fix: Mutation observer set up successfully');
    } catch (error) {
        console.error('Auth Buttons Fix: Error setting up mutation observer', error);
    }
}

/**
 * Apply the exact styling from the image
 * Enhanced with more robust error handling and logging
 */
function applyExactStyling() {
    try {
        // Get auth links container
        const authLinks = document.querySelector('.auth-links');
        if (!authLinks) {
            console.warn('Auth Buttons Fix: .auth-links not found');
            return;
        }
        
        // Get auth buttons
        const signInBtn = authLinks.querySelector('.sign-in-btn');
        const registerBtn = authLinks.querySelector('.register-btn');
        
        // If both buttons exist, apply the exact styling
        if (signInBtn && registerBtn) {
            console.log('Auth Buttons Fix: Applying exact styling from image');
            
            // Ensure the buttons are visible
            signInBtn.style.display = 'inline-flex';
            signInBtn.style.visibility = 'visible';
            signInBtn.style.opacity = '1';
            registerBtn.style.display = 'inline-flex';
            registerBtn.style.visibility = 'visible';
            registerBtn.style.opacity = '1';
            
            // Sign In button styling
            signInBtn.style.backgroundColor = 'rgba(30, 0, 60, 0.5)';
            signInBtn.style.border = '2px solid rgba(0, 195, 255, 0.3)';
            signInBtn.style.color = '#00c3ff';
            signInBtn.style.borderRadius = '50px';
            signInBtn.style.padding = '15px 30px';
            signInBtn.style.height = '60px'; // Match height in image
            signInBtn.style.width = '210px'; // Match width in image
            signInBtn.style.display = 'inline-flex';
            signInBtn.style.alignItems = 'center';
            signInBtn.style.justifyContent = 'center';
            signInBtn.style.fontWeight = '500';
            signInBtn.style.fontSize = '1.1rem';
            signInBtn.style.textAlign = 'center';
            signInBtn.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
            signInBtn.style.transition = 'all 0.3s ease';
            signInBtn.style.zIndex = '1002';
            signInBtn.style.pointerEvents = 'auto';
            
            // Register button styling
            registerBtn.style.backgroundColor = 'rgba(180, 70, 207, 0.8)';
            registerBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            registerBtn.style.color = 'white';
            registerBtn.style.borderRadius = '50px';
            registerBtn.style.padding = '15px 30px';
            registerBtn.style.height = '60px'; // Match height in image
            registerBtn.style.width = '210px'; // Match width in image
            registerBtn.style.display = 'inline-flex';
            registerBtn.style.alignItems = 'center';
            registerBtn.style.justifyContent = 'center';
            registerBtn.style.fontWeight = '500';
            registerBtn.style.fontSize = '1.1rem';
            registerBtn.style.textAlign = 'center';
            registerBtn.style.boxShadow = '0 0 15px rgba(180, 70, 207, 0.3)';
            registerBtn.style.transition = 'all 0.3s ease';
            registerBtn.style.zIndex = '1002';
            registerBtn.style.pointerEvents = 'auto';
            
            // Add hover effects
            addExactHoverEffect(signInBtn, 'sign-in');
            addExactHoverEffect(registerBtn, 'register');
            
            // Ensure icons are visible and properly styled
            const signInIcon = signInBtn.querySelector('i');
            const registerIcon = registerBtn.querySelector('i');
            
            if (signInIcon) {
                signInIcon.style.display = 'inline-block';
                signInIcon.style.marginRight = '8px';
                signInIcon.style.fontSize = '1.1rem';
                signInIcon.style.verticalAlign = 'middle';
                signInIcon.style.visibility = 'visible';
                signInIcon.style.opacity = '1';
            } else {
                // If icon doesn't exist, create it
                const icon = document.createElement('i');
                icon.className = 'bi bi-box-arrow-in-right me-1';
                icon.style.display = 'inline-block';
                icon.style.marginRight = '8px';
                icon.style.fontSize = '1.1rem';
                icon.style.verticalAlign = 'middle';
                icon.style.visibility = 'visible';
                icon.style.opacity = '1';
                
                // Insert the icon at the beginning of the button
                if (signInBtn.firstChild) {
                    signInBtn.insertBefore(icon, signInBtn.firstChild);
                } else {
                    signInBtn.appendChild(icon);
                    signInBtn.appendChild(document.createTextNode(' Sign In'));
                }
            }
            
            if (registerIcon) {
                registerIcon.style.display = 'inline-block';
                registerIcon.style.marginRight = '8px';
                registerIcon.style.fontSize = '1.1rem';
                registerIcon.style.verticalAlign = 'middle';
                registerIcon.style.visibility = 'visible';
                registerIcon.style.opacity = '1';
            } else {
                // If icon doesn't exist, create it
                const icon = document.createElement('i');
                icon.className = 'bi bi-person-plus me-1';
                icon.style.display = 'inline-block';
                icon.style.marginRight = '8px';
                icon.style.fontSize = '1.1rem';
                icon.style.verticalAlign = 'middle';
                icon.style.visibility = 'visible';
                icon.style.opacity = '1';
                
                // Insert the icon at the beginning of the button
                if (registerBtn.firstChild) {
                    registerBtn.insertBefore(icon, registerBtn.firstChild);
                } else {
                    registerBtn.appendChild(icon);
                    registerBtn.appendChild(document.createTextNode(' Register'));
                }
            }
        } else {
            console.warn('Auth Buttons Fix: Sign In or Register button not found');
        }
        
        // Ensure the auth links container is properly styled
        if (authLinks) {
            authLinks.style.display = 'flex';
            authLinks.style.alignItems = 'center';
            authLinks.style.justifyContent = 'flex-end';
            authLinks.style.gap = '20px';
            authLinks.style.visibility = 'visible';
            authLinks.style.opacity = '1';
        }
        
        // Ensure the auth buttons container is properly styled
        const authButtonsContainer = document.querySelector('.auth-buttons-container');
        if (authButtonsContainer) {
            authButtonsContainer.style.display = 'flex';
            authButtonsContainer.style.alignItems = 'center';
            authButtonsContainer.style.gap = '20px';
            authButtonsContainer.style.marginTop = '10px'; // Position buttons at the same height as in the image
            authButtonsContainer.style.visibility = 'visible';
            authButtonsContainer.style.opacity = '1';
        } else {
            console.warn('Auth Buttons Fix: .auth-buttons-container not found');
        }
        
        // Ensure the theme toggle button is properly positioned
        const themeToggleButton = document.querySelector('.theme-toggle-button');
        if (themeToggleButton) {
            themeToggleButton.style.marginRight = '15px';
            themeToggleButton.style.visibility = 'visible';
            themeToggleButton.style.opacity = '1';
        }
        
        // Ensure the top auth bar is visible
        const topAuthBar = document.querySelector('.top-auth-bar');
        if (topAuthBar) {
            topAuthBar.style.display = 'block';
            topAuthBar.style.visibility = 'visible';
            topAuthBar.style.opacity = '1';
            topAuthBar.style.backgroundColor = '#2e0054';
            topAuthBar.style.padding = '10px 0';
            topAuthBar.style.zIndex = '1000';
        } else {
            console.warn('Auth Buttons Fix: .top-auth-bar not found');
        }
        
        // Style the blue circular buttons at the top as shown in the image
        const featureButtons = document.querySelectorAll('.feature-button');
        featureButtons.forEach(button => {
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.width = '45px';
            button.style.height = '45px';
            button.style.borderRadius = '50%';
            button.style.backgroundColor = '#0088cc';
            button.style.color = 'white';
            button.style.textDecoration = 'none';
            button.style.transition = 'all 0.3s ease';
            button.style.marginRight = '5px';
            button.style.boxShadow = '0 0 10px rgba(0, 136, 204, 0.3)';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            
            // Add hover effect
            button.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#00a0e9';
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 15px rgba(0, 160, 233, 0.5)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#0088cc';
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 0 10px rgba(0, 136, 204, 0.3)';
            });
            
            // Ensure the button is clickable
            button.style.cursor = 'pointer';
        });
        
        console.log('Auth Buttons Fix: Styling applied successfully');
    } catch (error) {
        console.error('Auth Buttons Fix: Error applying styles', error);
    }
}

/**
 * Add exact hover effect to button as shown in the image
 * Enhanced with more robust error handling
 * @param {HTMLElement} button - The button element
 * @param {string} type - The type of button ('sign-in' or 'register')
 */
function addExactHoverEffect(button, type) {
    try {
        // Remove any existing event listeners
        if (button._mouseenterHandler) {
            button.removeEventListener('mouseenter', button._mouseenterHandler);
        }
        if (button._mouseleaveHandler) {
            button.removeEventListener('mouseleave', button._mouseleaveHandler);
        }
        
        // Create new event handlers
        button._mouseenterHandler = function() {
            try {
                if (type === 'sign-in') {
                    this.style.backgroundColor = 'rgba(30, 0, 60, 0.7)';
                    this.style.borderColor = 'rgba(0, 195, 255, 0.5)';
                    this.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.3)';
                } else {
                    this.style.backgroundColor = 'rgba(180, 70, 207, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.3)';
                }
            } catch (error) {
                console.error('Auth Buttons Fix: Error in mouseenter handler', error);
            }
        };
        
        button._mouseleaveHandler = function() {
            try {
                if (type === 'sign-in') {
                    this.style.backgroundColor = 'rgba(30, 0, 60, 0.5)';
                    this.style.borderColor = 'rgba(0, 195, 255, 0.3)';
                    this.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                } else {
                    this.style.backgroundColor = 'rgba(180, 70, 207, 0.8)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    this.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                }
            } catch (error) {
                console.error('Auth Buttons Fix: Error in mouseleave handler', error);
            }
        };
        
        // Add the event listeners
        button.addEventListener('mouseenter', button._mouseenterHandler);
        button.addEventListener('mouseleave', button._mouseleaveHandler);
        
        console.log(`Auth Buttons Fix: Hover effect added to ${type} button`);
    } catch (error) {
        console.error('Auth Buttons Fix: Error adding hover effect', error);
    }
}

/**
 * Enhance button accessibility
 * Enhanced with more robust error handling
 * - Add ARIA attributes for accessibility
 * - Add keyboard accessibility
 */
function enhanceButtonAccessibility() {
    try {
        // Get auth buttons
        const authLinks = document.querySelector('.auth-links');
        if (!authLinks) {
            console.warn('Auth Buttons Fix: .auth-links not found for accessibility enhancement');
            return;
        }
        
        const signInBtn = authLinks.querySelector('.sign-in-btn');
        const registerBtn = authLinks.querySelector('.register-btn');
        
        if (signInBtn) {
            // Add ARIA attributes
            signInBtn.setAttribute('role', 'button');
            signInBtn.setAttribute('aria-label', 'Sign In');
            signInBtn.setAttribute('tabindex', '0'); // Ensure it's focusable
            
            // Add keyboard accessibility
            signInBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            
            console.log('Auth Buttons Fix: Accessibility enhanced for sign-in button');
        } else {
            console.warn('Auth Buttons Fix: .sign-in-btn not found for accessibility enhancement');
        }
        
        if (registerBtn) {
            // Add ARIA attributes
            registerBtn.setAttribute('role', 'button');
            registerBtn.setAttribute('aria-label', 'Register');
            registerBtn.setAttribute('tabindex', '0'); // Ensure it's focusable
            
            // Add keyboard accessibility
            registerBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            
            console.log('Auth Buttons Fix: Accessibility enhanced for register button');
        } else {
            console.warn('Auth Buttons Fix: .register-btn not found for accessibility enhancement');
        }
        
        // Make the blue circular buttons accessible
        const featureButtons = document.querySelectorAll('.feature-button');
        if (featureButtons.length > 0) {
            featureButtons.forEach(button => {
                button.setAttribute('role', 'button');
                button.setAttribute('tabindex', '0'); // Ensure it's focusable
                
                // Add keyboard accessibility
                button.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
            
            console.log('Auth Buttons Fix: Accessibility enhanced for feature buttons');
        } else {
            console.warn('Auth Buttons Fix: No .feature-button elements found for accessibility enhancement');
        }
    } catch (error) {
        console.error('Auth Buttons Fix: Error enhancing button accessibility', error);
    }
}

// Create a direct link to the CSS file to ensure it's loaded
function ensureCssLoaded() {
    try {
        // Check if the CSS is already loaded
        const existingLink = document.querySelector('link[href*="auth-buttons-fix.css"]');
        if (!existingLink) {
            // Create a new link element
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '/static/css/auth-buttons-fix.css';
            
            // Add it to the head
            document.head.appendChild(link);
            console.log('Auth Buttons Fix: CSS link added to head');
        } else {
            console.log('Auth Buttons Fix: CSS already loaded');
        }
    } catch (error) {
        console.error('Auth Buttons Fix: Error ensuring CSS is loaded', error);
    }
}

// Ensure the CSS is loaded
ensureCssLoaded();

// Execute the fix immediately after the script loads
applyExactStyling();
