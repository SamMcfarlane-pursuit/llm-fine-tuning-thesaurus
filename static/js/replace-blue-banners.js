/**
 * Replace Blue Banners
 * Replaces all blue banners with server-rendered visible blue banners
 */

(function() {
    // Execute immediately
    console.log('Replace Blue Banners: Starting replacement');
    
    // Function to replace all blue banners
    function replaceBlueBanners() {
        try {
            // Find all blue banners by style attribute
            const blueBannerSelectors = [
                'div[style*="background-color: rgb(0, 0, 255)"]',
                'div[style*="background-color: #0000ff"]',
                'div[style*="background-color: blue"]',
                'div[style*="background: rgb(0, 0, 255)"]',
                'div[style*="background: #0000ff"]',
                'div[style*="background: blue"]',
                '.blue-banner',
                '.blue-header',
                '.blue-section'
            ];
            
            // Try to find blue banners
            let blueBanners = [];
            blueBannerSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    blueBanners = [...blueBanners, ...elements];
                }
            });
            
            if (blueBanners.length === 0) {
                console.log('Replace Blue Banners: No blue banners found yet, will retry');
                return false;
            }
            
            console.log(`Replace Blue Banners: Found ${blueBanners.length} blue banners`);
            
            // Replace each blue banner
            blueBanners.forEach((banner, index) => {
                try {
                    replaceBlueBanner(banner, index);
                } catch (error) {
                    console.error(`Replace Blue Banners: Error replacing banner #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Replace Blue Banners: Error:', error);
            return false;
        }
    }
    
    // Function to replace a single blue banner
    function replaceBlueBanner(banner, index) {
        // Get the text content
        const textContent = banner.textContent.trim();
        
        // If the banner has no text content, don't do anything
        if (!textContent) {
            return;
        }
        
        // Create a new visible blue banner
        const newBanner = document.createElement('div');
        newBanner.className = 'visible-blue-banner';
        newBanner.style.background = 'linear-gradient(to right, #000066, #0033cc)';
        newBanner.style.border = '5px solid #ffffff';
        newBanner.style.boxShadow = '0 0 0 3px #000000, 0 0 25px 8px rgba(0, 0, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)';
        newBanner.style.padding = '25px';
        newBanner.style.margin = '25px 0';
        newBanner.style.borderRadius = '15px';
        newBanner.style.position = 'relative';
        newBanner.style.zIndex = '100';
        newBanner.style.display = 'block';
        newBanner.style.width = 'auto';
        newBanner.style.maxWidth = '100%';
        newBanner.style.textAlign = 'center';
        
        // Create the semi-transparent overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.3)';
        overlay.style.borderRadius = '10px';
        overlay.style.zIndex = '1';
        
        // Create the text container
        const textContainer = document.createElement('div');
        textContainer.className = 'banner-text-container';
        textContainer.style.position = 'relative';
        textContainer.style.zIndex = '2';
        textContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        textContainer.style.padding = '10px 15px';
        textContainer.style.borderRadius = '8px';
        textContainer.style.border = '2px solid rgba(255, 255, 255, 0.7)';
        textContainer.style.margin = '5px auto';
        textContainer.style.width = 'fit-content';
        textContainer.style.maxWidth = '90%';
        textContainer.style.display = 'block';
        textContainer.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
        
        // Split the text into words and create a span for each word
        const words = textContent.split(' ');
        words.forEach(word => {
            if (!word.trim()) return;
            
            const wordSpan = document.createElement('span');
            wordSpan.className = 'banner-word';
            wordSpan.textContent = word;
            wordSpan.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            wordSpan.style.padding = '5px 10px';
            wordSpan.style.borderRadius = '5px';
            wordSpan.style.margin = '3px';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            wordSpan.style.color = '#ffffff';
            wordSpan.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.9)';
            wordSpan.style.fontWeight = '900';
            wordSpan.style.letterSpacing = '0.05em';
            
            textContainer.appendChild(wordSpan);
            
            // Add a space after each word
            const space = document.createTextNode(' ');
            textContainer.appendChild(space);
        });
        
        // Add the elements to the new banner
        newBanner.appendChild(overlay);
        newBanner.appendChild(textContainer);
        
        // Replace the old banner with the new one
        banner.parentNode.replaceChild(newBanner, banner);
        
        console.log(`Replace Blue Banners: Replaced banner #${index}`);
    }
    
    // Try to replace blue banners immediately
    let replaced = replaceBlueBanners();
    
    // If not replaced, retry a few times
    if (!replaced) {
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = 100; // milliseconds
        
        const retryReplace = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                replaced = replaceBlueBanners();
                
                if (!replaced) {
                    setTimeout(retryReplace, retryInterval);
                }
            }
        };
        
        setTimeout(retryReplace, retryInterval);
    }
    
    // Also replace when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        replaceBlueBanners();
        
        // Set up mutation observer to replace dynamically added blue banners
        const observer = new MutationObserver(function(mutations) {
            let newBannerFound = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const style = node.getAttribute('style') || '';
                            
                            if (
                                style.includes('background-color: rgb(0, 0, 255)') ||
                                style.includes('background-color: #0000ff') ||
                                style.includes('background-color: blue') ||
                                style.includes('background: rgb(0, 0, 255)') ||
                                style.includes('background: #0000ff') ||
                                style.includes('background: blue') ||
                                node.classList.contains('blue-banner') ||
                                node.classList.contains('blue-header') ||
                                node.classList.contains('blue-section')
                            ) {
                                replaceBlueBanner(node, 'dynamic');
                                newBannerFound = true;
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
                                        replaceBlueBanner(banner, `dynamic-${index}`);
                                        newBannerFound = true;
                                    });
                                }
                            }
                        }
                    });
                }
            });
            
            if (newBannerFound) {
                console.log('Replace Blue Banners: Replaced dynamically added banners');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
    
    // Also replace when window is loaded (all resources are loaded)
    window.addEventListener('load', function() {
        replaceBlueBanners();
    });
})();
