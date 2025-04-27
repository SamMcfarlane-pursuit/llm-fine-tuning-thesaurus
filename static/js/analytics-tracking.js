/**
 * Analytics Tracking JavaScript
 * Tracks user interactions and sends them to the server
 */

// Initialize tracking when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracking
    initTracking();
});

/**
 * Initialize analytics tracking
 */
function initTracking() {
    // Track clicks on important elements
    trackClicks();
    
    // Track form submissions
    trackForms();
    
    // Track search interactions
    trackSearch();
    
    // Track content engagement
    trackContentEngagement();
    
    // Track tutorial progress
    trackTutorialProgress();
    
    // Track quiz interactions
    trackQuizInteractions();
    
    // Track exercise interactions
    trackExerciseInteractions();
}

/**
 * Track clicks on important elements
 */
function trackClicks() {
    // Track navigation clicks
    document.querySelectorAll('nav a, .nav-link, .navbar-brand').forEach(link => {
        link.addEventListener('click', function(event) {
            trackEvent('navigation_click', {
                link_text: this.textContent.trim(),
                link_url: this.href,
                link_id: this.id || null,
                link_class: this.className || null
            });
        });
    });
    
    // Track button clicks
    document.querySelectorAll('button, .btn').forEach(button => {
        button.addEventListener('click', function(event) {
            // Skip form submit buttons (tracked separately)
            if (this.type !== 'submit') {
                trackEvent('button_click', {
                    button_text: this.textContent.trim(),
                    button_id: this.id || null,
                    button_class: this.className || null
                });
            }
        });
    });
    
    // Track card clicks
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(event) {
            // Only track if the card itself was clicked (not a child element)
            if (event.target === this || event.target.classList.contains('card-body') || 
                event.target.classList.contains('card-title') || event.target.classList.contains('card-text')) {
                
                const cardTitle = this.querySelector('.card-title');
                trackEvent('card_click', {
                    card_title: cardTitle ? cardTitle.textContent.trim() : null,
                    card_id: this.id || null,
                    card_class: this.className || null
                });
            }
        });
    });
    
    // Track tab clicks
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            trackEvent('tab_click', {
                tab_text: this.textContent.trim(),
                tab_id: this.id || null,
                tab_target: this.getAttribute('data-bs-target') || null
            });
        });
    });
}

/**
 * Track form submissions
 */
function trackForms() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(event) {
            // Get form data (excluding sensitive fields)
            const formData = {};
            const excludedFields = ['password', 'token', 'csrf', 'credit_card', 'card_number'];
            
            // Get form fields
            const formElements = Array.from(this.elements);
            formElements.forEach(element => {
                // Skip excluded fields and buttons
                if (element.name && 
                    !excludedFields.some(field => element.name.toLowerCase().includes(field)) && 
                    element.type !== 'submit' && 
                    element.type !== 'button') {
                    
                    // For checkboxes and radio buttons, only include if checked
                    if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
                        return;
                    }
                    
                    // For select elements with multiple selection
                    if (element.type === 'select-multiple') {
                        formData[element.name] = Array.from(element.selectedOptions).map(option => option.value);
                    } else {
                        formData[element.name] = element.value;
                    }
                }
            });
            
            trackEvent('form_submit', {
                form_id: this.id || null,
                form_action: this.action || null,
                form_method: this.method || null,
                form_data: formData
            });
        });
    });
}

/**
 * Track search interactions
 */
function trackSearch() {
    // Track search form submissions
    document.querySelectorAll('form[role="search"], .search-form, #search-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            // Find search input
            const searchInput = this.querySelector('input[type="search"], input[name="q"], input[name="query"], input[name="search"]');
            if (searchInput) {
                trackEvent('search', {
                    term: searchInput.value,
                    form_id: this.id || null
                });
            }
        });
    });
    
    // Track search result clicks
    document.querySelectorAll('.search-results a, .search-result').forEach(result => {
        result.addEventListener('click', function(event) {
            trackEvent('search_result_click', {
                result_text: this.textContent.trim(),
                result_url: this.href || null,
                result_position: getElementPosition(this)
            });
        });
    });
}

/**
 * Track content engagement
 */
function trackContentEngagement() {
    // Track scroll depth
    let maxScrollDepth = 0;
    let contentStartTime = Date.now();
    let lastScrollTime = contentStartTime;
    
    window.addEventListener('scroll', function() {
        // Calculate scroll depth as percentage
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
        
        // Update max scroll depth
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            lastScrollTime = Date.now();
        }
    });
    
    // Track time spent on page when user leaves
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - contentStartTime) / 1000); // in seconds
        const activeTime = Math.round((lastScrollTime - contentStartTime) / 1000); // in seconds
        
        trackEvent('content_engagement', {
            max_scroll_depth: maxScrollDepth,
            time_spent: timeSpent,
            active_time: activeTime,
            path: window.location.pathname
        });
    });
    
    // Track copy events
    document.addEventListener('copy', function(event) {
        // Get selected text
        const selection = window.getSelection();
        const selectedText = selection.toString().substring(0, 100); // Limit to 100 chars
        
        if (selectedText) {
            trackEvent('content_copy', {
                text: selectedText,
                path: window.location.pathname
            });
        }
    });
}

/**
 * Track tutorial progress
 */
function trackTutorialProgress() {
    // Track tutorial start
    const tutorialStartButtons = document.querySelectorAll('.tutorial-start-btn, .start-tutorial');
    tutorialStartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const tutorialId = this.dataset.tutorialId || getTutorialIdFromPath();
            if (tutorialId) {
                trackEvent('tutorial_start', {
                    tutorial_id: tutorialId,
                    tutorial_title: getTutorialTitle()
                });
            }
        });
    });
    
    // Track tutorial complete
    const tutorialCompleteButtons = document.querySelectorAll('.tutorial-complete-btn, .complete-tutorial');
    tutorialCompleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const tutorialId = this.dataset.tutorialId || getTutorialIdFromPath();
            if (tutorialId) {
                trackEvent('tutorial_complete', {
                    tutorial_id: tutorialId,
                    tutorial_title: getTutorialTitle(),
                    time_spent: getTutorialTimeSpent()
                });
            }
        });
    });
    
    // Track tutorial progress
    const tutorialProgressElements = document.querySelectorAll('.tutorial-progress');
    tutorialProgressElements.forEach(element => {
        // Create a new Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressStep = entry.target.dataset.step;
                    const tutorialId = getTutorialIdFromPath();
                    
                    if (tutorialId && progressStep) {
                        trackEvent('tutorial_progress', {
                            tutorial_id: tutorialId,
                            step: progressStep,
                            progress_percent: element.dataset.progress || null
                        });
                    }
                    
                    // Unobserve after tracking
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        // Start observing
        observer.observe(element);
    });
}

/**
 * Track quiz interactions
 */
function trackQuizInteractions() {
    // Track quiz start
    const quizStartButtons = document.querySelectorAll('.quiz-start-btn, .start-quiz');
    quizStartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const quizId = this.dataset.quizId || getQuizIdFromPath();
            if (quizId) {
                trackEvent('quiz_start', {
                    quiz_id: quizId,
                    quiz_title: getQuizTitle()
                });
            }
        });
    });
    
    // Track quiz complete
    const quizForms = document.querySelectorAll('form.quiz-form');
    quizForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const quizId = this.dataset.quizId || getQuizIdFromPath();
            if (quizId) {
                // Count number of answered questions
                const totalQuestions = form.querySelectorAll('.quiz-question').length;
                let answeredQuestions = 0;
                
                // Check different question types
                const radioInputs = form.querySelectorAll('input[type="radio"]:checked');
                const checkboxInputs = form.querySelectorAll('input[type="checkbox"]:checked');
                const textInputs = form.querySelectorAll('textarea, input[type="text"]');
                
                answeredQuestions += radioInputs.length;
                
                // Group checkboxes by name (each group is one question)
                const checkboxGroups = new Set();
                checkboxInputs.forEach(input => checkboxGroups.add(input.name));
                answeredQuestions += checkboxGroups.size;
                
                // Count text inputs with content
                textInputs.forEach(input => {
                    if (input.value.trim()) {
                        answeredQuestions++;
                    }
                });
                
                trackEvent('quiz_complete', {
                    quiz_id: quizId,
                    quiz_title: getQuizTitle(),
                    total_questions: totalQuestions,
                    answered_questions: answeredQuestions,
                    completion_percent: Math.round((answeredQuestions / totalQuestions) * 100)
                });
            }
        });
    });
    
    // Track individual question answers
    document.querySelectorAll('.quiz-question').forEach(question => {
        // For radio buttons and checkboxes
        question.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', function(event) {
                const questionId = question.dataset.questionId || question.id;
                const quizId = getQuizIdFromPath();
                
                if (questionId && quizId) {
                    trackEvent('quiz_answer', {
                        quiz_id: quizId,
                        question_id: questionId,
                        answer_type: this.type,
                        answer_value: this.value
                    });
                }
            });
        });
        
        // For text inputs
        question.querySelectorAll('textarea, input[type="text"]').forEach(input => {
            input.addEventListener('blur', function(event) {
                if (this.value.trim()) {
                    const questionId = question.dataset.questionId || question.id;
                    const quizId = getQuizIdFromPath();
                    
                    if (questionId && quizId) {
                        trackEvent('quiz_answer', {
                            quiz_id: quizId,
                            question_id: questionId,
                            answer_type: 'text',
                            answer_length: this.value.length
                        });
                    }
                }
            });
        });
    });
}

/**
 * Track exercise interactions
 */
function trackExerciseInteractions() {
    // Track exercise start
    const exerciseStartButtons = document.querySelectorAll('.exercise-start-btn, .start-exercise');
    exerciseStartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const exerciseId = this.dataset.exerciseId || getExerciseIdFromPath();
            if (exerciseId) {
                trackEvent('exercise_start', {
                    exercise_id: exerciseId,
                    exercise_title: getExerciseTitle()
                });
            }
        });
    });
    
    // Track exercise complete
    const exerciseCompleteButtons = document.querySelectorAll('.exercise-complete-btn, .complete-exercise');
    exerciseCompleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const exerciseId = this.dataset.exerciseId || getExerciseIdFromPath();
            if (exerciseId) {
                trackEvent('exercise_complete', {
                    exercise_id: exerciseId,
                    exercise_title: getExerciseTitle(),
                    time_spent: getExerciseTimeSpent()
                });
            }
        });
    });
    
    // Track code execution
    const codeRunButtons = document.querySelectorAll('.run-code-btn, .execute-code');
    codeRunButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const exerciseId = this.dataset.exerciseId || getExerciseIdFromPath();
            const codeBlock = this.closest('.code-block');
            
            if (exerciseId) {
                trackEvent('code_execution', {
                    exercise_id: exerciseId,
                    code_block_id: codeBlock ? codeBlock.id : null,
                    code_language: codeBlock ? codeBlock.dataset.language : null
                });
            }
        });
    });
}

/**
 * Track an event
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Data for the event
 */
function trackEvent(eventType, eventData) {
    // Add timestamp
    eventData.timestamp = new Date().toISOString();
    
    // Add page info
    eventData.page_url = window.location.href;
    eventData.page_title = document.title;
    
    // Send event to server
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            event_type: eventType,
            event_data: eventData
        })
    }).catch(error => {
        console.error('Error tracking event:', error);
    });
}

/**
 * Get tutorial ID from URL path
 * @returns {string|null} Tutorial ID
 */
function getTutorialIdFromPath() {
    const path = window.location.pathname;
    const tutorialMatch = path.match(/\/tutorials?\/([^\/]+)/);
    return tutorialMatch ? tutorialMatch[1] : null;
}

/**
 * Get quiz ID from URL path
 * @returns {string|null} Quiz ID
 */
function getQuizIdFromPath() {
    const path = window.location.pathname;
    const quizMatch = path.match(/\/quizzes?\/([^\/]+)/);
    return quizMatch ? quizMatch[1] : null;
}

/**
 * Get exercise ID from URL path
 * @returns {string|null} Exercise ID
 */
function getExerciseIdFromPath() {
    const path = window.location.pathname;
    const exerciseMatch = path.match(/\/exercises?\/([^\/]+)/);
    return exerciseMatch ? exerciseMatch[1] : null;
}

/**
 * Get tutorial title from page
 * @returns {string} Tutorial title
 */
function getTutorialTitle() {
    const titleElement = document.querySelector('h1, .tutorial-title');
    return titleElement ? titleElement.textContent.trim() : document.title;
}

/**
 * Get quiz title from page
 * @returns {string} Quiz title
 */
function getQuizTitle() {
    const titleElement = document.querySelector('h1, .quiz-title');
    return titleElement ? titleElement.textContent.trim() : document.title;
}

/**
 * Get exercise title from page
 * @returns {string} Exercise title
 */
function getExerciseTitle() {
    const titleElement = document.querySelector('h1, .exercise-title');
    return titleElement ? titleElement.textContent.trim() : document.title;
}

/**
 * Get tutorial time spent
 * @returns {number} Time spent in seconds
 */
function getTutorialTimeSpent() {
    // Check for stored start time
    const startTimeKey = `tutorial_start_time_${getTutorialIdFromPath()}`;
    const startTime = localStorage.getItem(startTimeKey);
    
    if (startTime) {
        const timeSpent = Math.round((Date.now() - parseInt(startTime)) / 1000);
        return timeSpent;
    }
    
    return 0;
}

/**
 * Get exercise time spent
 * @returns {number} Time spent in seconds
 */
function getExerciseTimeSpent() {
    // Check for stored start time
    const startTimeKey = `exercise_start_time_${getExerciseIdFromPath()}`;
    const startTime = localStorage.getItem(startTimeKey);
    
    if (startTime) {
        const timeSpent = Math.round((Date.now() - parseInt(startTime)) / 1000);
        return timeSpent;
    }
    
    return 0;
}

/**
 * Get element position among siblings
 * @param {Element} element - DOM element
 * @returns {number} Position (1-based)
 */
function getElementPosition(element) {
    let position = 1;
    let sibling = element;
    
    while (sibling = sibling.previousElementSibling) {
        position++;
    }
    
    return position;
}
