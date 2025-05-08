/**
 * Emergency Blue Banner Fix
 * Immediately fixes blue banner text visibility as soon as possible
 */

// Execute immediately without waiting for DOMContentLoaded
(function() {
    console.log('Emergency Blue Banner Fix: Starting immediate fix');
    
    // Function to fix blue banners
    function emergencyFixBlueBanners() {
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
                console.log('Emergency Blue Banner Fix: No blue banners found yet, will retry');
                return false;
            }
            
            console.log(`Emergency Blue Banner Fix: Found ${blueBanners.length} blue banners`);
            
            // Apply emergency fix to each blue banner
            blueBanners.forEach((banner, index) => {
                try {
                    applyEmergencyFix(banner, index);
                } catch (error) {
                    console.error(`Emergency Blue Banner Fix: Error fixing banner #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Emergency Blue Banner Fix: Error:', error);
            return false;
        }
    }
    
    // Function to apply emergency fix to a blue banner
    function applyEmergencyFix(banner, index) {
        // Add emergency class
        banner.classList.add('emergency-fixed-banner');
        
        // Apply inline styles for maximum visibility
        banner.style.background = 'linear-gradient(to right, #0033cc, #0066ff)';
        banner.style.border = '3px solid #ffffff';
        banner.style.boxShadow = '0 0 10px 5px rgba(0, 102, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)';
        banner.style.color = '#ffffff';
        banner.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
        banner.style.fontWeight = '900';
        banner.style.letterSpacing = '0.08em';
        banner.style.fontSize = '1.4em';
        banner.style.lineHeight = '1.8';
        banner.style.textAlign = 'center';
        banner.style.padding = '25px';
        banner.style.margin = '15px 0';
        banner.style.borderRadius = '10px';
        banner.style.display = 'block';
        banner.style.width = 'auto';
        banner.style.maxWidth = '100%';
        banner.style.position = 'relative';
        banner.style.zIndex = '10';
        
        // Get the text content
        const textContent = banner.textContent.trim();
        
        // If the banner has no text content, don't do anything more
        if (!textContent) {
            return;
        }
        
        // If the banner only contains text (no child elements), replace it with enhanced text
        if (banner.childNodes.length === 1 && banner.childNodes[0].nodeType === Node.TEXT_NODE) {
            // Save the original text
            const originalText = banner.textContent;
            
            // Clear the banner
            banner.textContent = '';
            
            // Create a wrapper for the text
            const wrapper = document.createElement('div');
            wrapper.className = 'emergency-text-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.zIndex = '11';
            
            // Create a span for each word to enhance visibility
            const words = originalText.split(' ');
            words.forEach(word => {
                if (!word.trim()) return;
                
                const wordSpan = document.createElement('span');
                wordSpan.className = 'emergency-visible-text';
                wordSpan.textContent = word;
                wordSpan.style.color = '#ffffff';
                wordSpan.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
                wordSpan.style.fontWeight = '900';
                wordSpan.style.letterSpacing = '0.08em';
                wordSpan.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                wordSpan.style.padding = '5px 10px';
                wordSpan.style.borderRadius = '5px';
                wordSpan.style.margin = '5px';
                wordSpan.style.display = 'inline-block';
                
                wrapper.appendChild(wordSpan);
                
                // Add a space after each word
                const space = document.createTextNode(' ');
                wrapper.appendChild(space);
            });
            
            // Add the wrapper to the banner
            banner.appendChild(wrapper);
        } else {
            // If the banner contains other elements, apply styles to all text nodes
            const textNodes = [];
            
            // Function to find all text nodes
            function findTextNodes(node) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    textNodes.push(node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        findTextNodes(node.childNodes[i]);
                    }
                }
            }
            
            // Find all text nodes in the banner
            findTextNodes(banner);
            
            // Replace each text node with enhanced text
            textNodes.forEach(textNode => {
                const text = textNode.textContent.trim();
                if (!text) return;
                
                // Create a wrapper span
                const wrapper = document.createElement('span');
                wrapper.className = 'emergency-visible-text';
                wrapper.textContent = text;
                wrapper.style.color = '#ffffff';
                wrapper.style.textShadow = '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff, 0 2px 4px rgba(0, 0, 0, 0.8)';
                wrapper.style.fontWeight = '900';
                wrapper.style.letterSpacing = '0.08em';
                wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                wrapper.style.padding = '5px 10px';
                wrapper.style.borderRadius = '5px';
                wrapper.style.margin = '5px';
                wrapper.style.display = 'inline-block';
                
                // Replace the text node with the wrapper
                textNode.parentNode.replaceChild(wrapper, textNode);
            });
        }
        
        console.log(`Emergency Blue Banner Fix: Fixed banner #${index}`);
    }
    
    // Try to fix blue banners immediately
    let fixed = emergencyFixBlueBanners();
    
    // If not fixed, retry a few times
    if (!fixed) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryInterval = 100; // milliseconds
        
        const retryFix = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                fixed = emergencyFixBlueBanners();
                
                if (!fixed) {
                    setTimeout(retryFix, retryInterval);
                }
            }
        };
        
        setTimeout(retryFix, retryInterval);
    }
    
    // Also fix when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        emergencyFixBlueBanners();
        
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
                                applyEmergencyFix(node, 'dynamic');
                                newBannerFound = true;
                            }
                        }
                    });
                }
            });
            
            if (newBannerFound) {
                console.log('Emergency Blue Banner Fix: Fixed dynamically added banners');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();
