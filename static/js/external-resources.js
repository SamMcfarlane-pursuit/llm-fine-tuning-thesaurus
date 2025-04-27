/**
 * External Resources Integration
 * Provides seamless integration with external learning platforms and resources
 */

document.addEventListener('DOMContentLoaded', function() {
    // External learning platforms and resources
    const externalResources = {
        // Documentation
        'huggingface': {
            name: 'Hugging Face',
            icon: 'bi-book-half',
            color: '#FFD21E',
            description: 'The AI community building the future',
            categories: ['documentation', 'models', 'datasets'],
            resources: [
                {
                    title: 'Transformers Documentation',
                    url: 'https://huggingface.co/docs/transformers/index',
                    description: 'Comprehensive documentation for the Transformers library'
                },
                {
                    title: 'PEFT Documentation',
                    url: 'https://huggingface.co/docs/peft/index',
                    description: 'Parameter-Efficient Fine-Tuning methods documentation'
                },
                {
                    title: 'Model Hub',
                    url: 'https://huggingface.co/models',
                    description: 'Browse thousands of pre-trained models'
                },
                {
                    title: 'Datasets Documentation',
                    url: 'https://huggingface.co/docs/datasets/index',
                    description: 'Documentation for the Datasets library'
                }
            ]
        },
        'pytorch': {
            name: 'PyTorch',
            icon: 'bi-fire',
            color: '#EE4C2C',
            description: 'An open source machine learning framework',
            categories: ['documentation', 'framework'],
            resources: [
                {
                    title: 'PyTorch Documentation',
                    url: 'https://pytorch.org/docs/stable/index.html',
                    description: 'Official PyTorch documentation'
                },
                {
                    title: 'PyTorch Tutorials',
                    url: 'https://pytorch.org/tutorials/',
                    description: 'Learn PyTorch with step-by-step tutorials'
                },
                {
                    title: 'Distributed Training',
                    url: 'https://pytorch.org/tutorials/beginner/dist_overview.html',
                    description: 'Guide to distributed training in PyTorch'
                }
            ]
        },
        
        // Interactive Learning
        'colab': {
            name: 'Google Colab',
            icon: 'bi-journal-code',
            color: '#F9AB00',
            description: 'Free Jupyter notebook environment with GPU/TPU support',
            categories: ['interactive', 'notebooks'],
            resources: [
                {
                    title: 'Colab Welcome Page',
                    url: 'https://colab.research.google.com/',
                    description: 'Start using Google Colab'
                },
                {
                    title: 'Colab Pro',
                    url: 'https://colab.research.google.com/signup',
                    description: 'Premium version with better GPUs and longer runtimes'
                },
                {
                    title: 'Colab Tutorials',
                    url: 'https://colab.research.google.com/notebooks/basic_features_overview.ipynb',
                    description: 'Learn how to use Colab effectively'
                }
            ]
        },
        'kaggle': {
            name: 'Kaggle',
            icon: 'bi-graph-up',
            color: '#20BEFF',
            description: 'Platform for data science competitions and notebooks',
            categories: ['interactive', 'notebooks', 'datasets'],
            resources: [
                {
                    title: 'Kaggle Notebooks',
                    url: 'https://www.kaggle.com/notebooks',
                    description: 'Free Jupyter notebooks with GPU support'
                },
                {
                    title: 'Kaggle Courses',
                    url: 'https://www.kaggle.com/learn',
                    description: 'Free courses on machine learning and data science'
                },
                {
                    title: 'Kaggle Datasets',
                    url: 'https://www.kaggle.com/datasets',
                    description: 'Find datasets for your projects'
                }
            ]
        },
        
        // Academic Resources
        'papers': {
            name: 'Research Papers',
            icon: 'bi-file-earmark-text',
            color: '#6C757D',
            description: 'Key research papers on LLM fine-tuning',
            categories: ['academic', 'papers'],
            resources: [
                {
                    title: 'LoRA Paper',
                    url: 'https://arxiv.org/abs/2106.09685',
                    description: 'Low-Rank Adaptation of Large Language Models'
                },
                {
                    title: 'QLoRA Paper',
                    url: 'https://arxiv.org/abs/2305.14314',
                    description: 'QLoRA: Efficient Finetuning of Quantized LLMs'
                },
                {
                    title: 'Instruction Tuning Paper',
                    url: 'https://arxiv.org/abs/2203.02155',
                    description: 'Training language models to follow instructions with human feedback'
                },
                {
                    title: 'Scaling Laws Paper',
                    url: 'https://arxiv.org/abs/2001.08361',
                    description: 'Scaling Laws for Neural Language Models'
                }
            ]
        },
        
        // Video Tutorials
        'youtube': {
            name: 'YouTube Tutorials',
            icon: 'bi-youtube',
            color: '#FF0000',
            description: 'Video tutorials on LLM fine-tuning',
            categories: ['videos', 'tutorials'],
            resources: [
                {
                    title: 'Hugging Face Course',
                    url: 'https://www.youtube.com/playlist?list=PLo2EIpI_JMQvWfQndUesu0nPBAtZ9gP1o',
                    description: 'Official Hugging Face course videos'
                },
                {
                    title: 'Fine-tuning LLMs for Beginners',
                    url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos',
                    description: 'Beginner-friendly guide to fine-tuning LLMs'
                },
                {
                    title: 'LoRA and QLoRA Explained',
                    url: 'https://www.youtube.com/watch?v=YVU5wAA6Txo',
                    description: 'Detailed explanation of LoRA and QLoRA'
                },
                {
                    title: 'Stanford CS224N: NLP with Deep Learning',
                    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ',
                    description: 'Stanford\'s course on NLP with Deep Learning'
                }
            ]
        },
        
        // Community Forums
        'community': {
            name: 'Community Forums',
            icon: 'bi-people-fill',
            color: '#0D6EFD',
            description: 'Community forums for LLM fine-tuning discussions',
            categories: ['community', 'forums'],
            resources: [
                {
                    title: 'Hugging Face Forums',
                    url: 'https://discuss.huggingface.co/',
                    description: 'Official Hugging Face discussion forums'
                },
                {
                    title: 'PyTorch Forums',
                    url: 'https://discuss.pytorch.org/',
                    description: 'Official PyTorch discussion forums'
                },
                {
                    title: 'Reddit - Machine Learning',
                    url: 'https://www.reddit.com/r/MachineLearning/',
                    description: 'Reddit community for machine learning discussions'
                },
                {
                    title: 'Stack Overflow - Transformers',
                    url: 'https://stackoverflow.com/questions/tagged/transformers',
                    description: 'Stack Overflow questions tagged with "transformers"'
                }
            ]
        }
    };
    
    // Function to create resource cards
    function createResourceCards(containerId, filter = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Filter resources if needed
        let resourcesToShow = Object.entries(externalResources);
        if (filter) {
            resourcesToShow = resourcesToShow.filter(([id, resource]) => 
                resource.categories.includes(filter)
            );
        }
        
        // Create cards
        resourcesToShow.forEach(([id, resource]) => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            card.innerHTML = `
                <div class="card h-100 border-${getBootstrapColor(resource.color)}">
                    <div class="card-header" style="background-color: ${resource.color}; color: ${getContrastColor(resource.color)}">
                        <h5 class="mb-0"><i class="${resource.icon} me-2"></i>${resource.name}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${resource.description}</p>
                        <div class="list-group list-group-flush">
                            ${resource.resources.slice(0, 3).map(item => `
                                <a href="${item.url}" class="list-group-item list-group-item-action" target="_blank">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${item.title}</h6>
                                        <small><i class="bi bi-box-arrow-up-right"></i></small>
                                    </div>
                                    <small class="text-muted">${item.description}</small>
                                </a>
                            `).join('')}
                        </div>
                        ${resource.resources.length > 3 ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-sm btn-outline-${getBootstrapColor(resource.color)} view-more-btn" data-resource-id="${id}">
                                    View all ${resource.resources.length} resources
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Add event listeners to "View more" buttons
        document.querySelectorAll('.view-more-btn').forEach(button => {
            button.addEventListener('click', function() {
                const resourceId = this.getAttribute('data-resource-id');
                showResourceModal(resourceId);
            });
        });
    }
    
    // Function to show resource modal
    function showResourceModal(resourceId) {
        const resource = externalResources[resourceId];
        if (!resource) return;
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="resourceModal" tabindex="-1" aria-labelledby="resourceModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header" style="background-color: ${resource.color}; color: ${getContrastColor(resource.color)}">
                            <h5 class="modal-title" id="resourceModalLabel">
                                <i class="${resource.icon} me-2"></i>${resource.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="filter: ${getContrastColor(resource.color) === '#fff' ? 'invert(1)' : 'none'}"></button>
                        </div>
                        <div class="modal-body">
                            <p class="lead">${resource.description}</p>
                            <div class="list-group mt-4">
                                ${resource.resources.map(item => `
                                    <a href="${item.url}" class="list-group-item list-group-item-action" target="_blank">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">${item.title}</h6>
                                            <small><i class="bi bi-box-arrow-up-right"></i></small>
                                        </div>
                                        <small class="text-muted">${item.description}</small>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('resourceModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('resourceModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Function to get Bootstrap color class from hex color
    function getBootstrapColor(hexColor) {
        // Map of hex colors to Bootstrap color names
        const colorMap = {
            '#0D6EFD': 'primary',
            '#6C757D': 'secondary',
            '#198754': 'success',
            '#DC3545': 'danger',
            '#FFC107': 'warning',
            '#0DCAF0': 'info',
            '#F8F9FA': 'light',
            '#212529': 'dark'
        };
        
        // Return mapped color or default to primary
        return colorMap[hexColor.toUpperCase()] || 'primary';
    }
    
    // Function to determine contrast color (black or white) for a given background color
    function getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black for light backgrounds, white for dark backgrounds
        return luminance > 0.5 ? '#000' : '#fff';
    }
    
    // Function to create resource tabs
    function createResourceTabs(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Get unique categories
        const categories = new Set();
        Object.values(externalResources).forEach(resource => {
            resource.categories.forEach(category => categories.add(category));
        });
        
        // Create tabs HTML
        const tabsHtml = `
            <ul class="nav nav-tabs mb-4" id="resourceTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-resources" type="button" role="tab" aria-controls="all-resources" aria-selected="true">
                        All Resources
                    </button>
                </li>
                ${Array.from(categories).map((category, index) => `
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="${category}-tab" data-bs-toggle="tab" data-bs-target="#${category}-resources" type="button" role="tab" aria-controls="${category}-resources" aria-selected="false">
                            ${category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div class="tab-content" id="resourceTabsContent">
                <div class="tab-pane fade show active" id="all-resources" role="tabpanel" aria-labelledby="all-tab">
                    <div class="row" id="all-resources-container"></div>
                </div>
                ${Array.from(categories).map(category => `
                    <div class="tab-pane fade" id="${category}-resources" role="tabpanel" aria-labelledby="${category}-tab">
                        <div class="row" id="${category}-resources-container"></div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add tabs to container
        container.innerHTML = tabsHtml;
        
        // Create resource cards for each tab
        createResourceCards('all-resources-container');
        Array.from(categories).forEach(category => {
            createResourceCards(`${category}-resources-container`, category);
        });
    }
    
    // Initialize resource tabs if container exists
    createResourceTabs('external-resources-container');
    
    // Add external resources button to navbar
    const navbarNav = document.querySelector('.navbar-nav');
    if (navbarNav) {
        const resourcesButton = document.createElement('li');
        resourcesButton.className = 'nav-item';
        resourcesButton.innerHTML = `
            <button class="nav-link btn btn-link" data-bs-toggle="modal" data-bs-target="#externalResourcesModal">
                <i class="bi bi-globe nav-icon"></i> Resources
            </button>
        `;
        navbarNav.appendChild(resourcesButton);
        
        // Create resources modal
        const modalHtml = `
            <div class="modal fade" id="externalResourcesModal" tabindex="-1" aria-labelledby="externalResourcesModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="externalResourcesModalLabel">
                                <i class="bi bi-globe me-2"></i>External Resources
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="lead">Explore these external resources to deepen your understanding of LLM fine-tuning.</p>
                            <div id="modal-resources-container"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);
        
        // Initialize resource tabs in modal when shown
        document.getElementById('externalResourcesModal').addEventListener('shown.bs.modal', function() {
            createResourceTabs('modal-resources-container');
        });
    }
});
