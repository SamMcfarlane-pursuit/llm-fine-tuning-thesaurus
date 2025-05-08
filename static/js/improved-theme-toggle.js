// Improved Theme Toggle and How-to-Use Bar

document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggleButton = document.getElementById('themeToggleButton');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    
    if (themeToggleButton && themeToggleIcon) {
        // Check for saved theme preference or use default
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        
        // Update icon based on current theme
        updateThemeIcon(savedTheme);
        
        // Dispatch event to notify other components about the theme
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: savedTheme } 
        }));
        
        // Toggle theme on click
        themeToggleButton.addEventListener('click', function() {
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            updateThemeIcon(newTheme);
            
            // Dispatch event to notify other components about the theme change
            document.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { theme: newTheme } 
            }));
        });
    }
    
    // How-to-Use Bar Functionality
    const howToUseIcon = document.getElementById('howToUseIcon');
    const howToUseBar = document.getElementById('howToUseBar');
    
    if (howToUseIcon && howToUseBar) {
        // Show/hide how-to-use bar on hover
        howToUseIcon.addEventListener('mouseenter', function() {
            howToUseBar.classList.remove('hidden');
        });
        
        howToUseIcon.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!howToUseBar.matches(':hover')) {
                    howToUseBar.classList.add('hidden');
                }
            }, 300);
        });
        
        howToUseBar.addEventListener('mouseleave', function() {
            howToUseBar.classList.add('hidden');
        });
        
        // Show how-to-use bar on click (for mobile)
        howToUseIcon.addEventListener('click', function() {
            howToUseBar.classList.toggle('hidden');
        });
    }
});

// Helper function to update theme icon
function updateThemeIcon(theme) {
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    if (themeToggleIcon) {
        if (theme === 'light') {
            themeToggleIcon.classList.remove('bi-moon-fill');
            themeToggleIcon.classList.add('bi-sun-fill');
        } else {
            themeToggleIcon.classList.remove('bi-sun-fill');
            themeToggleIcon.classList.add('bi-moon-fill');
        }
    }
}
