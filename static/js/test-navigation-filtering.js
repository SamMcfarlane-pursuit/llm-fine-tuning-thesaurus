/**
 * Test script for Enhanced Navigation Filtering
 * This script helps debug and verify the filtering functionality
 */

console.log('🧪 Testing Enhanced Navigation Filtering...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM loaded, testing navigation filtering...');
    
    // Test 1: Check if the main navigation filter class exists
    setTimeout(() => {
        console.log('🧪 Test 1: Checking for NavigationCategoryFilter...');
        if (window.navigationFilter) {
            console.log('✅ NavigationCategoryFilter instance found');
        } else {
            console.log('❌ NavigationCategoryFilter instance not found');
        }
        
        // Test 2: Check if filter bar exists
        console.log('🧪 Test 2: Checking for filter bar...');
        const filterBar = document.getElementById('categoryFilterBar');
        if (filterBar) {
            console.log('✅ Filter bar found:', filterBar);
            console.log('   Display style:', filterBar.style.display);
            console.log('   Visibility:', getComputedStyle(filterBar).visibility);
        } else {
            console.log('❌ Filter bar not found');
            console.log('🔧 Creating filter bar manually...');
            createTestFilterBar();
        }
        
        // Test 3: Check for filterable elements
        console.log('🧪 Test 3: Checking for filterable elements...');
        const filterableElements = document.querySelectorAll('.card, .workshop-card, .tutorial-item');
        console.log(`Found ${filterableElements.length} filterable elements`);
        
        filterableElements.forEach((element, index) => {
            console.log(`   Element ${index + 1}:`, element.dataset.category || 'No category');
        });
        
        // Test 4: Test filtering functionality
        console.log('🧪 Test 4: Testing filter functionality...');
        testFilterFunctionality();
        
    }, 1000);
});

function createTestFilterBar() {
    console.log('🔧 Creating test filter bar...');
    
    const filterBar = document.createElement('div');
    filterBar.id = 'categoryFilterBar';
    filterBar.className = 'category-filter-bar bg-light border-bottom';
    filterBar.style.display = 'block';
    filterBar.innerHTML = `
        <div class="container">
            <div class="row align-items-center py-2">
                <div class="col-md-8">
                    <div class="d-flex flex-wrap gap-2">
                        <span class="fw-bold text-muted me-3">Filter by:</span>
                        <button class="btn btn-sm btn-primary category-filter active" data-category="all">
                            <i class="bi bi-grid me-1"></i>All
                        </button>
                        <button class="btn btn-sm btn-outline-primary category-filter" data-category="beginner">
                            <i class="bi bi-star me-1"></i>Beginner
                        </button>
                        <button class="btn btn-sm btn-outline-primary category-filter" data-category="intermediate">
                            <i class="bi bi-star-half me-1"></i>Intermediate
                        </button>
                        <button class="btn btn-sm btn-outline-primary category-filter" data-category="advanced">
                            <i class="bi bi-stars me-1"></i>Advanced
                        </button>
                        <button class="btn btn-sm btn-outline-success category-filter" data-category="lora">
                            <i class="bi bi-cpu me-1"></i>LoRA
                        </button>
                        <button class="btn btn-sm btn-outline-success category-filter" data-category="qlora">
                            <i class="bi bi-memory me-1"></i>QLoRA
                        </button>
                        <button class="btn btn-sm btn-outline-info category-filter" data-category="hands-on">
                            <i class="bi bi-hand-index me-1"></i>Hands-on
                        </button>
                        <button class="btn btn-sm btn-outline-warning category-filter" data-category="theory">
                            <i class="bi bi-book me-1"></i>Theory
                        </button>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-secondary" id="clearFilters">
                        <i class="bi bi-x-circle me-1"></i>Clear Filters
                    </button>
                    <button class="btn btn-sm btn-outline-secondary ms-2" id="hideFilterBar">
                        <i class="bi bi-eye-slash me-1"></i>Hide
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert after navigation
    const navbar = document.querySelector('.navbar');
    if (navbar && navbar.parentNode) {
        navbar.parentNode.insertBefore(filterBar, navbar.nextSibling);
        console.log('✅ Test filter bar created and inserted');
        
        // Add event listeners
        setupTestEventListeners();
    } else {
        console.log('❌ Could not find navbar to insert filter bar');
        // Try inserting at the beginning of main content
        const mainContent = document.querySelector('main, .container, body');
        if (mainContent) {
            mainContent.insertBefore(filterBar, mainContent.firstChild);
            console.log('✅ Test filter bar inserted at beginning of content');
            setupTestEventListeners();
        }
    }
}

function setupTestEventListeners() {
    console.log('🔧 Setting up test event listeners...');
    
    // Category filter buttons
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.dataset.category;
            console.log('🎯 Filter clicked:', category);
            testApplyFilter(category, button);
        });
    });

    // Clear filters button
    const clearButton = document.getElementById('clearFilters');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            console.log('🧹 Clear filters clicked');
            testClearFilters();
        });
    }

    console.log('✅ Test event listeners set up');
}

function testApplyFilter(category, button) {
    console.log('🎯 Applying filter:', category);
    
    // Update button states
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning');
        btn.classList.add('btn-outline-primary');
    });
    
    button.classList.add('active', 'btn-primary');
    button.classList.remove('btn-outline-primary');
    
    // Apply filtering
    const filterableElements = document.querySelectorAll('.card, .workshop-card, .tutorial-item');
    let visibleCount = 0;
    
    filterableElements.forEach(element => {
        const elementCategories = getElementCategories(element);
        const shouldShow = category === 'all' || elementCategories.includes(category);
        
        if (shouldShow) {
            element.style.display = '';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            visibleCount++;
        } else {
            element.style.opacity = '0.3';
            element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                element.style.display = 'none';
            }, 300);
        }
    });
    
    console.log(`✅ Filter applied: ${visibleCount}/${filterableElements.length} items visible`);
    
    // Show results
    showFilterResults(visibleCount, filterableElements.length, category);
}

function getElementCategories(element) {
    const categories = [];
    
    // Check data attributes
    if (element.dataset.category) {
        categories.push(...element.dataset.category.split(',').map(c => c.trim()));
    }
    if (element.dataset.level) {
        categories.push(element.dataset.level);
    }
    if (element.dataset.type) {
        categories.push(element.dataset.type);
    }
    
    // Check classes
    const classList = Array.from(element.classList);
    const categoryClasses = classList.filter(cls => 
        ['beginner', 'intermediate', 'advanced', 'lora', 'qlora', 'hands-on', 'theory'].includes(cls)
    );
    categories.push(...categoryClasses);
    
    // Check content for keywords
    const text = element.textContent.toLowerCase();
    if (text.includes('lora') && !text.includes('qlora')) categories.push('lora');
    if (text.includes('qlora')) categories.push('qlora');
    if (text.includes('hands-on') || text.includes('practical')) categories.push('hands-on');
    if (text.includes('theory') || text.includes('concept')) categories.push('theory');
    
    return [...new Set(categories)];
}

function testClearFilters() {
    console.log('🧹 Clearing all filters...');
    
    // Reset all buttons
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning');
        btn.classList.add('btn-outline-primary');
    });
    
    // Activate "All" button
    const allButton = document.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active', 'btn-primary');
        allButton.classList.remove('btn-outline-primary');
    }
    
    // Show all elements
    const filterableElements = document.querySelectorAll('.card, .workshop-card, .tutorial-item');
    filterableElements.forEach(element => {
        element.style.display = '';
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    });
    
    console.log(`✅ All filters cleared: ${filterableElements.length} items visible`);
    
    // Hide results counter
    const counter = document.getElementById('filterResultsCounter');
    if (counter) {
        counter.style.display = 'none';
    }
}

function showFilterResults(visible, total, category) {
    let counter = document.getElementById('filterResultsCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'filterResultsCounter';
        counter.className = 'alert alert-info mt-3';
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(counter, container.firstChild);
        }
    }

    if (category === 'all') {
        counter.style.display = 'none';
    } else {
        counter.style.display = 'block';
        counter.innerHTML = `
            <i class="bi bi-info-circle me-2"></i>
            Showing <strong>${visible}</strong> of <strong>${total}</strong> items
            (filtered by: ${category})
        `;
    }
}

function testFilterFunctionality() {
    console.log('🧪 Testing filter functionality...');
    
    // Test each filter
    const filters = ['all', 'beginner', 'intermediate', 'advanced', 'lora', 'qlora', 'hands-on', 'theory'];
    
    filters.forEach((filter, index) => {
        setTimeout(() => {
            console.log(`🎯 Testing filter: ${filter}`);
            const button = document.querySelector(`[data-category="${filter}"]`);
            if (button) {
                button.click();
            } else {
                console.log(`❌ Filter button not found: ${filter}`);
            }
        }, index * 1000);
    });
    
    // Reset to "all" after testing
    setTimeout(() => {
        console.log('🔄 Resetting to "all" filter...');
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) {
            allButton.click();
        }
        console.log('✅ Filter functionality test complete!');
    }, filters.length * 1000);
}

console.log('✅ Test script loaded and ready!');
