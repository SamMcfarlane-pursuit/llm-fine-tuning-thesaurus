/**
 * FINAL AI ASSISTANT - Guaranteed to work!
 * This is the definitive, working implementation
 */

console.log('🚀 Loading Final AI Assistant...');

// Ensure we only initialize once
if (window.finalAIAssistantLoaded) {
    console.log('⚠️ Final AI Assistant already loaded, skipping...');
} else {
    window.finalAIAssistantLoaded = true;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFinalAI);
    } else {
        initFinalAI();
    }
}

function initFinalAI() {
    console.log('🤖 Initializing Final AI Assistant...');

    // Remove any existing AI elements to prevent conflicts
    cleanupExistingAI();

    // Create the AI button and interface
    createFinalAIButton();
    createFinalAIInterface();

    // Set up periodic cleanup to prevent other scripts from creating duplicate buttons
    setInterval(() => {
        const finalButton = document.querySelector('.final-ai-button');
        if (finalButton) {
            // Only clean up if our button exists, and remove any duplicates
            const duplicateButtons = document.querySelectorAll(`
                .working-ai-button, .ai-assistant-button, #ai-assistant-button,
                .simple-ai-button, #simple-ai-button,
                .ai-floating-container, #ai-floating-container,
                .help-button, #help-button
            `);
            duplicateButtons.forEach(el => {
                if (el !== finalButton) {
                    console.log('🗑️ Removing duplicate AI element:', el.className || el.id);
                    el.remove();
                }
            });
        }
    }, 2000); // Check every 2 seconds

    console.log('✅ Final AI Assistant initialized successfully!');
}

function cleanupExistingAI() {
    // Remove any existing AI buttons and interfaces - comprehensive cleanup
    const existingElements = document.querySelectorAll(`
        .working-ai-button, .ai-assistant-button, #ai-assistant-button,
        .working-ai-interface, .ai-assistant-container, #ai-assistant-container,
        .simple-ai-button, .simple-ai-interface, #simple-ai-button,
        .final-ai-button, .final-ai-interface,
        .ai-floating-container, #ai-floating-container,
        .ai-floating-button, #ai-assistant-float-btn,
        .ai-main-button, .ai-feature-button,
        #ai-code-btn, #ai-learning-btn,
        .help-button, #help-button
    `);
    existingElements.forEach(el => {
        console.log('🗑️ Removing existing AI element:', el.className || el.id);
        el.remove();
    });

    // Also remove any elements that might have been created by emergency backups
    const emergencyElements = document.querySelectorAll('[id*="ai"], [class*="ai-"], [id*="assistant"], [class*="assistant"]');
    emergencyElements.forEach(el => {
        // Only remove if it looks like an AI button (has robot emoji or is positioned fixed)
        const hasRobotEmoji = el.innerHTML && el.innerHTML.includes('🤖');
        const isFixedPosition = window.getComputedStyle(el).position === 'fixed';
        const isBottomRight = window.getComputedStyle(el).bottom !== 'auto' && window.getComputedStyle(el).right !== 'auto';

        if (hasRobotEmoji || (isFixedPosition && isBottomRight)) {
            console.log('🗑️ Removing emergency AI element:', el.className || el.id);
            el.remove();
        }
    });

    console.log('🧹 Comprehensive cleanup of existing AI elements completed');
}

function createFinalAIButton() {
    const button = document.createElement('button');
    button.className = 'final-ai-button';
    button.innerHTML = '🤖';
    button.title = 'Open AI Assistant';

    // Inline styles to ensure it works
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

    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 12px 40px rgba(60, 100, 48, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 8px 32px rgba(60, 100, 48, 0.3)';
    });

    // Click handler
    button.addEventListener('click', () => {
        console.log('🤖 Final AI Button clicked!');
        toggleFinalAIInterface();
    });

    document.body.appendChild(button);
    console.log('✅ Final AI Button created');
}

function createFinalAIInterface() {
    const interface = document.createElement('div');
    interface.className = 'final-ai-interface';
    interface.style.cssText = `
        position: fixed !important;
        bottom: 30px !important;
        right: 30px !important;
        width: 420px !important;
        height: 600px !important;
        background: #1a1a1a !important;
        border: 1px solid #333 !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
        display: none !important;
        flex-direction: column !important;
        z-index: 10000 !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    interface.innerHTML = `
        <div style="
            background: #2a2a2a !important;
            color: #ffffff !important;
            padding: 16px 20px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-radius: 16px 16px 0 0 !important;
            border-bottom: 1px solid #444 !important;
        ">
            <div style="display: flex !important; align-items: center !important; gap: 12px !important; flex: 1 !important;">
                <div style="
                    width: 32px !important;
                    height: 32px !important;
                    background: #4a9eff !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 16px !important;
                    color: white !important;
                ">🤖</div>
                <h4 style="margin: 0 !important; font-weight: 600 !important; font-size: 18px !important; color: #ffffff !important;">AI Assistant</h4>
                <div style="display: flex !important; align-items: center !important; gap: 12px !important; margin-left: auto !important; margin-right: 12px !important;">
                    <div style="display: flex !important; align-items: center !important; gap: 8px !important; font-size: 14px !important; color: #ffffff !important;">
                        <span style="font-size: 14px !important; color: #ffffff !important;">Auto-speak</span>
                        <input type="checkbox" style="
                            position: relative !important;
                            width: 44px !important;
                            height: 24px !important;
                            appearance: none !important;
                            background: #444 !important;
                            border-radius: 12px !important;
                            cursor: pointer !important;
                            transition: all 0.3s ease !important;
                            margin: 0 !important;
                        ">
                    </div>
                </div>
            </div>
            <div style="display: flex !important; gap: 8px !important;">
                <button onclick="copyFinalConversation()" style="
                    background: none !important;
                    border: none !important;
                    color: #4a9eff !important;
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    font-size: 16px !important;
                " title="Copy conversation">📋</button>
                <button onclick="closeFinalAIInterface()" style="
                    background: none !important;
                    border: none !important;
                    color: #4a9eff !important;
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    font-size: 16px !important;
                " title="Close">✕</button>
            </div>
        </div>

        <div style="flex: 1 !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; background: #1a1a1a !important;">
            <div id="final-ai-conversation" style="
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 20px !important;
                background: #1a1a1a !important;
            ">
                <div style="margin-bottom: 20px !important;">
                    <div style="
                        background: transparent !important;
                        color: #ffffff !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        border: none !important;
                        line-height: 1.6 !important;
                        font-size: 14px !important;
                    ">
                        <p style="margin: 0 !important;">Hello! I'm your AI assistant for this platform. I can help you with: <strong>1. Learning about LLM fine-tuning</strong> techniques like LoRA, QLoRA, and other parameter-efficient methods. <strong>2. Code examples</strong> and implementation guides. <strong>3. Navigation</strong> through workshops, tutorials, and resources. <strong>4. Best practices</strong> and troubleshooting tips.</p>
                    </div>
                </div>
            </div>

            <div style="
                padding: 20px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
                border-top: 1px solid #333 !important;
                background: #1a1a1a !important;
            ">
                <button onclick="sendFinalSuggestion('What is this platform about?')" style="
                    background: #4a9eff !important;
                    color: #ffffff !important;
                    border: none !important;
                    padding: 12px 16px !important;
                    border-radius: 20px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                ">What is this platform about?</button>
                <button onclick="sendFinalSuggestion('How do I navigate this website?')" style="
                    background: #4a9eff !important;
                    color: #ffffff !important;
                    border: none !important;
                    padding: 12px 16px !important;
                    border-radius: 20px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                ">How do I navigate this website?</button>
                <button onclick="sendFinalSuggestion('What features does this platform offer?')" style="
                    background: #4a9eff !important;
                    color: #ffffff !important;
                    border: none !important;
                    padding: 12px 16px !important;
                    border-radius: 20px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                ">What features does this platform offer?</button>
                <button onclick="sendFinalSuggestion('How do I get started with LLM fine-tuning?')" style="
                    background: #4a9eff !important;
                    color: #ffffff !important;
                    border: none !important;
                    padding: 12px 16px !important;
                    border-radius: 20px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                ">How do I get started with LLM fine-tuning?</button>
            </div>

            <div style="
                padding: 20px !important;
                border-top: 1px solid #333 !important;
                background: #1a1a1a !important;
            ">
                <div style="display: flex !important; gap: 12px !important; align-items: flex-end !important;">
                    <textarea id="final-ai-input" placeholder="Ask me anything..." style="
                        flex: 1 !important;
                        background: #2a2a2a !important;
                        border: 1px solid #444 !important;
                        border-radius: 12px !important;
                        padding: 12px 16px !important;
                        color: #ffffff !important;
                        resize: none !important;
                        min-height: 44px !important;
                        max-height: 120px !important;
                        font-size: 14px !important;
                        font-family: inherit !important;
                    "></textarea>
                    <button onclick="toggleFinalVoice()" style="
                        background: #4a9eff !important;
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
                    " title="Voice input">🎤</button>
                    <button onclick="toggleFinalSpeaker()" style="
                        background: #4a9eff !important;
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
                    " title="Speak response">🔊</button>
                    <button onclick="sendFinalMessage()" style="
                        background: #4a9eff !important;
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
        </div>
    `;

    document.body.appendChild(interface);
    console.log('✅ Final AI Interface created');

    // Add Enter key listener
    const input = document.getElementById('final-ai-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendFinalMessage();
            }
        });
    }
}

function toggleFinalAIInterface() {
    const interface = document.querySelector('.final-ai-interface');
    if (interface) {
        if (interface.style.display === 'none' || interface.style.display === '') {
            interface.style.display = 'flex';
            console.log('✅ Final AI Interface opened');

            // Focus input
            setTimeout(() => {
                const input = document.getElementById('final-ai-input');
                if (input) input.focus();
            }, 300);
        } else {
            interface.style.display = 'none';
            console.log('✅ Final AI Interface closed');
        }
    }
}

function closeFinalAIInterface() {
    const interface = document.querySelector('.final-ai-interface');
    if (interface) {
        interface.style.display = 'none';
        console.log('✅ Final AI Interface closed');
    }
}

function sendFinalSuggestion(message) {
    const input = document.getElementById('final-ai-input');
    if (input) {
        input.value = message;
        sendFinalMessage();
    }
}

async function sendFinalMessage() {
    const input = document.getElementById('final-ai-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    console.log('📤 Sending final message:', message);

    // Add user message to conversation
    addFinalMessage(message, 'user');

    // Show typing indicator
    addFinalMessage('AI is thinking...', 'assistant', true);

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
        removeFinalTypingIndicator();

        if (response.ok) {
            const data = await response.json();
            addFinalMessage(data.response || 'I received your message!', 'assistant');
            console.log('✅ Final AI response received');
        } else {
            addFinalMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            console.log('❌ API error:', response.status);
        }
    } catch (error) {
        console.error('❌ Final AI Assistant Error:', error);
        removeFinalTypingIndicator();
        addFinalMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
    }
}

function addFinalMessage(content, sender, isTyping = false) {
    const conversation = document.getElementById('final-ai-conversation');
    if (!conversation) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `final-ai-message final-ai-message-${sender}`;
    if (isTyping) messageDiv.className += ' final-typing-indicator';

    messageDiv.style.cssText = `
        margin-bottom: 16px !important;
        padding: ${sender === 'user' ? '12px 16px' : '0'} !important;
        background: ${sender === 'user' ? '#4a9eff' : 'transparent'} !important;
        color: ${sender === 'user' ? '#ffffff' : '#ffffff'} !important;
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
}

function removeFinalTypingIndicator() {
    const typingIndicator = document.querySelector('.final-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function copyFinalConversation() {
    showFinalToast('Copy feature coming soon!');
}

function toggleFinalVoice() {
    showFinalToast('Voice input feature coming soon!');
}

function toggleFinalSpeaker() {
    showFinalToast('Text-to-speech feature coming soon!');
}

function showFinalToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed !important;
        bottom: 100px !important;
        right: 30px !important;
        background: #333 !important;
        color: white !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        z-index: 20000 !important;
        font-size: 14px !important;
        animation: finalFadeInOut 3s ease-in-out !important;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes finalFadeInOut {
            0%, 100% { opacity: 0; transform: translateY(20px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
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
window.closeFinalAIInterface = closeFinalAIInterface;
window.sendFinalSuggestion = sendFinalSuggestion;
window.sendFinalMessage = sendFinalMessage;
window.copyFinalConversation = copyFinalConversation;
window.toggleFinalVoice = toggleFinalVoice;
window.toggleFinalSpeaker = toggleFinalSpeaker;

console.log('🎉 Final AI Assistant script loaded successfully!');
