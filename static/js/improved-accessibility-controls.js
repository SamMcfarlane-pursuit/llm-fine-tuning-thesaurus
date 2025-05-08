/**
 * Improved Accessibility Controls
 * Moves zoom button and theme toggle next to sign-in button for better accessibility
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize after a short delay to ensure other scripts have loaded
    setTimeout(initImprovedAccessibilityControls, 500);
});

function initImprovedAccessibilityControls() {
    // Find the auth links container
    const authLinksContainer = document.querySelector('.auth-links');
    if (!authLinksContainer) {
        console.warn('Auth links container not found');
        return;
    }

    // Create a container for accessibility controls
    const accessibilityControls = document.createElement('div');
    accessibilityControls.className = 'accessibility-controls';

    // Move the theme toggle button to the accessibility controls
    const themeToggleButton = document.getElementById('themeToggleButton');
    if (themeToggleButton) {
        // Create a wrapper for the theme toggle button with tooltip
        const themeToggleWrapper = document.createElement('div');
        themeToggleWrapper.className = 'accessibility-control-wrapper';

        // Create tooltip
        const themeTooltip = document.createElement('div');
        themeTooltip.className = 'accessibility-tooltip';
        themeTooltip.textContent = 'Toggle Light/Dark Mode';

        // Move the theme toggle button to the wrapper
        themeToggleButton.parentNode.removeChild(themeToggleButton);
        themeToggleWrapper.appendChild(themeToggleButton);
        themeToggleWrapper.appendChild(themeTooltip);

        // Add to accessibility controls
        accessibilityControls.appendChild(themeToggleWrapper);
    }

    // We're keeping the AI assistant at the bottom of the screen
    // No need to move it to the top bar

    // Create a zoom in button
    const zoomInWrapper = document.createElement('div');
    zoomInWrapper.className = 'accessibility-control-wrapper';

    const zoomInButton = document.createElement('button');
    zoomInButton.className = 'zoom-btn zoom-in-btn';
    zoomInButton.innerHTML = '<i class="bi bi-zoom-in"></i>';
    zoomInButton.setAttribute('title', 'Zoom In');
    zoomInButton.setAttribute('aria-label', 'Zoom In');

    const zoomInTooltip = document.createElement('div');
    zoomInTooltip.className = 'accessibility-tooltip';
    zoomInTooltip.textContent = 'Zoom In';

    zoomInWrapper.appendChild(zoomInButton);
    zoomInWrapper.appendChild(zoomInTooltip);
    accessibilityControls.appendChild(zoomInWrapper);

    // Create a zoom out button
    const zoomOutWrapper = document.createElement('div');
    zoomOutWrapper.className = 'accessibility-control-wrapper';

    const zoomOutButton = document.createElement('button');
    zoomOutButton.className = 'zoom-btn zoom-out-btn';
    zoomOutButton.innerHTML = '<i class="bi bi-zoom-out"></i>';
    zoomOutButton.setAttribute('title', 'Zoom Out');
    zoomOutButton.setAttribute('aria-label', 'Zoom Out');

    const zoomOutTooltip = document.createElement('div');
    zoomOutTooltip.className = 'accessibility-tooltip';
    zoomOutTooltip.textContent = 'Zoom Out';

    zoomOutWrapper.appendChild(zoomOutButton);
    zoomOutWrapper.appendChild(zoomOutTooltip);
    accessibilityControls.appendChild(zoomOutWrapper);

    // Create a reset zoom button
    const resetZoomWrapper = document.createElement('div');
    resetZoomWrapper.className = 'accessibility-control-wrapper';

    const resetZoomButton = document.createElement('button');
    resetZoomButton.className = 'zoom-btn reset-btn';
    resetZoomButton.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
    resetZoomButton.setAttribute('title', 'Reset Zoom');
    resetZoomButton.setAttribute('aria-label', 'Reset Zoom');

    const resetZoomTooltip = document.createElement('div');
    resetZoomTooltip.className = 'accessibility-tooltip';
    resetZoomTooltip.textContent = 'Reset Zoom';

    resetZoomWrapper.appendChild(resetZoomButton);
    resetZoomWrapper.appendChild(resetZoomTooltip);
    accessibilityControls.appendChild(resetZoomWrapper);

    // Insert the accessibility controls before the first child of auth links
    const firstChild = authLinksContainer.firstChild;
    authLinksContainer.insertBefore(accessibilityControls, firstChild);

    // Add event listeners for zoom buttons
    zoomInButton.addEventListener('click', function() {
        zoomIn();
    });

    zoomOutButton.addEventListener('click', function() {
        zoomOut();
    });

    resetZoomButton.addEventListener('click', function() {
        resetZoom();
    });
}

// Zoom functionality
let currentZoom = 1.0;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 2.0;

function zoomIn() {
    if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        applyZoom();
    }
}

function resetZoom() {
    currentZoom = 1.0;
    applyZoom();
}

function applyZoom() {
    // Apply zoom to the main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.transform = `scale(${currentZoom})`;
        mainContent.style.transformOrigin = 'top center';
        mainContent.style.transition = 'transform 0.3s ease';
    }

    // If there's a visualization container, apply zoom to it as well
    const visualizationContainer = document.getElementById('visualization-container') || document.getElementById('network-container');
    if (visualizationContainer) {
        // Check if there's an EnhancedVisualization instance
        if (window.enhancedVisualization && typeof window.enhancedVisualization.setZoom === 'function') {
            window.enhancedVisualization.setZoom(currentZoom);
        } else {
            // Direct zoom on the container
            const iframe = visualizationContainer.querySelector('iframe');
            if (iframe) {
                iframe.style.transform = `scale(${currentZoom})`;
                iframe.style.transformOrigin = 'top center';
                iframe.style.transition = 'transform 0.3s ease';
            }
        }
    }
}
