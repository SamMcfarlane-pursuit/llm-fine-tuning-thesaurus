/**
 * Theme Toggle JavaScript
 * Handles switching between dark and light themes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme immediately - FORCE LIGHT MODE AS DEFAULT
    initializeTheme();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        let themeIcon = themeToggle.querySelector('i');

        // If no icon exists, create one
        if (!themeIcon) {
            themeIcon = document.createElement('i');
            themeIcon.className = 'bi bi-moon-fill';
            themeToggle.appendChild(themeIcon);
        }

        // ALWAYS default to light theme unless explicitly saved as dark
        const savedTheme = localStorage.getItem('theme') || 'light';

        // Force light theme if no preference is saved
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'light');
        }

        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        // Toggle theme on button click
        themeToggle.addEventListener('click', function() {
            toggleTheme();
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            updateThemeIcon(currentTheme);
        });

        // Update theme icon
        function updateThemeIcon(theme) {
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.classList.remove('bi-moon-fill');
                    themeIcon.classList.add('bi-sun-fill');
                } else {
                    themeIcon.classList.remove('bi-sun-fill');
                    themeIcon.classList.add('bi-moon-fill');
                }
            }
        }
    }
});

/**
 * Create theme toggle button
 */
function createThemeToggleButton() {
    // Check if button already exists
    if (document.querySelector('.theme-toggle-btn')) {
        return;
    }

    // Create button element
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle dark/light theme');
    toggleBtn.setAttribute('title', 'Toggle dark/light theme');
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.innerHTML = '<i class="bi bi-moon-fill"></i><i class="bi bi-sun-fill"></i>';

    // Add click event listener
    toggleBtn.addEventListener('click', toggleTheme);

    // Add button to body
    document.body.appendChild(toggleBtn);
}

/**
 * Initialize theme based on user preference - ALWAYS DEFAULT TO LIGHT MODE
 */
function initializeTheme() {
    // FORCE light theme as default - remove any existing theme classes first
    document.body.classList.remove('light-theme', 'dark-theme');

    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'light') {
        // Apply light theme (user's preferred green color scheme)
        document.body.classList.add('light-theme');
        document.body.classList.add('theme-override');
    } else if (savedTheme === 'dark') {
        // Apply dark theme only if explicitly saved
        document.body.classList.remove('light-theme');
        document.body.classList.add('theme-override');
    } else {
        // Default fallback to light theme
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }

    // Update meta theme-color
    updateMetaThemeColor();

    console.log('Theme initialized:', savedTheme, 'Body classes:', document.body.className);
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    // Toggle theme class
    document.body.classList.toggle('light-theme');
    document.body.classList.add('theme-override');

    // Save preference to localStorage
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);

    // Announce theme change for screen readers
    announceThemeChange(currentTheme);

    // Update meta theme-color
    updateMetaThemeColor();

    // Trigger custom event for other scripts
    document.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: currentTheme }
    }));
}

/**
 * Listen for system preference changes
 */
function listenForSystemPreferenceChanges() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Add change listener
    darkModeMediaQuery.addEventListener('change', (e) => {
        // Only apply if user hasn't set a preference
        if (!document.body.classList.contains('theme-override')) {
            document.body.classList.toggle('light-theme', !e.matches);
            updateMetaThemeColor();
        }
    });
}

/**
 * Announce theme change for screen readers
 */
function announceThemeChange(theme) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = `Theme changed to ${theme} mode`;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

/**
 * Update meta theme-color for browser UI
 */
function updateMetaThemeColor() {
    // Get theme color based on current theme (new green color scheme)
    const isLightTheme = document.body.classList.contains('light-theme');
    const themeColor = isLightTheme ? '#eef5eb' : '#0d140a'; // New green color scheme

    // Update or create meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
    } else {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        metaThemeColor.setAttribute('content', themeColor);
        document.head.appendChild(metaThemeColor);
    }
}
