/**
 * White Text Enhancer
 * Adds subtle animations and effects to white text in light mode
 */

(function() {
    // Only run in light mode
    function enhanceWhiteText() {
        // Check if we're in light mode
        if (!document.body.classList.contains('light-theme')) {
            return; // Exit if in dark mode
        }

        console.log('Enhancing white text in light mode...');

        // Add subtle glow animation to headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Only apply if not already enhanced
            if (!heading.classList.contains('white-enhanced')) {
                heading.classList.add('white-enhanced');
                
                // Create a subtle glow animation
                const keyframes = `
                    @keyframes whiteHeadingGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                        50% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.7); }
                        100% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                heading.style.animation = `whiteHeadingGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
            }
        });

        // Add hover effect to links
        const links = document.querySelectorAll('a:not(.btn):not(.nav-link):not(.dropdown-item)');
        links.forEach(link => {
            if (!link.classList.contains('white-enhanced')) {
                link.classList.add('white-enhanced');
                
                // Add event listeners for hover effects
                link.addEventListener('mouseenter', () => {
                    link.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
                    link.style.transition = 'all 0.3s ease';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
                });
            }
        });

        // Add subtle glow to buttons
        const buttons = document.querySelectorAll('.btn-primary, .btn-outline-primary');
        buttons.forEach(button => {
            if (!button.classList.contains('white-enhanced')) {
                button.classList.add('white-enhanced');
                
                // Create a subtle glow animation
                const keyframes = `
                    @keyframes whiteButtonGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 255, 255, 0.3); }
                        50% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.7); }
                        100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 255, 255, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                button.style.animation = `whiteButtonGlow-${Math.random().toString(36).substring(2, 15)} 3s infinite ease-in-out`;
            }
        });

        // Add subtle text effects to card titles
        const cardTitles = document.querySelectorAll('.card-title');
        cardTitles.forEach(title => {
            if (!title.classList.contains('white-enhanced')) {
                title.classList.add('white-enhanced');
                
                // Create a subtle text shadow animation
                const keyframes = `
                    @keyframes whiteTitleGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                        50% { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.7); }
                        100% { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                title.style.animation = `whiteTitleGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
            }
        });

        // Add subtle effects to section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (!title.classList.contains('white-enhanced')) {
                title.classList.add('white-enhanced');
                
                // Create a subtle text shadow animation
                const keyframes = `
                    @keyframes whiteSectionGlow-${Math.random().toString(36).substring(2, 15)} {
                        0% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                        50% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.7); }
                        100% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                    }
                `;
                
                // Add the keyframes to the document
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                // Apply the animation
                title.style.animation = `whiteSectionGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
            }
        });

        // Add subtle effects to navbar brand
        const navbarBrand = document.querySelector('.navbar-brand .brand-text');
        if (navbarBrand && !navbarBrand.classList.contains('white-enhanced')) {
            navbarBrand.classList.add('white-enhanced');
            
            // Create a subtle text shadow animation
            const keyframes = `
                @keyframes whiteBrandGlow-${Math.random().toString(36).substring(2, 15)} {
                    0% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                    50% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.7); }
                    100% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                }
            `;
            
            // Add the keyframes to the document
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            // Apply the animation
            navbarBrand.style.animation = `whiteBrandGlow-${Math.random().toString(36).substring(2, 15)} 4s infinite ease-in-out`;
        }

        // Add subtle effects to nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (!link.classList.contains('white-enhanced')) {
                link.classList.add('white-enhanced');
                
                // Add event listeners for hover effects
                link.addEventListener('mouseenter', () => {
                    link.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
                    link.style.transition = 'all 0.3s ease';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
                });
            }
        });
    }

    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        enhanceWhiteText();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(enhanceWhiteText, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(enhanceWhiteText, 2000);
    });

    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        enhanceWhiteText();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
