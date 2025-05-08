/**
 * Voice Assistant
 * Adds speech recognition and text-to-speech capabilities to the AI Assistant
 */

class VoiceAssistant {
    constructor(aiAssistant) {
        this.aiAssistant = aiAssistant;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.voices = [];
        this.selectedVoice = null;
        this.initialized = false;
        this.micButton = null;
        this.speakButton = null;
        this.shouldAutoSpeak = false; // Flag to auto-speak responses after voice input
        this.autoSpeakEnabled = true; // User preference for auto-speaking (can be toggled)
    }

    /**
     * Initialize the Voice Assistant
     */
    init() {
        if (this.initialized) return;

        console.log('Initializing Voice Assistant...');

        // Check if browser supports speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            // Set up recognition event handlers
            this.setupRecognitionEvents();
        } else {
            console.warn('Speech recognition not supported in this browser');
        }

        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            // Load available voices
            this.loadVoices();

            // If voices are not loaded immediately, wait for them
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
            }
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }

        // Add voice controls to the AI Assistant
        this.addVoiceControls();

        this.initialized = true;
        console.log('Voice Assistant initialized successfully');
    }

    /**
     * Load available voices for speech synthesis
     */
    loadVoices() {
        this.voices = this.synthesis.getVoices();

        if (this.voices.length > 0) {
            // Try to find a good English voice
            this.selectedVoice = this.voices.find(voice =>
                (voice.name.includes('Google') || voice.name.includes('Microsoft')) &&
                voice.lang.includes('en-')
            );

            // If no preferred voice found, use the first English voice
            if (!this.selectedVoice) {
                this.selectedVoice = this.voices.find(voice => voice.lang.includes('en-'));
            }

            // If still no voice, use the first available
            if (!this.selectedVoice && this.voices.length > 0) {
                this.selectedVoice = this.voices[0];
            }

            console.log(`Selected voice: ${this.selectedVoice?.name || 'None'}`);
        } else {
            console.warn('No voices available for speech synthesis');
        }
    }

    /**
     * Set up speech recognition event handlers
     */
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButtonState();
            console.log('Speech recognition started');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButtonState();
            console.log('Speech recognition ended');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log(`Recognized: ${transcript}`);

            // Set the transcript in the input field
            if (this.aiAssistant.textInput) {
                this.aiAssistant.textInput.value = transcript;

                // Send the message
                this.aiAssistant.sendMessage(transcript);

                // Set flag to auto-speak the response
                this.shouldAutoSpeak = true;
            }
        };

        this.recognition.onerror = (event) => {
            console.error(`Speech recognition error: ${event.error}`);
            this.isListening = false;
            this.updateMicButtonState();
        };
    }

    /**
     * Add voice control buttons to the AI Assistant
     */
    addVoiceControls() {
        // Wait for AI Assistant to be initialized
        if (!this.aiAssistant.initialized) {
            setTimeout(() => this.addVoiceControls(), 100);
            return;
        }

        // Create microphone button with enhanced styling
        this.micButton = document.createElement('button');
        this.micButton.className = 'ai-assistant-voice-btn';
        this.micButton.innerHTML = '<i class="bi bi-mic"></i>';
        this.micButton.title = 'Speak to assistant (click to start)';
        this.micButton.style.width = '45px';
        this.micButton.style.height = '45px';
        this.micButton.style.borderRadius = '10px';
        this.micButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
        this.micButton.style.border = 'none';
        this.micButton.style.color = 'white';
        this.micButton.style.fontSize = '1.2rem';
        this.micButton.style.cursor = 'pointer';
        this.micButton.style.display = 'flex';
        this.micButton.style.alignItems = 'center';
        this.micButton.style.justifyContent = 'center';
        this.micButton.style.marginRight = '10px';
        this.micButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        this.micButton.style.transition = 'all 0.2s ease';

        // Create speak button with enhanced styling
        this.speakButton = document.createElement('button');
        this.speakButton.className = 'ai-assistant-speak-btn';
        this.speakButton.innerHTML = '<i class="bi bi-volume-up"></i>';
        this.speakButton.title = 'Listen to response (text-to-speech)';
        this.speakButton.style.width = '45px';
        this.speakButton.style.height = '45px';
        this.speakButton.style.borderRadius = '10px';
        this.speakButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
        this.speakButton.style.border = 'none';
        this.speakButton.style.color = 'white';
        this.speakButton.style.fontSize = '1.2rem';
        this.speakButton.style.cursor = 'pointer';
        this.speakButton.style.display = 'flex';
        this.speakButton.style.alignItems = 'center';
        this.speakButton.style.justifyContent = 'center';
        this.speakButton.style.marginRight = '10px';
        this.speakButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        this.speakButton.style.transition = 'all 0.2s ease';

        // Add hover effects
        this.micButton.addEventListener('mouseover', () => {
            this.micButton.style.transform = 'translateY(-2px)';
            this.micButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        });

        this.micButton.addEventListener('mouseout', () => {
            this.micButton.style.transform = 'translateY(0)';
            this.micButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        });

        this.speakButton.addEventListener('mouseover', () => {
            this.speakButton.style.transform = 'translateY(-2px)';
            this.speakButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        });

        this.speakButton.addEventListener('mouseout', () => {
            this.speakButton.style.transform = 'translateY(0)';
            this.speakButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        });

        // Add event listeners for functionality
        this.micButton.addEventListener('click', () => this.toggleListening());
        this.speakButton.addEventListener('click', () => this.toggleSpeaking());

        // Add buttons to the input form
        const inputForm = this.aiAssistant.inputForm;
        if (inputForm) {
            const sendButton = inputForm.querySelector('.ai-assistant-send');
            if (sendButton) {
                inputForm.insertBefore(this.micButton, sendButton);
                inputForm.insertBefore(this.speakButton, sendButton);
            }
        }

        // Add voice instructions to the chat window
        this.addVoiceInstructions();

        // Add event listener for new assistant messages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    const assistantMessages = Array.from(mutation.addedNodes).filter(
                        node => node.classList && node.classList.contains('assistant-message') &&
                               !node.classList.contains('typing-indicator')
                    );

                    if (assistantMessages.length > 0) {
                        const latestMessage = assistantMessages[assistantMessages.length - 1];

                        // Auto-speak the latest message if the user used voice input
                        if (this.shouldAutoSpeak && this.autoSpeakEnabled && latestMessage.textContent) {
                            // Small delay to ensure the message is fully rendered
                            setTimeout(() => {
                                this.speak(latestMessage.textContent);
                                this.shouldAutoSpeak = false; // Reset the flag
                            }, 500);
                        }
                    }
                }
            });
        });

        if (this.aiAssistant.messagesContainer) {
            observer.observe(this.aiAssistant.messagesContainer, { childList: true });
        }

        // Add auto-speak toggle to the chat header
        this.addAutoSpeakToggle();
    }

    /**
     * Toggle speech recognition
     */
    toggleListening() {
        if (!this.recognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            // Stop speaking if currently speaking
            if (this.isSpeaking) {
                this.stopSpeaking();
            }

            this.recognition.start();
        }
    }

    /**
     * Toggle speech synthesis for the latest message
     */
    toggleSpeaking() {
        if (this.isSpeaking) {
            this.stopSpeaking();
        } else {
            // Get the latest assistant message
            const assistantMessages = this.aiAssistant.messagesContainer.querySelectorAll('.assistant-message');
            if (assistantMessages.length > 0) {
                const latestMessage = assistantMessages[assistantMessages.length - 1];
                this.speak(latestMessage.textContent);
            }
        }
    }

    /**
     * Speak the given text
     */
    speak(text) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Stop any current speech
        this.stopSpeaking();

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice if available
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }

        // Set properties
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateSpeakButtonState();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateSpeakButtonState();
        };

        utterance.onerror = (event) => {
            console.error(`Speech synthesis error: ${event.error}`);
            this.isSpeaking = false;
            this.updateSpeakButtonState();
        };

        // Start speaking
        this.synthesis.speak(utterance);
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.updateSpeakButtonState();
        }
    }

    /**
     * Update microphone button state
     */
    updateMicButtonState() {
        if (this.micButton) {
            if (this.isListening) {
                this.micButton.innerHTML = '<i class="bi bi-mic-fill"></i>';
                this.micButton.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                this.micButton.title = 'Stop listening';
            } else {
                this.micButton.innerHTML = '<i class="bi bi-mic"></i>';
                this.micButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
                this.micButton.title = 'Speak to assistant';
            }
        }
    }

    /**
     * Update speak button state
     */
    updateSpeakButtonState() {
        if (this.speakButton) {
            if (this.isSpeaking) {
                this.speakButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
                this.speakButton.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                this.speakButton.title = 'Stop speaking';
            } else {
                this.speakButton.innerHTML = '<i class="bi bi-volume-up"></i>';
                this.speakButton.style.background = 'linear-gradient(135deg, #4287f5, #3a75d8)';
                this.speakButton.title = 'Listen to response (text-to-speech)';
            }
        }
    }

    /**
     * Add auto-speak toggle to the chat header
     */
    addAutoSpeakToggle() {
        // Wait for AI Assistant to be initialized
        if (!this.aiAssistant.initialized) {
            setTimeout(() => this.addAutoSpeakToggle(), 100);
            return;
        }

        // Find the chat header
        const chatHeader = document.querySelector('.ai-assistant-header');
        if (!chatHeader) return;

        // Create toggle switch container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'auto-speak-toggle';
        toggleContainer.style.display = 'flex';
        toggleContainer.style.alignItems = 'center';
        toggleContainer.style.marginRight = '10px';
        toggleContainer.style.fontSize = '0.8rem';
        toggleContainer.style.color = 'rgba(255, 255, 255, 0.8)';

        // Create toggle switch
        const toggleSwitch = document.createElement('label');
        toggleSwitch.className = 'switch';
        toggleSwitch.style.position = 'relative';
        toggleSwitch.style.display = 'inline-block';
        toggleSwitch.style.width = '30px';
        toggleSwitch.style.height = '17px';
        toggleSwitch.style.marginLeft = '5px';

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.autoSpeakEnabled;
        checkbox.style.opacity = '0';
        checkbox.style.width = '0';
        checkbox.style.height = '0';

        // Create slider
        const slider = document.createElement('span');
        slider.className = 'slider';
        slider.style.position = 'absolute';
        slider.style.cursor = 'pointer';
        slider.style.top = '0';
        slider.style.left = '0';
        slider.style.right = '0';
        slider.style.bottom = '0';
        slider.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        slider.style.transition = '0.4s';
        slider.style.borderRadius = '17px';

        // Create slider knob
        const sliderKnob = document.createElement('span');
        sliderKnob.style.position = 'absolute';
        sliderKnob.style.content = '""';
        sliderKnob.style.height = '13px';
        sliderKnob.style.width = '13px';
        sliderKnob.style.left = '2px';
        sliderKnob.style.bottom = '2px';
        sliderKnob.style.backgroundColor = 'white';
        sliderKnob.style.transition = '0.4s';
        sliderKnob.style.borderRadius = '50%';
        slider.appendChild(sliderKnob);

        // Add event listener to checkbox
        checkbox.addEventListener('change', () => {
            this.autoSpeakEnabled = checkbox.checked;

            // Update slider appearance
            if (checkbox.checked) {
                slider.style.backgroundColor = 'rgba(66, 135, 245, 0.5)';
                sliderKnob.style.transform = 'translateX(13px)';
            } else {
                slider.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                sliderKnob.style.transform = 'translateX(0)';
            }

            // Save preference to localStorage
            localStorage.setItem('auto-speak-enabled', this.autoSpeakEnabled.toString());
        });

        // Set initial state from localStorage
        const savedPreference = localStorage.getItem('auto-speak-enabled');
        if (savedPreference !== null) {
            this.autoSpeakEnabled = savedPreference === 'true';
            checkbox.checked = this.autoSpeakEnabled;

            if (this.autoSpeakEnabled) {
                slider.style.backgroundColor = 'rgba(66, 135, 245, 0.5)';
                sliderKnob.style.transform = 'translateX(13px)';
            }
        }

        // Assemble toggle switch
        toggleSwitch.appendChild(checkbox);
        toggleSwitch.appendChild(slider);

        // Add label
        const label = document.createElement('span');
        label.textContent = 'Auto-speak';
        label.style.marginRight = '5px';

        // Assemble toggle container
        toggleContainer.appendChild(label);
        toggleContainer.appendChild(toggleSwitch);

        // Add to chat header
        const closeButton = chatHeader.querySelector('.ai-assistant-close');
        if (closeButton) {
            chatHeader.insertBefore(toggleContainer, closeButton);
        } else {
            chatHeader.appendChild(toggleContainer);
        }
    }

    /**
     * Add voice instructions to the chat window
     */
    addVoiceInstructions() {
        // Wait for AI Assistant to be initialized
        if (!this.aiAssistant.initialized || !this.aiAssistant.messagesContainer) {
            setTimeout(() => this.addVoiceInstructions(), 100);
            return;
        }

        // Create voice instructions element
        const instructionsElement = document.createElement('div');
        instructionsElement.className = 'ai-assistant-voice-instructions';
        instructionsElement.style.padding = '10px 15px';
        instructionsElement.style.marginBottom = '15px';
        instructionsElement.style.background = 'rgba(66, 135, 245, 0.1)';
        instructionsElement.style.border = '1px solid rgba(66, 135, 245, 0.3)';
        instructionsElement.style.borderRadius = '10px';
        instructionsElement.style.fontSize = '0.9rem';
        instructionsElement.style.color = '#e0e0e0';
        instructionsElement.style.display = 'flex';
        instructionsElement.style.alignItems = 'center';
        instructionsElement.style.gap = '10px';

        // Add icon
        const iconElement = document.createElement('div');
        iconElement.innerHTML = '<i class="bi bi-mic-fill"></i>';
        iconElement.style.fontSize = '1.2rem';
        iconElement.style.color = '#4287f5';

        // Add text
        const textElement = document.createElement('div');
        textElement.innerHTML = '<strong>Voice Enabled!</strong> Click <i class="bi bi-mic"></i> to speak to me or <i class="bi bi-volume-up"></i> to hear my responses.';

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="bi bi-x"></i>';
        closeButton.style.marginLeft = 'auto';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = '#e0e0e0';
        closeButton.style.fontSize = '1.2rem';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.setAttribute('aria-label', 'Close voice instructions');

        closeButton.addEventListener('click', () => {
            instructionsElement.style.display = 'none';
            // Save preference to localStorage
            localStorage.setItem('voice-instructions-dismissed', 'true');
        });

        // Only show if not previously dismissed
        if (localStorage.getItem('voice-instructions-dismissed') !== 'true') {
            // Assemble instructions
            instructionsElement.appendChild(iconElement);
            instructionsElement.appendChild(textElement);
            instructionsElement.appendChild(closeButton);

            // Add to messages container
            this.aiAssistant.messagesContainer.insertBefore(instructionsElement, this.aiAssistant.messagesContainer.firstChild);
        }
    }
}

// Initialize the Voice Assistant when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for AI Assistant to be initialized
    const initVoiceAssistant = () => {
        if (window.aiAssistant && window.aiAssistant.initialized) {
            window.voiceAssistant = new VoiceAssistant(window.aiAssistant);
            window.voiceAssistant.init();
        } else {
            setTimeout(initVoiceAssistant, 100);
        }
    };

    initVoiceAssistant();
});
