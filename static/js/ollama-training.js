/**
 * Ollama Training Interface - Visual LLM Platform
 * Provides comprehensive model training capabilities
 */

class OllamaTrainingInterface {
    constructor() {
        this.currentJobId = null;
        this.progressModal = null;
        this.progressInterval = null;
        
        this.init();
    }

    init() {
        // Initialize Bootstrap modal
        this.progressModal = new bootstrap.Modal(document.getElementById('trainingProgressModal'));
        
        // Check initial status
        this.checkOllamaStatus();
        this.loadAvailableModels();
        this.loadTrainingJobs();
        
        // Set up form handlers
        this.setupFormHandlers();
        
        // Auto-refresh status every 30 seconds
        setInterval(() => this.checkOllamaStatus(), 30000);
        
        console.log('🔥 Ollama Training Interface initialized');
    }

    setupFormHandlers() {
        // Training form submission
        document.getElementById('trainingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startTraining();
        });

        // Dataset type toggle
        document.querySelectorAll('input[name="datasetType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const customFile = document.getElementById('datasetFile');
                const sampleSelect = document.getElementById('sampleDatasetSelect');
                
                if (e.target.value === 'custom') {
                    customFile.disabled = false;
                    sampleSelect.disabled = true;
                } else {
                    customFile.disabled = true;
                    sampleSelect.disabled = false;
                }
            });
        });

        // Training type toggle (show/hide LoRA params)
        document.querySelectorAll('input[name="trainingType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const loraParams = document.getElementById('loraParams');
                if (e.target.value === 'full') {
                    loraParams.style.display = 'none';
                } else {
                    loraParams.style.display = 'flex';
                }
            });
        });
    }

    async checkOllamaStatus() {
        try {
            const response = await fetch('/api/training/status');
            const data = await response.json();
            
            const statusIndicator = document.getElementById('ollamaStatus');
            const statusText = document.getElementById('statusText');
            const quickStartBtn = document.getElementById('quickStartBtn');
            
            if (data.available) {
                statusIndicator.innerHTML = '<i class="bi bi-check-circle-fill status-online"></i>';
                statusText.textContent = 'Ollama is running and ready';
                quickStartBtn.disabled = false;
            } else {
                statusIndicator.innerHTML = '<i class="bi bi-x-circle-fill status-offline"></i>';
                statusText.textContent = data.message || 'Ollama is not available';
                quickStartBtn.disabled = true;
            }
        } catch (error) {
            console.error('Failed to check Ollama status:', error);
            document.getElementById('statusText').textContent = 'Failed to check status';
        }
    }

    async loadAvailableModels() {
        try {
            const response = await fetch('/api/training/models');
            const data = await response.json();
            
            const modelsContainer = document.getElementById('availableModels');
            
            if (data.success && data.models.length > 0) {
                modelsContainer.innerHTML = data.models.map(model => `
                    <div class="model-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${model.name}</strong>
                                <small class="text-muted d-block">${this.formatSize(model.size)}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="trainingInterface.testModel('${model.name}')">
                                Test
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                modelsContainer.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="bi bi-inbox"></i>
                        <p class="mt-2">No models available</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    async loadTrainingJobs() {
        try {
            const response = await fetch('/api/training/jobs');
            const data = await response.json();
            
            const jobsContainer = document.getElementById('trainingJobs');
            
            if (data.success && data.jobs.length > 0) {
                jobsContainer.innerHTML = data.jobs.map(job => `
                    <div class="training-job ${job.status}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${job.job_id.split('_').slice(-1)[0]}</strong>
                                <div class="small text-muted">
                                    Status: ${job.status} | Progress: ${job.progress.toFixed(1)}%
                                </div>
                                <div class="small text-muted">
                                    Epoch: ${job.current_epoch}/${job.total_epochs}
                                    ${job.loss > 0 ? `| Loss: ${job.loss.toFixed(4)}` : ''}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-info" onclick="trainingInterface.viewJobDetails('${job.job_id}')">
                                View
                            </button>
                        </div>
                        ${job.status === 'running' ? `
                            <div class="progress mt-2" style="height: 4px;">
                                <div class="progress-bar" style="width: ${job.progress}%"></div>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                jobsContainer.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="bi bi-inbox display-4"></i>
                        <p class="mt-2">No training jobs yet</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load training jobs:', error);
        }
    }

    async startTraining() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            const startBtn = document.getElementById('startTrainingBtn');
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Starting...';

            const response = await fetch('/api/training/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.currentJobId = data.job_id;
                this.showTrainingProgress(data.job_id);
                this.showAlert('success', `Training started successfully! Job ID: ${data.job_id}`);
                this.loadTrainingJobs(); // Refresh jobs list
            } else {
                this.showAlert('danger', `Failed to start training: ${data.error}`);
            }
        } catch (error) {
            console.error('Training start error:', error);
            this.showAlert('danger', `Error starting training: ${error.message}`);
        } finally {
            const startBtn = document.getElementById('startTrainingBtn');
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start Training';
        }
    }

    getFormData() {
        const form = document.getElementById('trainingForm');
        const formData = new FormData(form);
        
        return {
            model_name: formData.get('modelName') || document.getElementById('modelName').value,
            base_model: document.getElementById('baseModel').value,
            training_type: document.querySelector('input[name="trainingType"]:checked').value,
            epochs: parseInt(document.getElementById('epochs').value),
            learning_rate: parseFloat(document.getElementById('learningRate').value),
            batch_size: parseInt(document.getElementById('batchSize').value),
            max_length: parseInt(document.getElementById('maxLength').value),
            lora_rank: parseInt(document.getElementById('loraRank').value),
            lora_alpha: parseInt(document.getElementById('loraAlpha').value),
            lora_dropout: parseFloat(document.getElementById('loraDropout').value),
            dataset: document.querySelector('input[name="datasetType"]:checked').value === 'sample' 
                ? document.getElementById('sampleDatasetSelect').value 
                : 'custom'
        };
    }

    validateForm(formData) {
        if (!formData.model_name) {
            this.showAlert('warning', 'Please enter a model name');
            return false;
        }
        
        if (!formData.base_model) {
            this.showAlert('warning', 'Please select a base model');
            return false;
        }
        
        return true;
    }

    showTrainingProgress(jobId) {
        document.getElementById('currentJobId').textContent = jobId;
        document.getElementById('currentStatus').textContent = 'Starting...';
        document.getElementById('progressPercent').textContent = '0%';
        document.getElementById('progressBar').style.width = '0%';
        
        this.progressModal.show();
        
        // Start progress monitoring
        this.progressInterval = setInterval(() => {
            this.updateTrainingProgress(jobId);
        }, 2000);
    }

    async updateTrainingProgress(jobId) {
        try {
            const response = await fetch(`/api/training/jobs/${jobId}/status`);
            const data = await response.json();
            
            if (data.success) {
                const job = data;
                
                document.getElementById('currentStatus').textContent = job.status;
                document.getElementById('currentEpoch').textContent = `${job.current_epoch}/${job.total_epochs}`;
                document.getElementById('currentLoss').textContent = job.loss > 0 ? job.loss.toFixed(4) : '-';
                document.getElementById('progressPercent').textContent = `${job.progress.toFixed(1)}%`;
                document.getElementById('progressBar').style.width = `${job.progress}%`;
                
                // Update log
                const logElement = document.getElementById('trainingLog');
                if (job.status === 'running') {
                    logElement.innerHTML += `\n[${new Date().toLocaleTimeString()}] Epoch ${job.current_epoch}/${job.total_epochs} - Loss: ${job.loss.toFixed(4)}`;
                    logElement.scrollTop = logElement.scrollHeight;
                }
                
                // Check if training is complete
                if (job.status === 'completed') {
                    clearInterval(this.progressInterval);
                    document.getElementById('testModelBtn').disabled = false;
                    this.showAlert('success', 'Training completed successfully!');
                    this.loadTrainingJobs();
                    this.loadAvailableModels();
                } else if (job.status === 'failed') {
                    clearInterval(this.progressInterval);
                    this.showAlert('danger', `Training failed: ${job.error_message || 'Unknown error'}`);
                    this.loadTrainingJobs();
                }
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    }

    async quickStartDemo() {
        try {
            const response = await fetch('/api/training/quick-start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'demo' })
            });

            const data = await response.json();

            if (data.success) {
                this.currentJobId = data.job_id;
                this.showTrainingProgress(data.job_id);
                this.showAlert('info', `Demo training started! Estimated time: ${data.estimated_time}`);
            } else {
                this.showAlert('danger', `Failed to start demo: ${data.error}`);
            }
        } catch (error) {
            console.error('Quick start error:', error);
            this.showAlert('danger', `Error starting demo: ${error.message}`);
        }
    }

    loadPreset(presetType) {
        const presets = {
            demo: {
                modelName: `demo_model_${Date.now()}`,
                baseModel: 'llama3.1',
                trainingType: 'lora',
                epochs: 1,
                learningRate: 0.0001,
                batchSize: 2,
                maxLength: 256,
                loraRank: 8,
                loraAlpha: 16
            }
        };

        const preset = presets[presetType];
        if (preset) {
            document.getElementById('modelName').value = preset.modelName;
            document.getElementById('baseModel').value = preset.baseModel;
            document.querySelector(`input[value="${preset.trainingType}"]`).checked = true;
            document.getElementById('epochs').value = preset.epochs;
            document.getElementById('learningRate').value = preset.learningRate;
            document.getElementById('batchSize').value = preset.batchSize;
            document.getElementById('maxLength').value = preset.maxLength;
            document.getElementById('loraRank').value = preset.loraRank;
            document.getElementById('loraAlpha').value = preset.loraAlpha;
        }
    }

    resetForm() {
        document.getElementById('trainingForm').reset();
        document.getElementById('datasetFile').disabled = true;
        document.getElementById('sampleDatasetSelect').disabled = false;
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    showAlert(type, message) {
        // Create and show Bootstrap alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Global functions
function refreshStatus() {
    trainingInterface.checkOllamaStatus();
    trainingInterface.loadAvailableModels();
    trainingInterface.loadTrainingJobs();
}

function quickStartDemo() {
    trainingInterface.quickStartDemo();
}

function resetForm() {
    trainingInterface.resetForm();
}

function loadPreset(type) {
    trainingInterface.loadPreset(type);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.trainingInterface = new OllamaTrainingInterface();
});
