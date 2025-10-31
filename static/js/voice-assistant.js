// Voice Assistant
// Provides voice interaction capabilities for the application

(function() {
    'use strict';

    // Configuration
    const config = {
        recognition: null,
        synthesis: null,
        isListening: false,
        isSupported: false,
        language: 'en-US',
        voiceCommands: {
            'navigate home': () => window.location.href = '/',
            'go home': () => window.location.href = '/',
            'navigate back': () => window.history.back(),
            'go back': () => window.history.back(),
            'scroll up': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            'scroll down': () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
            'help': () => showVoiceHelp(),
            'what can you do': () => showVoiceHelp(),
            'read page': () => readPageContent(),
            'stop reading': () => stopSpeaking(),
            'toggle dark mode': () => toggleDarkMode(),
            'increase text size': () => adjustTextSize('increase'),
            'decrease text size': () => adjustTextSize('decrease'),
            'search': () => focusSearchInput()
        }
    };

    // Voice assistant state
    let voiceState = {
        isInitialized: false,
        currentUtterance: null,
        recognitionTimeout: null,
        lastCommand: '',
        commandHistory: []
    };

    // Add voice assistant styles
    function addVoiceStyles() {
        const style = document.createElement('style');
        style.id = 'voice-assistant-styles';
        style.textContent = `
            /* Voice Assistant Controls */
            .voice-assistant {
                position: fixed;
                bottom: 80px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .voice-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .voice-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0,0,0,0.3);
            }
            
            .voice-toggle.listening {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                animation: voicePulse 1.5s ease-in-out infinite;
            }
            
            .voice-toggle.speaking {
                background: linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%);
                animation: voiceWave 1s ease-in-out infinite;
            }
            
            @keyframes voicePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes voiceWave {
                0%, 100% { border-radius: 50%; }
                50% { border-radius: 30%; }
            }
            
            .voice-status {
                position: absolute;
                top: -40px;
                right: 0;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .voice-status.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .voice-panel {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 300px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .voice-panel.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .voice-panel h3 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 18px;
            }
            
            .voice-commands {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .voice-commands li {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
                font-size: 14px;
                color: #666;
            }
            
            .voice-commands li:last-child {
                border-bottom: none;
            }
            
            .voice-commands .command {
                font-weight: 600;
                color: #667eea;
            }
            
            .voice-transcript {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
                margin: 15px 0;
                font-size: 14px;
                color: #333;
                min-height: 40px;
                border-left: 4px solid #667eea;
            }
            
            .voice-transcript.listening {
                border-left-color: #ff6b6b;
                background: #fff5f5;
            }
            
            .voice-controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .voice-btn {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .voice-btn:hover {
                background: #f8f9fa;
                border-color: #667eea;
            }
            
            .voice-btn.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            
            .voice-visualization {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                margin: 10px 0;
            }
            
            .voice-bar {
                width: 3px;
                background: #667eea;
                margin: 0 1px;
                border-radius: 2px;
                transition: height 0.1s ease;
            }
            
            .voice-bar.active {
                animation: voiceBarAnimation 0.5s ease-in-out infinite alternate;
            }
            
            @keyframes voiceBarAnimation {
                0% { height: 5px; }
                100% { height: 25px; }
            }
            
            .voice-error {
                background: #fff5f5;
                border: 1px solid #fed7d7;
                color: #c53030;
                padding: 10px;
                border-radius: 6px;
                font-size: 12px;
                margin-top: 10px;
            }
            
            .voice-success {
                background: #f0fff4;
                border: 1px solid #9ae6b4;
                color: #2f855a;
                padding: 10px;
                border-radius: 6px;
                font-size: 12px;
                margin-top: 10px;
            }
            
            @media (max-width: 768px) {
                .voice-assistant {
                    bottom: 60px;
                    right: 15px;
                }
                
                .voice-toggle {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
                
                .voice-panel {
                    width: 280px;
                    right: -10px;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .voice-panel {
                    background: #2d3748;
                    color: #e2e8f0;
                }
                
                .voice-panel h3 {
                    color: #e2e8f0;
                }
                
                .voice-commands li {
                    color: #a0aec0;
                    border-bottom-color: #4a5568;
                }
                
                .voice-transcript {
                    background: #4a5568;
                    color: #e2e8f0;
                }
                
                .voice-btn {
                    background: #4a5568;
                    border-color: #718096;
                    color: #e2e8f0;
                }
                
                .voice-btn:hover {
                    background: #2d3748;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Check browser support
    function checkSupport() {
        config.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        if (config.isSupported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            config.recognition = new SpeechRecognition();
            config.synthesis = window.speechSynthesis;
        }
        
        return config.isSupported;
    }

    // Initialize speech recognition
    function initializeSpeechRecognition() {
        if (!config.recognition) return;
        
        config.recognition.continuous = false;
        config.recognition.interimResults = true;
        config.recognition.lang = config.language;
        
        config.recognition.onstart = () => {
            config.isListening = true;
            updateVoiceStatus('Listening...');
            updateVoiceButton();
            showVoiceVisualization();
        };
        
        config.recognition.onresult = (event) => {
            let transcript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            
            updateTranscript(transcript);
            
            if (event.results[event.results.length - 1].isFinal) {
                processVoiceCommand(transcript.trim().toLowerCase());
            }
        };
        
        config.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showVoiceError(`Recognition error: ${event.error}`);
            stopListening();
        };
        
        config.recognition.onend = () => {
            stopListening();
        };
    }

    // Process voice commands
    function processVoiceCommand(command) {
        voiceState.lastCommand = command;
        voiceState.commandHistory.push(command);
        
        // Keep only last 10 commands
        if (voiceState.commandHistory.length > 10) {
            voiceState.commandHistory.shift();
        }
        
        // Find matching command
        let commandExecuted = false;
        
        for (const [trigger, action] of Object.entries(config.voiceCommands)) {
            if (command.includes(trigger)) {
                try {
                    action();
                    showVoiceSuccess(`Executed: ${trigger}`);
                    commandExecuted = true;
                    break;
                } catch (error) {
                    console.error('Command execution error:', error);
                    showVoiceError(`Failed to execute: ${trigger}`);
                }
            }
        }
        
        if (!commandExecuted) {
            // Try to handle as a search query
            if (command.includes('search for')) {
                const query = command.replace('search for', '').trim();
                performSearch(query);
                showVoiceSuccess(`Searching for: ${query}`);
            } else {
                showVoiceError(`Command not recognized: ${command}`);
                speak(`Sorry, I didn't understand "${command}". Say "help" to see available commands.`);
            }
        }
    }

    // Text-to-speech function
    function speak(text, options = {}) {
        if (!config.synthesis) return;
        
        // Stop any current speech
        config.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || config.language;
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        
        utterance.onstart = () => {
            voiceState.currentUtterance = utterance;
            updateVoiceStatus('Speaking...');
            updateVoiceButton();
        };
        
        utterance.onend = () => {
            voiceState.currentUtterance = null;
            updateVoiceStatus('Ready');
            updateVoiceButton();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            voiceState.currentUtterance = null;
            updateVoiceButton();
        };
        
        config.synthesis.speak(utterance);
    }

    // Stop speaking
    function stopSpeaking() {
        if (config.synthesis) {
            config.synthesis.cancel();
            voiceState.currentUtterance = null;
            updateVoiceStatus('Ready');
            updateVoiceButton();
        }
    }

    // Start listening
    function startListening() {
        if (!config.recognition || config.isListening) return;
        
        try {
            config.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            showVoiceError('Failed to start listening');
        }
    }

    // Stop listening
    function stopListening() {
        if (config.recognition && config.isListening) {
            config.recognition.stop();
        }
        
        config.isListening = false;
        updateVoiceStatus('Ready');
        updateVoiceButton();
        hideVoiceVisualization();
    }

    // Create voice assistant UI
    function createVoiceUI() {
        const container = document.createElement('div');
        container.className = 'voice-assistant';
        
        container.innerHTML = `
            <div class="voice-status" id="voice-status">Ready</div>
            <button class="voice-toggle" id="voice-toggle" title="Voice Assistant">
                🎤
            </button>
            <div class="voice-panel" id="voice-panel">
                <h3>Voice Assistant</h3>
                <div class="voice-transcript" id="voice-transcript">Say a command...</div>
                <div class="voice-visualization" id="voice-visualization">
                    ${Array.from({length: 20}, () => '<div class="voice-bar"></div>').join('')}
                </div>
                <div class="voice-controls">
                    <button class="voice-btn" id="voice-help">Help</button>
                    <button class="voice-btn" id="voice-settings">Settings</button>
                    <button class="voice-btn" id="voice-clear">Clear</button>
                </div>
                <ul class="voice-commands">
                    <li><span class="command">"Navigate home"</span> - Go to homepage</li>
                    <li><span class="command">"Go back"</span> - Navigate back</li>
                    <li><span class="command">"Scroll up/down"</span> - Scroll page</li>
                    <li><span class="command">"Search for [query]"</span> - Search content</li>
                    <li><span class="command">"Read page"</span> - Read page content</li>
                    <li><span class="command">"Help"</span> - Show commands</li>
                </ul>
            </div>
        `;
        
        document.body.appendChild(container);
        
        setupVoiceEventListeners();
    }

    // Setup event listeners
    function setupVoiceEventListeners() {
        const toggle = document.getElementById('voice-toggle');
        const panel = document.getElementById('voice-panel');
        const helpBtn = document.getElementById('voice-help');
        const settingsBtn = document.getElementById('voice-settings');
        const clearBtn = document.getElementById('voice-clear');
        
        // Toggle voice recognition
        toggle.addEventListener('click', () => {
            if (config.isListening) {
                stopListening();
            } else if (voiceState.currentUtterance) {
                stopSpeaking();
            } else {
                startListening();
            }
        });
        
        // Show/hide panel on long press
        let pressTimer;
        toggle.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                panel.classList.toggle('show');
            }, 500);
        });
        
        toggle.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });
        
        // Help button
        helpBtn.addEventListener('click', () => {
            showVoiceHelp();
        });
        
        // Settings button
        settingsBtn.addEventListener('click', () => {
            showVoiceSettings();
        });
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            clearVoiceHistory();
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.voice-assistant')) {
                panel.classList.remove('show');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                if (config.isListening) {
                    stopListening();
                } else {
                    startListening();
                }
            }
        });
    }

    // Update voice status
    function updateVoiceStatus(status) {
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.classList.add('show');
            
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, 2000);
        }
    }

    // Update voice button appearance
    function updateVoiceButton() {
        const button = document.getElementById('voice-toggle');
        if (!button) return;
        
        button.classList.remove('listening', 'speaking');
        
        if (config.isListening) {
            button.classList.add('listening');
            button.innerHTML = '🔴';
            button.title = 'Stop listening';
        } else if (voiceState.currentUtterance) {
            button.classList.add('speaking');
            button.innerHTML = '🔊';
            button.title = 'Stop speaking';
        } else {
            button.innerHTML = '🎤';
            button.title = 'Start voice assistant';
        }
    }

    // Update transcript display
    function updateTranscript(text) {
        const transcript = document.getElementById('voice-transcript');
        if (transcript) {
            transcript.textContent = text || 'Say a command...';
            transcript.classList.toggle('listening', config.isListening);
        }
    }

    // Show voice visualization
    function showVoiceVisualization() {
        const bars = document.querySelectorAll('.voice-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('active');
            }, index * 50);
        });
    }

    // Hide voice visualization
    function hideVoiceVisualization() {
        const bars = document.querySelectorAll('.voice-bar');
        bars.forEach(bar => {
            bar.classList.remove('active');
        });
    }

    // Show voice error
    function showVoiceError(message) {
        const panel = document.getElementById('voice-panel');
        if (!panel) return;
        
        const existing = panel.querySelector('.voice-error');
        if (existing) existing.remove();
        
        const error = document.createElement('div');
        error.className = 'voice-error';
        error.textContent = message;
        panel.appendChild(error);
        
        setTimeout(() => error.remove(), 5000);
    }

    // Show voice success
    function showVoiceSuccess(message) {
        const panel = document.getElementById('voice-panel');
        if (!panel) return;
        
        const existing = panel.querySelector('.voice-success');
        if (existing) existing.remove();
        
        const success = document.createElement('div');
        success.className = 'voice-success';
        success.textContent = message;
        panel.appendChild(success);
        
        setTimeout(() => success.remove(), 3000);
    }

    // Voice command implementations
    function showVoiceHelp() {
        const commands = Object.keys(config.voiceCommands).join(', ');
        speak(`Available voice commands are: ${commands}. You can also say "search for" followed by your query.`);
    }

    function readPageContent() {
        const content = document.querySelector('main, .content, .main-content, article');
        if (content) {
            const text = content.textContent.trim().substring(0, 500);
            speak(text);
        } else {
            speak('No main content found to read.');
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        speak(isDark ? 'Dark mode enabled' : 'Dark mode disabled');
    }

    function adjustTextSize(direction) {
        const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
        const newSize = direction === 'increase' ? currentSize + 2 : currentSize - 2;
        document.body.style.fontSize = `${Math.max(12, Math.min(24, newSize))}px`;
        speak(`Text size ${direction}d`);
    }

    function focusSearchInput() {
        const searchInput = document.querySelector('input[type="search"], input[name="search"], input[placeholder*="search" i]');
        if (searchInput) {
            searchInput.focus();
            speak('Search input focused');
        } else {
            speak('No search input found');
        }
    }

    function performSearch(query) {
        const searchInput = document.querySelector('input[type="search"], input[name="search"], input[placeholder*="search" i]');
        if (searchInput) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            const form = searchInput.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        } else {
            // Fallback to Google search
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
    }

    function showVoiceSettings() {
        speak('Voice settings: You can change language, speech rate, and other preferences in your browser settings.');
    }

    function clearVoiceHistory() {
        voiceState.commandHistory = [];
        updateTranscript('');
        speak('Voice history cleared');
    }

    // Initialize voice assistant
    function init() {
        if (!checkSupport()) {
            console.warn('Voice assistant not supported in this browser');
            return;
        }
        
        addVoiceStyles();
        initializeSpeechRecognition();
        createVoiceUI();
        
        voiceState.isInitialized = true;
        
        // Welcome message
        setTimeout(() => {
            updateVoiceStatus('Voice assistant ready');
        }, 1000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();