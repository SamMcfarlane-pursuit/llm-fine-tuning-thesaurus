/**
 * Hands-on Exercises JavaScript
 * Provides enhanced functionality for hands-on exercises
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hands-on exercises functionality
    initHandsOnExercises();
});

/**
 * Initialize hands-on exercises functionality
 */
function initHandsOnExercises() {
    console.log('Initializing hands-on exercises functionality...');
    
    // Check if we're on an exercises page
    const isExercisePage = window.location.pathname.includes('/exercises') || 
                          window.location.pathname.includes('/guide/') ||
                          document.querySelector('.hands-on-example') !== null;
    
    if (!isExercisePage) return;
    
    // Enhance exercise cards
    enhanceExerciseCards();
    
    // Add code copy functionality
    addCodeCopyButtons();
    
    // Add progress tracking
    addProgressTracking();
    
    console.log('Hands-on exercises functionality initialized successfully');
}

/**
 * Enhance exercise cards with animations and effects
 */
function enhanceExerciseCards() {
    const exerciseCards = document.querySelectorAll('.exercise-card, .hands-on-example, .example-steps, .step-item');
    
    exerciseCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
            card.style.borderColor = 'rgba(66, 135, 245, 0.5)';
            card.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            card.style.borderColor = 'rgba(66, 135, 245, 0.2)';
        });
        
        // Add click animation
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(-5px)';
            }, 100);
        });
    });
}

/**
 * Add copy buttons to code blocks
 */
function addCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // Create copy button if it doesn't exist
        if (!block.parentNode.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            copyBtn.style.position = 'absolute';
            copyBtn.style.top = '5px';
            copyBtn.style.right = '5px';
            copyBtn.style.padding = '3px 8px';
            copyBtn.style.fontSize = '0.8rem';
            copyBtn.style.background = 'rgba(66, 135, 245, 0.2)';
            copyBtn.style.color = 'white';
            copyBtn.style.border = '1px solid rgba(66, 135, 245, 0.3)';
            copyBtn.style.borderRadius = '4px';
            copyBtn.style.cursor = 'pointer';
            copyBtn.style.zIndex = '10';
            
            // Make sure parent has position relative
            block.parentNode.style.position = 'relative';
            
            // Add click event
            copyBtn.addEventListener('click', () => {
                const code = block.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                    }, 2000);
                });
            });
            
            block.parentNode.appendChild(copyBtn);
        }
    });
}

/**
 * Add progress tracking for multi-step exercises
 */
function addProgressTracking() {
    // Find exercise steps
    const exerciseSteps = document.querySelectorAll('.exercise-step, .step-item');
    
    if (exerciseSteps.length > 0) {
        // Create progress indicator if it doesn't exist
        if (!document.querySelector('.exercise-progress')) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'exercise-progress';
            progressContainer.style.position = 'sticky';
            progressContainer.style.top = '70px';
            progressContainer.style.background = 'rgba(15, 15, 15, 0.9)';
            progressContainer.style.padding = '10px 15px';
            progressContainer.style.borderRadius = '8px';
            progressContainer.style.margin = '20px 0';
            progressContainer.style.zIndex = '100';
            progressContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            progressContainer.style.border = '1px solid rgba(66, 135, 245, 0.3)';
            
            const progressTitle = document.createElement('div');
            progressTitle.textContent = 'Exercise Progress';
            progressTitle.style.fontWeight = 'bold';
            progressTitle.style.marginBottom = '8px';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress';
            progressBar.style.height = '8px';
            progressBar.style.background = 'rgba(255, 255, 255, 0.1)';
            progressBar.style.borderRadius = '4px';
            progressBar.style.overflow = 'hidden';
            
            const progressBarInner = document.createElement('div');
            progressBarInner.className = 'progress-bar';
            progressBarInner.style.height = '100%';
            progressBarInner.style.width = '0%';
            progressBarInner.style.background = 'linear-gradient(90deg, #4287f5, #00ffdd)';
            progressBarInner.style.transition = 'width 0.3s ease';
            
            const progressStats = document.createElement('div');
            progressStats.className = 'progress-stats';
            progressStats.style.display = 'flex';
            progressStats.style.justifyContent = 'space-between';
            progressStats.style.fontSize = '0.8rem';
            progressStats.style.marginTop = '5px';
            progressStats.style.color = 'rgba(255, 255, 255, 0.7)';
            progressStats.innerHTML = '<span>0% Complete</span><span>0/' + exerciseSteps.length + ' Steps</span>';
            
            progressBar.appendChild(progressBarInner);
            progressContainer.appendChild(progressTitle);
            progressContainer.appendChild(progressBar);
            progressContainer.appendChild(progressStats);
            
            // Find a good place to insert the progress indicator
            const container = document.querySelector('.container');
            if (container) {
                const firstHeading = container.querySelector('h1, h2');
                if (firstHeading) {
                    firstHeading.parentNode.insertBefore(progressContainer, firstHeading.nextSibling);
                } else {
                    container.prepend(progressContainer);
                }
            }
            
            // Update progress as user scrolls
            let currentStep = 0;
            
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY + window.innerHeight / 3;
                
                for (let i = 0; i < exerciseSteps.length; i++) {
                    const step = exerciseSteps[i];
                    const stepTop = step.offsetTop;
                    const stepBottom = stepTop + step.offsetHeight;
                    
                    if (scrollPosition >= stepTop && scrollPosition < stepBottom) {
                        currentStep = i + 1;
                        break;
                    }
                }
                
                const progressPercentage = Math.round((currentStep / exerciseSteps.length) * 100);
                progressBarInner.style.width = progressPercentage + '%';
                progressStats.innerHTML = '<span>' + progressPercentage + '% Complete</span><span>' + currentStep + '/' + exerciseSteps.length + ' Steps</span>';
            });
        }
    }
}
