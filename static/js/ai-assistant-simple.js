/**
 * Simple AI Assistant - Focused on core functionality
 * Matches the exact design from the provided image
 */

class SimpleAIAssistant {
    constructor() {
        this.isOpen = false;
        this.isInitialized = false;
        this.conversationHistory = [];
        this.isTyping = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🤖 Initializing Simple AI Assistant...');
        this.createButton();
        this.createInterface();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ Simple AI Assistant initialized successfully!');
    }

    createButton() {
        // Remove existing button if any
        const existingButton = document.getElementById('ai-assistant-button');
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('button');
        button.id = 'ai-assistant-button';
        button.className = 'ai-assistant-button';
        button.innerHTML = '🤖';
        button.title = 'Open AI Assistant';
        button.onclick = () => this.toggle();

        // Add button styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-assistant-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #3c6430, #4f7a41);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(60, 100, 48, 0.3);
                transition: all 0.3s ease;
                z-index: 999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-assistant-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(60, 100, 48, 0.4);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(button);
    }

    createInterface() {
        // Remove existing interface if any
        const existingInterface = document.getElementById('ai-assistant-container');
        if (existingInterface) {
            existingInterface.remove();
        }

        const container = document.createElement('div');
        container.id = 'ai-assistant-container';
        container.className = 'ai-assistant-container';
        
        container.innerHTML = `
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">
                    <div class="ai-avatar">🤖</div>
                    <h4>AI Assistant</h4>
                    <div class="ai-controls-inline">
                        <div class="ai-toggle-switch">
                            <span class="ai-toggle-label">Auto-speak</span>
                            <input type="checkbox" id="auto-speak-toggle">
                        </div>
                    </div>
                </div>
                <div class="ai-assistant-controls">
                    <button class="ai-copy-btn" onclick="simpleAI.copyConversation()" title="Copy conversation">
                        📋
                    </button>
                    <button class="ai-close-btn" onclick="simpleAI.close()" title="Close">
                        ✕
                    </button>
                </div>
            </div>
            
            <div class="ai-assistant-body">
                <div class="ai-conversation-area" id="ai-conversation">
                    <div class="ai-welcome-message">
                        <div class="ai-message ai-message-assistant">
                            <div class="ai-message-content">
                                <p>Hello! I'm your AI assistant for this platform. I can help you with: <strong>1. Learning about LLM fine-tuning</strong> techniques like LoRA, QLoRA, and other parameter-efficient methods. <strong>2. Code examples</strong> and implementation guides. <strong>3. Navigation</strong> through workshops, tutorials, and resources. <strong>4. Best practices</strong> and troubleshooting tips.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-quick-suggestions">
                    <button class="ai-suggestion-btn" onclick="simpleAI.sendSuggestion('What is this platform about?')">
                        What is this platform about?
                    </button>
                    <button class="ai-suggestion-btn" onclick="simpleAI.sendSuggestion('How do I navigate this website?')">
                        How do I navigate this website?
                    </button>
                    <button class="ai-suggestion-btn" onclick="simpleAI.sendSuggestion('What features does this platform offer?')">
                        What features does this platform offer?
                    </button>
                    <button class="ai-suggestion-btn" onclick="simpleAI.sendSuggestion('How do I get started with LLM fine-tuning?')">
                        How do I get started with LLM fine-tuning?
                    </button>
                </div>
                
                <div class="ai-input-area">
                    <div class="ai-input-container">
                        <textarea id="ai-input" placeholder="Ask me anything..." rows="1"></textarea>
                        <button class="ai-action-button" id="ai-mic-btn" onclick="simpleAI.toggleVoice()" title="Voice input">
                            🎤
                        </button>
                        <button class="ai-action-button" id="ai-speaker-btn" onclick="simpleAI.toggleSpeaker()" title="Speak response">
                            🔊
                        </button>
                        <button class="ai-action-button" id="ai-send-btn" onclick="simpleAI.sendMessage()" title="Send message">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add interface styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-assistant-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 420px;
                height: 600px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .ai-assistant-container.open {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from { transform: translateY(100%) scale(0.8); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            .ai-assistant-header {
                background: #2a2a2a;
                color: #ffffff;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 16px 16px 0 0;
                border-bottom: 1px solid #444;
            }
            
            .ai-assistant-title {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .ai-avatar {
                width: 32px;
                height: 32px;
                background: #4a9eff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: white;
            }
            
            .ai-assistant-title h4 {
                margin: 0;
                font-weight: 600;
                font-size: 18px;
                color: #ffffff;
            }
            
            .ai-controls-inline {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-left: auto;
                margin-right: 12px;
            }
            
            .ai-toggle-switch {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #ffffff;
            }
            
            .ai-toggle-label {
                font-size: 14px;
                color: #ffffff;
            }
            
            .ai-toggle-switch input[type="checkbox"] {
                position: relative;
                width: 44px;
                height: 24px;
                appearance: none;
                background: #444;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin: 0;
            }
            
            .ai-toggle-switch input[type="checkbox"]:checked {
                background: #4a9eff;
            }
            
            .ai-toggle-switch input[type="checkbox"]::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: #ffffff;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .ai-toggle-switch input[type="checkbox"]:checked::before {
                transform: translateX(20px);
            }
            
            .ai-assistant-controls {
                display: flex;
                gap: 8px;
            }
            
            .ai-copy-btn, .ai-close-btn {
                background: none;
                border: none;
                color: #4a9eff;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 16px;
            }
            
            .ai-copy-btn:hover, .ai-close-btn:hover {
                background: rgba(74, 158, 255, 0.1);
                color: #6bb6ff;
            }
            
            .ai-assistant-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #1a1a1a;
            }
            
            .ai-conversation-area {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #1a1a1a;
            }
            
            .ai-message-assistant .ai-message-content {
                background: transparent;
                color: #ffffff;
                padding: 0;
                border-radius: 0;
                border: none;
                line-height: 1.6;
                font-size: 14px;
            }
            
            .ai-quick-suggestions {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                border-top: 1px solid #333;
                background: #1a1a1a;
            }
            
            .ai-suggestion-btn {
                background: #4a9eff;
                color: #ffffff;
                border: none;
                padding: 12px 16px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                font-size: 14px;
                font-weight: 500;
            }
            
            .ai-suggestion-btn:hover {
                background: #6bb6ff;
                transform: translateY(-1px);
            }
            
            .ai-input-area {
                padding: 20px;
                border-top: 1px solid #333;
                background: #1a1a1a;
            }
            
            .ai-input-container {
                display: flex;
                gap: 12px;
                align-items: flex-end;
            }
            
            .ai-input-container textarea {
                flex: 1;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 12px;
                padding: 12px 16px;
                color: #ffffff;
                resize: none;
                min-height: 44px;
                max-height: 120px;
                font-size: 14px;
                font-family: inherit;
            }
            
            .ai-input-container textarea::placeholder {
                color: #888;
            }
            
            .ai-input-container textarea:focus {
                outline: none;
                border-color: #4a9eff;
                box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.1);
            }
            
            .ai-action-button {
                background: #4a9eff;
                color: white;
                border: none;
                width: 44px;
                height: 44px;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 16px;
            }
            
            .ai-action-button:hover {
                background: #6bb6ff;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);
    }

    setupEventListeners() {
        // Enter key to send message
        const input = document.getElementById('ai-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const container = document.getElementById('ai-assistant-container');
        if (container) {
            container.classList.add('open');
            this.isOpen = true;
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('ai-input');
                if (input) input.focus();
            }, 300);
        }
    }

    close() {
        const container = document.getElementById('ai-assistant-container');
        if (container) {
            container.classList.remove('open');
            this.isOpen = false;
        }
    }

    sendSuggestion(message) {
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        // Add user message to conversation
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        try {
            // Send to API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (response.ok) {
                const data = await response.json();
                this.addMessage(data.response, 'assistant');
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            }
        } catch (error) {
            console.error('AI Assistant Error:', error);
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
        } finally {
            this.hideTyping();
        }
    }

    addMessage(content, sender) {
        const conversation = document.getElementById('ai-conversation');
        if (!conversation) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        messageDiv.innerHTML = `
            <div class="ai-message-content">
                <p>${content}</p>
            </div>
        `;

        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;

        // Store in history
        this.conversationHistory.push({ sender, content, timestamp: Date.now() });
    }

    showTyping() {
        this.isTyping = true;
        // Add typing indicator if needed
    }

    hideTyping() {
        this.isTyping = false;
        // Remove typing indicator if needed
    }

    copyConversation() {
        const conversation = this.conversationHistory.map(msg =>
            `${msg.sender === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`
        ).join('\n\n');

        navigator.clipboard.writeText(conversation).then(() => {
            this.showToast('Conversation copied to clipboard!');
        }).catch(() => {
            this.showToast('Failed to copy conversation');
        });
    }

    toggleVoice() {
        this.showToast('Voice input feature coming soon!');
    }

    toggleSpeaker() {
        this.showToast('Text-to-speech feature coming soon!');
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            animation: fadeInOut 3s ease-in-out;
        `;
        toast.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateY(20px); }
                10%, 90% { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 3000);
    }
}

// Initialize the simple AI assistant
const simpleAI = new SimpleAIAssistant();

// Make it globally available
window.simpleAI = simpleAI;
window.aiAssistant = simpleAI; // For compatibility

console.log('🤖 Simple AI Assistant loaded successfully!');
