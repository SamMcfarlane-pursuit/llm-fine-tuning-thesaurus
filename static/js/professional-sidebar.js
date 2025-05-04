/**
 * Professional Sidebar JavaScript
 * Handles sidebar functionality, navigation, and mobile responsiveness
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar functionality
    initializeSidebar();
    
    // Handle sidebar navigation clicks
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            navigateToSection(target);
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth < 992) {
                toggleMobileSidebar(false);
            }
        });
    });
    
    // Mobile sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarToggle && sidebarBackdrop && sidebarContainer) {
        // Toggle sidebar when button is clicked
        sidebarToggle.addEventListener('click', function() {
            toggleMobileSidebar();
        });
        
        // Close sidebar when backdrop is clicked
        sidebarBackdrop.addEventListener('click', function() {
            toggleMobileSidebar(false);
        });
        
        // Handle touch swipe to open/close sidebar
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 100;
            
            // Right swipe (open sidebar)
            if (touchEndX - touchStartX > swipeThreshold && touchStartX < 50) {
                toggleMobileSidebar(true);
            }
            
            // Left swipe (close sidebar)
            if (touchStartX - touchEndX > swipeThreshold && sidebarContainer.classList.contains('active')) {
                toggleMobileSidebar(false);
            }
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            // Reset sidebar state on desktop
            const sidebarContainer = document.getElementById('sidebar-container');
            const sidebarBackdrop = document.getElementById('sidebar-backdrop');
            if (sidebarContainer) sidebarContainer.classList.remove('active');
            if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        }
    });
    
    // Handle related concept items click
    document.querySelectorAll('.related-concept-item').forEach(item => {
        item.addEventListener('click', function() {
            const conceptName = this.querySelector('.concept-name').textContent;
            // Update sidebar with the selected concept
            updateSidebarContent(conceptName);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 992) {
                toggleMobileSidebar(false);
            }
        });
    });
});

// Function to toggle mobile sidebar
function toggleMobileSidebar(forceState) {
    const sidebarContainer = document.getElementById('sidebar-container');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (!sidebarContainer || !sidebarBackdrop || !sidebarToggle) return;
    
    const newState = forceState !== undefined ? forceState : !sidebarContainer.classList.contains('active');
    
    if (newState) {
        sidebarContainer.classList.add('active');
        sidebarBackdrop.classList.add('active');
        sidebarToggle.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scrolling when sidebar is open
    } else {
        sidebarContainer.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
        sidebarToggle.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scrolling
    }
}

// Function to initialize sidebar
function initializeSidebar() {
    // Default concept data
    const defaultConcept = 'fine-tuning';
    updateSidebarContent(defaultConcept);
    
    // Initialize any other sidebar components
    setupSidebarScrolling();
}

// Function to update sidebar content based on selected concept
function updateSidebarContent(conceptName) {
    // Update sidebar title and description
    document.getElementById('sidebar-concept-name').textContent = conceptName;
    
    // Here you would typically fetch related concepts and update the sidebar
    // For now, we'll just update the UI elements that exist
    
    // Highlight the active concept in the sidebar
    document.querySelectorAll('.related-concept-item').forEach(item => {
        const itemName = item.querySelector('.concept-name').textContent;
        if (itemName.toLowerCase() === conceptName.toLowerCase()) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Function to navigate to a section
function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Smooth scroll to section
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Setup smooth scrolling for sidebar
function setupSidebarScrolling() {
    const sidebar = document.querySelector('.sidebar-container');
    if (!sidebar) return;
    
    // Add smooth scrolling behavior
    sidebar.style.scrollBehavior = 'smooth';
    
    // For touch devices, ensure scrolling is smooth
    if ('ontouchstart' in window) {
        sidebar.style.overscrollBehavior = 'contain';
    }
}
