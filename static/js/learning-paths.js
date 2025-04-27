/**
 * Learning Paths for LLM Fine-Tuning Tutorials
 * This script manages learning paths, progress tracking, and recommendations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Define learning paths
    const learningPaths = {
        'beginner': {
            name: 'Beginner Path',
            description: 'Start your LLM fine-tuning journey with the fundamentals',
            tutorials: [
                'Data_Preparation_Tutorial',
                'Tuning_Approaches_Comparison',
                'LoRA_Fine_Tuning_Tutorial',
                'Pipeline_Inference_Tutorial'
            ],
            icon: 'bi-stars'
        },
        'advanced': {
            name: 'Advanced Path',
            description: 'Master advanced techniques for efficient fine-tuning',
            tutorials: [
                'Data_Preparation_Tutorial',
                'LoRA_Fine_Tuning_Tutorial',
                'QLoRA_Fine_Tuning_Tutorial',
                'Gradient_Checkpointing_Tutorial',
                'Mixed_Precision_Training_Tutorial'
            ],
            icon: 'bi-lightning-charge-fill'
        },
        'deployment': {
            name: 'Deployment Path',
            description: 'Learn how to deploy fine-tuned models to production',
            tutorials: [
                'LoRA_Fine_Tuning_Tutorial',
                'QLoRA_Fine_Tuning_Tutorial',
                'Pipeline_Inference_Tutorial',
                'Model_Deployment_Tutorial'
            ],
            icon: 'bi-cloud-upload-fill'
        }
    };
    
    // Get user progress from localStorage or initialize empty
    let userProgress = JSON.parse(localStorage.getItem('tutorialProgress')) || {};
    
    // Function to render learning paths
    function renderLearningPaths() {
        const pathsContainer = document.getElementById('learning-paths-container');
        if (!pathsContainer) return;
        
        // Clear container
        pathsContainer.innerHTML = '';
        
        // Create path cards
        for (const [pathId, path] of Object.entries(learningPaths)) {
            // Calculate progress
            const totalTutorials = path.tutorials.length;
            const completedTutorials = path.tutorials.filter(tutorialId => 
                userProgress[tutorialId] && userProgress[tutorialId].completed
            ).length;
            const progressPercent = totalTutorials > 0 ? Math.round((completedTutorials / totalTutorials) * 100) : 0;
            
            // Create path card
            const pathCard = document.createElement('div');
            pathCard.className = 'col-md-4 mb-4';
            pathCard.innerHTML = `
                <div class="card h-100 border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi ${path.icon} me-2"></i>${path.name}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${path.description}</p>
                        <div class="progress mb-3">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercent}%" 
                                aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                                ${progressPercent}%
                            </div>
                        </div>
                        <p class="text-muted small">${completedTutorials} of ${totalTutorials} tutorials completed</p>
                        <button class="btn btn-outline-primary btn-sm view-path-btn" data-path-id="${pathId}">
                            View Path
                        </button>
                    </div>
                </div>
            `;
            
            pathsContainer.appendChild(pathCard);
        }
        
        // Add event listeners to view path buttons
        document.querySelectorAll('.view-path-btn').forEach(button => {
            button.addEventListener('click', function() {
                const pathId = this.getAttribute('data-path-id');
                showPathDetails(pathId);
            });
        });
    }
    
    // Function to show path details
    function showPathDetails(pathId) {
        const path = learningPaths[pathId];
        if (!path) return;
        
        // Create modal content
        const modalContent = `
            <div class="modal fade" id="pathModal" tabindex="-1" aria-labelledby="pathModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="pathModalLabel"><i class="bi ${path.icon} me-2"></i>${path.name}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>${path.description}</p>
                            <h6 class="mt-4 mb-3">Tutorials in this path:</h6>
                            <div class="list-group path-tutorials-list">
                                ${path.tutorials.map((tutorialId, index) => {
                                    const completed = userProgress[tutorialId] && userProgress[tutorialId].completed;
                                    return `
                                        <a href="/view-notebook/${tutorialId}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                            <div>
                                                <span class="badge bg-secondary me-2">${index + 1}</span>
                                                ${getTutorialName(tutorialId)}
                                            </div>
                                            <span class="badge ${completed ? 'bg-success' : 'bg-secondary'} rounded-pill">
                                                ${completed ? '<i class="bi bi-check-circle-fill"></i> Completed' : 'Not Started'}
                                            </span>
                                        </a>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <a href="/view-notebook/${path.tutorials[0]}" class="btn btn-primary">Start Path</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalContent;
        document.body.appendChild(modalContainer.firstChild);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('pathModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('pathModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Function to get tutorial name from ID
    function getTutorialName(tutorialId) {
        const tutorialNames = {
            'Data_Preparation_Tutorial': 'Data Preparation for LLM Fine-Tuning',
            'Tuning_Approaches_Comparison': 'Comparison of LLM Fine-Tuning Approaches',
            'LoRA_Fine_Tuning_Tutorial': 'LoRA Fine-Tuning Tutorial',
            'QLoRA_Fine_Tuning_Tutorial': 'QLoRA Fine-Tuning Tutorial',
            'Pipeline_Inference_Tutorial': 'Pipeline Inference Tutorial',
            'Gradient_Checkpointing_Tutorial': 'Gradient Checkpointing for Memory Optimization',
            'Mixed_Precision_Training_Tutorial': 'Mixed Precision Training for Faster Fine-Tuning',
            'Model_Deployment_Tutorial': 'Deploying Fine-Tuned Models to Production'
        };
        
        return tutorialNames[tutorialId] || tutorialId;
    }
    
    // Function to mark tutorial as completed
    function markTutorialCompleted(tutorialId) {
        userProgress[tutorialId] = {
            completed: true,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('tutorialProgress', JSON.stringify(userProgress));
        updateTutorialStatus(tutorialId);
    }
    
    // Function to update tutorial status in UI
    function updateTutorialStatus(tutorialId) {
        const tutorialCards = document.querySelectorAll(`.tutorial-card[data-tutorial-id="${tutorialId}"]`);
        const completed = userProgress[tutorialId] && userProgress[tutorialId].completed;
        
        tutorialCards.forEach(card => {
            const statusBadge = card.querySelector('.tutorial-status');
            if (statusBadge) {
                statusBadge.className = `badge ${completed ? 'bg-success' : 'bg-secondary'} tutorial-status`;
                statusBadge.innerHTML = completed ? '<i class="bi bi-check-circle-fill"></i> Completed' : 'Not Started';
            }
        });
        
        // Update learning paths if they're rendered
        renderLearningPaths();
    }
    
    // Add tutorial IDs to cards
    document.querySelectorAll('.tutorial-card').forEach(card => {
        const links = card.querySelectorAll('a[href*="view-notebook/"]');
        if (links.length > 0) {
            const href = links[0].getAttribute('href');
            const tutorialId = href.split('/').pop();
            card.setAttribute('data-tutorial-id', tutorialId);
            
            // Add status badge
            const cardBody = card.querySelector('.card-body');
            if (cardBody) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'mt-2 text-end';
                const completed = userProgress[tutorialId] && userProgress[tutorialId].completed;
                statusDiv.innerHTML = `
                    <span class="badge ${completed ? 'bg-success' : 'bg-secondary'} tutorial-status">
                        ${completed ? '<i class="bi bi-check-circle-fill"></i> Completed' : 'Not Started'}
                    </span>
                `;
                cardBody.appendChild(statusDiv);
            }
        }
    });
    
    // Add mark as completed buttons to notebook viewer
    const markCompletedBtn = document.getElementById('mark-completed-btn');
    if (markCompletedBtn) {
        const tutorialId = markCompletedBtn.getAttribute('data-tutorial-id');
        markCompletedBtn.addEventListener('click', function() {
            markTutorialCompleted(tutorialId);
            this.disabled = true;
            this.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Marked as Completed';
        });
        
        // Update button state
        if (userProgress[tutorialId] && userProgress[tutorialId].completed) {
            markCompletedBtn.disabled = true;
            markCompletedBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Marked as Completed';
        }
    }
    
    // Initialize learning paths
    renderLearningPaths();
});
