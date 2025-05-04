/**
 * Interactive Pipeline Demo JavaScript
 * Provides interactive functionality for the Hugging Face pipeline demonstration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize pipeline demo
    initPipelineDemo();
    
    // Add copy functionality to code blocks
    initCodeBlocks();
    
    // Initialize advanced options
    initAdvancedOptions();
    
    // Handle responsive behavior
    handleResponsive();
    
    // Add touch events for mobile and iPad
    initTouchEvents();
});

/**
 * Initialize pipeline demo functionality
 */
function initPipelineDemo() {
    // Get elements
    const taskOptions = document.querySelectorAll('.task-option');
    const modelOptions = document.querySelectorAll('.model-option');
    const inputText = document.getElementById('input-text');
    const runButton = document.getElementById('run-pipeline');
    const resultContainer = document.querySelector('.result-container');
    const resultContent = document.querySelector('.result-content');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const advancedOptions = document.querySelector('.advanced-options');
    const advancedToggle = document.getElementById('advanced-toggle');
    
    // Task selection
    let selectedTask = 'text-generation';
    
    taskOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            taskOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Update selected task
            selectedTask = this.getAttribute('data-task');
            
            // Update input placeholder based on task
            updateInputPlaceholder(selectedTask);
            
            // Update model options based on task
            updateModelOptions(selectedTask);
            
            // Update advanced options based on task
            updateAdvancedOptions(selectedTask);
        });
    });
    
    // Model selection
    let selectedModel = 'gpt2';
    
    modelOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            modelOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Update selected model
            selectedModel = this.getAttribute('data-model');
        });
    });
    
    // Run pipeline
    if (runButton) {
        runButton.addEventListener('click', function() {
            // Validate input
            if (!inputText || !inputText.value.trim()) {
                showNotification('Please enter some text to process', 'warning');
                return;
            }
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('visible');
            }
            
            // Disable run button
            this.disabled = true;
            this.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Processing...';
            
            // Get advanced options
            const advancedOptionsData = getAdvancedOptions();
            
            // Prepare request data
            const requestData = {
                task: selectedTask,
                model: selectedModel,
                input: inputText.value,
                options: advancedOptionsData
            };
            
            // Make API request
            fetch('/api/pipeline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.classList.remove('visible');
                }
                
                // Show result
                if (resultContainer && resultContent) {
                    resultContainer.classList.add('visible');
                    resultContent.textContent = JSON.stringify(data.result, null, 2);
                }
                
                // Reset run button
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-play-fill"></i> Run Pipeline';
                
                // Show success message
                showNotification('Pipeline executed successfully!', 'success');
            })
            .catch(error => {
                console.error('Error running pipeline:', error);
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.classList.remove('visible');
                }
                
                // Reset run button
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-play-fill"></i> Run Pipeline';
                
                // Show error message
                showNotification('Failed to run pipeline. Please try again.', 'error');
                
                // Show error in result container
                if (resultContainer && resultContent) {
                    resultContainer.classList.add('visible');
                    resultContent.textContent = `Error: ${error.message}`;
                }
            });
        });
    }
    
    // Advanced options toggle
    if (advancedToggle && advancedOptions) {
        advancedToggle.addEventListener('click', function() {
            advancedOptions.classList.toggle('visible');
            
            // Update icon
            const icon = this.querySelector('i');
            if (icon) {
                if (advancedOptions.classList.contains('visible')) {
                    icon.className = 'bi bi-chevron-up';
                } else {
                    icon.className = 'bi bi-chevron-down';
                }
            }
        });
    }
    
    // Initialize with default task
    updateInputPlaceholder(selectedTask);
    updateModelOptions(selectedTask);
    updateAdvancedOptions(selectedTask);
}

/**
 * Update input placeholder based on selected task
 * @param {string} task - The selected task
 */
function updateInputPlaceholder(task) {
    const inputText = document.getElementById('input-text');
    
    if (!inputText) return;
    
    // Set placeholder based on task
    switch (task) {
        case 'text-generation':
            inputText.placeholder = 'Enter a prompt to generate text...';
            break;
        case 'sentiment-analysis':
            inputText.placeholder = 'Enter text to analyze sentiment...';
            break;
        case 'summarization':
            inputText.placeholder = 'Enter a long text to summarize...';
            break;
        case 'translation':
            inputText.placeholder = 'Enter text to translate...';
            break;
        case 'question-answering':
            inputText.placeholder = 'Enter a context paragraph followed by a question...';
            break;
        default:
            inputText.placeholder = 'Enter text to process...';
    }
}

/**
 * Update model options based on selected task
 * @param {string} task - The selected task
 */
function updateModelOptions(task) {
    const modelOptions = document.querySelectorAll('.model-option');
    
    // Hide all model options
    modelOptions.forEach(option => {
        option.style.display = 'none';
    });
    
    // Show relevant model options based on task
    modelOptions.forEach(option => {
        const modelTasks = option.getAttribute('data-tasks').split(',');
        
        if (modelTasks.includes(task)) {
            option.style.display = 'flex';
        }
    });
    
    // Select first visible model option
    const firstVisibleOption = document.querySelector(`.model-option[data-tasks*="${task}"]:not([style*="display: none"])`);
    
    if (firstVisibleOption) {
        modelOptions.forEach(opt => opt.classList.remove('active'));
        firstVisibleOption.classList.add('active');
    }
}

/**
 * Update advanced options based on selected task
 * @param {string} task - The selected task
 */
function updateAdvancedOptions(task) {
    const advancedOptions = document.querySelectorAll('.advanced-option');
    
    // Hide all advanced options
    advancedOptions.forEach(option => {
        option.style.display = 'none';
    });
    
    // Show relevant advanced options based on task
    advancedOptions.forEach(option => {
        const optionTasks = option.getAttribute('data-tasks').split(',');
        
        if (optionTasks.includes(task) || optionTasks.includes('all')) {
            option.style.display = 'block';
        }
    });
}

/**
 * Get advanced options values
 * @returns {Object} - Advanced options values
 */
function getAdvancedOptions() {
    const advancedOptions = {};
    
    // Get all visible advanced option inputs
    const advancedInputs = document.querySelectorAll('.advanced-option:not([style*="display: none"]) input');
    
    advancedInputs.forEach(input => {
        const name = input.getAttribute('name');
        let value = input.value;
        
        // Convert to appropriate type
        if (input.type === 'number' || input.type === 'range') {
            value = parseFloat(value);
        } else if (input.type === 'checkbox') {
            value = input.checked;
        }
        
        advancedOptions[name] = value;
    });
    
    return advancedOptions;
}

/**
 * Initialize code blocks with copy functionality
 */
function initCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        // Create copy button if it doesn't exist
        if (!block.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.setAttribute('aria-label', 'Copy code');
            
            // Add click event
            copyBtn.addEventListener('click', function() {
                const code = block.querySelector('pre').textContent;
                
                // Copy to clipboard
                navigator.clipboard.writeText(code)
                    .then(() => {
                        // Show success state
                        this.textContent = 'Copied!';
                        
                        // Reset after 2 seconds
                        setTimeout(() => {
                            this.textContent = 'Copy';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy code:', err);
                        
                        // Show error state
                        this.textContent = 'Failed';
                        
                        // Reset after 2 seconds
                        setTimeout(() => {
                            this.textContent = 'Copy';
                        }, 2000);
                    });
            });
            
            block.appendChild(copyBtn);
        }
    });
}

/**
 * Initialize advanced options
 */
function initAdvancedOptions() {
    // Initialize range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    
    rangeInputs.forEach(input => {
        const valueDisplay = input.nextElementSibling;
        
        if (valueDisplay && valueDisplay.classList.contains('range-value')) {
            // Set initial value
            valueDisplay.textContent = input.value;
            
            // Update value on input
            input.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
        }
    });
}

/**
 * Handle responsive behavior
 */
function handleResponsive() {
    const updateLayout = () => {
        const width = window.innerWidth;
        
        // Adjust task options layout
        const taskOptions = document.querySelectorAll('.task-option');
        
        if (width <= 768) {
            taskOptions.forEach(option => {
                const icon = option.querySelector('i');
                const text = option.textContent.trim();
                
                if (icon && text) {
                    // Store original text if not already stored
                    if (!option.getAttribute('data-original-text')) {
                        option.setAttribute('data-original-text', text);
                    }
                }
            });
        } else {
            taskOptions.forEach(option => {
                const originalText = option.getAttribute('data-original-text');
                
                if (originalText) {
                    const icon = option.querySelector('i');
                    
                    if (icon) {
                        option.innerHTML = '';
                        option.appendChild(icon);
                        option.appendChild(document.createTextNode(originalText));
                    }
                }
            });
        }
    };
    
    // Initial update
    updateLayout();
    
    // Update on resize
    window.addEventListener('resize', updateLayout);
}

/**
 * Initialize touch events for mobile and iPad
 */
function initTouchEvents() {
    // Check if device is mobile or iPad
    const isMobileOrIPad = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobileOrIPad) {
        // Add touch-specific styles
        const inputs = document.querySelectorAll('.demo-input, .demo-select, .demo-textarea');
        
        inputs.forEach(input => {
            input.style.padding = '15px';
            input.style.fontSize = '16px'; // Prevent zoom on iOS
        });
        
        // Make buttons more touch-friendly
        const buttons = document.querySelectorAll('.demo-btn, .task-option, .model-option');
        
        buttons.forEach(button => {
            button.style.padding = '12px 20px';
            
            // Add touch feedback
            button.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            
            button.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
            
            button.addEventListener('touchcancel', function() {
                this.style.opacity = '1';
            });
        });
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}
