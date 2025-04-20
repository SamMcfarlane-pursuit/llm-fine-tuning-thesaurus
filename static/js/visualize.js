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

// Search for a word
function searchWord() {
    let word = wordInput.value.trim().toLowerCase();

    if (!word) {
        alert('Please enter a word to search');
        return;
    }

    // If the input contains spaces, extract just the first word
    if (word.includes(' ')) {
        const firstWord = word.split(' ')[0];
        console.log(`Input contains multiple words. Using first word: '${firstWord}'`);
        word = firstWord;
    }

    // Navigate to the word's visualization page
    window.location.href = `/visualize/${word}`;
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
    // Create nodes and edges for vis.js
    const nodes = new vis.DataSet(
        data.nodes.map(node => ({
            id: node.id,
            label: node.label,
            color: node.color,
            value: node.size,
            font: { size: node.id === currentWord ? 18 : 14 }
        }))
    );

    const edges = new vis.DataSet(
        data.edges.map(edge => ({
            from: edge.from,
            to: edge.to,
            color: edge.color,
            label: edge.label,
            font: { size: 12, align: 'middle' }
        }))
    );

    // Create a network
    const data_vis = { nodes, edges };
    const options = {
        nodes: {
            shape: 'dot',
            scaling: {
                min: 10,
                max: 30,
                label: {
                    min: 14,
                    max: 18,
                    drawThreshold: 8,
                    maxVisible: 20
                }
            },
            font: {
                size: 14,
                face: 'Segoe UI'
            }
        },
        edges: {
            width: 2,
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: { enabled: false },
                from: { enabled: false }
            }
        },
        physics: {
            stabilization: false,
            barnesHut: {
                gravitationalConstant: -80000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            }
        },
        interaction: {
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
            hover: true
        }
    };

    // Destroy previous network if it exists
    if (network) {
        network.destroy();
    }

    // Create new network
    network = new vis.Network(networkContainer, data_vis, options);

    // Add event listener for node clicks
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            if (nodeId !== currentWord) {
                // Navigate to the clicked word
                window.location.href = `/visualize/${nodeId}`;
            }
        }
    });

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
