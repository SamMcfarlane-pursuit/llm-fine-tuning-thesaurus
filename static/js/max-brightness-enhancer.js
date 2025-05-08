/**
 * Maximum Brightness Enhancer
 * Applies maximum brightness effects to specific elements
 */

(function() {
    // Function to apply maximum brightness effects
    function applyMaxBrightnessEffects() {
        console.log('Applying maximum brightness effects...');
        
        // Check if we're in light or dark mode
        const isLightMode = document.body.classList.contains('light-theme');
        
        // Find the "Learn & Explore LLM Fine-Tuning" header
        const learnExploreHeaders = document.querySelectorAll(
            '.learn-explore-llm-fine-tuning-header, ' +
            '.learn-explore-llm-fine-tuning-exact-match, ' +
            'h1:contains("Learn & Explore LLM Fine-Tuning"), ' +
            'h2:contains("Learn & Explore LLM Fine-Tuning"), ' +
            'h1.learn-explore-header, ' +
            'h2.learn-explore-header, ' +
            '.learn-explore-header, ' +
            '.llm-fine-tuning-header, ' +
            'h1[style*="background-color: rgb(0, 123, 255)"], ' +
            'h2[style*="background-color: rgb(0, 123, 255)"], ' +
            'h1[style*="background-color: #007bff"], ' +
            'h2[style*="background-color: #007bff"], ' +
            'h1[style*="background: rgb(0, 123, 255)"], ' +
            'h2[style*="background: rgb(0, 123, 255)"], ' +
            'h1[style*="background: #007bff"], ' +
            'h2[style*="background: #007bff"]'
        );
        
        learnExploreHeaders.forEach(header => {
            // Skip if already enhanced with maximum brightness
            if (header.classList.contains('max-brightness-enhanced')) {
                return;
            }
            
            // Mark as enhanced with maximum brightness
            header.classList.add('max-brightness-enhanced');
            
            // Make sure the header has position relative for the effects
            if (window.getComputedStyle(header).position === 'static') {
                header.style.position = 'relative';
            }
            
            // Apply base styles
            header.style.zIndex = '10';
            header.style.padding = '1.5rem';
            header.style.margin = '1.5rem 0';
            header.style.borderRadius = '12px';
            header.style.overflow = 'hidden';
            header.style.display = 'inline-block';
            
            // Apply theme-specific styles
            if (isLightMode) {
                // Light mode styles
                header.style.color = '#ffffff';
                header.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 30px rgba(93, 214, 255, 1), 0 0 50px rgba(255, 255, 255, 0.9), 0 0 70px rgba(93, 214, 255, 0.8)';
                header.style.webkitTextStroke = '2px rgba(0, 0, 0, 0.8)';
                header.style.fontWeight = '900';
                header.style.letterSpacing = '1.5px';
                header.style.border = '3px solid rgba(255, 255, 255, 0.9)';
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(93, 214, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.4)';
                header.style.filter = 'brightness(1.4) contrast(1.2)';
            } else {
                // Dark mode styles
                header.style.color = '#f0b3ff'; // Ultra bright purple
                header.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 30px rgba(192, 132, 252, 1), 0 0 50px rgba(240, 179, 255, 0.9), 0 0 70px rgba(192, 132, 252, 0.8)';
                header.style.webkitTextStroke = '2px rgba(0, 0, 0, 0.8)';
                header.style.fontWeight = '900';
                header.style.letterSpacing = '1.5px';
                header.style.border = '3px solid rgba(240, 179, 255, 0.9)';
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(240, 179, 255, 0.8), 0 0 40px rgba(192, 132, 252, 0.8), 0 0 80px rgba(240, 179, 255, 0.4)';
                header.style.filter = 'brightness(1.4) contrast(1.2)';
            }
            
            // Add a semi-transparent background overlay
            let backgroundOverlay = header.querySelector('.max-brightness-background');
            if (!backgroundOverlay) {
                backgroundOverlay = document.createElement('div');
                backgroundOverlay.classList.add('max-brightness-background');
                backgroundOverlay.style.position = 'absolute';
                backgroundOverlay.style.top = '0';
                backgroundOverlay.style.left = '0';
                backgroundOverlay.style.width = '100%';
                backgroundOverlay.style.height = '100%';
                backgroundOverlay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))';
                backgroundOverlay.style.zIndex = '-1';
                
                // Add the background overlay
                header.appendChild(backgroundOverlay);
            }
            
            // Add a vibrant animated glow overlay
            let glowOverlay = header.querySelector('.max-brightness-glow');
            if (!glowOverlay) {
                glowOverlay = document.createElement('div');
                glowOverlay.classList.add('max-brightness-glow');
                glowOverlay.style.position = 'absolute';
                glowOverlay.style.top = '0';
                glowOverlay.style.left = '0';
                glowOverlay.style.width = '100%';
                glowOverlay.style.height = '100%';
                glowOverlay.style.background = isLightMode
                    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))'
                    : 'linear-gradient(90deg, rgba(192, 132, 252, 0), rgba(192, 132, 252, 0.2), rgba(192, 132, 252, 0))';
                glowOverlay.style.zIndex = '1';
                
                // Add the glow overlay
                header.appendChild(glowOverlay);
            }
            
            // Create a style element for the animations if it doesn't exist
            if (!document.getElementById('max-brightness-animations')) {
                const style = document.createElement('style');
                style.id = 'max-brightness-animations';
                style.textContent = `
                    @keyframes maxBrightnessPulse {
                        0% {
                            filter: brightness(1.3) contrast(1.1);
                            box-shadow: 
                                0 10px 30px rgba(0, 0, 0, 0.5),
                                0 0 20px ${isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(240, 179, 255, 0.7)'},
                                0 0 40px ${isLightMode ? 'rgba(93, 214, 255, 0.7)' : 'rgba(192, 132, 252, 0.7)'},
                                0 0 60px ${isLightMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(240, 179, 255, 0.3)'};
                        }
                        100% {
                            filter: brightness(1.5) contrast(1.3);
                            box-shadow: 
                                0 10px 30px rgba(0, 0, 0, 0.5),
                                0 0 30px ${isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(240, 179, 255, 0.9)'},
                                0 0 60px ${isLightMode ? 'rgba(93, 214, 255, 0.9)' : 'rgba(192, 132, 252, 0.9)'},
                                0 0 90px ${isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(240, 179, 255, 0.5)'};
                        }
                    }
                    
                    @keyframes maxBrightnessSweep {
                        0% {
                            transform: translateX(-100%);
                            opacity: 0;
                        }
                        50% {
                            opacity: 1;
                        }
                        100% {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Apply the animations
            header.style.animation = 'maxBrightnessPulse 3s infinite alternate';
            glowOverlay.style.animation = 'maxBrightnessSweep 2s infinite';
            
            // Make sure all child elements are on top of the overlays
            const children = header.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child.classList.contains('max-brightness-background') && 
                    !child.classList.contains('max-brightness-glow')) {
                    child.style.position = 'relative';
                    child.style.zIndex = '2';
                }
            }
        });
        
        // Also find any headers that might contain the text but aren't matched by the selectors
        const allHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        allHeaders.forEach(header => {
            const text = header.textContent.trim().toLowerCase();
            
            if (text.includes('learn') && text.includes('explore') && 
                text.includes('llm') && text.includes('fine-tuning') && 
                !header.classList.contains('max-brightness-enhanced')) {
                
                // Add the class to match our selectors
                header.classList.add('learn-explore-llm-fine-tuning-header');
                
                // Call the function again to apply the effects
                applyMaxBrightnessEffects();
            }
        });
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        applyMaxBrightnessEffects();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(applyMaxBrightnessEffects, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(applyMaxBrightnessEffects, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        applyMaxBrightnessEffects();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
