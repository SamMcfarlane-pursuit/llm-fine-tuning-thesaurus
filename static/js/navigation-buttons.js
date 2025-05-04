/**
 * Navigation Buttons JavaScript
 * Handles functionality for the main navigation buttons in the header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation buttons
    initNavigationButtons();

    // Initialize dropdown direct navigation
    handleDropdownDirectNavigation();
});

/**
 * Initialize navigation buttons with proper click handlers
 */
function initNavigationButtons() {
    // Get all navigation buttons in the header
    const navButtons = document.querySelectorAll('.navbar-nav .nav-link');

    // Add click handlers to each button
    navButtons.forEach(button => {
        // Skip dropdown toggles as they're handled separately
        if (button.classList.contains('dropdown-toggle')) {
            return;
        }

        // Add click handler
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // If href is '#', prevent default behavior and show a message
            if (href === '#') {
                e.preventDefault();
                console.error('Navigation link has no destination (href="#")');
                return;
            }

            // If href is not a valid URL, prevent default behavior
            if (!href || href === 'undefined') {
                e.preventDefault();
                console.error('Navigation link has invalid href:', href);
                return;
            }

            // Otherwise, let the default behavior happen (navigate to the href)
            console.log('Navigating to:', href);
        });
    });

    // Fix the "Home" button
    const homeButton = document.querySelector('.navbar-nav .nav-link[href="/"]');
    if (homeButton) {
        homeButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/';
        });
    }

    // Fix the "Tutorials" button
    const tutorialsButton = document.querySelector('.navbar-nav .nav-link[href="/tutorials"]');
    if (tutorialsButton) {
        tutorialsButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/tutorials';
        });
    }

    // Fix the "Quizzes" button
    const quizzesButton = document.querySelector('.navbar-nav .nav-link[href*="quiz"]');
    if (quizzesButton) {
        quizzesButton.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            window.location.href = href;
        });
    }

    // Fix the "Help" button
    const helpButton = document.querySelector('.navbar-nav .nav-link[href*="contact"]');
    if (helpButton) {
        helpButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/contact';
        });
    }
}

/**
 * Handle direct navigation for dropdown buttons
 * This allows dropdown buttons to navigate to a page when clicked directly
 */
function handleDropdownDirectNavigation() {
    // Get all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        // Get the href attribute
        const href = toggle.getAttribute('href');

        // Skip if href is # or empty
        if (!href || href === '#') {
            return;
        }

        // Add click handler
        toggle.addEventListener('click', function(e) {
            // If on mobile, let Bootstrap handle the dropdown
            if (window.innerWidth < 992) {
                return;
            }

            // Only navigate if the toggle itself was clicked (not a child element)
            if (e.target === this || e.target.parentNode === this) {
                // Prevent the dropdown from opening
                e.preventDefault();
                e.stopPropagation();

                // Navigate to the href
                window.location.href = href;
            }
        });
    });

    // Specifically handle the Learn & Explore dropdown
    const learnButton = document.querySelector('#learnThesaurusDropdown');
    if (learnButton) {
        learnButton.addEventListener('click', function(e) {
            // If on mobile, let Bootstrap handle the dropdown
            if (window.innerWidth < 992) {
                return;
            }

            // On desktop, navigate to the learn-and-explore page when clicked
            if (e.target === this || e.target.parentNode === this) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/learn-and-explore';
            }
        });
    }

    // Specifically handle the Frameworks dropdown
    const frameworksButton = document.querySelector('#frameworksDropdown');
    if (frameworksButton) {
        frameworksButton.addEventListener('click', function(e) {
            // If on mobile, let Bootstrap handle the dropdown
            if (window.innerWidth < 992) {
                return;
            }

            // On desktop, navigate to the frameworks page when clicked
            if (e.target === this || e.target.parentNode === this) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/frameworks';
            }
        });
    }

    // Specifically handle the Workshops dropdown
    const workshopsButton = document.querySelector('#workshopsDropdown');
    if (workshopsButton) {
        workshopsButton.addEventListener('click', function(e) {
            // If on mobile, let Bootstrap handle the dropdown
            if (window.innerWidth < 992) {
                return;
            }

            // On desktop, navigate to the workshops page when clicked
            if (e.target === this || e.target.parentNode === this) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/workshops';
            }
        });
    }

    // Specifically handle the Guides dropdown
    const guidesButton = document.querySelector('#guidesDropdown');
    if (guidesButton) {
        guidesButton.addEventListener('click', function(e) {
            // If on mobile, let Bootstrap handle the dropdown
            if (window.innerWidth < 992) {
                return;
            }

            // On desktop, navigate to the guides page when clicked
            if (e.target === this || e.target.parentNode === this) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/guide/finetuning-comparison';
            }
        });
    }
}
