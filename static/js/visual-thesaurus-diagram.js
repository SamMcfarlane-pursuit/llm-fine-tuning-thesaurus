/**
 * Visual Thesaurus Diagram JavaScript
 * Creates connections between nodes in the visual thesaurus diagram
 * Enhanced with robust error handling and performance optimizations
 */

// Wait for robust diagram utilities to load
(function() {
    function initVisualThesaurusDiagram() {
        // Use the robust diagram utilities if available
        const utils = window.robustDiagramUtils || {};
        const safeDom = utils.safeDom || {
            getElement: (s) => document.querySelector(s),
            getElements: (s) => Array.from(document.querySelectorAll(s)),
            addEvent: (el, ev, fn) => el && el.addEventListener(ev, fn)
        };

        // Check if the thesaurus visualization exists on the page
        const thesaurusVisualization = safeDom.getElement('#thesaurus-visualization');
        if (!thesaurusVisualization) return;

        // Get all nodes and the central node
        const centralNode = safeDom.getElement('.central-node');
        const nodes = safeDom.getElements('.node');
        const connections = safeDom.getElements('.connection');

        // Exit if required elements are missing
        if (!centralNode || nodes.length === 0) {
            console.warn('Visual Thesaurus Diagram: Required elements not found');
            return;
        }

        // Function to create a connection between two elements with error handling
        function createConnection(elem1, elem2, connectionElem) {
            try {
                // Get positions
                const rect1 = elem1.getBoundingClientRect();
                const rect2 = elem2.getBoundingClientRect();

                // Get the container position for relative positioning
                const containerRect = thesaurusVisualization.getBoundingClientRect();

                // Calculate positions relative to the container
                const x1 = rect1.left + rect1.width / 2 - containerRect.left;
                const y1 = rect1.top + rect1.height / 2 - containerRect.top;
                const x2 = rect2.left + rect2.width / 2 - containerRect.left;
                const y2 = rect2.top + rect2.height / 2 - containerRect.top;

                // Calculate the distance and angle
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                // Set the connection style
                connectionElem.style.width = `${distance}px`;
                connectionElem.style.height = '2px';
                connectionElem.style.left = `${x1}px`;
                connectionElem.style.top = `${y1}px`;
                connectionElem.style.transform = `rotate(${angle}deg)`;

                return true;
            } catch (error) {
                console.error('Error creating connection:', error);
                return false;
            }
        }

        // Function to update all connections
        function updateAllConnections() {
            try {
                nodes.forEach((node, index) => {
                    if (connections[index]) {
                        createConnection(centralNode, node, connections[index]);
                    }
                });
            } catch (error) {
                console.error('Error updating connections:', error);
            }
        }

        // Create connections between central node and all other nodes
        updateAllConnections();

        // Update connections on window resize with debounce for performance
        const debouncedUpdate = utils.debounce ?
            utils.debounce(updateAllConnections, 100) :
            function() {
                let timeout;
                clearTimeout(timeout);
                timeout = setTimeout(updateAllConnections, 100);
            };

        window.addEventListener('resize', debouncedUpdate);

        // Add hover effects with error handling
        nodes.forEach((node, index) => {
            safeDom.addEvent(node, 'mouseenter', function() {
                try {
                    if (connections[index]) {
                        connections[index].style.backgroundColor = 'rgba(255, 0, 255, 1)';
                        connections[index].style.height = '5px';
                        connections[index].style.zIndex = '2';
                        connections[index].style.boxShadow = '0 0 20px rgba(255, 0, 255, 1)';
                    }
                } catch (error) {
                    console.error('Error in hover effect:', error);
                }
            });

            safeDom.addEvent(node, 'mouseleave', function() {
                try {
                    if (connections[index]) {
                        connections[index].style.backgroundColor = 'rgba(255, 0, 255, 0.8)';
                        connections[index].style.height = '3px';
                        connections[index].style.zIndex = '1';
                        connections[index].style.boxShadow = '0 0 12px rgba(255, 0, 255, 0.7)';
                    }
                } catch (error) {
                    console.error('Error in hover effect:', error);
                }
            });
        });

        // Add click functionality to nodes with error handling
        nodes.forEach(node => {
            safeDom.addEvent(node, 'click', function(e) {
                try {
                    const concept = this.textContent.trim().toLowerCase();
                    window.location.href = `/learn-and-explore?concept=${encodeURIComponent(concept)}`;
                } catch (error) {
                    console.error('Error in node click:', error);
                }
                e.preventDefault();
            });
        });

        // Add click functionality to central node with error handling
        safeDom.addEvent(centralNode, 'click', function(e) {
            try {
                const concept = this.textContent.trim().toLowerCase();
                window.location.href = `/learn-and-explore?concept=${encodeURIComponent(concept)}`;
            } catch (error) {
                console.error('Error in central node click:', error);
            }
            e.preventDefault();
        });

        // Make nodes draggable for better interaction
        let activeNode = null;
        let initialX, initialY;

        function startDrag(e) {
            try {
                if (e.target.classList.contains('node') || e.target.classList.contains('central-node')) {
                    activeNode = e.target;
                    const rect = activeNode.getBoundingClientRect();
                    initialX = e.clientX - rect.left;
                    initialY = e.clientY - rect.top;
                    activeNode.style.cursor = 'grabbing';
                    e.preventDefault();
                }
            } catch (error) {
                console.error('Error starting drag:', error);
                activeNode = null;
            }
        }

        function drag(e) {
            if (!activeNode) return;

            try {
                const containerRect = thesaurusVisualization.getBoundingClientRect();
                let left = e.clientX - initialX - containerRect.left;
                let top = e.clientY - initialY - containerRect.top;

                // Constrain to container
                left = Math.max(0, Math.min(left, containerRect.width - activeNode.offsetWidth));
                top = Math.max(0, Math.min(top, containerRect.height - activeNode.offsetHeight));

                activeNode.style.left = `${left}px`;
                activeNode.style.top = `${top}px`;

                // Update connections
                nodes.forEach((node, index) => {
                    if (connections[index]) {
                        if (node === activeNode) {
                            createConnection(centralNode, node, connections[index]);
                        } else if (activeNode === centralNode) {
                            createConnection(centralNode, node, connections[index]);
                        }
                    }
                });

                e.preventDefault();
            } catch (error) {
                console.error('Error during drag:', error);
                endDrag();
            }
        }

        function endDrag() {
            try {
                if (activeNode) {
                    activeNode.style.cursor = 'grab';
                    activeNode = null;
                }
            } catch (error) {
                console.error('Error ending drag:', error);
                activeNode = null;
            }
        }

        // Add event listeners for dragging with error handling
        safeDom.addEvent(thesaurusVisualization, 'mousedown', startDrag);
        safeDom.addEvent(document, 'mousemove', utils.throttle ? utils.throttle(drag, 16) : drag);
        safeDom.addEvent(document, 'mouseup', endDrag);

        // Touch support for mobile with error handling
        safeDom.addEvent(thesaurusVisualization, 'touchstart', function(e) {
            try {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                startDrag(mouseEvent);
                e.preventDefault(); // Prevent scrolling while dragging
            } catch (error) {
                console.error('Error in touch start:', error);
            }
        });

        safeDom.addEvent(document, 'touchmove', function(e) {
            if (!activeNode) return;

            try {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                drag(mouseEvent);
                e.preventDefault(); // Prevent scrolling while dragging
            } catch (error) {
                console.error('Error in touch move:', error);
                endDrag();
            }
        });

        safeDom.addEvent(document, 'touchend', endDrag);
        safeDom.addEvent(document, 'touchcancel', endDrag);

        // Register cleanup function for page transitions
        if (utils.registry) {
            utils.registry.register('visualThesaurusDiagram', {
                cleanup: function() {
                    window.removeEventListener('resize', debouncedUpdate);
                    document.removeEventListener('mousemove', drag);
                    document.removeEventListener('mouseup', endDrag);
                    document.removeEventListener('touchmove', drag);
                    document.removeEventListener('touchend', endDrag);
                    document.removeEventListener('touchcancel', endDrag);
                }
            });
        }

        // Log successful initialization
        console.log('Visual Thesaurus Diagram initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVisualThesaurusDiagram);
    } else {
        initVisualThesaurusDiagram();
    }
})();
