/**
 * Pop Quiz System
 * Triggers topic-specific quizzes after users complete reading a section
 */

class PopQuizSystem {
    constructor() {
        this.quizData = {};
        this.readingTimeThreshold = 10; // seconds (reduced for testing)
        this.startTime = new Date();
        this.topicId = document.body.dataset.topicId || '';
        this.moduleId = document.body.dataset.moduleId || '';
        this.isLoggedIn = document.body.dataset.userLoggedIn === 'true';
        this.quizShown = false;

        console.log('PopQuizSystem initialized with:', {
            topicId: this.topicId,
            moduleId: this.moduleId,
            isLoggedIn: this.isLoggedIn,
            readingTimeThreshold: this.readingTimeThreshold
        });

        // Initialize
        this.init();
    }

    init() {
        // Only proceed if we have a topic ID and the user is logged in
        if (!this.topicId || !this.isLoggedIn) return;

        // Load quiz data for this topic
        this.loadQuizData();

        // Set up scroll tracking
        this.setupScrollTracking();

        // Set up reading time tracking
        this.trackReadingTime();
    }

    loadQuizData() {
        // Only proceed if user is logged in
        console.log('Loading quiz data for:', {
            moduleId: this.moduleId,
            topicId: this.topicId,
            isLoggedIn: this.isLoggedIn
        });
        if (!this.isLoggedIn) {
            console.log('User not logged in, skipping pop quiz');
            return;
        }

        // Fetch quiz data from the server
        fetch(`/quiz/api/quiz/topic/${this.moduleId}/${this.topicId}/pop`)
            .then(response => {
                if (response.redirected) {
                    console.log('Redirected to login page, user not authenticated');
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success && data.quiz) {
                    this.quizData = data.quiz;
                    console.log('Pop quiz data loaded successfully');
                }
            })
            .catch(error => console.error('Error loading pop quiz data:', error));
    }

    setupScrollTracking() {
        // Track when user reaches the bottom of the content
        // Look for various content containers that might exist
        const contentElement = document.querySelector('.topic-content, .card-body, main');
        if (!contentElement) {
            console.log('No content element found for scroll tracking');
            return;
        }

        console.log('Setting up scroll tracking on element:', contentElement);

        window.addEventListener('scroll', () => {
            if (this.quizShown) return;

            const rect = contentElement.getBoundingClientRect();
            const contentBottom = rect.bottom;
            const windowHeight = window.innerHeight;

            // If user has scrolled to the bottom of the content
            if (contentBottom <= windowHeight) {
                console.log('User scrolled to bottom of content, checking quiz');
                this.checkAndShowQuiz();
            }
        });
    }

    trackReadingTime() {
        // Check reading time every 10 seconds
        setInterval(() => {
            if (this.quizShown) return;

            const currentTime = new Date();
            const timeSpent = (currentTime - this.startTime) / 1000;

            if (timeSpent >= this.readingTimeThreshold) {
                this.checkAndShowQuiz();
            }
        }, 10000);
    }

    checkAndShowQuiz() {
        // Only show quiz if we have data and user hasn't seen it yet
        console.log('Checking if we should show quiz:', {
            quizDataLength: Object.keys(this.quizData).length,
            quizShown: this.quizShown,
            moduleId: this.moduleId,
            topicId: this.topicId,
            isLoggedIn: this.isLoggedIn
        });
        if (Object.keys(this.quizData).length === 0 || this.quizShown) return;

        // Show the quiz modal
        this.showQuizModal();
    }

    showQuizModal() {
        this.quizShown = true;

        // Create modal HTML
        const modalHtml = this.createQuizModalHtml();

        // Add modal to the page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);

        // Initialize the modal
        const quizModal = new bootstrap.Modal(document.getElementById('popQuizModal'));
        quizModal.show();

        // Set up event listeners
        this.setupQuizEventListeners();
    }

    createQuizModalHtml() {
        const questions = this.quizData.questions || [];

        let questionsHtml = '';
        questions.forEach((question, index) => {
            let optionsHtml = '';

            if (question.question_type === 'multiple_choice') {
                // Handle case where options is a JSON string
                let options = question.options;
                if (typeof options === 'string') {
                    try {
                        options = JSON.parse(options);
                    } catch (e) {
                        console.error('Error parsing options JSON:', e);
                    }
                }

                // Ensure options is an array
                if (Array.isArray(options)) {
                    options.forEach(option => {
                        optionsHtml += `
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="question_${question.id}" id="option_${option.id}" value="${option.id}">
                                <label class="form-check-label" for="option_${option.id}">
                                    ${option.option_text || option.text}
                                </label>
                            </div>
                        `;
                    });
                } else {
                    console.error('Options is not an array:', options);
                }
            } else if (question.question_type === 'true_false') {
                optionsHtml += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="question_${question.id}" id="option_${question.id}_true" value="true">
                        <label class="form-check-label" for="option_${question.id}_true">
                            True
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="question_${question.id}" id="option_${question.id}_false" value="false">
                        <label class="form-check-label" for="option_${question.id}_false">
                            False
                        </label>
                    </div>
                `;
            }

            questionsHtml += `
                <div class="quiz-question mb-4" id="pop-question-${index + 1}" ${index > 0 ? 'style="display: none;"' : ''}>
                    <h5 class="mb-3">${index + 1}. ${question.question_text}</h5>
                    <div class="options-container">
                        ${optionsHtml}
                    </div>
                    <div class="feedback-container mt-3" style="display: none;"></div>
                </div>
            `;
        });

        return `
            <div class="modal fade" id="popQuizModal" tabindex="-1" aria-labelledby="popQuizModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="popQuizModalLabel">
                                <i class="bi bi-question-circle me-2"></i>
                                Quick Knowledge Check: ${this.quizData.title || 'Topic Quiz'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="quiz-intro mb-4">
                                <p>Let's quickly check your understanding of this topic with a few questions.</p>
                                <div class="progress mb-3">
                                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="pop-quiz-progress"></div>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Question <span id="current-question">1</span> of ${questions.length}</span>
                                    <span id="quiz-timer">00:00</span>
                                </div>
                            </div>

                            <form id="pop-quiz-form">
                                ${questionsHtml}

                                <div class="quiz-navigation mt-4">
                                    <button type="button" class="btn btn-outline-secondary" id="prev-question-btn" style="display: none;">
                                        <i class="bi bi-arrow-left me-2"></i>Previous
                                    </button>
                                    <button type="button" class="btn btn-primary" id="next-question-btn">
                                        Next<i class="bi bi-arrow-right ms-2"></i>
                                    </button>
                                    <button type="button" class="btn btn-success" id="submit-quiz-btn" style="display: none;">
                                        Submit Quiz<i class="bi bi-check-circle ms-2"></i>
                                    </button>
                                </div>
                            </form>

                            <div id="quiz-results" class="mt-4" style="display: none;">
                                <h4 class="mb-3">Quiz Results</h4>
                                <div class="result-summary mb-3">
                                    <div class="alert alert-info">
                                        <div class="d-flex align-items-center">
                                            <div class="me-3">
                                                <i class="bi bi-info-circle-fill fs-3"></i>
                                            </div>
                                            <div>
                                                <h5 class="mb-1">Your Score: <span id="quiz-score">0</span>%</h5>
                                                <p class="mb-0">You answered <span id="correct-answers">0</span> out of ${questions.length} questions correctly.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="question-review">
                                    <!-- Will be populated dynamically -->
                                </div>

                                <div class="mt-4">
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                                        Continue Learning
                                    </button>
                                    <a href="/quiz/module/${this.moduleId}/topic/${this.topicId}/quiz" class="btn btn-outline-primary ms-2">
                                        Take Full Quiz
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupQuizEventListeners() {
        const questions = this.quizData.questions || [];
        let currentQuestion = 1;
        const totalQuestions = questions.length;
        let startTime = new Date();
        let answers = {};

        // Timer
        const timerElement = document.getElementById('quiz-timer');
        const timerInterval = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            timerElement.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }, 1000);

        // Navigation buttons
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-quiz-btn');

        // Update progress
        const updateProgress = () => {
            const progressBar = document.getElementById('pop-quiz-progress');
            const progressPercentage = ((currentQuestion - 1) / totalQuestions) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.setAttribute('aria-valuenow', progressPercentage);
            document.getElementById('current-question').textContent = currentQuestion;

            // Show/hide navigation buttons
            prevBtn.style.display = currentQuestion > 1 ? 'inline-block' : 'none';
            nextBtn.style.display = currentQuestion < totalQuestions ? 'inline-block' : 'none';
            submitBtn.style.display = currentQuestion === totalQuestions ? 'inline-block' : 'none';
        };

        // Show a specific question
        const showQuestion = (questionNumber) => {
            document.querySelectorAll('.quiz-question').forEach(question => {
                question.style.display = 'none';
            });

            document.getElementById(`pop-question-${questionNumber}`).style.display = 'block';
            currentQuestion = questionNumber;
            updateProgress();
        };

        // Next question button
        nextBtn.addEventListener('click', () => {
            // Save the current answer
            const currentQuestionId = questions[currentQuestion - 1].id;
            const selectedOption = document.querySelector(`input[name="question_${currentQuestionId}"]:checked`);

            if (selectedOption) {
                answers[currentQuestionId] = {
                    question_id: currentQuestionId,
                    selected_option: selectedOption.value
                };
            }

            showQuestion(currentQuestion + 1);
        });

        // Previous question button
        prevBtn.addEventListener('click', () => {
            showQuestion(currentQuestion - 1);
        });

        // Submit quiz button
        submitBtn.addEventListener('click', () => {
            // Save the last answer
            const currentQuestionId = questions[currentQuestion - 1].id;
            const selectedOption = document.querySelector(`input[name="question_${currentQuestionId}"]:checked`);

            if (selectedOption) {
                answers[currentQuestionId] = {
                    question_id: currentQuestionId,
                    selected_option: selectedOption.value
                };
            }

            // Stop the timer
            clearInterval(timerInterval);

            // Submit answers to the server
            this.submitQuizAnswers(answers);
        });

        // Initialize
        updateProgress();
    }

    submitQuizAnswers(answers) {
        // Show loading state
        document.getElementById('submit-quiz-btn').innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';

        // Prepare data
        const data = {
            quiz_id: this.quizData.id,
            answers: answers
        };

        // Submit to server
        fetch('/quiz/api/quiz/submit-pop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showQuizResults(data.results);
            } else {
                alert('Error submitting quiz: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error submitting quiz:', error);
            alert('Error submitting quiz. Please try again.');
        })
        .finally(() => {
            // Reset button state
            document.getElementById('submit-quiz-btn').innerHTML = 'Submit Quiz<i class="bi bi-check-circle ms-2"></i>';
        });
    }

    showQuizResults(results) {
        // Hide the quiz form and show results
        document.getElementById('pop-quiz-form').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';

        // Update score
        const correctCount = results.correct_count || 0;
        const totalQuestions = this.quizData.questions.length;
        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

        document.getElementById('quiz-score').textContent = scorePercentage;
        document.getElementById('correct-answers').textContent = correctCount;

        // Generate question review
        const reviewContainer = document.querySelector('.question-review');
        let reviewHtml = '';

        this.quizData.questions.forEach((question, index) => {
            const questionResult = results.question_results[question.id];
            const isCorrect = questionResult.is_correct;
            const userAnswer = questionResult.user_answer;
            const correctAnswer = questionResult.correct_answer;

            reviewHtml += `
                <div class="card mb-3 ${isCorrect ? 'border-success' : 'border-danger'}">
                    <div class="card-header ${isCorrect ? 'bg-success' : 'bg-danger'} text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Question ${index + 1}</span>
                            <span>${isCorrect ? '<i class="bi bi-check-circle"></i> Correct' : '<i class="bi bi-x-circle"></i> Incorrect'}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${question.question_text}</h6>
                        <p class="card-text">
                            <strong>Your answer:</strong> ${userAnswer}<br>
                            ${!isCorrect ? `<strong>Correct answer:</strong> ${correctAnswer}<br>` : ''}
                        </p>
                        <div class="explanation mt-2">
                            <strong>Explanation:</strong>
                            <p>${questionResult.explanation || 'No explanation available.'}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        reviewContainer.innerHTML = reviewHtml;

        // Update user progress on the server
        this.updateUserProgress(scorePercentage);
    }

    updateUserProgress(score) {
        // Send progress update to server
        fetch('/quiz/api/user/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: JSON.stringify({
                module_id: this.moduleId,
                topic_id: this.topicId,
                quiz_score: score,
                completed: true
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('User progress updated successfully');
            }
        })
        .catch(error => {
            console.error('Error updating user progress:', error);
        });
    }

    getCsrfToken() {
        // Get CSRF token from meta tag
        return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    }
}

// Initialize the pop quiz system when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make the instance globally accessible for testing
    window.popQuizSystem = new PopQuizSystem();
});
