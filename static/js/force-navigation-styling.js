/**
 * FORCE NAVIGATION STYLING JAVASCRIPT
 * This script forces the exact navigation styling to match the reference image
 * Runs after all CSS files have loaded to override any conflicting styles
 * Uses JavaScript to directly apply styles with maximum priority
 */

(function() {
    'use strict';
    
    // Reference image colors
    const COLORS = {
        navBackground: '#eef5eb',
        navBorder: '#d1e7ce',
        brandColor: '#3c6430',
        brandHover: '#2d4a24',
        linkColor: '#162211',
        linkHover: '#3c6430',
        signInColor: '#7350a5',
        registerBg: '#3c6430',
        registerHover: '#2d4a24',
        searchBorder: '#d1e7ce',
        searchFocus: '#3c6430',
        placeholderColor: '#919fca'
    };
    
    function forceNavigationStyling() {
        // Force navigation background
        const navbars = document.querySelectorAll('nav.navbar, .navbar');
        navbars.forEach(navbar => {
            navbar.style.setProperty('background-color', COLORS.navBackground, 'important');
            navbar.style.setProperty('background', COLORS.navBackground, 'important');
            navbar.style.setProperty('background-image', 'none', 'important');
            navbar.style.setProperty('border-bottom', `1px solid ${COLORS.navBorder}`, 'important');
            navbar.style.setProperty('border-top', 'none', 'important');
            navbar.style.setProperty('border-left', 'none', 'important');
            navbar.style.setProperty('border-right', 'none', 'important');
            navbar.style.setProperty('box-shadow', 'none', 'important');
            navbar.style.setProperty('padding', '0.5rem 0', 'important');
            navbar.style.setProperty('min-height', '60px', 'important');
        });
        
        // Force brand styling
        const brands = document.querySelectorAll('.navbar-brand, a.navbar-brand');
        brands.forEach(brand => {
            brand.style.setProperty('color', COLORS.brandColor, 'important');
            brand.style.setProperty('font-weight', '700', 'important');
            brand.style.setProperty('font-size', '1.25rem', 'important');
            brand.style.setProperty('text-decoration', 'none', 'important');
            brand.style.setProperty('padding', '0.3125rem 0', 'important');
            brand.style.setProperty('margin-right', '1rem', 'important');
            
            // Add hover event
            brand.addEventListener('mouseenter', function() {
                this.style.setProperty('color', COLORS.brandHover, 'important');
            });
            brand.addEventListener('mouseleave', function() {
                this.style.setProperty('color', COLORS.brandColor, 'important');
            });
        });
        
        // Force navigation links
        const navLinks = document.querySelectorAll('.nav-link, .navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.style.setProperty('color', COLORS.linkColor, 'important');
            link.style.setProperty('font-weight', '400', 'important');
            link.style.setProperty('font-size', '1rem', 'important');
            link.style.setProperty('padding', '0.5rem 1rem', 'important');
            link.style.setProperty('border-radius', '0', 'important');
            link.style.setProperty('transition', 'color 0.15s ease-in-out', 'important');
            link.style.setProperty('display', 'flex', 'important');
            link.style.setProperty('align-items', 'center', 'important');
            link.style.setProperty('white-space', 'nowrap', 'important');
            
            // Add hover event
            link.addEventListener('mouseenter', function() {
                this.style.setProperty('color', COLORS.linkHover, 'important');
                this.style.setProperty('background-color', 'transparent', 'important');
            });
            link.addEventListener('mouseleave', function() {
                this.style.setProperty('color', COLORS.linkColor, 'important');
                this.style.setProperty('background-color', 'transparent', 'important');
            });
        });
        
        // Force Sign In button (outline-primary)
        const signInBtns = document.querySelectorAll('.btn-outline-primary');
        signInBtns.forEach(btn => {
            btn.style.setProperty('color', COLORS.signInColor, 'important');
            btn.style.setProperty('border-color', COLORS.signInColor, 'important');
            btn.style.setProperty('background-color', 'transparent', 'important');
            btn.style.setProperty('background', 'transparent', 'important');
            btn.style.setProperty('font-weight', '400', 'important');
            btn.style.setProperty('padding', '0.375rem 0.75rem', 'important');
            btn.style.setProperty('border-radius', '0.375rem', 'important');
            btn.style.setProperty('font-size', '0.9rem', 'important');
            btn.style.setProperty('line-height', '1.5', 'important');
            btn.style.setProperty('text-decoration', 'none', 'important');
            btn.style.setProperty('border', `1px solid ${COLORS.signInColor}`, 'important');
            
            // Add hover event
            btn.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', COLORS.signInColor, 'important');
                this.style.setProperty('background', COLORS.signInColor, 'important');
                this.style.setProperty('border-color', COLORS.signInColor, 'important');
                this.style.setProperty('color', '#fff', 'important');
            });
            btn.addEventListener('mouseleave', function() {
                this.style.setProperty('background-color', 'transparent', 'important');
                this.style.setProperty('background', 'transparent', 'important');
                this.style.setProperty('border-color', COLORS.signInColor, 'important');
                this.style.setProperty('color', COLORS.signInColor, 'important');
            });
        });
        
        // Force Register button (success)
        const registerBtns = document.querySelectorAll('.btn-success');
        registerBtns.forEach(btn => {
            btn.style.setProperty('background-color', COLORS.registerBg, 'important');
            btn.style.setProperty('background', COLORS.registerBg, 'important');
            btn.style.setProperty('border-color', COLORS.registerBg, 'important');
            btn.style.setProperty('color', '#fff', 'important');
            btn.style.setProperty('font-weight', '400', 'important');
            btn.style.setProperty('padding', '0.375rem 0.75rem', 'important');
            btn.style.setProperty('border-radius', '0.375rem', 'important');
            btn.style.setProperty('font-size', '0.9rem', 'important');
            btn.style.setProperty('line-height', '1.5', 'important');
            btn.style.setProperty('text-decoration', 'none', 'important');
            btn.style.setProperty('border', `1px solid ${COLORS.registerBg}`, 'important');
            
            // Add hover event
            btn.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', COLORS.registerHover, 'important');
                this.style.setProperty('background', COLORS.registerHover, 'important');
                this.style.setProperty('border-color', COLORS.registerHover, 'important');
                this.style.setProperty('color', '#fff', 'important');
            });
            btn.addEventListener('mouseleave', function() {
                this.style.setProperty('background-color', COLORS.registerBg, 'important');
                this.style.setProperty('background', COLORS.registerBg, 'important');
                this.style.setProperty('border-color', COLORS.registerBg, 'important');
                this.style.setProperty('color', '#fff', 'important');
            });
        });
        
        // Force search input
        const searchInputs = document.querySelectorAll('.navbar .form-control, nav .form-control');
        searchInputs.forEach(input => {
            input.style.setProperty('background-color', '#fff', 'important');
            input.style.setProperty('background', '#fff', 'important');
            input.style.setProperty('border', `1px solid ${COLORS.searchBorder}`, 'important');
            input.style.setProperty('border-radius', '20px', 'important');
            input.style.setProperty('padding', '0.375rem 0.75rem', 'important');
            input.style.setProperty('font-size', '0.9rem', 'important');
            input.style.setProperty('color', COLORS.linkColor, 'important');
            input.style.setProperty('width', '200px', 'important');
            input.style.setProperty('line-height', '1.5', 'important');
            
            // Add focus event
            input.addEventListener('focus', function() {
                this.style.setProperty('border-color', COLORS.searchFocus, 'important');
                this.style.setProperty('box-shadow', `0 0 0 0.25rem rgba(60, 100, 48, 0.25)`, 'important');
                this.style.setProperty('outline', '0', 'important');
            });
            input.addEventListener('blur', function() {
                this.style.setProperty('border-color', COLORS.searchBorder, 'important');
                this.style.setProperty('box-shadow', 'none', 'important');
            });
        });
        
        // Force dropdown menus
        const dropdowns = document.querySelectorAll('.navbar .dropdown-menu, nav .dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.style.setProperty('background-color', '#fff', 'important');
            dropdown.style.setProperty('background', '#fff', 'important');
            dropdown.style.setProperty('border', `1px solid ${COLORS.searchBorder}`, 'important');
            dropdown.style.setProperty('border-radius', '0.375rem', 'important');
            dropdown.style.setProperty('box-shadow', '0 0.5rem 1rem rgba(0, 0, 0, 0.15)', 'important');
        });
        
        // Force dropdown items
        const dropdownItems = document.querySelectorAll('.navbar .dropdown-item, nav .dropdown-item');
        dropdownItems.forEach(item => {
            item.style.setProperty('color', COLORS.linkColor, 'important');
            item.style.setProperty('background-color', 'transparent', 'important');
            
            // Add hover event
            item.addEventListener('mouseenter', function() {
                this.style.setProperty('background-color', 'rgba(60, 100, 48, 0.1)', 'important');
                this.style.setProperty('color', COLORS.linkHover, 'important');
            });
            item.addEventListener('mouseleave', function() {
                this.style.setProperty('background-color', 'transparent', 'important');
                this.style.setProperty('color', COLORS.linkColor, 'important');
            });
        });
        
        console.log('✅ Navigation styling forced successfully!');
    }
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceNavigationStyling);
    } else {
        forceNavigationStyling();
    }
    
    // Also run after a short delay to catch any dynamically loaded content
    setTimeout(forceNavigationStyling, 100);
    setTimeout(forceNavigationStyling, 500);
    setTimeout(forceNavigationStyling, 1000);
    
    // Run whenever new content is added to the page
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1 && (
                        node.classList.contains('navbar') ||
                        node.querySelector && node.querySelector('.navbar')
                    )) {
                        shouldUpdate = true;
                        break;
                    }
                }
            }
        });
        
        if (shouldUpdate) {
            setTimeout(forceNavigationStyling, 50);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();
