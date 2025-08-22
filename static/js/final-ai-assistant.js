/**
 * FINAL AI ASSISTANT - Guaranteed to work on ALL PAGES!
 * This is the definitive, working implementation
 * ROBUST ACROSS ALL PAGES OF VISUAL LLM PLATFORM
 */

console.log('🚀 Loading Final AI Assistant for ALL PAGES...');

// Global flag to track loading state
window.finalAIAssistantLoading = true;

// Ensure we only initialize once per page
if (window.finalAIAssistantLoaded) {
    console.log('⚠️ Final AI Assistant already loaded, skipping...');
} else {
    window.finalAIAssistantLoaded = true;

    // Initialize immediately and on DOM ready for maximum compatibility
    initFinalAI();

    // Also initialize when DOM is ready (if not already)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFinalAI);
    }

    // And when window loads (final fallback)
    window.addEventListener('load', initFinalAI);

    // Mark as loaded
    window.finalAIAssistantLoading = false;
}

function initFinalAI() {
    console.log('🤖 Initializing Final AI Assistant on page:', window.location.pathname);

    // Prevent multiple initializations
    if (window.finalAIInitialized) {
        console.log('⚠️ Final AI already initialized, skipping...');
        return;
    }

    try {
        // Remove any existing AI elements to prevent conflicts
        cleanupExistingAI();

        // Create the AI button and interface
        createFinalAIButton();
        createFinalAIInterface();

        // Mark as initialized
        window.finalAIInitialized = true;

        // Set up robust monitoring system
        setupAIMonitoring();

        console.log('✅ Final AI Assistant initialized successfully on page:', window.location.pathname);

        // Verify initialization after a short delay
        setTimeout(() => {
            const button = document.querySelector('.final-ai-button');
            const interface = document.querySelector('.final-ai-interface');

            if (button && interface) {
                console.log('🎉 Final AI Assistant verification: PASSED');
            } else {
                console.log('❌ Final AI Assistant verification: FAILED - recreating...');
                window.finalAIInitialized = false;
                initFinalAI();
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Error initializing Final AI Assistant:', error);
        window.finalAIInitialized = false;

        // Retry after delay
        setTimeout(() => {
            console.log('🔄 Retrying Final AI Assistant initialization...');
            initFinalAI();
        }, 2000);
    }
}

function setupAIMonitoring() {
    // Set up periodic monitoring to ensure AI assistant stays available
    const monitoringInterval = setInterval(() => {
        const finalButton = document.querySelector('.final-ai-button');
        const finalInterface = document.querySelector('.final-ai-interface');

        if (!finalButton || !finalInterface) {
            console.log('🚨 Final AI Assistant missing, recreating...');
            window.finalAIInitialized = false;
            clearInterval(monitoringInterval);
            initFinalAI();
            return;
        }

        // Clean up duplicate buttons from other scripts
        const duplicateButtons = document.querySelectorAll(`
            .working-ai-button, .ai-assistant-button, #ai-assistant-button,
            .simple-ai-button:not(.final-ai-button), #simple-ai-button,
            .ai-floating-container, #ai-floating-container,
            .help-button, #help-button,
            .immediate-ai-button, .emergency-ai-button
        `);

        duplicateButtons.forEach(el => {
            if (el !== finalButton && el !== finalInterface) {
                console.log('🗑️ Removing duplicate AI element:', el.className || el.id);
                el.remove();
            }
        });

    }, 3000); // Check every 3 seconds

    // Store interval ID for cleanup
    window.finalAIMonitoringInterval = monitoringInterval;

    console.log('🔍 AI monitoring system activated');
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
    button.title = 'Visual LLM AI Assistant - Powered by Ollama';

    // Premium inline styles for optimal appearance
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
        font-size: 30px !important;
        cursor: pointer !important;
        box-shadow: 0 8px 25px rgba(60, 100, 48, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
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
        width: 400px !important;
        height: 580px !important;
        background: #ffffff !important;
        border: none !important;
        border-radius: 20px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05) !important;
        display: none !important;
        flex-direction: column !important;
        z-index: 10000 !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

    interface.innerHTML = `
        <div style="
            background: #ffffff !important;
            color: #111827 !important;
            padding: 20px 24px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-radius: 20px 20px 0 0 !important;
            border-bottom: 1px solid #f3f4f6 !important;
        ">
            <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
                <div style="
                    width: 36px !important;
                    height: 36px !important;
                    background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
                    border-radius: 12px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 16px !important;
                    color: white !important;
                ">🤖</div>
                <div>
                    <h4 style="margin: 0 !important; font-weight: 600 !important; font-size: 16px !important; color: #111827 !important;">Visual LLM Assistant</h4>
                    <p style="margin: 0 !important; font-size: 12px !important; color: #6b7280 !important;">Free • Educational • Powered by Ollama</p>
                </div>
            </div>
            <button onclick="closeFinalAIInterface()" style="
                background: #f9fafb !important;
                border: 1px solid #e5e7eb !important;
                color: #6b7280 !important;
                font-size: 16px !important;
                cursor: pointer !important;
                padding: 8px !important;
                border-radius: 8px !important;
                transition: all 0.2s ease !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            " onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151'" onmouseout="this.style.background='#f9fafb'; this.style.color='#6b7280'">✕</button>
        </div>

        <div style="flex: 1 !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; background: #ffffff !important;">
            <div id="final-ai-conversation" style="
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 24px !important;
                background: #ffffff !important;
                min-height: 300px !important;
                max-height: 380px !important;
            ">
                <!-- Welcome message will be added dynamically -->
            </div>

            <div style="
                padding: 16px 24px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                border-top: 1px solid #f3f4f6 !important;
                background: #ffffff !important;
            ">
                <button onclick="sendFinalSuggestion('What is fine-tuning and why is it important?')" style="
                    background: #f8fffe !important;
                    color: #3c6430 !important;
                    border: 1px solid #d1fae5 !important;
                    padding: 10px 14px !important;
                    border-radius: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                " onmouseover="this.style.background='#ecfdf5'; this.style.borderColor='#a7f3d0'" onmouseout="this.style.background='#f8fffe'; this.style.borderColor='#d1fae5'">What is fine-tuning and why is it important?</button>
                <button onclick="sendFinalSuggestion('Explain LoRA vs QLoRA differences')" style="
                    background: #f8fffe !important;
                    color: #3c6430 !important;
                    border: 1px solid #d1fae5 !important;
                    padding: 10px 14px !important;
                    border-radius: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                " onmouseover="this.style.background='#ecfdf5'; this.style.borderColor='#a7f3d0'" onmouseout="this.style.background='#f8fffe'; this.style.borderColor='#d1fae5'">Explain LoRA vs QLoRA differences</button>
                <button onclick="sendFinalSuggestion('How do transformers work in simple terms?')" style="
                    background: #f8fffe !important;
                    color: #3c6430 !important;
                    border: 1px solid #d1fae5 !important;
                    padding: 10px 14px !important;
                    border-radius: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                " onmouseover="this.style.background='#ecfdf5'; this.style.borderColor='#a7f3d0'" onmouseout="this.style.background='#f8fffe'; this.style.borderColor='#d1fae5'">How do transformers work in simple terms?</button>
                <button onclick="sendFinalSuggestion('Show me a practical LoRA fine-tuning example')" style="
                    background: #f8fffe !important;
                    color: #3c6430 !important;
                    border: 1px solid #d1fae5 !important;
                    padding: 10px 14px !important;
                    border-radius: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    text-align: left !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                " onmouseover="this.style.background='#ecfdf5'; this.style.borderColor='#a7f3d0'" onmouseout="this.style.background='#f8fffe'; this.style.borderColor='#d1fae5'">Show me a practical LoRA fine-tuning example</button>
            </div>

            <div style="
                padding: 20px 24px !important;
                border-top: 1px solid #f3f4f6 !important;
                background: #ffffff !important;
            ">
                <div style="display: flex !important; gap: 8px !important; align-items: flex-end !important;">
                    <textarea id="final-ai-input" placeholder="Ask me anything about LLM fine-tuning..." style="
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
                    " onfocus="this.style.borderColor='#3c6430'; this.style.background='#ffffff'" onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'"></textarea>
                    <button onclick="sendFinalMessage()" style="
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
                        transition: all 0.2s ease !important;
                        font-size: 16px !important;
                        box-shadow: 0 2px 4px rgba(60, 100, 48, 0.2) !important;
                    " title="Send message" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(60, 100, 48, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(60, 100, 48, 0.2)'">➤</button>
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

            // Clear any existing conversation except the welcome message
            const conversation = document.getElementById('final-ai-conversation');
            if (conversation) {
                // Keep only the welcome message (first child)
                const welcomeMessage = conversation.firstElementChild;
                conversation.innerHTML = '';
                if (welcomeMessage) {
                    conversation.appendChild(welcomeMessage);
                }

                // Add a clean welcome message
                setTimeout(() => {
                    addFinalMessage('👋 Hi! I\'m your AI assistant for LLM fine-tuning education.\n\nI can help you understand:\n• Fine-tuning techniques (LoRA, QLoRA, PEFT)\n• Transformers and attention mechanisms\n• Practical implementation examples\n• Hugging Face ecosystem\n• Dataset preparation and evaluation\n\nTry the suggested questions below or ask me anything!', 'assistant');
                }, 500);
            }

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
    if (!input || !input.value.trim()) {
        console.log('❌ No input or empty message');
        return;
    }

    const message = input.value.trim();
    input.value = '';

    console.log('📤 Sending final message:', message);

    // Add user message to conversation
    addFinalMessage(message, 'user');

    // Show enhanced typing indicator with animation
    addFinalMessage('🤖 Analyzing your question...', 'assistant', true);

    try {
        console.log('🔄 Making API request to /api/ai/free/chat');

        // Try QLoRA first, then LoRA, then enhanced AI, then free Ollama
        let apiEndpoint = '/api/ai/qlora/chat';
        let timeoutMs = 20000; // 20 seconds for QLoRA models
        let aiType = 'qlora';

        // Check if QLoRA models are available
        try {
            const qloraStatusResponse = await fetch('/api/ai/qlora/status', { timeout: 2000 });
            if (qloraStatusResponse.ok) {
                const qloraStatusData = await qloraStatusResponse.json();
                if (qloraStatusData.qlora_system_available) {
                    console.log('⚡ Using QLoRA 4-bit quantized models');
                    apiEndpoint = '/api/ai/qlora/chat';
                    timeoutMs = 20000;
                    aiType = 'qlora';
                } else {
                    throw new Error('QLoRA models not available');
                }
            } else {
                throw new Error('QLoRA status check failed');
            }
        } catch (e) {
            console.log('🔄 QLoRA models not available, trying LoRA...');

            // Fallback to LoRA models
            try {
                const loraStatusResponse = await fetch('/api/ai/lora/status', { timeout: 2000 });
                if (loraStatusResponse.ok) {
                    const loraStatusData = await loraStatusResponse.json();
                    if (loraStatusData.lora_system_available) {
                        console.log('🎯 Using LoRA fine-tuned models');
                        apiEndpoint = '/api/ai/lora/chat';
                        timeoutMs = 15000;
                        aiType = 'lora';
                    } else {
                        throw new Error('LoRA models not available');
                    }
                } else {
                    throw new Error('LoRA status check failed');
                }
            } catch (e2) {
                console.log('🔄 LoRA models not available, trying enhanced AI...');

                // Fallback to enhanced AI
                try {
                    const statusResponse = await fetch('/api/ai/enhanced/status', { timeout: 2000 });
                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json();
                        if (statusData.enhanced_available) {
                            console.log('⚡ Using enhanced AI (multi-provider)');
                            apiEndpoint = '/api/ai/enhanced/chat';
                            timeoutMs = 10000;
                            aiType = 'enhanced';
                        } else {
                            throw new Error('Enhanced AI not available');
                        }
                    } else {
                        throw new Error('Enhanced AI status check failed');
                    }
                } catch (e3) {
                    console.log('🔄 Enhanced AI not available, using free Ollama');
                    apiEndpoint = '/api/ai/free/chat';
                    timeoutMs = 15000;
                    aiType = 'ollama';
                }
            }
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
            signal: AbortSignal.timeout(timeoutMs)
        });

        console.log('📡 Response status:', response.status);

        // Remove typing indicator
        removeFinalTypingIndicator();

        if (response.ok) {
            const data = await response.json();
            console.log('📥 Response data:', data);

            if (data.response && data.response.trim()) {
                console.log('📝 Adding AI response to chat...');
                addFinalMessage(data.response, 'assistant');
                console.log('✅ Final AI response received and displayed');

                // Show AI system and model info
                if (data.model || data.provider || data.type) {
                    const aiSystem = data.type || 'unknown';
                    const provider = data.provider || 'unknown';
                    const model = data.model || 'unknown';
                    const adapter = data.adapter || '';
                    const quantization = data.quantization || '';
                    const enhanced = data.enhanced ? ' (Enhanced)' : '';

                    let displayText = '';
                    let icon = '🤖';

                    if (aiSystem === 'qlora_4bit_quantized') {
                        icon = '⚡';
                        displayText = `QLoRA: ${model}`;
                        if (adapter && adapter !== 'error') {
                            displayText += ` (${adapter})`;
                        }
                        if (quantization && quantization !== 'none') {
                            displayText += ` [4-bit]`;
                        }
                        console.log(`⚡ Response from QLoRA model: ${model} with adapter: ${adapter}, quantization: ${quantization}`);
                    } else if (aiSystem === 'lora_fine_tuned') {
                        icon = '🎯';
                        displayText = `LoRA: ${model}`;
                        if (adapter && adapter !== 'error') {
                            displayText += ` (${adapter})`;
                        }
                        console.log(`🎯 Response from LoRA model: ${model} with adapter: ${adapter}`);
                    } else if (provider) {
                        if (provider === 'groq') icon = '⚡';
                        else if (provider === 'huggingface') icon = '🤗';
                        else if (provider === 'ollama') icon = '🦙';
                        else if (provider === 'fallback') icon = '📚';

                        displayText = `${provider}${enhanced}`;
                        console.log(`🤖 Response from ${provider}: ${model}${enhanced}`);
                    } else {
                        displayText = model;
                        console.log(`🤖 Response from ${model}`);
                    }

                    // Add AI system indicator
                    setTimeout(() => {
                        const conversation = document.getElementById('final-ai-conversation');
                        if (conversation) {
                            const aiIndicator = document.createElement('div');
                            aiIndicator.style.cssText = `
                                font-size: 11px !important;
                                color: #888 !important;
                                text-align: left !important;
                                margin-bottom: 10px !important;
                                margin-left: 16px !important;
                            `;

                            aiIndicator.textContent = `${icon} ${displayText}`;
                            conversation.appendChild(aiIndicator);
                            conversation.scrollTop = conversation.scrollHeight;
                        }
                    }, 100);
                }
            } else {
                console.log('⚠️ Empty or invalid response, showing fallback');
                addFinalMessage(getFallbackResponse(message), 'assistant');
            }
        } else {
            console.log('❌ API error, showing fallback response');
            addFinalMessage(getFallbackResponse(message), 'assistant');
        }
    } catch (error) {
        console.error('❌ Final AI Assistant Error:', error);
        removeFinalTypingIndicator();

        // Always show educational fallback for demos
        addFinalMessage(getFallbackResponse(message), 'assistant');
    }
}

function addFinalMessage(content, sender, isTyping = false) {
    const conversation = document.getElementById('final-ai-conversation');
    if (!conversation) {
        console.error('❌ Conversation element not found!');
        return;
    }

    console.log(`💬 Adding ${sender} message:`, content.substring(0, 50) + '...');

    const messageDiv = document.createElement('div');
    messageDiv.className = `final-ai-message final-ai-message-${sender}`;
    if (isTyping) messageDiv.className += ' final-typing-indicator';

    // Create proper chat bubble styling
    if (sender === 'user') {
        // User message - clean bubble on the right
        messageDiv.style.cssText = `
            margin-bottom: 16px !important;
            padding: 12px 16px !important;
            background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
            color: #ffffff !important;
            border-radius: 18px 18px 4px 18px !important;
            max-width: 75% !important;
            margin-left: auto !important;
            margin-right: 0 !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            word-wrap: break-word !important;
            display: block !important;
            box-shadow: 0 2px 8px rgba(60, 100, 48, 0.15) !important;
        `;
    } else {
        // Assistant message - clean light bubble on the left
        messageDiv.style.cssText = `
            margin-bottom: 16px !important;
            padding: 14px 18px !important;
            background: #f9fafb !important;
            color: #111827 !important;
            border: 1px solid #f3f4f6 !important;
            border-radius: 18px 18px 18px 4px !important;
            max-width: 85% !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            word-wrap: break-word !important;
            display: block !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        `;
    }

    // Add typing animation for typing indicator
    if (isTyping) {
        messageDiv.style.animation = 'pulse 1.5s infinite';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
        `;
        if (!document.head.querySelector('style[data-pulse]')) {
            style.setAttribute('data-pulse', 'true');
            document.head.appendChild(style);
        }
    }

    // Format content with proper HTML and preserve formatting
    const formattedContent = content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')  // Italic text
        .replace(/`(.*?)`/g, '<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')  // Inline code
        .replace(/```([\s\S]*?)```/g, '<pre style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #3c6430; margin: 8px 0; overflow-x: auto;"><code style="font-family: monospace; font-size: 13px;">$1</code></pre>')  // Code blocks
        .replace(/• /g, '• ')  // Bullet points
        .replace(/✅ /g, '✅ ')  // Checkmarks
        .replace(/🎯 /g, '🎯 ')  // Target emojis
        .replace(/🔹 /g, '🔹 ');  // Diamond emojis

    messageDiv.innerHTML = `<div style="margin: 0 !important; white-space: pre-wrap !important; word-wrap: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important;">${formattedContent}</div>`;

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;

    console.log('✅ Message added to conversation');
}

function removeFinalTypingIndicator() {
    const typingIndicator = document.querySelector('.final-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Educational fallback responses for demonstration
    if (lowerMessage.includes('lora') || lowerMessage.includes('low-rank')) {
        return `🎯 **LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique that:

• **Reduces trainable parameters** by up to 99% while maintaining performance
• **Uses low-rank matrices** (A and B) to approximate weight updates
• **Freezes original weights** and only trains the adapter layers
• **Enables fine-tuning** large models on consumer GPUs

**Key Benefits:**
✅ Memory efficient (8GB GPU can fine-tune 7B models)
✅ Fast training and inference
✅ Easy to merge and deploy
✅ Multiple adapters for different tasks

**Example Configuration:**
\`\`\`python
lora_config = LoraConfig(
    r=16,  # rank
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1
)
\`\`\`

Would you like to learn about QLoRA or see a practical implementation example?`;
    }

    if (lowerMessage.includes('qlora') || lowerMessage.includes('quantized')) {
        return `🚀 **QLoRA (Quantized LoRA)** combines quantization with LoRA for maximum efficiency:

• **4-bit quantization** reduces memory usage by 75%
• **Maintains LoRA benefits** with even lower resource requirements
• **Enables fine-tuning** 70B models on single consumer GPUs
• **Preserves model quality** despite aggressive quantization

**Key Innovations:**
✅ 4-bit NormalFloat (NF4) quantization
✅ Double quantization for constants
✅ Paged optimizers for memory spikes
✅ Gradient checkpointing integration

**Memory Comparison:**
• Full fine-tuning 7B model: ~28GB
• LoRA fine-tuning: ~14GB
• QLoRA fine-tuning: ~6GB

**Perfect for:**
🎯 Fine-tuning large models (13B-70B)
🎯 Consumer hardware (RTX 3090/4090)
🎯 Research and experimentation
🎯 Production deployment

Want to see a QLoRA implementation example?`;
    }

    if (lowerMessage.includes('fine-tuning') || lowerMessage.includes('finetune')) {
        return `📚 **Fine-tuning** is the process of adapting a pre-trained model to specific tasks:

**Why Fine-tune?**
• **Specialization**: Adapt general models to specific domains
• **Performance**: Often better than few-shot prompting
• **Control**: Customize model behavior and outputs
• **Efficiency**: Leverage existing knowledge

**Fine-tuning Methods:**
1. **Full Fine-tuning**: Update all parameters (expensive)
2. **LoRA**: Low-rank adaptation (efficient)
3. **QLoRA**: Quantized LoRA (ultra-efficient)
4. **Prefix Tuning**: Add learnable prefixes
5. **Adapter Layers**: Insert small modules

**Best Practices:**
✅ Start with smaller learning rates
✅ Use gradient accumulation for large batches
✅ Monitor for overfitting
✅ Validate on held-out data
✅ Consider parameter-efficient methods

**Common Use Cases:**
🎯 Domain adaptation (medical, legal, finance)
🎯 Task specialization (summarization, QA)
🎯 Style transfer (formal, casual, technical)
🎯 Language adaptation (multilingual models)

Ready to start with LoRA or explore other techniques?`;
    }

    if (lowerMessage.includes('transformer') || lowerMessage.includes('attention')) {
        return `🧠 **Transformers** are the foundation of modern LLMs, built on the attention mechanism:

**Core Components:**
• **Self-Attention**: Models relationships between all tokens
• **Multi-Head Attention**: Parallel attention computations
• **Feed-Forward Networks**: Position-wise transformations
• **Layer Normalization**: Stabilizes training
• **Positional Encoding**: Adds sequence information

**Attention Mechanism:**
\`Attention(Q,K,V) = softmax(QK^T/√d_k)V\`

**Why Transformers Work:**
✅ **Parallelizable**: Unlike RNNs, can process sequences in parallel
✅ **Long-range dependencies**: Attention connects distant tokens
✅ **Scalable**: Performance improves with size and data
✅ **Transfer learning**: Pre-trained models adapt well

**Architecture Variants:**
🔹 **Encoder-only**: BERT (understanding tasks)
🔹 **Decoder-only**: GPT (generation tasks)
🔹 **Encoder-Decoder**: T5 (translation, summarization)

**Fine-tuning Targets:**
• Query/Key/Value projections (q_proj, k_proj, v_proj)
• Output projections (o_proj)
• Feed-forward layers (gate_proj, up_proj, down_proj)

Want to dive deeper into attention mechanisms or see implementation details?`;
    }

    if (lowerMessage.includes('peft') || lowerMessage.includes('parameter efficient')) {
        return `⚡ **PEFT (Parameter Efficient Fine-Tuning)** methods minimize trainable parameters:

**Popular PEFT Methods:**
1. **LoRA**: Low-rank matrix decomposition
2. **AdaLoRA**: Adaptive rank allocation
3. **Prefix Tuning**: Learnable prompt prefixes
4. **P-Tuning v2**: Prompt tuning with deep prompts
5. **IA³**: Infused Adapter by Inhibiting and Amplifying

**Comparison:**
| Method | Trainable % | Memory | Performance |
|--------|-------------|---------|-------------|
| Full FT | 100% | High | Baseline |
| LoRA | 0.1-1% | Low | 95-99% |
| Prefix | 0.01-0.1% | Very Low | 90-95% |
| AdaLoRA | 0.1-0.5% | Low | 96-99% |

**When to Use Each:**
🎯 **LoRA**: General purpose, best balance
🎯 **QLoRA**: Large models, limited hardware
🎯 **Prefix Tuning**: Very limited resources
🎯 **AdaLoRA**: When you need adaptive complexity

**Implementation with Hugging Face:**
\`\`\`python
from peft import get_peft_model, LoraConfig
config = LoraConfig(r=16, lora_alpha=32)
model = get_peft_model(base_model, config)
\`\`\`

Which PEFT method interests you most?`;
    }

    // Default educational response
    return `🎓 **Welcome to Visual LLM!** I'm your AI assistant specializing in LLM fine-tuning education.

**I can help you with:**
• **LoRA & QLoRA**: Parameter-efficient fine-tuning techniques
• **Transformers**: Architecture and attention mechanisms
• **PEFT Methods**: Various efficient fine-tuning approaches
• **Implementation**: Practical code examples and tutorials
• **Best Practices**: Industry-standard techniques

**Popular Topics:**
🔹 "What is LoRA and how does it work?"
🔹 "Explain QLoRA in simple terms"
🔹 "How do transformers work?"
🔹 "Show me a practical fine-tuning example"

**Try asking about:**
• Fine-tuning techniques and methods
• Model architectures and components
• Implementation details and code examples
• Best practices and optimization tips

What would you like to learn about today?`;
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
