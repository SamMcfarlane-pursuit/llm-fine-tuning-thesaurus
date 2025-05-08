/**
 * Clean Sidebar JavaScript
 * A clean, minimal, and non-intrusive sidebar for section navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the clean sidebar
    initCleanSidebar();
});

/**
 * Initialize the clean sidebar
 */
function initCleanSidebar() {
    try {
        console.log('Initializing clean sidebar...');

        // Check if sidebar is already initialized
        if (window.cleanSidebarInitialized) {
            console.log('Clean sidebar already initialized');
            return;
        }

        // Add reading progress indicator
        addReadingProgressIndicator();

        // Add keyboard shortcuts
        addKeyboardShortcuts();

        // Get all section headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'))
            .filter(heading => {
                // Filter out headings that are hidden or in hidden containers
                const style = window.getComputedStyle(heading);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    return false;
                }

                // Check if any parent is hidden
                let parent = heading.parentElement;
                while (parent && parent !== document.body) {
                    const parentStyle = window.getComputedStyle(parent);
                    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
                        return false;
                    }
                    parent = parent.parentElement;
                }

                return true;
            });

        // Only create sidebar if we have enough headings
        if (headings.length < 2) {
            console.log('Not enough visible headings to create sidebar');
            return;
        }

        // Create sidebar container
        const sidebar = document.createElement('div');
        sidebar.className = 'clean-sidebar';
        sidebar.setAttribute('aria-label', 'Section navigation');

        // Check if there's a saved position preference
        const sidePreference = localStorage.getItem('sidebar-side') || 'right';
        if (sidePreference === 'left') {
            sidebar.classList.add('left-side');
        }

        // Create sidebar header
        const header = document.createElement('div');
        header.className = 'sidebar-header';

        const title = document.createElement('div');
        title.className = 'sidebar-title';
        title.textContent = 'Sections';

        header.appendChild(title);
        sidebar.appendChild(header);

        // Create navigation container
        const nav = document.createElement('div');
        nav.className = 'sidebar-nav';

        // Create navigation items
        headings.forEach((heading, index) => {
            // Create item container
            const item = document.createElement('div');
            item.className = 'sidebar-item';
            item.setAttribute('data-index', index);
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Go to section: ${heading.textContent.trim()}`);

            // Create dot
            const dot = document.createElement('div');
            dot.className = 'sidebar-dot';

            // Create label
            const label = document.createElement('div');
            label.className = 'sidebar-label';
            label.textContent = heading.textContent.trim();

            // Create tooltip for collapsed state
            const tooltip = document.createElement('div');
            tooltip.className = 'sidebar-tooltip';
            tooltip.textContent = heading.textContent.trim();

            // Add elements to item
            item.appendChild(dot);
            item.appendChild(label);
            item.appendChild(tooltip);

            // Add click event
            item.addEventListener('click', function() {
                // Calculate header offset to account for fixed elements
                const headerOffset = 80; // Adjust based on your fixed header height
                const elementPosition = heading.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Scroll to heading with improved smoothness
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });

            // Add keyboard support
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Calculate header offset to account for fixed elements
                    const headerOffset = 80; // Adjust based on your fixed header height
                    const elementPosition = heading.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    // Scroll to heading with improved smoothness
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });

            // Add to navigation
            nav.appendChild(item);
        });

        // Add navigation to sidebar
        sidebar.appendChild(nav);

        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'sidebar-toggle';
        toggleButton.innerHTML = sidePreference === 'left'
            ? '<i class="bi bi-chevron-right"></i>'
            : '<i class="bi bi-chevron-left"></i>';
        toggleButton.setAttribute('aria-label', 'Toggle sidebar expansion');
        toggleButton.setAttribute('title', 'Toggle sidebar');

        toggleButton.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');

            // Update button icon
            toggleButton.innerHTML = sidebar.classList.contains('expanded')
                ? (sidePreference === 'left' ? '<i class="bi bi-chevron-left"></i>' : '<i class="bi bi-chevron-right"></i>')
                : (sidePreference === 'left' ? '<i class="bi bi-chevron-right"></i>' : '<i class="bi bi-chevron-left"></i>');
        });

        sidebar.appendChild(toggleButton);

        // Add side toggle button
        const sideToggleButton = document.createElement('button');
        sideToggleButton.className = 'sidebar-side-toggle';
        sideToggleButton.innerHTML = sidePreference === 'left'
            ? '<i class="bi bi-arrow-right"></i>'
            : '<i class="bi bi-arrow-left"></i>';
        sideToggleButton.setAttribute('aria-label', 'Move sidebar to other side');
        sideToggleButton.setAttribute('title', sidePreference === 'left'
            ? 'Move to right side'
            : 'Move to left side');

        sideToggleButton.addEventListener('click', function() {
            const isLeftSide = sidebar.classList.toggle('left-side');

            // Update button icon
            sideToggleButton.innerHTML = isLeftSide
                ? '<i class="bi bi-arrow-right"></i>'
                : '<i class="bi bi-arrow-left"></i>';

            sideToggleButton.setAttribute('title', isLeftSide
                ? 'Move to right side'
                : 'Move to left side');

            // Update toggle button icon
            toggleButton.innerHTML = sidebar.classList.contains('expanded')
                ? (isLeftSide ? '<i class="bi bi-chevron-left"></i>' : '<i class="bi bi-chevron-right"></i>')
                : (isLeftSide ? '<i class="bi bi-chevron-right"></i>' : '<i class="bi bi-chevron-left"></i>');

            // Save preference
            localStorage.setItem('sidebar-side', isLeftSide ? 'left' : 'right');
        });

        sidebar.appendChild(sideToggleButton);

        // Add sidebar to document
        document.body.appendChild(sidebar);

        // Update active item on scroll
        window.addEventListener('scroll', updateActiveSidebarItem);

        // Initial update
        updateActiveSidebarItem();

        // Mark as initialized
        window.cleanSidebarInitialized = true;

        console.log('Clean sidebar initialized successfully');
    } catch (error) {
        console.error('Error initializing clean sidebar:', error);
    }
}

/**
 * Update active sidebar item based on scroll position and track user progress
 */
function updateActiveSidebarItem() {
    try {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'))
            .filter(heading => {
                // Filter out headings that are hidden or in hidden containers
                const style = window.getComputedStyle(heading);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });

        if (!sidebarItems.length || !headings.length) return;

        // Find current heading
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        const currentPosition = scrollTop + (clientHeight / 4); // Use 1/4 of the viewport height

        // Find the current heading index
        let currentIndex = -1;
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].offsetTop <= currentPosition) {
                currentIndex = i;
            } else {
                break;
            }
        }

        // Initialize or get viewed sections from sessionStorage
        if (!sessionStorage.getItem('viewedSections')) {
            sessionStorage.setItem('viewedSections', JSON.stringify([]));
        }

        let viewedSections = JSON.parse(sessionStorage.getItem('viewedSections'));

        // Add current section to viewed sections if not already there
        if (currentIndex >= 0 && !viewedSections.includes(currentIndex)) {
            viewedSections.push(currentIndex);
            sessionStorage.setItem('viewedSections', JSON.stringify(viewedSections));

            // Calculate and store progress percentage
            const progressPercentage = Math.round((viewedSections.length / headings.length) * 100);
            sessionStorage.setItem('readingProgress', progressPercentage);

            // Update document title with progress
            const originalTitle = document.title.split(' - ')[0]; // Get original title without progress
            document.title = `${originalTitle} - ${progressPercentage}% Complete`;
        }

        // Update sidebar items
        sidebarItems.forEach((item, index) => {
            // Clear all states
            item.classList.remove('active', 'passed');

            // Set appropriate state
            if (index === currentIndex) {
                item.classList.add('active');

                // Ensure active item is visible in the sidebar with smooth scrolling
                if (item.parentElement) {
                    // Calculate the position to center the item in the viewport
                    const parentRect = item.parentElement.getBoundingClientRect();
                    const itemRect = item.getBoundingClientRect();
                    const scrollTarget = item.offsetTop - item.parentElement.offsetTop - (parentRect.height / 2) + (itemRect.height / 2);

                    // Use smooth scrolling for better UX
                    item.parentElement.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth'
                    });
                }

                // Highlight current section in the document
                highlightCurrentSection(headings[currentIndex]);
            } else if (index < currentIndex || viewedSections.includes(index)) {
                item.classList.add('passed');
            }
        });

        // Update progress in the reading progress indicator if it exists
        const progressContainer = document.querySelector('.reading-progress-container');
        if (progressContainer) {
            const progressPercentage = sessionStorage.getItem('readingProgress') || '0';
            const progressText = progressContainer.querySelector('.percentage');
            if (progressText) {
                progressText.textContent = `${progressPercentage}% complete`;
            }

            // Update progress facts if they exist
            const progressFactsLeft = progressContainer.querySelector('.progress-facts-left');
            if (progressFactsLeft) {
                const sectionsProgress = `${viewedSections.length}/${headings.length} sections`;
                const sectionsElement = progressFactsLeft.querySelector('.progress-stat:nth-child(2)');
                if (sectionsElement) {
                    sectionsElement.innerHTML = `<i class="bi bi-book"></i> ${sectionsProgress}`;
                }
            }
        }
    } catch (error) {
        console.error('Error updating active sidebar item:', error);
    }
}

/**
 * Highlight the current section in the document
 * @param {HTMLElement} heading - The current heading element
 */
function highlightCurrentSection(heading) {
    try {
        // Remove previous highlights
        document.querySelectorAll('.section-highlight').forEach(el => {
            el.classList.remove('section-highlight');
        });

        // Add highlight to current section
        if (heading) {
            // Find the parent section or card
            let section = heading;

            // Try to find parent section or card
            while (section &&
                  !section.classList.contains('card') &&
                  section.tagName.toLowerCase() !== 'section' &&
                  section !== document.body) {
                section = section.parentElement;
            }

            // If we found a section or card, highlight it
            if (section && section !== document.body) {
                section.classList.add('section-highlight');
            } else {
                // Otherwise just highlight the heading
                heading.classList.add('section-highlight');
            }
        }
    } catch (error) {
        console.error('Error highlighting current section:', error);
    }
}

/**
 * Add reading progress indicator to the top of the page with user progress facts
 */
function addReadingProgressIndicator() {
    try {
        // Check if progress indicator already exists
        if (document.querySelector('.reading-progress-container')) {
            return;
        }

        // Check if user is authenticated
        const isAuthenticated = document.body.getAttribute('data-user-logged-in') === 'true';

        // Only add progress indicator for authenticated users
        if (!isAuthenticated) {
            console.log('Reading progress indicator not added: User not authenticated');
            return;
        }

        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress-container';

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';

        // Create progress markers container
        const progressMarkers = document.createElement('div');
        progressMarkers.className = 'progress-markers';

        // Create progress text
        const progressText = document.createElement('div');
        progressText.className = 'reading-progress-text';

        // Create progress facts container
        const progressFacts = document.createElement('div');
        progressFacts.className = 'progress-facts';

        // Create left and right sections for progress facts
        const progressFactsLeft = document.createElement('div');
        progressFactsLeft.className = 'progress-facts-left';

        const progressFactsRight = document.createElement('div');
        progressFactsRight.className = 'progress-facts-right';

        progressFacts.appendChild(progressFactsLeft);
        progressFacts.appendChild(progressFactsRight);

        // Create minimize button
        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'minimize-progress';
        minimizeButton.innerHTML = '<i class="bi bi-chevron-up"></i>';
        minimizeButton.setAttribute('aria-label', 'Minimize progress bar');
        minimizeButton.setAttribute('title', 'Minimize');

        minimizeButton.addEventListener('click', function() {
            progressContainer.classList.toggle('compact');
            this.innerHTML = progressContainer.classList.contains('compact')
                ? '<i class="bi bi-chevron-down"></i>'
                : '<i class="bi bi-chevron-up"></i>';
            this.setAttribute('title', progressContainer.classList.contains('compact') ? 'Expand' : 'Minimize');
        });

        // Append elements
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressMarkers);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressFacts);
        progressText.appendChild(minimizeButton);
        document.body.appendChild(progressContainer);

        // Get user data if available
        const isLoggedIn = document.body.getAttribute('data-user-logged-in') === 'true';
        const topicId = document.body.getAttribute('data-topic-id');
        const moduleId = document.body.getAttribute('data-module-id');

        // Get all headings to determine sections
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'))
            .filter(heading => {
                const style = window.getComputedStyle(heading);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });

        // Create markers for each major section
        if (headings.length > 0) {
            headings.forEach((heading, index) => {
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                const headingPosition = heading.offsetTop;
                const markerPosition = (headingPosition / (scrollHeight - clientHeight)) * 100;

                if (markerPosition <= 100) { // Only add markers that fit within the document
                    const marker = document.createElement('div');
                    marker.className = 'progress-marker';
                    marker.style.left = `${markerPosition}%`;
                    marker.setAttribute('data-section', heading.textContent.trim());
                    marker.setAttribute('data-index', index);

                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'progress-tooltip';
                    tooltip.textContent = heading.textContent.trim();
                    marker.appendChild(tooltip);

                    progressMarkers.appendChild(marker);
                }
            });
        }

        // Track user activity for more accurate progress
        let userActivity = {
            lastScrollTime: Date.now(),
            totalTimeSpent: 0,
            scrollCount: 0,
            sectionsViewed: new Set()
        };

        // Update progress on scroll
        const updateProgress = function() {
            // Update user activity
            const now = Date.now();
            userActivity.totalTimeSpent += (now - userActivity.lastScrollTime);
            userActivity.lastScrollTime = now;
            userActivity.scrollCount++;

            // Calculate scroll percentage
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

            // Update progress bar width
            progressBar.style.width = `${scrollPercentage}%`;

            // Find current heading
            const currentPosition = scrollTop + (clientHeight / 4);
            let currentHeading = null;
            let currentHeadingIndex = -1;

            for (let i = 0; i < headings.length; i++) {
                if (headings[i].offsetTop <= currentPosition) {
                    currentHeading = headings[i];
                    currentHeadingIndex = i;
                } else {
                    break;
                }
            }

            // Track sections viewed
            if (currentHeading) {
                userActivity.sectionsViewed.add(currentHeadingIndex);
            }

            // Update progress markers
            const markers = document.querySelectorAll('.progress-marker');
            markers.forEach(marker => {
                const markerIndex = parseInt(marker.getAttribute('data-index'));

                // Clear all states
                marker.classList.remove('active', 'passed');

                // Set appropriate state
                if (markerIndex === currentHeadingIndex) {
                    marker.classList.add('active');
                } else if (markerIndex < currentHeadingIndex) {
                    marker.classList.add('passed');
                }
            });

            // Update progress text with current section and percentage
            if (currentHeading) {
                const sectionTitle = currentHeading.textContent.trim();
                progressText.innerHTML = `<span class="current-section"><i class="bi bi-bookmark-fill"></i> ${sectionTitle}</span> <span class="percentage">${Math.round(scrollPercentage)}% complete</span>`;
            } else {
                progressText.innerHTML = `<span class="percentage">${Math.round(scrollPercentage)}% complete</span>`;
            }

            // Add minimize button back after updating HTML
            progressText.appendChild(minimizeButton);

            // Update progress facts for logged in users
            if (isLoggedIn) {
                // Calculate estimated time to complete
                const wordsPerMinute = 200; // Average reading speed
                const contentElements = document.querySelectorAll('p, li, .card-text');
                let totalWords = 0;

                contentElements.forEach(element => {
                    totalWords += element.textContent.trim().split(/\s+/).length;
                });

                const totalMinutes = Math.ceil(totalWords / wordsPerMinute);
                const remainingMinutes = Math.ceil((totalWords * (100 - scrollPercentage) / 100) / wordsPerMinute);
                const minutesSpent = Math.ceil(userActivity.totalTimeSpent / 60000); // Convert ms to minutes

                // Calculate sections progress
                const sectionsProgress = Math.round((userActivity.sectionsViewed.size / headings.length) * 100);

                // Left side facts
                progressFactsLeft.innerHTML = `
                    <div class="progress-stat">
                        <i class="bi bi-clock"></i> ${remainingMinutes} min remaining
                    </div>
                    <div class="progress-stat">
                        <i class="bi bi-book"></i> ${userActivity.sectionsViewed.size}/${headings.length} sections
                    </div>
                `;

                // Right side facts with different messages based on progress
                let statusMessage = '';
                if (scrollPercentage < 25) {
                    statusMessage = `<i class="bi bi-arrow-right-circle"></i> Just getting started`;
                } else if (scrollPercentage < 50) {
                    statusMessage = `<i class="bi bi-lightning"></i> Good progress!`;
                } else if (scrollPercentage < 75) {
                    statusMessage = `<i class="bi bi-award"></i> Almost there!`;
                } else {
                    statusMessage = `<i class="bi bi-check-circle"></i> Nearly complete!`;
                }

                // Add user badge based on activity
                let userBadge = '';
                if (userActivity.scrollCount > 20) {
                    userBadge = `<span class="user-progress-badge"><i class="bi bi-lightning"></i>Active Reader</span>`;
                }

                progressFactsRight.innerHTML = `
                    <div class="progress-stat">
                        ${statusMessage} ${userBadge}
                    </div>
                `;

                // Show progress facts
                progressFacts.style.display = 'flex';
            } else {
                progressFacts.style.display = 'none';
            }

            // Add class when near completion
            if (scrollPercentage > 90) {
                progressContainer.classList.add('near-complete');
            } else {
                progressContainer.classList.remove('near-complete');
            }

            // Auto-collapse on scroll down
            if (scrollTop > 200 && !progressContainer.classList.contains('compact')) {
                progressContainer.classList.add('compact');
                minimizeButton.innerHTML = '<i class="bi bi-chevron-down"></i>';
                minimizeButton.setAttribute('title', 'Expand');
            }
        };

        // Throttle scroll event for better performance
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(function() {
                    updateProgress();
                    scrollTimeout = null;
                }, 100);
            }
        });

        window.addEventListener('resize', updateProgress);

        // Initial update
        updateProgress();

        console.log('Enhanced reading progress indicator added with user tracking');
    } catch (error) {
        console.error('Error adding reading progress indicator:', error);
    }
}

/**
 * Add keyboard shortcuts for navigation
 */
function addKeyboardShortcuts() {
    try {
        // Check if keyboard shortcuts are already added
        if (window.keyboardShortcutsAdded) {
            return;
        }

        document.addEventListener('keydown', function(e) {
            // Get all headings
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .card-header'))
                .filter(heading => {
                    // Filter out headings that are hidden or in hidden containers
                    const style = window.getComputedStyle(heading);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });

            // Find current heading
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            const currentPosition = scrollTop + (clientHeight / 4);

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
                    const heading = headings[currentIndex - 1];
                    const headerOffset = 80;
                    const elementPosition = heading.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
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
                    const heading = headings[currentIndex + 1];
                    const headerOffset = 80;
                    const elementPosition = heading.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Go to bottom of page
                    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
                }
            }
        });

        // Mark as added
        window.keyboardShortcutsAdded = true;

        console.log('Keyboard shortcuts added');
    } catch (error) {
        console.error('Error adding keyboard shortcuts:', error);
    }
}
