/**
 * Enhanced Concept Map JavaScript
 * Improves functionality, accessibility and interactivity of concept map visualizations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced concept maps
    initializeEnhancedConceptMaps();

    // Add event listeners for zoom controls if they exist
    setupZoomControls();

    // Add keyboard navigation for accessibility
    setupKeyboardNavigation();
});

/**
 * Initialize enhanced concept maps
 */
function initializeEnhancedConceptMaps() {
    // Find all concept map containers
    const mapContainers = document.querySelectorAll('.visualization-container, .map-container');

    if (mapContainers.length === 0) return;

    mapContainers.forEach(container => {
        // Check if this container has already been enhanced
        if (container.dataset.enhanced === 'true') return;

        // Mark as enhanced
        container.dataset.enhanced = 'true';

        // Add ARIA attributes for accessibility
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Interactive concept map visualization');
        container.setAttribute('tabindex', '0');

        // Add loading indicator if not present
        if (!container.querySelector('.map-loading')) {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'map-loading';
            loadingElement.setAttribute('role', 'status');
            loadingElement.setAttribute('aria-live', 'polite');
            loadingElement.innerHTML = `
                <div class="map-loading-spinner" aria-hidden="true"></div>
                <div class="map-loading-text">Loading visualization...</div>
            `;
            container.appendChild(loadingElement);
        }

        // Find iframe if it exists
        const iframe = container.querySelector('iframe');
        if (iframe) {
            // Add title and ARIA attributes for accessibility
            iframe.setAttribute('title', 'Concept Map Visualization');
            iframe.setAttribute('aria-label', 'Interactive concept map showing relationships between fine-tuning concepts');

            // Add load event to remove loading indicator
            iframe.addEventListener('load', function() {
                const loadingElement = container.querySelector('.map-loading');
                if (loadingElement) {
                    loadingElement.style.opacity = '0';
                    setTimeout(() => {
                        loadingElement.remove();

                        // Announce that the visualization is ready
                        announceToScreenReader('Concept map visualization is now loaded and ready for interaction');
                    }, 500);
                }

                // Try to enhance the network inside the iframe
                try {
                    enhanceIframeNetwork(iframe);
                } catch (error) {
                    console.error('Error enhancing iframe network:', error);
                }
            });

            // Add error handling
            iframe.addEventListener('error', function() {
                const loadingElement = container.querySelector('.map-loading');
                if (loadingElement) {
                    loadingElement.innerHTML = `
                        <div class="map-error-icon" aria-hidden="true">⚠️</div>
                        <div class="map-loading-text">Error loading visualization. Please try refreshing the page.</div>
                    `;
                }
            });
        } else {
            // Check for direct network visualization
            const network = container._network || window.conceptsNetwork;
            if (network) {
                enhanceDirectNetwork(network, container);
            } else {
                // If no visualization is found, show an error
                container.innerHTML = `
                    <div class="map-loading">
                        <div class="map-error-icon" aria-hidden="true">⚠️</div>
                        <div class="map-loading-text">Visualization could not be loaded. Please try refreshing the page.</div>
                    </div>
                `;
            }
        }
    });
}

/**
 * Announce a message to screen readers
 */
function announceToScreenReader(message) {
    // Create an aria-live region if it doesn't exist
    let announcer = document.getElementById('concept-map-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'concept-map-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
    }

    // Set the message
    announcer.textContent = message;

    // Clear the message after a delay
    setTimeout(() => {
        announcer.textContent = '';
    }, 3000);
}

/**
 * Enhance network inside iframe
 */
function enhanceIframeNetwork(iframe) {
    // Wait for iframe to load
    setTimeout(() => {
        try {
            // Access the network object in the iframe
            const iframeNetwork = iframe.contentWindow.network;

            if (iframeNetwork) {
                // Send message to iframe to enhance network
                iframe.contentWindow.postMessage({
                    action: 'enhanceNetwork',
                    options: {
                        nodes: {
                            font: {
                                color: '#ffffff',
                                size: 18, // Increased font size for better readability
                                face: 'Arial',
                                bold: true,
                                strokeWidth: 4, // Add text stroke for better visibility
                                strokeColor: 'rgba(0, 0, 0, 0.8)'
                            },
                            borderWidth: 3,
                            borderWidthSelected: 5,
                            color: {
                                border: '#00e5ff',
                                background: 'rgba(0, 0, 0, 0.9)',
                                highlight: {
                                    border: '#ffffff',
                                    background: 'rgba(0, 0, 0, 0.95)'
                                },
                                hover: {
                                    border: '#ffffff',
                                    background: 'rgba(0, 0, 0, 0.95)'
                                }
                            },
                            shadow: {
                                enabled: true,
                                color: 'rgba(0, 229, 255, 0.6)',
                                size: 10,
                                x: 0,
                                y: 0
                            },
                            scaling: {
                                min: 20, // Minimum node size
                                max: 40, // Maximum node size
                                label: {
                                    enabled: true,
                                    min: 16,
                                    max: 24
                                }
                            },
                            shape: 'dot' // Use circular shape for all nodes
                        },
                        edges: {
                            color: {
                                color: 'rgba(255, 0, 255, 0.9)',
                                highlight: 'rgba(255, 255, 255, 0.9)',
                                hover: 'rgba(255, 255, 255, 0.9)'
                            },
                            width: 3,
                            selectionWidth: 5,
                            hoverWidth: 4,
                            smooth: {
                                type: 'dynamic',
                                forceDirection: 'none',
                                roundness: 0.5
                            },
                            arrows: {
                                to: {
                                    enabled: false // Disable arrows for cleaner look
                                }
                            }
                        },
                        interaction: {
                            hover: true,
                            hoverConnectedEdges: true,
                            multiselect: true,
                            navigationButtons: true,
                            keyboard: {
                                enabled: true,
                                bindToWindow: false
                            },
                            tooltipDelay: 200
                        },
                        physics: {
                            stabilization: {
                                enabled: true,
                                iterations: 200, // More iterations for better layout
                                updateInterval: 25
                            },
                            barnesHut: {
                                gravitationalConstant: -30000, // Stronger gravity
                                centralGravity: 0.3,
                                springLength: 150, // Shorter springs for more compact layout
                                springConstant: 0.05,
                                damping: 0.09,
                                avoidOverlap: 0.5 // Stronger overlap avoidance
                            }
                        }
                    }
                }, '*');

                // Add event listener for messages from iframe
                window.addEventListener('message', function(event) {
                    if (event.data.action === 'nodeClicked') {
                        // Handle node click event
                        console.log('Node clicked:', event.data.nodeId);

                        // Announce to screen readers
                        announceToScreenReader(`Selected concept: ${event.data.nodeId}`);
                    } else if (event.data.action === 'networkStabilized') {
                        // Network has stabilized
                        console.log('Network stabilized');

                        // Remove loading indicator if it still exists
                        const container = iframe.closest('.visualization-container, .map-container');
                        if (container) {
                            const loadingElement = container.querySelector('.map-loading');
                            if (loadingElement) {
                                loadingElement.style.opacity = '0';
                                setTimeout(() => {
                                    loadingElement.remove();
                                }, 500);
                            }
                        }
                    }
                });

                // Send additional message to highlight the central node
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        action: 'highlightCentralNode',
                        nodeName: 'fine-tuning'
                    }, '*');
                }, 1500);
            }
        } catch (error) {
            console.error('Error accessing iframe network:', error);
        }
    }, 1000);
}

/**
 * Enhance direct network visualization
 */
function enhanceDirectNetwork(network, container) {
    // Apply enhanced options
    const options = {
        nodes: {
            font: {
                color: '#ffffff',
                size: 16,
                face: 'Arial',
                bold: true
            },
            borderWidth: 3,
            borderWidthSelected: 5,
            color: {
                border: '#00e5ff',
                background: 'rgba(0, 0, 0, 0.9)',
                highlight: {
                    border: '#ffffff',
                    background: 'rgba(0, 0, 0, 0.95)'
                },
                hover: {
                    border: '#ffffff',
                    background: 'rgba(0, 0, 0, 0.95)'
                }
            },
            shadow: {
                enabled: true,
                color: 'rgba(0, 229, 255, 0.6)',
                size: 10,
                x: 0,
                y: 0
            }
        },
        edges: {
            color: {
                color: 'rgba(255, 0, 255, 0.9)',
                highlight: 'rgba(255, 255, 255, 0.9)',
                hover: 'rgba(255, 255, 255, 0.9)'
            },
            width: 3,
            selectionWidth: 5,
            hoverWidth: 4,
            smooth: {
                type: 'dynamic',
                forceDirection: 'none',
                roundness: 0.5
            }
        }
    };

    // Apply options to network
    network.setOptions(options);

    // Highlight central node if it exists
    try {
        const data = network.body.data;
        const nodes = data.nodes;
        const centralNodeId = findCentralNode(nodes);

        if (centralNodeId) {
            // Update central node styling
            nodes.update({
                id: centralNodeId,
                color: {
                    background: '#ff00ff',
                    border: '#ffffff'
                },
                borderWidth: 4,
                shadow: {
                    enabled: true,
                    color: 'rgba(255, 0, 255, 0.8)',
                    size: 15
                },
                font: {
                    size: 18,
                    bold: true
                }
            });
        }
    } catch (error) {
        console.error('Error highlighting central node:', error);
    }

    // Remove loading indicator
    const loadingElement = container.querySelector('.map-loading');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.remove();
        }, 500);
    }
}

/**
 * Find the central node in a network
 */
function findCentralNode(nodes) {
    // Try to find a node with "fine-tuning" or similar in the label
    let centralNodeId = null;

    try {
        // Convert nodes to array if it's not already
        const nodesArray = nodes.get ? nodes.get() : nodes;

        // First look for exact matches
        const keywords = ['fine-tuning', 'fine tuning', 'finetuning'];
        for (const node of nodesArray) {
            const label = (node.label || '').toLowerCase();
            if (keywords.includes(label)) {
                centralNodeId = node.id;
                break;
            }
        }

        // If no exact match, look for partial matches
        if (!centralNodeId) {
            for (const node of nodesArray) {
                const label = (node.label || '').toLowerCase();
                if (keywords.some(keyword => label.includes(keyword))) {
                    centralNodeId = node.id;
                    break;
                }
            }
        }

        // If still no match, use the node with the most connections
        if (!centralNodeId && window.conceptsNetwork) {
            let maxConnections = 0;

            for (const node of nodesArray) {
                const connections = window.conceptsNetwork.getConnectedNodes(node.id);
                if (connections.length > maxConnections) {
                    maxConnections = connections.length;
                    centralNodeId = node.id;
                }
            }
        }
    } catch (error) {
        console.error('Error finding central node:', error);
    }

    return centralNodeId;
}

/**
 * Setup zoom controls
 */
function setupZoomControls() {
    // Find all zoom control buttons
    const zoomInButtons = document.querySelectorAll('[id$="zoom-in-btn"]');
    const zoomOutButtons = document.querySelectorAll('[id$="zoom-out-btn"]');
    const resetZoomButtons = document.querySelectorAll('[id$="reset-zoom-btn"]');

    // Add enhanced functionality to zoom buttons
    zoomInButtons.forEach(button => {
        button.addEventListener('click', function() {
            zoomNetwork(1.2);
        });
    });

    zoomOutButtons.forEach(button => {
        button.addEventListener('click', function() {
            zoomNetwork(0.8);
        });
    });

    resetZoomButtons.forEach(button => {
        button.addEventListener('click', function() {
            resetNetworkZoom();
        });
    });
}

/**
 * Setup keyboard navigation for accessibility
 */
function setupKeyboardNavigation() {
    // Add keyboard event listener
    document.addEventListener('keydown', function(event) {
        // Only handle events when focus is on the visualization
        const activeElement = document.activeElement;
        const isVisualizationFocused =
            activeElement.classList.contains('visualization-container') ||
            activeElement.classList.contains('map-container') ||
            activeElement.tagName.toLowerCase() === 'iframe';

        if (!isVisualizationFocused) return;

        // Handle keyboard navigation
        switch (event.key) {
            case '+':
            case '=':
                zoomNetwork(1.2);
                event.preventDefault();
                break;
            case '-':
                zoomNetwork(0.8);
                event.preventDefault();
                break;
            case '0':
                resetNetworkZoom();
                event.preventDefault();
                break;
        }
    });
}

/**
 * Zoom the network visualization
 */
function zoomNetwork(scale) {
    // Try to find the network object
    const network = window.conceptsNetwork;

    if (network) {
        // Direct network
        const currentScale = network.getScale();
        network.moveTo({ scale: currentScale * scale });
    } else {
        // Try to find iframe
        const iframe = document.querySelector('.visualization-container iframe, .map-container iframe');
        if (iframe) {
            iframe.contentWindow.postMessage({ action: scale > 1 ? 'zoomIn' : 'zoomOut' }, '*');
        }
    }
}

/**
 * Reset network zoom
 */
function resetNetworkZoom() {
    // Try to find the network object
    const network = window.conceptsNetwork;

    if (network) {
        // Direct network
        network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    } else {
        // Try to find iframe
        const iframe = document.querySelector('.visualization-container iframe, .map-container iframe');
        if (iframe) {
            iframe.contentWindow.postMessage({ action: 'resetZoom' }, '*');
        }
    }
}
