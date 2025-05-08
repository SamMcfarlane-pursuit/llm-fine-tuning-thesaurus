/**
 * Enhanced LLM Diagram JavaScript
 * Improves the interactivity and functionality of the LLM fine-tuning concept diagram
 * With robust error handling and performance optimizations
 */

// Self-executing function to avoid global namespace pollution
(function() {
    // Initialize when DOM is ready with fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLLMDiagram);
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(initLLMDiagram, 0);
    }

    // Store references for cleanup
    let resizeHandler = null;
    let eventListeners = [];

    /**
     * Initialize the LLM diagram with enhanced interactivity
     */
    function initLLMDiagram() {
        try {
            // Use robust diagram utilities if available
            const utils = window.robustDiagramUtils || {};

            // Get the diagram container
            const diagramContainer = document.querySelector('.visual-thesaurus-diagram');
            if (!diagramContainer) {
                console.warn('LLM Diagram: Container not found');
                return;
            }

            // Initialize in sequence with error handling
            Promise.resolve()
                .then(() => {
                    console.log('LLM Diagram: Creating connection lines');
                    return createConnectionLines();
                })
                .then(() => {
                    console.log('LLM Diagram: Adding tooltips');
                    return addNodeTooltips();
                })
                .then(() => {
                    console.log('LLM Diagram: Adding controls');
                    return addDiagramControls();
                })
                .then(() => {
                    console.log('LLM Diagram: Adding click handlers');
                    return addNodeClickHandlers();
                })
                .then(() => {
                    console.log('LLM Diagram: Adding animations');
                    return animateDiagram();
                })
                .then(() => {
                    console.log('LLM Diagram: Initialization complete');

                    // Register for cleanup if utilities available
                    if (utils.registry) {
                        utils.registry.register('llmDiagram', {
                            cleanup: cleanup
                        });
                    }
                })
                .catch(error => {
                    console.error('LLM Diagram: Initialization error:', error);
                });
        } catch (error) {
            console.error('LLM Diagram: Fatal initialization error:', error);
        }
    }

    /**
     * Clean up event listeners and resources
     */
    function cleanup() {
        try {
            console.log('LLM Diagram: Cleaning up resources');

            // Remove resize handler
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
                resizeHandler = null;
            }

            // Remove registered event listeners
            eventListeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
            eventListeners = [];

            console.log('LLM Diagram: Cleanup complete');
        } catch (error) {
            console.error('LLM Diagram: Cleanup error:', error);
        }
    }

    /**
     * Helper to safely add event listener and track for cleanup
     */
    function safeAddEventListener(element, event, handler, options) {
        if (!element || !element.addEventListener) return null;

        try {
            element.addEventListener(event, handler, options);
            eventListeners.push({ element, event, handler });
            return handler;
        } catch (error) {
            console.error(`LLM Diagram: Error adding ${event} event:`, error);
            return null;
        }
    }

/**
 * Create connection lines between nodes with robust error handling
 * @returns {Promise} Resolves when connections are created
 */
function createConnectionLines() {
    return new Promise((resolve, reject) => {
        try {
            // Use robust diagram utilities if available
            const utils = window.robustDiagramUtils || {};

            const centralNode = document.querySelector('.central-node');
            const nodes = document.querySelectorAll('.node');
            const diagramContainer = document.querySelector('.visual-thesaurus-diagram');

            if (!centralNode || !nodes.length || !diagramContainer) {
                console.warn('LLM Diagram: Missing elements for connections');
                return resolve();
            }

            // Remove any existing connections to prevent duplicates
            diagramContainer.querySelectorAll('.connection.diagonal').forEach(conn => {
                conn.remove();
            });

            // Get central node position
            const containerRect = diagramContainer.getBoundingClientRect();
            const centralRect = centralNode.getBoundingClientRect();

            // Calculate relative position
            const centralX = centralRect.left + centralRect.width / 2 - containerRect.left;
            const centralY = centralRect.top + centralRect.height / 2 - containerRect.top;

            // Create connections from central node to each node
            nodes.forEach((node, index) => {
                try {
                    const nodeRect = node.getBoundingClientRect();
                    const nodeX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
                    const nodeY = nodeRect.top + nodeRect.height / 2 - containerRect.top;

                    // Calculate distance and angle
                    const dx = nodeX - centralX;
                    const dy = nodeY - centralY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                    // Create connection line
                    const connection = document.createElement('div');
                    connection.className = 'connection diagonal';
                    connection.style.width = `${distance}px`;
                    connection.style.left = `${centralX}px`;
                    connection.style.top = `${centralY}px`;
                    connection.style.transform = `rotate(${angle}deg)`;

                    // Add data attributes for animation and identification
                    connection.dataset.index = index;
                    connection.dataset.angle = angle;
                    connection.dataset.type = 'central';
                    connection.dataset.source = 'central';
                    connection.dataset.target = index;

                    diagramContainer.appendChild(connection);
                } catch (error) {
                    console.error(`LLM Diagram: Error creating central connection ${index}:`, error);
                }
            });

            // Create connections between adjacent nodes with a maximum of 20 connections
            // to prevent performance issues
            const maxAdjacentConnections = Math.min(nodes.length, 20);

            for (let i = 0; i < maxAdjacentConnections; i++) {
                try {
                    const node1 = nodes[i];
                    const node2 = nodes[(i + 1) % nodes.length];

                    const node1Rect = node1.getBoundingClientRect();
                    const node2Rect = node2.getBoundingClientRect();

                    const node1X = node1Rect.left + node1Rect.width / 2 - containerRect.left;
                    const node1Y = node1Rect.top + node1Rect.height / 2 - containerRect.top;
                    const node2X = node2Rect.left + node2Rect.width / 2 - containerRect.left;
                    const node2Y = node2Rect.top + node2Rect.height / 2 - containerRect.top;

                    // Calculate distance and angle
                    const dx = node2X - node1X;
                    const dy = node2Y - node1Y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                    // Skip if distance is too large (prevents connections across the entire diagram)
                    if (distance > containerRect.width * 0.7) {
                        continue;
                    }

                    // Create connection line
                    const connection = document.createElement('div');
                    connection.className = 'connection diagonal';
                    connection.style.width = `${distance}px`;
                    connection.style.left = `${node1X}px`;
                    connection.style.top = `${node1Y}px`;
                    connection.style.transform = `rotate(${angle}deg)`;

                    // Add data attributes for animation and identification
                    connection.dataset.index = i + nodes.length;
                    connection.dataset.angle = angle;
                    connection.dataset.type = 'adjacent';
                    connection.dataset.source = i;
                    connection.dataset.target = (i + 1) % nodes.length;

                    diagramContainer.appendChild(connection);
                } catch (error) {
                    console.error(`LLM Diagram: Error creating adjacent connection ${i}:`, error);
                }
            }

            // Setup resize handler to update connections
            const updateConnections = function() {
                try {
                    // Remove existing connections
                    diagramContainer.querySelectorAll('.connection.diagonal').forEach(conn => {
                        conn.remove();
                    });

                    // Recreate connections
                    createConnectionLines().catch(error => {
                        console.error('LLM Diagram: Error updating connections:', error);
                    });
                } catch (error) {
                    console.error('LLM Diagram: Error in resize handler:', error);
                }
            };

            // Use debounced resize handler for performance
            if (utils.debounce) {
                resizeHandler = utils.debounce(updateConnections, 200);
            } else {
                // Simple debounce implementation if utilities not available
                resizeHandler = function() {
                    if (resizeHandler.timeout) {
                        clearTimeout(resizeHandler.timeout);
                    }
                    resizeHandler.timeout = setTimeout(updateConnections, 200);
                };
            }

            window.addEventListener('resize', resizeHandler);

            resolve();
        } catch (error) {
            console.error('LLM Diagram: Fatal error creating connections:', error);
            // Resolve anyway to continue initialization
            resolve();
        }
    });
}

/**
 * Add tooltips to nodes with concept descriptions
 */
function addNodeTooltips() {
    // Define concept descriptions
    const conceptDescriptions = {
        'fine-tuning': 'The process of adapting a pre-trained language model to specific tasks or domains by updating its parameters on a custom dataset.',
        'LoRA': 'Low-Rank Adaptation is a parameter-efficient fine-tuning technique that significantly reduces memory requirements by adding trainable low-rank matrices.',
        'QLoRA': 'Quantized Low-Rank Adaptation combines 4-bit quantization with LoRA to enable fine-tuning of large models on consumer hardware.',
        'PEFT': 'Parameter-Efficient Fine-Tuning refers to methods that update only a small subset of a model\'s parameters, reducing computational requirements.',
        'quantization': 'The process of reducing the precision of model weights (e.g., from 32-bit to 8-bit or 4-bit) to decrease memory usage and increase inference speed.',
        'adapter': 'Small trainable modules inserted between layers of a frozen pre-trained model to adapt it to new tasks with minimal parameter updates.',
        'transformer': 'The neural network architecture that powers modern LLMs, featuring self-attention mechanisms to process sequential data in parallel.',
        'attention': 'A mechanism that allows models to focus on different parts of the input when generating each part of the output, enabling better handling of long-range dependencies.',
        'prompt tuning': 'A technique that prepends trainable continuous vectors to the input, allowing adaptation of frozen models by learning optimal prompts.',
        'prefix tuning': 'Similar to prompt tuning but adds trainable parameters to each layer of the transformer, not just the input.',
        'instruction tuning': 'Fine-tuning models on datasets of instructions and responses to improve their ability to follow user directions.',
        'low-rank': 'A mathematical approach that approximates weight matrices using products of smaller matrices, reducing parameter count while preserving expressivity.',
        'parameter-efficient': 'Methods designed to adapt models using significantly fewer trainable parameters than full fine-tuning.',
        'hyperparameters': 'Configuration variables that control the training process, such as learning rate, batch size, and model-specific settings.',
        'training': 'The process of updating model parameters using gradient descent to minimize a loss function on a dataset.',
        'inference': 'Using a trained model to generate predictions or responses for new inputs.',
        'GPU': 'Graphics Processing Unit, specialized hardware that accelerates neural network computations through parallel processing.',
        'TPU': 'Tensor Processing Unit, Google\'s custom-developed ASIC designed specifically to accelerate machine learning workloads.',
        'hugging face': 'An organization providing popular libraries and platforms for working with transformer models, including the Transformers library.',
        'pytorch': 'An open-source machine learning framework developed by Facebook that provides flexibility and speed for deep learning research.',
        'dataset': 'A collection of examples used to train and evaluate machine learning models.',
        'model': 'A mathematical representation trained to perform specific tasks, such as generating text or classifying inputs.'
    };

    // Add tooltips to central node and regular nodes
    const centralNode = document.querySelector('.central-node');
    if (centralNode) {
        addTooltip(centralNode, 'fine-tuning', conceptDescriptions['fine-tuning']);
    }

    document.querySelectorAll('.node').forEach(node => {
        const conceptName = node.textContent.trim().toLowerCase();
        if (conceptDescriptions[conceptName]) {
            addTooltip(node, conceptName, conceptDescriptions[conceptName]);
        }
    });

    function addTooltip(node, title, description) {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'node-tooltip';
        tooltip.innerHTML = `<h4>${title.charAt(0).toUpperCase() + title.slice(1)}</h4><p>${description}</p>`;

        // Position tooltip
        tooltip.style.bottom = '120%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';

        // Add tooltip to node
        node.appendChild(tooltip);

        // Adjust tooltip position if it goes off-screen
        node.addEventListener('mouseenter', () => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            if (tooltipRect.left < 10) {
                tooltip.style.left = '0';
                tooltip.style.transform = 'translateX(0)';
            } else if (tooltipRect.right > viewportWidth - 10) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '0';
                tooltip.style.transform = 'translateX(0)';
            }
        });
    }
}

/**
 * Add controls for the diagram (zoom, reset, etc.)
 */
function addDiagramControls() {
    const diagramContainer = document.querySelector('.visual-thesaurus-container');
    if (!diagramContainer) return;

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'diagram-controls';

    // Add zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'diagram-control-btn';
    zoomInBtn.innerHTML = '<i class="bi bi-zoom-in"></i>';
    zoomInBtn.setAttribute('aria-label', 'Zoom in');
    zoomInBtn.addEventListener('click', () => {
        const diagram = document.querySelector('.visual-thesaurus-diagram');
        const currentScale = parseFloat(diagram.style.transform?.match(/scale\(([^)]+)\)/) ? diagram.style.transform.match(/scale\(([^)]+)\)/)[1] : 1);
        diagram.style.transform = `scale(${currentScale + 0.1})`;
    });

    // Add zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'diagram-control-btn';
    zoomOutBtn.innerHTML = '<i class="bi bi-zoom-out"></i>';
    zoomOutBtn.setAttribute('aria-label', 'Zoom out');
    zoomOutBtn.addEventListener('click', () => {
        const diagram = document.querySelector('.visual-thesaurus-diagram');
        const currentScale = parseFloat(diagram.style.transform?.match(/scale\(([^)]+)\)/) ? diagram.style.transform.match(/scale\(([^)]+)\)/)[1] : 1);
        if (currentScale > 0.5) {
            diagram.style.transform = `scale(${currentScale - 0.1})`;
        }
    });

    // Add reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'diagram-control-btn';
    resetBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
    resetBtn.setAttribute('aria-label', 'Reset view');
    resetBtn.addEventListener('click', () => {
        const diagram = document.querySelector('.visual-thesaurus-diagram');
        diagram.style.transform = 'scale(1)';
    });

    // Add buttons to controls container
    controlsContainer.appendChild(zoomInBtn);
    controlsContainer.appendChild(zoomOutBtn);
    controlsContainer.appendChild(resetBtn);

    // Add controls to diagram container
    diagramContainer.appendChild(controlsContainer);
}

/**
 * Add click handlers to nodes for interactive exploration
 */
function addNodeClickHandlers() {
    document.querySelectorAll('.node, .central-node').forEach(node => {
        node.addEventListener('click', function() {
            // Toggle active state
            const wasActive = this.classList.contains('active');

            // Remove active class from all nodes
            document.querySelectorAll('.node, .central-node').forEach(n => {
                n.classList.remove('active');
            });

            // If node wasn't active before, make it active
            if (!wasActive) {
                this.classList.add('active');
            }

            // Get concept name
            const conceptName = this.textContent.trim().toLowerCase();

            // Trigger event for concept selection
            const event = new CustomEvent('conceptSelected', {
                detail: { concept: conceptName, active: !wasActive }
            });
            document.dispatchEvent(event);
        });
    });

    // Listen for concept selection event
    document.addEventListener('conceptSelected', function(e) {
        const { concept, active } = e.detail;

        // If a concept was selected, scroll to related content
        if (active) {
            const relatedSection = document.querySelector(`[data-concept="${concept}"]`);
            if (relatedSection) {
                relatedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

/**
 * Add subtle animations to the diagram with performance optimizations
 * @returns {Promise} Resolves when animations are set up
 */
function animateDiagram() {
    return new Promise((resolve, reject) => {
        try {
            // Check if browser supports animations
            const supportsAnimations = 'animation' in document.documentElement.style;

            if (!supportsAnimations) {
                console.warn('LLM Diagram: Browser does not support animations, skipping');
                return resolve();
            }

            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Add keyframes for connection pulse animation if not already added
            if (!document.getElementById('connection-pulse-keyframes')) {
                try {
                    const style = document.createElement('style');
                    style.id = 'connection-pulse-keyframes';

                    // Use reduced motion if preferred
                    if (prefersReducedMotion) {
                        style.textContent = `
                            @keyframes connectionPulse {
                                0%, 100% { opacity: 0.2; }
                            }
                        `;
                    } else {
                        style.textContent = `
                            @keyframes connectionPulse {
                                0% { opacity: 0.1; }
                                50% { opacity: 0.3; }
                                100% { opacity: 0.1; }
                            }
                        `;
                    }

                    document.head.appendChild(style);
                } catch (error) {
                    console.error('LLM Diagram: Error adding keyframes:', error);
                }
            }

            // Animate connection lines with performance optimizations
            const connections = document.querySelectorAll('.connection');

            // Limit the number of animated connections for performance
            const maxAnimatedConnections = Math.min(connections.length, 30);

            // Animate only a subset of connections if there are too many
            for (let i = 0; i < maxAnimatedConnections; i++) {
                try {
                    const connection = connections[i];

                    // Skip animation for reduced motion preference
                    if (prefersReducedMotion) {
                        connection.style.opacity = '0.2';
                        continue;
                    }

                    // Stagger animations for better performance
                    const delay = (i / maxAnimatedConnections) * 3;
                    connection.style.animation = `connectionPulse 3s infinite ${delay}s`;

                    // Use hardware acceleration for smoother animations
                    connection.style.willChange = 'opacity';
                    connection.style.backfaceVisibility = 'hidden';
                } catch (error) {
                    console.error(`LLM Diagram: Error animating connection ${i}:`, error);
                }
            }

            // Add subtle hover effects to nodes
            document.querySelectorAll('.node, .central-node').forEach(node => {
                try {
                    // Skip for reduced motion preference
                    if (!prefersReducedMotion) {
                        node.classList.add('animate-on-hover');
                    }
                } catch (error) {
                    console.error('LLM Diagram: Error adding node hover effect:', error);
                }
            });

            resolve();
        } catch (error) {
            console.error('LLM Diagram: Error setting up animations:', error);
            resolve(); // Resolve anyway to continue initialization
        }
    });
}
