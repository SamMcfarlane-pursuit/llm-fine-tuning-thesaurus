// Main JavaScript for the Visual Thesaurus LLM

// DOM elements
const wordInput = document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const networkContainer = document.getElementById('network-container');
const visualizationPlaceholder = document.getElementById('visualization-placeholder');
const synonymsList = document.getElementById('synonyms-list');
const antonymsList = document.getElementById('antonyms-list');
const relatedList = document.getElementById('related-list');
const relationButtons = document.querySelectorAll('[data-relation]');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');
const answerContainer = document.getElementById('answer-container');
const answerText = document.getElementById('answer-text');
const conceptsVisualization = document.getElementById('concepts-visualization');
const conceptsZoomInBtn = document.getElementById('concepts-zoom-in-btn');
const conceptsZoomOutBtn = document.getElementById('concepts-zoom-out-btn');
const conceptsResetZoomBtn = document.getElementById('concepts-reset-zoom-btn');

// Current state
let currentWord = '';
let currentRelation = 'hypernyms';
let network = null;

// Initialize the page
function init() {
    // Add event listeners
    searchBtn.addEventListener('click', searchWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });

    relationButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            relationButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current relation
            currentRelation = button.dataset.relation;

            // Fetch related terms
            if (currentWord) {
                fetchRelatedTerms(currentWord, currentRelation);
            }
        });
    });

    askBtn.addEventListener('click', askQuestion);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            askQuestion();
        }
    });

    // Add click event listeners for concept badges
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('click', () => {
            wordInput.value = badge.textContent.trim();
            searchWord();
        });
    });

    // Setup LLM concepts visualization
    if (conceptsVisualization) {
        loadLLMConceptsVisualization();

        // Setup zoom buttons for concepts visualization
        if (conceptsZoomInBtn) {
            conceptsZoomInBtn.addEventListener('click', zoomInConcepts);
        }

        if (conceptsZoomOutBtn) {
            conceptsZoomOutBtn.addEventListener('click', zoomOutConcepts);
        }

        if (conceptsResetZoomBtn) {
            conceptsResetZoomBtn.addEventListener('click', resetZoomConcepts);
        }
    }
}

// Search for a word or sentence
function searchWord() {
    let input = wordInput.value.trim().toLowerCase();

    if (!input) {
        alert('Please enter a word or sentence to search');
        return;
    }

    // Keep the original input for the API call
    let word = input;

    // Check if it's a question or sentence
    const isQuestion = input.includes('?') ||
                      input.startsWith('how') ||
                      input.startsWith('what') ||
                      input.startsWith('why') ||
                      input.startsWith('when') ||
                      input.startsWith('where') ||
                      input.startsWith('which') ||
                      input.startsWith('who') ||
                      input.startsWith('can') ||
                      input.startsWith('does');

    // If it's a question, we'll handle it differently in the backend
    if (isQuestion) {
        console.log(`Input appears to be a question: '${input}'`);
    }

    // Update current word
    currentWord = word;

    // Show loading state
    showLoading();

    // Hide placeholder and show zoom controls
    if (visualizationPlaceholder) {
        visualizationPlaceholder.style.display = 'none';
    }

    const zoomControls = document.getElementById('zoom-controls');
    if (zoomControls) {
        zoomControls.style.display = 'block';
    }

    // Fetch thesaurus data
    fetchThesaurusData(word);

    // Fetch synonyms and antonyms
    fetchSynonyms(word);
    fetchAntonyms(word);
    fetchRelatedTerms(word, currentRelation);
}

// Fetch thesaurus data for visualization
function fetchThesaurusData(word) {
    fetch(`/api/thesaurus/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Hide placeholder
            if (visualizationPlaceholder) {
                visualizationPlaceholder.style.display = 'none';
            }

            // Show zoom controls
            const zoomControls = document.getElementById('zoom-controls');
            if (zoomControls) {
                zoomControls.style.display = 'block';
            }

            // Create visualization
            createVisualization(data);
        })
        .catch(error => {
            console.error('Error fetching thesaurus data:', error);
            alert('Error fetching thesaurus data. Please try again.');
            hideLoading();
        });
}

// Create the network visualization
function createVisualization(data) {
    // Create an iframe to load the visualization
    const iframe = document.createElement('iframe');
    iframe.src = data.visualization_path;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Clear the container and add the iframe
    networkContainer.innerHTML = '';
    networkContainer.appendChild(iframe);

    // Setup zoom buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            zoomIn();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            zoomOut();
        });
    }

    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            resetZoom();
        });
    }

    // Hide loading
    hideLoading();
}

// Zoom functions
function zoomIn() {
    try {
        const iframe = document.querySelector('#network-container iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.network) {
            const network = iframe.contentWindow.network;
            const scale = network.getScale() * 1.2;
            const position = network.getViewPosition();
            network.moveTo({
                position: position,
                scale: scale
            });
        }
    } catch (e) {
        console.error('Error zooming in:', e);
    }
}

function zoomOut() {
    try {
        const iframe = document.querySelector('#network-container iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.network) {
            const network = iframe.contentWindow.network;
            const scale = network.getScale() / 1.2;
            const position = network.getViewPosition();
            network.moveTo({
                position: position,
                scale: scale
            });
        }
    } catch (e) {
        console.error('Error zooming out:', e);
    }
}

function resetZoom() {
    try {
        const iframe = document.querySelector('#network-container iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.network) {
            const network = iframe.contentWindow.network;
            network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });
        }
    } catch (e) {
        console.error('Error resetting zoom:', e);
    }
}

// Fetch synonyms for a word
function fetchSynonyms(word) {
    fetch(`/api/synonyms/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display synonyms
            displayWordList(synonymsList, data.synonyms, 'synonym');
        })
        .catch(error => {
            console.error('Error fetching synonyms:', error);
            synonymsList.innerHTML = '<p>Error fetching synonyms</p>';
        });
}

// Fetch antonyms for a word
function fetchAntonyms(word) {
    fetch(`/api/antonyms/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display antonyms
            displayWordList(antonymsList, data.antonyms, 'antonym');
        })
        .catch(error => {
            console.error('Error fetching antonyms:', error);
            antonymsList.innerHTML = '<p>Error fetching antonyms</p>';
        });
}

// Fetch related terms for a word
function fetchRelatedTerms(word, relationType) {
    fetch(`/api/related/${word}?type=${relationType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display related terms
            displayWordList(relatedList, data.terms, relationType === 'hypernyms' ? 'hypernym' : 'hyponym');
        })
        .catch(error => {
            console.error('Error fetching related terms:', error);
            relatedList.innerHTML = '<p>Error fetching related terms</p>';
        });
}

// Display a list of words
function displayWordList(container, words, className) {
    container.innerHTML = '';

    if (!words || words.length === 0) {
        container.innerHTML = '<p>No results found</p>';
        return;
    }

    words.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = `word-item ${className}`;
        wordItem.textContent = word;
        wordItem.addEventListener('click', () => {
            window.location.href = `/visualize/${word}`;
        });
        container.appendChild(wordItem);
    });
}

// Ask a question
function askQuestion() {
    const question = questionInput.value.trim();
    const useStreaming = document.getElementById('use-streaming')?.checked || false;

    if (!question) {
        alert('Please enter a question');
        return;
    }

    // Show loading
    askBtn.disabled = true;
    askBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Asking...';

    // Clear previous answer
    answerText.textContent = '';
    answerContainer.style.display = 'block';

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Send question to API
    fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ question, streaming: useStreaming })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.streaming) {
                // Handle streaming response
                handleStreamingResponse(data.stream_url);
            } else {
                // Display answer
                answerText.textContent = data.answer;

                // Reset button
                askBtn.disabled = false;
                askBtn.textContent = 'Ask';
            }
        })
        .catch(error => {
            console.error('Error asking question:', error);
            alert('Error asking question. Please try again.');

            // Reset button
            askBtn.disabled = false;
            askBtn.textContent = 'Ask';
        });
}

// Handle streaming response
function handleStreamingResponse(streamUrl) {
    // Create an EventSource to receive the streaming response
    const eventSource = new EventSource(streamUrl);

    // Handle incoming data
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);

        if (data.error) {
            // Handle error
            answerText.textContent = `Error: ${data.error}`;
            eventSource.close();
            askBtn.disabled = false;
            askBtn.textContent = 'Ask';
        } else if (data.done) {
            // Stream is complete
            eventSource.close();
            askBtn.disabled = false;
            askBtn.textContent = 'Ask';
        } else if (data.text) {
            // Update the answer with the streamed text
            answerText.textContent = data.text;
        }
    };

    // Handle errors
    eventSource.onerror = function(error) {
        console.error('Error with streaming response:', error);
        answerText.textContent += '\n\nError: Connection lost. Please try again.';
        eventSource.close();
        askBtn.disabled = false;
        askBtn.textContent = 'Ask';
    };
}

// Show loading state
function showLoading() {
    networkContainer.innerHTML = `
        <div class="spinner-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Hide loading state
function hideLoading() {
    // Loading is hidden when the visualization is created
}

// Load LLM concepts visualization
function loadLLMConceptsVisualization() {
    // Show loading indicator
    if (conceptsVisualization) {
        conceptsVisualization.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-3">Loading visualization...</span>
            </div>
        `;
    }

    fetch('/api/llm-concepts-visualization')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Create a visualization directly from the data
            createConceptsVisualization(data);
        })
        .catch(error => {
            console.error('Error loading LLM concepts visualization:', error);
            if (conceptsVisualization) {
                conceptsVisualization.innerHTML =
                    '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error loading visualization. Please try refreshing the page.</div>';
            }
        });
}

// Create concepts visualization from data
function createConceptsVisualization(data) {
    try {
        // Check if the visualization container exists
        if (!conceptsVisualization) {
            console.error('Concepts visualization container not found');
            return;
        }

        // Check if the data is valid
        if (!data || !data.nodes || !data.edges) {
            console.error('Invalid visualization data:', data);
            conceptsVisualization.innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Invalid visualization data. Please try refreshing the page.</div>';
            return;
        }

        // Create a container for the visualization
        const visContainer = document.createElement('div');
        visContainer.style.width = '100%';
        visContainer.style.height = '100%';
        visContainer.id = 'concepts-network';

        // Clear the container and add the visualization container
        conceptsVisualization.innerHTML = '';
        conceptsVisualization.appendChild(visContainer);

        // Create the network
        const nodes = new vis.DataSet(data.nodes);
        const edges = new vis.DataSet(data.edges);

        const networkData = {
            nodes: nodes,
            edges: edges
        };

        // Enhanced options for better visualization
        const options = {
            nodes: {
                shape: 'dot',
                size: 18,
                font: {
                    size: 16,
                    face: 'Roboto, Arial, sans-serif',
                    color: '#ffffff',
                    strokeWidth: 2,
                    strokeColor: 'rgba(0, 0, 0, 0.5)'
                },
                borderWidth: 2,
                shadow: true,
                scaling: {
                    label: {
                        enabled: true,
                        min: 14,
                        max: 24
                    }
                }
            },
            edges: {
                width: 2,
                smooth: {
                    type: 'continuous',
                    forceDirection: 'none'
                },
                color: {
                    color: '#848484',
                    highlight: '#4287f5',
                    hover: '#4287f5'
                },
                selectionWidth: 3
            },
            physics: {
                stabilization: {
                    iterations: 200,
                    fit: true
                },
                barnesHut: {
                    gravitationalConstant: -80000,
                    centralGravity: 0.3,
                    springLength: 250,
                    springConstant: 0.01,
                    damping: 0.09,
                    avoidOverlap: 0.2
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true,
                navigationButtons: true,
                keyboard: {
                    enabled: true,
                    bindToWindow: false
                },
                multiselect: false
            },
            layout: {
                improvedLayout: true
            }
        };

        // Create the network
        const network = new vis.Network(visContainer, networkData, options);

        // Make the network accessible to zoom functions
        window.conceptsNetwork = network;

        // Add loading indicator during stabilization
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'network-loading';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Stabilizing network...</span>
            </div>
            <span class="ms-2">Stabilizing visualization...</span>
        `;
        loadingIndicator.style.position = 'absolute';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '15px 20px';
        loadingIndicator.style.borderRadius = '8px';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.zIndex = '1000';
        conceptsVisualization.appendChild(loadingIndicator);

        // Add event listeners
        network.on('stabilizationProgress', function(params) {
            const progress = Math.round(params.iterations / params.total * 100);
            console.log(`Stabilization progress: ${progress}%`);
        });

        network.on('stabilizationIterationsDone', function() {
            console.log('Stabilization complete');
            // Remove loading indicator
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        });

        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                console.log(`Clicked node: ${nodeId}`);

                // Navigate to the concept page
                window.location.href = `/concept/${encodeURIComponent(nodeId)}`;
            }
        });

        // Fit the network to the container
        network.once("afterDrawing", function() {
            setTimeout(function() {
                network.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }, 200);
        });
    } catch (error) {
        console.error('Error creating concepts visualization:', error);
        if (conceptsVisualization) {
            conceptsVisualization.innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error creating visualization: ' + error.message + '. Please try refreshing the page.</div>';
        }
    }
}

// Zoom functions for concepts visualization
function zoomInConcepts() {
    try {
        if (window.conceptsNetwork) {
            const network = window.conceptsNetwork;
            const scale = network.getScale() * 1.2;
            const position = network.getViewPosition();

            // Add visual feedback for zoom action
            const zoomInBtn = document.getElementById('concepts-zoom-in-btn');
            if (zoomInBtn) {
                zoomInBtn.classList.add('active');
                setTimeout(() => zoomInBtn.classList.remove('active'), 300);
            }

            network.moveTo({
                position: position,
                scale: scale,
                animation: {
                    duration: 300,
                    easingFunction: 'easeInOutQuad'
                }
            });

            // Log zoom level for debugging
            console.log(`Zoomed in to scale: ${scale.toFixed(2)}`);
        } else {
            console.warn('Concepts network not initialized for zoom in');
        }
    } catch (e) {
        console.error('Error zooming in concepts:', e);
        // Show error message to user
        const errorToast = document.createElement('div');
        errorToast.className = 'alert alert-warning position-fixed bottom-0 end-0 m-3';
        errorToast.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Error zooming in';
        errorToast.style.zIndex = '9999';
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.remove(), 3000);
    }
}

function zoomOutConcepts() {
    try {
        if (window.conceptsNetwork) {
            const network = window.conceptsNetwork;
            const scale = network.getScale() / 1.2;
            const position = network.getViewPosition();

            // Add visual feedback for zoom action
            const zoomOutBtn = document.getElementById('concepts-zoom-out-btn');
            if (zoomOutBtn) {
                zoomOutBtn.classList.add('active');
                setTimeout(() => zoomOutBtn.classList.remove('active'), 300);
            }

            network.moveTo({
                position: position,
                scale: scale,
                animation: {
                    duration: 300,
                    easingFunction: 'easeInOutQuad'
                }
            });

            // Log zoom level for debugging
            console.log(`Zoomed out to scale: ${scale.toFixed(2)}`);
        } else {
            console.warn('Concepts network not initialized for zoom out');
        }
    } catch (e) {
        console.error('Error zooming out concepts:', e);
        // Show error message to user
        const errorToast = document.createElement('div');
        errorToast.className = 'alert alert-warning position-fixed bottom-0 end-0 m-3';
        errorToast.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Error zooming out';
        errorToast.style.zIndex = '9999';
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.remove(), 3000);
    }
}

function resetZoomConcepts() {
    try {
        if (window.conceptsNetwork) {
            const network = window.conceptsNetwork;

            // Add visual feedback for reset action
            const resetZoomBtn = document.getElementById('concepts-reset-zoom-btn');
            if (resetZoomBtn) {
                resetZoomBtn.classList.add('active');
                setTimeout(() => resetZoomBtn.classList.remove('active'), 1000);
            }

            network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });

            console.log('Reset zoom to fit view');
        } else {
            console.warn('Concepts network not initialized for reset zoom');
        }
    } catch (e) {
        console.error('Error resetting zoom for concepts:', e);
        // Show error message to user
        const errorToast = document.createElement('div');
        errorToast.className = 'alert alert-warning position-fixed bottom-0 end-0 m-3';
        errorToast.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Error resetting zoom';
        errorToast.style.zIndex = '9999';
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.remove(), 3000);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
