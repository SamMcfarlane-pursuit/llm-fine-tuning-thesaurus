/**
 * Enhanced Navigation JavaScript
 * Provides robust scrolling features, section information, and mobile optimizations
 */

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing enhanced navigation features...');

        // Fix for iOS 100vh issue
        setMobileViewportHeight();

        // Handle mobile viewport height on resize and orientation change
        window.addEventListener('resize', setMobileViewportHeight);
        window.addEventListener('orientationchange', setMobileViewportHeight);

        // Create scroll indicator (always create this for all pages)
        createScrollIndicator();

        // Get page sections before creating other elements
        const pageSections = getPageSections();
        console.log(`Found ${pageSections.length} sections on the page`);

        // Only create section indicator and nav dots if we have sections
        if (pageSections.length > 0) {
            // Create section indicator
            createSectionIndicator();

            // Create scroll navigation dots (only if we have enough sections)
            if (pageSections.length >= 3) {
                createScrollNavDots(pageSections);
            }
        }

        // Initialize scroll event listeners (always do this)
        initScrollListeners();

        // Add mobile-specific navigation enhancements
        enhanceMobileNavigation();

        console.log('Enhanced navigation features initialized successfully');
    } catch (error) {
        // Log error but don't break the page
        console.error('Error initializing enhanced navigation:', error);

        // Ensure at least the basic scroll indicator works
        try {
            createBasicScrollIndicator();
        } catch (fallbackError) {
            console.error('Failed to create fallback scroll indicator:', fallbackError);
        }
    }
});

/**
 * Fix for iOS 100vh issue
 */
function setMobileViewportHeight() {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Enhance mobile navigation experience
 */
function enhanceMobileNavigation() {
    // Close navbar collapse when clicking outside
    document.addEventListener('click', function(event) {
        const navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse) {
            // Check if click is outside navbar
            if (!navbarCollapse.contains(event.target) &&
                !event.target.classList.contains('navbar-toggler') &&
                !event.target.closest('.navbar-toggler')) {
                // Find the toggler button and click it to close the menu
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) toggler.click();
            }
        }
    });

    // Close navbar collapse when a nav item is clicked
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse.show');
            if (navbarCollapse) {
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) toggler.click();
            }
        });
    });

    // Add active state for touch feedback
    const touchElements = document.querySelectorAll('.nav-link, .dropdown-item');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });

        element.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

/**
 * Create scroll indicator at the top of the page
 */
function createScrollIndicator() {
    // Check if user is authenticated
    const isAuthenticated = document.body.getAttribute('data-user-logged-in') === 'true';

    // Only add scroll indicator for authenticated users
    if (!isAuthenticated) {
        console.log('Scroll indicator not created: User not authenticated');
        return;
    }

    const scrollIndicatorContainer = document.createElement('div');
    scrollIndicatorContainer.className = 'scroll-indicator-container';

    const scrollIndicatorBar = document.createElement('div');
    scrollIndicatorBar.className = 'scroll-indicator-bar';

    scrollIndicatorContainer.appendChild(scrollIndicatorBar);
    document.body.appendChild(scrollIndicatorContainer);

    // Add section markers after a short delay to ensure sections are loaded
    setTimeout(() => {
        addSectionMarkersToScrollIndicator(scrollIndicatorContainer);
    }, 500);
}

/**
 * Add section markers to the scroll indicator
 */
function addSectionMarkersToScrollIndicator(container) {
    const sections = getPageSections();
    if (sections.length <= 1) return;

    // Calculate positions for markers
    const totalWidth = window.innerWidth;

    sections.forEach((section, index) => {
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'scroll-indicator-section-marker';
        marker.setAttribute('data-section-index', index);

        // Calculate position (evenly distributed)
        const position = (index / (sections.length - 1)) * totalWidth;
        marker.style.left = position + 'px';

        // Add tooltip with section title
        const sectionTitle = getSectionTitle(section);
        marker.setAttribute('title', sectionTitle);
        marker.setAttribute('data-bs-toggle', 'tooltip');
        marker.setAttribute('data-bs-placement', 'bottom');

        // Add click event to navigate to section
        marker.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });

        // Add to container
        container.appendChild(marker);
    });

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Update active marker on scroll
    window.addEventListener('scroll', () => {
        updateActiveScrollMarker(sections);
    });
}

/**
 * Update active scroll marker
 */
function updateActiveScrollMarker(sections) {
    if (sections.length <= 1) return;

    const currentSectionIndex = getCurrentSectionIndex(sections);
    const markers = document.querySelectorAll('.scroll-indicator-section-marker');

    markers.forEach((marker) => {
        const markerIndex = parseInt(marker.getAttribute('data-section-index'));
        if (markerIndex === currentSectionIndex) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

/**
 * Create section indicator that shows current section information
 */
function createSectionIndicator() {
    const sectionIndicator = document.createElement('div');
    sectionIndicator.className = 'section-indicator';
    sectionIndicator.setAttribute('role', 'status');
    sectionIndicator.setAttribute('aria-live', 'polite');
    sectionIndicator.innerHTML = `
        <div class="section-indicator-title">
            <i class="bi bi-geo-alt-fill"></i>
            <span>Current Section</span>
        </div>
        <p class="section-indicator-content">Scrolling to view content...</p>
        <div class="section-indicator-stats">
            <span class="section-position">Position: 0/0</span>
            <span class="section-progress">0%</span>
        </div>
        <div class="section-indicator-progress">
            <div class="section-indicator-progress-bar"></div>
        </div>
        <div class="section-indicator-nav">
            <button class="section-nav-button prev-section" disabled>
                <i class="bi bi-arrow-left"></i> Previous
            </button>
            <button class="section-nav-button next-section" disabled>
                Next <i class="bi bi-arrow-right"></i>
            </button>
        </div>
    `;

    document.body.appendChild(sectionIndicator);

    // Add event listeners to navigation buttons
    const prevButton = sectionIndicator.querySelector('.prev-section');
    const nextButton = sectionIndicator.querySelector('.next-section');

    prevButton.addEventListener('click', navigateToPreviousSection);
    nextButton.addEventListener('click', navigateToNextSection);
}

/**
 * Create scroll navigation dots for quick navigation
 * @param {Array} sections - Array of section elements
 */
function createScrollNavDots(sections) {
    // Use provided sections or get them if not provided
    const pageSections = sections || getPageSections();

    if (pageSections.length === 0) return;

    // Create container
    const scrollNavDots = document.createElement('div');
    scrollNavDots.className = 'scroll-nav-dots';
    scrollNavDots.setAttribute('role', 'navigation');
    scrollNavDots.setAttribute('aria-label', 'Page sections');

    // Add dots for each section (limit to max 8 dots to prevent clutter)
    const maxDots = Math.min(pageSections.length, 8);
    const step = pageSections.length > maxDots ? Math.floor(pageSections.length / maxDots) : 1;

    for (let i = 0; i < pageSections.length; i += step) {
        if (scrollNavDots.children.length >= maxDots) break;

        const section = pageSections[i];
        const dot = document.createElement('div');
        dot.className = 'scroll-nav-dot';
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');

        if (i === 0) dot.classList.add('active');

        // Get section title
        const sectionTitle = getSectionTitle(section);
        dot.setAttribute('aria-label', `Jump to section: ${sectionTitle}`);

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-nav-tooltip';
        tooltip.textContent = sectionTitle;
        dot.appendChild(tooltip);

        // Add click event
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });

        // Add keyboard support
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Add to container
        scrollNavDots.appendChild(dot);
    }

    // Add to document
    document.body.appendChild(scrollNavDots);
}

/**
 * Initialize scroll event listeners
 */
function initScrollListeners() {
    // Get elements
    const scrollIndicatorBar = document.querySelector('.scroll-indicator-bar');
    const sectionIndicator = document.querySelector('.section-indicator');
    const scrollNavDots = document.querySelectorAll('.scroll-nav-dot');
    const sections = getPageSections();

    // Always update the scroll indicator on all pages
    window.addEventListener('scroll', () => {
        updateScrollIndicator(scrollIndicatorBar);
    });

    // Only update section-specific elements if they exist and we have sections
    if (sections.length > 0) {
        // Throttle scroll events for better performance
        let lastScrollTime = 0;
        const scrollThreshold = 50; // ms between scroll updates

        window.addEventListener('scroll', () => {
            const now = Date.now();

            // Throttle updates for better performance
            if (now - lastScrollTime > scrollThreshold) {
                lastScrollTime = now;

                // Update section indicator if it exists
                if (sectionIndicator) {
                    updateSectionIndicator(sectionIndicator, sections);
                }

                // Update active dot if we have dots
                if (scrollNavDots.length > 0) {
                    updateActiveScrollDot(scrollNavDots, sections);
                }
            }
        });

        // Show section indicator on scroll with debouncing
        if (sectionIndicator) {
            let scrollTimer;
            let isIndicatorVisible = false;

            window.addEventListener('scroll', () => {
                // Only trigger show/hide logic if state would change
                if (!isIndicatorVisible) {
                    sectionIndicator.classList.add('show');
                    isIndicatorVisible = true;
                }

                // Reset timer on each scroll event
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    sectionIndicator.classList.remove('show');
                    isIndicatorVisible = false;
                }, 2000);
            });

            // Also show indicator on mouse movement near the top
            document.addEventListener('mousemove', (e) => {
                // Show indicator if mouse is near the top of the screen
                if (e.clientY < 100 && !isIndicatorVisible) {
                    sectionIndicator.classList.add('show');
                    isIndicatorVisible = true;

                    // Hide after delay
                    clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => {
                        sectionIndicator.classList.remove('show');
                        isIndicatorVisible = false;
                    }, 2000);
                }
            });
        }
    }

    // Add keyboard shortcuts for navigation
    document.addEventListener('keydown', (e) => {
        // Alt+Up: Go to previous section
        if (e.altKey && e.key === 'ArrowUp' && sections.length > 0) {
            e.preventDefault();
            const currentIndex = getCurrentSectionIndex(sections);
            if (currentIndex > 0) {
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Alt+Down: Go to next section
        if (e.altKey && e.key === 'ArrowDown' && sections.length > 0) {
            e.preventDefault();
            const currentIndex = getCurrentSectionIndex(sections);
            if (currentIndex < sections.length - 1) {
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

/**
 * Update scroll indicator width based on scroll position
 */
function updateScrollIndicator(scrollIndicatorBar) {
    if (!scrollIndicatorBar) return;

    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;

    scrollIndicatorBar.style.width = scrolled + '%';
}

/**
 * Update section indicator content based on current section
 */
function updateSectionIndicator(sectionIndicator, sections) {
    if (!sectionIndicator || sections.length === 0) return;

    const currentSection = getCurrentSection(sections);
    if (currentSection) {
        // Update section title
        const sectionTitle = getSectionTitle(currentSection);
        const sectionContent = sectionIndicator.querySelector('.section-indicator-content');

        if (sectionContent) {
            sectionContent.textContent = sectionTitle;
        }

        // Update progress bar
        const currentSectionIndex = getCurrentSectionIndex(sections);
        const progressPercentage = ((currentSectionIndex + 1) / sections.length) * 100;
        const progressBar = sectionIndicator.querySelector('.section-indicator-progress-bar');

        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;

            // Add description for screen readers
            sectionIndicator.setAttribute('aria-label',
                `Current section: ${sectionTitle}. Progress: ${Math.round(progressPercentage)}% of page`);
        }

        // Update position and progress stats
        const sectionPosition = sectionIndicator.querySelector('.section-position');
        const sectionProgress = sectionIndicator.querySelector('.section-progress');

        if (sectionPosition) {
            sectionPosition.textContent = `Position: ${currentSectionIndex + 1}/${sections.length}`;
        }

        if (sectionProgress) {
            sectionProgress.textContent = `${Math.round(progressPercentage)}%`;
        }

        // Update navigation buttons
        const prevButton = sectionIndicator.querySelector('.prev-section');
        const nextButton = sectionIndicator.querySelector('.next-section');

        if (prevButton) {
            prevButton.disabled = currentSectionIndex === 0;
        }

        if (nextButton) {
            nextButton.disabled = currentSectionIndex === sections.length - 1;
        }

        // Add additional information about the section if available
        const sectionDescription = getSectionDescription(currentSection);
        if (sectionDescription && !sectionIndicator.querySelector('.section-indicator-description')) {
            const descriptionElement = document.createElement('p');
            descriptionElement.className = 'section-indicator-description';
            descriptionElement.textContent = sectionDescription;

            // Insert before progress stats
            const statsElement = sectionIndicator.querySelector('.section-indicator-stats');
            if (statsElement) {
                sectionIndicator.insertBefore(descriptionElement, statsElement);
            }
        }
    }
}

/**
 * Update active scroll navigation dot
 */
function updateActiveScrollDot(scrollNavDots, sections) {
    if (scrollNavDots.length === 0 || sections.length === 0) return;

    const currentSectionIndex = getCurrentSectionIndex(sections);

    scrollNavDots.forEach((dot, index) => {
        if (index === currentSectionIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/**
 * Get all main sections on the page
 */
function getPageSections() {
    // Try to get sections with IDs first
    let sections = Array.from(document.querySelectorAll('section[id], div[id].section, div[id].container'));

    // If no sections with IDs, try to get main content sections
    if (sections.length === 0) {
        sections = Array.from(document.querySelectorAll('main > div, main > section, .container > div.row > div'));
    }

    // If still no sections, try to get headings
    if (sections.length === 0) {
        const headings = Array.from(document.querySelectorAll('h1, h2'));
        sections = headings.map(heading => {
            // Get the parent section or div
            let section = heading.closest('section, div.section, div.container');
            if (!section) {
                // If no parent section, use the heading itself
                section = heading;
            }
            return section;
        });
    }

    // Filter out duplicates
    return [...new Set(sections)];
}

/**
 * Get the current section based on scroll position
 */
function getCurrentSection(sections) {
    if (sections.length === 0) return null;

    const scrollPosition = window.scrollY + window.innerHeight / 3;

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            return section;
        }
    }

    // If no section is found, return the last one
    return sections[sections.length - 1];
}

/**
 * Get the index of the current section
 */
function getCurrentSectionIndex(sections) {
    const currentSection = getCurrentSection(sections);
    return sections.indexOf(currentSection);
}

/**
 * Get the title of a section
 */
function getSectionTitle(section) {
    if (!section) return 'Unknown Section';

    // Try to get title from heading
    const heading = section.querySelector('h1, h2, h3');
    if (heading) {
        return heading.textContent.trim();
    }

    // Try to get title from ID
    if (section.id) {
        return section.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Try to get title from class
    if (section.classList.length > 0) {
        const className = Array.from(section.classList)
            .find(cls => cls !== 'section' && cls !== 'container' && cls !== 'row' && cls !== 'col');

        if (className) {
            return className.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    // If no title is found, return generic title
    return 'Section ' + (getCurrentSectionIndex(getPageSections()) + 1);
}

/**
 * Get a description of the section content
 */
function getSectionDescription(section) {
    if (!section) return null;

    // Try to get description from paragraph
    const paragraphs = section.querySelectorAll('p');
    if (paragraphs.length > 0) {
        // Get the first paragraph that's not empty and has a reasonable length
        for (let i = 0; i < paragraphs.length; i++) {
            const text = paragraphs[i].textContent.trim();
            if (text.length > 20 && text.length < 150) {
                return text;
            }
        }

        // If no suitable paragraph found, use the first one but truncate it
        if (paragraphs[0]) {
            const text = paragraphs[0].textContent.trim();
            if (text.length > 0) {
                return text.length > 120 ? text.substring(0, 120) + '...' : text;
            }
        }
    }

    // Try to get description from data attribute
    if (section.dataset.description) {
        return section.dataset.description;
    }

    // Try to get description from meta tags if it's a main section
    if (section.tagName === 'MAIN' || section.id === 'main-content') {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            return metaDescription.getAttribute('content');
        }
    }

    // Check for specific content types
    if (section.querySelector('.card')) {
        return 'Card-based content section with important information';
    } else if (section.querySelector('table')) {
        return 'Table with structured data';
    } else if (section.querySelector('form')) {
        return 'Interactive form section';
    } else if (section.querySelector('code, pre')) {
        return 'Code example or technical information';
    } else if (section.querySelector('ul, ol')) {
        return 'List of important points or steps';
    } else if (section.querySelector('img, svg, canvas')) {
        return 'Visual content or diagram';
    }

    // Return null if no description found
    return null;
}

/**
 * Create a basic scroll indicator as a fallback
 * This is a simplified version that will work even if other components fail
 */
function createBasicScrollIndicator() {
    // Check if scroll indicator already exists
    if (document.querySelector('.scroll-indicator-container')) return;

    // Create container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '6px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.zIndex = '2000';
    container.style.pointerEvents = 'none';

    // Create bar
    const bar = document.createElement('div');
    bar.style.height = '100%';
    bar.style.width = '0';
    bar.style.backgroundColor = '#4361ee';
    bar.style.transition = 'width 0.2s ease';

    // Add to DOM
    container.appendChild(bar);
    document.body.appendChild(container);

    // Add scroll listener
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        bar.style.width = scrolled + '%';
    });
}

/**
 * Navigate to the previous section
 */
function navigateToPreviousSection() {
    const sections = getPageSections();
    if (sections.length === 0) return;

    const currentIndex = getCurrentSectionIndex(sections);
    if (currentIndex > 0) {
        sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Navigate to the next section
 */
function navigateToNextSection() {
    const sections = getPageSections();
    if (sections.length === 0) return;

    const currentIndex = getCurrentSectionIndex(sections);
    if (currentIndex < sections.length - 1) {
        sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
    }
}
