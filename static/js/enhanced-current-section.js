/**
 * Enhanced Current Section JavaScript
 * Provides functionality for the current section bar with cancel option
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the enhanced current section bar
    initEnhancedCurrentSection();
});

/**
 * Initialize the enhanced current section bar
 */
function initEnhancedCurrentSection() {
    // Get all current section containers
    const currentSectionContainers = document.querySelectorAll('.current-section-container');
    
    if (currentSectionContainers.length === 0) {
        console.log('No current section containers found');
        return;
    }
    
    // Add event listeners to each container
    currentSectionContainers.forEach(container => {
        // Get the cancel button
        const cancelButton = container.querySelector('.current-section-cancel');
        
        if (cancelButton) {
            // Add click event listener to the cancel button
            cancelButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add a fade-out animation
                container.style.opacity = '0';
                container.style.transform = 'translateY(-10px)';
                
                // Remove the container after the animation completes
                setTimeout(() => {
                    container.remove();
                }, 300);
            });
        }
        
        // Get all related concept buttons
        const relatedConceptButtons = container.querySelectorAll('.related-concept-button');
        
        // Add click event listeners to each related concept button
        relatedConceptButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Get the href attribute
                const href = this.getAttribute('href');
                
                // If href is not a valid URL, prevent default behavior
                if (!href || href === '#' || href === 'undefined') {
                    e.preventDefault();
                    console.error('Related concept button has invalid href:', href);
                    return;
                }
                
                // Add a click effect
                this.style.transform = 'scale(0.95)';
                
                // Reset the transform after a short delay
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Log the navigation
                console.log('Navigating to related concept:', href);
            });
        });
        
        // Get the current concept badge
        const currentConceptBadge = container.querySelector('.current-concept-badge');
        
        if (currentConceptBadge) {
            // Add click event listener to the current concept badge
            currentConceptBadge.addEventListener('click', function(e) {
                // Get the href attribute
                const href = this.getAttribute('href');
                
                // If href is not a valid URL, prevent default behavior
                if (!href || href === '#' || href === 'undefined') {
                    e.preventDefault();
                    console.log('Current concept badge has no destination');
                    return;
                }
                
                // Add a click effect
                this.style.transform = 'scale(0.95)';
                
                // Reset the transform after a short delay
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Log the navigation
                console.log('Navigating to current concept:', href);
            });
        }
    });
    
    // Add hover effects to all buttons and badges
    addHoverEffects();
}

/**
 * Add hover effects to all buttons and badges
 */
function addHoverEffects() {
    // Get all elements that should have hover effects
    const hoverElements = document.querySelectorAll('.current-concept-badge, .related-concept-button');
    
    // Add mouseenter and mouseleave event listeners to each element
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Add a subtle glow effect
            this.style.boxShadow = '0 5px 15px rgba(66, 135, 245, 0.3)';
        });
        
        element.addEventListener('mouseleave', function() {
            // Remove the glow effect
            this.style.boxShadow = '';
        });
    });
}

/**
 * Create a new current section bar
 * @param {string} concept - The current concept
 * @param {Array} relatedConcepts - Array of related concepts
 * @param {string} containerId - The ID of the container to append the section bar to
 */
function createCurrentSectionBar(concept, relatedConcepts, containerId) {
    // Get the container
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    // Create the current section container
    const currentSectionContainer = document.createElement('div');
    currentSectionContainer.className = 'current-section-container';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'current-section-header';
    
    // Create the title
    const title = document.createElement('h3');
    title.className = 'current-section-title';
    title.innerHTML = '<i class="bi bi-bookmark-star"></i> Current Section';
    
    // Create the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'current-section-cancel';
    cancelButton.innerHTML = '<i class="bi bi-x"></i>';
    cancelButton.setAttribute('aria-label', 'Close');
    
    // Append the title and cancel button to the header
    header.appendChild(title);
    header.appendChild(cancelButton);
    
    // Create the current concept badge
    const currentConceptBadge = document.createElement('a');
    currentConceptBadge.className = 'current-concept-badge';
    currentConceptBadge.href = `/learn-and-explore?concept=${concept}`;
    currentConceptBadge.innerHTML = `<i class="bi bi-bookmark-fill"></i> ${concept.charAt(0).toUpperCase() + concept.slice(1)}`;
    
    // Create the related concepts container
    const relatedConceptsContainer = document.createElement('div');
    relatedConceptsContainer.className = 'related-concepts-container';
    
    // Create the related concept buttons
    relatedConcepts.forEach(relatedConcept => {
        const relatedConceptButton = document.createElement('a');
        relatedConceptButton.className = 'related-concept-button';
        relatedConceptButton.href = `/learn-and-explore?concept=${relatedConcept}`;
        relatedConceptButton.innerHTML = `<i class="bi bi-arrow-right-circle"></i> ${relatedConcept.charAt(0).toUpperCase() + relatedConcept.slice(1)}`;
        
        // Append the related concept button to the container
        relatedConceptsContainer.appendChild(relatedConceptButton);
    });
    
    // Append all elements to the current section container
    currentSectionContainer.appendChild(header);
    currentSectionContainer.appendChild(currentConceptBadge);
    currentSectionContainer.appendChild(relatedConceptsContainer);
    
    // Append the current section container to the container
    container.prepend(currentSectionContainer);
    
    // Initialize the current section bar
    initEnhancedCurrentSection();
}
