/**
 * Unified AI Assistant
 * Connects AI learning assistant and AI bot functionality
 * Provides seamless integration between learning guidance and general AI assistance
 */

class UnifiedAIAssistant {
    constructor() {
        this.isInitialized = false;
        this.isOpen = false;
        this.conversationHistory = [];
        this.learningContext = null;
        this.currentMode = 'general'; // 'general', 'learning', 'code'
        this.isTyping = false;
        this.voiceEnabled = false;
        this.autoSpeak = false;
        this.knowledgeBase = {
            llm_concepts: ['LoRA', 'QLoRA', 'PEFT', 'fine-tuning', 'parameter-efficient'],
            navigation: ['learn', 'workshops', 'tutorials', 'analytics', 'guides'],
            features: ['voice', 'code-assistance', 'learning-paths', 'progress-tracking']
        };
        this.init();
    }

    init() {
        console.log('🚀 Initializing Unified AI Assistant...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createInterface());
        } else {
            this.createInterface();
        }
    }

    createInterface() {
        // Remove any existing AI assistants to prevent conflicts
        this.cleanupExistingAssistants();

        // Create the unified interface
        this.createButton();
        this.createChatInterface();

        this.isInitialized = true;
        console.log('✅ Unified AI Assistant initialized successfully!');
    }

    cleanupExistingAssistants() {
        const existingElements = document.querySelectorAll(`
            .final-ai-button, .final-ai-interface,
            .working-ai-button, .working-ai-interface,
            .ai-assistant-button, .ai-assistant-container,
            .ai-learning-assistant, .ai-code-assistant,
            .help-button, .ai-floating-container
        `);

        existingElements.forEach(el => {
            console.log('🗑️ Removing existing AI element:', el.className);
            el.remove();
        });
    }

    createButton() {
        const button = document.createElement('button');
        button.className = 'unified-ai-button';
        button.innerHTML = '🤖';
        button.title = 'Open AI Learning Assistant';

        // Enhanced styling with green theme
        button.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            width: 60px !important;
            height: 60px !important;
            background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
            border: none !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 24px !important;
            cursor: pointer !important;
            box-shadow: 0 8px 32px rgba(60, 100, 48, 0.3) !important;
            transition: all 0.3s ease !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        `;

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.05)';
            button.style.boxShadow = '0 12px 40px rgba(60, 100, 48, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 8px 32px rgba(60, 100, 48, 0.3)';
        });

        // Click handler
        button.addEventListener('click', () => {
            console.log('🤖 Unified AI Assistant button clicked!');
            this.toggleInterface();
        });

        document.body.appendChild(button);
        console.log('✅ Unified AI Button created');
    }

    createChatInterface() {
        const interface = document.createElement('div');
        interface.className = 'unified-ai-interface';
        interface.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            width: 420px !important;
            height: 600px !important;
            background: #1a1a1a !important;
            border: 1px solid #3c6430 !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
            display: none !important;
            flex-direction: column !important;
            z-index: 10000 !important;
            overflow: hidden !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;

        interface.innerHTML = this.getInterfaceHTML();
        document.body.appendChild(interface);

        // Set up event listeners
        this.setupEventListeners();

        console.log('✅ Unified AI Interface created');
    }

    getInterfaceHTML() {
        return `
            <div class="ai-header" style="
                background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
                color: #ffffff !important;
                padding: 16px 20px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                border-radius: 16px 16px 0 0 !important;
            ">
                <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
                    <div style="
                        width: 32px !important;
                        height: 32px !important;
                        background: rgba(255, 255, 255, 0.2) !important;
                        border-radius: 50% !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: 16px !important;
                    ">🤖</div>
                    <div>
                        <h4 style="margin: 0 !important; font-weight: 600 !important; font-size: 18px !important;">AI Learning Assistant</h4>
                        <div style="font-size: 12px !important; opacity: 0.8 !important;" id="ai-mode-indicator">General Mode</div>
                    </div>
                </div>
                <div style="display: flex !important; gap: 8px !important;">
                    <button onclick="unifiedAI.toggleMode()" style="
                        background: rgba(255, 255, 255, 0.2) !important;
                        border: none !important;
                        color: white !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                    " title="Switch mode">🔄</button>
                    <button onclick="unifiedAI.closeInterface()" style="
                        background: rgba(255, 255, 255, 0.2) !important;
                        border: none !important;
                        color: white !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 6px !important;
                        cursor: pointer !important;
                        font-size: 16px !important;
                    " title="Close">✕</button>
                </div>
            </div>

            <div class="ai-mode-selector" style="
                background: #2a2a2a !important;
                padding: 12px 20px !important;
                border-bottom: 1px solid #444 !important;
                display: flex !important;
                gap: 8px !important;
            ">
                <button onclick="unifiedAI.setMode('general')" class="mode-btn active" data-mode="general" style="
                    background: #3c6430 !important;
                    color: white !important;
                    border: none !important;
                    padding: 6px 12px !important;
                    border-radius: 12px !important;
                    font-size: 12px !important;
                    cursor: pointer !important;
                ">💬 General</button>
                <button onclick="unifiedAI.setMode('learning')" class="mode-btn" data-mode="learning" style="
                    background: #444 !important;
                    color: #ccc !important;
                    border: none !important;
                    padding: 6px 12px !important;
                    border-radius: 12px !important;
                    font-size: 12px !important;
                    cursor: pointer !important;
                ">📚 Learning</button>
                <button onclick="unifiedAI.setMode('code')" class="mode-btn" data-mode="code" style="
                    background: #444 !important;
                    color: #ccc !important;
                    border: none !important;
                    padding: 6px 12px !important;
                    border-radius: 12px !important;
                    font-size: 12px !important;
                    cursor: pointer !important;
                ">💻 Code</button>
            </div>

            <div id="ai-conversation" style="
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 20px !important;
                background: #1a1a1a !important;
            ">
                <div class="welcome-message" style="
                    background: transparent !important;
                    color: #ffffff !important;
                    padding: 0 !important;
                    margin-bottom: 20px !important;
                    line-height: 1.6 !important;
                    font-size: 14px !important;
                ">
                    <p style="margin: 0 !important;">🎓 <strong>Welcome to your AI Learning Assistant!</strong></p>
                    <p style="margin: 8px 0 0 0 !important;">I can help you with LLM fine-tuning, navigation, code examples, and learning guidance. Switch modes above for specialized assistance!</p>
                </div>
            </div>

            <div class="ai-input-area" style="
                padding: 20px !important;
                border-top: 1px solid #444 !important;
                background: #1a1a1a !important;
            ">
                <div style="display: flex !important; gap: 12px !important; align-items: flex-end !important;">
                    <textarea id="ai-input" placeholder="Ask me anything about LLM fine-tuning..." style="
                        flex: 1 !important;
                        background: #2a2a2a !important;
                        border: 1px solid #3c6430 !important;
                        border-radius: 12px !important;
                        padding: 12px 16px !important;
                        color: #ffffff !important;
                        resize: none !important;
                        min-height: 44px !important;
                        max-height: 120px !important;
                        font-size: 14px !important;
                        font-family: inherit !important;
                    "></textarea>
                    <button onclick="unifiedAI.sendMessage()" style="
                        background: #3c6430 !important;
                        color: white !important;
                        border: none !important;
                        width: 44px !important;
                        height: 44px !important;
                        border-radius: 12px !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        transition: all 0.2s ease !important;
                        font-size: 16px !important;
                    " title="Send message">➤</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Enter key listener for input
        const input = document.getElementById('ai-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Auto-resize textarea
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }
    }

    toggleInterface() {
        const interface = document.querySelector('.unified-ai-interface');
        if (interface) {
            if (interface.style.display === 'none' || interface.style.display === '') {
                interface.style.display = 'flex';
                this.isOpen = true;
                console.log('✅ Unified AI Interface opened');

                // Focus input and detect learning context
                setTimeout(() => {
                    const input = document.getElementById('ai-input');
                    if (input) input.focus();
                    this.detectLearningContext();
                }, 300);
            } else {
                this.closeInterface();
            }
        }
    }

    closeInterface() {
        const interface = document.querySelector('.unified-ai-interface');
        if (interface) {
            interface.style.display = 'none';
            this.isOpen = false;
            console.log('✅ Unified AI Interface closed');
        }
    }

    detectLearningContext() {
        // Detect current page context for intelligent assistance
        const currentPath = window.location.pathname;
        const pageTitle = document.title;

        if (currentPath.includes('/learn') || currentPath.includes('/tutorial')) {
            this.learningContext = 'learning';
            this.setMode('learning');
        } else if (currentPath.includes('/workshop') || currentPath.includes('/exercise')) {
            this.learningContext = 'code';
            this.setMode('code');
        } else {
            this.learningContext = 'general';
        }

        // Update suggestions based on context
        this.updateSuggestions();
    }

    setMode(mode) {
        this.currentMode = mode;

        // Update mode indicator
        const indicator = document.getElementById('ai-mode-indicator');
        if (indicator) {
            const modeNames = {
                'general': 'General Mode',
                'learning': 'Learning Mode',
                'code': 'Code Assistant Mode'
            };
            indicator.textContent = modeNames[mode] || 'General Mode';
        }

        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.style.background = '#3c6430';
                btn.style.color = 'white';
                btn.classList.add('active');
            } else {
                btn.style.background = '#444';
                btn.style.color = '#ccc';
                btn.classList.remove('active');
            }
        });

        // Update input placeholder
        const input = document.getElementById('ai-input');
        if (input) {
            const placeholders = {
                'general': 'Ask me anything about this platform...',
                'learning': 'Ask about LLM concepts, LoRA, fine-tuning...',
                'code': 'Ask for code examples, implementation help...'
            };
            input.placeholder = placeholders[mode] || placeholders['general'];
        }

        console.log(`🔄 Switched to ${mode} mode`);
    }

    toggleMode() {
        const modes = ['general', 'learning', 'code'];
        const currentIndex = modes.indexOf(this.currentMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        this.setMode(nextMode);
    }

    updateSuggestions() {
        // Add contextual suggestions based on current mode and page
        const suggestions = this.getContextualSuggestions();
        // Implementation for dynamic suggestions can be added here
    }

    getContextualSuggestions() {
        const suggestions = {
            'general': [
                'What is this platform about?',
                'How do I navigate this website?',
                'What features are available?'
            ],
            'learning': [
                'What is LoRA fine-tuning?',
                'How does QLoRA work?',
                'Show me parameter-efficient methods',
                'Explain the difference between full and PEFT'
            ],
            'code': [
                'Show me a LoRA implementation example',
                'How do I set up the training environment?',
                'What are the best practices for fine-tuning?',
                'Help me debug my training code'
            ]
        };

        return suggestions[this.currentMode] || suggestions['general'];
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';
        input.style.height = 'auto';

        console.log(`📤 Sending message in ${this.currentMode} mode:`, message);

        // Add user message to conversation
        this.addMessage(message, 'user');

        // Show typing indicator
        this.addMessage('AI is thinking...', 'assistant', true);

        try {
            // Enhance message with context
            const enhancedMessage = this.enhanceMessageWithContext(message);

            // Send to API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: enhancedMessage,
                    mode: this.currentMode,
                    context: this.learningContext
                })
            });

            // Remove typing indicator
            this.removeTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                this.addMessage(data.response || 'I received your message!', 'assistant');
                console.log('✅ AI response received');
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                console.log('❌ API error:', response.status);
            }
        } catch (error) {
            console.error('❌ Unified AI Assistant Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
        }
    }

    enhanceMessageWithContext(message) {
        // Add context to the message based on current mode and page
        let contextPrefix = '';

        switch (this.currentMode) {
            case 'learning':
                contextPrefix = '[Learning Mode] ';
                break;
            case 'code':
                contextPrefix = '[Code Assistant] ';
                break;
            default:
                contextPrefix = '[General] ';
        }

        // Add page context
        const currentPath = window.location.pathname;
        if (currentPath.includes('/learn')) {
            contextPrefix += '[On Learning Page] ';
        } else if (currentPath.includes('/workshop')) {
            contextPrefix += '[In Workshop] ';
        }

        return contextPrefix + message;
    }

    addMessage(content, sender, isTyping = false) {
        const conversation = document.getElementById('ai-conversation');
        if (!conversation) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        if (isTyping) messageDiv.className += ' typing-indicator';

        messageDiv.style.cssText = `
            margin-bottom: 16px !important;
            padding: ${sender === 'user' ? '12px 16px' : '0'} !important;
            background: ${sender === 'user' ? '#3c6430' : 'transparent'} !important;
            color: #ffffff !important;
            border-radius: ${sender === 'user' ? '20px' : '0'} !important;
            max-width: ${sender === 'user' ? '80%' : '100%'} !important;
            margin-left: ${sender === 'user' ? 'auto' : '0'} !important;
            margin-right: ${sender === 'user' ? '0' : 'auto'} !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
        `;

        messageDiv.innerHTML = `<p style="margin: 0 !important;">${content}</p>`;

        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;

        // Store in conversation history
        if (!isTyping) {
            this.conversationHistory.push({ content, sender, timestamp: Date.now() });
        }
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize the unified AI assistant
let unifiedAI = null;

// Ensure we only initialize once
if (!window.unifiedAILoaded) {
    window.unifiedAILoaded = true;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            unifiedAI = new UnifiedAIAssistant();
        });
    } else {
        unifiedAI = new UnifiedAIAssistant();
    }

    console.log('🚀 Unified AI Assistant script loaded');
} else {
    console.log('⚠️ Unified AI Assistant already loaded, skipping...');
}
