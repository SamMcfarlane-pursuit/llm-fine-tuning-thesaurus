/**
 * Quiz JavaScript
 * Handles the quiz functionality in the Visual Thesaurus LLM application.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz functionality
    initQuiz();
});

/**
 * Initialize quiz functionality
 */
function initQuiz() {
    // Check if we're on a quiz page
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        initQuizTake();
    }

    // Check if we're on a quiz result page
    const resultCharts = document.getElementById('performanceChart');
    if (resultCharts) {
        initQuizResults();
    }

    // Check if we're on the quiz list page
    const quizCards = document.querySelectorAll('.quiz-card');
    if (quizCards.length > 0) {
        initQuizList();
    }

    // Check if we're on the quiz assignment page
    const assignmentCards = document.querySelectorAll('.assignment-card');
    if (assignmentCards.length > 0) {
        initQuizAssignment();
    }
}

/**
 * Initialize quiz taking functionality
 */
function initQuizTake() {
    // Timer functionality
    let startTime = new Date().getTime();
    let timerInterval = setInterval(updateTimer, 1000);

    function updateTimer() {
        let currentTime = new Date().getTime();
        let elapsedTime = Math.floor((currentTime - startTime) / 1000);
        let minutes = Math.floor(elapsedTime / 60);
        let seconds = elapsedTime % 60;

        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent =
                (minutes < 10 ? '0' + minutes : minutes) + ':' +
                (seconds < 10 ? '0' + seconds : seconds);
        }
    }

    // Question navigation
    const totalQuestions = document.querySelectorAll('.quiz-question').length;
    let currentQuestion = 1;
    let answeredQuestions = new Set();
    let questionFeedback = {};

    // Update progress bar
    function updateProgress() {
        const progressPercentage = ((currentQuestion - 1) / totalQuestions) * 100;
        const progressBar = document.getElementById('progress-bar');
        const questionCounter = document.getElementById('question-counter');

        if (progressBar) {
            progressBar.style.width = progressPercentage + '%';
            progressBar.setAttribute('aria-valuenow', progressPercentage);
        }

        if (questionCounter) {
            questionCounter.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
        }

        // Update navigation buttons
        document.querySelectorAll('.question-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.question) === currentQuestion) {
                btn.classList.add('active');
            }
        });
    }

    // Show a specific question
    function showQuestion(questionNumber) {
        document.querySelectorAll('.quiz-question').forEach(question => {
            question.style.display = 'none';
        });

        const questionElement = document.getElementById(`question-${questionNumber}`);
        if (questionElement) {
            questionElement.style.display = 'block';
            currentQuestion = questionNumber;
            updateProgress();
        }
    }

    // Next question button
    document.querySelectorAll('.next-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionNumber = parseInt(this.dataset.question);
            showQuestion(questionNumber + 1);

            // Mark the question as answered if an option is selected
            const currentQuestionElement = document.getElementById(`question-${questionNumber}`);
            if (currentQuestionElement) {
                const inputElement = currentQuestionElement.querySelector('.question-options input, .question-options textarea');
                if (inputElement) {
                    const questionId = inputElement.name.split('_')[1];
                    if (isQuestionAnswered(questionId)) {
                        const navBtn = document.querySelector(`.question-nav-btn[data-question="${questionNumber}"]`);
                        if (navBtn) {
                            navBtn.classList.add('answered');
                        }
                        answeredQuestions.add(parseInt(questionId));
                    }
                }
            }
        });
    });

    // Previous question button
    document.querySelectorAll('.prev-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionNumber = parseInt(this.dataset.question);
            showQuestion(questionNumber - 1);
        });
    });

    // Question navigation buttons
    document.querySelectorAll('.question-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionNumber = parseInt(this.dataset.question);
            showQuestion(questionNumber);
        });
    });

    // Check if a question is answered
    function isQuestionAnswered(questionId) {
        const inputs = document.querySelectorAll(`input[name="question_${questionId}"]`);
        const textarea = document.querySelector(`textarea[name="question_${questionId}"]`);

        if (inputs.length > 0) {
            for (let input of inputs) {
                if (input.checked) {
                    return true;
                }
            }
        } else if (textarea && textarea.value.trim() !== '') {
            return true;
        }

        return false;
    }

    // Provide immediate feedback when an option is selected
    document.querySelectorAll('.question-options input[type="radio"]').forEach(input => {
        input.addEventListener('change', function() {
            const questionId = this.name.split('_')[1];
            // Find the question element in a more compatible way
            let questionElement = this.closest('.quiz-question');
            const questionNumber = questionElement ? questionElement.id.split('-')[1] : null;
            const feedbackArea = document.getElementById(`feedback_${questionId}`);

            if (questionNumber) {
                // Mark question as answered
                const navBtn = document.querySelector(`.question-nav-btn[data-question="${questionNumber}"]`);
                if (navBtn) {
                    navBtn.classList.add('answered');
                }
                answeredQuestions.add(parseInt(questionId));
            }

            // Show feedback
            if (feedbackArea) {
                // Generate feedback
                let feedbackHtml = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        <strong>Answer Recorded!</strong> You can change your answer before submitting the quiz.
                    </div>
                `;

                // Store feedback for this question
                questionFeedback[questionId] = feedbackHtml;

                // Display feedback
                feedbackArea.innerHTML = feedbackHtml;
                feedbackArea.classList.remove('d-none');
            }
        });
    });

    // Track text answers
    document.querySelectorAll('.question-options textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                const questionId = this.name.split('_')[1];
                // Find the question element in a more compatible way
                let questionElement = this.closest('.quiz-question');
                const questionNumber = questionElement ? questionElement.id.split('-')[1] : null;

                if (questionNumber) {
                    const navBtn = document.querySelector(`.question-nav-btn[data-question="${questionNumber}"]`);
                    if (navBtn) {
                        navBtn.classList.add('answered');
                    }
                    answeredQuestions.add(parseInt(questionId));
                }
            }
        });
    });

    // Add visual feedback when hovering over options
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('mouseover', function() {
            this.classList.add('option-hover');
        });

        item.addEventListener('mouseout', function() {
            this.classList.remove('option-hover');
        });
    });

    // Add click animation to options
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.add('option-selected');

            // Remove the selected class from other options in the same group
            const input = this.querySelector('input');
            if (input) {
                const questionId = input.name;
                document.querySelectorAll(`input[name="${questionId}"]`).forEach(otherInput => {
                    if (otherInput !== input) {
                        const otherItem = otherInput.closest('.option-item');
                        if (otherItem) {
                            otherItem.classList.remove('option-selected');
                        }
                    }
                });
            }
        });
    });

    // Initialize
    showQuestion(1);
    const firstNavBtn = document.querySelector('.question-nav-btn[data-question="1"]');
    if (firstNavBtn) {
        firstNavBtn.classList.add('active');
    }

    // Add form submission handler with improved error handling and user feedback
    if (quizForm) {
        // Create a submission status element
        const statusContainer = document.createElement('div');
        statusContainer.id = 'submission-status';
        statusContainer.className = 'd-none';
        statusContainer.innerHTML = `
            <div class="alert alert-info d-flex align-items-center" role="alert">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div>
                    <strong>Submitting your quiz...</strong> Please wait while we process your answers.
                </div>
            </div>
        `;
        quizForm.appendChild(statusContainer);

        // Track submission state to prevent double submissions
        let isSubmitting = false;

        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Prevent double submissions
            if (isSubmitting) {
                console.log('Submission already in progress');
                return false;
            }

            const unansweredCount = totalQuestions - answeredQuestions.size;

            // Create a confirmation modal instead of using the browser's confirm dialog
            if (unansweredCount > 0) {
                const confirmModal = document.createElement('div');
                confirmModal.className = 'modal fade';
                confirmModal.id = 'confirmSubmissionModal';
                confirmModal.setAttribute('tabindex', '-1');
                confirmModal.setAttribute('aria-labelledby', 'confirmSubmissionModalLabel');
                confirmModal.setAttribute('aria-hidden', 'true');

                confirmModal.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-warning text-dark">
                                <h5 class="modal-title" id="confirmSubmissionModalLabel">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    Confirm Submission
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You have <strong>${unansweredCount} unanswered question(s)</strong>.</p>
                                <p>Unanswered questions will be marked as incorrect. Are you sure you want to submit the quiz?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-arrow-left me-1"></i> Continue Quiz
                                </button>
                                <button type="button" class="btn btn-warning" id="confirmSubmit">
                                    <i class="bi bi-check-circle me-1"></i> Submit Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(confirmModal);

                // Initialize the modal
                const modal = new bootstrap.Modal(confirmModal);
                modal.show();

                // Handle confirmation
                document.getElementById('confirmSubmit').addEventListener('click', function() {
                    modal.hide();
                    submitQuiz();
                });

                // Clean up the modal when it's hidden
                confirmModal.addEventListener('hidden.bs.modal', function() {
                    confirmModal.remove();
                });
            } else {
                // No unanswered questions, proceed with submission
                submitQuiz();
            }

            function submitQuiz() {
                try {
                    // Set submitting state
                    isSubmitting = true;

                    // Show submission status
                    statusContainer.classList.remove('d-none');

                    // Disable form elements to prevent changes during submission
                    Array.from(quizForm.elements).forEach(element => {
                        element.disabled = true;
                    });

                    // Add a timestamp to the form
                    const timeInput = document.createElement('input');
                    timeInput.type = 'hidden';
                    timeInput.name = 'completion_time';
                    timeInput.value = Math.floor((new Date().getTime() - startTime) / 1000);
                    quizForm.appendChild(timeInput);

                    // Submit the form
                    setTimeout(() => {
                        quizForm.submit();
                    }, 500);

                } catch (error) {
                    console.error('Error submitting quiz:', error);

                    // Show error message
                    statusContainer.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <i class="bi bi-exclamation-circle-fill me-2"></i>
                            <strong>Error submitting quiz:</strong> ${error.message || 'Unknown error'}
                            <button type="button" class="btn btn-sm btn-danger mt-2" id="retry-submission">
                                <i class="bi bi-arrow-repeat me-1"></i> Retry Submission
                            </button>
                        </div>
                    `;

                    // Re-enable form elements
                    Array.from(quizForm.elements).forEach(element => {
                        element.disabled = false;
                    });

                    // Reset submission state
                    isSubmitting = false;

                    // Add retry handler
                    document.getElementById('retry-submission').addEventListener('click', function() {
                        statusContainer.classList.add('d-none');
                        submitQuiz();
                    });
                }
            }

            return false;
        });
    }
}

/**
 * Initialize quiz results functionality
 */
function initQuizResults() {
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        // Performance chart
        const performanceChartElement = document.getElementById('performanceChart');
        if (performanceChartElement) {
            const ctx = performanceChartElement.getContext('2d');

            // Get data from the page
            const correctCount = parseInt(performanceChartElement.dataset.correct || 0);
            const incorrectCount = parseInt(performanceChartElement.dataset.incorrect || 0);
            const unansweredCount = parseInt(performanceChartElement.dataset.unanswered || 0);

            // Ensure we have valid data
            if (isNaN(correctCount) || isNaN(incorrectCount) || isNaN(unansweredCount)) {
                console.error('Invalid chart data:', { correctCount, incorrectCount, unansweredCount });
                return; // Don't create the chart if data is invalid
            }

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect', 'Unanswered'],
                    datasets: [{
                        data: [correctCount, incorrectCount, unansweredCount],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.7)',
                            'rgba(220, 53, 69, 0.7)',
                            'rgba(108, 117, 125, 0.7)'
                        ],
                        borderColor: [
                            'rgba(40, 167, 69, 1)',
                            'rgba(220, 53, 69, 1)',
                            'rgba(108, 117, 125, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Knowledge Areas chart
        const knowledgeAreasChartElement = document.getElementById('knowledgeAreasChart');
        if (knowledgeAreasChartElement) {
            const ctx = knowledgeAreasChartElement.getContext('2d');

            // Get all category elements from the page
            const categoryElements = document.querySelectorAll('.knowledge-areas-legend .list-group-item');
            const categoryLabels = [];
            const categoryScores = [];
            const categoryColors = [];

            // Extract data from the DOM
            try {
                categoryElements.forEach(element => {
                    const nameElement = element.querySelector('h6');
                    const scoreElement = element.querySelector('.badge');

                    if (nameElement && scoreElement) {
                        const name = nameElement.textContent.trim();
                        const scoreText = scoreElement.textContent.trim();
                        const score = parseInt(scoreText.replace('%', ''));

                        if (!isNaN(score)) {
                            categoryLabels.push(name);
                            categoryScores.push(score);

                            // Determine color based on score
                            if (score >= 80) {
                                categoryColors.push('rgba(40, 167, 69, 0.7)');
                            } else if (score >= 60) {
                                categoryColors.push('rgba(255, 193, 7, 0.7)');
                            } else {
                                categoryColors.push('rgba(220, 53, 69, 0.7)');
                            }
                        }
                    }
                });

                // Only create chart if we have data
                if (categoryLabels.length === 0) {
                    console.warn('No category data found for knowledge areas chart');
                    return;
                }
            } catch (error) {
                console.error('Error processing knowledge areas data:', error);
                return; // Don't create the chart if there's an error
            }

            // Create the chart
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        label: 'Score by Knowledge Area',
                        data: categoryScores,
                        backgroundColor: categoryColors,
                        borderColor: categoryColors.map(color => color.replace('0.7', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Score: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Initialize accordion functionality
    try {
        document.querySelectorAll('.accordion-button').forEach(button => {
            button.addEventListener('click', function() {
                try {
                    // Toggle the active class
                    this.classList.toggle('collapsed');

                    // Get the target collapse element
                    const targetId = this.getAttribute('data-bs-target');
                    if (!targetId) {
                        console.warn('No data-bs-target attribute found on accordion button');
                        return;
                    }

                    const target = document.getElementById(targetId.substring(1));
                    if (!target) {
                        console.warn(`Target element ${targetId} not found`);
                        return;
                    }

                    target.classList.toggle('show');

                    // Visual feedback based on answer correctness
                    const isCorrect = this.classList.contains('correct-answer');
                    const isIncorrect = this.classList.contains('incorrect-answer');

                    if (target.classList.contains('show')) {
                        // Add visual feedback
                        if (isCorrect) {
                            // Flash a success message
                            const feedbackEl = document.createElement('div');
                            feedbackEl.className = 'feedback-message correct-feedback';
                            feedbackEl.innerHTML = '<i class="bi bi-check-circle-fill"></i> Correct!';

                            // Add to the DOM temporarily
                            target.prepend(feedbackEl);

                            // Remove after animation
                            setTimeout(() => {
                                feedbackEl.classList.add('fade-out');
                                setTimeout(() => {
                                    if (feedbackEl.parentNode) {
                                        feedbackEl.remove();
                                    }
                                }, 500);
                            }, 2000);
                        } else if (isIncorrect) {
                            // Flash an error message
                            const feedbackEl = document.createElement('div');
                            feedbackEl.className = 'feedback-message incorrect-feedback';
                            feedbackEl.innerHTML = '<i class="bi bi-x-circle-fill"></i> Incorrect';

                            // Add to the DOM temporarily
                            target.prepend(feedbackEl);

                            // Remove after animation
                            setTimeout(() => {
                                feedbackEl.classList.add('fade-out');
                                setTimeout(() => {
                                    if (feedbackEl.parentNode) {
                                        feedbackEl.remove();
                                    }
                                }, 500);
                            }, 2000);
                        }
                    }
                } catch (error) {
                    console.error('Error in accordion click handler:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error initializing accordion functionality:', error);
    }
}

/**
 * Initialize quiz list functionality
 */
function initQuizList() {
    // Add hover effects to quiz cards
    document.querySelectorAll('.quiz-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-lg');
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-lg');
        });
    });

    // Initialize filter functionality
    const filterButtons = document.querySelectorAll('.quiz-filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Get the filter value
                const filter = this.dataset.filter;

                // Filter the quiz cards
                document.querySelectorAll('.quiz-card').forEach(card => {
                    const cardStatus = card.dataset.status;

                    if (filter === 'all') {
                        card.style.display = 'block';
                    } else if (filter === 'completed' && cardStatus === 'completed') {
                        card.style.display = 'block';
                    } else if (filter === 'incomplete' && (cardStatus === 'incomplete' || cardStatus === 'attempted')) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });

                try {
                    // Check if any cards are visible
                    const visibleCards = [];
                    document.querySelectorAll('.quiz-card').forEach(card => {
                        if (card.style.display !== 'none') {
                            visibleCards.push(card);
                        }
                    });

                    const noResultsMessage = document.getElementById('no-filter-results');

                    if (visibleCards.length === 0) {
                        // No cards match the filter
                        if (!noResultsMessage) {
                            const message = document.createElement('div');
                            message.id = 'no-filter-results';
                            message.className = 'alert alert-info col-12';
                            message.innerHTML = `<i class="bi bi-info-circle me-2"></i> No quizzes match the "${filter}" filter.`;

                            // Find the row containing quiz cards
                            const quizCardsContainer = document.querySelector('.row');
                            if (quizCardsContainer) {
                                quizCardsContainer.appendChild(message);
                            }
                        }
                    } else if (noResultsMessage && noResultsMessage.parentNode) {
                        // Remove the message if cards are visible
                        noResultsMessage.parentNode.removeChild(noResultsMessage);
                    }
                } catch (error) {
                    console.error('Error checking visible cards:', error);
                }
            });
        });
    }
}

/**
 * Initialize quiz assignment functionality
 */
function initQuizAssignment() {
    // Add copy code functionality
    document.querySelectorAll('.copy-code-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Get the code element
            const codeElement = this.closest('.code-container').querySelector('code');
            if (codeElement) {
                // Copy the code to clipboard
                navigator.clipboard.writeText(codeElement.textContent)
                    .then(() => {
                        // Change button text temporarily
                        const originalText = this.innerHTML;
                        this.innerHTML = '<i class="bi bi-check me-1"></i>Copied!';

                        // Reset button text after 2 seconds
                        setTimeout(() => {
                            this.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy code: ', err);
                    });
            }
        });
    });
}
