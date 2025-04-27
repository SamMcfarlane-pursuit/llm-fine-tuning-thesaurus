/**
 * Enhanced Colab Integration
 * Provides seamless integration with Google Colab, including user profile support
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in to Google
    let googleUser = null;
    let googleAuthInitialized = false;
    
    // Function to initialize Google Auth
    function initGoogleAuth() {
        if (googleAuthInitialized) return;
        
        // Load Google API client library
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/platform.js';
        script.onload = function() {
            gapi.load('auth2', function() {
                gapi.auth2.init({
                    client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Replace with your actual client ID
                    cookiepolicy: 'single_host_origin',
                    scope: 'profile email https://www.googleapis.com/auth/drive.file'
                }).then(function(auth2) {
                    googleAuthInitialized = true;
                    
                    // Check if user is already signed in
                    if (auth2.isSignedIn.get()) {
                        googleUser = auth2.currentUser.get();
                        updateColabButtons();
                    }
                    
                    // Listen for sign-in state changes
                    auth2.isSignedIn.listen(function(isSignedIn) {
                        if (isSignedIn) {
                            googleUser = auth2.currentUser.get();
                        } else {
                            googleUser = null;
                        }
                        updateColabButtons();
                    });
                });
            });
        };
        document.head.appendChild(script);
    }
    
    // Function to update Colab buttons based on auth state
    function updateColabButtons() {
        const colabButtons = document.querySelectorAll('.colab-button');
        
        colabButtons.forEach(button => {
            const colabUrl = button.getAttribute('href');
            const notebookPath = button.getAttribute('data-notebook-path');
            
            if (googleUser) {
                // User is signed in, update button to include user profile
                const profile = googleUser.getBasicProfile();
                const profilePic = profile.getImageUrl();
                const userName = profile.getName();
                
                // Update button appearance
                button.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${profilePic}" alt="${userName}" class="rounded-circle me-2" style="width: 24px; height: 24px;">
                        <span>Open in Colab as ${userName.split(' ')[0]}</span>
                    </div>
                `;
                
                // Add ability to create a copy in user's Drive
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Show loading state
                    button.innerHTML = `
                        <div class="d-flex align-items-center">
                            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <span>Preparing notebook...</span>
                        </div>
                    `;
                    
                    // Create a copy in user's Drive (simplified example)
                    // In a real implementation, you would use the Google Drive API
                    setTimeout(function() {
                        window.open(colabUrl, '_blank');
                        
                        // Reset button
                        button.innerHTML = `
                            <div class="d-flex align-items-center">
                                <img src="${profilePic}" alt="${userName}" class="rounded-circle me-2" style="width: 24px; height: 24px;">
                                <span>Open in Colab as ${userName.split(' ')[0]}</span>
                            </div>
                        `;
                    }, 1500);
                });
            } else {
                // User is not signed in, provide sign-in option
                button.innerHTML = `<i class="bi bi-box-arrow-up-right me-2"></i>Open in Colab`;
                
                // Add sign-in prompt
                button.addEventListener('click', function(e) {
                    if (!googleAuthInitialized) {
                        e.preventDefault();
                        
                        // Show sign-in modal
                        showSignInModal(colabUrl);
                    }
                });
            }
        });
    }
    
    // Function to show sign-in modal
    function showSignInModal(colabUrl) {
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="colabSignInModal" tabindex="-1" aria-labelledby="colabSignInModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="colabSignInModalLabel">
                                <i class="bi bi-google me-2"></i>Sign in to Google
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Sign in to your Google account to open this notebook in Colab. This will allow you to:</p>
                            <ul>
                                <li>Save the notebook to your Google Drive</li>
                                <li>Run the code in the notebook</li>
                                <li>Make changes and save your work</li>
                                <li>Share your notebook with others</li>
                            </ul>
                            <div class="d-grid gap-2 mt-4">
                                <button id="googleSignInButton" class="btn btn-outline-primary">
                                    <i class="bi bi-google me-2"></i>Sign in with Google
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <a href="${colabUrl}" class="btn btn-primary" target="_blank">
                                Continue without signing in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('colabSignInModal'));
        modal.show();
        
        // Initialize Google Auth when sign-in button is clicked
        document.getElementById('googleSignInButton').addEventListener('click', function() {
            initGoogleAuth();
            
            // Add loading state
            this.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Connecting to Google...</span>
            `;
            this.disabled = true;
            
            // Wait for auth to initialize
            const checkAuth = setInterval(function() {
                if (googleAuthInitialized) {
                    clearInterval(checkAuth);
                    
                    // Trigger sign-in
                    const auth2 = gapi.auth2.getAuthInstance();
                    auth2.signIn().then(function() {
                        // Close modal
                        modal.hide();
                        
                        // Open Colab
                        window.open(colabUrl, '_blank');
                    }).catch(function(error) {
                        console.error('Error signing in:', error);
                        
                        // Reset button
                        document.getElementById('googleSignInButton').innerHTML = `
                            <i class="bi bi-google me-2"></i>Sign in with Google
                        `;
                        document.getElementById('googleSignInButton').disabled = false;
                    });
                }
            }, 100);
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('colabSignInModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Function to enhance Colab links
    function enhanceColabLinks() {
        // Find all Colab links
        document.querySelectorAll('a[href*="colab.research.google.com"]').forEach(link => {
            // Skip if already enhanced
            if (link.classList.contains('colab-button')) return;
            
            // Get notebook path from URL
            const url = new URL(link.href);
            const notebookPath = url.searchParams.get('github_path') || '';
            
            // Add classes and attributes
            link.classList.add('colab-button', 'btn');
            if (!link.classList.contains('btn-primary') && !link.classList.contains('btn-outline-primary')) {
                link.classList.add('btn-primary');
            }
            link.setAttribute('data-notebook-path', notebookPath);
            
            // Set default text if empty
            if (link.innerHTML.trim() === '') {
                link.innerHTML = `<i class="bi bi-box-arrow-up-right me-2"></i>Open in Colab`;
            }
        });
        
        // Update buttons based on auth state
        updateColabButtons();
    }
    
    // Initialize
    enhanceColabLinks();
    
    // Add Google Sign-In button to navbar if user is not signed in
    const navbarNav = document.querySelector('.navbar-nav');
    if (navbarNav) {
        const signInButton = document.createElement('li');
        signInButton.className = 'nav-item';
        signInButton.innerHTML = `
            <button class="nav-link btn btn-link" id="googleSignInNavButton">
                <i class="bi bi-google nav-icon"></i> Sign in with Google
            </button>
        `;
        navbarNav.appendChild(signInButton);
        
        // Add click event
        document.getElementById('googleSignInNavButton').addEventListener('click', function() {
            initGoogleAuth();
            
            // Add loading state
            this.innerHTML = `
                <span class="spinner-border spinner-border-sm nav-icon" role="status" aria-hidden="true"></span>
                Connecting...
            `;
            this.disabled = true;
            
            // Wait for auth to initialize
            const checkAuth = setInterval(() => {
                if (googleAuthInitialized) {
                    clearInterval(checkAuth);
                    
                    // Trigger sign-in
                    const auth2 = gapi.auth2.getAuthInstance();
                    auth2.signIn().then(() => {
                        // Update button to show user info
                        const profile = auth2.currentUser.get().getBasicProfile();
                        this.innerHTML = `
                            <img src="${profile.getImageUrl()}" alt="${profile.getName()}" class="rounded-circle nav-icon" style="width: 24px; height: 24px;">
                            ${profile.getName().split(' ')[0]}
                        `;
                        this.disabled = false;
                    }).catch(error => {
                        console.error('Error signing in:', error);
                        
                        // Reset button
                        this.innerHTML = `
                            <i class="bi bi-google nav-icon"></i> Sign in with Google
                        `;
                        this.disabled = false;
                    });
                }
            }, 100);
        });
    }
});
