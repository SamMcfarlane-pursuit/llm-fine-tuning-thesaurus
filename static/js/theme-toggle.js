/**
 * Theme Toggle JavaScript
 * Handles switching between dark and light themes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create theme toggle button
    createThemeToggleButton();
    
    // Initialize theme based on user preference
    initializeTheme();
    
    // Listen for system preference changes
    listenForSystemPreferenceChanges();
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
 * Initialize theme based on user preference
 */
function initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Apply saved theme
        document.body.classList.toggle('light-theme', savedTheme === 'light');
        document.body.classList.add('theme-override');
    } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-theme', !prefersDarkMode);
    }
    
    // Update meta theme-color
    updateMetaThemeColor();
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
    // Get theme color based on current theme
    const isLightTheme = document.body.classList.contains('light-theme');
    const themeColor = isLightTheme ? '#f8f9fa' : '#121212';
    
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
