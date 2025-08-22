/**
 * MODERN LLM DIAGRAM - REALISTIC & OPTIMAL
 * Creates a beautiful, interactive, and professional LLM concept visualization
 * Optimized for performance and visual appeal
 */

(function() {
    'use strict';

    // Configuration for modern diagram
    const CONFIG = {
        animation: {
            duration: 1200,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            stagger: 150
        },
        colors: {
            primary: '#3c6430',      // Green theme primary
            secondary: '#919fca',    // Blue-gray secondary
            accent: '#7350a5',       // Purple accent
            transformer: '#4a90e2',  // Blue for transformer
            attention: '#7b68ee',    // Purple for attention
            models: '#50c878',       // Green for models
            components: '#ffa500',   // Orange for components
            background: 'rgba(15, 20, 15, 0.95)',
            connection: 'rgba(60, 100, 48, 0.4)',
            connectionHover: 'rgba(60, 100, 48, 0.8)',
            glow: 'rgba(60, 100, 48, 0.6)'
        },
        nodes: {
            minSize: 70,
            maxSize: 110,
            spacing: 180,
            borderWidth: 3
        }
    };

    // Modern LLM Node Data - Comprehensive and Realistic
    const LLM_NODES = [
        {
            id: 'transformer',
            label: 'Transformer',
            description: 'Revolutionary attention-based architecture that changed NLP',
            category: 'architecture',
            color: CONFIG.colors.transformer,
            size: 110,
            position: { x: 50, y: 50 },
            connections: ['attention', 'encoder', 'decoder', 'bert', 't5'],
            importance: 1.0,
            icon: '🔄'
        },
        {
            id: 'attention',
            label: 'Self-Attention',
            description: 'Learns relationships between all sequence positions',
            category: 'mechanism',
            color: CONFIG.colors.attention,
            size: 95,
            position: { x: 20, y: 20 },
            connections: ['multihead', 'transformer', 'bert'],
            importance: 0.9,
            icon: '👁️'
        },
        {
            id: 'multihead',
            label: 'Multi-Head\nAttention',
            description: 'Parallel attention heads for different representation subspaces',
            category: 'mechanism',
            color: CONFIG.colors.models,
            size: 100,
            position: { x: 80, y: 20 },
            connections: ['attention', 'transformer'],
            importance: 0.85,
            icon: '🔍'
        },
        {
            id: 'bert',
            label: 'BERT',
            description: 'Bidirectional encoder for deep language understanding',
            category: 'model',
            color: CONFIG.colors.components,
            size: 90,
            position: { x: 15, y: 80 },
            connections: ['transformer', 'encoder', 'attention'],
            importance: 0.8,
            icon: '📖'
        },
        {
            id: 't5',
            label: 'T5',
            description: 'Text-to-text unified framework for all NLP tasks',
            category: 'model',
            color: '#ff6b6b',
            size: 90,
            position: { x: 85, y: 80 },
            connections: ['transformer', 'encoder', 'decoder'],
            importance: 0.8,
            icon: '🔄'
        },
        {
            id: 'encoder',
            label: 'Encoder',
            description: 'Processes and understands input sequences',
            category: 'component',
            color: '#9370db',
            size: 80,
            position: { x: 25, y: 50 },
            connections: ['transformer', 'bert', 't5'],
            importance: 0.7,
            icon: '📥'
        },
        {
            id: 'decoder',
            label: 'Decoder',
            description: 'Generates output sequences autoregressively',
            category: 'component',
            color: '#20b2aa',
            size: 80,
            position: { x: 75, y: 50 },
            connections: ['transformer', 't5'],
            importance: 0.7,
            icon: '📤'
        }
    ];

    // Store references for cleanup
    let resizeHandler = null;
    let eventListeners = [];
    let animationFrameId = null;
    let diagramSvg = null;

    /**
     * Initialize the modern LLM diagram
     */
    function initLLMDiagram() {
        try {
            console.log('🚀 Initializing Modern LLM Diagram...');

            // Set a timeout to show fallback if diagram doesn't load in 5 seconds
            window.diagramTimeout = setTimeout(() => {
                console.warn('⏰ Diagram loading timeout, showing fallback');
                showFallbackContent();
            }, 5000);

            // Find or create diagram container
            let diagramContainer = findOrCreateDiagramContainer();

            if (!diagramContainer) {
                console.warn('⚠️ Could not find or create LLM diagram container');
                return;
            }

            // Clear existing content and set up container
            setupDiagramContainer(diagramContainer);

            // Create the modern SVG-based diagram
            createModernLLMDiagram(diagramContainer);

            // Add interactivity
            addInteractivity();

            // Setup responsive behavior
            setupResponsiveBehavior();

            // Clear any existing timeout
            if (window.diagramTimeout) {
                clearTimeout(window.diagramTimeout);
            }

            console.log('✅ Modern LLM Diagram initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing modern LLM diagram:', error);

            // Show fallback content
            showFallbackContent();
        }
    }

    /**
     * Find existing diagram container or create a new one
     */
    function findOrCreateDiagramContainer() {
        // Try to find existing containers
        let container = document.querySelector('.llm-diagram, .visual-thesaurus-diagram, #llm-diagram, .diagram-container');

        if (!container) {
            // Look for a suitable parent to create the diagram in
            const heroSection = document.querySelector('.hero-section, .jumbotron, .banner');
            const mainContent = document.querySelector('.container, .main-content, main');
            const body = document.body;

            const parent = heroSection || mainContent || body;

            if (parent) {
                container = document.createElement('div');
                container.className = 'modern-llm-diagram-container';
                container.id = 'modern-llm-diagram';

                // Insert at appropriate position
                if (heroSection) {
                    heroSection.appendChild(container);
                } else if (mainContent) {
                    mainContent.insertBefore(container, mainContent.firstChild);
                } else {
                    body.appendChild(container);
                }
            }
        }

        return container;
    }

    /**
     * Setup the diagram container with proper styling
     */
    function setupDiagramContainer(container) {
        container.innerHTML = '';
        // Remove any existing classes and add loading state
        container.className = 'modern-llm-diagram-container loading';
    }

    /**
     * Create the modern SVG-based LLM diagram
     */
    function createModernLLMDiagram(container) {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 800 500');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        // Add definitions for gradients and filters
        addSVGDefinitions(svg);

        // Create connections first (so they appear behind nodes)
        createConnections(svg);

        // Create nodes
        createNodes(svg);

        // Add title
        addDiagramTitle(svg);

        container.appendChild(svg);
        diagramSvg = svg;

        // Mark as loaded and show background
        container.classList.remove('loading');
        container.classList.add('diagram-loaded');

        // Animate entrance
        animateEntrance();
    }

    /**
     * Add SVG definitions for gradients, filters, and effects
     */
    function addSVGDefinitions(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Gradient definitions
        const gradients = [
            { id: 'nodeGradient', colors: ['#4a90e2', '#357abd'] },
            { id: 'attentionGradient', colors: ['#7b68ee', '#5a4fcf'] },
            { id: 'modelGradient', colors: ['#50c878', '#3da55a'] },
            { id: 'componentGradient', colors: ['#ffa500', '#e6940e'] }
        ];

        gradients.forEach(grad => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', grad.id);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', grad.colors[0]);

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', grad.colors[1]);

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
        });

        // Glow filter
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'glow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        feGaussianBlur.setAttribute('result', 'coloredBlur');

        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');

        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);

        svg.appendChild(defs);
    }

    /**
     * Create connection lines between nodes
     */
    function createConnections(svg) {
        const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        connectionsGroup.setAttribute('class', 'connections-group');

        // Create connections based on node relationships
        LLM_NODES.forEach(node => {
            node.connections.forEach(targetId => {
                const targetNode = LLM_NODES.find(n => n.id === targetId);
                if (targetNode) {
                    createConnection(connectionsGroup, node, targetNode);
                }
            });
        });

        svg.appendChild(connectionsGroup);
    }

    /**
     * Create a single connection between two nodes
     */
    function createConnection(group, fromNode, toNode) {
        const fromPos = calculateNodePosition(fromNode);
        const toPos = calculateNodePosition(toNode);

        // Create curved path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const controlOffset = 50;

        const d = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY - controlOffset} ${toPos.x} ${toPos.y}`;

        path.setAttribute('d', d);
        path.setAttribute('stroke', CONFIG.colors.connection);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.6');
        path.setAttribute('class', 'connection-line');
        path.style.transition = 'all 0.3s ease';

        // Add hover effects
        path.addEventListener('mouseenter', () => {
            path.setAttribute('stroke', CONFIG.colors.connectionHover);
            path.setAttribute('stroke-width', '3');
            path.setAttribute('opacity', '1');
        });

        path.addEventListener('mouseleave', () => {
            path.setAttribute('stroke', CONFIG.colors.connection);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('opacity', '0.6');
        });

        group.appendChild(path);
    }

    /**
     * Calculate node position in SVG coordinates
     */
    function calculateNodePosition(node) {
        return {
            x: (node.position.x / 100) * 800,
            y: (node.position.y / 100) * 500
        };
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
     * Create nodes in the SVG
     */
    function createNodes(svg) {
        const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodesGroup.setAttribute('class', 'nodes-group');

        LLM_NODES.forEach((node, index) => {
            createNode(nodesGroup, node, index);
        });

        svg.appendChild(nodesGroup);
    }

    /**
     * Create a single node
     */
    function createNode(group, nodeData, index) {
        const pos = calculateNodePosition(nodeData);

        // Create node group
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', `node node-${nodeData.id}`);
        nodeGroup.setAttribute('data-id', nodeData.id);
        nodeGroup.style.cursor = 'pointer';

        // Create circle background
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', nodeData.size / 2);
        circle.setAttribute('fill', nodeData.color);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', CONFIG.nodes.borderWidth);
        circle.setAttribute('filter', 'url(#glow)');
        circle.style.transition = 'all 0.3s ease';

        // Create text label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.style.pointerEvents = 'none';
        text.style.userSelect = 'none';

        // Handle multi-line text
        const lines = nodeData.label.split('\n');
        if (lines.length > 1) {
            lines.forEach((line, lineIndex) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', pos.x);
                tspan.setAttribute('dy', lineIndex === 0 ? 0 : '1.2em');
                tspan.textContent = line;
                text.appendChild(tspan);
            });
        } else {
            text.textContent = nodeData.label;
        }

        // Add icon if available
        if (nodeData.icon) {
            const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            iconText.setAttribute('x', pos.x);
            iconText.setAttribute('y', pos.y - 20);
            iconText.setAttribute('text-anchor', 'middle');
            iconText.setAttribute('font-size', '20');
            iconText.textContent = nodeData.icon;
            iconText.style.pointerEvents = 'none';
            nodeGroup.appendChild(iconText);
        }

        // Add hover effects
        nodeGroup.addEventListener('mouseenter', () => {
            circle.setAttribute('r', (nodeData.size / 2) + 5);
            circle.setAttribute('stroke-width', CONFIG.nodes.borderWidth + 1);

            // Show tooltip
            showTooltip(nodeData, pos);
        });

        nodeGroup.addEventListener('mouseleave', () => {
            circle.setAttribute('r', nodeData.size / 2);
            circle.setAttribute('stroke-width', CONFIG.nodes.borderWidth);

            // Hide tooltip
            hideTooltip();
        });

        // Add click handler
        nodeGroup.addEventListener('click', () => {
            handleNodeClick(nodeData);
        });

        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(text);
        group.appendChild(nodeGroup);

        // Store reference for animations
        nodeGroup.style.opacity = '0';
        nodeGroup.style.transform = 'scale(0.5)';

        // Animate in with stagger
        setTimeout(() => {
            nodeGroup.style.transition = `all ${CONFIG.animation.duration}ms ${CONFIG.animation.easing}`;
            nodeGroup.style.opacity = '1';
            nodeGroup.style.transform = 'scale(1)';
        }, index * CONFIG.animation.stagger);
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

    /**
     * Add diagram title
     */
    function addDiagramTitle(svg) {
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '400');
        title.setAttribute('y', '40');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('fill', '#ffffff');
        title.setAttribute('font-family', 'Arial, sans-serif');
        title.setAttribute('font-size', '24');
        title.setAttribute('font-weight', 'bold');
        title.textContent = 'LLM Architecture & Components';
        title.style.opacity = '0.9';

        svg.appendChild(title);
    }

    /**
     * Show tooltip for node
     */
    function showTooltip(nodeData, position) {
        hideTooltip(); // Remove any existing tooltip

        const tooltip = document.createElement('div');
        tooltip.id = 'llm-node-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            max-width: 250px;
            z-index: 1000;
            pointer-events: none;
            border: 1px solid ${nodeData.color};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${nodeData.label}</div>
            <div style="font-size: 12px; opacity: 0.8;">${nodeData.description}</div>
            <div style="font-size: 11px; margin-top: 4px; color: ${nodeData.color};">
                Category: ${nodeData.category}
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = diagramSvg.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.left = (rect.left + position.x - tooltipRect.width / 2) + 'px';
        tooltip.style.top = (rect.top + position.y - tooltipRect.height - 10) + 'px';
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        const tooltip = document.getElementById('llm-node-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Handle node click
     */
    function handleNodeClick(nodeData) {
        console.log(`🔍 Clicked on ${nodeData.label}`);

        // Navigate to relevant page or show more info
        const routes = {
            'transformer': '/learn?topic=transformer',
            'attention': '/learn?topic=attention',
            'multihead': '/learn?topic=multihead-attention',
            'bert': '/learn?topic=bert',
            't5': '/learn?topic=t5',
            'encoder': '/learn?topic=encoder',
            'decoder': '/learn?topic=decoder'
        };

        if (routes[nodeData.id]) {
            window.location.href = routes[nodeData.id];
        }
    }

    /**
     * Add interactivity to the diagram
     */
    function addInteractivity() {
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideTooltip();
            }
        });

        // Add click outside to hide tooltip
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.node')) {
                hideTooltip();
            }
        });
    }

    /**
     * Setup responsive behavior
     */
    function setupResponsiveBehavior() {
        resizeHandler = () => {
            // Update diagram on resize if needed
            if (diagramSvg) {
                const container = diagramSvg.parentElement;
                if (container) {
                    const rect = container.getBoundingClientRect();
                    diagramSvg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
                }
            }
        };

        window.addEventListener('resize', resizeHandler);
    }

    /**
     * Animate entrance of diagram elements
     */
    function animateEntrance() {
        // Animate connections first
        const connections = diagramSvg.querySelectorAll('.connection-line');
        connections.forEach((conn, index) => {
            conn.style.strokeDasharray = '1000';
            conn.style.strokeDashoffset = '1000';
            conn.style.animation = `drawLine 1s ease-out ${index * 0.1}s forwards`;
        });

        // Add CSS for line drawing animation
        if (!document.getElementById('line-draw-animation')) {
            const style = document.createElement('style');
            style.id = 'line-draw-animation';
            style.textContent = `
                @keyframes drawLine {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Show fallback content if diagram fails to load
     */
    function showFallbackContent() {
        const container = document.querySelector('.modern-llm-diagram-container');
        const fallback = document.querySelector('#diagram-fallback');
        const description = document.querySelector('#diagram-description');

        if (container) {
            container.style.display = 'none';
        }

        if (fallback) {
            fallback.classList.remove('d-none');
        }

        if (description) {
            description.innerHTML = '<i class="bi bi-info-circle me-1"></i>LLM Architecture Overview';
        }
    }

    /**
     * Clean up resources
     */
    function cleanup() {
        try {
            console.log('🧹 Cleaning up Modern LLM Diagram resources...');

            // Remove resize handler
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
                resizeHandler = null;
            }

            // Remove event listeners
            eventListeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
            eventListeners = [];

            // Cancel animation frame
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            // Remove tooltips
            hideTooltip();

            console.log('✅ Modern LLM Diagram cleanup complete');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLLMDiagram);
    } else {
        setTimeout(initLLMDiagram, 0);
    }

    // Expose cleanup function globally for manual cleanup if needed
    window.cleanupModernLLMDiagram = cleanup;

})();
