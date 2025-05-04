/**
 * Robust Scrolling Functionality - Fixed Version
 * Provides enhanced scrolling features with information tooltips and smooth navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize robust scrolling features
    initRobustScrolling();
});

/**
 * Initialize all robust scrolling features
 */
function initRobustScrolling() {
    try {
        console.log('Initializing robust scrolling features...');

        // Check if scrolling features are already initialized to prevent duplicates
        if (window.robustScrollingInitialized) {
            console.log('Robust scrolling features already initialized');
            return;
        }

        // Add reading progress indicator
        addReadingProgressIndicator();

        // Add section navigation
        addSectionNavigation();

        // Add keyboard shortcuts
        addKeyboardShortcuts();

        // Mark as initialized
        window.robustScrollingInitialized = true;

        console.log('Robust scrolling features initialized successfully');
    } catch (error) {
        console.error('Error initializing robust scrolling:', error);
    }
}

/**
 * Add reading progress indicator to the top of the page
 */
function addReadingProgressIndicator() {
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';

    // Create progress text
    const progressText = document.createElement('div');
    progressText.className = 'reading-progress-text';
    progressText.innerHTML = '0% read';

    // Append elements
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    document.body.appendChild(progressContainer);

    // Update progress on scroll
    window.addEventListener('scroll', function() {
        // Calculate scroll percentage
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollTop = document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Update progress bar width
        progressBar.style.width = `${scrollPercentage}%`;

        // Update progress text
        progressText.innerHTML = `${Math.round(scrollPercentage)}% read`;

        // Add class when near completion
        if (scrollPercentage > 90) {
            progressContainer.classList.add('near-complete');
        } else {
            progressContainer.classList.remove('near-complete');
        }
    });
}

/**
 * Add section navigation
 */
function addSectionNavigation() {
    // Get all section headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

    // Only create navigation if we have enough headings
    if (headings.length < 2) return;

    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'section-navigation';

    // Check if there's a saved position preference
    const sidePreference = localStorage.getItem('section-nav-side') || 'right';
    if (sidePreference === 'left') {
        navContainer.classList.add('left-side');
    }

    // Add navigation title
    const navTitle = document.createElement('div');
    navTitle.className = 'section-nav-title';
    navTitle.innerHTML = '<i class="bi bi-list-ul"></i> Sections';
    navContainer.appendChild(navTitle);

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'section-nav-dots';

    // Create dots for each heading
    headings.forEach((heading, index) => {
        // Create dot container
        const dotContainer = document.createElement('div');
        dotContainer.className = 'section-nav-item';
        dotContainer.setAttribute('data-index', index);

        // Create dot
        const dot = document.createElement('div');
        dot.className = 'section-nav-dot';

        // Determine heading level for styling
        const headingLevel = heading.tagName.toLowerCase().replace('h', '') || '3';
        dot.classList.add(`level-${headingLevel}`);

        // Add label
        const label = document.createElement('div');
        label.className = 'section-nav-label';
        label.textContent = heading.textContent.trim();

        // Add dot and label to container
        dotContainer.appendChild(dot);
        dotContainer.appendChild(label);

        // Add click event
        dotContainer.addEventListener('click', function() {
            // Scroll to heading
            window.scrollTo({
                top: heading.offsetTop - 20,
                behavior: 'smooth'
            });
        });

        // Add to dots container
        dotsContainer.appendChild(dotContainer);
    });

    // Add dots container to navigation container
    navContainer.appendChild(dotsContainer);

    // Add expand/collapse button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'section-nav-toggle';
    toggleButton.innerHTML = sidePreference === 'left'
        ? '<i class="bi bi-chevron-right"></i>'
        : '<i class="bi bi-chevron-left"></i>';
    toggleButton.setAttribute('aria-label', 'Toggle section navigation');
    toggleButton.addEventListener('click', function() {
        navContainer.classList.toggle('expanded');
        toggleButton.innerHTML = navContainer.classList.contains('expanded')
            ? (sidePreference === 'left' ? '<i class="bi bi-chevron-left"></i>' : '<i class="bi bi-chevron-right"></i>')
            : (sidePreference === 'left' ? '<i class="bi bi-chevron-right"></i>' : '<i class="bi bi-chevron-left"></i>');
    });
    navContainer.appendChild(toggleButton);

    // Add side toggle button
    const sideToggleButton = document.createElement('button');
    sideToggleButton.className = 'section-nav-side-toggle';
    sideToggleButton.innerHTML = sidePreference === 'left'
        ? '<i class="bi bi-arrow-right-circle"></i>'
        : '<i class="bi bi-arrow-left-circle"></i>';
    sideToggleButton.setAttribute('aria-label', 'Move navigation to other side');
    sideToggleButton.setAttribute('title', sidePreference === 'left'
        ? 'Move to right side'
        : 'Move to left side');
    sideToggleButton.addEventListener('click', function() {
        const isLeftSide = navContainer.classList.toggle('left-side');
        sideToggleButton.innerHTML = isLeftSide
            ? '<i class="bi bi-arrow-right-circle"></i>'
            : '<i class="bi bi-arrow-left-circle"></i>';
        sideToggleButton.setAttribute('title', isLeftSide
            ? 'Move to right side'
            : 'Move to left side');

        // Update toggle button icon
        toggleButton.innerHTML = navContainer.classList.contains('expanded')
            ? (isLeftSide ? '<i class="bi bi-chevron-left"></i>' : '<i class="bi bi-chevron-right"></i>')
            : (isLeftSide ? '<i class="bi bi-chevron-right"></i>' : '<i class="bi bi-chevron-left"></i>');

        // Save preference
        localStorage.setItem('section-nav-side', isLeftSide ? 'left' : 'right');
    });
    navContainer.appendChild(sideToggleButton);

    // Add to document
    document.body.appendChild(navContainer);

    // Update active dot on scroll
    window.addEventListener('scroll', updateActiveDot);

    // Initial update
    updateActiveDot();
}

/**
 * Update active navigation dot
 */
function updateActiveDot() {
    const navItems = document.querySelectorAll('.section-nav-item');
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

    if (!navItems.length || !headings.length) return;

    // Find current heading
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const currentPosition = scrollTop + (clientHeight / 3);

    // Find the current heading index
    let currentIndex = -1;
    for (let i = 0; i < headings.length; i++) {
        if (headings[i].offsetTop <= currentPosition) {
            currentIndex = i;
        } else {
            break;
        }
    }

    // Update active dot and item
    navItems.forEach((item, index) => {
        // Clear all active states
        item.classList.remove('active');
        item.classList.remove('passed');

        // Set appropriate state
        if (index === currentIndex) {
            item.classList.add('active');

            // Highlight the current section
            highlightCurrentSection(headings[currentIndex]);
        } else if (index < currentIndex) {
            item.classList.add('passed');
        }
    });
}

/**
 * Highlight the current section in the document
 */
function highlightCurrentSection(currentHeading) {
    // Remove previous highlights
    document.querySelectorAll('.section-highlight').forEach(el => {
        el.classList.remove('section-highlight');
    });

    // Add highlight to current section
    if (currentHeading) {
        // Find the parent section or card
        let sectionElement = currentHeading;

        // Try to find parent section or card
        while (sectionElement &&
               !sectionElement.classList.contains('card') &&
               !sectionElement.tagName.toLowerCase() === 'section' &&
               sectionElement !== document.body) {
            sectionElement = sectionElement.parentElement;
        }

        // If we found a section or card, highlight it
        if (sectionElement && sectionElement !== document.body) {
            sectionElement.classList.add('section-highlight');
        } else {
            // Otherwise just highlight the heading
            currentHeading.classList.add('section-highlight');
        }
    }
}

/**
 * Add keyboard shortcuts for navigation
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Get all headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

        // Find current heading
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        const currentPosition = scrollTop + (clientHeight / 3);

        // Find the current heading index
        let currentIndex = -1;
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].offsetTop <= currentPosition) {
                currentIndex = i;
            } else {
                break;
            }
        }

        // Alt+Up: Go to previous section
        if (e.altKey && e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                window.scrollTo({
                    top: headings[currentIndex - 1].offsetTop - 20,
                    behavior: 'smooth'
                });
            } else {
                // Go to top of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Alt+Down: Go to next section
        if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < headings.length - 1) {
                window.scrollTo({
                    top: headings[currentIndex + 1].offsetTop - 20,
                    behavior: 'smooth'
                });
            } else {
                // Go to bottom of page
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            }
        }
    });
}
