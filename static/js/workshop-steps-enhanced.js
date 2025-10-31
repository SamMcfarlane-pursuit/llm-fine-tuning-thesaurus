// Workshop Steps Enhanced
// Advanced step-by-step workshop navigation and progress tracking

(function() {
    'use strict';

    // Configuration
    const config = {
        autoSave: true,
        showProgress: true,
        enableKeyboardNav: true,
        enableTimer: true,
        enableHints: true,
        enableValidation: true,
        animationDuration: 300,
        autoAdvance: false,
        saveInterval: 30000, // 30 seconds
        stepSelector: '.workshop-step',
        nextSelector: '.step-next',
        prevSelector: '.step-prev',
        progressSelector: '.workshop-progress',
        timerSelector: '.workshop-timer'
    };

    // State management
    let state = {
        currentStep: 0,
        totalSteps: 0,
        completedSteps: new Set(),
        stepData: {},
        startTime: null,
        stepStartTime: null,
        timeSpent: {},
        isInitialized: false,
        validationRules: {},
        hints: {},
        saveTimer: null
    };

    // Add workshop styles
    function addWorkshopStyles() {
        const style = document.createElement('style');
        style.id = 'workshop-steps-styles';
        style.textContent = `
            /* Workshop Steps Enhanced Styles */
            .workshop-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .workshop-header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
            }
            
            .workshop-title {
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 10px 0;
            }
            
            .workshop-subtitle {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            
            .workshop-progress {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .progress-title {
                font-weight: 600;
                color: #333;
            }
            
            .progress-stats {
                font-size: 14px;
                color: #666;
            }
            
            .progress-bar-container {
                background: #e9ecef;
                border-radius: 10px;
                height: 8px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .progress-bar {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                border-radius: 10px;
                transition: width 0.5s ease;
                position: relative;
            }
            
            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
                animation: progressShine 2s ease-in-out infinite;
            }
            
            @keyframes progressShine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .progress-steps {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .progress-step {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                position: relative;
            }
            
            .progress-step:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 15px;
                left: 50%;
                right: -50%;
                height: 2px;
                background: #e9ecef;
                z-index: 1;
            }
            
            .progress-step.completed:not(:last-child)::after {
                background: #667eea;
            }
            
            .step-circle {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #e9ecef;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 12px;
                position: relative;
                z-index: 2;
                transition: all 0.3s ease;
            }
            
            .progress-step.completed .step-circle {
                background: #667eea;
                color: white;
            }
            
            .progress-step.current .step-circle {
                background: #764ba2;
                color: white;
                transform: scale(1.2);
                box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.2);
            }
            
            .step-label {
                font-size: 11px;
                color: #666;
                margin-top: 5px;
                text-align: center;
                max-width: 80px;
                line-height: 1.2;
            }
            
            .progress-step.current .step-label {
                color: #764ba2;
                font-weight: 600;
            }
            
            .workshop-timer {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                color: #666;
            }
            
            .timer-icon {
                font-size: 16px;
            }
            
            .workshop-step {
                background: white;
                border-radius: 12px;
                padding: 30px;
                margin-bottom: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                display: none;
            }
            
            .workshop-step.active {
                display: block;
                opacity: 1;
                transform: translateY(0);
            }
            
            .step-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #f8f9fa;
            }
            
            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                margin-right: 15px;
            }
            
            .step-title {
                font-size: 24px;
                font-weight: 700;
                color: #333;
                margin: 0;
            }
            
            .step-content {
                margin-bottom: 30px;
                line-height: 1.6;
                color: #555;
            }
            
            .step-content h3 {
                color: #333;
                margin-top: 25px;
                margin-bottom: 15px;
            }
            
            .step-content ul, .step-content ol {
                padding-left: 20px;
            }
            
            .step-content li {
                margin-bottom: 8px;
            }
            
            .step-hint {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
                opacity: 0;
                transform: translateX(-20px);
                transition: all 0.3s ease;
            }
            
            .step-hint.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .step-hint-title {
                font-weight: 600;
                color: #1976d2;
                margin-bottom: 5px;
            }
            
            .step-validation {
                background: #fff3e0;
                border-left: 4px solid #ff9800;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
                display: none;
            }
            
            .step-validation.show {
                display: block;
            }
            
            .step-validation.success {
                background: #e8f5e8;
                border-left-color: #4caf50;
            }
            
            .step-validation.error {
                background: #ffebee;
                border-left-color: #f44336;
            }
            
            .step-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
            
            .step-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .step-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .step-prev {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #dee2e6;
            }
            
            .step-prev:hover:not(:disabled) {
                background: #e9ecef;
                transform: translateY(-1px);
            }
            
            .step-next {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .step-next:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            .step-actions-center {
                display: flex;
                gap: 10px;
            }
            
            .step-hint-btn {
                background: #fff;
                color: #2196f3;
                border: 1px solid #2196f3;
            }
            
            .step-hint-btn:hover {
                background: #2196f3;
                color: white;
            }
            
            .step-validate-btn {
                background: #fff;
                color: #ff9800;
                border: 1px solid #ff9800;
            }
            
            .step-validate-btn:hover {
                background: #ff9800;
                color: white;
            }
            
            .workshop-summary {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                display: none;
            }
            
            .workshop-summary.show {
                display: block;
            }
            
            .summary-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
            
            .summary-title {
                font-size: 24px;
                font-weight: 700;
                color: #333;
                margin-bottom: 15px;
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .summary-stat {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 14px;
                color: #666;
            }
            
            .workshop-actions {
                margin-top: 30px;
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .workshop-container {
                    padding: 15px;
                }
                
                .workshop-step {
                    padding: 20px;
                }
                
                .step-title {
                    font-size: 20px;
                }
                
                .step-actions {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .step-actions-center {
                    order: -1;
                }
                
                .progress-steps {
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .progress-step {
                    flex: none;
                    min-width: 60px;
                }
                
                .progress-step:not(:last-child)::after {
                    display: none;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .workshop-container {
                    color: #e2e8f0;
                }
                
                .workshop-progress {
                    background: #2d3748;
                }
                
                .workshop-step {
                    background: #2d3748;
                    color: #e2e8f0;
                }
                
                .step-title {
                    color: #e2e8f0;
                }
                
                .step-content {
                    color: #cbd5e0;
                }
                
                .step-prev {
                    background: #4a5568;
                    color: #e2e8f0;
                    border-color: #718096;
                }
                
                .summary-stat {
                    background: #4a5568;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .workshop-step,
                .step-hint,
                .progress-bar,
                .step-circle,
                .step-btn {
                    transition: none;
                }
                
                .progress-bar::after {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Initialize workshop
    function initWorkshop() {
        const steps = document.querySelectorAll(config.stepSelector);
        state.totalSteps = steps.length;
        
        if (state.totalSteps === 0) {
            console.warn('No workshop steps found');
            return;
        }
        
        // Load saved progress
        loadProgress();
        
        // Setup steps
        setupSteps();
        
        // Create progress bar
        createProgressBar();
        
        // Setup navigation
        setupNavigation();
        
        // Setup keyboard navigation
        if (config.enableKeyboardNav) {
            setupKeyboardNavigation();
        }
        
        // Setup timer
        if (config.enableTimer) {
            setupTimer();
        }
        
        // Setup auto-save
        if (config.autoSave) {
            setupAutoSave();
        }
        
        // Show first step
        showStep(state.currentStep);
        
        state.isInitialized = true;
        
        // Dispatch initialization event
        document.dispatchEvent(new CustomEvent('workshopInitialized', {
            detail: { totalSteps: state.totalSteps, currentStep: state.currentStep }
        }));
    }

    // Setup steps
    function setupSteps() {
        const steps = document.querySelectorAll(config.stepSelector);
        
        steps.forEach((step, index) => {
            step.dataset.stepIndex = index;
            
            // Add step header if not exists
            if (!step.querySelector('.step-header')) {
                const header = document.createElement('div');
                header.className = 'step-header';
                
                const number = document.createElement('div');
                number.className = 'step-number';
                number.textContent = index + 1;
                
                const title = document.createElement('h2');
                title.className = 'step-title';
                title.textContent = step.dataset.title || `Step ${index + 1}`;
                
                header.appendChild(number);
                header.appendChild(title);
                step.insertBefore(header, step.firstChild);
            }
            
            // Add step actions if not exists
            if (!step.querySelector('.step-actions')) {
                const actions = document.createElement('div');
                actions.className = 'step-actions';
                
                const prevBtn = document.createElement('button');
                prevBtn.className = 'step-btn step-prev';
                prevBtn.innerHTML = '← Previous';
                prevBtn.disabled = index === 0;
                
                const centerActions = document.createElement('div');
                centerActions.className = 'step-actions-center';
                
                if (config.enableHints) {
                    const hintBtn = document.createElement('button');
                    hintBtn.className = 'step-btn step-hint-btn';
                    hintBtn.innerHTML = '💡 Hint';
                    centerActions.appendChild(hintBtn);
                }
                
                if (config.enableValidation) {
                    const validateBtn = document.createElement('button');
                    validateBtn.className = 'step-btn step-validate-btn';
                    validateBtn.innerHTML = '✓ Validate';
                    centerActions.appendChild(validateBtn);
                }
                
                const nextBtn = document.createElement('button');
                nextBtn.className = 'step-btn step-next';
                nextBtn.innerHTML = index === state.totalSteps - 1 ? 'Complete' : 'Next →';
                
                actions.appendChild(prevBtn);
                actions.appendChild(centerActions);
                actions.appendChild(nextBtn);
                step.appendChild(actions);
            }
            
            // Setup step-specific functionality
            setupStepFunctionality(step, index);
        });
    }

    // Setup step functionality
    function setupStepFunctionality(step, index) {
        const hintBtn = step.querySelector('.step-hint-btn');
        const validateBtn = step.querySelector('.step-validate-btn');
        
        // Setup hint functionality
        if (hintBtn) {
            hintBtn.addEventListener('click', () => showHint(index));
        }
        
        // Setup validation functionality
        if (validateBtn) {
            validateBtn.addEventListener('click', () => validateStep(index));
        }
        
        // Setup form validation if forms exist
        const forms = step.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (validateStep(index)) {
                    nextStep();
                }
            });
        });
        
        // Setup input tracking
        const inputs = step.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                saveStepData(index, input.name || input.id, input.value);
            });
        });
    }

    // Create progress bar
    function createProgressBar() {
        let progressContainer = document.querySelector(config.progressSelector);
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'workshop-progress';
            
            const firstStep = document.querySelector(config.stepSelector);
            if (firstStep) {
                firstStep.parentNode.insertBefore(progressContainer, firstStep);
            }
        }
        
        const progressPercent = Math.round((state.completedSteps.size / state.totalSteps) * 100);
        
        progressContainer.innerHTML = `
            <div class="progress-header">
                <div class="progress-title">Workshop Progress</div>
                <div class="progress-stats">${state.completedSteps.size}/${state.totalSteps} steps completed</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div class="progress-steps">
                ${Array.from({length: state.totalSteps}, (_, i) => `
                    <div class="progress-step ${state.completedSteps.has(i) ? 'completed' : ''} ${i === state.currentStep ? 'current' : ''}">
                        <div class="step-circle">${state.completedSteps.has(i) ? '✓' : i + 1}</div>
                        <div class="step-label">Step ${i + 1}</div>
                    </div>
                `).join('')}
            </div>
            ${config.enableTimer ? `
                <div class="workshop-timer">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">Time: <span id="workshop-timer-display">00:00</span></span>
                </div>
            ` : ''}
        `;
    }

    // Setup navigation
    function setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches(config.nextSelector)) {
                e.preventDefault();
                nextStep();
            } else if (e.target.matches(config.prevSelector)) {
                e.preventDefault();
                prevStep();
            }
        });
    }

    // Setup keyboard navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // Don't interfere with form inputs
            }
            
            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                    e.preventDefault();
                    nextStep();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    prevStep();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToStep(0);
                    break;
                case 'End':
                    e.preventDefault();
                    goToStep(state.totalSteps - 1);
                    break;
            }
        });
    }

    // Setup timer
    function setupTimer() {
        state.startTime = Date.now();
        state.stepStartTime = Date.now();
        
        setInterval(updateTimer, 1000);
    }

    // Update timer
    function updateTimer() {
        const timerDisplay = document.getElementById('workshop-timer-display');
        if (!timerDisplay) return;
        
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Setup auto-save
    function setupAutoSave() {
        state.saveTimer = setInterval(saveProgress, config.saveInterval);
        
        // Save on page unload
        window.addEventListener('beforeunload', saveProgress);
    }

    // Show step
    function showStep(stepIndex) {
        const steps = document.querySelectorAll(config.stepSelector);
        
        // Hide all steps
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('active');
            state.currentStep = stepIndex;
            
            // Update progress
            updateProgress();
            
            // Track step time
            if (config.enableTimer) {
                if (state.stepStartTime) {
                    const stepTime = Date.now() - state.stepStartTime;
                    state.timeSpent[state.currentStep] = (state.timeSpent[state.currentStep] || 0) + stepTime;
                }
                state.stepStartTime = Date.now();
            }
            
            // Scroll to top
            steps[stepIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Dispatch step change event
            document.dispatchEvent(new CustomEvent('stepChanged', {
                detail: { stepIndex, totalSteps: state.totalSteps }
            }));
        }
    }

    // Next step
    function nextStep() {
        if (state.currentStep < state.totalSteps - 1) {
            // Validate current step if validation is enabled
            if (config.enableValidation && !validateStep(state.currentStep)) {
                return;
            }
            
            // Mark current step as completed
            state.completedSteps.add(state.currentStep);
            
            showStep(state.currentStep + 1);
        } else {
            // Workshop completed
            completeWorkshop();
        }
    }

    // Previous step
    function prevStep() {
        if (state.currentStep > 0) {
            showStep(state.currentStep - 1);
        }
    }

    // Go to specific step
    function goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < state.totalSteps) {
            showStep(stepIndex);
        }
    }

    // Update progress
    function updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressStats = document.querySelector('.progress-stats');
        
        if (progressBar) {
            const progressPercent = Math.round((state.completedSteps.size / state.totalSteps) * 100);
            progressBar.style.width = `${progressPercent}%`;
        }
        
        if (progressSteps) {
            progressSteps.forEach((step, index) => {
                step.classList.toggle('completed', state.completedSteps.has(index));
                step.classList.toggle('current', index === state.currentStep);
                
                const circle = step.querySelector('.step-circle');
                if (circle) {
                    circle.textContent = state.completedSteps.has(index) ? '✓' : index + 1;
                }
            });
        }
        
        if (progressStats) {
            progressStats.textContent = `${state.completedSteps.size}/${state.totalSteps} steps completed`;
        }
    }

    // Show hint
    function showHint(stepIndex) {
        const step = document.querySelector(`${config.stepSelector}[data-step-index="${stepIndex}"]`);
        if (!step) return;
        
        let hintElement = step.querySelector('.step-hint');
        
        if (!hintElement) {
            hintElement = document.createElement('div');
            hintElement.className = 'step-hint';
            
            const hintTitle = document.createElement('div');
            hintTitle.className = 'step-hint-title';
            hintTitle.textContent = '💡 Hint';
            
            const hintContent = document.createElement('div');
            hintContent.textContent = state.hints[stepIndex] || 'No hint available for this step.';
            
            hintElement.appendChild(hintTitle);
            hintElement.appendChild(hintContent);
            
            const stepContent = step.querySelector('.step-content');
            if (stepContent) {
                stepContent.appendChild(hintElement);
            }
        }
        
        hintElement.classList.toggle('show');
    }

    // Validate step
    function validateStep(stepIndex) {
        const step = document.querySelector(`${config.stepSelector}[data-step-index="${stepIndex}"]`);
        if (!step) return true;
        
        const validationRules = state.validationRules[stepIndex];
        if (!validationRules) return true;
        
        let isValid = true;
        const errors = [];
        
        // Check required fields
        if (validationRules.required) {
            validationRules.required.forEach(fieldName => {
                const field = step.querySelector(`[name="${fieldName}"], #${fieldName}`);
                if (!field || !field.value.trim()) {
                    isValid = false;
                    errors.push(`${fieldName} is required`);
                }
            });
        }
        
        // Custom validation
        if (validationRules.custom && typeof validationRules.custom === 'function') {
            const customResult = validationRules.custom(step);
            if (customResult !== true) {
                isValid = false;
                errors.push(customResult || 'Custom validation failed');
            }
        }
        
        // Show validation result
        showValidationResult(step, isValid, errors);
        
        return isValid;
    }

    // Show validation result
    function showValidationResult(step, isValid, errors) {
        let validationElement = step.querySelector('.step-validation');
        
        if (!validationElement) {
            validationElement = document.createElement('div');
            validationElement.className = 'step-validation';
            
            const stepContent = step.querySelector('.step-content');
            if (stepContent) {
                stepContent.appendChild(validationElement);
            }
        }
        
        validationElement.classList.remove('success', 'error');
        validationElement.classList.add(isValid ? 'success' : 'error');
        
        if (isValid) {
            validationElement.innerHTML = '<strong>✓ Validation passed!</strong> You can proceed to the next step.';
        } else {
            validationElement.innerHTML = `<strong>⚠ Validation failed:</strong><ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>`;
        }
        
        validationElement.classList.add('show');
        
        // Hide after delay if successful
        if (isValid) {
            setTimeout(() => {
                validationElement.classList.remove('show');
            }, 3000);
        }
    }

    // Save step data
    function saveStepData(stepIndex, key, value) {
        if (!state.stepData[stepIndex]) {
            state.stepData[stepIndex] = {};
        }
        state.stepData[stepIndex][key] = value;
        
        if (config.autoSave) {
            saveProgress();
        }
    }

    // Save progress
    function saveProgress() {
        const progressData = {
            currentStep: state.currentStep,
            completedSteps: Array.from(state.completedSteps),
            stepData: state.stepData,
            timeSpent: state.timeSpent,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('workshop-progress', JSON.stringify(progressData));
        } catch (error) {
            console.warn('Failed to save workshop progress:', error);
        }
    }

    // Load progress
    function loadProgress() {
        try {
            const saved = localStorage.getItem('workshop-progress');
            if (saved) {
                const progressData = JSON.parse(saved);
                state.currentStep = progressData.currentStep || 0;
                state.completedSteps = new Set(progressData.completedSteps || []);
                state.stepData = progressData.stepData || {};
                state.timeSpent = progressData.timeSpent || {};
                
                // Restore form data
                Object.keys(state.stepData).forEach(stepIndex => {
                    const stepData = state.stepData[stepIndex];
                    Object.keys(stepData).forEach(key => {
                        const field = document.querySelector(`[name="${key}"], #${key}`);
                        if (field) {
                            field.value = stepData[key];
                        }
                    });
                });
            }
        } catch (error) {
            console.warn('Failed to load workshop progress:', error);
        }
    }

    // Complete workshop
    function completeWorkshop() {
        state.completedSteps.add(state.currentStep);
        
        // Calculate total time
        const totalTime = Math.floor((Date.now() - state.startTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        
        // Hide all steps
        document.querySelectorAll(config.stepSelector).forEach(step => {
            step.classList.remove('active');
        });
        
        // Show summary
        showWorkshopSummary(totalTime, minutes, seconds);
        
        // Clear saved progress
        localStorage.removeItem('workshop-progress');
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('workshopCompleted', {
            detail: { 
                totalTime, 
                completedSteps: state.completedSteps.size,
                stepData: state.stepData 
            }
        }));
    }

    // Show workshop summary
    function showWorkshopSummary(totalTime, minutes, seconds) {
        let summary = document.querySelector('.workshop-summary');
        
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'workshop-summary';
            
            const lastStep = document.querySelector(`${config.stepSelector}:last-child`);
            if (lastStep) {
                lastStep.parentNode.insertBefore(summary, lastStep.nextSibling);
            }
        }
        
        const avgTimePerStep = Math.round(totalTime / state.totalSteps);
        
        summary.innerHTML = `
            <div class="summary-icon">🎉</div>
            <h2 class="summary-title">Workshop Completed!</h2>
            <p>Congratulations! You have successfully completed all workshop steps.</p>
            
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="stat-value">${state.totalSteps}</div>
                    <div class="stat-label">Steps Completed</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                    <div class="stat-label">Total Time</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${avgTimePerStep}s</div>
                    <div class="stat-label">Avg. Time/Step</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">100%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>
            
            <div class="workshop-actions">
                <button class="step-btn step-next" onclick="location.reload()">Start Over</button>
                <button class="step-btn step-next" onclick="window.print()">Print Certificate</button>
            </div>
        `;
        
        summary.classList.add('show');
    }

    // Public API
    window.WorkshopSteps = {
        init: initWorkshop,
        nextStep,
        prevStep,
        goToStep,
        showHint,
        validateStep,
        saveStepData,
        config,
        state
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addWorkshopStyles();
            initWorkshop();
        });
    } else {
        addWorkshopStyles();
        initWorkshop();
    }

})();