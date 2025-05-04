/**
 * AI Assistant
 * Provides an intelligent assistant for the LLM Fine-Tuning platform
 */

class AIAssistant {
    constructor() {
        this.initialized = false;
        this.isOpen = false;
        this.container = null;
        this.messages = [];
        this.isTyping = false;
        this.typingSpeed = 30; // ms per character
        this.suggestedQuestions = [
            "How do I fine-tune an LLM?",
            "What is the difference between LoRA and QLoRA?",
            "How can I reduce memory usage during fine-tuning?",
            "What datasets should I use for fine-tuning?",
            "How do I evaluate my fine-tuned model?"
        ];
        this.contextualSuggestions = {
            '/': [
                "What is this platform about?",
                "How do I get started with LLM fine-tuning?",
                "Show me the available learning resources"
            ],
            '/learn': [
                "What topics can I learn about?",
                "How do I access the workshops?",
                "What's the difference between LoRA and QLoRA?"
            ],
            '/workshop': [
                "How do I complete this workshop?",
                "What are the prerequisites for this workshop?",
                "Can you explain this concept in more detail?"
            ],
            '/thesaurus': [
                "How does the thesaurus visualization work?",
                "Can I add my own terms to the thesaurus?",
                "How is this related to LLM fine-tuning?"
            ]
        };
    }

    /**
     * Initialize the AI Assistant
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing AI Assistant...');
        
        // Create the assistant UI
        this.createAssistantUI();
        
        // Add event listeners
        this.addEventListeners();
        
        // Load conversation history
        this.loadConversationHistory();
        
        // Add contextual suggestions based on current page
        this.updateContextualSuggestions();
        
        this.initialized = true;
        console.log('AI Assistant initialized successfully');
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
            chatWindow.style.width = '350px';
            chatWindow.style.height = '500px';
            chatWindow.style.background = 'rgba(20, 20, 20, 0.95)';
            chatWindow.style.borderRadius = '15px';
            chatWindow.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
            chatWindow.style.marginBottom = '15px';
            chatWindow.style.overflow = 'hidden';
            chatWindow.style.display = 'none';
            chatWindow.style.flexDirection = 'column';
            chatWindow.style.border = '2px solid rgba(66, 135, 245, 0.3)';
            chatWindow.style.backdropFilter = 'blur(10px)';
            chatWindow.style.WebkitBackdropFilter = 'blur(10px)';
            
            // Create chat header
            const chatHeader = document.createElement('div');
            chatHeader.className = 'ai-assistant-header';
            chatHeader.style.padding = '15px';
            chatHeader.style.background = 'linear-gradient(135deg, rgba(66, 135, 245, 0.2), rgba(0, 255, 221, 0.2))';
            chatHeader.style.borderBottom = '2px solid rgba(66, 135, 245, 0.2)';
            chatHeader.style.display = 'flex';
            chatHeader.style.alignItems = 'center';
            chatHeader.style.justifyContent = 'space-between';
            
            const headerTitle = document.createElement('div');
            headerTitle.className = 'ai-assistant-title';
            headerTitle.innerHTML = '<i class="bi bi-robot me-2"></i> AI Assistant';
            headerTitle.style.fontWeight = '700';
            headerTitle.style.color = '#ffffff';
            headerTitle.style.fontSize = '1.1rem';
            
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
            messagesContainer.style.flex = '1';
            messagesContainer.style.overflowY = 'auto';
            messagesContainer.style.padding = '15px';
            messagesContainer.style.display = 'flex';
            messagesContainer.style.flexDirection = 'column';
            messagesContainer.style.gap = '10px';
            
            // Create input area
            const inputArea = document.createElement('div');
            inputArea.className = 'ai-assistant-input';
            inputArea.style.padding = '15px';
            inputArea.style.borderTop = '2px solid rgba(66, 135, 245, 0.2)';
            inputArea.style.background = 'rgba(30, 30, 30, 0.7)';
            
            const inputForm = document.createElement('form');
            inputForm.className = 'ai-assistant-form';
            inputForm.style.display = 'flex';
            inputForm.style.gap = '10px';
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'ai-assistant-text-input';
            textInput.placeholder = 'Ask me anything...';
            textInput.style.flex = '1';
            textInput.style.padding = '12px 15px';
            textInput.style.borderRadius = '10px';
            textInput.style.border = '2px solid rgba(66, 135, 245, 0.3)';
            textInput.style.background = 'rgba(30, 30, 30, 0.7)';
            textInput.style.color = '#ffffff';
            textInput.style.fontSize = '1rem';
            
            const sendButton = document.createElement('button');
            sendButton.type = 'submit';
            sendButton.className = 'ai-assistant-send';
            sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
            sendButton.style.width = '45px';
            sendButton.style.height = '45px';
            sendButton.style.borderRadius = '10px';
            sendButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
            sendButton.style.border = 'none';
            sendButton.style.color = 'white';
            sendButton.style.fontSize = '1.2rem';
            sendButton.style.cursor = 'pointer';
            sendButton.style.display = 'flex';
            sendButton.style.alignItems = 'center';
            sendButton.style.justifyContent = 'center';
            
            inputForm.appendChild(textInput);
            inputForm.appendChild(sendButton);
            inputArea.appendChild(inputForm);
            
            // Create suggestions area
            const suggestionsArea = document.createElement('div');
            suggestionsArea.className = 'ai-assistant-suggestions';
            suggestionsArea.style.padding = '10px 15px';
            suggestionsArea.style.display = 'flex';
            suggestionsArea.style.flexWrap = 'wrap';
            suggestionsArea.style.gap = '8px';
            suggestionsArea.style.borderTop = '2px solid rgba(66, 135, 245, 0.2)';
            suggestionsArea.style.background = 'rgba(25, 25, 25, 0.7)';
            
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
        
        // Listen for page changes to update contextual suggestions
        window.addEventListener('popstate', () => {
            this.updateContextualSuggestions();
        });
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
            // Add assistant response
            this.addMessage('assistant', data.answer || this.getFallbackResponse(message));
            
            // Save to conversation history
            this.messages.push({ role: 'assistant', content: data.answer || this.getFallbackResponse(message) });
            this.saveConversationHistory();
            
            // Re-enable input
            this.textInput.disabled = false;
            this.textInput.placeholder = 'Ask me anything...';
            this.textInput.focus();
        })
        .catch(error => {
            console.error('Error processing message:', error);
            
            // Add error message
            this.addMessage('assistant', this.getFallbackResponse(message));
            
            // Save to conversation history
            this.messages.push({ role: 'assistant', content: this.getFallbackResponse(message) });
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
        messageElement.style.maxWidth = '80%';
        messageElement.style.padding = '10px 15px';
        messageElement.style.borderRadius = '15px';
        messageElement.style.marginBottom = '8px';
        
        if (role === 'user') {
            messageElement.style.alignSelf = 'flex-end';
            messageElement.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
            messageElement.style.color = 'white';
            messageElement.textContent = content;
            
            this.messagesContainer.appendChild(messageElement);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        } else {
            messageElement.style.alignSelf = 'flex-start';
            messageElement.style.background = 'rgba(40, 40, 40, 0.8)';
            messageElement.style.color = '#e0e0e0';
            messageElement.style.border = '1px solid rgba(66, 135, 245, 0.2)';
            
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
            return "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that adds trainable low-rank matrices to the weights of a pre-trained model. It significantly reduces memory usage and training time while maintaining performance.";
        } else if (messageLower.includes('qlora')) {
            return "QLoRA combines quantization with LoRA for even more efficient fine-tuning. It quantizes the pre-trained model to 4 bits, dramatically reducing memory requirements while maintaining performance through low-rank adapters.";
        } else if (messageLower.includes('memory') || messageLower.includes('gpu')) {
            return "To reduce memory usage during fine-tuning, you can use techniques like gradient checkpointing, mixed precision training, parameter-efficient methods (LoRA/QLoRA), smaller batch sizes, or model parallelism.";
        } else if (messageLower.includes('dataset') || messageLower.includes('data')) {
            return "For fine-tuning, you should use high-quality, diverse, and relevant data that matches your target task. Clean your data to remove errors, duplicates, and sensitive information. Consider techniques like instruction tuning formats for better results.";
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
