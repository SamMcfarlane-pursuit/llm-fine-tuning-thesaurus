/**
 * Purple Text Enhancer
 * Adds subtle animations and effects to purple text in dark mode
 */

(function() {
    // Only run in dark mode
    function enhancePurpleText() {
        // Check if we're in dark mode
        if (document.body.classList.contains('light-theme')) {
            return; // Exit if in light mode
        }

        console.log('Enhancing purple text in dark mode...');

        // Add subtle pulse animation to headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Only apply if not already enhanced
            if (!heading.classList.contains('purple-enhanced')) {
                heading.classList.add('purple-enhanced');
                
                // Create a subtle pulse animation
                const keyframes = `
                    @keyframes purpleHeadingPulse-${Math.random().toString(36).substring(2, 15)} {
                        0% { opacity: 0.95; filter: brightness(0.95); }
                        50% { opacity: 1; filter: brightness(1.05); }
                        100% { opacity: 0.95; filter: brightness(0.95); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                heading.style.animation = `purpleHeadingPulse-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
            }
        });

        // Add hover effect to links
        const links = document.querySelectorAll('a:not(.btn):not(.nav-link):not(.dropdown-item)');
        links.forEach(link => {
            if (!link.classList.contains('purple-enhanced')) {
                link.classList.add('purple-enhanced');
                
                // Add event listeners for hover effects
                link.addEventListener('mouseenter', () => {
                    link.style.textShadow = '0 0 10px rgba(192, 132, 252, 0.8)';
                    link.style.transition = 'all 0.3s ease';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.textShadow = '';
                });
            }
        });

        // Add subtle glow to buttons
        const buttons = document.querySelectorAll('.btn-primary, .btn-outline-primary');
        buttons.forEach(button => {
            if (!button.classList.contains('purple-enhanced')) {
                button.classList.add('purple-enhanced');
                
                // Create a subtle glow animation
                const keyframes = `
                    @keyframes purpleButtonGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { box-shadow: 0 0 5px rgba(192, 132, 252, 0.3); }
                        50% { box-shadow: 0 0 15px rgba(192, 132, 252, 0.6); }
                        100% { box-shadow: 0 0 5px rgba(192, 132, 252, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                button.style.animation = `purpleButtonGlow-${Math.random().toString(36).substring(2, 15)} 3s infinite ease-in-out`;
            }
        });

        // Add subtle text effects to card titles
        const cardTitles = document.querySelectorAll('.card-title');
        cardTitles.forEach(title => {
            if (!title.classList.contains('purple-enhanced')) {
                title.classList.add('purple-enhanced');
                
                // Create a subtle text shadow animation
                const keyframes = `
                    @keyframes purpleTitleGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { text-shadow: 0 0 5px rgba(192, 132, 252, 0.3); }
                        50% { text-shadow: 0 0 10px rgba(192, 132, 252, 0.6); }
                        100% { text-shadow: 0 0 5px rgba(192, 132, 252, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                title.style.animation = `purpleTitleGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
            }
        });

        // Add subtle gradient shift to section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (!title.classList.contains('purple-enhanced')) {
                title.classList.add('purple-enhanced');
                
                // Create a subtle gradient shift animation
                const keyframes = `
                    @keyframes purpleGradientShift-${Math.random().toString(36).substring(2, 15)} {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                title.style.backgroundSize = '200% auto';
                title.style.animation = `purpleGradientShift-${Math.random().toString(36).substring(2, 15)} 6s infinite linear`;
            }
        });

        // Add subtle effects to navbar brand
        const navbarBrand = document.querySelector('.navbar-brand .brand-text');
        if (navbarBrand && !navbarBrand.classList.contains('purple-enhanced')) {
            navbarBrand.classList.add('purple-enhanced');
            
            // Create a subtle gradient shift animation
            const keyframes = `
                @keyframes purpleBrandGlow-${Math.random().toString(36).substring(2, 15)} {
                    0% { filter: drop-shadow(0 0 2px rgba(192, 132, 252, 0.3)); }
                    50% { filter: drop-shadow(0 0 5px rgba(192, 132, 252, 0.6)); }
                    100% { filter: drop-shadow(0 0 2px rgba(192, 132, 252, 0.3)); }
                }
            `;
            
            // Add the keyframes to the document
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            // Apply the animation
            navbarBrand.style.animation = `purpleBrandGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
        }
    }

    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        enhancePurpleText();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(enhancePurpleText, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(enhancePurpleText, 2000);
    });

    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        enhancePurpleText();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
