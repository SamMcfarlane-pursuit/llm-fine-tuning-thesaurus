/**
 * Robust Scrolling Functionality
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

        // Create enhanced scrollbar
        createEnhancedScrollbar();

        // Add reading progress indicator
        addReadingProgressIndicator();

        // Add scroll position tooltip
        addScrollPositionTooltip();

        // Add section navigation
        addSectionNavigation();

        // Add keyboard shortcuts
        addKeyboardShortcuts();

        // Add reading time estimate
        addReadingTimeEstimate();

        console.log('Robust scrolling features initialized successfully');
    } catch (error) {
        console.error('Error initializing robust scrolling:', error);

        // Fallback to basic scrollbar
        try {
            createBasicScrollbar();
        } catch (fallbackError) {
            console.error('Failed to create fallback scrollbar:', fallbackError);
        }
    }
}

/**
 * Create enhanced scrollbar with visual feedback
 */
function createEnhancedScrollbar() {
    // Create scrollbar container
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.className = 'robust-scrollbar-container';

    // Create scrollbar track
    const scrollbarTrack = document.createElement('div');
    scrollbarTrack.className = 'robust-scrollbar-track';

    // Create scrollbar thumb
    const scrollbarThumb = document.createElement('div');
    scrollbarThumb.className = 'robust-scrollbar-thumb';

    // Create scrollbar tooltip
    const scrollbarTooltip = document.createElement('div');
    scrollbarTooltip.className = 'robust-scrollbar-tooltip';
    scrollbarTooltip.textContent = '0%';

    // Append elements
    scrollbarTrack.appendChild(scrollbarThumb);
    scrollbarContainer.appendChild(scrollbarTrack);
    scrollbarContainer.appendChild(scrollbarTooltip);
    document.body.appendChild(scrollbarContainer);

    // Update scrollbar on scroll
    window.addEventListener('scroll', updateScrollbarPosition);

    // Add drag functionality
    addScrollbarDragFunctionality(scrollbarThumb, scrollbarTooltip);
}

/**
 * Update scrollbar position based on scroll position
 */
function updateScrollbarPosition() {
    const scrollbarThumb = document.querySelector('.robust-scrollbar-thumb');
    const scrollbarTooltip = document.querySelector('.robust-scrollbar-tooltip');

    if (!scrollbarThumb || !scrollbarTooltip) return;

    // Calculate scroll percentage
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    // Update thumb position
    scrollbarThumb.style.top = `${scrollPercentage}%`;

    // Update tooltip
    scrollbarTooltip.textContent = `${Math.round(scrollPercentage)}%`;
    scrollbarTooltip.style.top = `${scrollPercentage}%`;

    // Show tooltip when scrolling
    scrollbarTooltip.classList.add('visible');

    // Hide tooltip after a delay
    clearTimeout(window.scrollTooltipTimeout);
    window.scrollTooltipTimeout = setTimeout(() => {
        scrollbarTooltip.classList.remove('visible');
    }, 1500);

    // Get current section
    updateCurrentSection(scrollPercentage);
}

/**
 * Add drag functionality to scrollbar
 */
function addScrollbarDragFunctionality(scrollbarThumb, scrollbarTooltip) {
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    // Mouse events
    scrollbarThumb.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events for mobile
    scrollbarThumb.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        startScrollTop = document.documentElement.scrollTop;

        // Add active class
        scrollbarThumb.classList.add('active');
        scrollbarTooltip.classList.add('visible');

        // Prevent default to avoid text selection
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;

        // Calculate new position
        const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        const deltaY = y - startY;

        // Calculate scroll ratio
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollRatio = (scrollHeight - clientHeight) / (clientHeight - scrollbarThumb.offsetHeight);

        // Update scroll position
        document.documentElement.scrollTop = startScrollTop + (deltaY * scrollRatio);

        // Prevent default to avoid text selection
        e.preventDefault();
    }

    function endDrag() {
        isDragging = false;

        // Remove active class
        scrollbarThumb.classList.remove('active');

        // Hide tooltip after a delay
        setTimeout(() => {
            if (!isDragging) {
                scrollbarTooltip.classList.remove('visible');
            }
        }, 1500);
    }
}

/**
 * Add scroll position tooltip that shows current section
 */
function addScrollPositionTooltip() {
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'scroll-position-tooltip';
    document.body.appendChild(tooltip);

    // Show tooltip on scroll
    window.addEventListener('scroll', () => {
        // Show tooltip
        tooltip.classList.add('visible');

        // Hide tooltip after a delay
        clearTimeout(window.positionTooltipTimeout);
        window.positionTooltipTimeout = setTimeout(() => {
            tooltip.classList.remove('visible');
        }, 1500);
    });
}

/**
 * Update current section information
 */
function updateCurrentSection(scrollPercentage) {
    const tooltip = document.querySelector('.scroll-position-tooltip');
    if (!tooltip) return;

    // Get all section headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

    // Find current heading
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const currentPosition = scrollTop + (clientHeight / 3);

    // Find the current heading
    let currentHeading = null;
    let nextHeading = null;
    let currentIndex = -1;

    for (let i = 0; i < headings.length; i++) {
        if (headings[i].offsetTop <= currentPosition) {
            currentHeading = headings[i];
            currentIndex = i;
        } else {
            nextHeading = headings[i];
            break;
        }
    }

    // Calculate progress within current section
    let sectionProgress = 0;
    if (currentHeading) {
        const currentSectionTop = currentHeading.offsetTop;
        const nextSectionTop = nextHeading ? nextHeading.offsetTop : document.documentElement.scrollHeight;
        const sectionHeight = nextSectionTop - currentSectionTop;
        const positionInSection = currentPosition - currentSectionTop;
        sectionProgress = Math.min(100, Math.max(0, Math.round((positionInSection / sectionHeight) * 100)));
    }

    // Get estimated reading time for the page
    const totalWords = document.body.innerText.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(totalWords / 200); // Average reading speed: 200 words per minute

    // Calculate remaining reading time based on scroll percentage
    const remainingTimeMinutes = Math.ceil(readingTimeMinutes * (1 - (scrollPercentage / 100)));

    // Update tooltip content
    if (currentHeading) {
        const headingText = currentHeading.textContent.trim();
        const nextHeadingText = nextHeading ? nextHeading.textContent.trim() : 'End of Page';

        tooltip.innerHTML = `
            <div class="tooltip-section">${headingText}</div>
            <div class="tooltip-progress">
                <div class="tooltip-progress-bar" style="width: ${sectionProgress}%"></div>
            </div>
            <div class="tooltip-info">
                <div class="tooltip-percentage">${Math.round(scrollPercentage)}% of page</div>
                <div class="tooltip-time"><i class="bi bi-clock"></i> ~${remainingTimeMinutes} min left</div>
            </div>
            <div class="tooltip-next">Next: ${nextHeading ? nextHeadingText : 'End of Page'}</div>
        `;

        // Add class to indicate section progress
        tooltip.className = 'scroll-position-tooltip visible';
        if (sectionProgress > 75) {
            tooltip.classList.add('near-complete');
        } else {
            tooltip.classList.remove('near-complete');
        }
    } else {
        tooltip.innerHTML = `
            <div class="tooltip-section">Top of Page</div>
            <div class="tooltip-progress">
                <div class="tooltip-progress-bar" style="width: 0%"></div>
            </div>
            <div class="tooltip-info">
                <div class="tooltip-percentage">${Math.round(scrollPercentage)}% of page</div>
                <div class="tooltip-time"><i class="bi bi-clock"></i> ~${readingTimeMinutes} min read</div>
            </div>
            <div class="tooltip-next">Next: ${headings.length > 0 ? headings[0].textContent.trim() : 'No sections'}</div>
        `;
    }

    // Highlight the current section in the document
    highlightCurrentSection(currentHeading);
}

/**
 * Highlight the current section in the document
 */
function highlightCurrentSection(currentHeading) {
    try {
        // Remove previous highlights and markers
        document.querySelectorAll('.section-highlight').forEach(el => {
            el.classList.remove('section-highlight');
            el.classList.remove('section-highlight-active');

            // Remove any added markers
            const marker = el.querySelector('.section-current-marker');
            if (marker) {
                marker.remove();
            }
        });

        // Add highlight to current section
        if (currentHeading) {
            // Find the parent section or card
            let sectionElement = currentHeading;
            let headingElement = currentHeading;

            // Try to find parent section or card
            while (sectionElement &&
                  !sectionElement.classList.contains('card') &&
                  !sectionElement.tagName.toLowerCase() === 'section' &&
                  !sectionElement.classList.contains('container') &&
                  sectionElement !== document.body) {
                sectionElement = sectionElement.parentElement;
            }

            // If we found a section or card, highlight it
            if (sectionElement && sectionElement !== document.body) {
                sectionElement.classList.add('section-highlight');

                // Add a visible marker to the heading
                const marker = document.createElement('span');
                marker.className = 'section-current-marker';
                marker.setAttribute('aria-hidden', 'true');
                marker.innerHTML = '→ ';

                // Only add if it doesn't already exist
                if (!headingElement.querySelector('.section-current-marker')) {
                    headingElement.insertBefore(marker, headingElement.firstChild);
                }

                // Add active class after a small delay for animation
                setTimeout(() => {
                    sectionElement.classList.add('section-highlight-active');
                }, 50);

                // Ensure the highlighted section is visible
                ensureSectionVisible(sectionElement);
            } else {
                // Otherwise just highlight the heading
                currentHeading.classList.add('section-highlight');

                // Add a visible marker to the heading
                const marker = document.createElement('span');
                marker.className = 'section-current-marker';
                marker.setAttribute('aria-hidden', 'true');
                marker.innerHTML = '→ ';

                // Only add if it doesn't already exist
                if (!currentHeading.querySelector('.section-current-marker')) {
                    currentHeading.insertBefore(marker, currentHeading.firstChild);
                }

                // Add active class after a small delay for animation
                setTimeout(() => {
                    currentHeading.classList.add('section-highlight-active');
                }, 50);

                // Ensure the highlighted heading is visible
                ensureSectionVisible(currentHeading);
            }
        }
    } catch (error) {
        console.error('Error highlighting section:', error);
    }
}

/**
 * Ensure the highlighted section is visible and not obscured
 */
function ensureSectionVisible(element) {
    try {
        // Check if the element is partially obscured by fixed elements
        const rect = element.getBoundingClientRect();
        const headerHeight = document.querySelector('header') ?
                            document.querySelector('header').offsetHeight : 0;

        // If the element is partially hidden by the header, scroll it into better view
        if (rect.top < headerHeight + 20) {
            // Add some extra padding to ensure it's clearly visible
            window.scrollBy({
                top: rect.top - headerHeight - 20,
                behavior: 'smooth'
            });
        }
    } catch (error) {
        console.error('Error ensuring section visibility:', error);
    }
}

/**
 * Add section navigation dots
 */
function addSectionNavigation() {
    // Get all section headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

    // Only create navigation if we have enough headings
    if (headings.length < 3) return;

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

        // Create dot
        const dot = document.createElement('div');
        dot.className = 'section-nav-dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('title', heading.textContent.trim());
        dot.setAttribute('tabindex', '0');

        // Determine heading level for styling
        const headingLevel = heading.tagName.toLowerCase().replace('h', '') || '3';
        dot.classList.add(`level-${headingLevel}`);

        // Add click event
        dotContainer.addEventListener('click', () => {
            heading.scrollIntoView({ behavior: 'smooth' });
        });

        // Add keyboard support
        dotContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'section-nav-tooltip';
        tooltip.textContent = heading.textContent.trim();
        dotContainer.appendChild(tooltip);

        // Add label
        const label = document.createElement('div');
        label.className = 'section-nav-label';
        label.textContent = heading.textContent.trim();

        // Add dot and label to container
        dotContainer.appendChild(dot);
        dotContainer.appendChild(label);

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
    toggleButton.addEventListener('click', () => {
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
    sideToggleButton.addEventListener('click', () => {
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
    const dots = document.querySelectorAll('.section-nav-dot');
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'));

    if (!dots.length || !headings.length) return;

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
        } else if (index < currentIndex) {
            item.classList.add('passed');
        }
    });

    dots.forEach((dot, index) => {
        // Clear all active states
        dot.classList.remove('active');
        dot.classList.remove('passed');

        // Set appropriate state
        if (index === currentIndex) {
            dot.classList.add('active');
        } else if (index < currentIndex) {
            dot.classList.add('passed');
        }
    });

    // Ensure active item is visible in the navigation
    const activeItem = document.querySelector('.section-nav-item.active');
    if (activeItem) {
        const dotsContainer = document.querySelector('.section-nav-dots');
        if (dotsContainer) {
            // Scroll the active item into view within the container
            dotsContainer.scrollTop = activeItem.offsetTop - dotsContainer.offsetHeight / 2 + activeItem.offsetHeight / 2;
        }
    }
}

/**
 * Add keyboard shortcuts for navigation
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
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
                headings[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            } else {
                // Go to top of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Alt+Down: Go to next section
        if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < headings.length - 1) {
                headings[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            } else {
                // Go to bottom of page
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            }
        }

        // Home: Go to top of page
        if (e.key === 'Home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // End: Go to bottom of page
        if (e.key === 'End') {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    });
}

/**
 * Add reading progress indicator to the top of the page
 */
function addReadingProgressIndicator() {
    // Check if user is authenticated
    const isAuthenticated = document.body.getAttribute('data-user-logged-in') === 'true';

    // Only add progress indicator for authenticated users
    if (!isAuthenticated) {
        console.log('Progress indicator not added: User not authenticated');
        return;
    }

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
    window.addEventListener('scroll', () => {
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
 * Add reading time estimate
 */
function addReadingTimeEstimate() {
    // Calculate total words in the content
    const contentElement = document.querySelector('main') || document.querySelector('.container') || document.body;
    const text = contentElement.innerText;
    const wordCount = text.split(/\s+/).length;

    // Calculate reading time (average reading speed: 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // Create reading time element
    const readingTimeElement = document.createElement('div');
    readingTimeElement.className = 'reading-time-estimate';
    readingTimeElement.innerHTML = `
        <i class="bi bi-clock"></i>
        <span>${readingTimeMinutes} min read</span>
    `;

    // Add to document
    document.body.appendChild(readingTimeElement);

    // Update remaining time on scroll
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollTop = document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Calculate remaining time
        const remainingTimeMinutes = Math.ceil(readingTimeMinutes * (1 - (scrollPercentage / 100)));

        // Update reading time element
        if (remainingTimeMinutes > 0) {
            readingTimeElement.innerHTML = `
                <i class="bi bi-clock"></i>
                <span>${remainingTimeMinutes} min left</span>
            `;
        } else {
            readingTimeElement.innerHTML = `
                <i class="bi bi-check-circle"></i>
                <span>Completed</span>
            `;
            readingTimeElement.classList.add('completed');
        }
    });
}

/**
 * Create basic scrollbar as fallback
 */
function createBasicScrollbar() {
    // Create scrollbar container
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.className = 'basic-scrollbar-container';

    // Create scrollbar
    const scrollbar = document.createElement('div');
    scrollbar.className = 'basic-scrollbar';

    // Append elements
    scrollbarContainer.appendChild(scrollbar);
    document.body.appendChild(scrollbarContainer);

    // Update scrollbar on scroll
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollTop = document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Update scrollbar width
        scrollbar.style.width = `${scrollPercentage}%`;
    });
}
