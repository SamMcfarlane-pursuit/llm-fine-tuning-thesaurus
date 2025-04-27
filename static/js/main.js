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

    if (!question) {
        alert('Please enter a question');
        return;
    }

    // Show loading
    askBtn.disabled = true;
    askBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Asking...';

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Send question to API
    fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ question })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display answer
            answerText.textContent = data.answer;
            answerContainer.style.display = 'block';

            // Reset button
            askBtn.disabled = false;
            askBtn.textContent = 'Ask';
        })
        .catch(error => {
            console.error('Error asking question:', error);
            alert('Error asking question. Please try again.');

            // Reset button
            askBtn.disabled = false;
            askBtn.textContent = 'Ask';
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

// Load LLM concepts visualization
function loadLLMConceptsVisualization() {
    fetch('/api/llm-concepts-visualization')
        .then(response => response.json())
        .then(data => {
            const iframe = document.createElement('iframe');
            iframe.src = data.visualization_path;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.id = 'concepts-iframe';

            conceptsVisualization.innerHTML = '';
            conceptsVisualization.appendChild(iframe);
        })
        .catch(error => {
            console.error('Error loading LLM concepts visualization:', error);
            conceptsVisualization.innerHTML =
                '<div class="alert alert-danger">Error loading visualization</div>';
        });
}

// Zoom functions for concepts visualization
function zoomInConcepts() {
    try {
        const iframe = document.querySelector('#concepts-visualization iframe');
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
        console.error('Error zooming in concepts:', e);
    }
}

function zoomOutConcepts() {
    try {
        const iframe = document.querySelector('#concepts-visualization iframe');
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
        console.error('Error zooming out concepts:', e);
    }
}

function resetZoomConcepts() {
    try {
        const iframe = document.querySelector('#concepts-visualization iframe');
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
        console.error('Error resetting zoom for concepts:', e);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
