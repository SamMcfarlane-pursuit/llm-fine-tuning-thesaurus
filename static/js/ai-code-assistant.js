/**
 * AI-Powered Code Assistant
 * Provides intelligent code suggestions, explanations, and debugging assistance
 */

class AICodeAssistant {
    constructor() {
        this.isActive = false;
        this.currentContext = null;
        this.codeHistory = [];
        this.suggestions = [];
        this.init();
    }

    init() {
        this.createAssistantUI();
        this.setupCodeEditorIntegration();
        this.setupEventListeners();
        this.loadCodeTemplates();
        this.initializeIntelliSense();
    }

    createAssistantUI() {
        const assistantHTML = `
            <div id="ai-code-assistant" class="ai-assistant-panel">
                <div class="assistant-header">
                    <h5><i class="bi bi-robot"></i> AI Code Assistant</h5>
                    <button class="btn btn-sm btn-outline-light" id="toggle-assistant">
                        <i class="bi bi-chevron-down"></i>
                    </button>
                </div>
                <div class="assistant-content">
                    <div class="assistant-tabs">
                        <button class="tab-btn active" data-tab="suggestions">Suggestions</button>
                        <button class="tab-btn" data-tab="explain">Explain</button>
                        <button class="tab-btn" data-tab="debug">Debug</button>
                        <button class="tab-btn" data-tab="optimize">Optimize</button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="suggestions-tab" class="tab-pane active">
                            <div class="suggestions-list"></div>
                            <div class="quick-actions">
                                <button class="btn btn-sm btn-primary" onclick="aiAssistant.generateBoilerplate()">
                                    <i class="bi bi-code-square"></i> Generate Boilerplate
                                </button>
                                <button class="btn btn-sm btn-success" onclick="aiAssistant.autoComplete()">
                                    <i class="bi bi-lightning"></i> Auto Complete
                                </button>
                            </div>
                        </div>
                        
                        <div id="explain-tab" class="tab-pane">
                            <div class="explanation-content">
                                <p>Select code to get AI-powered explanations</p>
                                <div class="explanation-result"></div>
                            </div>
                        </div>
                        
                        <div id="debug-tab" class="tab-pane">
                            <div class="debug-content">
                                <div class="error-analysis"></div>
                                <div class="debug-suggestions"></div>
                            </div>
                        </div>
                        
                        <div id="optimize-tab" class="tab-pane">
                            <div class="optimization-content">
                                <div class="performance-tips"></div>
                                <div class="code-improvements"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to page if not exists
        if (!document.getElementById('ai-code-assistant')) {
            document.body.insertAdjacentHTML('beforeend', assistantHTML);
        }
    }

    setupCodeEditorIntegration() {
        // Monitor all code blocks and text areas
        const codeElements = document.querySelectorAll('textarea, .code-editor, pre code');
        
        codeElements.forEach(element => {
            this.enhanceCodeElement(element);
        });

        // Watch for dynamically added code elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const codeElements = node.querySelectorAll('textarea, .code-editor, pre code');
                        codeElements.forEach(el => this.enhanceCodeElement(el));
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    enhanceCodeElement(element) {
        // Add AI assistance features to code elements
        element.addEventListener('input', (e) => {
            this.analyzeCode(e.target.value, e.target);
        });

        element.addEventListener('selectionchange', (e) => {
            this.handleCodeSelection(e.target);
        });

        element.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Add context menu for AI features
        element.addEventListener('contextmenu', (e) => {
            this.showContextMenu(e);
        });
    }

    analyzeCode(code, element) {
        if (!code || code.length < 10) return;

        this.currentContext = {
            code: code,
            element: element,
            language: this.detectLanguage(code),
            timestamp: Date.now()
        };

        // Real-time analysis
        this.performSyntaxCheck(code);
        this.generateSuggestions(code);
        this.checkForCommonIssues(code);
    }

    detectLanguage(code) {
        // Simple language detection based on patterns
        if (code.includes('import torch') || code.includes('from transformers')) return 'python';
        if (code.includes('function') && code.includes('{')) return 'javascript';
        if (code.includes('#include') || code.includes('int main')) return 'cpp';
        if (code.includes('def ') || code.includes('import ')) return 'python';
        return 'text';
    }

    generateSuggestions(code) {
        const suggestions = [];
        const language = this.detectLanguage(code);

        if (language === 'python') {
            suggestions.push(...this.getPythonSuggestions(code));
        }

        // LLM Fine-tuning specific suggestions
        if (code.includes('LoRA') || code.includes('lora')) {
            suggestions.push({
                type: 'enhancement',
                title: 'LoRA Configuration Optimization',
                description: 'Consider adjusting rank and alpha parameters for better performance',
                code: 'config = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"])',
                priority: 'medium'
            });
        }

        if (code.includes('transformers') && !code.includes('AutoTokenizer')) {
            suggestions.push({
                type: 'import',
                title: 'Missing Tokenizer Import',
                description: 'Add AutoTokenizer for text processing',
                code: 'from transformers import AutoTokenizer',
                priority: 'high'
            });
        }

        this.displaySuggestions(suggestions);
    }

    getPythonSuggestions(code) {
        const suggestions = [];

        // Check for common patterns and suggest improvements
        if (code.includes('for i in range(len(')) {
            suggestions.push({
                type: 'optimization',
                title: 'Use enumerate() instead of range(len())',
                description: 'More Pythonic and efficient iteration',
                code: 'for i, item in enumerate(items):',
                priority: 'medium'
            });
        }

        if (code.includes('open(') && !code.includes('with ')) {
            suggestions.push({
                type: 'best_practice',
                title: 'Use context manager for file operations',
                description: 'Ensures proper file closure',
                code: 'with open(filename, "r") as file:',
                priority: 'high'
            });
        }

        return suggestions;
    }

    displaySuggestions(suggestions) {
        const container = document.querySelector('.suggestions-list');
        if (!container) return;

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item priority-${suggestion.priority}">
                <div class="suggestion-header">
                    <span class="suggestion-type">${suggestion.type}</span>
                    <span class="suggestion-priority">${suggestion.priority}</span>
                </div>
                <h6>${suggestion.title}</h6>
                <p>${suggestion.description}</p>
                ${suggestion.code ? `
                    <div class="suggestion-code">
                        <code>${suggestion.code}</code>
                        <button class="btn btn-sm btn-outline-primary" onclick="aiAssistant.applySuggestion('${suggestion.code}')">
                            Apply
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    explainCode(selectedCode) {
        if (!selectedCode) return;

        const explanations = this.generateExplanation(selectedCode);
        const container = document.querySelector('.explanation-result');
        
        if (container) {
            container.innerHTML = `
                <div class="code-explanation">
                    <h6>Code Explanation</h6>
                    <div class="explanation-text">${explanations.overview}</div>
                    
                    ${explanations.breakdown ? `
                        <div class="code-breakdown">
                            <h6>Line-by-line breakdown:</h6>
                            ${explanations.breakdown.map(line => `
                                <div class="line-explanation">
                                    <code>${line.code}</code>
                                    <p>${line.explanation}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${explanations.concepts ? `
                        <div class="related-concepts">
                            <h6>Related Concepts:</h6>
                            <div class="concept-tags">
                                ${explanations.concepts.map(concept => `
                                    <span class="concept-tag" onclick="aiAssistant.explainConcept('${concept}')">${concept}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }

    generateExplanation(code) {
        // AI-powered code explanation logic
        const language = this.detectLanguage(code);
        
        if (code.includes('LoraConfig')) {
            return {
                overview: 'This code configures LoRA (Low-Rank Adaptation) parameters for efficient fine-tuning of large language models.',
                breakdown: [
                    { code: 'r=16', explanation: 'Rank parameter - controls the dimensionality of the low-rank matrices' },
                    { code: 'lora_alpha=32', explanation: 'Scaling parameter - typically set to 2x the rank value' },
                    { code: 'target_modules', explanation: 'Specifies which model layers to apply LoRA to' }
                ],
                concepts: ['LoRA', 'Fine-tuning', 'Low-rank matrices', 'Parameter efficiency']
            };
        }

        if (code.includes('AutoModelForCausalLM')) {
            return {
                overview: 'This loads a pre-trained causal language model from Hugging Face transformers library.',
                concepts: ['Transformers', 'Causal LM', 'Pre-trained models', 'Hugging Face']
            };
        }

        return {
            overview: 'This is a code snippet that performs specific operations. Select specific parts for detailed explanations.',
            concepts: []
        };
    }

    debugCode(code) {
        const issues = this.findCodeIssues(code);
        const container = document.querySelector('.debug-suggestions');
        
        if (container) {
            container.innerHTML = issues.map(issue => `
                <div class="debug-issue severity-${issue.severity}">
                    <div class="issue-header">
                        <i class="bi bi-exclamation-triangle"></i>
                        <span class="issue-type">${issue.type}</span>
                    </div>
                    <h6>${issue.title}</h6>
                    <p>${issue.description}</p>
                    ${issue.fix ? `
                        <div class="suggested-fix">
                            <strong>Suggested fix:</strong>
                            <code>${issue.fix}</code>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    }

    findCodeIssues(code) {
        const issues = [];

        // Check for common Python issues
        if (code.includes('except:') && !code.includes('except Exception:')) {
            issues.push({
                type: 'best_practice',
                severity: 'warning',
                title: 'Bare except clause',
                description: 'Using bare except can catch system exits and keyboard interrupts',
                fix: 'except Exception as e:'
            });
        }

        if (code.includes('print(') && code.includes('f"')) {
            // This is actually good, but let's check for other patterns
        }

        // Check for LLM-specific issues
        if (code.includes('model.train()') && !code.includes('model.eval()')) {
            issues.push({
                type: 'logic',
                severity: 'warning',
                title: 'Missing evaluation mode',
                description: 'Remember to set model to eval mode for inference',
                fix: 'model.eval()'
            });
        }

        return issues;
    }

    generateBoilerplate() {
        const templates = {
            'lora_setup': `
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load model and tokenizer
model = AutoModelForCausalLM.from_pretrained("model_name")
tokenizer = AutoTokenizer.from_pretrained("model_name")

# Configure LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM"
)

# Apply LoRA
model = get_peft_model(model, lora_config)
            `,
            'training_loop': `
from torch.optim import AdamW
from torch.utils.data import DataLoader

# Setup optimizer
optimizer = AdamW(model.parameters(), lr=5e-5)

# Training loop
model.train()
for epoch in range(num_epochs):
    for batch in dataloader:
        optimizer.zero_grad()
        outputs = model(**batch)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
            `
        };

        this.showTemplateSelector(templates);
    }

    showTemplateSelector(templates) {
        const modal = document.createElement('div');
        modal.className = 'template-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h5>Select Code Template</h5>
                <div class="template-list">
                    ${Object.entries(templates).map(([key, code]) => `
                        <div class="template-item" onclick="aiAssistant.insertTemplate('${key}')">
                            <h6>${key.replace('_', ' ').toUpperCase()}</h6>
                            <pre><code>${code.trim()}</code></pre>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    insertTemplate(templateKey) {
        // Insert template into active code editor
        const activeEditor = document.activeElement;
        if (activeEditor && (activeEditor.tagName === 'TEXTAREA' || activeEditor.contentEditable)) {
            // Implementation to insert template
            console.log('Inserting template:', templateKey);
        }
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Toggle assistant
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toggle-assistant') {
                this.toggleAssistant();
            }
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    toggleAssistant() {
        const assistant = document.getElementById('ai-code-assistant');
        assistant.classList.toggle('collapsed');
    }
}

// Initialize AI Code Assistant
let aiAssistant;
document.addEventListener('DOMContentLoaded', () => {
    aiAssistant = new AICodeAssistant();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AICodeAssistant;
}
