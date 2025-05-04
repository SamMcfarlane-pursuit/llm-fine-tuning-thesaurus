/**
 * Thesaurus visualization functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const wordInput = document.getElementById('word-input');
    const searchBtn = document.getElementById('search-btn');
    const networkContainer = document.getElementById('network-container');
    const visualizationPlaceholder = document.getElementById('visualization-placeholder');
    const zoomControls = document.getElementById('zoom-controls');
    const synonymsList = document.getElementById('synonyms-list');
    const antonymsList = document.getElementById('antonyms-list');
    const relatedList = document.getElementById('related-list');
    const relationButtons = document.querySelectorAll('[data-relation]');

    // Network visualization
    let network = null;
    let currentRelation = 'hypernyms';

    // Add event listeners
    if (searchBtn) {
        searchBtn.addEventListener('click', searchWord);
    }

    if (wordInput) {
        wordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchWord();
            }
        });
    }

    // Add click event to badge examples
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('click', function() {
            if (wordInput) {
                wordInput.value = this.textContent.trim();
                searchWord();
            }
        });
    });

    // Add event listeners to relation buttons
    relationButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentRelation = this.dataset.relation;
            relationButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            if (wordInput && wordInput.value.trim()) {
                fetchRelatedTerms(wordInput.value.trim(), currentRelation);
            }
        });
    });

    // Add zoom controls
    if (document.getElementById('zoom-in-btn')) {
        document.getElementById('zoom-in-btn').addEventListener('click', function() {
            if (network) {
                const currentScale = network.getScale();
                network.moveTo({ scale: currentScale * 1.2 });
            }
        });
    }

    if (document.getElementById('zoom-out-btn')) {
        document.getElementById('zoom-out-btn').addEventListener('click', function() {
            if (network) {
                const currentScale = network.getScale();
                network.moveTo({ scale: currentScale * 0.8 });
            }
        });
    }

    if (document.getElementById('reset-zoom-btn')) {
        document.getElementById('reset-zoom-btn').addEventListener('click', function() {
            if (network) {
                network.fit();
            }
        });
    }

    // Search for a word
    function searchWord() {
        const word = wordInput.value.trim();
        if (!word) return;

        // Show loading state
        networkContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Generating visualization...</p></div>';
        visualizationPlaceholder.style.display = 'none';

        // Fetch thesaurus data
        fetch(`/api/thesaurus/${word}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    networkContainer.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    return;
                }

                // Create visualization
                createVisualization(data);
                zoomControls.style.display = 'block';

                // Fetch synonyms, antonyms, and related terms
                fetchSynonyms(word);
                fetchAntonyms(word);
                fetchRelatedTerms(word, currentRelation);
            })
            .catch(error => {
                console.error('Error fetching thesaurus data:', error);
                networkContainer.innerHTML = '<div class="alert alert-danger">Error generating visualization. Please try again.</div>';
            });
    }

    // Create network visualization
    function createVisualization(data) {
        // Create a network
        const container = networkContainer;

        // Check if visualization_path exists
        if (data.visualization_path) {
            // Create an iframe to display the visualization with dark background
            container.innerHTML = `<iframe src="${data.visualization_path}" style="width: 100%; height: 600px; border: none; background-color: #121212; display: block;"></iframe>`;
        } else {
            // Create a direct visualization using vis.js
            container.innerHTML = '';

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
                network = new vis.Network(container, networkData, options);

                // Fit the network to the container
                network.fit();
            } catch (error) {
                console.error('Error creating visualization:', error);
                container.innerHTML = '<div class="alert alert-danger">Error creating visualization. Please try again.</div>';
            }
        }
    }

    // Fetch synonyms
    function fetchSynonyms(word) {
        fetch(`/api/synonyms/${word}`)
            .then(response => response.json())
            .then(data => {
                synonymsList.innerHTML = '';

                if (data.synonyms && data.synonyms.length > 0) {
                    data.synonyms.forEach(synonym => {
                        const badge = document.createElement('span');
                        badge.className = 'badge bg-primary me-2 mb-2 p-2';
                        badge.textContent = synonym;
                        badge.style.cursor = 'pointer';
                        badge.addEventListener('click', function() {
                            wordInput.value = synonym;
                            searchWord();
                        });
                        synonymsList.appendChild(badge);
                    });
                } else {
                    synonymsList.innerHTML = '<p>No synonyms found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching synonyms:', error);
                synonymsList.innerHTML = '<div class="alert alert-danger">Error fetching synonyms.</div>';
            });
    }

    // Fetch antonyms
    function fetchAntonyms(word) {
        fetch(`/api/antonyms/${word}`)
            .then(response => response.json())
            .then(data => {
                antonymsList.innerHTML = '';

                if (data.antonyms && data.antonyms.length > 0) {
                    data.antonyms.forEach(antonym => {
                        const badge = document.createElement('span');
                        badge.className = 'badge bg-warning text-dark me-2 mb-2 p-2';
                        badge.textContent = antonym;
                        badge.style.cursor = 'pointer';
                        badge.addEventListener('click', function() {
                            wordInput.value = antonym;
                            searchWord();
                        });
                        antonymsList.appendChild(badge);
                    });
                } else {
                    antonymsList.innerHTML = '<p>No antonyms found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching antonyms:', error);
                antonymsList.innerHTML = '<div class="alert alert-danger">Error fetching antonyms.</div>';
            });
    }

    // Fetch related terms
    function fetchRelatedTerms(word, relationType) {
        fetch(`/api/related/${word}?type=${relationType}`)
            .then(response => response.json())
            .then(data => {
                relatedList.innerHTML = '';

                if (data.terms && data.terms.length > 0) {
                    data.terms.forEach(term => {
                        const badge = document.createElement('span');
                        badge.className = relationType === 'hypernyms' ? 'badge bg-success me-2 mb-2 p-2' : 'badge bg-danger me-2 mb-2 p-2';
                        badge.textContent = term;
                        badge.style.cursor = 'pointer';
                        badge.addEventListener('click', function() {
                            wordInput.value = term;
                            searchWord();
                        });
                        relatedList.appendChild(badge);
                    });
                } else {
                    relatedList.innerHTML = `<p>No ${relationType} found.</p>`;
                }
            })
            .catch(error => {
                console.error('Error fetching related terms:', error);
                relatedList.innerHTML = '<div class="alert alert-danger">Error fetching related terms.</div>';
            });
    }

    // Help section functionality
    const askBtn = document.getElementById('ask-btn');
    const questionInput = document.getElementById('question-input');
    const answerContainer = document.getElementById('answer-container');
    const answerText = document.getElementById('answer-text');

    if (askBtn && questionInput) {
        askBtn.addEventListener('click', askQuestion);
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                askQuestion();
            }
        });
    }

    function askQuestion() {
        const question = questionInput.value.trim();
        if (!question) return;

        // Show loading state
        if (answerContainer) {
            answerContainer.style.display = 'block';
            if (answerText) {
                answerText.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Thinking...';
            }
        }

        // Send question to API
        fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    if (answerText) {
                        answerText.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    }
                    return;
                }

                if (answerText) {
                    answerText.innerHTML = data.answer;
                }
            })
            .catch(error => {
                console.error('Error asking question:', error);
                if (answerText) {
                    answerText.innerHTML = '<div class="alert alert-danger">Error processing your question. Please try again.</div>';
                }
            });
    }
});
