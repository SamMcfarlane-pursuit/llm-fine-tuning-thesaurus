/**
 * Absolute Banner Visibility Fix
 * Ensures 100% visibility of text in blue banners by completely restructuring the DOM
 */

// Execute immediately without waiting for DOMContentLoaded
(function() {
    console.log('Absolute Banner Visibility Fix: Starting immediate fix');
    
    // Function to fix all blue banners
    function absoluteFixBlueBanners() {
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
                console.log('Absolute Banner Visibility Fix: No blue banners found yet, will retry');
                return false;
            }
            
            console.log(`Absolute Banner Visibility Fix: Found ${blueBanners.length} blue banners`);
            
            // Apply absolute fix to each blue banner
            blueBanners.forEach((banner, index) => {
                try {
                    applyAbsoluteFix(banner, index);
                } catch (error) {
                    console.error(`Absolute Banner Visibility Fix: Error fixing banner #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Absolute Banner Visibility Fix: Error:', error);
            return false;
        }
    }
    
    // Function to apply absolute fix to a blue banner
    function applyAbsoluteFix(banner, index) {
        // Save the original text content
        const originalText = banner.textContent.trim();
        
        // If the banner has no text content, don't do anything
        if (!originalText) {
            return;
        }
        
        // Save the original HTML content
        const originalHTML = banner.innerHTML;
        
        // Create a completely new structure for the banner
        try {
            // Set the banner background
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
            
            // Add a class for CSS targeting
            banner.classList.add('absolute-fixed-banner');
            
            // Create a semi-transparent overlay for better contrast
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0, 0, 0, 0.3)';
            overlay.style.borderRadius = '10px';
            overlay.style.zIndex = '1';
            
            // Create a container for the text
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
            const words = originalText.split(' ');
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
                
                textContainer.appendChild(wordSpan);
                
                // Add a space after each word
                const space = document.createTextNode(' ');
                textContainer.appendChild(space);
            });
            
            // Clear the banner and add the new elements
            banner.innerHTML = '';
            banner.appendChild(overlay);
            banner.appendChild(textContainer);
            
            // Add a data attribute with the original text for reference
            banner.setAttribute('data-original-text', originalText);
            
            // Add a data attribute with the original HTML for reference
            banner.setAttribute('data-original-html', originalHTML);
            
            console.log(`Absolute Banner Visibility Fix: Fixed banner #${index}`);
        } catch (error) {
            console.error(`Absolute Banner Visibility Fix: Error restructuring banner #${index}:`, error);
            
            // Fallback to a simpler approach if the restructuring fails
            try {
                // Apply basic styles to ensure visibility
                banner.style.background = 'linear-gradient(to right, #000066, #0033cc)';
                banner.style.border = '5px solid #ffffff';
                banner.style.color = '#ffffff';
                banner.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.9)';
                banner.style.fontWeight = '900';
                banner.style.fontSize = '1.3em';
                banner.style.padding = '20px';
                banner.style.borderRadius = '10px';
                banner.style.textAlign = 'center';
                
                // Add a class for CSS targeting
                banner.classList.add('fallback-fixed-banner');
                
                console.log(`Absolute Banner Visibility Fix: Applied fallback fix to banner #${index}`);
            } catch (fallbackError) {
                console.error(`Absolute Banner Visibility Fix: Fallback fix also failed for banner #${index}:`, fallbackError);
            }
        }
    }
    
    // Try to fix blue banners immediately
    let fixed = absoluteFixBlueBanners();
    
    // If not fixed, retry a few times
    if (!fixed) {
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = 100; // milliseconds
        
        const retryFix = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                fixed = absoluteFixBlueBanners();
                
                if (!fixed) {
                    setTimeout(retryFix, retryInterval);
                }
            }
        };
        
        setTimeout(retryFix, retryInterval);
    }
    
    // Also fix when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        absoluteFixBlueBanners();
        
        // Set up mutation observer to fix dynamically added blue banners
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
                                applyAbsoluteFix(node, 'dynamic');
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
                                        applyAbsoluteFix(banner, `dynamic-${index}`);
                                        newBannerFound = true;
                                    });
                                }
                            }
                        }
                    });
                }
            });
            
            if (newBannerFound) {
                console.log('Absolute Banner Visibility Fix: Fixed dynamically added banners');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
    
    // Also fix when window is loaded (all resources are loaded)
    window.addEventListener('load', function() {
        absoluteFixBlueBanners();
    });
})();
