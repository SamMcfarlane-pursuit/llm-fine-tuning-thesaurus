/**
 * Condensed Map Visualization JavaScript
 * Creates a drawer menu for concept maps with collapsible visualization elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create map drawer if visualization container exists
    const visualizationContainer = document.querySelector('.visualization-container');
    if (visualizationContainer) {
        createMapDrawer(visualizationContainer);
    }
    
    // Initialize any existing maps
    initializeConceptMaps();
});

/**
 * Create map drawer UI
 */
function createMapDrawer(container) {
    // Create drawer container
    const drawerContainer = document.createElement('div');
    drawerContainer.className = 'map-drawer-container';
    drawerContainer.setAttribute('aria-label', 'Concept Map Visualization');
    
    // Create drawer toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'map-drawer-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle concept map drawer');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.innerHTML = '<i class="bi bi-diagram-3"></i><span>Concept Map</span>';
    
    // Create drawer content
    const drawerContent = document.createElement('div');
    drawerContent.className = 'map-drawer-content';
    drawerContent.setAttribute('aria-hidden', 'true');
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'map-controls';
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'map-zoom-controls';
    zoomControls.innerHTML = `
        <button class="map-zoom-in" aria-label="Zoom in"><i class="bi bi-plus-lg"></i></button>
        <button class="map-zoom-out" aria-label="Zoom out"><i class="bi bi-dash-lg"></i></button>
        <button class="map-zoom-reset" aria-label="Reset zoom"><i class="bi bi-arrows-fullscreen"></i></button>
    `;
    
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'map-filter-controls';
    filterControls.innerHTML = `
        <button class="map-filter-all active" data-filter="all" aria-label="Show all concepts">All</button>
        <button class="map-filter-core" data-filter="core" aria-label="Show core concepts">Core</button>
        <button class="map-filter-related" data-filter="related" aria-label="Show related concepts">Related</button>
    `;
    
    // Create search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'map-search-container';
    searchContainer.innerHTML = `
        <div class="map-search-input-group">
            <i class="bi bi-search"></i>
            <input type="text" class="map-search-input" placeholder="Search concepts..." aria-label="Search concepts">
            <button class="map-search-clear" aria-label="Clear search"><i class="bi bi-x-lg"></i></button>
        </div>
    `;
    
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container';
    mapContainer.setAttribute('tabindex', '0');
    mapContainer.setAttribute('role', 'application');
    mapContainer.setAttribute('aria-label', 'Interactive concept map');
    
    // Assemble drawer
    controlsContainer.appendChild(searchContainer);
    controlsContainer.appendChild(filterControls);
    controlsContainer.appendChild(zoomControls);
    drawerContent.appendChild(controlsContainer);
    drawerContent.appendChild(mapContainer);
    drawerContainer.appendChild(toggleButton);
    drawerContainer.appendChild(drawerContent);
    
    // Add drawer to page
    document.body.appendChild(drawerContainer);
    
    // Add event listeners
    toggleButton.addEventListener('click', toggleMapDrawer);
    zoomControls.querySelector('.map-zoom-in').addEventListener('click', () => zoomMap(0.2));
    zoomControls.querySelector('.map-zoom-out').addEventListener('click', () => zoomMap(-0.2));
    zoomControls.querySelector('.map-zoom-reset').addEventListener('click', resetMapZoom);
    
    // Add filter event listeners
    const filterButtons = filterControls.querySelectorAll('button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterMap(this.dataset.filter);
        });
    });
    
    // Add search event listeners
    const searchInput = searchContainer.querySelector('.map-search-input');
    const searchClear = searchContainer.querySelector('.map-search-clear');
    
    searchInput.addEventListener('input', function() {
        searchMap(this.value);
    });
    
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchMap('');
    });
    
    // Add keyboard navigation
    mapContainer.addEventListener('keydown', handleMapKeyboardNavigation);
}

/**
 * Toggle map drawer open/closed
 */
function toggleMapDrawer() {
    const drawerContainer = document.querySelector('.map-drawer-container');
    const toggleButton = document.querySelector('.map-drawer-toggle');
    const drawerContent = document.querySelector('.map-drawer-content');
    
    const isOpen = drawerContainer.classList.contains('open');
    
    drawerContainer.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', !isOpen);
    drawerContent.setAttribute('aria-hidden', isOpen);
    
    // If opening, ensure map is initialized
    if (!isOpen) {
        initializeConceptMaps();
    }
}

/**
 * Initialize concept maps
 */
function initializeConceptMaps() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer || mapContainer.dataset.initialized === 'true') {
        return;
    }
    
    // Mark as initialized
    mapContainer.dataset.initialized = 'true';
    
    // Check if we have a network visualization library
    if (typeof vis === 'undefined') {
        console.error('Visualization library not loaded');
        mapContainer.innerHTML = '<div class="map-error">Visualization library not loaded</div>';
        return;
    }
    
    // Fetch concept data
    fetchConceptData()
        .then(data => {
            createConceptMap(mapContainer, data);
        })
        .catch(error => {
            console.error('Error creating concept map:', error);
            mapContainer.innerHTML = '<div class="map-error">Error loading concept map</div>';
        });
}

/**
 * Fetch concept data from API
 */
function fetchConceptData() {
    // Check if we have predefined API endpoints
    if (typeof apiEndpoints !== 'undefined' && apiEndpoints.llmConceptsVisualization) {
        return fetch(apiEndpoints.llmConceptsVisualization)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    } else {
        // Use mock data for demonstration
        return Promise.resolve(getMockConceptData());
    }
}

/**
 * Create concept map visualization
 */
function createConceptMap(container, data) {
    // Store original data for filtering
    container.dataset.originalData = JSON.stringify(data);
    
    // Create network
    const nodes = new vis.DataSet(data.nodes);
    const edges = new vis.DataSet(data.edges);
    
    const options = {
        nodes: {
            shape: 'dot',
            size: 16,
            font: {
                size: 14,
                face: 'Roboto, Arial, sans-serif'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            }
        },
        physics: {
            stabilization: true,
            barnesHut: {
                gravitationalConstant: -5000,
                centralGravity: 0.3,
                springLength: 140,
                springConstant: 0.04,
                damping: 0.09
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            tooltipDelay: 200,
            hover: true,
            zoomView: true
        }
    };
    
    // Create network
    const network = new vis.Network(container, { nodes, edges }, options);
    
    // Store network in container
    container._network = network;
    
    // Add event listeners
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            showNodeDetails(node);
        }
    });
    
    network.on('stabilizationProgress', function(params) {
        const progress = Math.round(params.iterations / params.total * 100);
        showLoadingProgress(container, progress);
    });
    
    network.on('stabilizationIterationsDone', function() {
        hideLoadingProgress(container);
    });
}

/**
 * Show node details in a popup
 */
function showNodeDetails(node) {
    // Check if details popup already exists
    let detailsPopup = document.querySelector('.map-node-details');
    
    if (!detailsPopup) {
        // Create popup
        detailsPopup = document.createElement('div');
        detailsPopup.className = 'map-node-details';
        detailsPopup.innerHTML = `
            <div class="map-node-details-header">
                <h3></h3>
                <button class="map-node-details-close" aria-label="Close details"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="map-node-details-content"></div>
            <div class="map-node-details-footer">
                <button class="map-node-details-learn-more">Learn More</button>
            </div>
        `;
        document.body.appendChild(detailsPopup);
        
        // Add close event
        detailsPopup.querySelector('.map-node-details-close').addEventListener('click', function() {
            detailsPopup.classList.remove('active');
        });
    }
    
    // Update popup content
    detailsPopup.querySelector('h3').textContent = node.label;
    
    const content = detailsPopup.querySelector('.map-node-details-content');
    content.innerHTML = '';
    
    if (node.description) {
        const description = document.createElement('p');
        description.textContent = node.description;
        content.appendChild(description);
    }
    
    if (node.related && node.related.length > 0) {
        const relatedTitle = document.createElement('h4');
        relatedTitle.textContent = 'Related Concepts';
        content.appendChild(relatedTitle);
        
        const relatedList = document.createElement('ul');
        node.related.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            relatedList.appendChild(listItem);
        });
        content.appendChild(relatedList);
    }
    
    // Update learn more button
    const learnMoreBtn = detailsPopup.querySelector('.map-node-details-learn-more');
    if (node.url) {
        learnMoreBtn.style.display = 'block';
        learnMoreBtn.onclick = function() {
            window.location.href = node.url;
        };
    } else {
        learnMoreBtn.style.display = 'none';
    }
    
    // Show popup
    detailsPopup.classList.add('active');
}

/**
 * Show loading progress
 */
function showLoadingProgress(container, progress) {
    let loadingBar = container.querySelector('.map-loading');
    
    if (!loadingBar) {
        loadingBar = document.createElement('div');
        loadingBar.className = 'map-loading';
        loadingBar.innerHTML = `
            <div class="map-loading-bar">
                <div class="map-loading-progress"></div>
            </div>
            <div class="map-loading-text">Loading concept map...</div>
        `;
        container.appendChild(loadingBar);
    }
    
    const progressBar = loadingBar.querySelector('.map-loading-progress');
    progressBar.style.width = `${progress}%`;
}

/**
 * Hide loading progress
 */
function hideLoadingProgress(container) {
    const loadingBar = container.querySelector('.map-loading');
    if (loadingBar) {
        loadingBar.classList.add('complete');
        setTimeout(() => {
            if (loadingBar.parentNode) {
                loadingBar.parentNode.removeChild(loadingBar);
            }
        }, 500);
    }
}

/**
 * Zoom map in or out
 */
function zoomMap(delta) {
    const container = document.querySelector('.map-container');
    if (container && container._network) {
        const network = container._network;
        const scale = network.getScale() + delta;
        network.moveTo({ scale: Math.max(0.1, Math.min(2, scale)) });
    }
}

/**
 * Reset map zoom
 */
function resetMapZoom() {
    const container = document.querySelector('.map-container');
    if (container && container._network) {
        container._network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    }
}

/**
 * Filter map by category
 */
function filterMap(filter) {
    const container = document.querySelector('.map-container');
    if (!container || !container._network) return;
    
    const originalData = JSON.parse(container.dataset.originalData);
    const network = container._network;
    
    if (filter === 'all') {
        // Show all nodes
        network.setData({
            nodes: originalData.nodes,
            edges: originalData.edges
        });
    } else {
        // Filter nodes
        const filteredNodes = originalData.nodes.filter(node => 
            node.group === filter || node.group === 'core'
        );
        
        const filteredNodeIds = filteredNodes.map(node => node.id);
        
        // Filter edges
        const filteredEdges = originalData.edges.filter(edge => 
            filteredNodeIds.includes(edge.from) && filteredNodeIds.includes(edge.to)
        );
        
        // Update network
        network.setData({
            nodes: filteredNodes,
            edges: filteredEdges
        });
    }
}

/**
 * Search map for concepts
 */
function searchMap(query) {
    const container = document.querySelector('.map-container');
    if (!container || !container._network) return;
    
    const originalData = JSON.parse(container.dataset.originalData);
    const network = container._network;
    
    if (!query) {
        // Reset to original data
        network.setData({
            nodes: originalData.nodes,
            edges: originalData.edges
        });
        return;
    }
    
    // Convert query to lowercase for case-insensitive search
    query = query.toLowerCase();
    
    // Find matching nodes
    const matchingNodes = originalData.nodes.filter(node => 
        node.label.toLowerCase().includes(query) || 
        (node.description && node.description.toLowerCase().includes(query))
    );
    
    if (matchingNodes.length === 0) {
        // No matches found
        network.setData({ nodes: [], edges: [] });
        return;
    }
    
    const matchingNodeIds = matchingNodes.map(node => node.id);
    
    // Find connected edges
    const connectedEdges = originalData.edges.filter(edge => 
        matchingNodeIds.includes(edge.from) && matchingNodeIds.includes(edge.to)
    );
    
    // Update network
    network.setData({
        nodes: matchingNodes,
        edges: connectedEdges
    });
    
    // Highlight matching nodes
    network.selectNodes(matchingNodeIds);
    
    // Fit view to matching nodes
    network.fit({
        nodes: matchingNodeIds,
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
}

/**
 * Handle keyboard navigation in map
 */
function handleMapKeyboardNavigation(event) {
    const container = document.querySelector('.map-container');
    if (!container || !container._network) return;
    
    const network = container._network;
    
    switch (event.key) {
        case '+':
            zoomMap(0.2);
            event.preventDefault();
            break;
        case '-':
            zoomMap(-0.2);
            event.preventDefault();
            break;
        case '0':
            resetMapZoom();
            event.preventDefault();
            break;
        case 'ArrowUp':
            network.moveTo({ 
                position: { 
                    y: network.getViewPosition().y - 50 
                } 
            });
            event.preventDefault();
            break;
        case 'ArrowDown':
            network.moveTo({ 
                position: { 
                    y: network.getViewPosition().y + 50 
                } 
            });
            event.preventDefault();
            break;
        case 'ArrowLeft':
            network.moveTo({ 
                position: { 
                    x: network.getViewPosition().x - 50 
                } 
            });
            event.preventDefault();
            break;
        case 'ArrowRight':
            network.moveTo({ 
                position: { 
                    x: network.getViewPosition().x + 50 
                } 
            });
            event.preventDefault();
            break;
    }
}

/**
 * Get mock concept data for demonstration
 */
function getMockConceptData() {
    return {
        nodes: [
            { id: 1, label: 'Fine-Tuning', group: 'core', description: 'The process of adapting a pre-trained language model to a specific task or domain.' },
            { id: 2, label: 'LoRA', group: 'core', description: 'Low-Rank Adaptation, a parameter-efficient fine-tuning method that significantly reduces memory requirements.' },
            { id: 3, label: 'QLoRA', group: 'core', description: 'Quantized Low-Rank Adaptation, combining 4-bit quantization with LoRA for even more efficient fine-tuning.' },
            { id: 4, label: 'PEFT', group: 'core', description: 'Parameter-Efficient Fine-Tuning, a collection of techniques to adapt large models with minimal resources.' },
            { id: 5, label: 'Quantization', group: 'core', description: 'The process of reducing the precision of model weights to decrease memory usage.' },
            { id: 6, label: 'Instruction Tuning', group: 'related', description: 'Fine-tuning a model on instruction-response pairs to improve its ability to follow instructions.' },
            { id: 7, label: 'Prompt Engineering', group: 'related', description: 'The process of designing effective prompts to guide model behavior.' },
            { id: 8, label: 'Gradient Checkpointing', group: 'related', description: 'A technique to reduce memory usage during training by recomputing activations.' },
            { id: 9, label: 'Mixed Precision Training', group: 'related', description: 'Using lower precision formats (e.g., FP16) to speed up training and reduce memory usage.' },
            { id: 10, label: 'Adapters', group: 'related', description: 'Small neural modules inserted between transformer layers for parameter-efficient fine-tuning.' }
        ],
        edges: [
            { from: 1, to: 2 },
            { from: 1, to: 3 },
            { from: 1, to: 4 },
            { from: 1, to: 6 },
            { from: 2, to: 3 },
            { from: 2, to: 4 },
            { from: 3, to: 5 },
            { from: 4, to: 10 },
            { from: 6, to: 7 },
            { from: 8, to: 1 },
            { from: 9, to: 1 }
        ]
    };
}
