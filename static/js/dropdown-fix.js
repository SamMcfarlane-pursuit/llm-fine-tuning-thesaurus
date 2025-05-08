/**
 * Dropdown Fix
 * Ensures proper functionality of dropdown menus, especially the Guides dropdown
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix for the Guides dropdown
    const guidesDropdown = document.getElementById('guidesDropdown');
    const guidesDropdownMenu = document.querySelector('.dropdown-menu[aria-labelledby="guidesDropdown"]');
    
    if (guidesDropdown && guidesDropdownMenu) {
        // Ensure the dropdown menu has the proper z-index
        guidesDropdownMenu.style.zIndex = '1000';
        
        // Ensure the dropdown toggle has the proper background color
        guidesDropdown.style.backgroundColor = 'rgba(93, 214, 255, 0.15)';
        guidesDropdown.style.border = '1px solid rgba(93, 214, 255, 0.2)';
        
        // Add event listeners to ensure proper behavior
        guidesDropdown.addEventListener('mouseenter', function() {
            // Force the background color on hover
            this.style.backgroundColor = 'rgba(93, 214, 255, 0.25)';
            this.style.border = '1px solid rgba(93, 214, 255, 0.3)';
        });
        
        guidesDropdown.addEventListener('mouseleave', function() {
            // Reset the background color when not hovered
            if (!this.classList.contains('show')) {
                this.style.backgroundColor = 'rgba(93, 214, 255, 0.15)';
                this.style.border = '1px solid rgba(93, 214, 255, 0.2)';
            }
        });
        
        // Fix for the dropdown items
        const dropdownItems = guidesDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.style.backgroundColor = 'transparent';
            item.style.position = 'relative';
            item.style.zIndex = '1001';
            
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(93, 214, 255, 0.15)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
        });
    }
    
    // Fix for all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Prevent the default behavior to ensure our custom handling
            e.preventDefault();
            
            // Toggle the dropdown menu
            const dropdownMenu = document.querySelector('.dropdown-menu[aria-labelledby="' + this.id + '"]');
            if (dropdownMenu) {
                if (this.getAttribute('aria-expanded') === 'true') {
                    this.setAttribute('aria-expanded', 'false');
                    dropdownMenu.classList.remove('show');
                    this.classList.remove('show');
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    dropdownMenu.classList.add('show');
                    this.classList.add('show');
                }
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (toggle && menu) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.classList.remove('show');
                    menu.classList.remove('show');
                }
            }
        });
    });
});
