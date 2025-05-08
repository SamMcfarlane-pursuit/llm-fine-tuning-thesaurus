/**
 * Contrast Toggle
 * Allows users to switch between normal and high contrast modes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create contrast toggle button if it doesn't exist
    if (!document.getElementById('contrastToggleButton')) {
        createContrastToggleButton();
    }
    
    // Initialize contrast mode from localStorage
    initializeContrastMode();
    
    // Add event listener to the contrast toggle button
    document.getElementById('contrastToggleButton').addEventListener('click', toggleContrastMode);
});

/**
 * Creates the contrast toggle button
 */
function createContrastToggleButton() {
    // Create container
    const container = document.createElement('div');
    container.className = 'contrast-toggle-container';
    
    // Create button
    const button = document.createElement('button');
    button.id = 'contrastToggleButton';
    button.className = 'contrast-toggle-button';
    button.setAttribute('aria-label', 'Toggle high contrast mode');
    button.innerHTML = '<i id="contrastToggleIcon" class="bi bi-eye-fill contrast-toggle-icon"></i>';
    
    // Add button to container
    container.appendChild(button);
    
    // Add container to body
    document.body.appendChild(container);
    
    // Position the contrast toggle button next to the theme toggle button
    positionContrastToggleButton();
}

/**
 * Positions the contrast toggle button next to the theme toggle button
 */
function positionContrastToggleButton() {
    const themeToggleContainer = document.querySelector('.theme-toggle-container');
    
    if (themeToggleContainer) {
        const contrastToggleContainer = document.querySelector('.contrast-toggle-container');
        
        // Position contrast toggle button below theme toggle button
        contrastToggleContainer.style.top = (themeToggleContainer.offsetTop + themeToggleContainer.offsetHeight + 10) + 'px';
        contrastToggleContainer.style.right = themeToggleContainer.style.right;
    }
}

/**
 * Initializes the contrast mode from localStorage
 */
function initializeContrastMode() {
    const highContrastMode = localStorage.getItem('highContrastMode') === 'true';
    
    if (highContrastMode) {
        document.body.classList.add('high-contrast-mode');
        updateContrastToggleIcon(true);
    } else {
        document.body.classList.remove('high-contrast-mode');
        updateContrastToggleIcon(false);
    }
}

/**
 * Toggles between normal and high contrast modes
 */
function toggleContrastMode() {
    const highContrastMode = document.body.classList.contains('high-contrast-mode');
    
    if (highContrastMode) {
        document.body.classList.remove('high-contrast-mode');
        localStorage.setItem('highContrastMode', 'false');
        updateContrastToggleIcon(false);
    } else {
        document.body.classList.add('high-contrast-mode');
        localStorage.setItem('highContrastMode', 'true');
        updateContrastToggleIcon(true);
    }
}

/**
 * Updates the contrast toggle icon based on the current mode
 * @param {boolean} highContrastMode - Whether high contrast mode is enabled
 */
function updateContrastToggleIcon(highContrastMode) {
    const icon = document.getElementById('contrastToggleIcon');
    
    if (highContrastMode) {
        icon.classList.remove('bi-eye-fill');
        icon.classList.add('bi-eye-slash-fill');
    } else {
        icon.classList.remove('bi-eye-slash-fill');
        icon.classList.add('bi-eye-fill');
    }
}
