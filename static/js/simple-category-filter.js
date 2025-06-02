/**
 * Simple Category Filter - Guaranteed to work
 * This is a simplified version that focuses on core functionality
 */

console.log('🚀 Simple Category Filter loading...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM loaded, initializing simple category filter...');
    
    // Check if we're on a page that needs filtering
    const currentPath = window.location.pathname;
    const needsFiltering = ['/workshops', '/tutorials', '/learn', '/'].some(path => 
        currentPath.includes(path) || currentPath === path
    );
    
    if (!needsFiltering) {
        console.log('⏭️ Page does not need filtering, skipping...');
        return;
    }
    
    console.log('✅ Page needs filtering, setting up...');
    
    // Create filter bar
    createSimpleFilterBar();
    
    // Setup filtering functionality
    setupSimpleFiltering();
    
    console.log('🎉 Simple Category Filter initialized successfully!');
});

function createSimpleFilterBar() {
    console.log('🔧 Creating simple filter bar...');
    
    // Check if filter bar already exists
    if (document.getElementById('simpleCategoryFilterBar')) {
        console.log('⚠️ Filter bar already exists, skipping creation...');
        return;
    }
    
    // Create the filter bar HTML
    const filterBarHTML = `
        <div id="simpleCategoryFilterBar" class="bg-light border-bottom py-3" style="box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-md-9">
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                            <span class="fw-bold text-primary me-3">
                                <i class="bi bi-funnel me-1"></i>Filter Content:
                            </span>
                            <button class="btn btn-sm btn-primary filter-btn active" data-filter="all">
                                <i class="bi bi-grid me-1"></i>All
                            </button>
                            <button class="btn btn-sm btn-outline-success filter-btn" data-filter="beginner">
                                <i class="bi bi-star me-1"></i>Beginner
                            </button>
                            <button class="btn btn-sm btn-outline-warning filter-btn" data-filter="intermediate">
                                <i class="bi bi-star-half me-1"></i>Intermediate
                            </button>
                            <button class="btn btn-sm btn-outline-danger filter-btn" data-filter="advanced">
                                <i class="bi bi-stars me-1"></i>Advanced
                            </button>
                            <button class="btn btn-sm btn-outline-info filter-btn" data-filter="lora">
                                <i class="bi bi-cpu me-1"></i>LoRA
                            </button>
                            <button class="btn btn-sm btn-outline-info filter-btn" data-filter="qlora">
                                <i class="bi bi-memory me-1"></i>QLoRA
                            </button>
                            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="hands-on">
                                <i class="bi bi-hand-index me-1"></i>Hands-on
                            </button>
                            <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="theory">
                                <i class="bi bi-book me-1"></i>Theory
                            </button>
                        </div>
                    </div>
                    <div class="col-md-3 text-end">
                        <button id="clearAllFilters" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-x-circle me-1"></i>Clear All
                        </button>
                        <span id="filterCounter" class="ms-2 text-muted small"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Find where to insert the filter bar
    const navbar = document.querySelector('.navbar');
    if (navbar && navbar.parentNode) {
        // Insert after navbar
        navbar.insertAdjacentHTML('afterend', filterBarHTML);
        console.log('✅ Filter bar inserted after navbar');
    } else {
        // Fallback: insert at beginning of main content
        const mainContent = document.querySelector('main, .container, body');
        if (mainContent) {
            mainContent.insertAdjacentHTML('afterbegin', filterBarHTML);
            console.log('✅ Filter bar inserted at beginning of content');
        } else {
            console.log('❌ Could not find suitable location for filter bar');
            return;
        }
    }
    
    // Add some basic styling
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn {
            transition: all 0.3s ease;
            border-radius: 20px !important;
            font-weight: 500;
        }
        .filter-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .filter-btn.active {
            transform: scale(1.05);
            box-shadow: 0 3px 12px rgba(0,0,0,0.2);
        }
        .filterable-item {
            transition: all 0.4s ease;
        }
        .filterable-item.hidden {
            opacity: 0;
            transform: scale(0.95);
            pointer-events: none;
        }
        #filterCounter {
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Filter bar created successfully');
}

function setupSimpleFiltering() {
    console.log('🔧 Setting up simple filtering functionality...');
    
    // Get all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearButton = document.getElementById('clearAllFilters');
    const counter = document.getElementById('filterCounter');
    
    // Get all filterable items
    const filterableItems = document.querySelectorAll('.card, .workshop-card, .tutorial-item, .guide-item, .quiz-item');
    
    console.log(`Found ${filterButtons.length} filter buttons and ${filterableItems.length} filterable items`);
    
    // Add data attributes to items that don't have them
    filterableItems.forEach((item, index) => {
        if (!item.dataset.category && !item.classList.contains('filterable-item')) {
            item.classList.add('filterable-item');
            
            // Auto-detect categories from content
            const text = item.textContent.toLowerCase();
            const categories = [];
            
            if (text.includes('beginner') || item.querySelector('.badge')?.textContent.toLowerCase().includes('beginner')) {
                categories.push('beginner');
            }
            if (text.includes('intermediate') || item.querySelector('.badge')?.textContent.toLowerCase().includes('intermediate')) {
                categories.push('intermediate');
            }
            if (text.includes('advanced') || item.querySelector('.badge')?.textContent.toLowerCase().includes('advanced')) {
                categories.push('advanced');
            }
            if (text.includes('lora') && !text.includes('qlora')) {
                categories.push('lora');
            }
            if (text.includes('qlora')) {
                categories.push('qlora');
            }
            if (text.includes('hands-on') || text.includes('practical') || text.includes('workshop')) {
                categories.push('hands-on');
            }
            if (text.includes('theory') || text.includes('concept') || text.includes('tutorial')) {
                categories.push('theory');
            }
            
            if (categories.length > 0) {
                item.dataset.category = categories.join(',');
                console.log(`Auto-categorized item ${index + 1}:`, categories.join(', '));
            } else {
                item.dataset.category = 'general';
                console.log(`Item ${index + 1} categorized as: general`);
            }
        }
    });
    
    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.dataset.filter;
            console.log('🎯 Filter clicked:', filter);
            applyFilter(filter, this);
        });
    });
    
    // Add click event listener to clear button
    if (clearButton) {
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🧹 Clear all filters clicked');
            clearAllFilters();
        });
    }
    
    // Initial count
    updateCounter(filterableItems.length, filterableItems.length);
    
    console.log('✅ Simple filtering functionality set up');
}

function applyFilter(filterValue, activeButton) {
    console.log('🎯 Applying filter:', filterValue);
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'btn-success', 'btn-warning', 'btn-danger', 'btn-info');
        btn.classList.add('btn-outline-secondary');
    });
    
    // Activate clicked button with appropriate color
    activeButton.classList.remove('btn-outline-secondary');
    activeButton.classList.add('active');
    
    if (filterValue === 'all') {
        activeButton.classList.add('btn-primary');
    } else if (filterValue === 'beginner') {
        activeButton.classList.add('btn-success');
    } else if (filterValue === 'intermediate') {
        activeButton.classList.add('btn-warning');
    } else if (filterValue === 'advanced') {
        activeButton.classList.add('btn-danger');
    } else if (['lora', 'qlora'].includes(filterValue)) {
        activeButton.classList.add('btn-info');
    } else {
        activeButton.classList.add('btn-secondary');
    }
    
    // Apply filter to items
    const filterableItems = document.querySelectorAll('.filterable-item, .card, .workshop-card, .tutorial-item');
    let visibleCount = 0;
    
    filterableItems.forEach(item => {
        const itemCategories = (item.dataset.category || '').split(',').map(cat => cat.trim());
        const shouldShow = filterValue === 'all' || itemCategories.includes(filterValue);
        
        if (shouldShow) {
            item.classList.remove('hidden');
            item.style.display = '';
            visibleCount++;
        } else {
            item.classList.add('hidden');
            // Hide after animation
            setTimeout(() => {
                if (item.classList.contains('hidden')) {
                    item.style.display = 'none';
                }
            }, 400);
        }
    });
    
    // Update counter
    updateCounter(visibleCount, filterableItems.length);
    
    console.log(`✅ Filter applied: ${visibleCount}/${filterableItems.length} items visible`);
}

function clearAllFilters() {
    console.log('🧹 Clearing all filters...');
    
    // Reset all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'btn-success', 'btn-warning', 'btn-danger', 'btn-info', 'btn-secondary');
        btn.classList.add('btn-outline-secondary');
    });
    
    // Activate "All" button
    const allButton = document.querySelector('[data-filter="all"]');
    if (allButton) {
        allButton.classList.remove('btn-outline-secondary');
        allButton.classList.add('active', 'btn-primary');
    }
    
    // Show all items
    const filterableItems = document.querySelectorAll('.filterable-item, .card, .workshop-card, .tutorial-item');
    filterableItems.forEach(item => {
        item.classList.remove('hidden');
        item.style.display = '';
    });
    
    // Update counter
    updateCounter(filterableItems.length, filterableItems.length);
    
    console.log('✅ All filters cleared');
}

function updateCounter(visible, total) {
    const counter = document.getElementById('filterCounter');
    if (counter) {
        if (visible === total) {
            counter.textContent = `${total} items`;
        } else {
            counter.textContent = `${visible} of ${total} items`;
        }
    }
}

console.log('✅ Simple Category Filter script loaded!');
