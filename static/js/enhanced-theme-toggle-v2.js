/**
 * Enhanced Theme Toggle v2
 * Provides improved theme toggle functionality with animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggleButton = document.getElementById('themeToggleButton');

    if (themeToggleButton) {
        // Check for saved theme preference or use default
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-theme', savedTheme === 'light');

        // Dispatch event to notify other components about the theme
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: savedTheme }
        }));

        // Toggle theme on click
        themeToggleButton.addEventListener('click', function() {
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', newTheme);

            // Add animation effect
            addThemeChangeAnimation();

            // Dispatch event to notify other components about the theme change
            document.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: newTheme }
            }));

            // Announce theme change for accessibility
            announceThemeChange(newTheme);
        });
    }

    // How to Use Site functionality
    const howToUseLink = document.querySelector('.how-to-use-link');
    const howToUseModal = document.getElementById('howToUseModal');

    if (howToUseLink && howToUseModal) {
        howToUseLink.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(howToUseModal);
            modal.show();
        });
    }
});

/**
 * Add theme change animation
 */
function addThemeChangeAnimation() {
    // Create a ripple effect element
    const ripple = document.createElement('div');
    ripple.className = 'theme-change-ripple';
    document.body.appendChild(ripple);

    // Trigger animation
    setTimeout(() => {
        ripple.classList.add('animate');

        // Remove ripple after animation completes
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 1000);
    }, 10);
}

/**
 * Announce theme change for accessibility
 * @param {string} theme - The new theme ('light' or 'dark')
 */
function announceThemeChange(theme) {
    // Create an accessible announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Theme changed to ${theme} mode`;

    // Add to DOM
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

/**
 * Apply theme to specific elements
 * This function can be called by other components to apply theme-specific styles
 * @param {string} theme - The theme to apply ('light' or 'dark')
 * @param {HTMLElement} element - The element to apply the theme to (optional, defaults to document.body)
 */
function applyTheme(theme, element = document.body) {
    if (theme === 'light') {
        element.classList.add('light-theme');
    } else {
        element.classList.remove('light-theme');
    }
}

// Make applyTheme function available globally
window.applyTheme = applyTheme;
