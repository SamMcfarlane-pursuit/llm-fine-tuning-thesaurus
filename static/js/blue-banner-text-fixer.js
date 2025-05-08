/**
 * Blue Banner Text Fixer
 * Ensures text in blue banners is visible by dynamically enhancing it
 */

(function() {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlueBannerFixer);
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(initBlueBannerFixer, 0);
    }

    /**
     * Initialize the blue banner fixer
     */
    function initBlueBannerFixer() {
        try {
            console.log('Blue Banner Text Fixer: Initializing');
            
            // Fix all blue banners on the page
            fixAllBlueBanners();
            
            // Set up mutation observer to fix dynamically added blue banners
            setupMutationObserver();
            
            console.log('Blue Banner Text Fixer: Initialization complete');
        } catch (error) {
            console.error('Blue Banner Text Fixer: Initialization error:', error);
        }
    }

    /**
     * Fix all blue banners on the page
     */
    function fixAllBlueBanners() {
        try {
            // Find all blue banners by style attribute
            const blueBannersByStyle = [
                ...document.querySelectorAll('div[style*="background-color: rgb(0, 0, 255)"]'),
                ...document.querySelectorAll('div[style*="background-color: #0000ff"]'),
                ...document.querySelectorAll('div[style*="background-color: blue"]'),
                ...document.querySelectorAll('div[style*="background: rgb(0, 0, 255)"]'),
                ...document.querySelectorAll('div[style*="background: #0000ff"]'),
                ...document.querySelectorAll('div[style*="background: blue"]')
            ];
            
            // Find all blue banners by class
            const blueBannersByClass = [
                ...document.querySelectorAll('.blue-banner'),
                ...document.querySelectorAll('.blue-header'),
                ...document.querySelectorAll('.blue-section')
            ];
            
            // Combine all blue banners
            const blueBanners = [...new Set([...blueBannersByStyle, ...blueBannersByClass])];
            
            if (blueBanners.length === 0) {
                console.log('Blue Banner Text Fixer: No blue banners found');
                return;
            }
            
            console.log(`Blue Banner Text Fixer: Found ${blueBanners.length} blue banners`);
            
            // Fix each blue banner
            blueBanners.forEach((banner, index) => {
                try {
                    fixBlueBanner(banner, index);
                } catch (error) {
                    console.error(`Blue Banner Text Fixer: Error fixing banner #${index}:`, error);
                }
            });
        } catch (error) {
            console.error('Blue Banner Text Fixer: Error fixing banners:', error);
        }
    }

    /**
     * Fix a single blue banner
     * @param {HTMLElement} banner - The blue banner element to fix
     * @param {number} index - Index for logging
     */
    function fixBlueBanner(banner, index) {
        // Add class for styling if not present
        banner.classList.add('enhanced-blue-banner');
        
        // Get the text content
        const textContent = banner.textContent.trim();
        
        // If the banner has no text content, don't do anything
        if (!textContent) {
            return;
        }
        
        // Create a wrapper for the text with enhanced visibility
        const wrapper = document.createElement('div');
        wrapper.className = 'enhanced-text-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '2';
        wrapper.style.color = '#ffffff';
        wrapper.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
        wrapper.style.fontWeight = '800';
        wrapper.style.letterSpacing = '0.05em';
        wrapper.style.fontSize = '1.2em';
        wrapper.style.lineHeight = '1.5';
        wrapper.style.textAlign = 'center';
        
        // Create a span for each word to enhance visibility
        const words = textContent.split(' ');
        words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'enhanced-word';
            wordSpan.textContent = word + ' ';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            wordSpan.style.padding = '2px 6px';
            wordSpan.style.borderRadius = '4px';
            wordSpan.style.margin = '2px';
            wordSpan.style.color = '#ffffff';
            wordSpan.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
            wordSpan.style.fontWeight = '800';
            wordSpan.style.position = 'relative';
            wordSpan.style.zIndex = '2';
            wordSpan.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
            
            wrapper.appendChild(wordSpan);
        });
        
        // Clear the banner and add the enhanced text
        if (banner.childNodes.length === 1 && banner.childNodes[0].nodeType === Node.TEXT_NODE) {
            // If the banner only contains text, replace it with the enhanced text
            banner.textContent = '';
            banner.appendChild(wrapper);
        } else {
            // If the banner contains other elements, don't replace them
            console.log(`Blue Banner Text Fixer: Banner #${index} contains child elements, not replacing`);
            
            // Instead, add a class to ensure CSS fixes apply
            banner.classList.add('complex-blue-banner');
            
            // Apply inline styles to ensure visibility
            banner.style.backgroundColor = 'rgba(0, 80, 255, 0.95)';
            banner.style.color = '#ffffff';
            banner.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
            banner.style.fontWeight = '900';
            banner.style.letterSpacing = '0.05em';
            banner.style.border = '3px solid #ffffff';
            banner.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 80, 255, 0.7)';
        }
        
        console.log(`Blue Banner Text Fixer: Fixed banner #${index}`);
    }

    /**
     * Set up mutation observer to fix dynamically added blue banners
     */
    function setupMutationObserver() {
        // Create a mutation observer to watch for new blue banners
        const observer = new MutationObserver(mutations => {
            let newBannerFound = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is a blue banner
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const style = node.getAttribute('style') || '';
                            const classList = node.classList || [];
                            
                            if (
                                style.includes('background-color: rgb(0, 0, 255)') ||
                                style.includes('background-color: #0000ff') ||
                                style.includes('background-color: blue') ||
                                style.includes('background: rgb(0, 0, 255)') ||
                                style.includes('background: #0000ff') ||
                                style.includes('background: blue') ||
                                classList.contains('blue-banner') ||
                                classList.contains('blue-header') ||
                                classList.contains('blue-section')
                            ) {
                                fixBlueBanner(node, 'dynamic');
                                newBannerFound = true;
                            }
                        }
                        
                        // Check for blue banners inside the added node
                        if (node.querySelectorAll) {
                            const blueBanners = [
                                ...node.querySelectorAll('div[style*="background-color: rgb(0, 0, 255)"]'),
                                ...node.querySelectorAll('div[style*="background-color: #0000ff"]'),
                                ...node.querySelectorAll('div[style*="background-color: blue"]'),
                                ...node.querySelectorAll('div[style*="background: rgb(0, 0, 255)"]'),
                                ...node.querySelectorAll('div[style*="background: #0000ff"]'),
                                ...node.querySelectorAll('div[style*="background: blue"]'),
                                ...node.querySelectorAll('.blue-banner'),
                                ...node.querySelectorAll('.blue-header'),
                                ...node.querySelectorAll('.blue-section')
                            ];
                            
                            if (blueBanners.length > 0) {
                                blueBanners.forEach((banner, index) => {
                                    fixBlueBanner(banner, `dynamic-${index}`);
                                    newBannerFound = true;
                                });
                            }
                        }
                    });
                }
            });
            
            if (newBannerFound) {
                console.log('Blue Banner Text Fixer: Fixed dynamically added banners');
            }
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
