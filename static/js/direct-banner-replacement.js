/**
 * Direct Banner Replacement
 * Directly replaces specific blue banners with high-visibility versions
 */

(function() {
    // Execute immediately
    console.log('Direct Banner Replacement: Starting replacement');
    
    // Function to create a high-visibility banner
    function createHighVisibilityBanner(text) {
        // Create the main container
        const banner = document.createElement('div');
        banner.className = 'high-visibility-banner';
        banner.style.background = 'linear-gradient(to right, #000066, #0033cc)';
        banner.style.border = '5px solid #ffffff';
        banner.style.boxShadow = '0 0 0 3px #000000, 0 0 25px 8px rgba(0, 0, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)';
        banner.style.padding = '25px';
        banner.style.margin = '25px 0';
        banner.style.borderRadius = '15px';
        banner.style.position = 'relative';
        banner.style.zIndex = '100';
        banner.style.display = 'block';
        banner.style.width = 'auto';
        banner.style.maxWidth = '100%';
        banner.style.textAlign = 'center';
        
        // Create the overlay
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
        const words = text.split(' ');
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
            wordSpan.style.fontSize = '1.2em';
            
            textContainer.appendChild(wordSpan);
            
            // Add a space after each word
            const space = document.createTextNode(' ');
            textContainer.appendChild(space);
        });
        
        // Add the elements to the banner
        banner.appendChild(overlay);
        banner.appendChild(textContainer);
        
        return banner;
    }
    
    // Function to replace specific blue banners
    function replaceSpecificBlueBanners() {
        try {
            // Target the specific blue banners in the images
            const specificBannerSelectors = [
                'div[style*="background-color: blue"]',
                'div[style*="background-color: rgb(0, 0, 255)"]',
                'div[style*="background-color: #0000ff"]',
                'div[style*="background: blue"]',
                'div[style*="background: rgb(0, 0, 255)"]',
                'div[style*="background: #0000ff"]'
            ];
            
            // Find all matching banners
            let specificBanners = [];
            specificBannerSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    specificBanners = [...specificBanners, ...elements];
                }
            });
            
            if (specificBanners.length === 0) {
                console.log('Direct Banner Replacement: No specific banners found yet, will retry');
                return false;
            }
            
            console.log(`Direct Banner Replacement: Found ${specificBanners.length} specific banners`);
            
            // Replace each specific banner
            specificBanners.forEach((banner, index) => {
                try {
                    // Get the text content
                    const textContent = banner.textContent.trim();
                    
                    // If the banner has no text content, don't do anything
                    if (!textContent) {
                        return;
                    }
                    
                    // Create a high-visibility banner
                    const highVisibilityBanner = createHighVisibilityBanner(textContent);
                    
                    // Replace the old banner with the new one
                    banner.parentNode.replaceChild(highVisibilityBanner, banner);
                    
                    console.log(`Direct Banner Replacement: Replaced specific banner #${index}`);
                } catch (error) {
                    console.error(`Direct Banner Replacement: Error replacing specific banner #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Direct Banner Replacement: Error:', error);
            return false;
        }
    }
    
    // Try to replace specific blue banners immediately
    let replaced = replaceSpecificBlueBanners();
    
    // If not replaced, retry a few times
    if (!replaced) {
        let retryCount = 0;
        const maxRetries = 20;
        const retryInterval = 100; // milliseconds
        
        const retryReplace = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                replaced = replaceSpecificBlueBanners();
                
                if (!replaced) {
                    setTimeout(retryReplace, retryInterval);
                }
            }
        };
        
        setTimeout(retryReplace, retryInterval);
    }
    
    // Also replace when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        replaceSpecificBlueBanners();
    });
    
    // Also replace when window is loaded (all resources are loaded)
    window.addEventListener('load', function() {
        replaceSpecificBlueBanners();
    });
})();
