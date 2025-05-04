/**
 * LLM Concepts visualization functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const conceptsVisualization = document.getElementById('concepts-visualization');

    // Fetch and display the concepts visualization
    if (conceptsVisualization) {
        // Show loading state
        conceptsVisualization.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading concept map...</p></div>';

        // Fetch concepts visualization
        fetch('/api/llm-concepts-visualization')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    conceptsVisualization.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    return;
                }

                // Check if visualization_path exists
                if (data.visualization_path) {
                    // Create an iframe to display the visualization
                    conceptsVisualization.innerHTML = `<iframe src="${data.visualization_path}" style="width: 100%; height: 500px; border: none;"></iframe>`;
                } else {
                    // Create a direct visualization using vis.js
                    conceptsVisualization.innerHTML = '';

                    try {
                        // Create nodes and edges from data
                        const nodes = new vis.DataSet(data.nodes || []);
                        const edges = new vis.DataSet(data.edges || []);

                        const networkData = {
                            nodes: nodes,
                            edges: edges
                        };

                        const options = {
                            nodes: {
                                shape: 'dot',
                                size: 16,
                                font: {
                                    size: 14,
                                    face: 'Roboto, Arial, sans-serif',
                                    color: '#ffffff'
                                },
                                borderWidth: 2,
                                shadow: true
                            },
                            edges: {
                                width: 2,
                                smooth: {
                                    type: 'continuous'
                                },
                                color: {
                                    color: '#848484',
                                    highlight: '#4287f5'
                                }
                            },
                            physics: {
                                stabilization: {
                                    iterations: 100
                                },
                                barnesHut: {
                                    gravitationalConstant: -80000,
                                    centralGravity: 0.3,
                                    springLength: 250,
                                    springConstant: 0.01,
                                    damping: 0.09
                                }
                            },
                            interaction: {
                                hover: true,
                                tooltipDelay: 200,
                                zoomView: true,
                                dragView: true
                            }
                        };

                        // Create the network
                        window.conceptsNetwork = new vis.Network(conceptsVisualization, networkData, options);

                        // Fit the network to the container
                        window.conceptsNetwork.fit();
                    } catch (error) {
                        console.error('Error creating visualization:', error);
                        conceptsVisualization.innerHTML = '<div class="alert alert-danger">Error creating visualization. Please try again.</div>';
                    }
                }

                // Add zoom controls
                const zoomInBtn = document.getElementById('concepts-zoom-in-btn');
                const zoomOutBtn = document.getElementById('concepts-zoom-out-btn');
                const resetZoomBtn = document.getElementById('concepts-reset-zoom-btn');

                if (zoomInBtn && zoomOutBtn && resetZoomBtn) {
                    // Check if we're using iframe or direct visualization
                    const iframe = conceptsVisualization.querySelector('iframe');

                    if (iframe) {
                        // Add event listeners for iframe visualization
                        zoomInBtn.addEventListener('click', function() {
                            iframe.contentWindow.postMessage({ action: 'zoomIn' }, '*');
                        });

                        zoomOutBtn.addEventListener('click', function() {
                            iframe.contentWindow.postMessage({ action: 'zoomOut' }, '*');
                        });

                        resetZoomBtn.addEventListener('click', function() {
                            iframe.contentWindow.postMessage({ action: 'resetZoom' }, '*');
                        });
                    } else if (window.conceptsNetwork) {
                        // Add event listeners for direct visualization
                        zoomInBtn.addEventListener('click', function() {
                            const currentScale = window.conceptsNetwork.getScale();
                            window.conceptsNetwork.moveTo({ scale: currentScale * 1.2 });
                        });

                        zoomOutBtn.addEventListener('click', function() {
                            const currentScale = window.conceptsNetwork.getScale();
                            window.conceptsNetwork.moveTo({ scale: currentScale * 0.8 });
                        });

                        resetZoomBtn.addEventListener('click', function() {
                            window.conceptsNetwork.fit();
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching concepts visualization:', error);
                conceptsVisualization.innerHTML = '<div class="alert alert-danger">Error loading concept map. Please try again.</div>';
            });
    }

    // Add event listeners to concept links
    document.querySelectorAll('.concept-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const concept = this.dataset.concept;

            // Redirect to concept page
            window.location.href = `/concept/${concept}`;
        });
    });
});
