/**
 * Enhanced AI Assistant
 * Provides a robust, intelligent assistant for the LLM Fine-Tuning platform
 * with advanced features and improved user experience
 */

class AIAssistant {
    constructor() {
        this.initialized = false;
        this.isOpen = false;
        this.container = null;
        this.messages = [];
        this.isTyping = false;
        this.typingSpeed = 25; // ms per character - slightly faster
        this.voiceEnabled = false;
        this.voiceRecognition = null;
        this.isListening = false;
        this.lastInteraction = Date.now();
        this.inactivityTimeout = 300000; // 5 minutes
        this.suggestedQuestions = [
            "What is this website about?",
            "How do I use the Visual Thesaurus?",
            "Tell me about LoRA fine-tuning",
            "How can I access the hands-on exercises?",
            "What accessibility features does this site have?",
            "How do I use the voice features?",
            "What is the difference between LoRA and QLoRA?",
            "Show me a complete LoRA implementation example",
            "How do I optimize memory usage for fine-tuning?"
        ];
        this.contextualSuggestions = {
            '/': [
                "What is this platform about?",
                "How do I navigate this website?",
                "What features does this platform offer?",
                "How do I get started with LLM fine-tuning?"
            ],
            '/learn': [
                "What topics can I learn about?",
                "How do I access the workshops?",
                "What's the difference between LoRA and QLoRA?",
                "How can I track my learning progress?"
            ],
            '/workshop': [
                "How do I complete this workshop?",
                "What are the prerequisites for this workshop?",
                "Can you explain this concept in more detail?",
                "How do I run the code examples?"
            ],
            '/thesaurus': [
                "How does the thesaurus visualization work?",
                "Can I search for specific concepts?",
                "How do I interpret the connections between concepts?",
                "How is this related to LLM fine-tuning?"
            ],
            '/guide': [
                "How do I implement this technique?",
                "What are the advantages of this approach?",
                "Are there any hands-on exercises for this topic?",
                "How does this compare to other techniques?"
            ],
            '/guide/lora-hands-on': [
                "How do I run this notebook in Google Colab?",
                "What GPU requirements do I need for LoRA?",
                "Can I modify the code for my own dataset?",
                "How do I save and load the LoRA adapter?"
            ]
        };
    }

    /**
     * Initialize the AI Assistant
     */
    init() {
        if (this.initialized) return;

        console.log('Initializing Enhanced AI Assistant...');

        // Create the assistant UI
        this.createAssistantUI();

        // Add event listeners
        this.addEventListeners();

        // Load conversation history
        this.loadConversationHistory();

        // Add contextual suggestions based on current page
        this.updateContextualSuggestions();

        // Initialize voice recognition if supported
        this.initVoiceRecognition();

        // Set up inactivity tracking
        this.setupInactivityTracking();

        this.initialized = true;
        console.log('Enhanced AI Assistant initialized successfully');
    }

    /**
     * Initialize voice recognition if supported by the browser
     */
    initVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';

            // Set up voice recognition event handlers
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice recognized:', transcript);
                this.textInput.value = transcript;
                this.sendMessage(transcript);
            };

            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton();
            };

            this.voiceRecognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };

            this.voiceEnabled = true;
            console.log('Voice recognition initialized');
        } else {
            console.log('Voice recognition not supported by this browser');
            this.voiceEnabled = false;
        }
    }

    /**
     * Set up tracking for user inactivity
     */
    setupInactivityTracking() {
        // Update last interaction time on user activity
        const updateLastInteraction = () => {
            this.lastInteraction = Date.now();
        };

        // Track user interactions
        document.addEventListener('mousemove', updateLastInteraction);
        document.addEventListener('keydown', updateLastInteraction);
        document.addEventListener('click', updateLastInteraction);
        document.addEventListener('scroll', updateLastInteraction);

        // Check for inactivity periodically
        setInterval(() => {
            const now = Date.now();
            const timeSinceLastInteraction = now - this.lastInteraction;

            // If assistant is open and user has been inactive
            if (this.isOpen && timeSinceLastInteraction > this.inactivityTimeout) {
                // Suggest something to the user
                this.addMessage('assistant', "I noticed you've been inactive for a while. Can I help you with anything else about LLM fine-tuning?");

                // Reset the timer
                this.lastInteraction = now;
            }
        }, 60000); // Check every minute
    }

    /**
     * Create the assistant UI
     */
    createAssistantUI() {
        // Create container if it doesn't exist
        if (!document.querySelector('.ai-assistant-container')) {
            // Create main container
            this.container = document.createElement('div');
            this.container.className = 'ai-assistant-container';
            this.container.style.position = 'fixed';
            this.container.style.bottom = '20px';
            this.container.style.right = '20px';
            this.container.style.zIndex = '1000';
            this.container.style.display = 'flex';
            this.container.style.flexDirection = 'column';
            this.container.style.alignItems = 'flex-end';

            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'ai-assistant-toggle';
            toggleButton.innerHTML = '<i class="bi bi-robot"></i>';
            toggleButton.style.width = '60px';
            toggleButton.style.height = '60px';
            toggleButton.style.borderRadius = '50%';
            toggleButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
            toggleButton.style.border = 'none';
            toggleButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            toggleButton.style.color = 'white';
            toggleButton.style.fontSize = '24px';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.transition = 'all 0.3s ease';
            toggleButton.style.display = 'flex';
            toggleButton.style.alignItems = 'center';
            toggleButton.style.justifyContent = 'center';
            toggleButton.setAttribute('aria-label', 'Open AI Assistant');

            // Create chat window
            const chatWindow = document.createElement('div');
            chatWindow.className = 'ai-assistant-window';
            // Styles are now in CSS file

            // Create chat header
            const chatHeader = document.createElement('div');
            chatHeader.className = 'ai-assistant-header';
            // Styles are now in CSS file

            const headerTitle = document.createElement('div');
            headerTitle.className = 'ai-assistant-title';
            headerTitle.innerHTML = '<i class="bi bi-robot me-2"></i> AI Assistant';
            // Styles are now in CSS file

            const closeButton = document.createElement('button');
            closeButton.className = 'ai-assistant-close';
            closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = '#ffffff';
            closeButton.style.fontSize = '1.2rem';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '0';
            closeButton.style.display = 'flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';
            closeButton.setAttribute('aria-label', 'Close AI Assistant');

            chatHeader.appendChild(headerTitle);
            chatHeader.appendChild(closeButton);

            // Create chat messages container
            const messagesContainer = document.createElement('div');
            messagesContainer.className = 'ai-assistant-messages';
            // Styles are now in CSS file

            // Create input area
            const inputArea = document.createElement('div');
            inputArea.className = 'ai-assistant-input';
            // Styles are now in CSS file

            const inputForm = document.createElement('form');
            inputForm.className = 'ai-assistant-form';
            // Styles are now in CSS file

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'ai-assistant-text-input';
            textInput.placeholder = 'Ask me anything...';
            // Styles are now in CSS file

            // Create voice input button if supported
            const voiceButton = document.createElement('button');
            voiceButton.type = 'button';
            voiceButton.className = 'ai-assistant-voice';
            voiceButton.innerHTML = '<i class="bi bi-mic"></i>';
            voiceButton.style.width = '45px';
            voiceButton.style.height = '45px';
            voiceButton.style.borderRadius = '50%';
            voiceButton.style.background = 'linear-gradient(135deg, rgba(0, 153, 255, 0.9), rgba(0, 102, 255, 0.9))';
            voiceButton.style.border = 'none';
            voiceButton.style.color = '#ffffff';
            voiceButton.style.fontSize = '1.2rem';
            voiceButton.style.display = 'flex';
            voiceButton.style.alignItems = 'center';
            voiceButton.style.justifyContent = 'center';
            voiceButton.style.cursor = 'pointer';
            voiceButton.style.transition = 'all 0.2s ease';
            voiceButton.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            voiceButton.setAttribute('aria-label', 'Voice Input');

            // Only show voice button if supported
            if (!this.voiceEnabled) {
                voiceButton.style.display = 'none';
            }

            const sendButton = document.createElement('button');
            sendButton.type = 'submit';
            sendButton.className = 'ai-assistant-send';
            sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
            // Styles are now in CSS file

            inputForm.appendChild(textInput);
            if (this.voiceEnabled) {
                inputForm.appendChild(voiceButton);
            }
            inputForm.appendChild(sendButton);
            inputArea.appendChild(inputForm);

            // Store reference to voice button
            this.voiceButton = voiceButton;

            // Create suggestions area
            const suggestionsArea = document.createElement('div');
            suggestionsArea.className = 'ai-assistant-suggestions';
            // Styles are now in CSS file

            // Add suggested questions
            this.suggestedQuestions.forEach(question => {
                const suggestionButton = document.createElement('button');
                suggestionButton.className = 'ai-assistant-suggestion';
                suggestionButton.textContent = question;
                suggestionButton.style.background = 'rgba(66, 135, 245, 0.1)';
                suggestionButton.style.border = '1px solid rgba(66, 135, 245, 0.3)';
                suggestionButton.style.borderRadius = '15px';
                suggestionButton.style.padding = '5px 10px';
                suggestionButton.style.fontSize = '0.85rem';
                suggestionButton.style.color = '#b8e0ff';
                suggestionButton.style.cursor = 'pointer';
                suggestionButton.style.transition = 'all 0.2s ease';

                suggestionButton.addEventListener('mouseover', () => {
                    suggestionButton.style.background = 'rgba(66, 135, 245, 0.2)';
                });

                suggestionButton.addEventListener('mouseout', () => {
                    suggestionButton.style.background = 'rgba(66, 135, 245, 0.1)';
                });

                suggestionButton.addEventListener('click', () => {
                    textInput.value = question;
                    this.sendMessage(question);
                });

                suggestionsArea.appendChild(suggestionButton);
            });

            // Assemble chat window
            chatWindow.appendChild(chatHeader);
            chatWindow.appendChild(messagesContainer);
            chatWindow.appendChild(suggestionsArea);
            chatWindow.appendChild(inputArea);

            // Add to container
            this.container.appendChild(chatWindow);
            this.container.appendChild(toggleButton);

            // Add to document
            document.body.appendChild(this.container);

            // Store references
            this.toggleButton = toggleButton;
            this.chatWindow = chatWindow;
            this.messagesContainer = messagesContainer;
            this.textInput = textInput;
            this.inputForm = inputForm;
            this.suggestionsArea = suggestionsArea;

            // Add welcome message
            this.addMessage('assistant', 'Hello! I\'m your AI assistant for LLM fine-tuning. How can I help you today?');
        }
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => {
            this.toggleAssistant();
        });

        // Close button click
        const closeButton = this.chatWindow.querySelector('.ai-assistant-close');
        closeButton.addEventListener('click', () => {
            this.toggleAssistant(false);
        });

        // Form submission
        this.inputForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const message = this.textInput.value.trim();
            if (message) {
                this.sendMessage(message);
                this.textInput.value = '';
            }
        });

        // Voice button click
        if (this.voiceEnabled && this.voiceButton) {
            this.voiceButton.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Alt+A to toggle assistant
            if (event.altKey && event.key === 'a') {
                this.toggleAssistant();
                event.preventDefault();
            }

            // Alt+V to toggle voice input when assistant is open
            if (this.isOpen && this.voiceEnabled && event.altKey && event.key === 'v') {
                this.toggleVoiceInput();
                event.preventDefault();
            }
        });

        // Listen for page changes to update contextual suggestions
        window.addEventListener('popstate', () => {
            this.updateContextualSuggestions();
        });

        // Add window resize handler to adjust UI
        window.addEventListener('resize', () => {
            this.adjustUIForScreenSize();
        });
    }

    /**
     * Toggle voice input on/off
     */
    toggleVoiceInput() {
        if (!this.voiceEnabled) return;

        if (this.isListening) {
            // Stop listening
            this.voiceRecognition.stop();
            this.isListening = false;
        } else {
            // Start listening
            try {
                this.voiceRecognition.start();
                this.isListening = true;

                // Show feedback to user
                this.textInput.placeholder = 'Listening...';
                this.textInput.disabled = true;
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.isListening = false;
            }
        }

        // Update button appearance
        this.updateVoiceButton();
    }

    /**
     * Update voice button appearance based on listening state
     */
    updateVoiceButton() {
        if (!this.voiceEnabled || !this.voiceButton) return;

        if (this.isListening) {
            // Show active state
            this.voiceButton.innerHTML = '<i class="bi bi-mic-fill"></i>';
            this.voiceButton.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(178, 34, 52, 0.9))';
            this.voiceButton.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.5)';
            this.voiceButton.style.transform = 'scale(1.1)';
            this.voiceButton.setAttribute('aria-label', 'Stop Voice Input');

            // Pulse animation
            this.voiceButton.style.animation = 'pulse-effect 1.5s infinite';
        } else {
            // Show inactive state
            this.voiceButton.innerHTML = '<i class="bi bi-mic"></i>';
            this.voiceButton.style.background = 'linear-gradient(135deg, rgba(0, 153, 255, 0.9), rgba(0, 102, 255, 0.9))';
            this.voiceButton.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            this.voiceButton.style.transform = 'none';
            this.voiceButton.setAttribute('aria-label', 'Start Voice Input');

            // Remove animation
            this.voiceButton.style.animation = 'none';

            // Re-enable text input
            this.textInput.placeholder = 'Ask me anything...';
            this.textInput.disabled = false;
        }
    }

    /**
     * Adjust UI based on screen size
     */
    adjustUIForScreenSize() {
        const isMobile = window.innerWidth < 576;

        if (isMobile) {
            // Mobile adjustments
            if (this.chatWindow) {
                this.chatWindow.style.width = '100%';
                this.chatWindow.style.height = '80vh';
                this.chatWindow.style.position = 'fixed';
                this.chatWindow.style.bottom = '0';
                this.chatWindow.style.right = '0';
                this.chatWindow.style.left = '0';
                this.chatWindow.style.margin = '0';
                this.chatWindow.style.borderRadius = '20px 20px 0 0';
            }
        } else {
            // Desktop adjustments
            if (this.chatWindow) {
                this.chatWindow.style.width = '380px';
                this.chatWindow.style.height = '500px';
                this.chatWindow.style.position = 'relative';
                this.chatWindow.style.bottom = 'auto';
                this.chatWindow.style.right = 'auto';
                this.chatWindow.style.left = 'auto';
                this.chatWindow.style.margin = '0 0 15px 0';
                this.chatWindow.style.borderRadius = '15px';
            }
        }
    }

    /**
     * Toggle the assistant visibility
     */
    toggleAssistant(forceState = null) {
        const newState = forceState !== null ? forceState : !this.isOpen;

        if (newState) {
            // Open assistant
            this.chatWindow.style.display = 'flex';
            this.toggleButton.innerHTML = '<i class="bi bi-x-lg"></i>';
            this.toggleButton.setAttribute('aria-label', 'Close AI Assistant');

            // Scroll to bottom of messages
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

            // Focus input
            setTimeout(() => {
                this.textInput.focus();
            }, 100);
        } else {
            // Close assistant
            this.chatWindow.style.display = 'none';
            this.toggleButton.innerHTML = '<i class="bi bi-robot"></i>';
            this.toggleButton.setAttribute('aria-label', 'Open AI Assistant');
        }

        this.isOpen = newState;
    }

    /**
     * Send a message to the assistant
     */
    sendMessage(message) {
        // Add user message
        this.addMessage('user', message);

        // Save to conversation history
        this.messages.push({ role: 'user', content: message });
        this.saveConversationHistory();

        // Disable input while processing
        this.textInput.disabled = true;
        this.textInput.placeholder = 'AI is thinking...';

        // Process the message
        this.processMessage(message);
    }

    /**
     * Process a message and generate a response
     */
    processMessage(message) {
        // In a real implementation, this would call the backend API
        // For now, we'll simulate a response

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-assistant-message assistant-message typing-indicator';
        typingIndicator.style.alignSelf = 'flex-start';
        typingIndicator.style.background = 'rgba(40, 40, 40, 0.8)';
        typingIndicator.style.color = '#e0e0e0';
        typingIndicator.style.border = '1px solid rgba(66, 135, 245, 0.2)';
        typingIndicator.style.maxWidth = '80%';
        typingIndicator.style.padding = '10px 15px';
        typingIndicator.style.borderRadius = '15px';
        typingIndicator.style.marginBottom = '8px';

        // Add typing dots
        const dots = document.createElement('div');
        dots.style.display = 'flex';
        dots.style.gap = '5px';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.background = '#b8e0ff';
            dot.style.animation = `typing-animation 1s infinite ${i * 0.3}s`;
            dots.appendChild(dot);
        }

        typingIndicator.appendChild(dots);
        this.messagesContainer.appendChild(typingIndicator);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            this.messagesContainer.removeChild(typingIndicator);

            // Get response text
            const responseText = data.answer || this.getFallbackResponse(message);

            // Add assistant response
            this.addMessage('assistant', responseText);

            // Save to conversation history
            this.messages.push({ role: 'assistant', content: responseText });
            this.saveConversationHistory();

            // Re-enable input
            this.textInput.disabled = false;
            this.textInput.placeholder = 'Ask me anything...';
            this.textInput.focus();

            // Trigger voice response if voice assistant is enabled and speaking is active
            if (window.voiceAssistant && window.voiceAssistant.isSpeaking) {
                window.voiceAssistant.speak(responseText);
            }
        })
        .catch(error => {
            console.error('Error processing message:', error);

            // Remove typing indicator
            this.messagesContainer.removeChild(typingIndicator);

            // Get fallback response
            const fallbackResponse = this.getFallbackResponse(message);

            // Add error message
            this.addMessage('assistant', fallbackResponse);

            // Save to conversation history
            this.messages.push({ role: 'assistant', content: fallbackResponse });
            this.saveConversationHistory();

            // Re-enable input
            this.textInput.disabled = false;
            this.textInput.placeholder = 'Ask me anything...';
            this.textInput.focus();
        });
    }

    /**
     * Add a message to the chat
     */
    addMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `ai-assistant-message ${role}-message`;
        // Styles are now in CSS file

        if (role === 'user') {
            // Styles are now in CSS file
            messageElement.textContent = content;

            this.messagesContainer.appendChild(messageElement);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        } else {
            // Styles are now in CSS file

            // Add typing effect for assistant messages
            this.messagesContainer.appendChild(messageElement);
            this.typeMessage(messageElement, content);
        }
    }

    /**
     * Type a message with animation
     */
    typeMessage(element, content) {
        let i = 0;
        this.isTyping = true;

        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        typingIndicator.style.display = 'flex';
        typingIndicator.style.gap = '5px';

        const dot = document.createElement('span');
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.background = '#b8e0ff';
        dot.style.animation = 'typing-animation 1s infinite';

        for (let i = 0; i < 3; i++) {
            const dotClone = dot.cloneNode();
            dotClone.style.animationDelay = `${i * 0.3}s`;
            typingIndicator.appendChild(dotClone);
        }

        element.appendChild(typingIndicator);

        // Scroll to see the typing indicator
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        // Type the message
        const typeNextChar = () => {
            if (i < content.length) {
                // Remove typing indicator when we start adding content
                if (i === 0) {
                    element.innerHTML = '';
                }

                // Handle markdown-like formatting
                if (content.substring(i).startsWith('**') && content.substring(i + 2).includes('**')) {
                    // Bold text
                    const endBold = content.indexOf('**', i + 2);
                    const boldText = content.substring(i + 2, endBold);

                    const boldElement = document.createElement('strong');
                    boldElement.textContent = boldText;
                    element.appendChild(boldElement);

                    i = endBold + 2;
                } else if (content.substring(i).startsWith('*') && content.substring(i + 1).includes('*')) {
                    // Italic text
                    const endItalic = content.indexOf('*', i + 1);
                    const italicText = content.substring(i + 1, endItalic);

                    const italicElement = document.createElement('em');
                    italicElement.textContent = italicText;
                    element.appendChild(italicElement);

                    i = endItalic + 1;
                } else if (content.substring(i).startsWith('`') && content.substring(i + 1).includes('`')) {
                    // Code text
                    const endCode = content.indexOf('`', i + 1);
                    const codeText = content.substring(i + 1, endCode);

                    const codeElement = document.createElement('code');
                    codeElement.textContent = codeText;
                    codeElement.style.background = 'rgba(0, 0, 0, 0.3)';
                    codeElement.style.padding = '2px 5px';
                    codeElement.style.borderRadius = '3px';
                    codeElement.style.fontFamily = 'monospace';
                    element.appendChild(codeElement);

                    i = endCode + 1;
                } else {
                    // Regular text
                    const textNode = document.createTextNode(content[i]);
                    element.appendChild(textNode);
                    i++;
                }

                // Scroll to bottom as we type
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

                // Schedule next character
                setTimeout(typeNextChar, this.typingSpeed);
            } else {
                // Finished typing
                this.isTyping = false;

                // Add "Copy" button for long responses
                if (content.length > 100) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                    copyButton.style.background = 'rgba(66, 135, 245, 0.2)';
                    copyButton.style.border = 'none';
                    copyButton.style.borderRadius = '5px';
                    copyButton.style.padding = '3px 8px';
                    copyButton.style.fontSize = '0.8rem';
                    copyButton.style.color = '#b8e0ff';
                    copyButton.style.cursor = 'pointer';
                    copyButton.style.marginTop = '8px';
                    copyButton.style.alignSelf = 'flex-end';

                    copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(content).then(() => {
                            copyButton.innerHTML = '<i class="bi bi-clipboard-check"></i>';
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                            }, 2000);
                        });
                    });

                    element.appendChild(document.createElement('br'));
                    element.appendChild(copyButton);
                }
            }
        };

        // Start typing
        setTimeout(typeNextChar, this.typingSpeed * 2);
    }

    /**
     * Get a fallback response when the API fails
     */
    getFallbackResponse(message) {
        const fallbackResponses = [
            "I'm sorry, I'm having trouble processing that request right now. Could you try asking something else?",
            "I apologize, but I couldn't generate a proper response. Let me know if you'd like to try a different question.",
            "It seems I'm having difficulty with that question. Could you rephrase it or ask something else about LLM fine-tuning?",
            "I'm still learning about LLM fine-tuning. Could you try asking your question in a different way?",
            "I don't have enough information to answer that properly. Could you provide more context or ask a different question?"
        ];

        // Try to give a more specific response based on keywords
        const messageLower = message.toLowerCase();

        if (messageLower.includes('lora')) {
            return "**LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique that significantly reduces memory usage and training time.\n\n" +
                   "**How LoRA works:**\n" +
                   "1. It freezes the pre-trained model weights\n" +
                   "2. Injects trainable rank decomposition matrices into each layer of the Transformer architecture\n" +
                   "3. These low-rank matrices capture the task-specific adaptations\n\n" +
                   "**Key benefits:**\n" +
                   "- Reduces trainable parameters by 10,000x in some cases\n" +
                   "- Maintains 95%+ of full fine-tuning performance\n" +
                   "- Enables fine-tuning on consumer GPUs (even 8GB VRAM)\n" +
                   "- Allows for easy model switching by swapping adapters\n\n" +
                   "**Implementation:**\n" +
                   "```python\n" +
                   "from peft import LoraConfig, get_peft_model\n\n" +
                   "lora_config = LoraConfig(\n" +
                   "    r=16,  # rank of update matrices\n" +
                   "    lora_alpha=32,  # scaling factor\n" +
                   "    target_modules=[\"q_proj\", \"v_proj\"],  # which modules to apply LoRA to\n" +
                   "    lora_dropout=0.05\n" +
                   ")\n\n" +
                   "model = get_peft_model(base_model, lora_config)\n" +
                   "```\n\n" +
                   "Would you like to know more about specific aspects of LoRA or how to implement it for your project?";
        } else if (messageLower.includes('qlora')) {
            return "**QLoRA (Quantized Low-Rank Adaptation)** combines quantization with LoRA for extremely memory-efficient fine-tuning.\n\n" +
                   "**How QLoRA works:**\n" +
                   "1. Quantizes the pre-trained model weights to 4-bit precision (4-bit NormalFloat or 4-bit Integer)\n" +
                   "2. Uses a double quantization technique to further reduce memory\n" +
                   "3. Keeps a small set of 16-bit parameters for the LoRA adapters\n" +
                   "4. Uses paged optimizers to manage memory efficiently\n\n" +
                   "**Key benefits:**\n" +
                   "- Fine-tune 65B+ parameter models on a single consumer GPU (even 16GB VRAM)\n" +
                   "- Maintains full fine-tuning quality (often better than standard LoRA)\n" +
                   "- Reduces memory usage by up to 4x compared to standard LoRA\n" +
                   "- Enables fine-tuning of larger models for better performance\n\n" +
                   "**Implementation:**\n" +
                   "```python\n" +
                   "from transformers import BitsAndBytesConfig\n" +
                   "from peft import LoraConfig, get_peft_model\n\n" +
                   "# 4-bit quantization configuration\n" +
                   "bnb_config = BitsAndBytesConfig(\n" +
                   "    load_in_4bit=True,\n" +
                   "    bnb_4bit_use_double_quant=True,\n" +
                   "    bnb_4bit_quant_type=\"nf4\",\n" +
                   "    bnb_4bit_compute_dtype=torch.float16\n" +
                   ")\n\n" +
                   "# Load model with quantization\n" +
                   "model = AutoModelForCausalLM.from_pretrained(\n" +
                   "    \"meta-llama/Llama-2-7b\",\n" +
                   "    quantization_config=bnb_config,\n" +
                   "    device_map=\"auto\"\n" +
                   ")\n\n" +
                   "# Apply LoRA\n" +
                   "lora_config = LoraConfig(...)\n" +
                   "model = get_peft_model(model, lora_config)\n" +
                   "```\n\n" +
                   "Would you like to know more about implementing QLoRA or how to optimize it for your specific hardware?";
        } else if (messageLower.includes('memory') || messageLower.includes('gpu')) {
            return "**Memory Optimization Techniques for LLM Fine-Tuning**\n\n" +
                   "Here are comprehensive strategies to reduce memory usage during fine-tuning:\n\n" +
                   "**1. Parameter-Efficient Fine-Tuning (PEFT)**\n" +
                   "- **LoRA**: Trains only low-rank adapter matrices (reduces parameters by 10,000x)\n" +
                   "- **QLoRA**: Combines 4-bit quantization with LoRA (4x more efficient than LoRA)\n" +
                   "- **Prefix Tuning**: Adds trainable continuous vectors to each transformer layer\n" +
                   "- **Prompt Tuning**: Adds trainable vectors only to the input layer\n\n" +

                   "**2. Quantization Techniques**\n" +
                   "- **Post-Training Quantization**: Convert weights to INT8/INT4 after training\n" +
                   "- **Quantization-Aware Training**: Train with simulated quantization\n" +
                   "- **Mixed Precision Training**: Use FP16 or BF16 instead of FP32\n\n" +

                   "**3. Optimization Techniques**\n" +
                   "- **Gradient Checkpointing**: Trade computation for memory by recomputing activations\n" +
                   "- **Gradient Accumulation**: Update weights after multiple forward/backward passes\n" +
                   "- **Optimizer States**: Use memory-efficient optimizers like AdamW with 8-bit states\n" +
                   "- **Activation Offloading**: Move activations to CPU when not needed\n\n" +

                   "**4. Hardware Strategies**\n" +
                   "- **Model Parallelism**: Split model across multiple GPUs\n" +
                   "- **Pipeline Parallelism**: Process different batches on different GPUs\n" +
                   "- **CPU Offloading**: Move parts of the model to CPU temporarily\n" +
                   "- **Disk Offloading**: Use disk as additional memory (very slow but works)\n\n" +

                   "**5. Implementation Example**\n" +
                   "```python\n" +
                   "# Combine multiple techniques for maximum efficiency\n" +
                   "model = AutoModelForCausalLM.from_pretrained(\n" +
                   "    \"meta-llama/Llama-2-7b\",\n" +
                   "    load_in_8bit=True,  # 8-bit quantization\n" +
                   "    device_map=\"auto\"   # automatic model parallelism\n" +
                   ")\n\n" +
                   "# Enable gradient checkpointing\n" +
                   "model.gradient_checkpointing_enable()\n\n" +
                   "# Apply LoRA\n" +
                   "model = get_peft_model(model, LoraConfig(...))\n\n" +
                   "# Use gradient accumulation during training\n" +
                   "for batch in dataloader:\n" +
                   "    with torch.cuda.amp.autocast():  # mixed precision\n" +
                   "        loss = model(batch).loss\n" +
                   "    (loss / gradient_accumulation_steps).backward()\n" +
                   "    if step % gradient_accumulation_steps == 0:\n" +
                   "        optimizer.step()\n" +
                   "        optimizer.zero_grad()\n" +
                   "```\n\n" +
                   "Would you like more specific information about any of these techniques?";
        } else if (messageLower.includes('dataset') || messageLower.includes('data')) {
            return "**Comprehensive Guide to Datasets for LLM Fine-Tuning**\n\n" +
                   "**1. Dataset Selection Criteria**\n" +
                   "- **Relevance**: Data should closely match your target task and domain\n" +
                   "- **Quality**: High-quality, accurate information from reliable sources\n" +
                   "- **Diversity**: Varied examples covering different aspects of the task\n" +
                   "- **Size**: Typically 1,000-100,000 examples depending on task complexity\n" +
                   "- **Balance**: Equal representation of different classes/categories\n\n" +

                   "**2. Data Preparation Steps**\n" +
                   "- **Cleaning**: Remove duplicates, errors, and irrelevant content\n" +
                   "- **Formatting**: Convert to consistent format (JSON, CSV, etc.)\n" +
                   "- **Tokenization**: Pre-tokenize to speed up training\n" +
                   "- **Filtering**: Remove toxic, biased, or sensitive information\n" +
                   "- **Augmentation**: Generate additional examples if needed\n\n" +

                   "**3. Instruction Tuning Format**\n" +
                   "```json\n" +
                   "{\n" +
                   "  \"instruction\": \"Classify the sentiment of this review.\",\n" +
                   "  \"input\": \"I absolutely loved this product! It exceeded all my expectations.\",\n" +
                   "  \"output\": \"Positive\"\n" +
                   "}\n" +
                   "```\n\n" +

                   "**4. Popular Datasets**\n" +
                   "- **General Purpose**: Alpaca, Dolly, OpenAssistant\n" +
                   "- **Coding**: CodeAlpaca, WizardCoder, The Stack\n" +
                   "- **Reasoning**: GSM8K, MMLU, HumanEval\n" +
                   "- **Dialogue**: Anthropic's Helpful/Harmless, ShareGPT\n\n" +

                   "**5. Data Loading and Processing**\n" +
                   "```python\n" +
                   "from datasets import load_dataset\n\n" +
                   "# Load dataset from Hugging Face\n" +
                   "dataset = load_dataset(\"tatsu-lab/alpaca\")\n\n" +
                   "# Process into instruction format\n" +
                   "def format_instruction(example):\n" +
                   "    return {\n" +
                   "        \"text\": f\"\"\"### Instruction: {example['instruction']}\n" +
                   "### Input: {example['input']}\n" +
                   "### Response: {example['output']}\"\"\"\n" +
                   "    }\n\n" +
                   "processed_dataset = dataset.map(format_instruction)\n" +
                   "```\n\n" +

                   "**6. Evaluation Considerations**\n" +
                   "- Always split into train/validation/test sets (80/10/10)\n" +
                   "- Use separate evaluation datasets not seen during training\n" +
                   "- Consider human evaluation for subjective tasks\n\n" +

                   "Would you like more information about specific datasets or data preparation techniques?";
        } else if (messageLower.includes('guide') || messageLower.includes('tutorial')) {
            return "**Available Guides and Tutorials**\n\n" +
                   "Our platform offers comprehensive guides on LLM fine-tuning:\n\n" +

                   "**1. Core Guides**\n" +
                   "- **QLoRA Fine-Tuning**: Complete walkthrough of quantized LoRA implementation\n" +
                   "- **Docker for LLM Fine-Tuning**: Containerization for reproducible environments\n" +
                   "- **Hugging Face Integration**: Using the Transformers and PEFT libraries\n\n" +

                   "**2. Advanced Topics**\n" +
                   "- **LoRA Implementation**: Step-by-step guide to implementing LoRA adapters\n" +
                   "- **Instruction Tuning**: Creating instruction-following models\n" +
                   "- **Understanding GPT**: Deep dive into GPT architecture and training\n" +
                   "- **Fine-Tuning Methods Comparison**: LoRA vs QLoRA vs full fine-tuning\n\n" +

                   "**3. Framework-Specific Guides**\n" +
                   "- **TensorFlow Basics and Exercises**: TensorFlow implementation guides\n" +
                   "- **PyTorch Basics and Exercises**: PyTorch implementation guides\n" +
                   "- **Framework Comparison**: Detailed comparison between frameworks\n\n" +

                   "**4. Hands-On Workshops**\n" +
                   "- **LoRA Basics Workshop**: Interactive tutorial on LoRA implementation\n" +
                   "- **QLoRA Deep Dive Workshop**: Advanced QLoRA techniques\n" +
                   "- **Memory Efficiency Workshop**: Optimizing memory usage\n\n" +

                   "You can access these guides through the navigation menu or by clicking on the corresponding links in the Guides dropdown.\n\n" +

                   "Would you like me to direct you to a specific guide or explain any topic in more detail?";
        } else if (messageLower.includes('exercise') || messageLower.includes('hands-on')) {
            return "**Hands-On Exercises for LLM Fine-Tuning**\n\n" +
                   "Our platform offers practical exercises to help you master LLM fine-tuning:\n\n" +

                   "**1. Framework-Specific Exercises**\n" +
                   "- **TensorFlow Exercises**: Implement fine-tuning with TensorFlow\n" +
                   "   - Basic Neural Networks\n" +
                   "   - Convolutional Neural Networks\n" +
                   "   - Recurrent Neural Networks\n" +
                   "   - Transfer Learning\n" +
                   "   - Model Deployment\n\n" +

                   "- **PyTorch Exercises**: Implement fine-tuning with PyTorch\n" +
                   "   - Tensors and Autograd\n" +
                   "   - Neural Network Basics\n" +
                   "   - Computer Vision Models\n" +
                   "   - Natural Language Processing\n" +
                   "   - Production Deployment\n\n" +

                   "**2. Fine-Tuning Techniques**\n" +
                   "- **LoRA Implementation Exercise**: Step-by-step implementation\n" +
                   "- **QLoRA Advanced Exercise**: Quantized fine-tuning implementation\n" +
                   "- **Instruction Tuning Exercise**: Creating instruction-following models\n\n" +

                   "**3. Practical Applications**\n" +
                   "- **Text Classification**: Fine-tune for sentiment analysis\n" +
                   "- **Text Generation**: Create a specialized text generator\n" +
                   "- **Question Answering**: Build a domain-specific QA system\n\n" +

                   "**4. Deployment Exercises**\n" +
                   "- **Model Optimization**: Quantization and pruning\n" +
                   "- **API Development**: Create a REST API for your model\n" +
                   "- **Web Integration**: Embed your model in a web application\n\n" +

                   "You can access these exercises through the Exercises section in the navigation menu or by clicking on the corresponding links in the Frameworks dropdown.\n\n" +

                   "Would you like me to guide you through a specific exercise or explain any topic in more detail?";
        } else if (messageLower.includes('port') || messageLower.includes('server')) {
            return "**Server and Port Configuration**\n\n" +
                   "Our application uses the following port configuration:\n\n" +

                   "**1. Default Port Settings**\n" +
                   "- **Main Application**: Running on port 5000 (default Flask port)\n" +
                   "- **Development Server**: Also uses port 5000 with debug mode enabled\n" +
                   "- **API Endpoints**: Accessible through the same port\n\n" +

                   "**2. Checking Port Status**\n" +
                   "You can verify if the server is running and the port is open using:\n" +
                   "```bash\n" +
                   "# Check if port 5000 is in use\n" +
                   "lsof -i :5000\n\n" +
                   "# Alternative using netstat\n" +
                   "netstat -tuln | grep 5000\n" +
                   "```\n\n" +

                   "**3. Starting the Server**\n" +
                   "To start the server manually:\n" +
                   "```bash\n" +
                   "# Start with default settings\n" +
                   "python app.py\n\n" +
                   "# Start with specific port\n" +
                   "PORT=5000 python app.py\n\n" +
                   "# Start in development mode\n" +
                   "FLASK_ENV=development python app.py\n" +
                   "```\n\n" +

                   "**4. Accessing the Application**\n" +
                   "- **Local Access**: http://localhost:5000 or http://127.0.0.1:5000\n" +
                   "- **Network Access**: http://[your-ip-address]:5000 (if firewall allows)\n\n" +

                   "**5. Troubleshooting Port Issues**\n" +
                   "- If port 5000 is already in use, you can change the port in app.py\n" +
                   "- Check for firewall restrictions if accessing from another device\n" +
                   "- Ensure the server is binding to 0.0.0.0 for network access\n\n" +

                   "Is there a specific port issue you're experiencing that I can help with?";
        }

        // Return a random fallback response
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    /**
     * Save conversation history to localStorage
     */
    saveConversationHistory() {
        // Limit to last 50 messages
        const limitedMessages = this.messages.slice(-50);
        localStorage.setItem('ai_assistant_history', JSON.stringify(limitedMessages));
    }

    /**
     * Load conversation history from localStorage
     */
    loadConversationHistory() {
        const savedHistory = localStorage.getItem('ai_assistant_history');
        if (savedHistory) {
            try {
                this.messages = JSON.parse(savedHistory);

                // Display last 10 messages
                const recentMessages = this.messages.slice(-10);
                this.messagesContainer.innerHTML = '';

                recentMessages.forEach(message => {
                    this.addMessage(message.role, message.content);
                });

                // Add "load more" button if there are more messages
                if (this.messages.length > 10) {
                    const loadMoreButton = document.createElement('button');
                    loadMoreButton.className = 'load-more-button';
                    loadMoreButton.textContent = 'Load earlier messages';
                    loadMoreButton.style.alignSelf = 'center';
                    loadMoreButton.style.background = 'rgba(66, 135, 245, 0.2)';
                    loadMoreButton.style.border = '1px solid rgba(66, 135, 245, 0.3)';
                    loadMoreButton.style.borderRadius = '15px';
                    loadMoreButton.style.padding = '5px 15px';
                    loadMoreButton.style.fontSize = '0.85rem';
                    loadMoreButton.style.color = '#b8e0ff';
                    loadMoreButton.style.cursor = 'pointer';
                    loadMoreButton.style.marginBottom = '15px';

                    loadMoreButton.addEventListener('click', () => {
                        // Remove the button
                        this.messagesContainer.removeChild(loadMoreButton);

                        // Load all messages
                        this.messagesContainer.innerHTML = '';
                        this.messages.forEach(message => {
                            this.addMessage(message.role, message.content);
                        });
                    });

                    this.messagesContainer.insertBefore(loadMoreButton, this.messagesContainer.firstChild);
                }
            } catch (error) {
                console.error('Error loading conversation history:', error);
                this.messages = [];
            }
        }
    }

    /**
     * Update contextual suggestions based on current page
     */
    updateContextualSuggestions() {
        // Get current path
        const currentPath = window.location.pathname;

        // Find matching suggestions
        let matchedSuggestions = null;

        for (const path in this.contextualSuggestions) {
            if (currentPath.startsWith(path)) {
                matchedSuggestions = this.contextualSuggestions[path];
                break;
            }
        }

        // If no match, use default suggestions
        if (!matchedSuggestions) {
            matchedSuggestions = this.suggestedQuestions;
        }

        // Update suggestions area
        if (this.suggestionsArea) {
            this.suggestionsArea.innerHTML = '';

            matchedSuggestions.forEach(question => {
                const suggestionButton = document.createElement('button');
                suggestionButton.className = 'ai-assistant-suggestion';
                suggestionButton.textContent = question;
                suggestionButton.style.background = 'rgba(66, 135, 245, 0.1)';
                suggestionButton.style.border = '1px solid rgba(66, 135, 245, 0.3)';
                suggestionButton.style.borderRadius = '15px';
                suggestionButton.style.padding = '5px 10px';
                suggestionButton.style.fontSize = '0.85rem';
                suggestionButton.style.color = '#b8e0ff';
                suggestionButton.style.cursor = 'pointer';
                suggestionButton.style.transition = 'all 0.2s ease';

                suggestionButton.addEventListener('mouseover', () => {
                    suggestionButton.style.background = 'rgba(66, 135, 245, 0.2)';
                });

                suggestionButton.addEventListener('mouseout', () => {
                    suggestionButton.style.background = 'rgba(66, 135, 245, 0.1)';
                });

                suggestionButton.addEventListener('click', () => {
                    this.textInput.value = question;
                    this.sendMessage(question);
                });

                this.suggestionsArea.appendChild(suggestionButton);
            });
        }
    }
}

// Initialize the AI Assistant
document.addEventListener('DOMContentLoaded', function() {
    window.aiAssistant = new AIAssistant();
    window.aiAssistant.init();
});
