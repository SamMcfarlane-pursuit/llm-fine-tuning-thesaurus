/**
 * Improved Sidebar JavaScript
 * Provides interactive functionality for the sidebar navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar
    initSidebar();
    
    // Handle mobile sidebar
    initMobileSidebar();
    
    // Add scroll spy functionality
    initScrollSpy();
    
    // Handle touch events for mobile and iPad
    initTouchEvents();
});

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
    // Get sidebar elements
    const sidebar = document.querySelector('.improved-sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const sideToggleButton = document.querySelector('.sidebar-side-toggle');
    
    if (!sidebar) return;
    
    // Toggle sidebar expansion
    if (toggleButton) {
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            sidebar.classList.toggle('expanded');
            
            // Update toggle button icon
            const icon = this.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('expanded')) {
                    icon.className = 'bi bi-chevron-right';
                } else {
                    icon.className = 'bi bi-chevron-left';
                }
            }
            
            // Save state in localStorage
            localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
        });
    }
    
    // Toggle sidebar position (left/right)
    if (sideToggleButton) {
        sideToggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            sidebar.classList.toggle('left-side');
            
            // Update side toggle button icon
            const icon = this.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('left-side')) {
                    icon.className = 'bi bi-arrow-right';
                } else {
                    icon.className = 'bi bi-arrow-left';
                }
            }
            
            // Save state in localStorage
            localStorage.setItem('sidebarLeftSide', sidebar.classList.contains('left-side'));
        });
    }
    
    // Add tooltips to sidebar items when collapsed
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        const label = item.querySelector('.sidebar-label');
        
        if (label) {
            const tooltip = document.createElement('div');
            tooltip.className = 'sidebar-tooltip';
            tooltip.textContent = label.textContent;
            item.appendChild(tooltip);
        }
        
        // Add click event to sidebar items
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get target section ID
            const targetId = this.getAttribute('data-target');
            
            if (targetId) {
                // Scroll to target section
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Smooth scroll to section
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL hash without scrolling
                    history.pushState(null, null, `#${targetId}`);
                }
            }
        });
    });
    
    // Restore sidebar state from localStorage
    const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
    const sidebarLeftSide = localStorage.getItem('sidebarLeftSide') === 'true';
    
    if (sidebarExpanded) {
        sidebar.classList.add('expanded');
        
        if (toggleButton) {
            const icon = toggleButton.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-chevron-right';
            }
        }
    }
    
    if (sidebarLeftSide) {
        sidebar.classList.add('left-side');
        
        if (sideToggleButton) {
            const icon = sideToggleButton.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-arrow-right';
            }
        }
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (sidebar && sidebar.classList.contains('expanded')) {
            if (!sidebar.contains(e.target)) {
                sidebar.classList.remove('expanded');
                
                if (toggleButton) {
                    const icon = toggleButton.querySelector('i');
                    if (icon) {
                        icon.className = 'bi bi-chevron-left';
                    }
                }
                
                localStorage.setItem('sidebarExpanded', false);
            }
        }
    });
}

/**
 * Initialize mobile sidebar functionality
 */
function initMobileSidebar() {
    // Create mobile toggle button if it doesn't exist
    if (!document.querySelector('.mobile-sidebar-toggle')) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-sidebar-toggle';
        mobileToggle.innerHTML = '<i class="bi bi-list"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation sidebar');
        document.body.appendChild(mobileToggle);
    }
    
    const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
    const sidebar = document.querySelector('.improved-sidebar');
    
    if (!mobileToggle || !sidebar) return;
    
    // Toggle mobile sidebar
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-visible');
        
        // Add close button if it doesn't exist
        if (sidebar.classList.contains('mobile-visible') && !sidebar.querySelector('.mobile-sidebar-close')) {
            const closeButton = document.createElement('button');
            closeButton.className = 'mobile-sidebar-close';
            closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
            closeButton.setAttribute('aria-label', 'Close navigation sidebar');
            sidebar.appendChild(closeButton);
            
            // Add click event to close button
            closeButton.addEventListener('click', function() {
                sidebar.classList.remove('mobile-visible');
            });
        }
        
        // Add overlay if it doesn't exist
        if (sidebar.classList.contains('mobile-visible') && !document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '98';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(overlay);
            
            // Fade in overlay
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
            
            // Add click event to overlay
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('mobile-visible');
                this.style.opacity = '0';
                
                // Remove overlay after fade out
                setTimeout(() => {
                    this.remove();
                }, 300);
            });
        } else if (!sidebar.classList.contains('mobile-visible')) {
            // Remove overlay when sidebar is hidden
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        }
    });
    
    // Close mobile sidebar when clicking on a navigation item
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-visible');
                
                // Remove overlay
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        overlay.remove();
                    }, 300);
                }
            }
        });
    });
}

/**
 * Initialize scroll spy functionality
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('[data-spy]');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    if (sections.length === 0 || sidebarItems.length === 0) return;
    
    // Update active section on scroll
    const updateActiveSection = () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY;
            
            // Check if section is in viewport
            if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionTop + sectionHeight - 100) {
                currentSection = section.id;
            }
        });
        
        // Update active sidebar item
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            
            const targetId = item.getAttribute('data-target');
            
            if (targetId === currentSection) {
                item.classList.add('active');
            }
        });
        
        // Update passed sections
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const scrollPosition = window.scrollY;
            
            // Find corresponding sidebar item
            const sidebarItem = document.querySelector(`.sidebar-item[data-target="${section.id}"]`);
            
            if (sidebarItem) {
                if (scrollPosition > sectionTop + 100) {
                    sidebarItem.classList.add('passed');
                } else {
                    sidebarItem.classList.remove('passed');
                }
            }
        });
    };
    
    // Initial update
    updateActiveSection();
    
    // Update on scroll
    window.addEventListener('scroll', updateActiveSection);
    
    // Update on resize
    window.addEventListener('resize', updateActiveSection);
    
    // Check for hash in URL
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetItem = document.querySelector(`.sidebar-item[data-target="${targetId}"]`);
        
        if (targetItem) {
            // Add active class to target item
            sidebarItems.forEach(item => item.classList.remove('active'));
            targetItem.classList.add('active');
            
            // Scroll to target section after a short delay
            setTimeout(() => {
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);
        }
    }
}

/**
 * Initialize touch events for mobile and iPad
 */
function initTouchEvents() {
    const sidebar = document.querySelector('.improved-sidebar');
    
    if (!sidebar) return;
    
    // Add touch events for sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        // Add touch start event
        item.addEventListener('touchstart', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Add touch end event
        item.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
        });
        
        // Add touch cancel event
        item.addEventListener('touchcancel', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // Add swipe gestures for mobile sidebar
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Check if device is mobile or iPad
    const isMobileOrIPad = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobileOrIPad) {
        // Add swipe right gesture to open sidebar
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        });
        
        // Handle swipe gesture
        const handleSwipeGesture = () => {
            const swipeThreshold = 100;
            
            // Swipe right to open sidebar
            if (touchEndX - touchStartX > swipeThreshold && touchStartX < 30) {
                if (!sidebar.classList.contains('mobile-visible')) {
                    // Trigger mobile toggle
                    const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
                    if (mobileToggle) {
                        mobileToggle.click();
                    }
                }
            }
            
            // Swipe left to close sidebar
            if (touchStartX - touchEndX > swipeThreshold && sidebar.classList.contains('mobile-visible')) {
                sidebar.classList.remove('mobile-visible');
                
                // Remove overlay
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        overlay.remove();
                    }, 300);
                }
            }
        };
    }
}

/**
 * Create a sidebar programmatically
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container element
 * @param {Array} options.sections - Array of section objects
 * @param {string} options.position - Sidebar position ('left' or 'right')
 * @param {boolean} options.expanded - Whether the sidebar should be expanded by default
 */
function createSidebar(options) {
    const defaults = {
        containerId: 'content',
        sections: [],
        position: 'right',
        expanded: false
    };
    
    const config = { ...defaults, ...options };
    
    // Get container element
    const container = document.getElementById(config.containerId);
    
    if (!container) {
        console.error(`Container element with ID "${config.containerId}" not found.`);
        return;
    }
    
    // Create sidebar element
    const sidebar = document.createElement('div');
    sidebar.className = `improved-sidebar ${config.expanded ? 'expanded' : ''} ${config.position === 'left' ? 'left-side' : ''}`;
    
    // Create sidebar header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `<div class="sidebar-title">Navigation</div>`;
    
    // Create sidebar navigation
    const nav = document.createElement('div');
    nav.className = 'sidebar-nav';
    
    // Create toggle buttons
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.innerHTML = `<i class="bi bi-chevron-${config.expanded ? 'right' : 'left'}"></i>`;
    toggleButton.setAttribute('aria-label', 'Toggle sidebar expansion');
    
    const sideToggleButton = document.createElement('button');
    sideToggleButton.className = 'sidebar-side-toggle';
    sideToggleButton.innerHTML = `<i class="bi bi-arrow-${config.position === 'left' ? 'right' : 'left'}"></i>`;
    sideToggleButton.setAttribute('aria-label', 'Toggle sidebar position');
    
    // Add sections to navigation
    let currentCategory = '';
    
    config.sections.forEach(section => {
        // Add category header if needed
        if (section.category && section.category !== currentCategory) {
            currentCategory = section.category;
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'sidebar-category';
            categoryHeader.textContent = currentCategory;
            nav.appendChild(categoryHeader);
        }
        
        // Create navigation item
        const item = document.createElement('div');
        item.className = `sidebar-item ${section.active ? 'active' : ''} ${section.passed ? 'passed' : ''}`;
        item.setAttribute('data-target', section.id);
        
        // Create navigation dot
        const dot = document.createElement('div');
        dot.className = 'sidebar-dot';
        
        // Create navigation label
        const label = document.createElement('div');
        label.className = 'sidebar-label';
        label.textContent = section.title;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'sidebar-tooltip';
        tooltip.textContent = section.title;
        
        // Assemble item
        item.appendChild(dot);
        item.appendChild(label);
        item.appendChild(tooltip);
        
        // Add item to navigation
        nav.appendChild(item);
    });
    
    // Assemble sidebar
    sidebar.appendChild(header);
    sidebar.appendChild(nav);
    sidebar.appendChild(toggleButton);
    sidebar.appendChild(sideToggleButton);
    
    // Add sidebar to container
    document.body.appendChild(sidebar);
    
    // Initialize sidebar functionality
    initSidebar();
    initMobileSidebar();
    initScrollSpy();
    initTouchEvents();
}
