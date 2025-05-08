/**
 * Robust Diagram Utilities
 * Provides stable, efficient utilities for diagram rendering and interaction
 * with built-in error handling and performance optimizations
 */

// Store references to diagrams for cleanup and management
const diagramRegistry = {
    instances: {},
    
    // Register a diagram instance
    register: function(id, instance) {
        this.instances[id] = instance;
        return instance;
    },
    
    // Get a diagram instance
    get: function(id) {
        return this.instances[id] || null;
    },
    
    // Remove a diagram instance
    remove: function(id) {
        if (this.instances[id]) {
            delete this.instances[id];
            return true;
        }
        return false;
    },
    
    // Clean up all diagrams (useful for page transitions)
    cleanupAll: function() {
        Object.keys(this.instances).forEach(id => {
            const instance = this.instances[id];
            if (instance && typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
            delete this.instances[id];
        });
    }
};

// Throttle function to limit how often a function can be called
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function to delay execution until after a period of inactivity
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Safe DOM manipulation with error handling
const safeDom = {
    // Safely get an element
    getElement: function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.error(`Error getting element with selector "${selector}":`, error);
            return null;
        }
    },
    
    // Safely get multiple elements
    getElements: function(selector) {
        try {
            return Array.from(document.querySelectorAll(selector));
        } catch (error) {
            console.error(`Error getting elements with selector "${selector}":`, error);
            return [];
        }
    },
    
    // Safely add event listener
    addEvent: function(element, event, handler, options) {
        if (!element) return null;
        
        try {
            element.addEventListener(event, handler, options);
            return true;
        } catch (error) {
            console.error(`Error adding ${event} event:`, error);
            return false;
        }
    },
    
    // Safely remove event listener
    removeEvent: function(element, event, handler, options) {
        if (!element) return null;
        
        try {
            element.removeEventListener(event, handler, options);
            return true;
        } catch (error) {
            console.error(`Error removing ${event} event:`, error);
            return false;
        }
    }
};

// Diagram rendering utilities
const diagramUtils = {
    // Create connection between two elements
    createConnection: function(element1, element2, connectionElement, containerElement) {
        if (!element1 || !element2 || !connectionElement || !containerElement) {
            console.error("Missing required elements for connection");
            return false;
        }
        
        try {
            const containerRect = containerElement.getBoundingClientRect();
            
            // Get element positions relative to container
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();
            
            const x1 = rect1.left + rect1.width / 2 - containerRect.left;
            const y1 = rect1.top + rect1.height / 2 - containerRect.top;
            const x2 = rect2.left + rect2.width / 2 - containerRect.left;
            const y2 = rect2.top + rect2.height / 2 - containerRect.top;
            
            // Calculate distance and angle
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Set connection style
            connectionElement.style.width = `${distance}px`;
            connectionElement.style.left = `${x1}px`;
            connectionElement.style.top = `${y1}px`;
            connectionElement.style.transform = `rotate(${angle}deg)`;
            
            return true;
        } catch (error) {
            console.error("Error creating connection:", error);
            return false;
        }
    },
    
    // Update all connections in a diagram
    updateConnections: function(centralElement, nodeElements, connectionElements, containerElement) {
        if (!centralElement || !nodeElements || !connectionElements || !containerElement) {
            console.error("Missing required elements for updating connections");
            return false;
        }
        
        try {
            nodeElements.forEach((node, index) => {
                if (connectionElements[index]) {
                    this.createConnection(
                        centralElement, 
                        node, 
                        connectionElements[index], 
                        containerElement
                    );
                }
            });
            return true;
        } catch (error) {
            console.error("Error updating connections:", error);
            return false;
        }
    },
    
    // Check if browser supports required features
    checkBrowserSupport: function() {
        const features = {
            requestAnimationFrame: 'requestAnimationFrame' in window,
            intersectionObserver: 'IntersectionObserver' in window,
            canvas2d: !!document.createElement('canvas').getContext('2d'),
            webgl: (function() {
                try {
                    return !!document.createElement('canvas').getContext('webgl') || 
                           !!document.createElement('canvas').getContext('experimental-webgl');
                } catch(e) {
                    return false;
                }
            })()
        };
        
        return features;
    },
    
    // Create a performance-optimized animation
    createOptimizedAnimation: function(animationFn, fps = 30) {
        let animationId = null;
        let lastFrameTime = 0;
        const frameInterval = 1000 / fps;
        
        const animate = function(timestamp) {
            animationId = requestAnimationFrame(animate);
            
            const elapsed = timestamp - lastFrameTime;
            
            if (elapsed > frameInterval) {
                lastFrameTime = timestamp - (elapsed % frameInterval);
                animationFn(timestamp);
            }
        };
        
        // Start animation
        const start = function() {
            if (animationId === null) {
                animationId = requestAnimationFrame(animate);
            }
        };
        
        // Stop animation
        const stop = function() {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        };
        
        return { start, stop };
    }
};

// Export utilities
window.robustDiagramUtils = {
    registry: diagramRegistry,
    throttle,
    debounce,
    safeDom,
    diagramUtils
};
