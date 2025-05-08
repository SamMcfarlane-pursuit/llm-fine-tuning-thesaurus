/**
 * Back Button Visibility Fix
 * Ensures that the text in back buttons is clearly visible
 */

(function() {
    // Execute immediately
    console.log('Back Button Visibility Fix: Starting fix');
    
    // Function to fix all back buttons
    function fixBackButtons() {
        try {
            // Find all back buttons
            const backButtonSelectors = [
                'a[href*="back"]',
                'button:contains("Back")',
                'a.btn:contains("Back")',
                '.btn-back',
                '.back-button',
                'a[class*="back"]',
                'button[class*="back"]',
                'a[href*="Back"]',
                'a:contains("Back")',
                'button.back',
                'a.back',
                '[aria-label*="back" i]',
                '[aria-label*="Back" i]',
                'a[href^="#"]:contains("Back")',
                'a[href^="javascript"]:contains("Back")',
                'a[href=""]:contains("Back")',
                'a[href="#"]:contains("Back")'
            ];
            
            // Try to find back buttons
            let backButtons = [];
            backButtonSelectors.forEach(selector => {
                try {
                    // For selectors with :contains, we need to use a different approach
                    if (selector.includes(':contains')) {
                        const parts = selector.split(':contains');
                        const baseSelector = parts[0];
                        const textToFind = parts[1].replace(/[()'"]/g, '').trim();
                        
                        const elements = document.querySelectorAll(baseSelector);
                        elements.forEach(element => {
                            if (element.textContent.includes(textToFind)) {
                                backButtons.push(element);
                            }
                        });
                    } else {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            backButtons = [...backButtons, ...elements];
                        }
                    }
                } catch (error) {
                    console.error(`Back Button Visibility Fix: Error with selector ${selector}:`, error);
                }
            });
            
            // Also find all blue buttons
            const blueButtonSelectors = [
                'a.btn[style*="background-color: blue"]',
                'button.btn[style*="background-color: blue"]',
                'a.btn[style*="background-color: rgb(0, 0, 255)"]',
                'button.btn[style*="background-color: rgb(0, 0, 255)"]',
                'a.btn[style*="background-color: #0000ff"]',
                'button.btn[style*="background-color: #0000ff"]',
                'a.btn[style*="background: blue"]',
                'button.btn[style*="background: blue"]',
                'a.btn[style*="background: rgb(0, 0, 255)"]',
                'button.btn[style*="background: rgb(0, 0, 255)"]',
                'a.btn[style*="background: #0000ff"]',
                'button.btn[style*="background: #0000ff"]'
            ];
            
            blueButtonSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        backButtons = [...backButtons, ...elements];
                    }
                } catch (error) {
                    console.error(`Back Button Visibility Fix: Error with selector ${selector}:`, error);
                }
            });
            
            // Remove duplicates
            backButtons = [...new Set(backButtons)];
            
            if (backButtons.length === 0) {
                console.log('Back Button Visibility Fix: No back buttons found yet, will retry');
                return false;
            }
            
            console.log(`Back Button Visibility Fix: Found ${backButtons.length} back buttons`);
            
            // Fix each back button
            backButtons.forEach((button, index) => {
                try {
                    fixBackButton(button, index);
                } catch (error) {
                    console.error(`Back Button Visibility Fix: Error fixing back button #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Back Button Visibility Fix: Error:', error);
            return false;
        }
    }
    
    // Function to fix a single back button
    function fixBackButton(button, index) {
        // Set background to a more visible gradient
        button.style.background = 'linear-gradient(to right, #0033cc, #0066ff)';
        
        // Add a bright white border
        button.style.border = '2px solid #ffffff';
        
        // Add a strong box shadow
        button.style.boxShadow = '0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)';
        
        // Set text color to bright white
        button.style.color = '#ffffff';
        
        // Add text shadow for better visibility
        button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5)';
        
        // Make text bold
        button.style.fontWeight = '700';
        
        // Increase letter spacing
        button.style.letterSpacing = '0.05em';
        
        // Add a white outline around text
        button.style.webkitTextStroke = '0.5px #ffffff';
        
        // Ensure proper display
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        
        // Add a class for CSS targeting
        button.classList.add('fixed-back-button');
        
        console.log(`Back Button Visibility Fix: Fixed back button #${index}`);
    }
    
    // Try to fix back buttons immediately
    let fixed = fixBackButtons();
    
    // If not fixed, retry a few times
    if (!fixed) {
        let retryCount = 0;
        const maxRetries = 20;
        const retryInterval = 100; // milliseconds
        
        const retryFix = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                fixed = fixBackButtons();
                
                if (!fixed) {
                    setTimeout(retryFix, retryInterval);
                }
            }
        };
        
        setTimeout(retryFix, retryInterval);
    }
    
    // Also fix when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        fixBackButtons();
        
        // Set up mutation observer to fix dynamically added back buttons
        const observer = new MutationObserver(function(mutations) {
            let newButtonFound = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node is a back button
                            if (
                                (node.tagName === 'A' || node.tagName === 'BUTTON') &&
                                (
                                    (node.textContent && node.textContent.includes('Back')) ||
                                    (node.href && node.href.includes('back')) ||
                                    (node.className && node.className.includes('back')) ||
                                    (node.getAttribute('aria-label') && node.getAttribute('aria-label').toLowerCase().includes('back'))
                                )
                            ) {
                                fixBackButton(node, 'dynamic');
                                newButtonFound = true;
                            }
                            
                            // Check for back buttons inside the added node
                            if (node.querySelectorAll) {
                                const backButtonSelectors = [
                                    'a[href*="back"]',
                                    'a.btn:contains("Back")',
                                    '.btn-back',
                                    '.back-button',
                                    'a[class*="back"]',
                                    'button[class*="back"]',
                                    'a[href*="Back"]',
                                    'button.back',
                                    'a.back'
                                ];
                                
                                backButtonSelectors.forEach(selector => {
                                    try {
                                        // For selectors with :contains, we need to use a different approach
                                        if (selector.includes(':contains')) {
                                            const parts = selector.split(':contains');
                                            const baseSelector = parts[0];
                                            const textToFind = parts[1].replace(/[()'"]/g, '').trim();
                                            
                                            const elements = node.querySelectorAll(baseSelector);
                                            elements.forEach(element => {
                                                if (element.textContent.includes(textToFind)) {
                                                    fixBackButton(element, 'dynamic-nested');
                                                    newButtonFound = true;
                                                }
                                            });
                                        } else {
                                            const elements = node.querySelectorAll(selector);
                                            if (elements.length > 0) {
                                                elements.forEach((element, index) => {
                                                    fixBackButton(element, `dynamic-nested-${index}`);
                                                    newButtonFound = true;
                                                });
                                            }
                                        }
                                    } catch (error) {
                                        console.error(`Back Button Visibility Fix: Error with selector ${selector}:`, error);
                                    }
                                });
                            }
                        }
                    });
                }
            });
            
            if (newButtonFound) {
                console.log('Back Button Visibility Fix: Fixed dynamically added back buttons');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
    
    // Also fix when window is loaded (all resources are loaded)
    window.addEventListener('load', function() {
        fixBackButtons();
    });
})();
