/**
 * Enhanced Authentication System
 * Provides robust, cross-platform authentication with multiple providers
 */

class EnhancedAuth {
    constructor() {
        this.initialized = false;
        this.authProviders = [
            { name: 'Google', icon: 'google', color: '#4285F4' },
            { name: 'GitHub', icon: 'github', color: '#333333' },
            { name: 'Facebook', icon: 'facebook', color: '#3b5998' },
            { name: 'Apple', icon: 'apple', color: '#000000' },
            { name: 'Microsoft', icon: 'microsoft', color: '#00a1f1' },
            { name: 'Twitter', icon: 'twitter', color: '#1DA1F2' }
        ];
        this.currentUser = null;
        this.authStateListeners = [];
        this.platformInfo = this.detectPlatform();
    }

    /**
     * Initialize the authentication system
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Enhanced Authentication System...');
        
        // Check for existing session
        this.checkSession();
        
        // Enhance auth forms
        this.enhanceAuthForms();
        
        // Add platform-specific optimizations
        this.applyPlatformOptimizations();
        
        // Add biometric authentication if available
        this.setupBiometricAuth();
        
        // Setup persistent auth state
        this.setupAuthPersistence();
        
        // Mark as initialized
        this.initialized = true;
        console.log('Enhanced Authentication System initialized successfully');
    }

    /**
     * Detect the user's platform and browser
     */
    detectPlatform() {
        const userAgent = navigator.userAgent;
        const platform = {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
            isAndroid: /Android/i.test(userAgent),
            isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
            isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
            isFirefox: /Firefox/.test(userAgent),
            isEdge: /Edg/.test(userAgent),
            supportsWebAuthn: typeof PublicKeyCredential !== 'undefined',
            supportsBiometrics: false // Will be determined later
        };
        
        // Check for biometric support
        if (platform.supportsWebAuthn) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then(available => {
                    platform.supportsBiometrics = available;
                    console.log(`Biometric authentication ${available ? 'is' : 'is not'} available`);
                })
                .catch(error => {
                    console.error('Error checking biometric support:', error);
                });
        }
        
        console.log('Platform detected:', platform);
        return platform;
    }

    /**
     * Check for existing session
     */
    checkSession() {
        // Try to get user info from cookies or localStorage
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.notifyAuthStateChanged();
                console.log('User session restored:', this.currentUser.username);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('auth_user');
            }
        }
        
        // Verify session with server
        fetch('/api/auth/verify-session', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                // Session invalid, clear local data
                this.currentUser = null;
                localStorage.removeItem('auth_user');
                this.notifyAuthStateChanged();
                throw new Error('Session invalid or expired');
            }
        })
        .then(data => {
            if (data.authenticated) {
                this.currentUser = data.user;
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                this.notifyAuthStateChanged();
                console.log('Session verified with server');
            }
        })
        .catch(error => {
            console.error('Session verification error:', error);
        });
    }

    /**
     * Enhance authentication forms with additional features
     */
    enhanceAuthForms() {
        // Find login and registration forms
        const loginForm = document.querySelector('form[action*="login"]');
        const registerForm = document.querySelector('form[action*="register"]');
        
        if (loginForm) {
            this.enhanceLoginForm(loginForm);
        }
        
        if (registerForm) {
            this.enhanceRegisterForm(registerForm);
        }
        
        // Add social login buttons if they don't exist
        this.addSocialLoginButtons();
        
        // Add password strength meter
        this.addPasswordStrengthMeter();
        
        // Add remember device option
        this.addRememberDeviceOption();
    }

    /**
     * Enhance login form with additional features
     */
    enhanceLoginForm(form) {
        // Add event listener for form submission
        form.addEventListener('submit', (event) => {
            // Store the login attempt for auto-fill suggestions
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                localStorage.setItem('last_email', emailInput.value);
            }
            
            // Add login analytics
            this.trackAuthEvent('login_attempt');
        });
        
        // Add auto-fill from previous login
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
            const lastEmail = localStorage.getItem('last_email');
            if (lastEmail) {
                emailInput.value = lastEmail;
            }
            
            // Add "remember this device" option if not present
            const rememberDiv = document.createElement('div');
            rememberDiv.className = 'mb-3 form-check';
            rememberDiv.innerHTML = `
                <input type="checkbox" class="form-check-input" id="rememberDevice" checked>
                <label class="form-check-label" for="rememberDevice">Remember this device</label>
            `;
            
            // Insert after password field
            const passwordField = form.querySelector('input[type="password"]');
            if (passwordField && passwordField.parentNode) {
                const parentNode = passwordField.parentNode.parentNode;
                parentNode.insertBefore(rememberDiv, passwordField.parentNode.nextSibling);
            }
        }
    }

    /**
     * Enhance registration form with additional features
     */
    enhanceRegisterForm(form) {
        // Add password strength meter
        const passwordInput = form.querySelector('input[type="password"]');
        if (passwordInput) {
            // Create strength meter element
            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'password-strength-meter mt-2';
            strengthMeter.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill" style="width: 0%"></div>
                </div>
                <div class="strength-text">Password strength: <span>Weak</span></div>
            `;
            
            // Insert after password field
            passwordInput.parentNode.appendChild(strengthMeter);
            
            // Add event listener to update strength meter
            passwordInput.addEventListener('input', () => {
                this.updatePasswordStrength(passwordInput.value, strengthMeter);
            });
        }
        
        // Add terms and conditions checkbox if not present
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton && !form.querySelector('#termsCheck')) {
            const termsDiv = document.createElement('div');
            termsDiv.className = 'mb-3 form-check';
            termsDiv.innerHTML = `
                <input type="checkbox" class="form-check-input" id="termsCheck" required>
                <label class="form-check-label" for="termsCheck">
                    I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                </label>
            `;
            
            // Insert before submit button
            submitButton.parentNode.insertBefore(termsDiv, submitButton);
        }
    }

    /**
     * Add social login buttons if they don't exist
     */
    addSocialLoginButtons() {
        // Find the social login container
        const socialContainer = document.querySelector('.d-flex.justify-content-center.gap-3');
        
        if (socialContainer) {
            // Clear existing buttons
            socialContainer.innerHTML = '';
            
            // Add buttons for all providers
            this.authProviders.forEach(provider => {
                const button = document.createElement('a');
                button.href = `/auth/login/${provider.name.toLowerCase()}`;
                button.className = 'btn social-auth-btn';
                button.style.backgroundColor = provider.color;
                button.style.color = '#ffffff';
                button.style.padding = '10px 20px';
                button.style.borderRadius = '10px';
                button.style.fontWeight = '600';
                button.style.transition = 'all 0.3s ease';
                button.style.margin = '0 5px';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.width = '50px';
                button.style.height = '50px';
                
                button.innerHTML = `<i class="bi bi-${provider.icon}" style="font-size: 1.5rem;"></i>`;
                button.setAttribute('title', `Sign in with ${provider.name}`);
                button.setAttribute('data-bs-toggle', 'tooltip');
                button.setAttribute('data-bs-placement', 'top');
                
                // Add event listener
                button.addEventListener('click', (event) => {
                    this.trackAuthEvent(`social_login_${provider.name.toLowerCase()}`);
                });
                
                socialContainer.appendChild(button);
            });
            
            // Initialize tooltips
            if (typeof bootstrap !== 'undefined') {
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl);
                });
            }
        }
    }

    /**
     * Add password strength meter
     */
    addPasswordStrengthMeter() {
        // Find all password inputs that don't already have a strength meter
        const passwordInputs = document.querySelectorAll('input[type="password"]:not(.has-strength-meter)');
        
        passwordInputs.forEach(input => {
            // Mark as having a strength meter
            input.classList.add('has-strength-meter');
            
            // Create strength meter element
            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'password-strength-meter mt-2';
            strengthMeter.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill" style="width: 0%"></div>
                </div>
                <div class="strength-text">Password strength: <span>Weak</span></div>
            `;
            
            // Insert after password field
            input.parentNode.appendChild(strengthMeter);
            
            // Add event listener to update strength meter
            input.addEventListener('input', () => {
                this.updatePasswordStrength(input.value, strengthMeter);
            });
        });
    }

    /**
     * Update password strength meter
     */
    updatePasswordStrength(password, meterElement) {
        // Calculate password strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        
        // Character type checks
        if (/[a-z]/.test(password)) strength += 10;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        
        // Update meter
        const fill = meterElement.querySelector('.strength-fill');
        const text = meterElement.querySelector('.strength-text span');
        
        fill.style.width = `${strength}%`;
        
        // Set color and text based on strength
        if (strength < 40) {
            fill.style.backgroundColor = '#ff4d4d';
            text.textContent = 'Weak';
            text.style.color = '#ff4d4d';
        } else if (strength < 70) {
            fill.style.backgroundColor = '#ffa64d';
            text.textContent = 'Moderate';
            text.style.color = '#ffa64d';
        } else {
            fill.style.backgroundColor = '#4CAF50';
            text.textContent = 'Strong';
            text.style.color = '#4CAF50';
        }
    }

    /**
     * Add remember device option
     */
    addRememberDeviceOption() {
        // Find login forms that don't already have the option
        const loginForms = document.querySelectorAll('form[action*="login"]:not(.has-remember-device)');
        
        loginForms.forEach(form => {
            // Mark as having the option
            form.classList.add('has-remember-device');
            
            // Find the remember me checkbox
            const rememberMe = form.querySelector('input[type="checkbox"][name="remember_me"]');
            
            if (rememberMe && rememberMe.parentNode) {
                // Create remember device option
                const rememberDeviceDiv = document.createElement('div');
                rememberDeviceDiv.className = 'mb-3 form-check';
                rememberDeviceDiv.innerHTML = `
                    <input type="checkbox" class="form-check-input" id="rememberDevice" name="remember_device" checked>
                    <label class="form-check-label" for="rememberDevice">Trust this device</label>
                `;
                
                // Insert after remember me checkbox
                rememberMe.parentNode.parentNode.insertBefore(rememberDeviceDiv, rememberMe.parentNode.nextSibling);
            }
        });
    }

    /**
     * Apply platform-specific optimizations
     */
    applyPlatformOptimizations() {
        // Mobile optimizations
        if (this.platformInfo.isMobile) {
            // Make buttons larger for touch
            const authButtons = document.querySelectorAll('.btn');
            authButtons.forEach(button => {
                button.style.padding = '12px 24px';
                button.style.fontSize = '1.1rem';
            });
            
            // Optimize form fields for mobile
            const formFields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
            formFields.forEach(field => {
                field.style.fontSize = '1.1rem';
                field.style.padding = '12px';
            });
        }
        
        // iOS-specific optimizations
        if (this.platformInfo.isIOS) {
            // Add Apple-specific styling
            document.documentElement.style.setProperty('--primary-color', '#007AFF');
            
            // Enable Apple Pay if available
            if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
                this.setupApplePay();
            }
        }
        
        // Android-specific optimizations
        if (this.platformInfo.isAndroid) {
            // Add Android-specific styling
            document.documentElement.style.setProperty('--primary-color', '#4285F4');
            
            // Enable Google Pay if available
            if (window.google && google.payments) {
                this.setupGooglePay();
            }
        }
    }

    /**
     * Setup biometric authentication if available
     */
    setupBiometricAuth() {
        if (!this.platformInfo.supportsWebAuthn) {
            console.log('WebAuthn not supported on this browser');
            return;
        }
        
        // Check if biometric auth is available
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            .then(available => {
                if (available) {
                    console.log('Biometric authentication is available');
                    this.addBiometricAuthOption();
                }
            })
            .catch(error => {
                console.error('Error checking biometric support:', error);
            });
    }

    /**
     * Add biometric authentication option
     */
    addBiometricAuthOption() {
        // Find login forms
        const loginForms = document.querySelectorAll('form[action*="login"]');
        
        loginForms.forEach(form => {
            // Create biometric auth button
            const biometricButton = document.createElement('button');
            biometricButton.type = 'button';
            biometricButton.className = 'btn btn-outline-primary w-100 mt-3';
            biometricButton.innerHTML = `
                <i class="bi bi-fingerprint me-2"></i>
                Sign in with Biometrics
            `;
            
            // Add event listener
            biometricButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.authenticateWithBiometrics();
            });
            
            // Find submit button and insert biometric button after it
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.parentNode.insertBefore(biometricButton, submitButton.nextSibling);
            } else {
                form.appendChild(biometricButton);
            }
        });
    }

    /**
     * Authenticate with biometrics
     */
    authenticateWithBiometrics() {
        // This is a simplified implementation
        // In a real application, you would need to implement the WebAuthn protocol
        
        console.log('Attempting biometric authentication...');
        
        // Show loading state
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'biometric-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Waiting for biometric verification...</p>
        `;
        document.body.appendChild(loadingOverlay);
        
        // Simulate biometric auth (in a real app, this would use WebAuthn)
        setTimeout(() => {
            // Remove loading overlay
            document.body.removeChild(loadingOverlay);
            
            // Simulate successful auth
            this.trackAuthEvent('biometric_auth_success');
            
            // Redirect to home page
            window.location.href = '/';
        }, 2000);
    }

    /**
     * Setup auth persistence
     */
    setupAuthPersistence() {
        // Listen for auth state changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'auth_user') {
                if (event.newValue) {
                    try {
                        this.currentUser = JSON.parse(event.newValue);
                    } catch (error) {
                        console.error('Error parsing auth user from storage event:', error);
                        this.currentUser = null;
                    }
                } else {
                    this.currentUser = null;
                }
                
                this.notifyAuthStateChanged();
            }
        });
    }

    /**
     * Add auth state change listener
     */
    onAuthStateChanged(callback) {
        if (typeof callback === 'function') {
            this.authStateListeners.push(callback);
            
            // Call immediately with current state
            callback(this.currentUser);
        }
    }

    /**
     * Notify all listeners of auth state change
     */
    notifyAuthStateChanged() {
        this.authStateListeners.forEach(listener => {
            try {
                listener(this.currentUser);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
        
        // Update UI based on auth state
        this.updateUIForAuthState();
    }

    /**
     * Update UI based on auth state
     */
    updateUIForAuthState() {
        // Update login/logout buttons
        const loginButtons = document.querySelectorAll('.login-button, a[href*="login"]');
        const logoutButtons = document.querySelectorAll('.logout-button, a[href*="logout"]');
        const profileLinks = document.querySelectorAll('.profile-link, a[href*="profile"]');
        const userDisplays = document.querySelectorAll('.user-display');
        
        if (this.currentUser) {
            // User is logged in
            loginButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            logoutButtons.forEach(button => {
                button.style.display = '';
            });
            
            profileLinks.forEach(link => {
                link.style.display = '';
            });
            
            userDisplays.forEach(display => {
                display.textContent = this.currentUser.username || this.currentUser.email;
                display.style.display = '';
            });
        } else {
            // User is logged out
            loginButtons.forEach(button => {
                button.style.display = '';
            });
            
            logoutButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            profileLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            userDisplays.forEach(display => {
                display.style.display = 'none';
            });
        }
    }

    /**
     * Track authentication events
     */
    trackAuthEvent(eventName) {
        // Send event to analytics
        if (window.gtag) {
            gtag('event', eventName);
        }
        
        console.log('Auth event tracked:', eventName);
    }
}

// Initialize the enhanced auth system
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedAuth = new EnhancedAuth();
    window.enhancedAuth.init();
});
