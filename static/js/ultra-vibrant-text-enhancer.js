/**
 * Ultra Vibrant Text Enhancer
 * Dynamically enhances text to make it brighter and more vibrant
 */

(function() {
    // Function to enhance text vibrancy
    function enhanceTextVibrancy() {
        console.log('Enhancing text vibrancy...');
        
        // Check if we're in light or dark mode
        const isLightMode = document.body.classList.contains('light-theme');
        
        // Define ultra vibrant colors based on theme
        const ultraTextColor = isLightMode ? '#ffffff' : '#f0b3ff';
        const ultraTextShadow = isLightMode 
            ? '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(93, 214, 255, 0.9)'
            : '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(192, 132, 252, 0.9)';
        const ultraTextStroke = isLightMode 
            ? '1px rgba(0, 0, 0, 0.8)'
            : '1px rgba(255, 255, 255, 0.5)';
        
        // Enhance headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, .page-title, .hero-title');
        headings.forEach(heading => {
            // Skip if already enhanced
            if (heading.classList.contains('ultra-vibrant-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            heading.classList.add('ultra-vibrant-enhanced');
            
            // Apply ultra vibrant styles
            heading.style.color = ultraTextColor;
            heading.style.textShadow = ultraTextShadow;
            heading.style.webkitTextStroke = ultraTextStroke;
            heading.style.fontWeight = '900';
            heading.style.letterSpacing = '1px';
            heading.style.filter = 'brightness(1.2)';
        });
        
        // Specifically enhance the "Learn & Explore LLM Fine-Tuning" header
        const learnExploreHeaders = document.querySelectorAll('.learn-explore-llm-fine-tuning-header, h1:contains("Learn & Explore LLM Fine-Tuning"), h2:contains("Learn & Explore LLM Fine-Tuning")');
        learnExploreHeaders.forEach(header => {
            // Skip if already ultra enhanced
            if (header.classList.contains('ultra-vibrant-special-enhanced')) {
                return;
            }
            
            // Mark as ultra enhanced
            header.classList.add('ultra-vibrant-special-enhanced');
            
            // Apply ultra vibrant styles with extra glow
            header.style.color = ultraTextColor;
            header.style.textShadow = isLightMode
                ? '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 30px rgba(93, 214, 255, 1), 0 0 50px rgba(255, 255, 255, 0.8)'
                : '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 30px rgba(192, 132, 252, 1), 0 0 50px rgba(240, 179, 255, 0.8)';
            header.style.webkitTextStroke = '1.5px rgba(0, 0, 0, 0.8)';
            header.style.fontWeight = '900';
            header.style.letterSpacing = '1.2px';
            header.style.filter = 'brightness(1.3)';
            
            // Make sure the header has position relative for the glow effect
            if (window.getComputedStyle(header).position === 'static') {
                header.style.position = 'relative';
            }
            
            // Add a vibrant border glow
            header.style.border = isLightMode
                ? '2px solid rgba(255, 255, 255, 0.8)'
                : '2px solid rgba(240, 179, 255, 0.8)';
            header.style.boxShadow = isLightMode
                ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(93, 214, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)'
                : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(192, 132, 252, 0.8), 0 0 40px rgba(240, 179, 255, 0.4)';
            
            // Add a vibrant animated glow
            let glowElement = header.querySelector('.ultra-vibrant-glow');
            if (!glowElement) {
                glowElement = document.createElement('div');
                glowElement.classList.add('ultra-vibrant-glow');
                glowElement.style.position = 'absolute';
                glowElement.style.top = '-5px';
                glowElement.style.left = '-5px';
                glowElement.style.right = '-5px';
                glowElement.style.bottom = '-5px';
                glowElement.style.borderRadius = '12px';
                glowElement.style.zIndex = '-1';
                
                // Add the glow element
                header.appendChild(glowElement);
            }
            
            // Set the glow background based on theme
            glowElement.style.background = isLightMode
                ? 'linear-gradient(45deg, rgba(93, 214, 255, 0.3), rgba(255, 255, 255, 0.3), rgba(93, 214, 255, 0.3))'
                : 'linear-gradient(45deg, rgba(192, 132, 252, 0.3), rgba(240, 179, 255, 0.3), rgba(192, 132, 252, 0.3))';
            
            // Create a style element for the animation if it doesn't exist
            if (!document.getElementById('ultra-vibrant-pulse-animation')) {
                const style = document.createElement('style');
                style.id = 'ultra-vibrant-pulse-animation';
                style.textContent = `
                    @keyframes ultraVibrantPulse {
                        0% {
                            opacity: 0.5;
                            box-shadow: ${isLightMode 
                                ? '0 0 20px rgba(93, 214, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
                                : '0 0 20px rgba(192, 132, 252, 0.5), 0 0 40px rgba(240, 179, 255, 0.3)'};
                        }
                        100% {
                            opacity: 0.8;
                            box-shadow: ${isLightMode 
                                ? '0 0 30px rgba(93, 214, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5)'
                                : '0 0 30px rgba(192, 132, 252, 0.8), 0 0 60px rgba(240, 179, 255, 0.5)'};
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Apply the animation
            glowElement.style.animation = 'ultraVibrantPulse 3s infinite alternate';
        });
        
        // Enhance card titles
        const cardTitles = document.querySelectorAll('.card-title');
        cardTitles.forEach(title => {
            // Skip if already enhanced
            if (title.classList.contains('ultra-vibrant-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            title.classList.add('ultra-vibrant-enhanced');
            
            // Apply ultra vibrant styles
            title.style.color = ultraTextColor;
            title.style.textShadow = isLightMode
                ? '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(93, 214, 255, 0.8)'
                : '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(192, 132, 252, 0.8)';
            title.style.fontWeight = '800';
            title.style.filter = 'brightness(1.2)';
        });
        
        // Enhance navbar brand
        const navbarBrand = document.querySelector('.navbar-brand');
        if (navbarBrand && !navbarBrand.classList.contains('ultra-vibrant-enhanced')) {
            navbarBrand.classList.add('ultra-vibrant-enhanced');
            
            navbarBrand.style.color = ultraTextColor;
            navbarBrand.style.textShadow = isLightMode
                ? '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(93, 214, 255, 0.9)'
                : '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(192, 132, 252, 0.9)';
            navbarBrand.style.fontWeight = '900';
            navbarBrand.style.filter = 'brightness(1.2)';
        }
        
        // Enhance nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // Skip if already enhanced
            if (link.classList.contains('ultra-vibrant-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            link.classList.add('ultra-vibrant-enhanced');
            
            // Apply ultra vibrant styles
            link.style.color = isLightMode ? '#ffffff' : '#e9d5ff';
            link.style.textShadow = isLightMode
                ? '0 1px 2px rgba(0, 0, 0, 0.7), 0 0 10px rgba(93, 214, 255, 0.6)'
                : '0 1px 2px rgba(0, 0, 0, 0.7), 0 0 10px rgba(192, 132, 252, 0.6)';
            link.style.fontWeight = '700';
            link.style.filter = 'brightness(1.1)';
        });
        
        // Enhance buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            // Skip if already enhanced
            if (button.classList.contains('ultra-vibrant-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            button.classList.add('ultra-vibrant-enhanced');
            
            // Apply ultra vibrant styles
            button.style.textShadow = isLightMode
                ? '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 255, 255, 0.8)'
                : '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 10px rgba(192, 132, 252, 0.8)';
            button.style.fontWeight = '700';
            button.style.letterSpacing = '0.5px';
            button.style.filter = 'brightness(1.2) contrast(1.1)';
            button.style.boxShadow = isLightMode
                ? '0 5px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 214, 255, 0.4)'
                : '0 5px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(192, 132, 252, 0.4)';
        });
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        enhanceTextVibrancy();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(enhanceTextVibrancy, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(enhanceTextVibrancy, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        enhanceTextVibrancy();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
