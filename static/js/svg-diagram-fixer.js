/**
 * SVG Diagram Fixer
 * Detects and fixes common issues with SVG diagrams to prevent glitching
 */

(function() {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSvgFixer);
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(initSvgFixer, 0);
    }

    /**
     * Initialize the SVG fixer
     */
    function initSvgFixer() {
        try {
            console.log('SVG Diagram Fixer: Initializing');
            
            // Fix all SVG diagrams on the page
            fixAllSvgDiagrams();
            
            // Set up mutation observer to fix dynamically added SVGs
            setupMutationObserver();
            
            // Add window resize handler to ensure SVGs remain responsive
            setupResizeHandler();
            
            console.log('SVG Diagram Fixer: Initialization complete');
        } catch (error) {
            console.error('SVG Diagram Fixer: Initialization error:', error);
        }
    }

    /**
     * Fix all SVG diagrams on the page
     */
    function fixAllSvgDiagrams() {
        try {
            // Get all SVG elements
            const svgElements = document.querySelectorAll('svg');
            
            if (svgElements.length === 0) {
                console.log('SVG Diagram Fixer: No SVG elements found');
                return;
            }
            
            console.log(`SVG Diagram Fixer: Found ${svgElements.length} SVG elements`);
            
            // Fix each SVG
            svgElements.forEach((svg, index) => {
                try {
                    fixSvgDiagram(svg, index);
                } catch (error) {
                    console.error(`SVG Diagram Fixer: Error fixing SVG #${index}:`, error);
                }
            });
        } catch (error) {
            console.error('SVG Diagram Fixer: Error fixing SVGs:', error);
        }
    }

    /**
     * Fix a single SVG diagram
     * @param {SVGElement} svg - The SVG element to fix
     * @param {number} index - Index for logging
     */
    function fixSvgDiagram(svg, index) {
        // Add class for styling if not present
        if (!svg.classList.contains('diagram')) {
            svg.classList.add('diagram');
        }
        
        // Ensure SVG has viewBox attribute
        if (!svg.getAttribute('viewBox')) {
            const width = svg.getAttribute('width') || '100%';
            const height = svg.getAttribute('height') || '100%';
            
            // Try to parse numeric values
            const numWidth = parseFloat(width);
            const numHeight = parseFloat(height);
            
            if (!isNaN(numWidth) && !isNaN(numHeight)) {
                svg.setAttribute('viewBox', `0 0 ${numWidth} ${numHeight}`);
                console.log(`SVG Diagram Fixer: Added viewBox to SVG #${index}`);
            }
        }
        
        // Ensure SVG has preserveAspectRatio attribute
        if (!svg.getAttribute('preserveAspectRatio')) {
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
        
        // Fix width and height attributes for responsiveness
        if (!svg.style.width) {
            svg.style.width = '100%';
        }
        
        if (!svg.style.height) {
            svg.style.height = 'auto';
        }
        
        // Add aria-label if missing
        if (!svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby')) {
            const title = svg.querySelector('title');
            if (title) {
                svg.setAttribute('aria-label', title.textContent);
            } else {
                svg.setAttribute('aria-label', 'Diagram');
            }
        }
        
        // Fix common rendering issues
        fixSvgRenderingIssues(svg);
        
        // Add fallback for browsers that don't support SVG
        addSvgFallback(svg);
    }

    /**
     * Fix common SVG rendering issues
     * @param {SVGElement} svg - The SVG element to fix
     */
    function fixSvgRenderingIssues(svg) {
        // Fix paths with missing attributes
        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
            // Ensure path has stroke attribute
            if (!path.getAttribute('stroke') && !path.getAttribute('fill')) {
                path.setAttribute('stroke', '#000');
            }
            
            // Ensure path has stroke-width attribute
            if (!path.getAttribute('stroke-width') && path.getAttribute('stroke')) {
                path.setAttribute('stroke-width', '1');
            }
        });
        
        // Fix text elements with missing attributes
        const textElements = svg.querySelectorAll('text');
        textElements.forEach(text => {
            // Ensure text has fill attribute
            if (!text.getAttribute('fill')) {
                text.setAttribute('fill', '#000');
            }
            
            // Ensure text has font-family attribute
            if (!text.getAttribute('font-family')) {
                text.setAttribute('font-family', 'Arial, sans-serif');
            }
        });
        
        // Fix groups with transform issues
        const groups = svg.querySelectorAll('g');
        groups.forEach(group => {
            const transform = group.getAttribute('transform');
            if (transform && transform.includes('NaN')) {
                group.removeAttribute('transform');
                console.warn('SVG Diagram Fixer: Removed invalid transform attribute');
            }
        });
    }

    /**
     * Add fallback for browsers that don't support SVG
     * @param {SVGElement} svg - The SVG element to add fallback for
     */
    function addSvgFallback(svg) {
        // Create a container div to wrap the SVG
        const container = document.createElement('div');
        container.className = 'svg-container';
        
        // Create fallback content
        const fallback = document.createElement('div');
        fallback.className = 'svg-fallback';
        fallback.innerHTML = 'Diagram content (requires SVG support)';
        
        // Get parent and replace SVG with container
        const parent = svg.parentNode;
        if (parent) {
            parent.insertBefore(container, svg);
            container.appendChild(svg);
            container.appendChild(fallback);
        }
    }

    /**
     * Set up mutation observer to fix dynamically added SVGs
     */
    function setupMutationObserver() {
        // Create a mutation observer to watch for new SVG elements
        const observer = new MutationObserver(mutations => {
            let newSvgFound = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an SVG
                        if (node.nodeName === 'svg') {
                            fixSvgDiagram(node, 'dynamic');
                            newSvgFound = true;
                        }
                        
                        // Check for SVGs inside the added node
                        if (node.querySelectorAll) {
                            const svgs = node.querySelectorAll('svg');
                            if (svgs.length > 0) {
                                svgs.forEach((svg, index) => {
                                    fixSvgDiagram(svg, `dynamic-${index}`);
                                    newSvgFound = true;
                                });
                            }
                        }
                    });
                }
            });
            
            if (newSvgFound) {
                console.log('SVG Diagram Fixer: Fixed dynamically added SVGs');
            }
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Set up window resize handler to ensure SVGs remain responsive
     */
    function setupResizeHandler() {
        // Use debounce function if available
        const utils = window.robustDiagramUtils || {};
        
        const handleResize = function() {
            try {
                // Get all SVG elements
                const svgElements = document.querySelectorAll('svg.diagram');
                
                // Trigger reflow for each SVG
                svgElements.forEach(svg => {
                    // Force reflow by accessing offsetHeight
                    const _ = svg.offsetHeight;
                    
                    // Add and remove a class to trigger reflow
                    svg.classList.add('resize-trigger');
                    setTimeout(() => {
                        svg.classList.remove('resize-trigger');
                    }, 0);
                });
            } catch (error) {
                console.error('SVG Diagram Fixer: Error in resize handler:', error);
            }
        };
        
        // Use debounced resize handler for performance
        const debouncedResize = utils.debounce ? 
            utils.debounce(handleResize, 200) : 
            function() {
                let timeout;
                clearTimeout(timeout);
                timeout = setTimeout(handleResize, 200);
            };
        
        // Add resize event listener
        window.addEventListener('resize', debouncedResize);
    }
})();
