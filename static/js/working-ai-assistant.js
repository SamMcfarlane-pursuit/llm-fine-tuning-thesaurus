/**
 * WORKING AI ASSISTANT - Guaranteed to work!
 * This is a minimal, bulletproof implementation
 */

console.log('🚀 Loading Working AI Assistant...');

// Wait for DOM to be ready
function initWorkingAI() {
    console.log('🤖 Initializing Working AI Assistant...');
    
    // Remove any existing AI buttons
    const existingButtons = document.querySelectorAll('.working-ai-button, .ai-assistant-button, #ai-assistant-button');
    existingButtons.forEach(btn => btn.remove());
    
    // Remove any existing AI interfaces
    const existingInterfaces = document.querySelectorAll('.working-ai-interface, .ai-assistant-container, #ai-assistant-container');
    existingInterfaces.forEach(iface => iface.remove());
    
    // Create the AI button
    createAIButton();
    
    // Create the AI interface
    createAIInterface();
    
    console.log('✅ Working AI Assistant initialized successfully!');
}

function createAIButton() {
    const button = document.createElement('button');
    button.className = 'working-ai-button';
    button.innerHTML = '🤖';
    button.title = 'Open AI Assistant';
    button.style.cssText = `
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
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 12px 40px rgba(60, 100, 48, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 8px 32px rgba(60, 100, 48, 0.3)';
    });
    
    button.addEventListener('click', () => {
        console.log('🤖 AI Button clicked!');
        toggleAIInterface();
    });
    
    document.body.appendChild(button);
    console.log('✅ AI Button created and added to page');
}

function createAIInterface() {
    const interface = document.createElement('div');
    interface.className = 'working-ai-interface';
    interface.style.cssText = `
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
        z-index: 10000;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    interface.innerHTML = `
        <div style="
            background: #2a2a2a;
            color: #ffffff;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
            border-bottom: 1px solid #444;
        ">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <div style="
                    width: 32px;
                    height: 32px;
                    background: #4a9eff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: white;
                ">🤖</div>
                <h4 style="margin: 0; font-weight: 600; font-size: 18px; color: #ffffff;">AI Assistant</h4>
                <div style="display: flex; align-items: center; gap: 12px; margin-left: auto; margin-right: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #ffffff;">
                        <span style="font-size: 14px; color: #ffffff;">Auto-speak</span>
                        <input type="checkbox" style="
                            position: relative;
                            width: 44px;
                            height: 24px;
                            appearance: none;
                            background: #444;
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            margin: 0;
                        ">
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="copyConversation()" style="
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
                " title="Copy conversation">📋</button>
                <button onclick="closeAIInterface()" style="
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
                " title="Close">✕</button>
            </div>
        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #1a1a1a;">
            <div id="working-ai-conversation" style="
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #1a1a1a;
            ">
                <div style="margin-bottom: 20px;">
                    <div style="
                        background: transparent;
                        color: #ffffff;
                        padding: 0;
                        border-radius: 0;
                        border: none;
                        line-height: 1.6;
                        font-size: 14px;
                    ">
                        <p>Hello! I'm your AI assistant for this platform. I can help you with: <strong>1. Learning about LLM fine-tuning</strong> techniques like LoRA, QLoRA, and other parameter-efficient methods. <strong>2. Code examples</strong> and implementation guides. <strong>3. Navigation</strong> through workshops, tutorials, and resources. <strong>4. Best practices</strong> and troubleshooting tips.</p>
                    </div>
                </div>
            </div>
            
            <div style="
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                border-top: 1px solid #333;
                background: #1a1a1a;
            ">
                <button onclick="sendSuggestion('What is this platform about?')" style="
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
                ">What is this platform about?</button>
                <button onclick="sendSuggestion('How do I navigate this website?')" style="
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
                ">How do I navigate this website?</button>
                <button onclick="sendSuggestion('What features does this platform offer?')" style="
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
                ">What features does this platform offer?</button>
                <button onclick="sendSuggestion('How do I get started with LLM fine-tuning?')" style="
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
                ">How do I get started with LLM fine-tuning?</button>
            </div>
            
            <div style="
                padding: 20px;
                border-top: 1px solid #333;
                background: #1a1a1a;
            ">
                <div style="display: flex; gap: 12px; align-items: flex-end;">
                    <textarea id="working-ai-input" placeholder="Ask me anything..." style="
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
                    "></textarea>
                    <button onclick="toggleVoice()" style="
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
                    " title="Voice input">🎤</button>
                    <button onclick="toggleSpeaker()" style="
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
                    " title="Speak response">🔊</button>
                    <button onclick="sendMessage()" style="
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
                    " title="Send message">➤</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(interface);
    console.log('✅ AI Interface created and added to page');
    
    // Add Enter key listener
    const input = document.getElementById('working-ai-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

function toggleAIInterface() {
    const interface = document.querySelector('.working-ai-interface');
    if (interface) {
        if (interface.style.display === 'none' || interface.style.display === '') {
            interface.style.display = 'flex';
            interface.style.animation = 'slideUp 0.3s ease-out';
            console.log('✅ AI Interface opened');
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('working-ai-input');
                if (input) input.focus();
            }, 300);
        } else {
            interface.style.display = 'none';
            console.log('✅ AI Interface closed');
        }
    }
}

function closeAIInterface() {
    const interface = document.querySelector('.working-ai-interface');
    if (interface) {
        interface.style.display = 'none';
        console.log('✅ AI Interface closed');
    }
}

function sendSuggestion(message) {
    const input = document.getElementById('working-ai-input');
    if (input) {
        input.value = message;
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('working-ai-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    console.log('📤 Sending message:', message);

    // Add user message to conversation
    addMessage(message, 'user');

    // Show typing indicator
    addMessage('AI is thinking...', 'assistant', true);

    try {
        // Send to API
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        // Remove typing indicator
        removeTypingIndicator();

        if (response.ok) {
            const data = await response.json();
            addMessage(data.response || 'I received your message!', 'assistant');
            console.log('✅ AI response received');
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            console.log('❌ API error:', response.status);
        }
    } catch (error) {
        console.error('❌ AI Assistant Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
    }
}

function addMessage(content, sender, isTyping = false) {
    const conversation = document.getElementById('working-ai-conversation');
    if (!conversation) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `working-ai-message working-ai-message-${sender}`;
    if (isTyping) messageDiv.className += ' typing-indicator';
    
    messageDiv.style.cssText = `
        margin-bottom: 16px;
        padding: ${sender === 'user' ? '12px 16px' : '0'};
        background: ${sender === 'user' ? '#4a9eff' : 'transparent'};
        color: ${sender === 'user' ? '#ffffff' : '#ffffff'};
        border-radius: ${sender === 'user' ? '20px' : '0'};
        max-width: ${sender === 'user' ? '80%' : '100%'};
        margin-left: ${sender === 'user' ? 'auto' : '0'};
        margin-right: ${sender === 'user' ? '0' : 'auto'};
        font-size: 14px;
        line-height: 1.6;
    `;
    
    messageDiv.innerHTML = `<p style="margin: 0;">${content}</p>`;

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function copyConversation() {
    showToast('Copy feature coming soon!');
}

function toggleVoice() {
    showToast('Voice input feature coming soon!');
}

function toggleSpeaker() {
    showToast('Text-to-speech feature coming soon!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 20000;
        font-size: 14px;
        animation: fadeInOut 3s ease-in-out;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(20px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { transform: translateY(100%) scale(0.8); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
        if (document.body.contains(toast)) document.body.removeChild(toast);
        if (document.head.contains(style)) document.head.removeChild(style);
    }, 3000);
}

// Global functions for button clicks
window.closeAIInterface = closeAIInterface;
window.sendSuggestion = sendSuggestion;
window.sendMessage = sendMessage;
window.copyConversation = copyConversation;
window.toggleVoice = toggleVoice;
window.toggleSpeaker = toggleSpeaker;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkingAI);
} else {
    initWorkingAI();
}

console.log('🎉 Working AI Assistant script loaded successfully!');
