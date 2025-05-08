/**
 * Enhanced Theme Toggle
 * Handles switching between light and dark themes with smooth transitions
 * and persistent user preferences.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the theme toggle element
    createThemeToggle();
    
    // Initialize theme based on user preference
    initializeTheme();
    
    // Add event listener to the theme toggle button
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Add keyboard shortcut (Alt+T) for toggling theme
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 't') {
            toggleTheme();
        }
    });
});

/**
 * Creates the theme toggle UI element and adds it to the DOM
 */
function createThemeToggle() {
    const themeToggleContainer = document.createElement('div');
    themeToggleContainer.className = 'theme-toggle-container';
    themeToggleContainer.innerHTML = `
        <i class="bi bi-moon-fill theme-icon moon"></i>
        <div class="theme-toggle-btn" id="themeToggleBtn">
            <div class="theme-toggle-handle">
                <i class="bi bi-moon-fill"></i>
            </div>
        </div>
        <i class="bi bi-sun-fill theme-icon sun"></i>
        <div class="theme-toggle-tooltip">Toggle Light/Dark Mode (Alt+T)</div>
    `;
    
    document.body.appendChild(themeToggleContainer);
}

/**
 * Initializes the theme based on user preference or system preference
 */
function initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Apply saved theme
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            updateThemeIcons(true);
        } else {
            document.body.classList.remove('light-theme');
            updateThemeIcons(false);
        }
    } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (!prefersDarkMode) {
            document.body.classList.add('light-theme');
            updateThemeIcons(true);
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            updateThemeIcons(false);
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Add transition class after initial load to enable smooth transitions
    setTimeout(() => {
        document.body.classList.add('theme-transition');
    }, 100);
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
    const isLightTheme = document.body.classList.toggle('light-theme');
    
    // Update localStorage with the new theme preference
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    
    // Update theme icons
    updateThemeIcons(isLightTheme);
    
    // Dispatch custom event for other components to react to theme change
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: isLightTheme ? 'light' : 'dark' } 
    }));
    
    // Add animation effect
    addThemeChangeAnimation();
}

/**
 * Updates the icons in the theme toggle handle based on current theme
 */
function updateThemeIcons(isLightTheme) {
    const themeToggleHandle = document.querySelector('.theme-toggle-handle');
    if (themeToggleHandle) {
        themeToggleHandle.innerHTML = isLightTheme 
            ? '<i class="bi bi-sun-fill"></i>' 
            : '<i class="bi bi-moon-fill"></i>';
    }
}

/**
 * Adds a subtle animation effect when changing themes
 */
function addThemeChangeAnimation() {
    // Create and append animation overlay
    const overlay = document.createElement('div');
    overlay.className = 'theme-change-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.1);
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => {
        overlay.style.opacity = '0.2';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 100);
    }, 0);
}

/**
 * Updates code syntax highlighting theme when theme changes
 */
document.addEventListener('themeChanged', function(e) {
    // If highlight.js is being used, update its theme
    if (window.hljs) {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightBlock(block);
        });
    }
    
    // Update charts if Chart.js is being used
    if (window.Chart) {
        const theme = e.detail.theme;
        const textColor = theme === 'light' ? '#212529' : '#ffffff';
        const gridColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        
        Chart.defaults.global.defaultFontColor = textColor;
        
        // Update all charts
        if (Chart.instances) {
            Object.values(Chart.instances).forEach(chart => {
                // Update grid lines
                if (chart.options.scales && chart.options.scales.xAxes) {
                    chart.options.scales.xAxes.forEach(axis => {
                        if (axis.gridLines) {
                            axis.gridLines.color = gridColor;
                        }
                    });
                }
                
                if (chart.options.scales && chart.options.scales.yAxes) {
                    chart.options.scales.yAxes.forEach(axis => {
                        if (axis.gridLines) {
                            axis.gridLines.color = gridColor;
                        }
                    });
                }
                
                chart.update();
            });
        }
    }
});
