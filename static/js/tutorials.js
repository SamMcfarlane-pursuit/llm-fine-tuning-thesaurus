/**
 * JavaScript for the tutorials page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryButtons = document.querySelectorAll('[data-category]');
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    const categoryHeaders = document.querySelectorAll('.category-header');
    const searchInput = document.getElementById('tutorial-search');
    
    // Filter tutorials by category
    function filterByCategory(category) {
        // Update active button
        categoryButtons.forEach(button => {
            if (button.dataset.category === category) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show/hide tutorials
        tutorialCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide category headers
        categoryHeaders.forEach(header => {
            const categoryId = header.id.split('-')[0];
            if (category === 'all' || category === categoryId) {
                header.style.display = '';
            } else {
                header.style.display = 'none';
            }
        });
    }
    
    // Search tutorials
    function searchTutorials(query) {
        query = query.toLowerCase().trim();
        
        if (query === '') {
            // If search is empty, revert to current category filter
            const activeCategory = document.querySelector('[data-category].active').dataset.category;
            filterByCategory(activeCategory);
            return;
        }
        
        // Hide all category headers when searching
        categoryHeaders.forEach(header => {
            header.style.display = 'none';
        });
        
        // Show/hide tutorials based on search
        tutorialCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardTags = Array.from(card.querySelectorAll('.badge')).map(tag => tag.textContent.toLowerCase());
            
            if (cardText.includes(query) || cardTags.some(tag => tag.includes(query))) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Add event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterByCategory(category);
            
            // Clear search when changing categories
            if (searchInput) {
                searchInput.value = '';
            }
        });
    });
    
    // Add event listener to search input
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTutorials(this.value);
        });
    }
    
    // Initialize with 'all' category
    filterByCategory('all');
});
