/**
 * Learn & Explore Header Fix
 * Direct DOM manipulation to fix the "Learn & Explore LLM Fine-Tuning" header
 */

(function() {
    // Function to fix the specific header
    function fixLearnExploreHeader() {
        console.log('Fixing Learn & Explore LLM Fine-Tuning header...');
        
        // Find all headings that contain the text "Learn & Explore LLM Fine-Tuning"
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, .page-title, .header-title');
        
        headings.forEach(heading => {
            const text = heading.textContent.trim();
            
            // Skip if already fixed
            if (heading.classList.contains('learn-explore-fixed')) {
                return;
            }
            
            // Check if this is the specific header we're looking for
            if (text.includes('Learn & Explore LLM Fine-Tuning') || 
                (text.includes('Learn') && text.includes('Explore') && text.includes('LLM') && text.includes('Fine-Tuning'))) {
                
                console.log('Found Learn & Explore LLM Fine-Tuning header:', heading);
                
                // Mark as fixed
                heading.classList.add('learn-explore-fixed');
                heading.classList.add('learn-explore-llm-fine-tuning-header');
                
                // Get the computed style of the heading
                const computedStyle = window.getComputedStyle(heading);
                const backgroundColor = computedStyle.backgroundColor;
                
                // Check if the background is blue (similar to the image)
                const isBlueBackground = 
                    backgroundColor.includes('rgb(0, 123, 255)') || 
                    backgroundColor.includes('rgb(0,123,255)') ||
                    backgroundColor.includes('#007bff') ||
                    backgroundColor.includes('rgba(0, 123, 255') ||
                    backgroundColor.includes('rgba(0,123,255') ||
                    (
                        backgroundColor.includes('rgb') && 
                        backgroundColor.includes('0') && 
                        backgroundColor.includes('123') && 
                        backgroundColor.includes('255')
                    );
                
                // Apply direct inline styles for maximum visibility
                heading.style.position = 'relative';
                heading.style.display = 'inline-block';
                heading.style.padding = '1.5rem';
                heading.style.margin = '1.5rem 0';
                heading.style.borderRadius = '8px';
                heading.style.overflow = 'hidden';
                heading.style.zIndex = '2';
                
                // Apply different styles based on the background
                if (isBlueBackground) {
                    // For blue background (like in the image)
                    heading.style.color = '#ffffff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)';
                    heading.style.fontWeight = '900';
                    heading.style.letterSpacing = '0.8px';
                    heading.style.webkitTextStroke = '1.5px rgba(0, 0, 0, 0.6)';
                    
                    // Create a semi-transparent overlay
                    const overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.background = 'linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))';
                    overlay.style.zIndex = '-1';
                    
                    // Add the overlay as the first child
                    if (heading.firstChild) {
                        heading.insertBefore(overlay, heading.firstChild);
                    } else {
                        heading.appendChild(overlay);
                    }
                    
                    // Add a border for better definition
                    heading.style.border = '2px solid rgba(255, 255, 255, 0.4)';
                    
                    // Add a box shadow for depth
                    heading.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.1)';
                } else {
                    // For other backgrounds
                    heading.style.color = '#ffffff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)';
                    heading.style.fontWeight = '900';
                    heading.style.letterSpacing = '0.8px';
                    heading.style.webkitTextStroke = '1.5px rgba(0, 0, 0, 0.6)';
                    
                    // Create a semi-transparent background
                    heading.style.background = 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))';
                    
                    // Add a border for better definition
                    heading.style.border = '2px solid rgba(255, 255, 255, 0.4)';
                    
                    // Add a box shadow for depth
                    heading.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.1)';
                }
                
                // Apply different styles for dark mode
                if (document.body.classList.contains('light-theme')) {
                    // Light mode
                    heading.style.color = '#ffffff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)';
                    heading.style.webkitTextStroke = '1.5px rgba(0, 0, 0, 0.6)';
                } else {
                    // Dark mode
                    heading.style.color = '#e9d5ff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(192, 132, 252, 0.8)';
                    heading.style.webkitTextStroke = '1px rgba(255, 255, 255, 0.3)';
                    
                    if (isBlueBackground) {
                        const overlay = heading.firstChild;
                        if (overlay && overlay.nodeType === Node.ELEMENT_NODE) {
                            overlay.style.background = 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))';
                        }
                    } else {
                        heading.style.background = 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))';
                    }
                    
                    heading.style.border = '2px solid rgba(192, 132, 252, 0.4)';
                    heading.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(192, 132, 252, 0.2)';
                }
                
                // Add a glow effect
                const glow = document.createElement('div');
                glow.style.position = 'absolute';
                glow.style.top = '0';
                glow.style.left = '0';
                glow.style.width = '100%';
                glow.style.height = '100%';
                glow.style.background = document.body.classList.contains('light-theme')
                    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))'
                    : 'linear-gradient(90deg, rgba(192, 132, 252, 0), rgba(192, 132, 252, 0.1), rgba(192, 132, 252, 0))';
                glow.style.zIndex = '1';
                glow.style.animation = 'header-glow 3s infinite alternate';
                
                // Add the glow effect
                heading.appendChild(glow);
                
                // Create a style element for the animation if it doesn't exist
                if (!document.getElementById('header-glow-animation')) {
                    const style = document.createElement('style');
                    style.id = 'header-glow-animation';
                    style.textContent = `
                        @keyframes header-glow {
                            0% {
                                opacity: 0.3;
                                transform: translateX(-100%);
                            }
                            100% {
                                opacity: 0.7;
                                transform: translateX(100%);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        });
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        fixLearnExploreHeader();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(fixLearnExploreHeader, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(fixLearnExploreHeader, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        fixLearnExploreHeader();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
