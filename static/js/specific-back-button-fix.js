/**
 * Specific Back Button Fix
 * Directly targets and fixes the specific back button in the image
 */

(function() {
    // Execute immediately
    console.log('Specific Back Button Fix: Starting fix');
    
    // Function to fix the specific back button
    function fixSpecificBackButton() {
        try {
            // Find the specific back button in the image
            const specificBackButtonSelectors = [
                'a.btn.btn-primary:contains("Back")',
                'button.btn.btn-primary:contains("Back")',
                'a.btn-primary:contains("Back")',
                'button.btn-primary:contains("Back")',
                'a[class*="btn"][class*="primary"]:contains("Back")',
                'button[class*="btn"][class*="primary"]:contains("Back")',
                'a.btn[style*="background-color: blue"]:contains("Back")',
                'button.btn[style*="background-color: blue"]:contains("Back")',
                'a.btn[style*="background-color: rgb(0, 0, 255)"]:contains("Back")',
                'button.btn[style*="background-color: rgb(0, 0, 255)"]:contains("Back")',
                'a.btn[style*="background-color: #0000ff"]:contains("Back")',
                'button.btn[style*="background-color: #0000ff"]:contains("Back")',
                'a.btn[style*="background: blue"]:contains("Back")',
                'button.btn[style*="background: blue"]:contains("Back")',
                'a.btn[style*="background: rgb(0, 0, 255)"]:contains("Back")',
                'button.btn[style*="background: rgb(0, 0, 255)"]:contains("Back")',
                'a.btn[style*="background: #0000ff"]:contains("Back")',
                'button.btn[style*="background: #0000ff"]:contains("Back")'
            ];
            
            // Try to find the specific back button
            let specificBackButtons = [];
            specificBackButtonSelectors.forEach(selector => {
                try {
                    // For selectors with :contains, we need to use a different approach
                    if (selector.includes(':contains')) {
                        const parts = selector.split(':contains');
                        const baseSelector = parts[0];
                        const textToFind = parts[1].replace(/[()'"]/g, '').trim();
                        
                        const elements = document.querySelectorAll(baseSelector);
                        elements.forEach(element => {
                            if (element.textContent.includes(textToFind)) {
                                specificBackButtons.push(element);
                            }
                        });
                    } else {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            specificBackButtons = [...specificBackButtons, ...elements];
                        }
                    }
                } catch (error) {
                    console.error(`Specific Back Button Fix: Error with selector ${selector}:`, error);
                }
            });
            
            // Remove duplicates
            specificBackButtons = [...new Set(specificBackButtons)];
            
            if (specificBackButtons.length === 0) {
                console.log('Specific Back Button Fix: No specific back buttons found yet, will retry');
                return false;
            }
            
            console.log(`Specific Back Button Fix: Found ${specificBackButtons.length} specific back buttons`);
            
            // Fix each specific back button
            specificBackButtons.forEach((button, index) => {
                try {
                    fixButton(button, index);
                } catch (error) {
                    console.error(`Specific Back Button Fix: Error fixing specific back button #${index}:`, error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Specific Back Button Fix: Error:', error);
            return false;
        }
    }
    
    // Function to fix a single button
    function fixButton(button, index) {
        // Apply inline styles with !important to override any existing styles
        button.setAttribute('style', `
            background: linear-gradient(to right, #0033cc, #0066ff) !important;
            border: 2px solid #ffffff !important;
            box-shadow: 0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3) !important;
            color: #ffffff !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5) !important;
            font-weight: 700 !important;
            letter-spacing: 0.05em !important;
            -webkit-text-stroke: 0.5px #ffffff !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 10px 20px !important;
            border-radius: 5px !important;
            text-decoration: none !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        `);
        
        // Add a class for CSS targeting
        button.classList.add('fixed-specific-back-button');
        
        // Create a wrapper for the text to add additional styling
        const textContent = button.textContent.trim();
        
        // Clear the button content
        button.innerHTML = '';
        
        // Create a span for the text
        const textSpan = document.createElement('span');
        textSpan.textContent = textContent;
        textSpan.style.color = '#ffffff';
        textSpan.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5)';
        textSpan.style.fontWeight = '700';
        textSpan.style.letterSpacing = '0.05em';
        textSpan.style.webkitTextStroke = '0.5px #ffffff';
        
        // Add the text span to the button
        button.appendChild(textSpan);
        
        console.log(`Specific Back Button Fix: Fixed specific back button #${index}`);
    }
    
    // Try to fix the specific back button immediately
    let fixed = fixSpecificBackButton();
    
    // If not fixed, retry a few times
    if (!fixed) {
        let retryCount = 0;
        const maxRetries = 20;
        const retryInterval = 100; // milliseconds
        
        const retryFix = function() {
            if (retryCount < maxRetries) {
                retryCount++;
                fixed = fixSpecificBackButton();
                
                if (!fixed) {
                    setTimeout(retryFix, retryInterval);
                }
            }
        };
        
        setTimeout(retryFix, retryInterval);
    }
    
    // Also fix when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        fixSpecificBackButton();
    });
    
    // Also fix when window is loaded (all resources are loaded)
    window.addEventListener('load', function() {
        fixSpecificBackButton();
    });
})();
