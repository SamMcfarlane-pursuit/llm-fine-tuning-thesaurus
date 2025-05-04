/**
 * Enhanced Exercises JavaScript
 * Provides interactive features for exercises including pop-ups, navigation, and information retention
 */

class EnhancedExercises {
    constructor() {
        this.initialized = false;
        this.currentSection = 0;
        this.totalSections = 0;
        this.conceptsShown = false;
        this.progressShown = false;
        this.sections = [];
        this.conceptsData = {};
        this.exerciseConnections = {};
    }

    init() {
        if (this.initialized) return;
        
        console.log("Initializing Enhanced Exercises...");
        
        // Initialize components
        this.initSections();
        this.initQuickNav();
        this.initScrollTracking();
        this.initKeyConcepts();
        this.initProgressTracker();
        this.initExerciseConnections();
        
        // Mark as initialized
        this.initialized = true;
        console.log("Enhanced Exercises initialized successfully!");
    }

    initSections() {
        // Find all main sections in the exercise
        this.sections = document.querySelectorAll('h2, h3');
        this.totalSections = this.sections.length;
        
        // Add IDs to sections if they don't have one
        this.sections.forEach((section, index) => {
            if (!section.id) {
                section.id = `section-${index}`;
            }
        });
    }

    initQuickNav() {
        // Create quick navigation sidebar
        const quickNav = document.createElement('div');
        quickNav.className = 'quick-nav-sidebar';
        
        // Add navigation dots for each section
        this.sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.setAttribute('data-index', index);
            dot.setAttribute('data-title', section.textContent);
            
            // Add click event to scroll to section
            dot.addEventListener('click', () => {
                this.scrollToSection(index);
            });
            
            quickNav.appendChild(dot);
        });
        
        // Add to document
        document.body.appendChild(quickNav);
    }

    scrollToSection(index) {
        const section = this.sections[index];
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }

    initScrollTracking() {
        // Track scroll position to update active section
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
    }

    updateActiveSection() {
        // Find current active section based on scroll position
        const scrollPosition = window.scrollY + 200;
        
        // Update active section
        let activeIndex = 0;
        this.sections.forEach((section, index) => {
            if (section.offsetTop <= scrollPosition) {
                activeIndex = index;
            }
        });
        
        // Update active dot in quick nav
        if (this.currentSection !== activeIndex) {
            this.currentSection = activeIndex;
            this.updateQuickNav();
            this.updateProgressTracker();
            
            // Show key concepts for this section
            this.showKeyConcepts(this.currentSection);
        }
    }

    updateQuickNav() {
        // Update active dot in quick nav
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    initKeyConcepts() {
        // Create key concepts popup
        const popup = document.createElement('div');
        popup.className = 'key-concepts-popup';
        popup.innerHTML = `
            <div class="key-concepts-header">
                <h5 class="key-concepts-title">
                    <i class="bi bi-lightbulb-fill"></i>
                    Key Concepts
                </h5>
                <button class="key-concepts-close">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="key-concepts-body">
                <!-- Concepts will be added here -->
            </div>
            <div class="key-concepts-footer">
                <button class="dismiss-concepts">Dismiss</button>
                <button class="next-concepts">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(popup);
        
        // Add event listeners
        popup.querySelector('.key-concepts-close').addEventListener('click', () => {
            this.hideKeyConcepts();
        });
        
        popup.querySelector('.dismiss-concepts').addEventListener('click', () => {
            this.hideKeyConcepts();
        });
        
        popup.querySelector('.next-concepts').addEventListener('click', () => {
            this.scrollToSection(this.currentSection + 1);
        });
        
        // Load concepts data
        this.loadConceptsData();
    }

    loadConceptsData() {
        // This would typically load from an API or data file
        // For now, we'll use sample data
        this.conceptsData = {
            'lora': [
                {
                    name: 'Low-Rank Adaptation (LoRA)',
                    description: 'A parameter-efficient fine-tuning technique that adds trainable rank decomposition matrices to existing weights, significantly reducing memory requirements.'
                },
                {
                    name: 'Rank Decomposition',
                    description: 'Breaking down a matrix into the product of two lower-rank matrices, reducing the number of parameters that need to be trained.'
                },
                {
                    name: 'Adapter Modules',
                    description: 'Small trainable components added to a pre-trained model to adapt it to new tasks without modifying the original weights.'
                }
            ],
            'qlora': [
                {
                    name: 'Quantized Low-Rank Adaptation (QLoRA)',
                    description: 'Combines 4-bit quantization with LoRA for even more memory-efficient fine-tuning of large language models.'
                },
                {
                    name: '4-bit Quantization',
                    description: 'Reducing model precision from 32-bit or 16-bit to 4-bit, dramatically decreasing memory requirements with minimal performance impact.'
                },
                {
                    name: 'NormalFloat (NF4)',
                    description: 'A 4-bit data type optimized for normally distributed weights in neural networks, providing better accuracy than standard INT4.'
                }
            ],
            'frameworks': [
                {
                    name: 'TensorFlow',
                    description: 'An end-to-end open source platform for machine learning developed by Google, with a comprehensive ecosystem for production deployment.'
                },
                {
                    name: 'PyTorch',
                    description: 'An open source machine learning framework developed by Facebook\'s AI Research lab, known for its dynamic computation graph and research-friendly design.'
                },
                {
                    name: 'Hugging Face Transformers',
                    description: 'A library providing thousands of pre-trained models for natural language processing tasks, with seamless integration for both TensorFlow and PyTorch.'
                }
            ]
        };
    }

    showKeyConcepts(sectionIndex) {
        // Don't show if already shown
        if (this.conceptsShown) return;
        
        // Determine which concepts to show based on section content
        const section = this.sections[sectionIndex];
        let conceptsToShow = [];
        
        if (section) {
            const sectionText = section.textContent.toLowerCase();
            
            if (sectionText.includes('lora') && !sectionText.includes('qlora')) {
                conceptsToShow = this.conceptsData['lora'];
            } else if (sectionText.includes('qlora')) {
                conceptsToShow = this.conceptsData['qlora'];
            } else if (sectionText.includes('tensorflow') || sectionText.includes('pytorch')) {
                conceptsToShow = this.conceptsData['frameworks'];
            }
        }
        
        // Only show if we have concepts
        if (conceptsToShow.length > 0) {
            // Update popup content
            const conceptsBody = document.querySelector('.key-concepts-body');
            conceptsBody.innerHTML = '';
            
            conceptsToShow.forEach(concept => {
                const conceptItem = document.createElement('div');
                conceptItem.className = 'concept-item';
                conceptItem.innerHTML = `
                    <div class="concept-name">${concept.name}</div>
                    <div class="concept-description">${concept.description}</div>
                `;
                conceptsBody.appendChild(conceptItem);
            });
            
            // Show popup
            const popup = document.querySelector('.key-concepts-popup');
            popup.classList.add('show');
            this.conceptsShown = true;
            
            // Hide after 15 seconds
            setTimeout(() => {
                this.hideKeyConcepts();
            }, 15000);
        }
    }

    hideKeyConcepts() {
        const popup = document.querySelector('.key-concepts-popup');
        popup.classList.remove('show');
        this.conceptsShown = false;
    }

    initProgressTracker() {
        // Create progress tracker popup
        const tracker = document.createElement('div');
        tracker.className = 'progress-tracker';
        tracker.innerHTML = `
            <div class="progress-icon">
                <i class="bi bi-graph-up"></i>
            </div>
            <div class="progress-info">
                <div class="progress-title">Your Progress</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: 0%"></div>
                </div>
            </div>
            <button class="progress-close">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(tracker);
        
        // Add event listeners
        tracker.querySelector('.progress-close').addEventListener('click', () => {
            this.hideProgressTracker();
        });
        
        // Show progress tracker after 5 seconds
        setTimeout(() => {
            this.showProgressTracker();
        }, 5000);
    }

    showProgressTracker() {
        // Don't show if already shown
        if (this.progressShown) return;
        
        // Show tracker
        const tracker = document.querySelector('.progress-tracker');
        tracker.classList.add('show');
        this.progressShown = true;
        
        // Hide after 10 seconds
        setTimeout(() => {
            this.hideProgressTracker();
        }, 10000);
    }

    hideProgressTracker() {
        const tracker = document.querySelector('.progress-tracker');
        tracker.classList.remove('show');
        this.progressShown = false;
    }

    updateProgressTracker() {
        // Calculate progress percentage
        const progress = ((this.currentSection + 1) / this.totalSections) * 100;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Show progress tracker if not already shown
        if (!this.progressShown && progress > 10 && progress < 90) {
            this.showProgressTracker();
        }
    }

    initExerciseConnections() {
        // Load exercise connections data
        this.loadExerciseConnections();
        
        // Add connection components to exercise boxes
        this.addConnectionComponents();
    }

    loadExerciseConnections() {
        // This would typically load from an API or data file
        // For now, we'll use sample data
        this.exerciseConnections = {
            'exercise1.1': {
                prev: null,
                next: 'exercise1.2',
                related: ['exercise2.1', 'exercise3.1'],
                category: 'Basic Quantization',
                path: ['Introduction', 'Basic Quantization', 'LoRA', 'QLoRA', 'Advanced Techniques']
            },
            'exercise1.2': {
                prev: 'exercise1.1',
                next: 'exercise2.1',
                related: ['exercise3.1'],
                category: 'LoRA',
                path: ['Introduction', 'Basic Quantization', 'LoRA', 'QLoRA', 'Advanced Techniques']
            },
            'exercise2.1': {
                prev: 'exercise1.2',
                next: 'exercise3.1',
                related: ['exercise1.1'],
                category: 'Advanced Quantization',
                path: ['Introduction', 'Basic Quantization', 'LoRA', 'QLoRA', 'Advanced Techniques']
            },
            'exercise3.1': {
                prev: 'exercise2.1',
                next: null,
                related: ['exercise1.1', 'exercise1.2'],
                category: 'QLoRA',
                path: ['Introduction', 'Basic Quantization', 'LoRA', 'QLoRA', 'Advanced Techniques']
            }
        };
    }

    addConnectionComponents() {
        // Find all exercise boxes
        const exerciseBoxes = document.querySelectorAll('.exercise-box');
        
        exerciseBoxes.forEach(box => {
            // Get exercise ID from heading
            const heading = box.querySelector('h6');
            if (!heading) return;
            
            const exerciseText = heading.textContent;
            const exerciseMatch = exerciseText.match(/Exercise (\d+\.\d+)/);
            if (!exerciseMatch) return;
            
            const exerciseId = `exercise${exerciseMatch[1]}`;
            const connectionData = this.exerciseConnections[exerciseId];
            
            if (connectionData) {
                // Create connection component
                const connectionComponent = document.createElement('div');
                connectionComponent.className = 'exercise-connection';
                
                // Add learning path
                let pathHtml = '';
                if (connectionData.path && connectionData.path.length > 0) {
                    pathHtml = `
                        <h4>Learning Path</h4>
                        <div class="connection-map">
                            ${connectionData.path.map((step, index) => {
                                const isCurrent = (
                                    (exerciseId === 'exercise1.1' && index === 1) ||
                                    (exerciseId === 'exercise1.2' && index === 2) ||
                                    (exerciseId === 'exercise2.1' && index === 3) ||
                                    (exerciseId === 'exercise3.1' && index === 3)
                                );
                                return `
                                    <div class="connection-node ${isCurrent ? 'current' : ''}">
                                        ${index + 1}
                                        <div class="connection-label">${step}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
                
                // Add learning objectives
                const objectivesHtml = `
                    <div class="exercise-objectives">
                        <h6><i class="bi bi-bullseye me-2"></i>Learning Objectives</h6>
                        <ul>
                            ${this.getObjectives(exerciseId).map(obj => `<li>${obj}</li>`).join('')}
                        </ul>
                    </div>
                `;
                
                // Add related exercises
                let relatedHtml = '';
                if (connectionData.related && connectionData.related.length > 0) {
                    relatedHtml = `
                        <div class="related-exercises">
                            <h6><i class="bi bi-link-45deg me-2"></i>Related Exercises</h6>
                            <div class="related-exercise-links">
                                ${connectionData.related.map(rel => {
                                    const relName = rel.replace('exercise', 'Exercise ');
                                    return `<a href="#${rel}" class="related-exercise-link">${relName}</a>`;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
                
                // Combine all components
                connectionComponent.innerHTML = `
                    ${pathHtml}
                    ${objectivesHtml}
                    ${relatedHtml}
                `;
                
                // Add to exercise box
                box.appendChild(connectionComponent);
            }
        });
    }

    getObjectives(exerciseId) {
        // Return learning objectives based on exercise ID
        switch (exerciseId) {
            case 'exercise1.1':
                return [
                    'Understand the basics of quantization and its impact on model size',
                    'Implement 8-bit and 4-bit quantization on a transformer model',
                    'Compare model performance before and after quantization',
                    'Learn to use BitsAndBytes library for efficient quantization'
                ];
            case 'exercise1.2':
                return [
                    'Understand the core principles of Low-Rank Adaptation (LoRA)',
                    'Implement a LoRA adapter for a pre-trained model',
                    'Experiment with different rank values and observe their effects',
                    'Fine-tune a model using LoRA for a specific task'
                ];
            case 'exercise2.1':
                return [
                    'Understand NF4 quantization and its advantages over standard INT4',
                    'Implement NF4 quantization on a pre-trained model',
                    'Compare NF4 with standard INT4 quantization',
                    'Learn advanced quantization techniques for better performance'
                ];
            case 'exercise3.1':
                return [
                    'Understand the complete QLoRA architecture and workflow',
                    'Implement QLoRA for fine-tuning a large language model',
                    'Configure optimal parameters for QLoRA training',
                    'Evaluate the fine-tuned model and compare with baseline'
                ];
            default:
                return [
                    'Understand key concepts related to this exercise',
                    'Implement techniques through hands-on practice',
                    'Evaluate results and compare different approaches'
                ];
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create and initialize enhanced exercises
    window.enhancedExercises = new EnhancedExercises();
    window.enhancedExercises.init();
});
