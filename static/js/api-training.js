/**
 * API Training & Management Interface - Visual LLM Platform
 * Comprehensive provider management and smart query routing
 */

class APITrainingInterface {
    constructor() {
        this.providers = {};
        this.queryHistory = [];
        this.currentRecommendations = [];
        
        this.init();
    }

    init() {
        // Load initial data
        this.loadProviders();
        this.loadRecommendations();
        this.loadQueryHistory();
        
        // Set up auto-refresh
        setInterval(() => this.loadProviders(), 30000);
        
        console.log('🚀 API Training Interface initialized');
    }

    async loadProviders() {
        try {
            const response = await fetch('/api/enhanced/providers');
            const data = await response.json();
            
            if (data.success) {
                this.providers = data.providers;
                this.renderProviders();
                this.updateStats(data);
            }
        } catch (error) {
            console.error('Failed to load providers:', error);
            this.showAlert('danger', 'Failed to load provider information');
        }
    }

    renderProviders() {
        const grid = document.getElementById('providersGrid');
        
        grid.innerHTML = Object.entries(this.providers).map(([name, provider]) => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="provider-card ${provider.enabled ? 'enabled' : 'disabled'}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                <span class="provider-status ${provider.enabled ? 'online' : 'offline'}"></span>
                                ${this.formatProviderName(name)}
                            </h6>
                            <small class="text-muted">${provider.models.length} models available</small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="apiInterface.configureProvider('${name}')">
                            <i class="bi bi-gear"></i>
                        </button>
                    </div>
                    
                    <div class="mb-2">
                        <div class="small">
                            <strong>Cost:</strong> ${provider.cost_per_token === 0 ? 'Free' : `$${provider.cost_per_token}/token`}
                        </div>
                        <div class="small">
                            <strong>Rate Limit:</strong> ${provider.rate_limit}/min
                        </div>
                    </div>
                    
                    ${provider.usage_stats && Object.keys(provider.usage_stats).length > 0 ? `
                        <div class="small text-muted">
                            <div>Requests: ${provider.usage_stats.requests || 0}</div>
                            <div>Tokens: ${provider.usage_stats.tokens || 0}</div>
                            <div>Cost: $${(provider.usage_stats.cost || 0).toFixed(4)}</div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-2">
                        ${provider.models.slice(0, 2).map(model => `
                            <span class="badge bg-secondary me-1">${model}</span>
                        `).join('')}
                        ${provider.models.length > 2 ? `<span class="badge bg-light text-dark">+${provider.models.length - 2}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats(data) {
        document.getElementById('totalProviders').textContent = data.total_providers;
        document.getElementById('activeProviders').textContent = data.enabled_providers;
        
        // Calculate total requests and cost
        let totalRequests = 0;
        let totalCost = 0;
        
        Object.values(this.providers).forEach(provider => {
            if (provider.usage_stats) {
                totalRequests += provider.usage_stats.requests || 0;
                totalCost += provider.usage_stats.cost || 0;
            }
        });
        
        document.getElementById('totalRequests').textContent = totalRequests;
        document.getElementById('totalCost').textContent = totalCost.toFixed(4);
    }

    async loadRecommendations() {
        const useCase = document.getElementById('useCaseSelect').value;
        
        try {
            const response = await fetch(`/api/enhanced/recommendations?use_case=${useCase}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentRecommendations = data.recommended_providers;
                this.renderRecommendations(data);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }
    }

    renderRecommendations(data) {
        const container = document.getElementById('recommendationsContent');
        
        container.innerHTML = `
            <div class="mb-3">
                <h6>For ${data.use_case.replace('_', ' ')} use case:</h6>
            </div>
            ${data.recommended_providers.map((provider, index) => `
                <div class="recommendation-item ${index === 0 ? 'recommended' : ''}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${this.formatProviderName(provider)}</strong>
                            ${index === 0 ? '<span class="badge bg-primary ms-2">Recommended</span>' : ''}
                        </div>
                        <button class="btn btn-sm btn-outline-success" onclick="apiInterface.useProvider('${provider}')">
                            Use
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    async sendSmartQuery() {
        const message = document.getElementById('queryInput').value.trim();
        
        if (!message) {
            this.showAlert('warning', 'Please enter a question');
            return;
        }

        const preferences = {
            cost: document.getElementById('costPriority').value,
            speed: document.getElementById('speedPriority').value,
            quality: document.getElementById('qualityPriority').value
        };

        const sendBtn = document.getElementById('sendQueryBtn');
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';

        try {
            const response = await fetch('/api/enhanced/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    preferences: preferences
                })
            });

            const data = await response.json();

            if (data.success) {
                this.displayResponse(data);
                this.addToHistory(message, data);
            } else {
                this.showAlert('danger', `Query failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Query error:', error);
            this.showAlert('danger', `Error: ${error.message}`);
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="bi bi-send-fill"></i> Send Smart Query';
        }
    }

    displayResponse(data) {
        const responseArea = document.getElementById('responseArea');
        responseArea.classList.remove('d-none');

        document.getElementById('responseProvider').textContent = data.provider;
        document.getElementById('responseModel').textContent = data.model;
        document.getElementById('responseContent').innerHTML = this.formatResponse(data.response);
        document.getElementById('responseTokens').textContent = data.tokens_used;
        document.getElementById('responseCost').textContent = data.cost.toFixed(6);
        document.getElementById('responseLatency').textContent = Math.round(data.latency * 1000);

        // Scroll to response
        responseArea.scrollIntoView({ behavior: 'smooth' });
    }

    formatResponse(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-dark text-light p-3 rounded"><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code class="bg-light px-1 rounded">$1</code>')
            .replace(/\n/g, '<br>');
    }

    addToHistory(query, response) {
        this.queryHistory.unshift({
            query: query,
            provider: response.provider,
            model: response.model,
            timestamp: new Date(),
            cost: response.cost
        });

        // Keep only last 10 queries
        this.queryHistory = this.queryHistory.slice(0, 10);
        this.renderQueryHistory();
    }

    renderQueryHistory() {
        const container = document.getElementById('queryHistory');
        
        if (this.queryHistory.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-inbox"></i>
                    <p class="mt-2">No queries yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.queryHistory.map(item => `
            <div class="query-history-item" onclick="apiInterface.loadHistoryQuery('${item.query.replace(/'/g, "\\'")}')">
                <div class="small">
                    <strong>${item.query.substring(0, 50)}${item.query.length > 50 ? '...' : ''}</strong>
                </div>
                <div class="small text-muted">
                    ${item.provider} • ${item.model} • $${item.cost.toFixed(4)}
                </div>
                <div class="small text-muted">
                    ${item.timestamp.toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    loadHistoryQuery(query) {
        document.getElementById('queryInput').value = query;
    }

    loadQueryHistory() {
        // Load from localStorage if available
        const stored = localStorage.getItem('api_query_history');
        if (stored) {
            try {
                this.queryHistory = JSON.parse(stored).map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                this.renderQueryHistory();
            } catch (e) {
                console.warn('Failed to load query history:', e);
            }
        }
    }

    saveQueryHistory() {
        try {
            localStorage.setItem('api_query_history', JSON.stringify(this.queryHistory));
        } catch (e) {
            console.warn('Failed to save query history:', e);
        }
    }

    configureProvider(providerName) {
        const provider = this.providers[providerName];
        if (!provider) return;

        document.getElementById('providerName').value = this.formatProviderName(providerName);
        document.getElementById('baseUrl').value = provider.base_url || '';
        document.getElementById('enableProvider').checked = provider.enabled;

        const modal = new bootstrap.Modal(document.getElementById('apiConfigModal'));
        modal.show();
    }

    useProvider(providerName) {
        // Set preferences to favor this provider
        const preferences = this.getProviderPreferences(providerName);
        
        document.getElementById('costPriority').value = preferences.cost;
        document.getElementById('speedPriority').value = preferences.speed;
        document.getElementById('qualityPriority').value = preferences.quality;

        this.showAlert('info', `Preferences updated to favor ${this.formatProviderName(providerName)}`);
    }

    getProviderPreferences(providerName) {
        const preferencesMap = {
            'ollama': { cost: 'low', speed: 'medium', quality: 'medium' },
            'groq': { cost: 'low', speed: 'high', quality: 'high' },
            'openai': { cost: 'high', speed: 'medium', quality: 'high' },
            'anthropic': { cost: 'high', speed: 'medium', quality: 'high' },
            'huggingface': { cost: 'low', speed: 'low', quality: 'medium' }
        };
        
        return preferencesMap[providerName] || { cost: 'medium', speed: 'medium', quality: 'medium' };
    }

    formatProviderName(name) {
        const nameMap = {
            'ollama': 'Ollama (Local)',
            'openai': 'OpenAI',
            'anthropic': 'Anthropic Claude',
            'groq': 'Groq',
            'huggingface': 'Hugging Face',
            'together': 'Together AI'
        };
        
        return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
    }

    clearQuery() {
        document.getElementById('queryInput').value = '';
        document.getElementById('responseArea').classList.add('d-none');
    }

    copyResponse() {
        const content = document.getElementById('responseContent').textContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showAlert('success', 'Response copied to clipboard');
        });
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Global functions
function sendSmartQuery() {
    apiInterface.sendSmartQuery();
}

function clearQuery() {
    apiInterface.clearQuery();
}

function copyResponse() {
    apiInterface.copyResponse();
}

function loadRecommendations() {
    apiInterface.loadRecommendations();
}

function loadExample(type) {
    const examples = {
        'lora': 'What is LoRA fine-tuning and how does it work?',
        'qlora': 'Explain QLoRA and its advantages over regular LoRA',
        'comparison': 'Compare LoRA vs QLoRA vs full fine-tuning with pros and cons',
        'implementation': 'Show me a complete LoRA implementation example with code'
    };
    
    document.getElementById('queryInput').value = examples[type] || '';
}

function saveApiConfig() {
    // This would save API configuration
    apiInterface.showAlert('info', 'API configuration saved (demo mode)');
    bootstrap.Modal.getInstance(document.getElementById('apiConfigModal')).hide();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.apiInterface = new APITrainingInterface();
});
