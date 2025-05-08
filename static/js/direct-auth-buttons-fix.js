/**
 * Direct Auth Buttons Fix
 * This script directly modifies the DOM to ensure the auth buttons are properly displayed
 * It's a last resort fix that will be applied if the CSS and JS fixes don't work
 * It also ensures dark mode is purple and light mode is blue
 */

(function() {
    console.log('Direct Auth Buttons Fix: Initializing...');

    // Execute immediately
    fixAuthButtons();

    // Also execute when DOM is loaded
    document.addEventListener('DOMContentLoaded', fixAuthButtons);

    // Also execute when window is loaded
    window.addEventListener('load', fixAuthButtons);

    // Set an interval to periodically check and fix the buttons
    setInterval(fixAuthButtons, 1000);
})();

/**
 * Fix the auth buttons by directly modifying the DOM
 */
function fixAuthButtons() {
    try {
        console.log('Direct Auth Buttons Fix: Attempting to fix auth buttons...');

        // Apply theme colors
        const body = document.body;
        const isLightTheme = body.classList.contains('light-theme');

        if (isLightTheme) {
            // Light mode (blue)
            document.documentElement.style.setProperty('--vibrant-bg-primary', '#e3f2fd', 'important');
            document.documentElement.style.setProperty('--vibrant-bg-secondary', '#bbdefb', 'important');
            document.documentElement.style.setProperty('--vibrant-text-primary', '#0d47a1', 'important');
            document.documentElement.style.setProperty('--vibrant-text-secondary', '#1565c0', 'important');
            body.style.background = 'linear-gradient(135deg, #e3f2fd, #bbdefb) !important';
        } else {
            // Dark mode (purple)
            document.documentElement.style.setProperty('--vibrant-bg-primary', '#1a0033', 'important');
            document.documentElement.style.setProperty('--vibrant-bg-secondary', '#2d0052', 'important');
            body.style.background = 'linear-gradient(135deg, #1a0033, #2d0052) !important';
        }

        // Check if the top auth bar exists
        let topAuthBar = document.querySelector('.top-auth-bar');

        // If it doesn't exist, create it
        if (!topAuthBar) {
            console.log('Direct Auth Buttons Fix: Creating top auth bar...');

            // Create the top auth bar
            topAuthBar = document.createElement('div');
            topAuthBar.className = 'top-auth-bar';
            topAuthBar.style.backgroundColor = '#2e0054';
            topAuthBar.style.padding = '10px 0';
            topAuthBar.style.display = 'block';
            topAuthBar.style.visibility = 'visible';
            topAuthBar.style.opacity = '1';
            topAuthBar.style.zIndex = '1000';

            // Create the container
            const container = document.createElement('div');
            container.className = 'container';

            // Create the flex container
            const flexContainer = document.createElement('div');
            flexContainer.className = 'd-flex justify-content-between align-items-center';

            // Create the quick access features
            const quickAccessFeatures = document.createElement('div');
            quickAccessFeatures.className = 'quick-access-features';
            quickAccessFeatures.style.display = 'flex';
            quickAccessFeatures.style.alignItems = 'center';
            quickAccessFeatures.style.gap = '10px';

            // Create the feature buttons
            const featureButtons = [
                { href: '/thesaurus', icon: 'bi-diagram-3', title: 'Interactive Concept Maps', label: 'Thesaurus' },
                { href: '/exercises', icon: 'bi-code-square', title: 'Hands-on Exercises', label: 'Exercises' },
                { href: '/learn', icon: 'bi-book', title: 'Learning Resources', label: 'Learn' },
                { href: '/quiz', icon: 'bi-journal-check', title: 'Knowledge Quizzes', label: 'Quizzes' }
            ];

            // Add the feature buttons
            featureButtons.forEach(button => {
                const featureButton = document.createElement('a');
                featureButton.href = button.href;
                featureButton.className = 'feature-button';
                featureButton.setAttribute('data-bs-toggle', 'tooltip');
                featureButton.setAttribute('data-bs-placement', 'bottom');
                featureButton.setAttribute('title', button.title);
                featureButton.setAttribute('data-label', button.label);
                featureButton.style.display = 'flex';
                featureButton.style.alignItems = 'center';
                featureButton.style.justifyContent = 'center';
                featureButton.style.width = '45px';
                featureButton.style.height = '45px';
                featureButton.style.borderRadius = '50%';
                featureButton.style.backgroundColor = '#0088cc';
                featureButton.style.color = 'white';
                featureButton.style.textDecoration = 'none';
                featureButton.style.transition = 'all 0.3s ease';
                featureButton.style.marginRight = '5px';
                featureButton.style.boxShadow = '0 0 10px rgba(0, 136, 204, 0.3)';
                featureButton.style.cursor = 'pointer';
                featureButton.style.visibility = 'visible';
                featureButton.style.opacity = '1';
                featureButton.style.pointerEvents = 'auto';

                // Add the icon
                const icon = document.createElement('i');
                icon.className = `bi ${button.icon}`;
                featureButton.appendChild(icon);

                // Add hover effect
                featureButton.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#00a0e9';
                    this.style.transform = 'scale(1.05)';
                    this.style.boxShadow = '0 0 15px rgba(0, 160, 233, 0.5)';
                });

                featureButton.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '#0088cc';
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '0 0 10px rgba(0, 136, 204, 0.3)';
                });

                // Add the button to the quick access features
                quickAccessFeatures.appendChild(featureButton);
            });

            // Add the "How to Use This Site" link
            const howToUseContainer = document.createElement('div');
            howToUseContainer.className = 'how-to-use-site';

            const howToUseLink = document.createElement('a');
            howToUseLink.href = '#';
            howToUseLink.className = 'how-to-use-link';
            howToUseLink.setAttribute('data-bs-toggle', 'modal');
            howToUseLink.setAttribute('data-bs-target', '#howToUseModal');

            const howToUseIcon = document.createElement('i');
            howToUseIcon.className = 'bi bi-info-circle';

            howToUseLink.appendChild(howToUseIcon);
            howToUseLink.appendChild(document.createTextNode(' HOW TO USE THIS SITE'));

            howToUseContainer.appendChild(howToUseLink);
            quickAccessFeatures.appendChild(howToUseContainer);

            // Create the auth links
            const authLinks = document.createElement('div');
            authLinks.className = 'auth-links';
            authLinks.style.display = 'flex';
            authLinks.style.alignItems = 'center';
            authLinks.style.justifyContent = 'flex-end';
            authLinks.style.gap = '20px';
            authLinks.style.visibility = 'visible';
            authLinks.style.opacity = '1';

            // Check if the user is logged in
            const isLoggedIn = document.body.getAttribute('data-user-logged-in') === 'true';

            if (isLoggedIn) {
                // Create the theme toggle button
                const themeToggleButton = document.createElement('button');
                themeToggleButton.id = 'themeToggleButton';
                themeToggleButton.className = 'theme-toggle-button';
                themeToggleButton.setAttribute('aria-label', 'Toggle dark/light mode');
                themeToggleButton.style.marginRight = '15px';
                themeToggleButton.style.visibility = 'visible';
                themeToggleButton.style.opacity = '1';

                // Create the user info
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info me-3';

                const userIcon = document.createElement('i');
                userIcon.className = 'bi bi-person-circle me-1';

                userInfo.appendChild(userIcon);
                userInfo.appendChild(document.createTextNode(' Welcome, User'));

                // Create the profile link
                const profileLink = document.createElement('a');
                profileLink.href = '/auth/profile';
                profileLink.className = 'top-auth-link me-3';

                const profileIcon = document.createElement('i');
                profileIcon.className = 'bi bi-person-badge me-1';

                profileLink.appendChild(profileIcon);
                profileLink.appendChild(document.createTextNode(' Profile'));

                // Create the sign out link
                const signOutLink = document.createElement('a');
                signOutLink.href = '/auth/logout';
                signOutLink.className = 'top-auth-link';

                const signOutIcon = document.createElement('i');
                signOutIcon.className = 'bi bi-box-arrow-right me-1';

                signOutLink.appendChild(signOutIcon);
                signOutLink.appendChild(document.createTextNode(' Sign Out'));

                // Add the elements to the auth links
                authLinks.appendChild(themeToggleButton);
                authLinks.appendChild(userInfo);
                authLinks.appendChild(profileLink);
                authLinks.appendChild(signOutLink);
            } else {
                // Create the theme toggle button
                const themeToggleButton = document.createElement('button');
                themeToggleButton.id = 'themeToggleButton';
                themeToggleButton.className = 'theme-toggle-button';
                themeToggleButton.setAttribute('aria-label', 'Toggle dark/light mode');
                themeToggleButton.style.marginRight = '15px';
                themeToggleButton.style.visibility = 'visible';
                themeToggleButton.style.opacity = '1';

                // Create the auth buttons container
                const authButtonsContainer = document.createElement('div');
                authButtonsContainer.className = 'auth-buttons-container';
                authButtonsContainer.style.display = 'flex';
                authButtonsContainer.style.alignItems = 'center';
                authButtonsContainer.style.gap = '20px';
                authButtonsContainer.style.marginTop = '10px';
                authButtonsContainer.style.visibility = 'visible';
                authButtonsContainer.style.opacity = '1';

                // Create the sign in button
                const signInBtn = document.createElement('a');
                signInBtn.href = '/auth/login';
                signInBtn.className = 'auth-btn sign-in-btn';
                signInBtn.style.backgroundColor = 'rgba(30, 0, 60, 0.5)';
                signInBtn.style.border = '2px solid rgba(0, 195, 255, 0.3)';
                signInBtn.style.color = '#00c3ff';
                signInBtn.style.borderRadius = '50px';
                signInBtn.style.padding = '15px 30px';
                signInBtn.style.height = '60px';
                signInBtn.style.width = '210px';
                signInBtn.style.display = 'inline-flex';
                signInBtn.style.alignItems = 'center';
                signInBtn.style.justifyContent = 'center';
                signInBtn.style.fontWeight = '500';
                signInBtn.style.fontSize = '1.1rem';
                signInBtn.style.textAlign = 'center';
                signInBtn.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                signInBtn.style.transition = 'all 0.3s ease';
                signInBtn.style.zIndex = '1002';
                signInBtn.style.visibility = 'visible';
                signInBtn.style.opacity = '1';
                signInBtn.style.pointerEvents = 'auto';

                const signInIcon = document.createElement('i');
                signInIcon.className = 'bi bi-box-arrow-in-right me-1';
                signInIcon.style.display = 'inline-block';
                signInIcon.style.marginRight = '8px';
                signInIcon.style.fontSize = '1.1rem';
                signInIcon.style.verticalAlign = 'middle';
                signInIcon.style.visibility = 'visible';
                signInIcon.style.opacity = '1';

                signInBtn.appendChild(signInIcon);
                signInBtn.appendChild(document.createTextNode(' Sign In'));

                // Create the register button
                const registerBtn = document.createElement('a');
                registerBtn.href = '/auth/register';
                registerBtn.className = 'auth-btn register-btn';
                registerBtn.style.backgroundColor = 'rgba(180, 70, 207, 0.8)';
                registerBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                registerBtn.style.color = 'white';
                registerBtn.style.borderRadius = '50px';
                registerBtn.style.padding = '15px 30px';
                registerBtn.style.height = '60px';
                registerBtn.style.width = '210px';
                registerBtn.style.display = 'inline-flex';
                registerBtn.style.alignItems = 'center';
                registerBtn.style.justifyContent = 'center';
                registerBtn.style.fontWeight = '500';
                registerBtn.style.fontSize = '1.1rem';
                registerBtn.style.textAlign = 'center';
                registerBtn.style.boxShadow = '0 0 15px rgba(180, 70, 207, 0.3)';
                registerBtn.style.transition = 'all 0.3s ease';
                registerBtn.style.zIndex = '1002';
                registerBtn.style.visibility = 'visible';
                registerBtn.style.opacity = '1';
                registerBtn.style.pointerEvents = 'auto';

                const registerIcon = document.createElement('i');
                registerIcon.className = 'bi bi-person-plus me-1';
                registerIcon.style.display = 'inline-block';
                registerIcon.style.marginRight = '8px';
                registerIcon.style.fontSize = '1.1rem';
                registerIcon.style.verticalAlign = 'middle';
                registerIcon.style.visibility = 'visible';
                registerIcon.style.opacity = '1';

                registerBtn.appendChild(registerIcon);
                registerBtn.appendChild(document.createTextNode(' Register'));

                // Add hover effects
                signInBtn.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(30, 0, 60, 0.7)';
                    this.style.borderColor = 'rgba(0, 195, 255, 0.5)';
                    this.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.3)';
                });

                signInBtn.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'rgba(30, 0, 60, 0.5)';
                    this.style.borderColor = 'rgba(0, 195, 255, 0.3)';
                    this.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                });

                registerBtn.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(180, 70, 207, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.3)';
                });

                registerBtn.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'rgba(180, 70, 207, 0.8)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    this.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                });

                // Add accessibility
                signInBtn.setAttribute('role', 'button');
                signInBtn.setAttribute('aria-label', 'Sign In');
                signInBtn.setAttribute('tabindex', '0');

                registerBtn.setAttribute('role', 'button');
                registerBtn.setAttribute('aria-label', 'Register');
                registerBtn.setAttribute('tabindex', '0');

                // Add keyboard accessibility
                signInBtn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });

                registerBtn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });

                // Add the buttons to the container
                authButtonsContainer.appendChild(signInBtn);
                authButtonsContainer.appendChild(registerBtn);

                // Add the elements to the auth links
                authLinks.appendChild(themeToggleButton);
                authLinks.appendChild(authButtonsContainer);
            }

            // Add the elements to the flex container
            flexContainer.appendChild(quickAccessFeatures);
            flexContainer.appendChild(authLinks);

            // Add the flex container to the container
            container.appendChild(flexContainer);

            // Add the container to the top auth bar
            topAuthBar.appendChild(container);

            // Add the top auth bar to the body
            const body = document.body;
            const firstChild = body.firstChild;

            if (firstChild) {
                body.insertBefore(topAuthBar, firstChild);
            } else {
                body.appendChild(topAuthBar);
            }

            console.log('Direct Auth Buttons Fix: Top auth bar created and added to the DOM');
        } else {
            console.log('Direct Auth Buttons Fix: Top auth bar already exists, ensuring it is properly styled...');

            // Ensure the top auth bar is properly styled
            topAuthBar.style.backgroundColor = '#2e0054';
            topAuthBar.style.padding = '10px 0';
            topAuthBar.style.display = 'block';
            topAuthBar.style.visibility = 'visible';
            topAuthBar.style.opacity = '1';
            topAuthBar.style.zIndex = '1000';

            // Get the auth buttons container
            const authButtonsContainer = topAuthBar.querySelector('.auth-buttons-container');

            if (authButtonsContainer) {
                // Ensure the auth buttons container is properly styled
                authButtonsContainer.style.display = 'flex';
                authButtonsContainer.style.alignItems = 'center';
                authButtonsContainer.style.gap = '20px';
                authButtonsContainer.style.marginTop = '10px';
                authButtonsContainer.style.visibility = 'visible';
                authButtonsContainer.style.opacity = '1';

                // Get the sign in button
                const signInBtn = authButtonsContainer.querySelector('.sign-in-btn');

                if (signInBtn) {
                    // Ensure the sign in button is properly styled
                    signInBtn.style.backgroundColor = 'rgba(30, 0, 60, 0.5)';
                    signInBtn.style.border = '2px solid rgba(0, 195, 255, 0.3)';
                    signInBtn.style.color = '#00c3ff';
                    signInBtn.style.borderRadius = '50px';
                    signInBtn.style.padding = '15px 30px';
                    signInBtn.style.height = '60px';
                    signInBtn.style.width = '210px';
                    signInBtn.style.display = 'inline-flex';
                    signInBtn.style.alignItems = 'center';
                    signInBtn.style.justifyContent = 'center';
                    signInBtn.style.fontWeight = '500';
                    signInBtn.style.fontSize = '1.1rem';
                    signInBtn.style.textAlign = 'center';
                    signInBtn.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.2)';
                    signInBtn.style.transition = 'all 0.3s ease';
                    signInBtn.style.zIndex = '1002';
                    signInBtn.style.visibility = 'visible';
                    signInBtn.style.opacity = '1';
                    signInBtn.style.pointerEvents = 'auto';

                    // Get the sign in icon
                    let signInIcon = signInBtn.querySelector('i');

                    // If the icon doesn't exist, create it
                    if (!signInIcon) {
                        signInIcon = document.createElement('i');
                        signInIcon.className = 'bi bi-box-arrow-in-right me-1';

                        // Insert the icon at the beginning of the button
                        if (signInBtn.firstChild) {
                            signInBtn.insertBefore(signInIcon, signInBtn.firstChild);
                        } else {
                            signInBtn.appendChild(signInIcon);
                            signInBtn.appendChild(document.createTextNode(' Sign In'));
                        }
                    }

                    // Ensure the icon is properly styled
                    signInIcon.style.display = 'inline-block';
                    signInIcon.style.marginRight = '8px';
                    signInIcon.style.fontSize = '1.1rem';
                    signInIcon.style.verticalAlign = 'middle';
                    signInIcon.style.visibility = 'visible';
                    signInIcon.style.opacity = '1';
                }

                // Get the register button
                const registerBtn = authButtonsContainer.querySelector('.register-btn');

                if (registerBtn) {
                    // Ensure the register button is properly styled
                    registerBtn.style.backgroundColor = 'rgba(180, 70, 207, 0.8)';
                    registerBtn.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                    registerBtn.style.color = 'white';
                    registerBtn.style.borderRadius = '50px';
                    registerBtn.style.padding = '15px 30px';
                    registerBtn.style.height = '60px';
                    registerBtn.style.width = '210px';
                    registerBtn.style.display = 'inline-flex';
                    registerBtn.style.alignItems = 'center';
                    registerBtn.style.justifyContent = 'center';
                    registerBtn.style.fontWeight = '500';
                    registerBtn.style.fontSize = '1.1rem';
                    registerBtn.style.textAlign = 'center';
                    registerBtn.style.boxShadow = '0 0 15px rgba(180, 70, 207, 0.3)';
                    registerBtn.style.transition = 'all 0.3s ease';
                    registerBtn.style.zIndex = '1002';
                    registerBtn.style.visibility = 'visible';
                    registerBtn.style.opacity = '1';
                    registerBtn.style.pointerEvents = 'auto';

                    // Get the register icon
                    let registerIcon = registerBtn.querySelector('i');

                    // If the icon doesn't exist, create it
                    if (!registerIcon) {
                        registerIcon = document.createElement('i');
                        registerIcon.className = 'bi bi-person-plus me-1';

                        // Insert the icon at the beginning of the button
                        if (registerBtn.firstChild) {
                            registerBtn.insertBefore(registerIcon, registerBtn.firstChild);
                        } else {
                            registerBtn.appendChild(registerIcon);
                            registerBtn.appendChild(document.createTextNode(' Register'));
                        }
                    }

                    // Ensure the icon is properly styled
                    registerIcon.style.display = 'inline-block';
                    registerIcon.style.marginRight = '8px';
                    registerIcon.style.fontSize = '1.1rem';
                    registerIcon.style.verticalAlign = 'middle';
                    registerIcon.style.visibility = 'visible';
                    registerIcon.style.opacity = '1';
                }
            }
        }

        console.log('Direct Auth Buttons Fix: Auth buttons fixed successfully');
    } catch (error) {
        console.error('Direct Auth Buttons Fix: Error fixing auth buttons', error);
    }
}
