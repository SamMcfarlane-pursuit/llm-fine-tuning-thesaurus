/**
 * UX Enhancement Strategies Implementation
 * This file implements various UX improvements based on user research and best practices
 * Focused on creating a robust, vibrant, and fully accessible user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all UX enhancements with a slight delay to ensure DOM is fully loaded
    setTimeout(() => {
        console.log("Initializing UX enhancements...");
        
        // Core UX enhancements
        initSmartDefaults();
        initContextualSuggestions();
        initConfidenceIndicators();
        initInlineFeedback();
        initAccessibilityImprovements();
        initAdaptiveDensity();
        
        // Additional vibrant UI enhancements
        initAnimatedElements();
        initDynamicColorEffects();
        initInteractiveHoverEffects();
        initProgressIndicators();
        
        console.log("UX enhancements initialized successfully!");
    }, 100);
});

/**
 * Smart Defaults - Pre-populate fields with intelligent defaults
 * based on user context and common patterns
 */
function initSmartDefaults() {
    // Smart defaults for search input
    const searchInput = document.getElementById('word-input');
    if (searchInput) {
        // Set placeholder based on user's previous searches or common terms
        const commonSearchTerms = ['fine-tuning', 'lora', 'qlora', 'transformer', 'attention'];
        const randomTerm = commonSearchTerms[Math.floor(Math.random() * commonSearchTerms.length)];
        searchInput.placeholder = `Try searching for "${randomTerm}" or enter your own term`;
        
        // Add event listener for input focus
        searchInput.addEventListener('focus', function() {
            // Show search suggestions when input is focused
            showSearchSuggestions(searchInput);
        });
    }
}

/**
 * Contextual Suggestions - Suggest query refinements based on user interactions
 */
function initContextualSuggestions() {
    const searchInput = document.getElementById('word-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 2) {
                // Get contextual suggestions based on input
                const suggestions = getContextualSuggestions(query);
                if (suggestions.length > 0) {
                    displaySuggestions(searchInput, suggestions);
                }
            }
        });
    }
}

/**
 * Get contextual suggestions based on user input
 */
function getContextualSuggestions(query) {
    // Map of terms and their related suggestions
    const suggestionMap = {
        'lor': ['lora', 'lora fine-tuning', 'lora vs qlora', 'lora implementation'],
        'qlo': ['qlora', 'qlora tutorial', 'qlora vs lora', 'qlora parameters'],
        'fin': ['fine-tuning', 'fine-tuning llm', 'fine-tuning parameters', 'fine-tuning techniques'],
        'tra': ['transformer', 'transformer architecture', 'transformer attention', 'training transformer'],
        'att': ['attention mechanism', 'attention layers', 'attention heads', 'attention visualization'],
        'qua': ['quantization', 'quantization techniques', 'quantization-aware training', 'quantization effects']
    };
    
    // Find matching suggestions
    let suggestions = [];
    for (const [key, values] of Object.entries(suggestionMap)) {
        if (query.includes(key)) {
            suggestions = suggestions.concat(values);
        }
    }
    
    // Add some general suggestions if we don't have specific matches
    if (suggestions.length === 0 && query.length >= 3) {
        suggestions = [
            `${query} tutorial`, 
            `${query} examples`, 
            `${query} implementation`, 
            `${query} vs other methods`
        ];
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Display suggestions below the search input
 */
function displaySuggestions(inputElement, suggestions) {
    // Remove any existing suggestions
    let suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.remove();
    }
    
    // Create suggestions container
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'search-suggestions';
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.style.position = 'absolute';
    suggestionsContainer.style.zIndex = '1000';
    suggestionsContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.95)';
    suggestionsContainer.style.borderRadius = '8px';
    suggestionsContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    suggestionsContainer.style.width = `${inputElement.offsetWidth}px`;
    suggestionsContainer.style.maxHeight = '200px';
    suggestionsContainer.style.overflowY = 'auto';
    suggestionsContainer.style.marginTop = '5px';
    
    // Position the suggestions container
    const inputRect = inputElement.getBoundingClientRect();
    suggestionsContainer.style.left = `${inputElement.offsetLeft}px`;
    suggestionsContainer.style.top = `${inputElement.offsetTop + inputElement.offsetHeight}px`;
    
    // Add suggestions to container
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;
        suggestionItem.style.padding = '10px 15px';
        suggestionItem.style.cursor = 'pointer';
        suggestionItem.style.transition = 'background-color 0.2s ease';
        
        // Highlight the suggestion on hover
        suggestionItem.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0, 198, 255, 0.1)';
        });
        
        suggestionItem.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        // Apply the suggestion when clicked
        suggestionItem.addEventListener('click', function() {
            inputElement.value = suggestion;
            suggestionsContainer.remove();
            // Trigger search
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
                searchBtn.click();
            }
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    // Add the suggestions container to the DOM
    inputElement.parentNode.appendChild(suggestionsContainer);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function closeHandler(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== inputElement) {
            suggestionsContainer.remove();
            document.removeEventListener('click', closeHandler);
        }
    });
}

/**
 * Show search suggestions when input is focused
 */
function showSearchSuggestions(inputElement) {
    const popularSearches = [
        'lora implementation', 
        'qlora tutorial', 
        'fine-tuning parameters', 
        'transformer architecture',
        'quantization techniques'
    ];
    
    displaySuggestions(inputElement, popularSearches);
}

/**
 * Confidence Indicators - Display confidence levels alongside AI responses
 */
function initConfidenceIndicators() {
    // Add confidence indicators to AI-generated content
    const networkContainer = document.getElementById('network-container');
    if (networkContainer) {
        // Create an observer to watch for content changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if visualization is loaded
                    if (networkContainer.querySelector('canvas')) {
                        addConfidenceIndicators();
                        observer.disconnect(); // Stop observing once we've added indicators
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(networkContainer, { childList: true, subtree: true });
    }
}

/**
 * Add confidence indicators to the visualization results
 */
function addConfidenceIndicators() {
    // Add a confidence indicator panel
    const visualizationContainer = document.getElementById('visualization-container');
    if (visualizationContainer) {
        const confidencePanel = document.createElement('div');
        confidencePanel.className = 'confidence-panel';
        confidencePanel.style.position = 'absolute';
        confidencePanel.style.top = '10px';
        confidencePanel.style.right = '10px';
        confidencePanel.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
        confidencePanel.style.borderRadius = '8px';
        confidencePanel.style.padding = '10px';
        confidencePanel.style.zIndex = '100';
        confidencePanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        confidencePanel.style.backdropFilter = 'blur(5px)';
        confidencePanel.style.display = 'none'; // Initially hidden
        
        confidencePanel.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: 600; color: #ffffff;">Confidence Level</div>
            <div class="confidence-meter" style="display: flex; align-items: center; gap: 10px;">
                <div class="confidence-bar" style="flex-grow: 1; height: 8px; background-color: rgba(255, 255, 255, 0.2); border-radius: 4px; overflow: hidden;">
                    <div class="confidence-fill" style="height: 100%; width: 85%; background-color: #00d463;"></div>
                </div>
                <div class="confidence-value" style="font-weight: 600; color: #00d463;">85%</div>
            </div>
            <div class="confidence-label" style="font-size: 0.8rem; color: #e0e0e0; margin-top: 5px;">
                High confidence in these relationships
            </div>
        `;
        
        visualizationContainer.appendChild(confidencePanel);
        
        // Show confidence panel when visualization is active
        const zoomControls = document.getElementById('zoom-controls');
        if (zoomControls) {
            // Use the visibility of zoom controls as an indicator that visualization is active
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (zoomControls.style.display !== 'none') {
                            confidencePanel.style.display = 'block';
                        } else {
                            confidencePanel.style.display = 'none';
                        }
                    }
                });
            });
            
            observer.observe(zoomControls, { attributes: true });
        }
    }
}

/**
 * Inline Feedback - Add simple feedback options on response components
 */
function initInlineFeedback() {
    // Add feedback options to various components
    addFeedbackToTabs();
    addFeedbackToConceptCards();
}

/**
 * Add feedback options to tab content
 */
function addFeedbackToTabs() {
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        // Only add feedback to panes that have content
        const contentContainer = pane.querySelector('.word-list, #network-container');
        if (contentContainer) {
            const feedbackContainer = document.createElement('div');
            feedbackContainer.className = 'feedback-container';
            feedbackContainer.style.marginTop = '20px';
            feedbackContainer.style.padding = '15px';
            feedbackContainer.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
            feedbackContainer.style.display = 'flex';
            feedbackContainer.style.alignItems = 'center';
            feedbackContainer.style.justifyContent = 'space-between';
            
            feedbackContainer.innerHTML = `
                <div style="color: #e0e0e0;">Was this information helpful?</div>
                <div class="feedback-buttons" style="display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-outline-success feedback-btn" data-value="helpful">
                        <i class="bi bi-hand-thumbs-up"></i> Yes
                    </button>
                    <button class="btn btn-sm btn-outline-danger feedback-btn" data-value="not-helpful">
                        <i class="bi bi-hand-thumbs-down"></i> No
                    </button>
                </div>
            `;
            
            // Add event listeners to feedback buttons
            feedbackContainer.querySelectorAll('.feedback-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    handleFeedback(value, pane.id);
                    
                    // Update UI to show feedback was received
                    feedbackContainer.innerHTML = `
                        <div style="color: #00d463; width: 100%; text-align: center;">
                            <i class="bi bi-check-circle"></i> Thank you for your feedback! We'll use it to improve our results.
                        </div>
                    `;
                });
            });
            
            pane.appendChild(feedbackContainer);
        }
    });
}

/**
 * Add feedback options to concept cards
 */
function addFeedbackToConceptCards() {
    const conceptCards = document.querySelectorAll('.concept-card');
    conceptCards.forEach(card => {
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'concept-feedback';
        feedbackContainer.style.marginTop = '15px';
        feedbackContainer.style.paddingTop = '15px';
        feedbackContainer.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        feedbackContainer.style.display = 'flex';
        feedbackContainer.style.alignItems = 'center';
        feedbackContainer.style.justifyContent = 'space-between';
        
        feedbackContainer.innerHTML = `
            <div style="font-size: 0.9rem; color: #e0e0e0;">Is this explanation clear?</div>
            <div class="feedback-buttons" style="display: flex; gap: 5px;">
                <button class="btn btn-sm btn-outline-light concept-feedback-btn" data-value="clear" style="padding: 0.25rem 0.5rem;">
                    <i class="bi bi-hand-thumbs-up"></i>
                </button>
                <button class="btn btn-sm btn-outline-light concept-feedback-btn" data-value="unclear" style="padding: 0.25rem 0.5rem;">
                    <i class="bi bi-hand-thumbs-down"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to feedback buttons
        feedbackContainer.querySelectorAll('.concept-feedback-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const conceptTitle = card.querySelector('h4')?.textContent || 'Concept';
                handleConceptFeedback(value, conceptTitle);
                
                // Update UI to show feedback was received
                feedbackContainer.innerHTML = `
                    <div style="color: #00d463; width: 100%; text-align: center; font-size: 0.9rem;">
                        <i class="bi bi-check-circle"></i> Thanks for helping us improve!
                    </div>
                `;
            });
        });
        
        card.appendChild(feedbackContainer);
    });
}

/**
 * Handle feedback submission
 */
function handleFeedback(value, sourceId) {
    console.log(`Feedback received: ${value} for ${sourceId}`);
    // In a real implementation, this would send the feedback to the server
}

/**
 * Handle concept feedback submission
 */
function handleConceptFeedback(value, conceptTitle) {
    console.log(`Concept feedback received: ${value} for "${conceptTitle}"`);
    // In a real implementation, this would send the feedback to the server
}

/**
 * Accessibility Improvements - Enhance screen reader support and keyboard navigation
 */
function initAccessibilityImprovements() {
    improveAriaAttributes();
    enhanceKeyboardNavigation();
}

/**
 * Improve ARIA attributes for better screen reader support
 */
function improveAriaAttributes() {
    // Add ARIA labels to interactive elements
    const searchInput = document.getElementById('word-input');
    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search for terms related to LLM fine-tuning');
    }
    
    const searchButton = document.getElementById('search-btn');
    if (searchButton) {
        searchButton.setAttribute('aria-label', 'Search');
    }
    
    // Add ARIA labels to visualization containers
    const networkContainer = document.getElementById('network-container');
    if (networkContainer) {
        networkContainer.setAttribute('aria-label', 'Visual thesaurus network visualization');
        networkContainer.setAttribute('role', 'img');
    }
    
    // Add ARIA labels to tabs
    const tabButtons = document.querySelectorAll('[role="tab"]');
    tabButtons.forEach(tab => {
        if (!tab.hasAttribute('aria-label')) {
            tab.setAttribute('aria-label', `${tab.textContent} tab`);
        }
    });
}

/**
 * Enhance keyboard navigation
 */
function enhanceKeyboardNavigation() {
    // Add keyboard shortcuts for common actions
    document.addEventListener('keydown', function(e) {
        // Alt+S to focus search
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            const searchInput = document.getElementById('word-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

/**
 * Adaptive Density - Adjust information density based on device characteristics
 */
function initAdaptiveDensity() {
    // Adjust UI density based on screen size
    adjustForScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', adjustForScreenSize);
}

/**
 * Adjust UI elements based on screen size
 */
function adjustForScreenSize() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Adjust concept cards
    const conceptCards = document.querySelectorAll('.concept-card');
    conceptCards.forEach(card => {
        if (isMobile) {
            card.style.padding = '1rem';
        } else {
            card.style.padding = '1.5rem';
        }
    });
    
    // Adjust visualization height
    const networkContainer = document.getElementById('network-container');
    if (networkContainer) {
        if (isMobile) {
            networkContainer.style.height = '300px';
        } else if (isTablet) {
            networkContainer.style.height = '400px';
        } else {
            networkContainer.style.height = '500px';
        }
    }
}

/**
 * Animated Elements - Add subtle animations to UI elements
 */
function initAnimatedElements() {
    // Add subtle animations to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('animated-card');
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Add pulse animation to buttons
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(button => {
        button.classList.add('pulse-on-hover');
    });
}

/**
 * Dynamic Color Effects - Add vibrant color effects to UI elements
 */
function initDynamicColorEffects() {
    // Add gradient borders to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        
        // Add gradient border effect
        const borderEffect = document.createElement('div');
        borderEffect.style.position = 'absolute';
        borderEffect.style.top = '0';
        borderEffect.style.left = '0';
        borderEffect.style.width = '100%';
        borderEffect.style.height = '4px';
        borderEffect.style.background = 'linear-gradient(90deg, #4287f5, #00ffdd)';
        borderEffect.style.zIndex = '1';
        
        // Insert as first child
        if (card.firstChild) {
            card.insertBefore(borderEffect, card.firstChild);
        } else {
            card.appendChild(borderEffect);
        }
    });
}

/**
 * Interactive Hover Effects - Add interactive effects on hover
 */
function initInteractiveHoverEffects() {
    // Add glow effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 15px rgba(66, 135, 245, 0.5)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // Add highlight effect to list items
    const listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(66, 135, 245, 0.1)';
            this.style.transform = 'translateX(5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'translateX(0)';
        });
    });
}

/**
 * Progress Indicators - Add progress indicators to show loading states
 */
function initProgressIndicators() {
    // Add loading indicators to search
    const searchButton = document.getElementById('search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            // Only add loading state if we're actually searching
            const searchInput = document.getElementById('word-input');
            if (searchInput && searchInput.value.trim()) {
                // Add loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
                this.disabled = true;
                
                // Reset after 2 seconds (or when results load)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    }
}

// Add CSS for UX enhancements
const style = document.createElement('style');
style.textContent = `
    .search-suggestions {
        border: 1px solid rgba(0, 198, 255, 0.2);
        animation: fadeIn 0.3s ease-out;
    }
    
    .suggestion-item:hover, .suggestion-item.focused {
        background-color: rgba(0, 198, 255, 0.1);
    }
    
    .feedback-btn:hover, .concept-feedback-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .animated-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .pulse-on-hover:hover {
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 767px) {
        .concept-card {
            padding: 1rem;
        }
        
        .concept-icon {
            width: 50px;
            height: 50px;
            font-size: 1.8rem;
        }
        
        .concept-card h4 {
            font-size: 1.2rem;
        }
        
        .feedback-container {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
    }
`;

document.head.appendChild(style);
