/**
 * COMPREHENSIVE AI ASSISTANT - Claude-level Quality
 * Robust, intelligent AI assistant with comprehensive technical knowledge
 * Seamlessly integrated across all Visual LLM platform pages
 */

console.log('🧠 Loading Comprehensive AI Assistant...');

class ComprehensiveAIAssistant {
    constructor() {
        this.isInitialized = false;
        this.conversation = [];
        this.isTyping = false;
        this.currentProvider = null;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.createButton();
        this.createInterface();
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('✅ Comprehensive AI Assistant initialized');
    }

    createButton() {
        // Remove any existing AI buttons
        document.querySelectorAll('.comprehensive-ai-button, .final-ai-button, .ai-assistant-button').forEach(el => el.remove());
        
        const button = document.createElement('button');
        button.className = 'comprehensive-ai-button';
        button.innerHTML = '🧠';
        button.title = 'Comprehensive AI Assistant - Claude-level Quality';
        
        button.style.cssText = `
            position: fixed !important;
            bottom: 25px !important;
            right: 25px !important;
            width: 70px !important;
            height: 70px !important;
            background: linear-gradient(135deg, #3c6430 0%, #4f7a41 50%, #5a8a4d 100%) !important;
            border: none !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 32px !important;
            cursor: pointer !important;
            box-shadow: 0 8px 25px rgba(60, 100, 48, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;
        
        button.addEventListener('click', () => this.toggleInterface());
        document.body.appendChild(button);
    }

    createInterface() {
        const interface = document.createElement('div');
        interface.className = 'comprehensive-ai-interface';
        interface.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            width: 450px !important;
            height: 650px !important;
            background: #ffffff !important;
            border: none !important;
            border-radius: 20px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1) !important;
            display: none !important;
            flex-direction: column !important;
            z-index: 10000 !important;
            overflow: hidden !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;

        interface.innerHTML = `
            <div class="ai-header" style="
                background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
                color: white !important;
                padding: 20px 24px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                border-radius: 20px 20px 0 0 !important;
            ">
                <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
                    <div style="
                        width: 40px !important;
                        height: 40px !important;
                        background: rgba(255, 255, 255, 0.2) !important;
                        border-radius: 12px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: 18px !important;
                    ">🧠</div>
                    <div>
                        <h4 style="margin: 0 !important; font-weight: 600 !important; font-size: 16px !important;">Comprehensive AI Assistant</h4>
                        <p style="margin: 0 !important; font-size: 12px !important; opacity: 0.9 !important;">Claude-level quality • Technical expertise</p>
                    </div>
                </div>
                <button onclick="comprehensiveAI.closeInterface()" style="
                    background: rgba(255, 255, 255, 0.2) !important;
                    border: none !important;
                    color: white !important;
                    font-size: 16px !important;
                    cursor: pointer !important;
                    padding: 8px !important;
                    border-radius: 8px !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                ">✕</button>
            </div>

            <div class="ai-conversation" style="
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 24px !important;
                background: #ffffff !important;
                min-height: 400px !important;
                max-height: 450px !important;
            ">
                <!-- Messages will be added here -->
            </div>

            <div class="ai-suggestions" style="
                padding: 16px 24px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                border-top: 1px solid #f3f4f6 !important;
                background: #f9fafb !important;
            ">
                <div style="font-size: 12px !important; font-weight: 600 !important; color: #6b7280 !important; margin-bottom: 4px !important;">Quick Questions:</div>
                <button onclick="comprehensiveAI.sendSuggestion('What is LoRA fine-tuning and how does it work?')" class="suggestion-btn">What is LoRA fine-tuning?</button>
                <button onclick="comprehensiveAI.sendSuggestion('Explain the difference between LoRA and QLoRA with code examples')" class="suggestion-btn">LoRA vs QLoRA comparison</button>
                <button onclick="comprehensiveAI.sendSuggestion('Show me a complete implementation of transformer attention mechanism')" class="suggestion-btn">Transformer attention implementation</button>
            </div>

            <div class="ai-input-area" style="
                padding: 20px 24px !important;
                border-top: 1px solid #f3f4f6 !important;
                background: #ffffff !important;
            ">
                <div style="display: flex !important; gap: 8px !important; align-items: flex-end !important;">
                    <textarea class="ai-input" placeholder="Ask me anything about AI/ML, software development, or computer science..." style="
                        flex: 1 !important;
                        background: #f9fafb !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 12px !important;
                        padding: 12px 16px !important;
                        color: #111827 !important;
                        resize: none !important;
                        min-height: 44px !important;
                        max-height: 120px !important;
                        font-size: 14px !important;
                        font-family: inherit !important;
                        outline: none !important;
                    "></textarea>
                    <button onclick="comprehensiveAI.sendMessage()" class="send-btn" style="
                        background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
                        color: white !important;
                        border: none !important;
                        width: 44px !important;
                        height: 44px !important;
                        border-radius: 12px !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: 16px !important;
                        box-shadow: 0 2px 4px rgba(60, 100, 48, 0.2) !important;
                    ">➤</button>
                </div>
            </div>
        `;

        // Add suggestion button styles
        const style = document.createElement('style');
        style.textContent = `
            .suggestion-btn {
                background: #ffffff !important;
                color: #3c6430 !important;
                border: 1px solid #d1fae5 !important;
                padding: 8px 12px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                text-align: left !important;
                font-size: 12px !important;
                font-weight: 500 !important;
            }
            .suggestion-btn:hover {
                background: #ecfdf5 !important;
                border-color: #a7f3d0 !important;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(interface);
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        // Enter key listener
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('ai-input') && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleInterface() {
        const interface = document.querySelector('.comprehensive-ai-interface');
        if (interface) {
            const isVisible = interface.style.display === 'flex';
            interface.style.display = isVisible ? 'none' : 'flex';
            
            if (!isVisible) {
                setTimeout(() => {
                    const input = interface.querySelector('.ai-input');
                    if (input) input.focus();
                }, 300);
            }
        }
    }

    closeInterface() {
        const interface = document.querySelector('.comprehensive-ai-interface');
        if (interface) {
            interface.style.display = 'none';
        }
    }

    addWelcomeMessage() {
        const welcomeMessage = `🧠 **Welcome to the Comprehensive AI Assistant!**

I'm your Claude-level AI assistant with deep expertise in:

**🤖 AI/ML Topics:**
• LLM fine-tuning (LoRA, QLoRA, PEFT)
• Transformer architectures & attention mechanisms
• Model quantization & optimization
• Training strategies & evaluation

**💻 Software Development:**
• Programming languages (Python, JavaScript, Java, etc.)
• Frameworks & libraries
• Design patterns & architecture
• Testing & debugging

**🌐 Web & Mobile Development:**
• Frontend frameworks (React, Vue, Angular)
• Backend technologies & APIs
• Database design & optimization
• DevOps & deployment

**🔬 Computer Science:**
• Algorithms & data structures
• System design & architecture
• Performance optimization
• Security best practices

I provide detailed explanations, code examples, step-by-step guidance, and industry best practices. Ask me anything!`;

        this.addMessage(welcomeMessage, 'assistant');
    }

    sendSuggestion(message) {
        const input = document.querySelector('.ai-input');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.querySelector('.ai-input');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        this.addMessage(message, 'user');
        this.showTypingIndicator();

        try {
            // Try comprehensive AI first
            let response = await this.tryComprehensiveAI(message);
            
            // Fallback to enhanced AI
            if (!response || !response.success) {
                response = await this.tryEnhancedAI(message);
            }
            
            // Final fallback to basic AI
            if (!response || !response.success) {
                response = await this.tryBasicAI(message);
            }

            this.hideTypingIndicator();

            if (response && response.success) {
                this.addMessage(response.response, 'assistant', response);
                this.currentProvider = response.provider_used || 'unknown';
            } else {
                this.addMessage('I apologize, but I\'m experiencing technical difficulties. Please try again, and I\'ll provide you with comprehensive technical guidance.', 'assistant');
            }
        } catch (error) {
            console.error('AI Assistant error:', error);
            this.hideTypingIndicator();
            this.addMessage('I\'m having trouble connecting right now. Please try again in a moment.', 'assistant');
        }
    }

    async tryComprehensiveAI(message) {
        try {
            const response = await fetch('/api/ai/comprehensive/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    context: {
                        page: window.location.pathname,
                        timestamp: new Date().toISOString(),
                        user_level: 'advanced',
                        platform: 'visual_llm'
                    }
                })
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Comprehensive AI not available:', error);
        }
        return null;
    }

    async tryEnhancedAI(message) {
        try {
            const response = await fetch('/api/ai/enhanced/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    preferences: { cost: 'low', speed: 'high', quality: 'high' },
                    context: { page: window.location.pathname }
                })
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Enhanced AI not available:', error);
        }
        return null;
    }

    async tryBasicAI(message) {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    context: { page: window.location.pathname }
                })
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Basic AI not available:', error);
        }
        return null;
    }

    addMessage(content, sender, metadata = null) {
        const conversation = document.querySelector('.ai-conversation');
        if (!conversation) return;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            margin-bottom: 16px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: ${sender === 'user' ? 'flex-end' : 'flex-start'} !important;
        `;

        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width: 85% !important;
            padding: 12px 16px !important;
            border-radius: ${sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'} !important;
            background: ${sender === 'user' ? 'linear-gradient(135deg, #3c6430, #4f7a41)' : '#f9fafb'} !important;
            color: ${sender === 'user' ? 'white' : '#111827'} !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            border: ${sender === 'assistant' ? '1px solid #e5e7eb' : 'none'} !important;
        `;

        // Format content with markdown-like styling
        if (sender === 'assistant') {
            bubble.innerHTML = this.formatMessage(content);
        } else {
            bubble.textContent = content;
        }

        messageDiv.appendChild(bubble);

        // Add metadata if available
        if (metadata && sender === 'assistant') {
            const metaDiv = document.createElement('div');
            metaDiv.style.cssText = `
                font-size: 11px !important;
                color: #6b7280 !important;
                margin-top: 4px !important;
                margin-left: 8px !important;
            `;
            
            const provider = metadata.provider_used || 'AI';
            const confidence = metadata.confidence ? Math.round(metadata.confidence * 100) : null;
            const responseTime = metadata.response_time ? Math.round(metadata.response_time * 1000) : null;
            
            let metaText = `${provider}`;
            if (confidence) metaText += ` • ${confidence}% confidence`;
            if (responseTime) metaText += ` • ${responseTime}ms`;
            
            metaDiv.textContent = metaText;
            messageDiv.appendChild(metaDiv);
        }

        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 8px 0; overflow-x: auto;"><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-size: 13px;">$1</code>')
            .replace(/^• /gm, '• ')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.style.cssText = `
            margin-bottom: 16px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        `;
        
        typingDiv.innerHTML = `
            <div style="
                background: #f9fafb !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 16px 16px 16px 4px !important;
                padding: 12px 16px !important;
                font-size: 14px !important;
                color: #6b7280 !important;
            ">
                🧠 Thinking...
                <span style="animation: pulse 1.5s infinite;">●</span>
                <span style="animation: pulse 1.5s infinite 0.5s;">●</span>
                <span style="animation: pulse 1.5s infinite 1s;">●</span>
            </div>
        `;

        const conversation = document.querySelector('.ai-conversation');
        if (conversation) {
            conversation.appendChild(typingDiv);
            conversation.scrollTop = conversation.scrollHeight;
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Initialize the comprehensive AI assistant
let comprehensiveAI;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        comprehensiveAI = new ComprehensiveAIAssistant();
    });
} else {
    comprehensiveAI = new ComprehensiveAIAssistant();
}

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    if (!comprehensiveAI) {
        comprehensiveAI = new ComprehensiveAIAssistant();
    }
});

console.log('🧠 Comprehensive AI Assistant script loaded');
