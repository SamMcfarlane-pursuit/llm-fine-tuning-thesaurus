/**
 * Pros and Cons Text Fix
 * Fixes the blue background in pros and cons sections
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix pros and cons text
    fixProsConsText();
    
    // Set up a mutation observer to fix pros and cons text that are added dynamically
    observeDynamicProsConsText();
});

/**
 * Fixes the blue background in pros and cons sections
 */
function fixProsConsText() {
    // Find all pros and cons sections
    const prosSections = document.querySelectorAll('.pros, .pros-list, .advantages');
    const consSections = document.querySelectorAll('.cons, .cons-list, .disadvantages');
    
    // Fix pros sections
    prosSections.forEach(section => {
        fixSectionText(section);
    });
    
    // Fix cons sections
    consSections.forEach(section => {
        fixSectionText(section);
    });
}

/**
 * Fixes the text in a section
 * @param {HTMLElement} section - The section to fix
 */
function fixSectionText(section) {
    // Find all list items in the section
    const listItems = section.querySelectorAll('li');
    
    // Fix each list item
    listItems.forEach(item => {
        // Find all spans with background color
        const spans = item.querySelectorAll('span[style*="background"]');
        
        // Remove background color from spans
        spans.forEach(span => {
            span.style.backgroundColor = 'transparent';
            span.style.color = '#ffffff';
            span.style.padding = '0';
            span.style.display = 'inline';
            span.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
        });
        
        // Fix the text color of the list item
        item.style.color = '#ffffff';
        item.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
    });
}

/**
 * Sets up a mutation observer to fix pros and cons text that are added dynamically
 */
function observeDynamicProsConsText() {
    // Create an observer instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if nodes were added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(function(node) {
                    // If the added node is a pros or cons section, fix it
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.classList && (
                            node.classList.contains('pros') || 
                            node.classList.contains('pros-list') || 
                            node.classList.contains('advantages') || 
                            node.classList.contains('cons') || 
                            node.classList.contains('cons-list') || 
                            node.classList.contains('disadvantages')
                        )) {
                            fixSectionText(node);
                        }
                        
                        // If the added node contains pros or cons sections, fix them
                        const prosSections = node.querySelectorAll('.pros, .pros-list, .advantages');
                        const consSections = node.querySelectorAll('.cons, .cons-list, .disadvantages');
                        
                        prosSections.forEach(section => {
                            fixSectionText(section);
                        });
                        
                        consSections.forEach(section => {
                            fixSectionText(section);
                        });
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
}
