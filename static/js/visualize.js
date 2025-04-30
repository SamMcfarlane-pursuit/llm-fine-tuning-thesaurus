// JavaScript for the Visualization Page

// DOM elements
const wordInput = document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const networkContainer = document.getElementById('network-container');
const synonymsList = document.getElementById('synonyms-list');
const antonymsList = document.getElementById('antonyms-list');
const relatedList = document.getElementById('related-list');
const relationButtons = document.querySelectorAll('[data-relation]');

// Current state
let network = null;
let currentRelation = 'hypernyms';

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
            fetchRelatedTerms(currentWord, currentRelation);
        });
    });

    // Add zoom control event listeners
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

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

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            toggleFullscreen();
        });
    }

    // Load data for the current word
    if (currentWord) {
        // Show loading state
        showLoading();

        // Fetch thesaurus data
        fetchThesaurusData(currentWord);

        // Fetch synonyms and antonyms
        fetchSynonyms(currentWord);
        fetchAntonyms(currentWord);
        fetchRelatedTerms(currentWord, currentRelation);
    }
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

// Toggle fullscreen for better visibility
function toggleFullscreen() {
    try {
        const container = document.getElementById('network-container');
        const iframe = container.querySelector('iframe');

        // First try to make the iframe fullscreen directly
        if (iframe) {
            if (!document.fullscreenElement) {
                console.log("Attempting to make iframe fullscreen");
                // Try to make the iframe fullscreen
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen().catch(err => {
                        console.warn("Iframe fullscreen failed, trying container", err);
                        // If iframe fullscreen fails, try the container
                        if (container.requestFullscreen) {
                            container.requestFullscreen();
                        } else if (container.webkitRequestFullscreen) {
                            container.webkitRequestFullscreen();
                        } else if (container.msRequestFullscreen) {
                            container.msRequestFullscreen();
                        } else if (container.mozRequestFullScreen) {
                            container.mozRequestFullScreen();
                        }
                    });
                } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen().catch(err => {
                        console.warn("Iframe webkit fullscreen failed, trying container", err);
                        if (container.webkitRequestFullscreen) {
                            container.webkitRequestFullscreen();
                        }
                    });
                } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen().catch(err => {
                        console.warn("Iframe MS fullscreen failed, trying container", err);
                        if (container.msRequestFullscreen) {
                            container.msRequestFullscreen();
                        }
                    });
                } else if (iframe.mozRequestFullScreen) {
                    iframe.mozRequestFullScreen().catch(err => {
                        console.warn("Iframe Moz fullscreen failed, trying container", err);
                        if (container.mozRequestFullScreen) {
                            container.mozRequestFullScreen();
                        }
                    });
                } else {
                    // If iframe methods aren't available, try the container
                    console.log("Iframe fullscreen methods not available, trying container");
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    } else if (container.msRequestFullscreen) {
                        container.msRequestFullscreen();
                    } else if (container.mozRequestFullScreen) {
                        container.mozRequestFullScreen();
                    }
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
            }

            // Update button icon
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                if (!document.fullscreenElement) {
                    fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
                    fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
                } else {
                    fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
                    fullscreenBtn.setAttribute('title', 'Fullscreen');
                }
            }
        } else {
            console.error("No iframe found in network container");
            alert("Fullscreen mode is not available. Please try again later.");
        }
    } catch (e) {
        console.error('Error toggling fullscreen:', e);
        alert("Fullscreen mode failed. This may be due to browser restrictions.");
    }

    // Add event listener for fullscreen change
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

// Update fullscreen button based on fullscreen state
function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
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
}

// Search for a word or sentence
function searchWord() {
    let query = wordInput.value.trim();

    if (!query) {
        alert('Please enter a word or sentence to search');
        return;
    }

    // We'll let the backend handle the extraction of key terms from sentences
    // This allows for more sophisticated processing on the server side

    // Show a message if the input is a sentence
    if (query.includes(' ')) {
        console.log(`Processing sentence: '${query}'`);
    }

    // Navigate to the word's visualization page
    // The backend will extract the most relevant term from the query
    window.location.href = `/visualize/${encodeURIComponent(query)}`;
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
    // Create an iframe to display the visualization with enhanced styling
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#121212';
    iframe.style.backgroundImage = 'radial-gradient(circle at 50% 50%, rgba(40, 40, 40, 0.3) 0%, rgba(20, 20, 20, 0.1) 100%)';
    iframe.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    iframe.style.borderRadius = '10px';
    iframe.setAttribute('allowfullscreen', 'true'); // Allow fullscreen for better visibility
    iframe.setAttribute('loading', 'eager'); // Prioritize loading

    // Set the source to the visualization path from the API response
    if (data.visualization_path) {
        // Add a timestamp to force reload and prevent caching
        iframe.src = data.visualization_path + '?t=' + new Date().getTime();

        // Clear the container and add the iframe
        networkContainer.innerHTML = '';
        networkContainer.appendChild(iframe);

        // Add zoom controls back with enhanced styling
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = `
            <button id="zoom-in-btn" class="zoom-btn" data-bs-toggle="tooltip" title="Zoom In"><i class="bi bi-plus-lg"></i></button>
            <button id="zoom-out-btn" class="zoom-btn" data-bs-toggle="tooltip" title="Zoom Out"><i class="bi bi-dash-lg"></i></button>
            <button id="reset-zoom-btn" class="zoom-btn" data-bs-toggle="tooltip" title="Reset View"><i class="bi bi-arrows-fullscreen"></i></button>
            <button id="fullscreen-btn" class="zoom-btn" data-bs-toggle="tooltip" title="Fullscreen"><i class="bi bi-fullscreen"></i></button>
        `;
        networkContainer.appendChild(zoomControls);

        // Reattach event listeners to zoom controls
        document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
        document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
        document.getElementById('reset-zoom-btn').addEventListener('click', resetZoom);
        document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } else {
        // Show error if no visualization path is provided
        networkContainer.innerHTML = `
            <div class="alert alert-danger">
                <h4 class="alert-heading">Visualization Error</h4>
                <p>Could not load visualization for "${currentWord}". Please try another word.</p>
            </div>
        `;
    }

    // Hide loading
    hideLoading();
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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
