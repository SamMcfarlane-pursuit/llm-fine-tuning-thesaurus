// Purple Text Enhancer
// Enhances text elements with purple-themed styling and effects

(function() {
    'use strict';

    // Configuration
    const config = {
        primaryPurple: '#6f42c1',
        secondaryPurple: '#8e44ad',
        lightPurple: '#b19cd9',
        darkPurple: '#4a2c7a',
        accentPurple: '#9c27b0',
        gradientPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animationDuration: 300,
        glowIntensity: 0.6
    };

    // Add purple enhancement styles
    function addPurpleStyles() {
        const style = document.createElement('style');
        style.id = 'purple-text-enhancer-styles';
        style.textContent = `
            /* Purple Text Enhancement Base Styles */
            .purple-enhanced {
                color: ${config.primaryPurple};
                transition: all 0.3s ease;
            }
            
            .purple-enhanced:hover {
                color: ${config.secondaryPurple};
                text-shadow: 0 0 8px rgba(111, 66, 193, 0.4);
            }
            
            /* Purple Headings */
            .purple-heading {
                color: ${config.primaryPurple};
                background: ${config.gradientPurple};
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 600;
                position: relative;
            }
            
            .purple-heading::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 0;
                height: 2px;
                background: ${config.gradientPurple};
                transition: width 0.3s ease;
            }
            
            .purple-heading:hover::after {
                width: 100%;
            }
            
            /* Purple Links */
            .purple-link {
                color: ${config.primaryPurple};
                text-decoration: none;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .purple-link::before {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 0;
                height: 1px;
                background: ${config.secondaryPurple};
                transition: width 0.3s ease;
            }
            
            .purple-link:hover {
                color: ${config.secondaryPurple};
                text-shadow: 0 0 5px rgba(111, 66, 193, 0.3);
            }
            
            .purple-link:hover::before {
                width: 100%;
            }
            
            /* Purple Buttons */
            .purple-button {
                background: ${config.gradientPurple};
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .purple-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255,255,255,0.2), 
                    transparent);
                transition: left 0.5s ease;
            }
            
            .purple-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(111, 66, 193, 0.4);
            }
            
            .purple-button:hover::before {
                left: 100%;
            }
            
            .purple-button:active {
                transform: translateY(0);
                box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
            }
            
            /* Purple Text Highlights */
            .purple-highlight {
                background: linear-gradient(120deg, 
                    rgba(111, 66, 193, 0.2) 0%, 
                    rgba(111, 66, 193, 0.1) 100%);
                padding: 2px 6px;
                border-radius: 4px;
                color: ${config.darkPurple};
                font-weight: 500;
            }
            
            /* Purple Glow Text */
            .purple-glow {
                color: ${config.primaryPurple};
                text-shadow: 
                    0 0 5px rgba(111, 66, 193, 0.8),
                    0 0 10px rgba(111, 66, 193, 0.6),
                    0 0 15px rgba(111, 66, 193, 0.4),
                    0 0 20px rgba(111, 66, 193, 0.2);
                animation: purpleGlow 2s ease-in-out infinite alternate;
            }
            
            @keyframes purpleGlow {
                from {
                    text-shadow: 
                        0 0 5px rgba(111, 66, 193, 0.8),
                        0 0 10px rgba(111, 66, 193, 0.6),
                        0 0 15px rgba(111, 66, 193, 0.4),
                        0 0 20px rgba(111, 66, 193, 0.2);
                }
                to {
                    text-shadow: 
                        0 0 8px rgba(111, 66, 193, 1),
                        0 0 15px rgba(111, 66, 193, 0.8),
                        0 0 20px rgba(111, 66, 193, 0.6),
                        0 0 25px rgba(111, 66, 193, 0.4);
                }
            }
            
            /* Purple Gradient Text */
            .purple-gradient {
                background: linear-gradient(45deg, 
                    ${config.primaryPurple}, 
                    ${config.accentPurple}, 
                    ${config.secondaryPurple});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-size: 200% 200%;
                animation: purpleGradientShift 3s ease infinite;
            }
            
            @keyframes purpleGradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            /* Purple Badges */
            .purple-badge {
                background: ${config.primaryPurple};
                color: white;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.85em;
                font-weight: 500;
                display: inline-block;
                margin: 2px;
                transition: all 0.3s ease;
            }
            
            .purple-badge:hover {
                background: ${config.secondaryPurple};
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
            }
            
            /* Purple Cards */
            .purple-card {
                border: 1px solid rgba(111, 66, 193, 0.2);
                border-radius: 12px;
                background: linear-gradient(135deg, 
                    rgba(111, 66, 193, 0.05) 0%, 
                    rgba(118, 75, 162, 0.05) 100%);
                padding: 20px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .purple-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: ${config.gradientPurple};
            }
            
            .purple-card:hover {
                border-color: rgba(111, 66, 193, 0.4);
                box-shadow: 0 8px 25px rgba(111, 66, 193, 0.15);
                transform: translateY(-2px);
            }
            
            /* Purple Progress Bars */
            .purple-progress {
                width: 100%;
                height: 8px;
                background: rgba(111, 66, 193, 0.1);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .purple-progress-bar {
                height: 100%;
                background: ${config.gradientPurple};
                border-radius: 4px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .purple-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(255,255,255,0.3), 
                    transparent);
                animation: progressShine 2s ease-in-out infinite;
            }
            
            @keyframes progressShine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            /* Purple Alerts */
            .purple-alert {
                background: rgba(111, 66, 193, 0.1);
                border: 1px solid rgba(111, 66, 193, 0.3);
                border-left: 4px solid ${config.primaryPurple};
                color: ${config.darkPurple};
                padding: 15px;
                border-radius: 4px;
                margin: 10px 0;
            }
            
            .purple-alert-icon {
                color: ${config.primaryPurple};
                margin-right: 10px;
                font-weight: bold;
            }
            
            /* Purple Form Elements */
            .purple-input {
                border: 2px solid rgba(111, 66, 193, 0.2);
                border-radius: 8px;
                padding: 12px;
                transition: all 0.3s ease;
                outline: none;
            }
            
            .purple-input:focus {
                border-color: ${config.primaryPurple};
                box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
            }
            
            .purple-label {
                color: ${config.primaryPurple};
                font-weight: 500;
                margin-bottom: 5px;
                display: block;
            }
            
            /* Purple Tables */
            .purple-table {
                border-collapse: collapse;
                width: 100%;
            }
            
            .purple-table th {
                background: ${config.gradientPurple};
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 500;
            }
            
            .purple-table td {
                padding: 12px;
                border-bottom: 1px solid rgba(111, 66, 193, 0.1);
            }
            
            .purple-table tr:hover {
                background: rgba(111, 66, 193, 0.05);
            }
            
            /* Purple Tooltips */
            .purple-tooltip {
                position: relative;
                cursor: help;
            }
            
            .purple-tooltip::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: ${config.darkPurple};
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .purple-tooltip:hover::after {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(-5px);
            }
            
            /* Purple Loading Spinner */
            .purple-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(111, 66, 193, 0.1);
                border-left: 4px solid ${config.primaryPurple};
                border-radius: 50%;
                animation: purpleSpinner 1s linear infinite;
            }
            
            @keyframes purpleSpinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Purple Animations */
            .purple-fade-in {
                animation: purpleFadeIn 0.6s ease-out;
            }
            
            @keyframes purpleFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .purple-slide-in {
                animation: purpleSlideIn 0.5s ease-out;
            }
            
            @keyframes purpleSlideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .purple-button {
                    padding: 10px 20px;
                    font-size: 14px;
                }
                
                .purple-card {
                    padding: 15px;
                }
                
                .purple-table {
                    font-size: 14px;
                }
                
                .purple-table th,
                .purple-table td {
                    padding: 8px;
                }
            }
            
            /* Dark Mode Support */
            @media (prefers-color-scheme: dark) {
                .purple-enhanced {
                    color: ${config.lightPurple};
                }
                
                .purple-card {
                    background: linear-gradient(135deg, 
                        rgba(111, 66, 193, 0.1) 0%, 
                        rgba(118, 75, 162, 0.1) 100%);
                    border-color: rgba(111, 66, 193, 0.3);
                }
                
                .purple-alert {
                    background: rgba(111, 66, 193, 0.15);
                    color: ${config.lightPurple};
                }
                
                .purple-table td {
                    border-bottom-color: rgba(111, 66, 193, 0.2);
                }
            }
            
            /* Reduced Motion Support */
            @media (prefers-reduced-motion: reduce) {
                .purple-glow,
                .purple-gradient,
                .purple-progress-bar::after,
                .purple-spinner,
                .purple-fade-in,
                .purple-slide-in {
                    animation: none;
                }
                
                .purple-button,
                .purple-enhanced,
                .purple-link,
                .purple-card,
                .purple-badge,
                .purple-input {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Detect and enhance purple-related content
    function detectPurpleContent() {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button');
        
        textElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            
            // Check for purple-related keywords
            if (text.includes('purple') || text.includes('violet') || text.includes('lavender')) {
                element.classList.add('purple-enhanced');
            }
            
            // Check for important/premium content
            if (text.includes('premium') || text.includes('pro') || text.includes('advanced')) {
                element.classList.add('purple-highlight');
            }
        });
    }

    // Enhance headings with purple styling
    function enhanceHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach((heading, index) => {
            // Add purple styling to every 3rd heading
            if (index % 3 === 0) {
                heading.classList.add('purple-heading');
            }
            
            // Add gradient to main titles
            if (heading.tagName === 'H1' || heading.classList.contains('main-title')) {
                heading.classList.add('purple-gradient');
            }
        });
    }

    // Enhance links with purple styling
    function enhanceLinks() {
        const links = document.querySelectorAll('a');
        
        links.forEach(link => {
            // Skip if already styled
            if (link.classList.contains('btn') || link.classList.contains('button')) {
                return;
            }
            
            link.classList.add('purple-link');
        });
    }

    // Enhance buttons with purple styling
    function enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn, .button');
        
        buttons.forEach(button => {
            // Skip if already has specific styling
            if (button.classList.contains('btn-primary') || 
                button.classList.contains('btn-secondary') ||
                button.classList.contains('purple-button')) {
                return;
            }
            
            button.classList.add('purple-button');
        });
    }

    // Enhance form elements
    function enhanceForms() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select');
        const labels = document.querySelectorAll('label');
        
        inputs.forEach(input => {
            input.classList.add('purple-input');
        });
        
        labels.forEach(label => {
            label.classList.add('purple-label');
        });
    }

    // Enhance tables
    function enhanceTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            table.classList.add('purple-table');
        });
    }

    // Add purple cards to content sections
    function enhanceCards() {
        const cards = document.querySelectorAll('.card, .panel, .box, .content-box');
        
        cards.forEach(card => {
            card.classList.add('purple-card');
        });
    }

    // Add purple badges to tags and labels
    function enhanceBadges() {
        const badges = document.querySelectorAll('.tag, .label, .badge, .chip');
        
        badges.forEach(badge => {
            badge.classList.add('purple-badge');
        });
    }

    // Add purple progress bars
    function enhanceProgressBars() {
        const progressBars = document.querySelectorAll('.progress, .progress-bar');
        
        progressBars.forEach(progress => {
            progress.classList.add('purple-progress');
            
            const bar = progress.querySelector('.bar, .fill');
            if (bar) {
                bar.classList.add('purple-progress-bar');
            }
        });
    }

    // Add purple alerts
    function enhanceAlerts() {
        const alerts = document.querySelectorAll('.alert, .notification, .message');
        
        alerts.forEach(alert => {
            if (!alert.classList.contains('alert-danger') && 
                !alert.classList.contains('alert-warning') &&
                !alert.classList.contains('alert-success')) {
                alert.classList.add('purple-alert');
            }
        });
    }

    // Add tooltips to elements with title attributes
    function enhanceTooltips() {
        const elementsWithTitles = document.querySelectorAll('[title]');
        
        elementsWithTitles.forEach(element => {
            const title = element.getAttribute('title');
            element.setAttribute('data-tooltip', title);
            element.removeAttribute('title');
            element.classList.add('purple-tooltip');
        });
    }

    // Add loading spinners
    function addLoadingSpinners() {
        const loadingElements = document.querySelectorAll('.loading, .spinner');
        
        loadingElements.forEach(element => {
            element.classList.add('purple-spinner');
        });
    }

    // Add entrance animations
    function addEntranceAnimations() {
        const animatedElements = document.querySelectorAll('.animate, .fade-in');
        
        animatedElements.forEach((element, index) => {
            element.classList.add('purple-fade-in');
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Create purple theme toggle
    function createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'purple-button';
        toggle.style.position = 'fixed';
        toggle.style.bottom = '20px';
        toggle.style.left = '20px';
        toggle.style.zIndex = '1000';
        toggle.innerHTML = '🎨 Purple Theme';
        toggle.title = 'Toggle Purple Theme';
        
        let isEnabled = localStorage.getItem('purpleTheme') === 'true';
        
        function updateTheme() {
            document.body.classList.toggle('purple-theme-enabled', isEnabled);
            toggle.innerHTML = isEnabled ? '🎨 Purple On' : '🎨 Purple Off';
            localStorage.setItem('purpleTheme', isEnabled);
        }
        
        toggle.addEventListener('click', () => {
            isEnabled = !isEnabled;
            updateTheme();
        });
        
        updateTheme();
        document.body.appendChild(toggle);
    }

    // Observe for new content
    function observeNewContent() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Re-enhance new elements
                        if (node.matches && node.matches('h1, h2, h3, h4, h5, h6')) {
                            node.classList.add('purple-heading');
                        }
                        if (node.matches && node.matches('a')) {
                            node.classList.add('purple-link');
                        }
                        if (node.matches && node.matches('button, .btn')) {
                            node.classList.add('purple-button');
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize purple text enhancements
    function init() {
        addPurpleStyles();
        detectPurpleContent();
        enhanceHeadings();
        enhanceLinks();
        enhanceButtons();
        enhanceForms();
        enhanceTables();
        enhanceCards();
        enhanceBadges();
        enhanceProgressBars();
        enhanceAlerts();
        enhanceTooltips();
        addLoadingSpinners();
        addEntranceAnimations();
        createThemeToggle();
        observeNewContent();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();