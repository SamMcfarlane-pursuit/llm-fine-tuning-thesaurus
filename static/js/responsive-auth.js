/**
 * Responsive Authentication JavaScript
 * Provides interactive functionality for authentication forms
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize password toggle
    initPasswordToggle();
    
    // Initialize form validation
    initFormValidation();
    
    // Add animation effects
    initAnimations();
    
    // Handle responsive behavior
    handleResponsive();
    
    // Initialize social login buttons
    initSocialButtons();
    
    // Handle touch events for mobile and iPad
    initTouchEvents();
});

/**
 * Initialize password toggle functionality
 */
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.auth-toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input && input.type) {
                // Toggle password visibility
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                
                // Toggle icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill';
                }
                
                // Add animation
                this.classList.add('password-toggle-animation');
                setTimeout(() => {
                    this.classList.remove('password-toggle-animation');
                }, 300);
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const authForms = document.querySelectorAll('.auth-form');
    
    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Get all required inputs
            const requiredInputs = form.querySelectorAll('[required]');
            
            requiredInputs.forEach(input => {
                // Remove existing error messages
                const formGroup = input.closest('.auth-form-group');
                const existingError = formGroup.querySelector('.auth-error-feedback');
                
                if (existingError) {
                    existingError.remove();
                }
                
                // Check if input is empty
                if (!input.value.trim()) {
                    isValid = false;
                    
                    // Add error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'auth-error-feedback';
                    errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> This field is required`;
                    
                    formGroup.appendChild(errorMessage);
                    
                    // Add error class to input
                    input.classList.add('is-invalid');
                }
                
                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    
                    if (!emailRegex.test(input.value.trim())) {
                        isValid = false;
                        
                        // Add error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'auth-error-feedback';
                        errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Please enter a valid email address`;
                        
                        formGroup.appendChild(errorMessage);
                        
                        // Add error class to input
                        input.classList.add('is-invalid');
                    }
                }
                
                // Password validation
                if (input.type === 'password' && input.value.trim() && input.dataset.minLength) {
                    const minLength = parseInt(input.dataset.minLength);
                    
                    if (input.value.length < minLength) {
                        isValid = false;
                        
                        // Add error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'auth-error-feedback';
                        errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Password must be at least ${minLength} characters long`;
                        
                        formGroup.appendChild(errorMessage);
                        
                        // Add error class to input
                        input.classList.add('is-invalid');
                    }
                }
                
                // Password confirmation validation
                if (input.dataset.match && input.value.trim()) {
                    const matchInput = document.getElementById(input.dataset.match);
                    
                    if (matchInput && input.value !== matchInput.value) {
                        isValid = false;
                        
                        // Add error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'auth-error-feedback';
                        errorMessage.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Passwords do not match`;
                        
                        formGroup.appendChild(errorMessage);
                        
                        // Add error class to input
                        input.classList.add('is-invalid');
                    }
                }
            });
            
            // Add input event listeners to clear errors
            requiredInputs.forEach(input => {
                input.addEventListener('input', function() {
                    // Remove error class
                    this.classList.remove('is-invalid');
                    
                    // Remove error message
                    const formGroup = this.closest('.auth-form-group');
                    const existingError = formGroup.querySelector('.auth-error-feedback');
                    
                    if (existingError) {
                        existingError.remove();
                    }
                });
            });
            
            // Prevent form submission if not valid
            if (!isValid) {
                e.preventDefault();
                
                // Scroll to first error
                const firstError = form.querySelector('.is-invalid');
                
                if (firstError) {
                    firstError.focus();
                    
                    // Smooth scroll to error
                    const formGroup = firstError.closest('.auth-form-group');
                    
                    if (formGroup) {
                        formGroup.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }
            } else {
                // Show loading state
                const submitButton = form.querySelector('.auth-submit-btn');
                
                if (submitButton) {
                    const originalText = submitButton.innerHTML;
                    submitButton.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Processing...';
                    submitButton.disabled = true;
                    
                    // Add loading class to form
                    form.classList.add('auth-loading');
                    
                    // Store original text for later restoration
                    submitButton.dataset.originalText = originalText;
                }
            }
        });
    });
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Add shimmer effect to the top bar
    const authShimmer = document.querySelector('.auth-shimmer');
    
    if (authShimmer) {
        setInterval(() => {
            authShimmer.style.animation = 'none';
            authShimmer.offsetHeight; // Trigger reflow
            authShimmer.style.animation = 'shimmer 2s infinite linear';
        }, 4000);
    }
    
    // Add shimmer effect to submit button on hover
    const submitButtons = document.querySelectorAll('.auth-submit-btn');
    
    submitButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.auth-btn-overlay');
            
            if (overlay) {
                overlay.style.transition = 'transform 0.8s';
                overlay.style.transform = 'translateX(100%)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.auth-btn-overlay');
            
            if (overlay) {
                overlay.style.transition = 'none';
                overlay.style.transform = 'translateX(-100%)';
                
                setTimeout(() => {
                    overlay.style.transition = 'transform 0.8s';
                }, 10);
            }
        });
    });
    
    // Add animation to form inputs when focused
    const formInputs = document.querySelectorAll('.auth-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 15px rgba(66, 135, 245, 0.2)';
            
            // Also animate the icon
            const icon = this.previousElementSibling;
            
            if (icon) {
                icon.style.transition = 'all 0.3s ease';
                icon.style.transform = 'translateY(-2px)';
                icon.style.boxShadow = '0 5px 15px rgba(66, 135, 245, 0.2)';
            }
            
            // And the toggle button if it exists
            const toggle = this.nextElementSibling;
            
            if (toggle && toggle.classList.contains('auth-toggle-password')) {
                toggle.style.transition = 'all 0.3s ease';
                toggle.style.transform = 'translateY(-2px)';
                toggle.style.boxShadow = '0 5px 15px rgba(66, 135, 245, 0.2)';
            }
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
            
            // Reset icon animation
            const icon = this.previousElementSibling;
            
            if (icon) {
                icon.style.transform = 'translateY(0)';
                icon.style.boxShadow = 'none';
            }
            
            // Reset toggle button animation
            const toggle = this.nextElementSibling;
            
            if (toggle && toggle.classList.contains('auth-toggle-password')) {
                toggle.style.transform = 'translateY(0)';
                toggle.style.boxShadow = 'none';
            }
        });
    });
}

/**
 * Handle responsive behavior
 */
function handleResponsive() {
    const updateLayout = () => {
        const width = window.innerWidth;
        const authContainer = document.querySelector('.auth-container');
        const authBody = document.querySelector('.auth-body');
        const authHeader = document.querySelector('.auth-header');
        const authFooter = document.querySelector('.auth-footer');
        
        if (!authContainer || !authBody || !authHeader || !authFooter) return;
        
        if (width <= 576) {
            authContainer.style.padding = '10px';
            authBody.style.padding = '15px';
            authHeader.style.padding = '12px';
            authFooter.style.padding = '12px';
            
            // Adjust social buttons
            const socialButtons = document.querySelectorAll('.auth-social-btn');
            
            socialButtons.forEach(button => {
                button.style.width = '100%';
            });
        } else if (width <= 768) {
            authContainer.style.padding = '15px';
            authBody.style.padding = '20px';
            authHeader.style.padding = '15px';
            authFooter.style.padding = '15px';
            
            // Reset social buttons
            const socialButtons = document.querySelectorAll('.auth-social-btn');
            
            socialButtons.forEach(button => {
                button.style.width = 'auto';
            });
        } else {
            authContainer.style.padding = '20px';
            authBody.style.padding = '30px';
            authHeader.style.padding = '20px';
            authFooter.style.padding = '20px';
            
            // Reset social buttons
            const socialButtons = document.querySelectorAll('.auth-social-btn');
            
            socialButtons.forEach(button => {
                button.style.width = 'auto';
            });
        }
    };
    
    // Initial update
    updateLayout();
    
    // Update on resize
    window.addEventListener('resize', updateLayout);
}

/**
 * Initialize social login buttons
 */
function initSocialButtons() {
    const socialButtons = document.querySelectorAll('.auth-social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        button.addEventListener('click', function() {
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Connecting...';
            this.disabled = true;
            
            // Store original text for later restoration
            this.dataset.originalText = originalText;
        });
    });
}

/**
 * Initialize touch events for mobile and iPad
 */
function initTouchEvents() {
    // Check if device is mobile or iPad
    const isMobileOrIPad = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobileOrIPad) {
        // Adjust input padding for better touch targets
        const inputs = document.querySelectorAll('.auth-input');
        const icons = document.querySelectorAll('.auth-input-icon');
        const toggles = document.querySelectorAll('.auth-toggle-password');
        
        inputs.forEach(input => {
            input.style.padding = '15px';
        });
        
        icons.forEach(icon => {
            icon.style.padding = '15px';
        });
        
        toggles.forEach(toggle => {
            toggle.style.padding = '15px';
        });
        
        // Adjust checkbox size for better touch target
        const checkboxes = document.querySelectorAll('.auth-remember-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.style.width = '24px';
            checkbox.style.height = '24px';
        });
        
        // Adjust submit button padding for better touch target
        const submitButtons = document.querySelectorAll('.auth-submit-btn');
        
        submitButtons.forEach(button => {
            button.style.padding = '15px 24px';
        });
        
        // Add active state for touch
        const allButtons = document.querySelectorAll('.auth-submit-btn, .auth-social-btn, .auth-toggle-password');
        
        allButtons.forEach(button => {
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
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showAuthToast(message, type = 'info') {
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
