/**
 * Integrated Learning and Thesaurus Module
 * Combines learning resources with thesaurus functionality for a more accessible experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the integrated learning interface
    initIntegratedLearning();
    
    // Add event listeners for the search functionality
    setupSearchListeners();
    
    // Initialize tooltips for related concepts
    initConceptTooltips();
});

/**
 * Initialize the integrated learning interface
 */
function initIntegratedLearning() {
    // Get the thesaurus container and learning resources container
    const thesaurusContainer = document.getElementById('thesaurus-container');
    const learningContainer = document.getElementById('learning-resources');
    
    // If both containers exist, set up the integration
    if (thesaurusContainer && learningContainer) {
        console.log('Setting up integrated learning interface');
        
        // Add related concepts to learning resources
        addRelatedConceptsToLearning();
        
        // Add learning resources to thesaurus results
        addLearningToThesaurus();
    }
}

/**
 * Add related concepts to learning resources
 */
function addRelatedConceptsToLearning() {
    // Get all learning topic headings
    const topicHeadings = document.querySelectorAll('.learning-topic h3, .module-content h2, .topic-content h2');
    
    topicHeadings.forEach(heading => {
        // Get the topic text
        const topicText = heading.textContent.trim();
        
        // Create a related concepts container
        const relatedContainer = document.createElement('div');
        relatedContainer.className = 'related-concepts';
        relatedContainer.innerHTML = `
            <div class="related-concepts-header">
                <i class="bi bi-diagram-3"></i> Related Concepts
            </div>
            <div class="related-concepts-content">
                <div class="related-concepts-loading">Loading related concepts...</div>
            </div>
            <div class="related-concepts-footer">
                <a href="/thesaurus?q=${encodeURIComponent(topicText)}" class="view-in-thesaurus">
                    <i class="bi bi-search"></i> View in Thesaurus
                </a>
            </div>
        `;
        
        // Insert after the heading
        if (heading.nextElementSibling) {
            heading.parentNode.insertBefore(relatedContainer, heading.nextElementSibling);
        } else {
            heading.parentNode.appendChild(relatedContainer);
        }
        
        // Fetch related concepts
        fetchRelatedConcepts(topicText, relatedContainer.querySelector('.related-concepts-content'));
    });
}

/**
 * Fetch related concepts for a topic
 * @param {string} topic - The topic to fetch related concepts for
 * @param {HTMLElement} container - The container to display the related concepts in
 */
function fetchRelatedConcepts(topic, container) {
    // Make an API call to get related concepts
    fetch(`/api/related-concepts/${encodeURIComponent(topic)}`)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            container.innerHTML = '';
            
            if (data.related && data.related.length > 0) {
                // Create a list of related concepts
                const conceptsList = document.createElement('ul');
                conceptsList.className = 'related-concepts-list';
                
                data.related.forEach(concept => {
                    const conceptItem = document.createElement('li');
                    conceptItem.innerHTML = `
                        <a href="/thesaurus?q=${encodeURIComponent(concept)}" class="concept-link" 
                           data-concept="${concept}" title="View in thesaurus">
                            ${concept}
                        </a>
                    `;
                    conceptsList.appendChild(conceptItem);
                });
                
                container.appendChild(conceptsList);
            } else {
                // No related concepts found
                container.innerHTML = '<div class="no-concepts">No related concepts found</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching related concepts:', error);
            container.innerHTML = '<div class="error">Error loading related concepts</div>';
        });
}

/**
 * Add learning resources to thesaurus results
 */
function addLearningToThesaurus() {
    // Get the thesaurus results container
    const resultsContainer = document.getElementById('thesaurus-results');
    
    if (resultsContainer) {
        // Create a learning resources section
        const learningSection = document.createElement('div');
        learningSection.className = 'thesaurus-learning-resources';
        learningSection.innerHTML = `
            <h3><i class="bi bi-book"></i> Learning Resources</h3>
            <div class="learning-resources-content">
                <div class="learning-resources-loading">Loading learning resources...</div>
            </div>
        `;
        
        // Add to the results container
        resultsContainer.appendChild(learningSection);
        
        // Get the current search term
        const searchInput = document.getElementById('thesaurus-search');
        if (searchInput && searchInput.value.trim()) {
            // Fetch learning resources for the search term
            fetchLearningResources(searchInput.value.trim(), learningSection.querySelector('.learning-resources-content'));
        } else {
            // No search term, show default message
            learningSection.querySelector('.learning-resources-content').innerHTML = 
                '<div class="no-resources">Enter a search term to find learning resources</div>';
        }
    }
}

/**
 * Fetch learning resources for a topic
 * @param {string} topic - The topic to fetch learning resources for
 * @param {HTMLElement} container - The container to display the learning resources in
 */
function fetchLearningResources(topic, container) {
    // Make an API call to get learning resources
    fetch(`/api/learning-resources/${encodeURIComponent(topic)}`)
        .then(response => response.json())
        .then(data => {
            // Clear loading message
            container.innerHTML = '';
            
            if (data.resources && data.resources.length > 0) {
                // Create a list of learning resources
                const resourcesList = document.createElement('ul');
                resourcesList.className = 'learning-resources-list';
                
                data.resources.forEach(resource => {
                    const resourceItem = document.createElement('li');
                    resourceItem.innerHTML = `
                        <a href="${resource.url}" class="resource-link">
                            <div class="resource-title">${resource.title}</div>
                            <div class="resource-description">${resource.description}</div>
                        </a>
                    `;
                    resourcesList.appendChild(resourceItem);
                });
                
                container.appendChild(resourcesList);
            } else {
                // No learning resources found
                container.innerHTML = '<div class="no-resources">No learning resources found for this topic</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching learning resources:', error);
            container.innerHTML = '<div class="error">Error loading learning resources</div>';
        });
}

/**
 * Set up event listeners for the search functionality
 */
function setupSearchListeners() {
    // Get the search input and button
    const searchInput = document.getElementById('thesaurus-search');
    const searchButton = document.getElementById('thesaurus-search-btn');
    
    if (searchInput && searchButton) {
        // Add event listener for search button click
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Update the learning resources section
                const learningContent = document.querySelector('.learning-resources-content');
                if (learningContent) {
                    learningContent.innerHTML = '<div class="learning-resources-loading">Loading learning resources...</div>';
                    fetchLearningResources(searchTerm, learningContent);
                }
            }
        });
        
        // Add event listener for Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}

/**
 * Initialize tooltips for related concepts
 */
function initConceptTooltips() {
    // Add event listeners for concept links
    document.addEventListener('mouseover', function(e) {
        const target = e.target.closest('.concept-link');
        if (target) {
            // Get the concept
            const concept = target.dataset.concept;
            
            // If the tooltip doesn't exist, create it
            if (!target.querySelector('.concept-tooltip')) {
                // Create a tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'concept-tooltip';
                tooltip.innerHTML = `
                    <div class="concept-tooltip-loading">Loading...</div>
                `;
                
                // Add the tooltip to the concept link
                target.appendChild(tooltip);
                
                // Fetch the concept definition
                fetch(`/api/concept-definition/${encodeURIComponent(concept)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.definition) {
                            tooltip.innerHTML = `
                                <div class="concept-tooltip-content">
                                    <div class="concept-tooltip-title">${concept}</div>
                                    <div class="concept-tooltip-definition">${data.definition}</div>
                                </div>
                            `;
                        } else {
                            tooltip.innerHTML = `
                                <div class="concept-tooltip-content">
                                    <div class="concept-tooltip-title">${concept}</div>
                                    <div class="concept-tooltip-definition">No definition available</div>
                                </div>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching concept definition:', error);
                        tooltip.innerHTML = `
                            <div class="concept-tooltip-content">
                                <div class="concept-tooltip-title">${concept}</div>
                                <div class="concept-tooltip-definition error">Error loading definition</div>
                            </div>
                        `;
                    });
            }
        }
    });
    
    // Remove tooltips when mouse leaves
    document.addEventListener('mouseout', function(e) {
        const target = e.target.closest('.concept-link');
        if (target) {
            // Get the tooltip
            const tooltip = target.querySelector('.concept-tooltip');
            if (tooltip) {
                // Remove the tooltip
                tooltip.remove();
            }
        }
    });
}
