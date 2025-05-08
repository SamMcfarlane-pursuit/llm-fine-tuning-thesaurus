/**
 * Section Header Enhancer
 * Dynamically enhances section headers for better visibility and contrast
 */

(function() {
    // Function to enhance section headers
    function enhanceSectionHeaders() {
        console.log('Enhancing section headers for better visibility...');
        
        // Find all potential section headers
        const headings = document.querySelectorAll('h1, h2, h3');
        
        headings.forEach(heading => {
            const text = heading.textContent.trim().toLowerCase();
            
            // Skip if already enhanced
            if (heading.classList.contains('header-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            heading.classList.add('header-enhanced');
            
            // Check for specific text patterns
            if (text.includes('learn') || 
                text.includes('explore') || 
                text.includes('llm') || 
                text.includes('fine-tuning') || 
                text.includes('thesaurus') || 
                text.includes('visual') || 
                text.includes('workshop') || 
                text.includes('guide') || 
                text.includes('framework') || 
                text.includes('quiz') || 
                text.includes('exercise') || 
                text.includes('tutorial') || 
                text.includes('lesson') || 
                text.includes('module') || 
                text.includes('chapter') || 
                text.includes('topic') || 
                text.includes('concept') || 
                text.includes('category')) {
                
                // Add appropriate classes
                heading.classList.add('section-title');
                
                // Add specific classes based on content
                if (text.includes('learn') && text.includes('explore')) {
                    heading.classList.add('learn-explore-header');
                }
                
                if (text.includes('llm') && text.includes('fine-tuning')) {
                    heading.classList.add('llm-fine-tuning-header');
                }
                
                if (text.includes('learn') && text.includes('explore') && 
                    text.includes('llm') && text.includes('fine-tuning')) {
                    heading.classList.add('learn-explore-llm-fine-tuning-header');
                    
                    // Create a background overlay for maximum contrast
                    const overlay = document.createElement('div');
                    overlay.classList.add('header-contrast-overlay');
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.background = 'linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))';
                    overlay.style.borderRadius = '8px';
                    overlay.style.zIndex = '-1';
                    
                    // Make the heading position relative if it's not already
                    if (window.getComputedStyle(heading).position === 'static') {
                        heading.style.position = 'relative';
                    }
                    
                    // Add the overlay as the first child
                    if (heading.firstChild) {
                        heading.insertBefore(overlay, heading.firstChild);
                    } else {
                        heading.appendChild(overlay);
                    }
                    
                    // Apply enhanced text styles
                    heading.style.color = '#ffffff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)';
                    heading.style.fontWeight = '900';
                    heading.style.letterSpacing = '0.8px';
                    heading.style.webkitTextStroke = '1.5px rgba(0, 0, 0, 0.6)';
                    heading.style.padding = '1.5rem';
                    heading.style.margin = '1.5rem 0';
                    heading.style.display = 'inline-block';
                    heading.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
                    heading.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    heading.style.zIndex = '2';
                    
                    // Apply different styles for dark mode
                    if (!document.body.classList.contains('light-theme')) {
                        heading.style.color = '#e9d5ff';
                        heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(192, 132, 252, 0.8)';
                        heading.style.webkitTextStroke = '1px rgba(255, 255, 255, 0.3)';
                    }
                }
            }
        });
        
        // Find all elements that might be section headers based on their class names
        const potentialHeaders = document.querySelectorAll(
            '.section-header, .page-header, .content-header, .main-header, ' +
            '.feature-header, .hero-title, .section-title, .page-title, ' +
            '.content-title, .main-title, .feature-title, .learn-header, ' +
            '.explore-header, .llm-header, .fine-tuning-header, .thesaurus-header, ' +
            '.visual-header, .workshop-header, .guide-header, .framework-header, ' +
            '.quiz-header, .exercise-header, .tutorial-header, .lesson-header, ' +
            '.module-header, .chapter-header, .topic-header, .concept-header, ' +
            '.category-header'
        );
        
        potentialHeaders.forEach(header => {
            // Skip if already enhanced
            if (header.classList.contains('header-enhanced')) {
                return;
            }
            
            // Mark as enhanced
            header.classList.add('header-enhanced');
            
            // Create a background overlay for better contrast
            const overlay = document.createElement('div');
            overlay.classList.add('header-contrast-overlay');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3))';
            overlay.style.borderRadius = '8px';
            overlay.style.zIndex = '1';
            
            // Make the header position relative if it's not already
            if (window.getComputedStyle(header).position === 'static') {
                header.style.position = 'relative';
            }
            
            // Add the overlay as the first child
            if (header.firstChild) {
                header.insertBefore(overlay, header.firstChild);
            } else {
                header.appendChild(overlay);
            }
            
            // Find all headings within this header
            const headingsInHeader = header.querySelectorAll('h1, h2, h3, h4, h5, h6');
            
            headingsInHeader.forEach(heading => {
                // Apply enhanced text styles
                heading.style.color = '#ffffff';
                heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.5)';
                heading.style.fontWeight = '700';
                heading.style.letterSpacing = '0.5px';
                heading.style.position = 'relative';
                heading.style.zIndex = '2';
                heading.style.webkitTextStroke = '0.5px rgba(0, 0, 0, 0.3)';
                
                // Apply different styles for dark mode
                if (!document.body.classList.contains('light-theme')) {
                    heading.style.color = '#e9d5ff';
                    heading.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 15px rgba(192, 132, 252, 0.7)';
                    heading.style.webkitTextStroke = '0.5px rgba(255, 255, 255, 0.3)';
                }
            });
        });
    }
    
    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        enhanceSectionHeaders();
        
        // Also run when theme changes
        const themeToggleButton = document.getElementById('themeToggleButton');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', function() {
                // Wait for theme change to complete
                setTimeout(enhanceSectionHeaders, 100);
            });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(enhanceSectionHeaders, 2000);
    });
    
    // Run when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        enhanceSectionHeaders();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
})();
