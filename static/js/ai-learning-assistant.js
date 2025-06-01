/**
 * AI Learning Assistant
 * Comprehensive AI assistant for LLM fine-tuning education and support
 * Provides intelligent responses, explanations, and learning guidance
 */

class AILearningAssistant {
    constructor() {
        this.isInitialized = false;
        this.isOpen = false;
        this.conversationHistory = [];
        this.currentContext = null;
        this.knowledgeBase = null;
        this.isTyping = false;
        this.isFullscreen = false;
        this.notifications = [];
        this.conversationMemory = [];
        this.notificationSettings = {
            enabled: true,
            sound: true,
            desktop: true
        };
        this.autoSpeak = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = null;
        this.init();
    }

    init() {
        try {
            console.log('Starting AI Learning Assistant initialization...');
            this.loadKnowledgeBase();
            this.loadNotificationSettings();
            this.createAssistantInterface();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.detectPageContext();

            // Create sample notifications for demonstration
            setTimeout(() => {
                this.createSampleNotifications();
            }, 2000);

            this.isInitialized = true;
            console.log('AI Learning Assistant initialized successfully');

            // Debug: Check if floating container exists
            setTimeout(() => {
                const container = document.getElementById('ai-floating-container');
                console.log('Floating container check:', container ? 'Found' : 'Not found');
                if (container) {
                    console.log('Container styles:', window.getComputedStyle(container));
                }
            }, 1000);
        } catch (error) {
            console.error('Failed to initialize AI Learning Assistant:', error);
        }
    }

    loadKnowledgeBase() {
        // Comprehensive knowledge base for LLM fine-tuning
        this.knowledgeBase = {
            'lora': {
                definition: 'LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that reduces the number of trainable parameters by learning rank decomposition matrices.',
                benefits: ['Reduced memory usage', 'Faster training', 'Smaller model files', 'Easy to merge/unmerge'],
                use_cases: ['Task-specific adaptation', 'Domain adaptation', 'Style transfer', 'Instruction following']
            },
            'qlora': {
                definition: 'QLoRA (Quantized LoRA) combines 4-bit quantization with LoRA to enable fine-tuning of large models on consumer hardware.',
                benefits: ['Extremely memory efficient', 'Maintains performance', 'Accessible on consumer GPUs', 'Cost-effective'],
                use_cases: ['Large model fine-tuning', 'Resource-constrained environments', 'Experimentation', 'Rapid prototyping']
            },
            'transformers': {
                definition: 'The Transformers library by Hugging Face provides state-of-the-art pre-trained models and tools for NLP tasks.',
                key_features: ['Pre-trained models', 'Easy fine-tuning', 'Multi-framework support', 'Community hub'],
                common_models: ['BERT', 'GPT', 'T5', 'LLaMA', 'Mistral', 'Phi']
            },
            'peft': {
                definition: 'PEFT (Parameter-Efficient Fine-Tuning) is a library for efficiently adapting pre-trained language models to various downstream applications.',
                methods: ['LoRA', 'AdaLoRA', 'Prefix Tuning', 'P-Tuning', 'Prompt Tuning'],
                advantages: ['Memory efficient', 'Fast training', 'Modular adapters', 'Easy deployment']
            },
            'fine_tuning': {
                definition: 'Fine-tuning is the process of adapting a pre-trained model to a specific task or domain by training on task-specific data.',
                types: ['Full fine-tuning', 'Parameter-efficient fine-tuning', 'Instruction tuning', 'RLHF'],
                best_practices: ['Quality data', 'Proper validation', 'Learning rate scheduling', 'Regularization']
            }
        };
    }

    createAssistantInterface() {
        // Create main assistant container with exact design from image
        const assistantContainer = document.createElement('div');
        assistantContainer.id = 'ai-learning-assistant';
        assistantContainer.className = 'ai-assistant-container';
        assistantContainer.innerHTML = `
            <div class="ai-assistant-header">
                <div class="ai-assistant-title">
                    <div class="ai-avatar">
                        <i class="bi bi-robot"></i>
                    </div>
                    <div class="ai-title-text">
                        <h4>AI Assistant</h4>
                        <div class="ai-controls-inline">
                            <label class="ai-toggle-switch">
                                <span class="ai-toggle-label">Auto-speak</span>
                                <input type="checkbox" id="auto-speak-toggle">
                                <span class="ai-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="ai-assistant-controls">
                    <button class="ai-copy-btn" title="Copy Conversation">
                        <i class="bi bi-clipboard"></i>
                    </button>
                    <button class="ai-close-btn" title="Close">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>

            <div class="ai-assistant-body">
                <div class="ai-conversation-area" id="ai-conversation">
                    <div class="ai-welcome-message">
                        <div class="ai-message ai-message-assistant">
                            <div class="ai-message-content">
                                <p>platform. I can help you with: <strong>1. Learning about LLM fine-tuning</strong> techniques like LoRA, QLoRA, and other parameter-efficient methods. <strong>2. Code examples</strong> and implementation guides. <strong>3. Navigation</strong> through workshops, tutorials, and resources. <strong>4. Best practices</strong> and troubleshooting tips.</p>
                            </div>
                        </div>
                    </div>
                </div>
                    <div class="ai-quick-suggestions">
                        <button class="ai-suggestion-btn" data-query="What is this platform about?">
                            What is this platform about?
                        </button>
                        <button class="ai-suggestion-btn" data-query="How do I navigate this website?">
                            How do I navigate this website?
                        </button>
                        <button class="ai-suggestion-btn" data-query="What features does this platform offer?">
                            What features does this platform offer?
                        </button>
                        <button class="ai-suggestion-btn" data-query="How do I get started with LLM fine-tuning?">
                            How do I get started with LLM fine-tuning?
                        </button>
                    </div>
                    <div class="ai-input-area">
                        <div class="ai-typing-indicator" id="ai-typing" style="display: none;">
                            <span>AI is thinking</span>
                            <div class="ai-typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div class="ai-input-container">
                            <textarea
                                id="ai-input"
                                placeholder="Ask me anything..."
                                rows="1"
                            ></textarea>
                            <button id="ai-mic-btn" class="ai-action-button" title="Voice Input">
                                <i class="bi bi-mic"></i>
                            </button>
                            <button id="ai-speaker-btn" class="ai-action-button" title="Text to Speech">
                                <i class="bi bi-volume-up"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(assistantContainer);

        // Create floating action menu container - DISABLED (Final AI Assistant handles this)
        console.log('Floating AI container creation disabled - Final AI Assistant handles this...');
        return; // Exit early to prevent duplicate buttons

        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'ai-floating-container';
        floatingContainer.className = 'ai-floating-container';

        // Main AI assistant button
        const floatingButton = document.createElement('div');
        floatingButton.id = 'ai-assistant-float-btn';
        floatingButton.className = 'ai-floating-button ai-main-button';
        floatingButton.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-robot"></i>
            </div>
            <div class="ai-float-tooltip">AI Assistant</div>
        `;

        // Quick help button
        const quickHelpButton = document.createElement('div');
        quickHelpButton.id = 'ai-quick-help-btn';
        quickHelpButton.className = 'ai-floating-button ai-feature-button';
        quickHelpButton.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-question-circle"></i>
            </div>
            <div class="ai-float-tooltip">Quick Help</div>
        `;

        // Voice assistant button
        const voiceButton = document.createElement('div');
        voiceButton.id = 'ai-voice-btn';
        voiceButton.className = 'ai-floating-button ai-feature-button';
        voiceButton.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-mic"></i>
            </div>
            <div class="ai-float-tooltip">Voice Assistant</div>
        `;

        // Code helper button
        const codeButton = document.createElement('div');
        codeButton.id = 'ai-code-btn';
        codeButton.className = 'ai-floating-button ai-feature-button';
        codeButton.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-code-slash"></i>
            </div>
            <div class="ai-float-tooltip">Code Helper</div>
        `;

        // Learning path button
        const learningButton = document.createElement('div');
        learningButton.id = 'ai-learning-btn';
        learningButton.className = 'ai-floating-button ai-feature-button';
        learningButton.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-book"></i>
            </div>
            <div class="ai-float-tooltip">Learning Path</div>
        `;

        // Menu toggle button
        const menuToggle = document.createElement('div');
        menuToggle.id = 'ai-menu-toggle';
        menuToggle.className = 'ai-floating-button ai-menu-toggle';
        menuToggle.innerHTML = `
            <div class="ai-float-icon">
                <i class="bi bi-plus"></i>
            </div>
            <div class="ai-float-tooltip">More Options</div>
        `;

        // Assemble the floating container
        floatingContainer.appendChild(quickHelpButton);
        floatingContainer.appendChild(voiceButton);
        floatingContainer.appendChild(codeButton);
        floatingContainer.appendChild(learningButton);
        floatingContainer.appendChild(floatingButton);
        floatingContainer.appendChild(menuToggle);

        // Hide the complex floating container initially - let simple button handle display
        floatingContainer.style.display = 'none';

        document.body.appendChild(floatingContainer);

        console.log('AI floating container created and appended to body (hidden)');
        console.log('Container ID:', floatingContainer.id);
        console.log('Container classes:', floatingContainer.className);
    }

    setupEventListeners() {
        // Main floating button click
        const floatingBtn = document.getElementById('ai-assistant-float-btn');
        floatingBtn.addEventListener('click', () => this.toggleAssistant());

        // Menu toggle functionality
        const menuToggle = document.getElementById('ai-menu-toggle');
        const floatingContainer = document.getElementById('ai-floating-container');
        let menuExpanded = false;

        menuToggle.addEventListener('click', () => {
            menuExpanded = !menuExpanded;
            floatingContainer.classList.toggle('menu-expanded', menuExpanded);

            const icon = menuToggle.querySelector('i');
            icon.className = menuExpanded ? 'bi bi-x' : 'bi bi-plus';

            const tooltip = menuToggle.querySelector('.ai-float-tooltip');
            tooltip.textContent = menuExpanded ? 'Close Menu' : 'More Options';
        });

        // Feature button event listeners
        const quickHelpBtn = document.getElementById('ai-quick-help-btn');
        const voiceBtn = document.getElementById('ai-voice-btn');
        const codeBtn = document.getElementById('ai-code-btn');
        const learningBtn = document.getElementById('ai-learning-btn');

        quickHelpBtn.addEventListener('click', () => this.openAssistantWithQuery('help'));
        voiceBtn.addEventListener('click', () => this.openAssistantWithQuery('voice assistant features'));
        codeBtn.addEventListener('click', () => this.openAssistantWithQuery('show me code examples'));
        learningBtn.addEventListener('click', () => this.openAssistantWithQuery('getting started'));

        // Close and copy buttons
        const closeBtn = document.querySelector('.ai-close-btn');
        const copyBtn = document.querySelector('.ai-copy-btn');

        closeBtn.addEventListener('click', () => this.closeAssistant());
        copyBtn.addEventListener('click', () => this.copyConversation());

        // Auto-speak toggle
        const autoSpeakToggle = document.getElementById('auto-speak-toggle');
        autoSpeakToggle.addEventListener('change', (e) => {
            this.autoSpeak = e.target.checked;
            console.log('Auto-speak:', this.autoSpeak ? 'enabled' : 'disabled');
        });

        // Voice and speaker buttons
        const micBtn = document.getElementById('ai-mic-btn');
        const speakerBtn = document.getElementById('ai-speaker-btn');
        const input = document.getElementById('ai-input');

        micBtn.addEventListener('click', () => this.toggleVoiceInput());
        speakerBtn.addEventListener('click', () => this.toggleTextToSpeech());

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => this.autoResizeTextarea(input));

        // Suggestion buttons
        const suggestionBtns = document.querySelectorAll('.ai-suggestion-btn');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                input.value = query;
                this.sendMessage();
            });
        });

        // Tab switching
        const tabBtns = document.querySelectorAll('.ai-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.getAttribute('data-tab'));
            });
        });

        // Notification controls
        const markAllReadBtn = document.getElementById('mark-all-read');
        const notificationSettingsBtn = document.getElementById('notification-settings');

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllNotificationsRead());
        }

        if (notificationSettingsBtn) {
            notificationSettingsBtn.addEventListener('click', () => this.openNotificationSettings());
        }

        // Notification filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterNotifications(btn.getAttribute('data-filter'));
            });
        });

        // Click outside to close (optional)
        document.addEventListener('click', (e) => {
            const assistant = document.getElementById('ai-learning-assistant');
            const floatingBtn = document.getElementById('ai-assistant-float-btn');

            if (this.isOpen && !assistant.contains(e.target) && !floatingBtn.contains(e.target)) {
                // Optional: uncomment to close on outside click
                // this.closeAssistant();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A to toggle assistant
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggleAssistant();
            }

            // Escape to close assistant
            if (e.key === 'Escape' && this.isOpen) {
                this.closeAssistant();
            }
        });
    }

    detectPageContext() {
        // Detect current page context for contextual assistance
        const path = window.location.pathname;
        const title = document.title;

        if (path.includes('workshop') || title.includes('Workshop')) {
            this.currentContext = 'workshop';
        } else if (path.includes('tutorial') || title.includes('Tutorial')) {
            this.currentContext = 'tutorial';
        } else if (path.includes('learn') || title.includes('Learn')) {
            this.currentContext = 'learning';
        } else {
            this.currentContext = 'general';
        }
    }

    toggleAssistant() {
        if (this.isOpen) {
            this.closeAssistant();
        } else {
            this.openAssistant();
        }
    }

    openAssistant() {
        const assistant = document.getElementById('ai-learning-assistant');
        const floatingBtn = document.getElementById('ai-assistant-float-btn');
        const simpleBtn = document.getElementById('simple-ai-button');

        assistant.classList.add('ai-assistant-open');
        if (floatingBtn) floatingBtn.style.display = 'none';
        if (simpleBtn) simpleBtn.style.display = 'none';
        this.isOpen = true;

        // Focus on input
        setTimeout(() => {
            document.getElementById('ai-input').focus();
        }, 300);

        // Add contextual greeting if first time opening on this page
        if (this.conversationHistory.length === 0) {
            this.addContextualGreeting();
        }

        // Load contextual suggestions
        this.loadContextualSuggestions();

        // Create a welcome notification when first opened
        if (this.notifications.length === 0) {
            setTimeout(() => {
                this.addNotification({
                    id: 'welcome-' + Date.now(),
                    title: 'Welcome to AI Assistant!',
                    body: 'I\'m here to help you with LLM fine-tuning. Check the notifications tab for updates and tips.',
                    icon: 'bi bi-robot',
                    type: 'welcome',
                    timestamp: Date.now(),
                    read: false,
                    important: false
                });
            }, 1000);
        }
    }

    closeAssistant() {
        const assistant = document.getElementById('ai-learning-assistant');
        const floatingBtn = document.getElementById('ai-assistant-float-btn');
        const simpleBtn = document.getElementById('simple-ai-button');

        assistant.classList.remove('ai-assistant-open');
        if (floatingBtn) floatingBtn.style.display = 'flex';
        if (simpleBtn) simpleBtn.style.display = 'block';
        this.isOpen = false;
    }

    minimizeAssistant() {
        const assistant = document.getElementById('ai-learning-assistant');
        assistant.classList.toggle('ai-assistant-minimized');
    }

    toggleFullscreen() {
        const assistant = document.getElementById('ai-learning-assistant');
        const fullscreenBtn = document.querySelector('.ai-fullscreen-btn');

        if (!this.isFullscreen) {
            // Enter fullscreen mode
            assistant.classList.add('ai-assistant-fullscreen');
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            fullscreenBtn.title = 'Exit Full Page Mode';
            this.isFullscreen = true;

            // Create fullscreen overlay
            const overlay = document.createElement('div');
            overlay.id = 'ai-fullscreen-overlay';
            overlay.className = 'ai-fullscreen-overlay';
            document.body.appendChild(overlay);

            // Disable body scroll
            document.body.style.overflow = 'hidden';

            // Add enhanced welcome message for fullscreen
            this.addMessage(`**🚀 Welcome to Full Page AI Assistant Mode!**

You now have access to an enhanced, miniature LLM experience with:

**🧠 Advanced Capabilities:**
• **Contextual Memory** - I remember our conversation history
• **Deep Knowledge Base** - Comprehensive LLM fine-tuning expertise
• **Code Generation** - Complete, working implementations
• **Multi-turn Conversations** - Natural, flowing discussions
• **Personalized Responses** - Adapted to your learning level

**💡 Enhanced Features:**
• **Larger Interface** - More space for detailed explanations
• **Better Code Display** - Syntax highlighting and formatting
• **Rich Content** - Images, diagrams, and interactive elements
• **Extended Responses** - In-depth tutorials and guides

**🎯 What You Can Do:**
• Ask complex, multi-part questions
• Request detailed code walkthroughs
• Get personalized learning paths
• Explore advanced topics in depth
• Have natural conversations about LLM concepts

Try asking something like: *"Walk me through implementing a complete LoRA fine-tuning pipeline with error handling and best practices"*

What would you like to explore in this enhanced mode?`, 'assistant');

        } else {
            // Exit fullscreen mode
            assistant.classList.remove('ai-assistant-fullscreen');
            fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
            fullscreenBtn.title = 'Full Page Mode';
            this.isFullscreen = false;

            // Remove fullscreen overlay
            const overlay = document.getElementById('ai-fullscreen-overlay');
            if (overlay) {
                overlay.remove();
            }

            // Re-enable body scroll
            document.body.style.overflow = '';

            this.addMessage('**📱 Switched back to compact mode.** You can still access all features, just in a smaller interface. Click the fullscreen button anytime to expand again!', 'assistant');
        }
    }

    openAssistantWithQuery(query) {
        // Open the assistant if not already open
        if (!this.isOpen) {
            this.openAssistant();
        }

        // Wait for assistant to open, then send the query
        setTimeout(() => {
            const input = document.getElementById('ai-input');
            input.value = query;
            this.sendMessage();

            // Close the floating menu if expanded
            const floatingContainer = document.getElementById('ai-floating-container');
            const menuToggle = document.getElementById('ai-menu-toggle');

            if (floatingContainer.classList.contains('menu-expanded')) {
                floatingContainer.classList.remove('menu-expanded');
                const icon = menuToggle.querySelector('i');
                icon.className = 'bi bi-plus';
                const tooltip = menuToggle.querySelector('.ai-float-tooltip');
                tooltip.textContent = 'More Options';
            }
        }, this.isOpen ? 100 : 400);
    }

    addContextualGreeting() {
        let contextMessage = '';

        switch (this.currentContext) {
            case 'workshop':
                contextMessage = "I see you're in a workshop! I can help explain the concepts, provide code examples, or answer questions about the exercises.";
                break;
            case 'tutorial':
                contextMessage = "You're viewing a tutorial! Feel free to ask me to clarify any concepts or provide additional examples.";
                break;
            case 'learning':
                contextMessage = "Welcome to the learning section! I'm here to help you understand LLM fine-tuning concepts and techniques.";
                break;
            default:
                contextMessage = "I'm ready to help you with any LLM fine-tuning questions you might have!";
        }

        if (contextMessage) {
            this.addMessage(contextMessage, 'assistant');
        }
    }

    sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();

        if (!message) {
            console.log('❌ No message to send');
            return;
        }

        console.log('📤 Sending message:', message);

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        this.autoResizeTextarea(input);

        // Show typing indicator
        this.showTypingIndicator();

        // Send message to AI API
        this.sendToAIAPI(message);
    }

    async sendToAIAPI(message) {
        try {
            console.log('🌐 Sending message to AI API:', message);

            // Get current page context
            const context = {
                current_page: window.location.pathname.split('/')[1] || 'home',
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                conversation_length: this.conversationHistory.length
            };

            console.log('📋 Context:', context);

            // Send to AI API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: context
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('📡 API Response status:', response.status);
            console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API Response data:', data);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add AI response
            this.addMessage(data.response, 'assistant');

            // Add contextual notification
            this.createContextualNotification(message);

            console.log('✅ Message processed successfully');

        } catch (error) {
            console.error('❌ Error sending message to AI API:', error);
            console.error('❌ Error stack:', error.stack);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Determine error type and provide appropriate fallback
            let fallbackResponse;
            let notificationMessage;

            if (error.name === 'AbortError') {
                fallbackResponse = "⏱️ **Request Timeout**\n\nThe request took too long to process. Please try again with a shorter message.";
                notificationMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
                fallbackResponse = "🔌 **Connection Error**\n\nUnable to connect to the AI service. Using offline mode.";
                notificationMessage = 'Connection failed. Using offline mode.';
            } else {
                fallbackResponse = this.generateResponse(message);
                notificationMessage = 'Using offline mode. Some features may be limited.';
            }

            // Add fallback response
            this.addMessage(fallbackResponse, 'assistant');

            // Show error notification
            this.addNotification({
                id: 'error-' + Date.now(),
                title: 'Connection Issue',
                body: notificationMessage,
                type: 'warning',
                timestamp: Date.now(),
                read: false,
                important: false
            });
        }
    }

    getCSRFToken() {
        // Get CSRF token from meta tag or cookie
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }

        // Fallback to cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrf_token') {
                return value;
            }
        }

        return '';
    }

    async loadContextualSuggestions() {
        try {
            // Get current page context
            const currentPage = window.location.pathname.split('/')[1] || 'home';
            const response = await fetch(`/api/ai/suggestions?page=${currentPage}`);

            if (response.ok) {
                const data = await response.json();
                const suggestions = data.suggestions || [];

                // Update quick actions with contextual suggestions
                this.updateQuickActions(suggestions);
            }
        } catch (error) {
            console.error('Error loading contextual suggestions:', error);
            // Keep default suggestions if API fails
        }
    }

    updateQuickActions(suggestions) {
        const quickActionsContainer = document.getElementById('ai-quick-actions');
        if (!quickActionsContainer || suggestions.length === 0) return;

        // Clear existing actions
        quickActionsContainer.innerHTML = '';

        // Add new contextual suggestions
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'ai-quick-btn';
            button.setAttribute('data-query', suggestion);
            button.innerHTML = `${this.getIconForSuggestion(suggestion)} ${suggestion}`;

            button.addEventListener('click', () => {
                const input = document.getElementById('ai-input');
                input.value = suggestion;
                this.sendMessage();
            });

            quickActionsContainer.appendChild(button);
        });
    }

    getIconForSuggestion(suggestion) {
        const text = suggestion.toLowerCase();
        if (text.includes('lora') || text.includes('qlora')) return '🔧';
        if (text.includes('workshop') || text.includes('tutorial')) return '🛠️';
        if (text.includes('quiz') || text.includes('test')) return '📝';
        if (text.includes('navigate') || text.includes('find')) return '🧭';
        if (text.includes('code') || text.includes('implement')) return '💻';
        if (text.includes('learn') || text.includes('study')) return '📚';
        if (text.includes('progress') || text.includes('track')) return '📊';
        if (text.includes('what is') || text.includes('explain')) return '❓';
        if (text.includes('show me') || text.includes('example')) return '👁️';
        if (text.includes('help') || text.includes('guide')) return '💡';
        return '🤖';
    }

    addMessage(content, sender) {
        const conversation = document.getElementById('ai-conversation');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="ai-message-content">
                ${this.formatMessage(content)}
            </div>
            <div class="ai-message-time">${timestamp}</div>
        `;

        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({ content, sender, timestamp });

        // Auto-speak if enabled and message is from assistant
        if (this.autoSpeak && sender === 'assistant') {
            setTimeout(() => {
                this.speakText(content);
            }, 500);
        }
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Format code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        return formatted;
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Store conversation context for better responses
        this.conversationMemory.push({
            message: message,
            timestamp: Date.now(),
            context: this.currentContext
        });

        // Keep only last 10 messages for context
        if (this.conversationMemory.length > 10) {
            this.conversationMemory = this.conversationMemory.slice(-10);
        }

        // Enhanced LLM-like response generation with context awareness
        const response = this.generateContextualResponse(message, lowerMessage);

        return response;
    }

    generateContextualResponse(message, lowerMessage) {
        // Check for conversation continuity
        const isFollowUp = this.isFollowUpQuestion(message);
        const previousContext = this.getPreviousContext();

        // Help and navigation commands (highest priority)
        if (this.containsKeywords(lowerMessage, ['help', 'guide', 'how to use', 'navigation', 'menu', 'commands'])) {
            return this.generateHelpResponse();
        } else if (this.containsKeywords(lowerMessage, ['workshop', 'workshops', 'tutorial', 'tutorials', 'course', 'lessons'])) {
            return this.generateWorkshopResponse();
        } else if (this.containsKeywords(lowerMessage, ['quiz', 'test', 'assessment', 'exam', 'evaluation'])) {
            return this.generateQuizResponse();
        } else if (this.containsKeywords(lowerMessage, ['notification', 'notifications', 'updates', 'alerts', 'news'])) {
            return this.generateNotificationResponse();
        } else if (this.containsKeywords(lowerMessage, ['dashboard', 'progress', 'profile', 'account', 'stats'])) {
            return this.generateDashboardResponse();
        } else if (this.containsKeywords(lowerMessage, ['getting started', 'begin', 'start learning', 'new user', 'beginner'])) {
            return this.generateGettingStartedResponse();
        } else if (this.containsKeywords(lowerMessage, ['features', 'what can you do', 'capabilities', 'functions'])) {
            return this.generateFeaturesResponse();
        } else if (this.containsKeywords(lowerMessage, ['navigate', 'find', 'where is', 'how to get to', 'go to'])) {
            return this.generateNavigationResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['fullscreen', 'full page', 'expand', 'larger view'])) {
            return this.generateFullscreenResponse();
        } else if (this.containsKeywords(lowerMessage, ['voice', 'speech', 'audio', 'speak', 'listen'])) {
            return this.generateVoiceResponse();
        }

        // Technical content (existing functionality)
        else if (this.containsKeywords(lowerMessage, ['lora', 'low-rank', 'adaptation'])) {
            return this.generateLoRAResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['qlora', 'quantized', 'quantization'])) {
            return this.generateQLoRAResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['transformers', 'hugging face', 'hf'])) {
            return this.generateTransformersResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['peft', 'parameter efficient', 'parameter-efficient'])) {
            return this.generatePEFTResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['fine-tuning', 'fine tuning', 'finetune'])) {
            return this.generateFineTuningResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['code', 'example', 'implementation', 'how to'])) {
            return this.generateCodeResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['best practices', 'tips', 'recommendations'])) {
            return this.generateBestPracticesResponse(message);
        } else if (this.containsKeywords(lowerMessage, ['error', 'problem', 'issue', 'debug', 'troubleshoot'])) {
            return this.generateTroubleshootingResponse(message);
        } else {
            return this.generateGeneralResponse(message);
        }
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    // Enhanced LLM-like helper methods
    isFollowUpQuestion(message) {
        const followUpIndicators = [
            'what about', 'how about', 'can you also', 'what if', 'but what',
            'and what', 'also', 'additionally', 'furthermore', 'moreover',
            'tell me more', 'explain further', 'go deeper', 'elaborate'
        ];
        return followUpIndicators.some(indicator =>
            message.toLowerCase().includes(indicator)
        );
    }

    getPreviousContext() {
        if (this.conversationMemory.length < 2) return null;

        const recent = this.conversationMemory.slice(-3);
        const topics = recent.map(item => this.extractTopics(item.message));
        return topics.flat();
    }

    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('lora')) topics.push('lora');
        if (lowerMessage.includes('qlora')) topics.push('qlora');
        if (lowerMessage.includes('peft')) topics.push('peft');
        if (lowerMessage.includes('transformer')) topics.push('transformers');
        if (lowerMessage.includes('fine-tun')) topics.push('fine-tuning');
        if (lowerMessage.includes('code') || lowerMessage.includes('implement')) topics.push('implementation');

        return topics;
    }

    generateFullscreenResponse() {
        return `**🖥️ Fullscreen Mode Information**

To switch to **Full Page Mode**, click the fullscreen button (⛶) in the top-right corner of this assistant!

**Full Page Mode Benefits:**
• **Larger Interface** - More space for detailed conversations
• **Enhanced Experience** - Better code display and formatting
• **Extended Responses** - In-depth tutorials and explanations
• **Immersive Learning** - Focus entirely on our conversation

**How to Access:**
1. Look for the **fullscreen icon** (⛶) next to the minimize and close buttons
2. Click it to expand to full page
3. Click again to return to compact mode

**Perfect for:**
• Complex code walkthroughs
• Detailed technical explanations
• Multi-step tutorials
• In-depth learning sessions

Would you like me to explain any specific topic in detail? The fullscreen mode is perfect for comprehensive learning!`;
    }

    generateVoiceResponse() {
        return `**🎤 Voice Assistant Features**

I have **voice capabilities** to enhance your learning experience!

**Voice Features Available:**
• **Speech Recognition** - I can understand your spoken questions
• **Text-to-Speech** - I can read my responses aloud
• **Voice Commands** - Use voice for hands-free interaction
• **Audio Learning** - Perfect for multitasking while learning

**How to Use Voice Features:**
1. **Voice Input** - Click the microphone button (🎤) in the floating menu
2. **Speak Clearly** - Ask your question about LLM fine-tuning
3. **Audio Responses** - Enable text-to-speech for audio answers
4. **Voice Commands** - Say "help", "workshops", or any topic

**Voice Commands You Can Try:**
• *"Tell me about LoRA fine-tuning"*
• *"Show me code examples"*
• *"What are the best practices?"*
• *"Navigate to workshops"*
• *"Help me get started"*

**Perfect For:**
• **Hands-free Learning** - Code while listening to explanations
• **Accessibility** - Voice interaction for better accessibility
• **Multitasking** - Learn while doing other tasks
• **Audio Learners** - Better retention through audio

**Browser Support:**
Voice features work best in Chrome, Edge, and Safari. Make sure to allow microphone access when prompted.

**Quick Start:**
Click the **microphone button** (🎤) in the floating action menu to start using voice features right away!

Would you like to try the voice features now?`;
    }

    generateLoRAResponse(message) {
        const responses = [
            `**LoRA (Low-Rank Adaptation)** is a powerful technique for efficient fine-tuning! 🎯

**Key Benefits:**
• **Memory Efficient**: Reduces trainable parameters by up to 99%
• **Fast Training**: Significantly faster than full fine-tuning
• **Modular**: Easy to swap different LoRA adapters
• **Quality**: Maintains performance comparable to full fine-tuning

**How it works:**
LoRA decomposes weight updates into low-rank matrices: ΔW = BA, where B and A are much smaller than the original weight matrix.

**Quick Implementation:**
\`\`\`python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,  # rank
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
)

model = get_peft_model(model, config)
\`\`\`

Would you like me to explain any specific aspect of LoRA in more detail?`,

            `**LoRA is fantastic for efficient fine-tuning!** Let me break it down for you:

**The Problem LoRA Solves:**
Traditional fine-tuning requires updating all model parameters, which is expensive and memory-intensive for large models.

**LoRA's Solution:**
Instead of updating the full weight matrix W, LoRA learns a low-rank decomposition:
- Original: W + ΔW (full rank update)
- LoRA: W + B×A (low-rank update)

**Key Parameters:**
• **r (rank)**: Controls the bottleneck size (typically 4-64)
• **alpha**: Scaling factor for the LoRA weights
• **target_modules**: Which layers to apply LoRA to

**Pro Tips:**
✅ Start with r=16 for most tasks
✅ Target attention layers (q_proj, v_proj, k_proj, o_proj)
✅ Use higher alpha for stronger adaptation

Need help with a specific LoRA implementation?`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateQLoRAResponse(message) {
        return `**QLoRA (Quantized LoRA)** combines the best of both worlds! 🚀

**What makes QLoRA special:**
• **4-bit Quantization**: Reduces memory by ~75%
• **LoRA Adaptation**: Efficient parameter updates
• **NormalFloat4**: Custom 4-bit data type for better precision
• **Double Quantization**: Further memory optimization

**Memory Savings:**
- 7B model: ~28GB → ~7GB
- 13B model: ~52GB → ~13GB
- 70B model: ~280GB → ~70GB

**Perfect for:**
✅ Consumer GPUs (RTX 3090, 4090)
✅ Large model experimentation
✅ Cost-effective fine-tuning
✅ Rapid prototyping

**Implementation:**
\`\`\`python
from transformers import BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)
\`\`\`

Want to see a complete QLoRA fine-tuning example?`;
    }

    generateTransformersResponse(message) {
        return `**Hugging Face Transformers** is your gateway to state-of-the-art NLP! 🤗

**Why Transformers Library Rocks:**
• **30,000+ Models**: Pre-trained models for every task
• **Easy Integration**: Simple APIs for complex models
• **Multi-Framework**: PyTorch, TensorFlow, JAX support
• **Active Community**: Constantly updated and improved

**Key Components:**
\`\`\`python
from transformers import (
    AutoTokenizer,      # Text preprocessing
    AutoModel,          # Base model
    AutoModelForCausalLM,  # For text generation
    TrainingArguments,  # Training configuration
    Trainer            # Training loop
)
\`\`\`

**Popular Models for Fine-tuning:**
• **LLaMA 2**: Meta's powerful language model
• **Mistral**: Efficient and capable
• **Phi-2**: Microsoft's compact model
• **CodeLlama**: Specialized for code
• **Falcon**: Strong open-source option

**Quick Start:**
\`\`\`python
# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

# Tokenize input
inputs = tokenizer.encode("Hello, how are you?", return_tensors="pt")

# Generate response
outputs = model.generate(inputs, max_length=50, pad_token_id=tokenizer.eos_token_id)
\`\`\`

Which specific model or task are you working with?`;
    }

    generatePEFTResponse(message) {
        return `**PEFT (Parameter-Efficient Fine-Tuning)** is the future of model adaptation! 🎯

**Why PEFT is Revolutionary:**
• **Efficiency**: Train only 0.1-3% of parameters
• **Modularity**: Swap adapters for different tasks
• **Storage**: Tiny adapter files vs. full model copies
• **Speed**: Much faster training and inference

**PEFT Methods Available:**
\`\`\`python
from peft import (
    LoraConfig,        # Low-Rank Adaptation
    AdaLoraConfig,     # Adaptive LoRA
    PrefixTuningConfig, # Prefix Tuning
    PromptTuningConfig, # Prompt Tuning
    TaskType
)
\`\`\`

**Complete PEFT Workflow:**
\`\`\`python
from peft import get_peft_model, prepare_model_for_kbit_training

# 1. Prepare base model
model = prepare_model_for_kbit_training(model)

# 2. Configure PEFT
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"]
)

# 3. Get PEFT model
model = get_peft_model(model, peft_config)

# 4. Train normally with Trainer
\`\`\`

**Adapter Management:**
\`\`\`python
# Save adapter
model.save_pretrained("./my-adapter")

# Load adapter
model = PeftModel.from_pretrained(base_model, "./my-adapter")

# Switch adapters
model.load_adapter("./task1-adapter", adapter_name="task1")
model.load_adapter("./task2-adapter", adapter_name="task2")
model.set_adapter("task1")  # Switch to task1
\`\`\`

Need help choosing the right PEFT method for your use case?`;
    }

    generateFineTuningResponse(message) {
        return `**Fine-tuning** is the art of adapting pre-trained models to your specific needs! 🎨

**Types of Fine-tuning:**

**1. Full Fine-tuning**
• Updates all model parameters
• Best performance but resource-intensive
• Use for: Critical applications, abundant data

**2. Parameter-Efficient Fine-tuning (PEFT)**
• Updates only a small subset of parameters
• Much more efficient
• Use for: Most practical applications

**3. Instruction Tuning**
• Teaches models to follow instructions
• Uses instruction-response pairs
• Use for: Chat models, task generalization

**Complete Fine-tuning Pipeline:**
\`\`\`python
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    TrainingArguments, Trainer, DataCollatorForLanguageModeling
)
from datasets import Dataset

# 1. Load model and tokenizer
model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# 2. Prepare dataset
def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, padding=True)

dataset = Dataset.from_dict({"text": your_texts})
tokenized_dataset = dataset.map(tokenize_function, batched=True)

# 3. Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    evaluation_strategy="steps",
    eval_steps=500,
    learning_rate=5e-5,
)

# 4. Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer, mlm=False
)

# 5. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

# 6. Train!
trainer.train()
\`\`\`

What specific aspect of fine-tuning would you like to explore?`;
    }

    generateCodeResponse(message) {
        return `**Here's a complete code example for LLM fine-tuning!** 💻

**Complete LoRA Fine-tuning Script:**
\`\`\`python
import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    TrainingArguments, Trainer, DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset

# Configuration
MODEL_NAME = "microsoft/DialoGPT-medium"
OUTPUT_DIR = "./lora-finetuned-model"

# 1. Load model and tokenizer
print("Loading model and tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Add padding token if missing
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# 2. Prepare model for training
model = prepare_model_for_kbit_training(model)

# 3. LoRA configuration
lora_config = LoraConfig(
    r=16,                   # Rank
    lora_alpha=32,          # Alpha parameter
    target_modules=[        # Target modules
        "q_proj", "v_proj", "k_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    lora_dropout=0.1,       # Dropout
    bias="none",            # Bias type
    task_type="CAUSAL_LM"   # Task type
)

# 4. Apply LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 5. Prepare dataset
def format_instruction(example):
    return f"Human: {example['instruction']}\\nAssistant: {example['response']}"

# Your training data
train_data = [
    {"instruction": "What is LoRA?", "response": "LoRA is a parameter-efficient fine-tuning technique..."},
    # Add more examples
]

dataset = Dataset.from_list(train_data)
dataset = dataset.map(lambda x: {"text": format_instruction(x)})

# 6. Tokenization
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding=True,
        max_length=512
    )

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# 7. Training arguments
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    warmup_steps=100,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_steps=500,
    evaluation_strategy="no",
    remove_unused_columns=False,
)

# 8. Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

# 9. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

# 10. Train the model
print("Starting training...")
trainer.train()

# 11. Save the model
print("Saving model...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("Training complete!")
\`\`\`

**Usage after training:**
\`\`\`python
from peft import PeftModel

# Load the fine-tuned model
base_model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
model = PeftModel.from_pretrained(base_model, OUTPUT_DIR)

# Generate text
inputs = tokenizer("Human: Explain LoRA", return_tensors="pt")
outputs = model.generate(**inputs, max_length=100)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
\`\`\`

Need help adapting this code for your specific use case?`;
    }

    generateBestPracticesResponse(message) {
        return `**Best Practices for LLM Fine-tuning** - Your guide to success! ⭐

**🎯 Data Preparation:**
✅ **Quality over Quantity**: 1000 high-quality examples > 10000 poor ones
✅ **Diverse Examples**: Cover edge cases and variations
✅ **Consistent Format**: Use the same instruction format throughout
✅ **Clean Data**: Remove duplicates, fix formatting issues
✅ **Balanced Dataset**: Avoid bias toward specific patterns

**🔧 Model Configuration:**
✅ **Start Small**: Begin with smaller models (7B) before scaling up
✅ **LoRA Rank**: Start with r=16, increase if underfitting
✅ **Learning Rate**: 2e-4 for LoRA, 5e-5 for full fine-tuning
✅ **Batch Size**: Use gradient accumulation for effective larger batches
✅ **Target Modules**: Include all attention layers for best results

**📊 Training Strategy:**
✅ **Monitor Loss**: Watch for overfitting (validation loss increases)
✅ **Save Checkpoints**: Regular saves prevent loss of progress
✅ **Gradual Training**: Start with fewer epochs, extend if needed
✅ **Validation Set**: Always keep data for evaluation
✅ **Early Stopping**: Stop when validation metrics plateau

**🚀 Optimization Tips:**
\`\`\`python
# Memory optimization
training_args = TrainingArguments(
    gradient_checkpointing=True,    # Reduce memory usage
    dataloader_pin_memory=False,    # Reduce memory usage
    fp16=True,                      # Half precision
    gradient_accumulation_steps=4,   # Effective larger batch
    per_device_train_batch_size=1,  # Small batch per device
)

# LoRA optimization
lora_config = LoraConfig(
    r=16,                          # Good starting point
    lora_alpha=32,                 # 2x rank is common
    lora_dropout=0.1,              # Prevent overfitting
    target_modules="all-linear",    # Target all linear layers
)
\`\`\`

**⚠️ Common Pitfalls to Avoid:**
❌ **Too High Learning Rate**: Causes instability
❌ **Too Many Epochs**: Leads to overfitting
❌ **Insufficient Data**: Results in poor generalization
❌ **Wrong Target Modules**: Reduces adaptation capability
❌ **No Validation**: Can't detect overfitting

**🎯 Evaluation Strategy:**
✅ **Perplexity**: Lower is better for language modeling
✅ **BLEU/ROUGE**: For generation tasks
✅ **Human Evaluation**: Ultimate quality measure
✅ **Task-Specific Metrics**: Use relevant benchmarks
✅ **Qualitative Analysis**: Manual inspection of outputs

Want specific advice for your particular use case?`;
    }

    generateTroubleshootingResponse(message) {
        return `**Troubleshooting LLM Fine-tuning Issues** 🔧

**🚨 Common Problems & Solutions:**

**Memory Issues (CUDA OOM):**
\`\`\`python
# Solution 1: Reduce batch size
per_device_train_batch_size=1
gradient_accumulation_steps=8

# Solution 2: Enable gradient checkpointing
gradient_checkpointing=True

# Solution 3: Use QLoRA
from transformers import BitsAndBytesConfig
bnb_config = BitsAndBytesConfig(load_in_4bit=True)
\`\`\`

**Training Loss Not Decreasing:**
• **Check Learning Rate**: Try 2e-4, 1e-4, 5e-5
• **Increase LoRA Rank**: Try r=32 or r=64
• **More Target Modules**: Include all linear layers
• **Data Quality**: Ensure examples are correct

**Model Not Learning Task:**
• **Data Format**: Ensure consistent instruction format
• **Sufficient Data**: Need at least 100-1000 examples
• **Task Complexity**: Start with simpler tasks
• **Evaluation Method**: Check if you're measuring correctly

**Overfitting (Loss Decreases, Performance Doesn't):**
\`\`\`python
# Add regularization
lora_dropout=0.1
weight_decay=0.01

# Reduce learning rate
learning_rate=1e-4

# Early stopping
early_stopping_patience=3
\`\`\`

**Slow Training:**
• **Mixed Precision**: Use fp16=True
• **Efficient Attention**: Use flash_attention_2
• **Batch Size**: Optimize gradient_accumulation_steps
• **Hardware**: Check GPU utilization

**Model Outputs Gibberish:**
• **Tokenizer Issues**: Ensure pad_token is set
• **Learning Rate**: Might be too high
• **Data Corruption**: Check training examples
• **Model Loading**: Verify model loaded correctly

**Can't Load Fine-tuned Model:**
\`\`\`python
# Correct loading for LoRA
from peft import PeftModel
base_model = AutoModelForCausalLM.from_pretrained("base_model_name")
model = PeftModel.from_pretrained(base_model, "path_to_adapter")

# For merged models
model = AutoModelForCausalLM.from_pretrained("path_to_merged_model")
\`\`\`

**🔍 Debugging Checklist:**
✅ Print model.print_trainable_parameters()
✅ Check dataset examples manually
✅ Monitor GPU memory usage
✅ Verify tokenizer settings
✅ Test with smaller dataset first
✅ Compare with baseline model

**📊 Monitoring Tools:**
\`\`\`python
# Add logging
import wandb
wandb.init(project="llm-finetuning")

# In TrainingArguments
report_to="wandb"
logging_steps=10
\`\`\`

What specific error or issue are you encountering? I can provide more targeted help!`;
    }

    generateGeneralResponse(message) {
        const responses = [
            `I'm here to help with LLM fine-tuning! 🤖

I can assist you with:
• **LoRA & QLoRA** techniques
• **Transformers** library usage
• **PEFT** methods and configuration
• **Code examples** and implementations
• **Best practices** and optimization
• **Troubleshooting** common issues

What specific topic would you like to explore? Feel free to ask about any aspect of LLM fine-tuning!`,

            `Great question! 💡 I specialize in LLM fine-tuning and can help you with:

**Technical Topics:**
- Parameter-efficient fine-tuning (LoRA, QLoRA, etc.)
- Hugging Face Transformers and PEFT libraries
- Training configurations and optimization
- Memory management and hardware considerations

**Practical Help:**
- Code examples and implementations
- Debugging training issues
- Best practices and recommendations
- Model evaluation and deployment

What would you like to learn about today?`,

            `I'm your AI assistant for LLM fine-tuning education! 🎓

Whether you're a beginner or advanced practitioner, I can help you understand:
- The fundamentals of fine-tuning
- Advanced techniques like LoRA and QLoRA
- Practical implementation with code examples
- Optimization strategies and best practices

Feel free to ask me anything - from basic concepts to complex implementation details. What's on your mind?`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ===== NAVIGATION AND HELP RESPONSES =====

    generateHelpResponse() {
        return `**🤖 AI Assistant Help & Navigation Guide**

**Available Commands:**
• **"help"** - Show this help guide
• **"workshops"** - View available workshops and tutorials
• **"quiz"** - Find quizzes and assessments
• **"dashboard"** - Go to your progress dashboard
• **"getting started"** - Beginner's guide
• **"features"** - See all my capabilities

**Navigation Help:**
• **"find [topic]"** - Search for specific content
• **"go to [section]"** - Navigate to platform sections
• **"where is [item]"** - Locate specific features

**Technical Topics I Can Help With:**
• **LoRA & QLoRA** - Implementation and best practices
• **Transformers** - Hugging Face library usage
• **PEFT Methods** - Parameter-efficient fine-tuning
• **Code Examples** - Complete implementations
• **Troubleshooting** - Debug training issues
• **Best Practices** - Optimization tips

**Smart Features:**
🔔 **Notifications Tab** - Check for learning updates and tips
🎯 **Contextual Tips** - I'll suggest relevant resources based on your questions
📊 **Progress Tracking** - Monitor your learning journey

**Quick Tips:**
• Ask specific questions for detailed answers
• Use keywords like "LoRA", "workshop", or "quiz"
• Switch to the Notifications tab for updates
• Type "getting started" if you're new to LLM fine-tuning

What would you like to explore? Just ask me anything!`;
    }

    generateWorkshopResponse() {
        return `**🎓 Workshops & Learning Resources**

**Available Workshops:**
• **[LoRA Fine-tuning Workshop](/workshop-lora-fine-tuning)** - Hands-on LoRA implementation
• **[QLoRA Deep Dive](/workshop-qlora-deep-dive)** - Advanced quantized fine-tuning
• **[Full Fine-tuning Guide](/workshop-full-fine-tuning)** - Complete model training
• **[Advanced PEFT Methods](/workshop-advanced-peft)** - Beyond LoRA techniques
• **[Memory Efficiency](/workshop-memory-efficiency)** - Optimize resource usage

**Interactive Tutorials:**
• **[Getting Started Guide](/getting_started)** - Perfect for beginners
• **[Interactive Tutorials](/interactive_tutorials)** - Step-by-step learning
• **[Google ML Crash Course](/google-ml-crash-course)** - Fundamentals

**Specialized Guides:**
• **[Docker Setup](/docker-guide)** - Container environment setup
• **[Hugging Face Guide](/huggingface-guide)** - Platform integration
• **[LangChain Guide](/langchain-guide)** - Framework usage
• **[LangGraph Guide](/langgraph-guide)** - Advanced workflows

**Learning Paths:**
• **[Structured Learning Paths](/learning-paths)** - Organized curriculum
• **[Frameworks Overview](/frameworks)** - Tool comparisons

**Quick Actions:**
• Click any link above to navigate directly
• Ask "getting started" for beginner guidance
• Say "quiz" to test your knowledge
• Check notifications for progress updates

Which workshop interests you most? I can provide specific guidance!`;
    }

    generateQuizResponse() {
        return `**📝 Quizzes & Assessments**

**Available Quizzes:**
• **LoRA Concepts Quiz** - Test your understanding of Low-Rank Adaptation
• **QLoRA Knowledge Check** - Quantized fine-tuning assessment
• **PEFT Methods Quiz** - Parameter-efficient techniques
• **Transformers Library Quiz** - Hugging Face ecosystem
• **Best Practices Assessment** - Optimization strategies

**Assessment Features:**
✅ **Instant Feedback** - Get immediate results and explanations
✅ **Progress Tracking** - Monitor your learning journey
✅ **Personalized Tips** - Receive targeted improvement suggestions
✅ **Retake Options** - Practice until you master the concepts

**Quiz Navigation:**
• Visit **[Quiz Section](/quiz)** for all assessments
• Check your **[Dashboard](/dashboard)** for quiz history
• View **[Analytics](/analytics)** for detailed performance metrics

**Smart Learning:**
🎯 **Adaptive Quizzes** - Questions adjust to your skill level
📊 **Performance Analytics** - Track improvement over time
🔔 **Achievement Notifications** - Get notified of milestones

**Quick Start:**
1. Choose a topic you've been studying
2. Take the corresponding quiz
3. Review your results and explanations
4. Check notifications for follow-up recommendations

**Pro Tips:**
• Take quizzes after completing workshops
• Review incorrect answers carefully
• Use quiz results to identify knowledge gaps
• Retake quizzes to reinforce learning

Ready to test your knowledge? Which topic would you like to be quizzed on?`;
    }

    generateNotificationResponse() {
        return `**🔔 Smart Notification System**

**Notification Features:**
• **Learning Progress** - Track workshop completion and milestones
• **Contextual Tips** - Get suggestions based on your questions
• **Quiz Results** - Receive assessment feedback and recommendations
• **System Updates** - Stay informed about new features and content

**Notification Types:**
🏆 **Achievements** - Celebrate your learning milestones
📚 **Learning Tips** - Contextual suggestions based on your activity
⚡ **Quick Actions** - Direct links to relevant content
🔧 **System Updates** - Platform improvements and new features

**How to Use Notifications:**
1. **Switch to Notifications Tab** - Click the bell icon above
2. **Filter by Type** - Use All, Unread, Important, or System filters
3. **Take Action** - Click notification buttons for quick navigation
4. **Mark as Read** - Keep your notification list organized

**Smart Features:**
• **Auto-Generated** - I create notifications based on your questions
• **Actionable** - Each notification includes relevant next steps
• **Personalized** - Content tailored to your learning journey
• **Real-time** - Instant updates as you interact with the platform

**Notification Settings:**
• **Sound Alerts** - Optional audio notifications
• **Visual Toasts** - Non-intrusive popup notifications
• **Customizable** - Adjust preferences in notification settings

**Current Notifications:**
Check the **Notifications tab** above to see your latest updates! I've already added some helpful tips based on our conversation.

**Pro Tips:**
• Check notifications regularly for learning opportunities
• Use notification actions for quick navigation
• Filter by "Important" for priority updates
• Enable sound alerts for real-time updates

Want to see your notifications now? Just switch to the Notifications tab!`;
    }

    generateDashboardResponse() {
        return `**📊 Dashboard & Progress Tracking**

**Your Learning Dashboard:**
• **[User Dashboard](/dashboard)** - Complete progress overview
• **[Profile Settings](/profile)** - Manage your account and preferences
• **[Analytics](/analytics)** - Detailed learning metrics and insights

**Dashboard Features:**
📈 **Progress Tracking** - Visual representation of your learning journey
🎯 **Goal Setting** - Set and track learning objectives
📚 **Course Completion** - Monitor workshop and tutorial progress
🏆 **Achievements** - View earned badges and milestones

**Analytics & Insights:**
• **Learning Patterns** - Understand your study habits
• **Performance Metrics** - Track quiz scores and improvement
• **Time Tracking** - See how much time you've invested
• **Recommendation Engine** - Get personalized learning suggestions

**Profile Management:**
• **Account Settings** - Update personal information
• **Learning Preferences** - Customize your experience
• **Notification Settings** - Control alert preferences
• **Progress Export** - Download your learning data

**Quick Actions from Dashboard:**
• Resume incomplete workshops
• Retake quizzes to improve scores
• Explore recommended content
• Set new learning goals

**Progress Indicators:**
✅ **Completed Workshops** - Green checkmarks for finished content
⏳ **In Progress** - Yellow indicators for ongoing learning
🔒 **Locked Content** - Prerequisites required
⭐ **Recommended** - Suggested next steps

**Social Features:**
• **Learning Streaks** - Maintain daily learning habits
• **Community Badges** - Earn recognition for contributions
• **Leaderboards** - Compare progress with other learners

**Getting Started:**
1. Visit your **[Dashboard](/dashboard)** to see current progress
2. Set learning goals for the week/month
3. Follow recommended learning paths
4. Track your improvement over time

Ready to check your progress? Click the dashboard link above!`;
    }

    generateGettingStartedResponse() {
        return `**🚀 Getting Started with LLM Fine-tuning**

**Welcome, New Learner!** Here's your roadmap to mastering LLM fine-tuning:

**Step 1: Foundation Knowledge**
• **[Getting Started Guide](/getting_started)** - Essential concepts and terminology
• **[Interactive Tutorials](/interactive_tutorials)** - Hands-on learning experience
• **Basic Concepts Quiz** - Test your understanding

**Step 2: Choose Your Learning Path**
• **Beginner Path**: Start with basic fine-tuning concepts
• **Intermediate Path**: Jump to LoRA and PEFT methods
• **Advanced Path**: Explore QLoRA and optimization techniques

**Step 3: Hands-on Practice**
• **[LoRA Workshop](/workshop-lora-fine-tuning)** - Your first fine-tuning project
• **[Code Examples](/tutorials)** - Copy-paste implementations
• **[Google Colab Integration](/google-ml-crash-course)** - Practice in the cloud

**Essential Tools & Setup:**
🐳 **[Docker Guide](/docker-guide)** - Containerized development environment
🤗 **[Hugging Face Guide](/huggingface-guide)** - Model hub and libraries
⚙️ **[Environment Setup](/frameworks)** - Development tools and dependencies

**Learning Strategy:**
1. **Read** the concept explanations
2. **Watch** interactive tutorials
3. **Practice** with code examples
4. **Test** your knowledge with quizzes
5. **Build** your own projects

**Key Concepts to Master:**
• **What is Fine-tuning?** - Adapting pre-trained models
• **LoRA (Low-Rank Adaptation)** - Efficient fine-tuning technique
• **PEFT Methods** - Parameter-efficient approaches
• **Transformers Library** - Essential tools and APIs

**Your First Week Plan:**
**Day 1-2**: Read getting started guide and basic concepts
**Day 3-4**: Complete interactive tutorials
**Day 5-6**: Try the LoRA workshop
**Day 7**: Take the LoRA concepts quiz

**Support Resources:**
• **AI Assistant** (that's me!) - Ask questions anytime
• **Notifications** - Get learning tips and progress updates
• **Dashboard** - Track your progress and achievements
• **Community** - Connect with other learners

**Quick Start Actions:**
• Ask me "What is LoRA?" to learn about efficient fine-tuning
• Say "show me code" for implementation examples
• Type "workshop" to see available hands-on tutorials
• Check your notifications for personalized tips

**Pro Tips for Success:**
✅ Start with small, manageable goals
✅ Practice regularly, even if just 15 minutes daily
✅ Don't hesitate to ask questions
✅ Join the community for support and motivation

Ready to begin your journey? What would you like to learn first?`;
    }

    generateFeaturesResponse() {
        return `**🎯 AI Assistant Capabilities & Features**

**Core Capabilities:**
🤖 **Expert Knowledge** - Comprehensive LLM fine-tuning expertise
💬 **Interactive Chat** - Natural conversation about technical topics
🔔 **Smart Notifications** - Contextual tips and learning updates
🧭 **Navigation Help** - Guide you to any platform section

**Technical Expertise:**
• **LoRA & QLoRA** - Implementation guides and best practices
• **PEFT Methods** - All parameter-efficient fine-tuning techniques
• **Transformers Library** - Hugging Face ecosystem mastery
• **Code Generation** - Complete, runnable examples
• **Troubleshooting** - Debug training issues and errors
• **Optimization** - Performance and memory efficiency tips

**Learning Support:**
📚 **Workshop Guidance** - Navigate through hands-on tutorials
📝 **Quiz Assistance** - Prepare for and review assessments
📊 **Progress Tracking** - Monitor your learning journey
🎯 **Personalized Recommendations** - Tailored learning paths

**Smart Features:**
• **Contextual Responses** - Answers adapt to your skill level
• **Code Examples** - Real, working implementations
• **Best Practices** - Industry-standard recommendations
• **Error Solutions** - Specific fixes for common problems

**Navigation Commands:**
• **"help"** - Complete assistance guide
• **"workshops"** - View all available tutorials
• **"quiz"** - Find assessments and tests
• **"dashboard"** - Access progress tracking
• **"getting started"** - Beginner's roadmap
• **"find [topic]"** - Search for specific content

**Interactive Features:**
🔄 **Tab Switching** - Seamlessly move between chat and notifications
⚡ **Quick Actions** - Direct links to relevant content
🎨 **Rich Formatting** - Code blocks, lists, and emphasis
📱 **Responsive Design** - Works on all devices

**Notification Intelligence:**
• **Auto-Generation** - Creates tips based on your questions
• **Action Buttons** - Quick navigation to relevant sections
• **Filtering** - Organize by type and importance
• **Settings** - Customize your notification experience

**Code Assistance:**
\`\`\`python
# I can provide complete, working examples like this:
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"]
)
\`\`\`

**Learning Paths I Support:**
• **Complete Beginner** - Start from zero knowledge
• **Intermediate Developer** - Build on existing ML experience
• **Advanced Practitioner** - Optimize and scale implementations

**Platform Integration:**
• **Workshop Navigation** - Direct links to tutorials
• **Quiz Integration** - Assessment preparation and review
• **Dashboard Connectivity** - Progress tracking and analytics
• **Resource Discovery** - Find relevant documentation and guides

**Communication Style:**
• **Clear Explanations** - Complex concepts made simple
• **Practical Focus** - Real-world applications and examples
• **Encouraging Tone** - Supportive learning environment
• **Comprehensive Coverage** - From basics to advanced topics

**What Makes Me Special:**
✨ **Always Available** - 24/7 learning support
✨ **Constantly Updated** - Latest techniques and best practices
✨ **Personalized** - Adapts to your learning style and pace
✨ **Comprehensive** - Covers entire LLM fine-tuning ecosystem

Ready to explore? Ask me about any topic or say "getting started" to begin your journey!`;
    }

    generateNavigationResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Extract what they're looking for
        let searchTerm = '';
        if (lowerMessage.includes('find ')) {
            searchTerm = message.substring(message.toLowerCase().indexOf('find ') + 5);
        } else if (lowerMessage.includes('where is ')) {
            searchTerm = message.substring(message.toLowerCase().indexOf('where is ') + 9);
        } else if (lowerMessage.includes('go to ')) {
            searchTerm = message.substring(message.toLowerCase().indexOf('go to ') + 6);
        }

        return `**🧭 Navigation Help**

**Looking for "${searchTerm}"?** Here are the most relevant sections:

**Main Sections:**
• **[Home](/)** - Platform overview and getting started
• **[Learn](/learn)** - Comprehensive learning resources
• **[Workshops](/workshops)** - Hands-on tutorials and exercises
• **[Dashboard](/dashboard)** - Your progress and analytics

**Workshop Categories:**
• **[LoRA Fine-tuning](/workshop-lora-fine-tuning)** - Low-rank adaptation tutorial
• **[QLoRA Deep Dive](/workshop-qlora-deep-dive)** - Quantized fine-tuning
• **[Full Fine-tuning](/workshop-full-fine-tuning)** - Complete model training
• **[Advanced PEFT](/workshop-advanced-peft)** - Beyond basic techniques

**Learning Resources:**
• **[Tutorials](/tutorials)** - Step-by-step guides
• **[Interactive Tutorials](/interactive_tutorials)** - Hands-on learning
• **[Getting Started](/getting_started)** - Beginner's guide
• **[Frameworks](/frameworks)** - Tool comparisons

**Specialized Guides:**
• **[Docker Setup](/docker-guide)** - Container environment
• **[Hugging Face](/huggingface-guide)** - Model hub integration
• **[LangChain](/langchain-guide)** - Framework usage
• **[LangGraph](/langgraph-guide)** - Advanced workflows

**Assessment & Progress:**
• **[Quizzes](/quiz)** - Test your knowledge
• **[Analytics](/analytics)** - Detailed metrics
• **[Profile](/profile)** - Account settings

**Quick Navigation Tips:**
• Use the search bar at the top of any page
• Check the main navigation menu
• Ask me "workshops" for tutorial listings
• Say "quiz" for assessment options
• Type "dashboard" for progress tracking

**Can't Find Something?**
• Ask me specifically: "Where can I learn about [topic]?"
• Use the search function with keywords
• Check the main menu for section overviews
• Browse the learning paths for structured content

**Popular Searches:**
• "LoRA tutorial" → [LoRA Workshop](/workshop-lora-fine-tuning)
• "Getting started" → [Beginner's Guide](/getting_started)
• "Code examples" → [Tutorials](/tutorials)
• "My progress" → [Dashboard](/dashboard)

Need help finding something specific? Just ask me directly!`;
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    copyConversation() {
        const conversation = this.conversationHistory.map(msg =>
            `${msg.sender === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`
        ).join('\n\n');

        navigator.clipboard.writeText(conversation).then(() => {
            this.showToast('Conversation copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy conversation:', err);
            this.showToast('Failed to copy conversation', 'error');
        });
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.initializeVoiceRecognition();
        }

        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                const micBtn = document.getElementById('ai-mic-btn');
                micBtn.classList.add('listening');
                micBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
                this.showToast('Listening...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('ai-input');
                input.value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showToast('Voice recognition error: ' + event.error, 'error');
                this.stopVoiceInput();
            };

            this.recognition.onend = () => {
                this.stopVoiceInput();
            };
        } else {
            this.showToast('Voice recognition not supported in this browser', 'error');
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showToast('Failed to start voice recognition', 'error');
            }
        }
    }

    stopVoiceInput() {
        this.isListening = false;
        const micBtn = document.getElementById('ai-mic-btn');
        micBtn.classList.remove('listening');
        micBtn.innerHTML = '<i class="bi bi-mic"></i>';

        if (this.recognition) {
            this.recognition.stop();
        }
    }

    toggleTextToSpeech() {
        if (this.isSpeaking) {
            this.stopSpeaking();
        } else {
            const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
            if (lastMessage && lastMessage.sender === 'assistant') {
                this.speakText(lastMessage.content);
            } else {
                this.showToast('No AI message to speak', 'info');
            }
        }
    }

    speakText(text) {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            utterance.onstart = () => {
                this.isSpeaking = true;
                const speakerBtn = document.getElementById('ai-speaker-btn');
                speakerBtn.classList.add('speaking');
                speakerBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
            };

            utterance.onend = () => {
                this.stopSpeaking();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.stopSpeaking();
                this.showToast('Text-to-speech error', 'error');
            };

            speechSynthesis.speak(utterance);
        } else {
            this.showToast('Text-to-speech not supported in this browser', 'error');
        }
    }

    stopSpeaking() {
        this.isSpeaking = false;
        const speakerBtn = document.getElementById('ai-speaker-btn');
        speakerBtn.classList.remove('speaking');
        speakerBtn.innerHTML = '<i class="bi bi-volume-up"></i>';

        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `ai-toast ai-toast-${type}`;
        toast.innerHTML = `
            <div class="ai-toast-content">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    showTypingIndicator() {
        const indicator = document.getElementById('ai-typing');
        indicator.style.display = 'flex';
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('ai-typing');
        indicator.style.display = 'none';
        this.isTyping = false;
    }

    // ===== NOTIFICATION METHODS =====

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.ai-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.ai-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');

        // If switching to notifications tab, mark notifications as read
        if (tabName === 'notifications') {
            this.updateNotificationBadges();
        }
    }

    addNotification(notification) {
        // Add to notifications array
        this.notifications.unshift(notification);

        // Update the UI
        this.updateNotificationsList();
        this.updateNotificationBadges();

        // Show toast if enabled
        if (this.notificationSettings.enabled) {
            this.showNotificationToast(notification);
        }

        // Play sound if enabled
        if (this.notificationSettings.sound) {
            this.playNotificationSound();
        }
    }

    updateNotificationsList() {
        const notificationsList = document.getElementById('ai-notifications-list');
        if (!notificationsList) return;

        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="bi bi-bell-slash"></i>
                    <p>No notifications yet</p>
                    <small>You'll see learning updates, quiz results, and system notifications here.</small>
                </div>
            `;
            return;
        }

        const notificationsHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} ${notification.important ? 'important' : ''}"
                 data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${notification.icon || 'bi bi-info-circle'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h6>${notification.title}</h6>
                        <span class="notification-time">${this.formatNotificationTime(notification.timestamp)}</span>
                    </div>
                    <p>${notification.body}</p>
                    ${notification.actions && notification.actions.length > 0 ? `
                        <div class="notification-actions">
                            ${notification.actions.map(action => `
                                <button class="btn btn-sm btn-outline-primary"
                                        onclick="aiAssistant.handleNotificationAction('${notification.id}', '${action.action}')">
                                    ${action.title}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="notification-dismiss" onclick="aiAssistant.dismissNotification('${notification.id}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');

        notificationsList.innerHTML = notificationsHTML;
    }

    updateNotificationBadges() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const notificationBadge = document.getElementById('notification-count');
        const tabNotificationBadge = document.getElementById('tab-notification-count');

        if (unreadCount > 0) {
            if (notificationBadge) {
                notificationBadge.textContent = unreadCount;
                notificationBadge.style.display = 'inline';
            }
            if (tabNotificationBadge) {
                tabNotificationBadge.textContent = unreadCount;
                tabNotificationBadge.style.display = 'inline';
            }
        } else {
            if (notificationBadge) notificationBadge.style.display = 'none';
            if (tabNotificationBadge) tabNotificationBadge.style.display = 'none';
        }
    }

    markAllNotificationsRead() {
        this.notifications.forEach(notification => notification.read = true);
        this.updateNotificationsList();
        this.updateNotificationBadges();
    }

    dismissNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationsList();
        this.updateNotificationBadges();
    }

    filterNotifications(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Filter notifications
        let filteredNotifications = this.notifications;

        switch (filter) {
            case 'unread':
                filteredNotifications = this.notifications.filter(n => !n.read);
                break;
            case 'important':
                filteredNotifications = this.notifications.filter(n => n.important);
                break;
            case 'system':
                filteredNotifications = this.notifications.filter(n => n.type === 'system');
                break;
            default:
                filteredNotifications = this.notifications;
        }

        // Update display with filtered notifications
        this.displayFilteredNotifications(filteredNotifications);
    }

    displayFilteredNotifications(notifications) {
        const notificationsList = document.getElementById('ai-notifications-list');
        if (!notificationsList) return;

        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="bi bi-bell-slash"></i>
                    <p>No notifications match this filter</p>
                    <small>Try selecting a different filter or check back later.</small>
                </div>
            `;
            return;
        }

        const notificationsHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} ${notification.important ? 'important' : ''}"
                 data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${notification.icon || 'bi bi-info-circle'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h6>${notification.title}</h6>
                        <span class="notification-time">${this.formatNotificationTime(notification.timestamp)}</span>
                    </div>
                    <p>${notification.body}</p>
                </div>
                <button class="notification-dismiss" onclick="aiAssistant.dismissNotification('${notification.id}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');

        notificationsList.innerHTML = notificationsHTML;
    }

    handleNotificationAction(notificationId, action) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        notification.read = true;

        // Handle specific actions
        switch (action) {
            case 'view_quiz':
                window.location.href = '/quiz/results';
                break;
            case 'continue_workshop':
                window.location.href = '/workshops';
                break;
            case 'view_progress':
                window.location.href = '/dashboard';
                break;
            default:
                console.log('Unknown notification action:', action);
        }

        this.updateNotificationsList();
        this.updateNotificationBadges();
    }

    formatNotificationTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    showNotificationToast(notification) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'ai-notification-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-header">
                    <i class="${notification.icon || 'bi bi-info-circle'}"></i>
                    <strong>${notification.title}</strong>
                    <button class="toast-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="toast-body">${notification.body}</div>
            </div>
        `;

        // Add to document
        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    playNotificationSound() {
        // Simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    openNotificationSettings() {
        // Create a simple settings modal
        const settingsModal = document.createElement('div');
        settingsModal.className = 'ai-notification-settings-modal';
        settingsModal.innerHTML = `
            <div class="settings-modal-content">
                <div class="settings-header">
                    <h5>Notification Settings</h5>
                    <button class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enable-notifications"
                               ${this.notificationSettings.enabled ? 'checked' : ''}>
                        <label class="form-check-label" for="enable-notifications">
                            Enable notifications
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enable-sound"
                               ${this.notificationSettings.sound ? 'checked' : ''}>
                        <label class="form-check-label" for="enable-sound">
                            Play notification sounds
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enable-desktop"
                               ${this.notificationSettings.desktop ? 'checked' : ''}>
                        <label class="form-check-label" for="enable-desktop">
                            Show desktop notifications
                        </label>
                    </div>
                </div>
                <div class="settings-footer">
                    <button class="btn btn-primary" onclick="aiAssistant.saveNotificationSettings(); this.parentElement.parentElement.parentElement.remove();">
                        Save Settings
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(settingsModal);
    }

    saveNotificationSettings() {
        this.notificationSettings.enabled = document.getElementById('enable-notifications').checked;
        this.notificationSettings.sound = document.getElementById('enable-sound').checked;
        this.notificationSettings.desktop = document.getElementById('enable-desktop').checked;

        // Save to localStorage
        localStorage.setItem('ai-notification-settings', JSON.stringify(this.notificationSettings));
    }

    loadNotificationSettings() {
        const saved = localStorage.getItem('ai-notification-settings');
        if (saved) {
            this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(saved) };
        }
    }

    // Method to create sample notifications for testing
    createSampleNotifications() {
        const sampleNotifications = [
            {
                id: 'notif-1',
                title: 'Quiz Completed!',
                body: 'You scored 85% on the LoRA Concepts Quiz. Great job!',
                icon: 'bi bi-trophy',
                type: 'achievement',
                timestamp: Date.now() - 300000, // 5 minutes ago
                read: false,
                important: false,
                actions: [
                    { action: 'view_quiz', title: 'View Results' }
                ]
            },
            {
                id: 'notif-2',
                title: 'Workshop Progress',
                body: 'You\'re halfway through the QLoRA Deep Dive workshop. Keep going!',
                icon: 'bi bi-book',
                type: 'progress',
                timestamp: Date.now() - 1800000, // 30 minutes ago
                read: false,
                important: false,
                actions: [
                    { action: 'continue_workshop', title: 'Continue' }
                ]
            },
            {
                id: 'notif-3',
                title: 'System Update',
                body: 'New features added: Enhanced code examples and improved AI responses.',
                icon: 'bi bi-gear',
                type: 'system',
                timestamp: Date.now() - 3600000, // 1 hour ago
                read: true,
                important: true
            }
        ];

        sampleNotifications.forEach(notification => {
            this.addNotification(notification);
        });
    }

    createContextualNotification(message) {
        const lowerMessage = message.toLowerCase();
        let notification = null;

        // Create contextual notifications based on user queries
        if (this.containsKeywords(lowerMessage, ['lora', 'low-rank'])) {
            notification = {
                id: 'tip-lora-' + Date.now(),
                title: 'LoRA Learning Tip',
                body: 'Try our hands-on LoRA workshop for practical experience!',
                icon: 'bi bi-lightbulb',
                type: 'tip',
                timestamp: Date.now(),
                read: false,
                important: false,
                actions: [
                    { action: 'continue_workshop', title: 'Start Workshop' }
                ]
            };
        } else if (this.containsKeywords(lowerMessage, ['qlora', 'quantized'])) {
            notification = {
                id: 'tip-qlora-' + Date.now(),
                title: 'QLoRA Resource',
                body: 'Check out our QLoRA deep dive for advanced techniques!',
                icon: 'bi bi-book',
                type: 'tip',
                timestamp: Date.now(),
                read: false,
                important: false,
                actions: [
                    { action: 'view_progress', title: 'View Resources' }
                ]
            };
        } else if (this.containsKeywords(lowerMessage, ['quiz', 'test', 'assessment'])) {
            notification = {
                id: 'tip-quiz-' + Date.now(),
                title: 'Knowledge Assessment',
                body: 'Test your understanding with our interactive quizzes!',
                icon: 'bi bi-question-circle',
                type: 'tip',
                timestamp: Date.now(),
                read: false,
                important: false,
                actions: [
                    { action: 'view_quiz', title: 'Take Quiz' }
                ]
            };
        }

        // Add the notification if one was created
        if (notification) {
            setTimeout(() => {
                this.addNotification(notification);
            }, 2000); // Delay to avoid overwhelming the user
        }
    }
}

// Initialize AI Learning Assistant when DOM is loaded
// Initialize immediately and also when DOM is ready
function initializeAIAssistant() {
    console.log('🤖 AI Learning Assistant initializing...');
    console.log('Current URL:', window.location.href);
    console.log('Document ready state:', document.readyState);
    console.log('Document body exists:', !!document.body);

    // Create a simple, guaranteed-to-work AI button first
    createSimpleAIButton();

    // Then initialize the full assistant
    try {
        setTimeout(() => {
            console.log('🚀 Creating AILearningAssistant instance...');
            window.aiAssistant = new AILearningAssistant();
            console.log('✅ AI Learning Assistant loaded successfully');
            console.log('AI Assistant instance:', window.aiAssistant);
            console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.aiAssistant)));

            // Test API connection
            testAPIConnection();

            // Update the simple button to show it's ready
            setTimeout(() => {
                const simpleBtn = document.getElementById('simple-ai-button');
                if (simpleBtn) {
                    // Add a subtle pulse animation to show it's ready
                    simpleBtn.style.animation = 'pulse 2s infinite';
                    simpleBtn.style.boxShadow = '0 0 20px rgba(60, 100, 48, 0.5)';
                    console.log('✨ AI Assistant is ready - button updated with glow');
                } else {
                    console.log('❌ Simple AI button not found for update');
                }
            }, 500);
        }, 100);
    } catch (error) {
        console.error('❌ Failed to initialize AI Learning Assistant:', error);
        console.error('Error details:', error.stack);
    }
}

// Test API connection
async function testAPIConnection() {
    try {
        console.log('Testing AI API connection...');
        const response = await fetch('/api/ai/status');
        if (response.ok) {
            const data = await response.json();
            console.log('AI API Status:', data);
        } else {
            console.error('AI API Status check failed:', response.status);
        }
    } catch (error) {
        console.error('AI API connection test failed:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAIAssistant);

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', initializeAIAssistant);
} else {
    // DOM is already loaded
    initializeAIAssistant();
}

// Force initialization after a delay to ensure everything is loaded
setTimeout(() => {
    console.log('Force initializing AI Assistant...');
    initializeAIAssistant();
}, 2000);

// Force create button after a short delay as backup - DISABLED (Final AI Assistant handles this)
setTimeout(() => {
    console.log('Backup button creation disabled - Final AI Assistant handles this...');
    // if (!document.getElementById('simple-ai-button')) {
    //     console.log('Button not found, creating backup button...');
    //     createSimpleAIButton();
    // }
}, 1000);

// Emergency backup - DISABLED (Final AI Assistant handles this)
setTimeout(() => {
    console.log('Emergency backup disabled - Final AI Assistant handles button creation...');
    return; // Exit early to prevent duplicate buttons

    if (!document.getElementById('simple-ai-button')) {
        console.log('Creating emergency backup button...');
        const emergencyBtn = document.createElement('div');
        emergencyBtn.id = 'simple-ai-button';
        emergencyBtn.style.cssText = `
            position: fixed !important;
            right: 24px !important;
            bottom: 24px !important;
            width: 64px !important;
            height: 64px !important;
            background: #3c6430 !important;
            border-radius: 50% !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            font-size: 28px !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        `;
        emergencyBtn.innerHTML = '🤖';
        emergencyBtn.onclick = () => {
            alert('AI Assistant is loading... Please try again in a moment!');
        };
        document.body.appendChild(emergencyBtn);
        console.log('Emergency button created');
    }
}, 2000);

// Create a simple AI button that definitely works
function createSimpleAIButton() {
    console.log('🔘 Creating simple AI button...');
    console.log('Document body exists:', !!document.body);
    console.log('Document ready state:', document.readyState);
    console.log('Window location:', window.location.href);

    // Remove any existing button first
    const existing = document.getElementById('simple-ai-button');
    if (existing) {
        console.log('🗑️ Removing existing button');
        existing.remove();
    }

    // Create the button
    const button = document.createElement('div');
    button.id = 'simple-ai-button';
    button.innerHTML = `
        <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #3c6430, #7350a5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(60, 100, 48, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 28px;
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            🤖
        </div>
    `;

    // Position the button with maximum priority
    button.style.cssText = `
        position: fixed !important;
        right: 24px !important;
        bottom: 24px !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        width: 64px !important;
        height: 64px !important;
    `;

    // Add click handler
    button.addEventListener('click', function() {
        console.log('Simple AI button clicked!');
        console.log('Window aiAssistant:', window.aiAssistant);

        // Try to open the full assistant if it exists
        if (window.aiAssistant && window.aiAssistant.toggleAssistant) {
            console.log('Opening full AI assistant...');
            window.aiAssistant.toggleAssistant();
        } else if (window.aiAssistant && window.aiAssistant.openAssistant) {
            console.log('Opening AI assistant with openAssistant method...');
            window.aiAssistant.openAssistant();
        } else {
            console.log('AI Assistant not ready yet, showing loading message...');
            console.log('Available methods on aiAssistant:', window.aiAssistant ? Object.getOwnPropertyNames(window.aiAssistant) : 'No aiAssistant');
            // Create a better loading message
            showAILoadingMessage();
        }
    });

    // Add visual feedback on click
    button.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    // Add to page
    try {
        if (!document.body) {
            console.error('❌ Document body not available yet');
            return;
        }

        document.body.appendChild(button);
        console.log('✅ Simple AI button added to page successfully');
        console.log('Button element:', button);
        console.log('Button ID:', button.id);
        console.log('Button innerHTML:', button.innerHTML);

        // Verify it's actually in the DOM
        setTimeout(() => {
            const check = document.getElementById('simple-ai-button');
            console.log('🔍 Button verification check:', !!check);
            if (check) {
                const rect = check.getBoundingClientRect();
                console.log('📐 Button position:', rect);
                console.log('👁️ Button is visible:', check.offsetWidth > 0 && check.offsetHeight > 0);
                console.log('🎨 Button computed style display:', window.getComputedStyle(check).display);
                console.log('🎨 Button computed style position:', window.getComputedStyle(check).position);
                console.log('🎨 Button computed style z-index:', window.getComputedStyle(check).zIndex);
            } else {
                console.error('❌ Button verification failed - not found in DOM');
            }
        }, 100);
    } catch (error) {
        console.error('❌ Failed to add button to page:', error);
        console.error('Error details:', error.stack);
    }
}

// Show a nice loading message when AI assistant is not ready
function showAILoadingMessage() {
    // Remove any existing loading message
    const existing = document.getElementById('ai-loading-message');
    if (existing) existing.remove();

    // Create loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-loading-message';
    loadingDiv.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #3c6430, #7350a5);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(60, 100, 48, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 280px;
            animation: fadeIn 0.3s ease;
        ">
            <div style="font-size: 24px; margin-bottom: 8px;">🤖</div>
            <div style="margin-bottom: 4px;">AI Assistant Loading...</div>
            <div style="font-size: 12px; opacity: 0.8;">Please wait a moment</div>
        </div>
    `;

    // Position the message
    loadingDiv.style.cssText = `
        position: fixed !important;
        right: 100px !important;
        bottom: 24px !important;
        z-index: 9998 !important;
        pointer-events: none !important;
    `;

    // Add to page
    document.body.appendChild(loadingDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (loadingDiv.parentNode) {
            loadingDiv.style.opacity = '0';
            loadingDiv.style.transform = 'translateX(20px)';
            setTimeout(() => loadingDiv.remove(), 300);
        }
    }, 3000);
}
