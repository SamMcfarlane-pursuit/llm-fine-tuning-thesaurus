/**
 * Workshop Enhancements Script
 * Provides enhanced functionality for the workshop section
 * including progress tracking, interactive exercises, and more
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing workshop enhancements...');
    
    // Initialize workshop progress tracking
    initWorkshopProgress();
    
    // Initialize interactive exercises
    initInteractiveExercises();
    
    // Initialize code execution
    initCodeExecution();
    
    // Initialize quiz functionality
    initQuizFunctionality();
    
    // Initialize workshop navigation
    initWorkshopNavigation();
    
    // Initialize workshop search
    initWorkshopSearch();
    
    console.log('Workshop enhancements initialized successfully!');
});

/**
 * Initialize workshop progress tracking
 */
function initWorkshopProgress() {
    // Get all workshop progress elements
    const progressElements = document.querySelectorAll('.progress-circle');
    
    // Animate progress circles on load
    progressElements.forEach(element => {
        const progress = element.style.getPropertyValue('--progress') || '0';
        
        // Start from 0 and animate to actual value
        element.style.setProperty('--progress', '0');
        
        // Animate after a short delay
        setTimeout(() => {
            element.style.transition = 'background 1s ease-in-out';
            element.style.setProperty('--progress', progress);
        }, 300);
    });
    
    // Track module completion
    const moduleCompletionButtons = document.querySelectorAll('.module-complete-btn');
    
    moduleCompletionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleId = this.getAttribute('data-module-id');
            const moduleElement = document.querySelector(`.workshop-module[data-module-id="${moduleId}"]`);
            
            if (moduleElement) {
                // Mark module as completed
                moduleElement.classList.remove('in-progress');
                moduleElement.classList.add('completed');
                
                // Update button text
                this.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Completed';
                this.classList.remove('btn-primary');
                this.classList.add('btn-success');
                
                // Update progress (in a real app, this would save to a database)
                updateWorkshopProgress();
                
                // Show congratulation message
                showCompletionMessage(moduleId);
            }
        });
    });
    
    // Function to update overall workshop progress
    function updateWorkshopProgress() {
        const totalModules = document.querySelectorAll('.workshop-module').length;
        const completedModules = document.querySelectorAll('.workshop-module.completed').length;
        
        if (totalModules > 0) {
            const progressPercentage = Math.round((completedModules / totalModules) * 100);
            
            // Update progress bar
            const progressBar = document.querySelector('.workshop-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', progressPercentage);
            }
            
            // Update progress text
            const progressText = document.querySelector('.workshop-progress-text');
            if (progressText) {
                progressText.textContent = `${progressPercentage}%`;
            }
            
            // Update progress circle
            const progressCircle = document.querySelector('.progress-circle');
            if (progressCircle) {
                progressCircle.style.setProperty('--progress', `${progressPercentage}%`);
            }
        }
    }
    
    // Function to show completion message
    function showCompletionMessage(moduleId) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Module Completed!</div>
                <div class="toast-message">Great job! You've completed this module.</div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

/**
 * Initialize interactive exercises
 */
function initInteractiveExercises() {
    // Get all interactive exercise containers
    const exerciseContainers = document.querySelectorAll('.interactive-exercise');
    
    exerciseContainers.forEach(container => {
        // Get exercise elements
        const codeEditor = container.querySelector('.code-editor');
        const runButton = container.querySelector('.run-code-btn');
        const resetButton = container.querySelector('.reset-code-btn');
        const outputContainer = container.querySelector('.code-output');
        
        if (codeEditor && runButton) {
            // Store original code for reset
            const originalCode = codeEditor.textContent;
            
            // Make code editor editable
            codeEditor.setAttribute('contenteditable', 'true');
            codeEditor.setAttribute('spellcheck', 'false');
            
            // Run code button
            runButton.addEventListener('click', function() {
                const code = codeEditor.textContent;
                
                // Show loading state
                outputContainer.innerHTML = '<div class="code-running"><span class="spinner-border spinner-border-sm me-2"></span>Running code...</div>';
                
                // Simulate code execution (in a real app, this would execute the code)
                setTimeout(() => {
                    try {
                        // For demo purposes, just show the code output
                        outputContainer.innerHTML = `<pre class="code-result">Code executed successfully!\n\nOutput:\n${code}</pre>`;
                    } catch (error) {
                        outputContainer.innerHTML = `<pre class="code-error">Error: ${error.message}</pre>`;
                    }
                }, 1000);
            });
            
            // Reset code button
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    codeEditor.textContent = originalCode;
                    outputContainer.innerHTML = '';
                });
            }
        }
    });
}

/**
 * Initialize code execution functionality
 */
function initCodeExecution() {
    // Get all code execution containers
    const codeContainers = document.querySelectorAll('.code-execution-container');
    
    codeContainers.forEach(container => {
        // Get code elements
        const codeBlock = container.querySelector('.code-block');
        const executeButton = container.querySelector('.execute-code-btn');
        const copyButton = container.querySelector('.copy-code-btn');
        const outputDisplay = container.querySelector('.execution-output');
        
        if (codeBlock && executeButton) {
            // Execute code button
            executeButton.addEventListener('click', function() {
                const code = codeBlock.textContent;
                
                // Show loading state
                outputDisplay.innerHTML = '<div class="executing"><span class="spinner-border spinner-border-sm me-2"></span>Executing...</div>';
                
                // Simulate code execution (in a real app, this would execute the code)
                setTimeout(() => {
                    // For demo purposes, show a simulated output
                    outputDisplay.innerHTML = `
                        <div class="execution-result">
                            <div class="result-header">Execution Result:</div>
                            <pre class="result-content">
# Output for demonstration purposes
Loading model...
Model loaded successfully!
Starting fine-tuning with LoRA...
Epoch 1/3: loss=2.345
Epoch 2/3: loss=1.678
Epoch 3/3: loss=0.987
Fine-tuning complete!
Saving adapter weights...
Done!
                            </pre>
                        </div>
                    `;
                }, 2000);
            });
            
            // Copy code button
            if (copyButton) {
                copyButton.addEventListener('click', function() {
                    // Copy code to clipboard
                    const code = codeBlock.textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        // Show success message
                        const originalText = this.innerHTML;
                        this.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copied!';
                        
                        // Reset button after delay
                        setTimeout(() => {
                            this.innerHTML = originalText;
                        }, 2000);
                    });
                });
            }
        }
    });
}

/**
 * Initialize quiz functionality
 */
function initQuizFunctionality() {
    // Get all quiz containers
    const quizContainers = document.querySelectorAll('.workshop-quiz');
    
    quizContainers.forEach(container => {
        // Get quiz elements
        const quizForm = container.querySelector('form');
        const submitButton = container.querySelector('.submit-quiz-btn');
        const resultContainer = container.querySelector('.quiz-result');
        
        if (quizForm && submitButton) {
            // Submit quiz
            submitButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get all answers
                const answers = quizForm.querySelectorAll('input[type="radio"]:checked');
                const totalQuestions = quizForm.querySelectorAll('.quiz-question').length;
                
                // Check if all questions are answered
                if (answers.length < totalQuestions) {
                    // Show warning
                    resultContainer.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Please answer all questions before submitting.
                        </div>
                    `;
                    return;
                }
                
                // Show loading state
                resultContainer.innerHTML = `
                    <div class="checking-answers">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Checking answers...
                    </div>
                `;
                
                // Simulate checking answers (in a real app, this would check against correct answers)
                setTimeout(() => {
                    // For demo purposes, assume 80% correct
                    const correctAnswers = Math.round(totalQuestions * 0.8);
                    const score = Math.round((correctAnswers / totalQuestions) * 100);
                    
                    // Show result
                    resultContainer.innerHTML = `
                        <div class="alert ${score >= 70 ? 'alert-success' : 'alert-danger'}">
                            <h5 class="alert-heading">
                                ${score >= 70 ? '<i class="bi bi-trophy-fill me-2"></i>Congratulations!' : '<i class="bi bi-emoji-frown-fill me-2"></i>Keep Learning!'}
                            </h5>
                            <p>You scored ${score}% (${correctAnswers}/${totalQuestions} correct)</p>
                            <hr>
                            <p class="mb-0">
                                ${score >= 70 ? 'Great job! You\'ve mastered this topic.' : 'Review the material and try again to improve your score.'}
                            </p>
                        </div>
                    `;
                    
                    // Update progress if passed
                    if (score >= 70) {
                        updateQuizProgress(container.getAttribute('data-quiz-id'));
                    }
                }, 1500);
            });
        }
    });
    
    // Function to update quiz progress
    function updateQuizProgress(quizId) {
        // In a real app, this would update the database
        console.log(`Quiz ${quizId} completed successfully!`);
        
        // Update UI to show completion
        const quizItem = document.querySelector(`.quiz-item[data-quiz-id="${quizId}"]`);
        if (quizItem) {
            quizItem.classList.add('completed');
            
            // Update badge
            const badge = quizItem.querySelector('.badge');
            if (badge) {
                badge.textContent = 'Completed';
                badge.classList.remove('bg-secondary');
                badge.classList.add('bg-success');
            }
        }
    }
}

/**
 * Initialize workshop navigation
 */
function initWorkshopNavigation() {
    // Get navigation elements
    const prevButton = document.querySelector('.prev-module-btn');
    const nextButton = document.querySelector('.next-module-btn');
    const moduleLinks = document.querySelectorAll('.module-nav-link');
    
    // Track current module
    let currentModuleIndex = 0;
    
    // Find current module index
    moduleLinks.forEach((link, index) => {
        if (link.classList.contains('active')) {
            currentModuleIndex = index;
        }
    });
    
    // Update navigation buttons
    function updateNavButtons() {
        if (prevButton) {
            if (currentModuleIndex === 0) {
                prevButton.classList.add('disabled');
            } else {
                prevButton.classList.remove('disabled');
            }
        }
        
        if (nextButton) {
            if (currentModuleIndex === moduleLinks.length - 1) {
                nextButton.classList.add('disabled');
            } else {
                nextButton.classList.remove('disabled');
            }
        }
    }
    
    // Initial update
    updateNavButtons();
    
    // Previous button click
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentModuleIndex > 0) {
                currentModuleIndex--;
                moduleLinks[currentModuleIndex].click();
                updateNavButtons();
            }
        });
    }
    
    // Next button click
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentModuleIndex < moduleLinks.length - 1) {
                currentModuleIndex++;
                moduleLinks[currentModuleIndex].click();
                updateNavButtons();
            }
        });
    }
    
    // Module link clicks
    moduleLinks.forEach((link, index) => {
        link.addEventListener('click', function() {
            // Update current index
            currentModuleIndex = index;
            
            // Update active state
            moduleLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Update navigation buttons
            updateNavButtons();
        });
    });
}

/**
 * Initialize workshop search
 */
function initWorkshopSearch() {
    // Get search elements
    const searchInput = document.querySelector('.workshop-search-input');
    const searchResults = document.querySelector('.workshop-search-results');
    
    if (searchInput && searchResults) {
        // Search input event
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            // Clear results if query is empty
            if (query === '') {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            
            // Show loading state
            searchResults.innerHTML = '<div class="searching"><span class="spinner-border spinner-border-sm me-2"></span>Searching...</div>';
            searchResults.style.display = 'block';
            
            // Simulate search (in a real app, this would search the database)
            setTimeout(() => {
                // For demo purposes, show some results
                if (query.length > 0) {
                    searchResults.innerHTML = `
                        <div class="search-result-item">
                            <a href="/workshop/lora-basics#module-1">
                                <div class="result-title">Introduction to LoRA</div>
                                <div class="result-description">Learn the fundamentals of Low-Rank Adaptation</div>
                            </a>
                        </div>
                        <div class="search-result-item">
                            <a href="/workshop/qlora-deep-dive#module-2">
                                <div class="result-title">QLoRA Implementation</div>
                                <div class="result-description">Step-by-step guide to implementing QLoRA</div>
                            </a>
                        </div>
                        <div class="search-result-item">
                            <a href="/workshop/advanced-peft#module-3">
                                <div class="result-title">Advanced PEFT Techniques</div>
                                <div class="result-description">Explore advanced parameter-efficient fine-tuning methods</div>
                            </a>
                        </div>
                    `;
                } else {
                    searchResults.innerHTML = '<div class="no-results">No results found</div>';
                }
            }, 500);
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
}

// Add CSS for workshop enhancements
const style = document.createElement('style');
style.textContent = `
    /* Toast Notification */
    .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 1050;
    }
    
    .toast-notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast-icon {
        font-size: 1.5rem;
        margin-right: 15px;
    }
    
    .toast-title {
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    /* Code Editor */
    .code-editor {
        font-family: monospace;
        background-color: #1e1e1e;
        color: #d4d4d4;
        padding: 15px;
        border-radius: 8px;
        min-height: 150px;
        white-space: pre;
        overflow-x: auto;
        tab-size: 4;
    }
    
    .code-editor:focus {
        outline: 2px solid #4a6cf7;
    }
    
    .code-output {
        background-color: #2a2a2a;
        color: #d4d4d4;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        min-height: 100px;
    }
    
    .code-result {
        color: #4caf50;
        margin: 0;
    }
    
    .code-error {
        color: #f44336;
        margin: 0;
    }
    
    .code-running {
        color: #ffc107;
    }
    
    /* Quiz Styling */
    .workshop-quiz .quiz-question {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #2a2a2a;
        border-radius: 8px;
    }
    
    .workshop-quiz .form-check {
        margin-bottom: 10px;
    }
    
    .workshop-quiz .form-check-input:checked + .form-check-label {
        color: #4a6cf7;
        font-weight: bold;
    }
    
    /* Search Results */
    .workshop-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #2a2a2a;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
        display: none;
    }
    
    .search-result-item {
        padding: 10px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .search-result-item a {
        text-decoration: none;
        color: inherit;
        display: block;
    }
    
    .search-result-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .result-title {
        font-weight: bold;
        color: #4a6cf7;
    }
    
    .result-description {
        font-size: 0.9rem;
        color: #aaa;
    }
    
    .searching, .no-results {
        padding: 15px;
        text-align: center;
        color: #aaa;
    }
`;

document.head.appendChild(style);
