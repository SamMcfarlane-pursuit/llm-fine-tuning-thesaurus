/**
 * Enhanced Visualization Controls
 * Provides improved stability and control for concept maps with better zoom features
 */

class EnhancedVisualization {
    constructor() {
        this.initialized = false;
        this.iframe = null;
        this.network = null;
        this.container = null;
        this.zoomLevel = 1.0;
        this.minZoom = 0.2;
        this.maxZoom = 3.0;
        this.zoomStep = 0.2;
        this.isDragging = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.currentPosition = { x: 0, y: 0 };
        this.stabilizationAttempts = 0;
        this.maxStabilizationAttempts = 3;
        this.stabilizationTimeout = null;
        this.wheelZoomEnabled = true;
        this.keyboardNavigationEnabled = true;
        this.touchZoomEnabled = true;
        this.pinchZoomEnabled = true;
        this.zoomControls = null;
        this.zoomDisplay = null;
        this.stabilizationIndicator = null;
    }

    /**
     * Initialize the enhanced visualization
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Enhanced Visualization Controls...');
        
        try {
            // Find the visualization container and iframe
            this.container = document.getElementById('visualization-container') || document.getElementById('network-container');
            this.iframe = this.container ? this.container.querySelector('iframe') : null;
            
            if (!this.container || !this.iframe) {
                console.warn('Visualization container or iframe not found');
                return;
            }
            
            // Create enhanced zoom controls
            this.createZoomControls();
            
            // Add event listeners
            this.addEventListeners();
            
            // Add stabilization indicator
            this.createStabilizationIndicator();
            
            // Initialize network access
            this.initNetworkAccess();
            
            this.initialized = true;
            console.log('Enhanced Visualization Controls initialized successfully');
        } catch (error) {
            console.error('Error initializing Enhanced Visualization Controls:', error);
        }
    }

    /**
     * Create enhanced zoom controls
     */
    createZoomControls() {
        // Remove existing zoom controls if any
        const existingControls = this.container.querySelector('.enhanced-zoom-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Create new zoom controls
        this.zoomControls = document.createElement('div');
        this.zoomControls.className = 'enhanced-zoom-controls';
        this.zoomControls.innerHTML = `
            <div class="zoom-control-panel">
                <button class="zoom-btn zoom-in-btn" title="Zoom In">
                    <i class="bi bi-plus-lg"></i>
                </button>
                <div class="zoom-display">100%</div>
                <button class="zoom-btn zoom-out-btn" title="Zoom Out">
                    <i class="bi bi-dash-lg"></i>
                </button>
                <button class="zoom-btn reset-btn" title="Reset View">
                    <i class="bi bi-arrows-fullscreen"></i>
                </button>
                <button class="zoom-btn fullscreen-btn" title="Fullscreen">
                    <i class="bi bi-fullscreen"></i>
                </button>
            </div>
            <div class="zoom-slider-container">
                <input type="range" min="20" max="300" value="100" class="zoom-slider" title="Zoom Level">
            </div>
            <div class="visualization-options">
                <button class="option-btn physics-btn active" title="Toggle Physics">
                    <i class="bi bi-gear"></i>
                </button>
                <button class="option-btn labels-btn active" title="Toggle Labels">
                    <i class="bi bi-tag"></i>
                </button>
                <button class="option-btn stabilize-btn" title="Stabilize Network">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
            </div>
        `;
        
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-zoom-controls {
                position: absolute;
                top: 15px;
                right: 15px;
                background: linear-gradient(135deg, rgba(25, 25, 25, 0.9), rgba(35, 35, 35, 0.9));
                border-radius: 15px;
                padding: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(66, 135, 245, 0.4);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                transition: all 0.3s ease;
            }
            
            .enhanced-zoom-controls:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 135, 245, 0.3);
            }
            
            .zoom-control-panel {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .zoom-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(50, 50, 50, 0.95));
                border: 1px solid rgba(66, 135, 245, 0.4);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
                font-size: 1rem;
            }
            
            .zoom-btn:hover {
                background: linear-gradient(135deg, rgba(66, 135, 245, 0.8), rgba(58, 117, 216, 0.8));
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(66, 135, 245, 0.5);
            }
            
            .zoom-btn:active {
                transform: translateY(1px);
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
            }
            
            .zoom-display {
                background: rgba(15, 15, 15, 0.8);
                border-radius: 10px;
                padding: 5px 10px;
                color: white;
                font-weight: 600;
                min-width: 60px;
                text-align: center;
                border: 1px solid rgba(66, 135, 245, 0.3);
                font-size: 0.9rem;
            }
            
            .zoom-slider-container {
                width: 100%;
                padding: 0 5px;
            }
            
            .zoom-slider {
                width: 100%;
                height: 6px;
                -webkit-appearance: none;
                appearance: none;
                background: rgba(15, 15, 15, 0.8);
                border-radius: 3px;
                outline: none;
                cursor: pointer;
            }
            
            .zoom-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #4287f5;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(66, 135, 245, 0.7);
                border: 2px solid white;
            }
            
            .zoom-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #4287f5;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(66, 135, 245, 0.7);
                border: 2px solid white;
            }
            
            .visualization-options {
                display: flex;
                gap: 8px;
                margin-top: 5px;
            }
            
            .option-btn {
                flex: 1;
                height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(50, 50, 50, 0.95));
                border: 1px solid rgba(66, 135, 245, 0.4);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
                font-size: 0.9rem;
            }
            
            .option-btn:hover {
                background: linear-gradient(135deg, rgba(66, 135, 245, 0.8), rgba(58, 117, 216, 0.8));
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(66, 135, 245, 0.5);
            }
            
            .option-btn.active {
                background: linear-gradient(135deg, rgba(66, 135, 245, 0.8), rgba(58, 117, 216, 0.8));
                border-color: white;
            }
            
            .stabilization-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                border-radius: 15px;
                padding: 20px;
                color: white;
                text-align: center;
                z-index: 1001;
                display: none;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                border: 2px solid rgba(66, 135, 245, 0.5);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            
            .stabilization-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(66, 135, 245, 0.3);
                border-radius: 50%;
                border-top-color: #4287f5;
                margin: 0 auto 15px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .enhanced-zoom-controls {
                    top: 10px;
                    right: 10px;
                    padding: 8px;
                }
                
                .zoom-btn {
                    width: 30px;
                    height: 30px;
                    font-size: 0.8rem;
                }
                
                .zoom-display {
                    min-width: 50px;
                    font-size: 0.8rem;
                }
            }
        `;
        
        // Add to container
        this.container.appendChild(style);
        this.container.appendChild(this.zoomControls);
        
        // Store references
        this.zoomDisplay = this.zoomControls.querySelector('.zoom-display');
        this.zoomSlider = this.zoomControls.querySelector('.zoom-slider');
    }

    /**
     * Create stabilization indicator
     */
    createStabilizationIndicator() {
        this.stabilizationIndicator = document.createElement('div');
        this.stabilizationIndicator.className = 'stabilization-indicator';
        this.stabilizationIndicator.innerHTML = `
            <div class="stabilization-spinner"></div>
            <div>Stabilizing network...</div>
        `;
        
        this.container.appendChild(this.stabilizationIndicator);
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Zoom in button
        const zoomInBtn = this.zoomControls.querySelector('.zoom-in-btn');
        zoomInBtn.addEventListener('click', () => {
            this.zoomIn();
        });
        
        // Zoom out button
        const zoomOutBtn = this.zoomControls.querySelector('.zoom-out-btn');
        zoomOutBtn.addEventListener('click', () => {
            this.zoomOut();
        });
        
        // Reset button
        const resetBtn = this.zoomControls.querySelector('.reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetView();
        });
        
        // Fullscreen button
        const fullscreenBtn = this.zoomControls.querySelector('.fullscreen-btn');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Zoom slider
        this.zoomSlider.addEventListener('input', () => {
            const zoomValue = parseInt(this.zoomSlider.value) / 100;
            this.setZoom(zoomValue);
        });
        
        // Physics toggle
        const physicsBtn = this.zoomControls.querySelector('.physics-btn');
        physicsBtn.addEventListener('click', () => {
            physicsBtn.classList.toggle('active');
            this.togglePhysics(physicsBtn.classList.contains('active'));
        });
        
        // Labels toggle
        const labelsBtn = this.zoomControls.querySelector('.labels-btn');
        labelsBtn.addEventListener('click', () => {
            labelsBtn.classList.toggle('active');
            this.toggleLabels(labelsBtn.classList.contains('active'));
        });
        
        // Stabilize button
        const stabilizeBtn = this.zoomControls.querySelector('.stabilize-btn');
        stabilizeBtn.addEventListener('click', () => {
            this.stabilizeNetwork();
        });
        
        // Keyboard navigation
        if (this.keyboardNavigationEnabled) {
            document.addEventListener('keydown', (e) => {
                // Only handle keyboard events if the iframe is focused
                if (document.activeElement === this.iframe) {
                    switch (e.key) {
                        case '+':
                        case '=':
                            this.zoomIn();
                            e.preventDefault();
                            break;
                        case '-':
                        case '_':
                            this.zoomOut();
                            e.preventDefault();
                            break;
                        case '0':
                            this.resetView();
                            e.preventDefault();
                            break;
                        case 'ArrowUp':
                            this.pan(0, -50);
                            e.preventDefault();
                            break;
                        case 'ArrowDown':
                            this.pan(0, 50);
                            e.preventDefault();
                            break;
                        case 'ArrowLeft':
                            this.pan(-50, 0);
                            e.preventDefault();
                            break;
                        case 'ArrowRight':
                            this.pan(50, 0);
                            e.preventDefault();
                            break;
                    }
                }
            });
        }
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.updateFullscreenButton();
        });
        document.addEventListener('mozfullscreenchange', () => {
            this.updateFullscreenButton();
        });
        document.addEventListener('MSFullscreenChange', () => {
            this.updateFullscreenButton();
        });
    }

    /**
     * Initialize network access
     */
    initNetworkAccess() {
        // Wait for iframe to load
        this.iframe.addEventListener('load', () => {
            // Try to access the network object
            try {
                setTimeout(() => {
                    this.accessNetwork();
                }, 1000);
            } catch (error) {
                console.error('Error accessing network:', error);
            }
        });
        
        // If iframe is already loaded, try to access network
        if (this.iframe.contentDocument && this.iframe.contentDocument.readyState === 'complete') {
            setTimeout(() => {
                this.accessNetwork();
            }, 1000);
        }
    }

    /**
     * Access the network object in the iframe
     */
    accessNetwork() {
        try {
            if (this.iframe && this.iframe.contentWindow && this.iframe.contentWindow.network) {
                this.network = this.iframe.contentWindow.network;
                console.log('Successfully accessed network object');
                
                // Add event listeners to network
                this.addNetworkEventListeners();
                
                // Initial stabilization
                this.stabilizeNetwork();
            } else {
                console.warn('Network object not found in iframe');
                
                // Retry after a delay
                setTimeout(() => {
                    this.accessNetwork();
                }, 1000);
            }
        } catch (error) {
            console.error('Error accessing network object:', error);
        }
    }

    /**
     * Add event listeners to the network
     */
    addNetworkEventListeners() {
        if (!this.network) return;
        
        try {
            // Listen for stabilization start
            this.network.on('stabilizationStart', () => {
                this.showStabilizationIndicator();
            });
            
            // Listen for stabilization done
            this.network.on('stabilizationDone', () => {
                this.hideStabilizationIndicator();
            });
            
            // Listen for zoom events
            this.network.on('zoom', (params) => {
                this.updateZoomDisplay(params.scale);
            });
            
            // Add wheel zoom if enabled
            if (this.wheelZoomEnabled) {
                this.iframe.contentDocument.addEventListener('wheel', (e) => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                        const delta = e.deltaY < 0 ? 0.1 : -0.1;
                        const newZoom = this.zoomLevel + delta;
                        this.setZoom(newZoom);
                    }
                }, { passive: false });
            }
            
            console.log('Network event listeners added');
        } catch (error) {
            console.error('Error adding network event listeners:', error);
        }
    }

    /**
     * Zoom in
     */
    zoomIn() {
        const newZoom = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
        this.setZoom(newZoom);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        const newZoom = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
        this.setZoom(newZoom);
    }

    /**
     * Set zoom level
     */
    setZoom(zoomLevel) {
        if (!this.network) return;
        
        try {
            // Clamp zoom level
            this.zoomLevel = Math.max(this.minZoom, Math.min(zoomLevel, this.maxZoom));
            
            // Update network zoom
            const position = this.network.getViewPosition();
            this.network.moveTo({
                position: position,
                scale: this.zoomLevel,
                animation: {
                    duration: 300,
                    easingFunction: 'easeInOutQuad'
                }
            });
            
            // Update zoom display
            this.updateZoomDisplay(this.zoomLevel);
            
            // Update zoom slider
            this.zoomSlider.value = Math.round(this.zoomLevel * 100);
        } catch (error) {
            console.error('Error setting zoom:', error);
        }
    }

    /**
     * Update zoom display
     */
    updateZoomDisplay(zoomLevel) {
        if (!this.zoomDisplay) return;
        
        // Update zoom level
        this.zoomLevel = zoomLevel;
        
        // Update display
        const percentage = Math.round(zoomLevel * 100);
        this.zoomDisplay.textContent = `${percentage}%`;
        
        // Update slider if it doesn't match
        if (parseInt(this.zoomSlider.value) !== percentage) {
            this.zoomSlider.value = percentage;
        }
    }

    /**
     * Reset view
     */
    resetView() {
        if (!this.network) return;
        
        try {
            // Fit the network to the container
            this.network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });
            
            // Update zoom level after animation
            setTimeout(() => {
                this.updateZoomDisplay(this.network.getScale());
            }, 1100);
        } catch (error) {
            console.error('Error resetting view:', error);
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement &&
                !document.webkitFullscreenElement &&
                !document.mozFullScreenElement &&
                !document.msFullscreenElement) {
                // Enter fullscreen
                if (this.container.requestFullscreen) {
                    this.container.requestFullscreen();
                } else if (this.container.webkitRequestFullscreen) {
                    this.container.webkitRequestFullscreen();
                } else if (this.container.mozRequestFullScreen) {
                    this.container.mozRequestFullScreen();
                } else if (this.container.msRequestFullscreen) {
                    this.container.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }

    /**
     * Update fullscreen button
     */
    updateFullscreenButton() {
        const fullscreenBtn = this.zoomControls.querySelector('.fullscreen-btn');
        if (!fullscreenBtn) return;
        
        if (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
        } else {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
            fullscreenBtn.setAttribute('title', 'Fullscreen');
        }
    }

    /**
     * Pan the network
     */
    pan(x, y) {
        if (!this.network) return;
        
        try {
            const position = this.network.getViewPosition();
            this.network.moveTo({
                position: {
                    x: position.x + x,
                    y: position.y + y
                },
                animation: {
                    duration: 300,
                    easingFunction: 'easeInOutQuad'
                }
            });
        } catch (error) {
            console.error('Error panning network:', error);
        }
    }

    /**
     * Toggle physics
     */
    togglePhysics(enabled) {
        if (!this.network) return;
        
        try {
            this.network.setOptions({
                physics: {
                    enabled: enabled
                }
            });
            
            if (enabled) {
                // Stabilize the network when physics is enabled
                this.stabilizeNetwork();
            }
        } catch (error) {
            console.error('Error toggling physics:', error);
        }
    }

    /**
     * Toggle labels
     */
    toggleLabels(enabled) {
        if (!this.network) return;
        
        try {
            this.network.setOptions({
                nodes: {
                    font: {
                        size: enabled ? 16 : 0
                    }
                },
                edges: {
                    font: {
                        size: enabled ? 12 : 0
                    }
                }
            });
        } catch (error) {
            console.error('Error toggling labels:', error);
        }
    }

    /**
     * Stabilize the network
     */
    stabilizeNetwork() {
        if (!this.network) return;
        
        try {
            // Show stabilization indicator
            this.showStabilizationIndicator();
            
            // Stabilize the network
            this.network.stabilize(100);
            
            // Set a timeout to hide the indicator if stabilization takes too long
            clearTimeout(this.stabilizationTimeout);
            this.stabilizationTimeout = setTimeout(() => {
                this.hideStabilizationIndicator();
            }, 5000);
        } catch (error) {
            console.error('Error stabilizing network:', error);
            this.hideStabilizationIndicator();
        }
    }

    /**
     * Show stabilization indicator
     */
    showStabilizationIndicator() {
        if (!this.stabilizationIndicator) return;
        
        this.stabilizationIndicator.style.display = 'block';
    }

    /**
     * Hide stabilization indicator
     */
    hideStabilizationIndicator() {
        if (!this.stabilizationIndicator) return;
        
        this.stabilizationIndicator.style.display = 'none';
    }
}

// Initialize the enhanced visualization
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Wait a bit to ensure the visualization is loaded
        setTimeout(() => {
            window.enhancedVisualization = new EnhancedVisualization();
            window.enhancedVisualization.init();
        }, 1000);
    } catch (error) {
        console.error('Error initializing Enhanced Visualization:', error);
    }
});
