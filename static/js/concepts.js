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
                
                // Create an iframe to display the visualization
                conceptsVisualization.innerHTML = `<iframe src="${data.visualization_path}" style="width: 100%; height: 500px; border: none;"></iframe>`;
                
                // Add zoom controls
                const zoomInBtn = document.getElementById('concepts-zoom-in-btn');
                const zoomOutBtn = document.getElementById('concepts-zoom-out-btn');
                const resetZoomBtn = document.getElementById('concepts-reset-zoom-btn');
                
                if (zoomInBtn && zoomOutBtn && resetZoomBtn) {
                    // Get the iframe
                    const iframe = conceptsVisualization.querySelector('iframe');
                    
                    // Add event listeners to zoom buttons
                    zoomInBtn.addEventListener('click', function() {
                        iframe.contentWindow.postMessage({ action: 'zoomIn' }, '*');
                    });
                    
                    zoomOutBtn.addEventListener('click', function() {
                        iframe.contentWindow.postMessage({ action: 'zoomOut' }, '*');
                    });
                    
                    resetZoomBtn.addEventListener('click', function() {
                        iframe.contentWindow.postMessage({ action: 'resetZoom' }, '*');
                    });
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
