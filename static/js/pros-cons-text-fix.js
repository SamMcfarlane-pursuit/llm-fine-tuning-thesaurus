// Pros and Cons Text Enhancement
// Improves the display and formatting of pros/cons lists and comparison content

(function() {
    'use strict';

    // Configuration
    const config = {
        prosClass: 'pros-list',
        consClass: 'cons-list',
        comparisonClass: 'comparison-section',
        enhancedClass: 'text-enhanced',
        animationDuration: 300
    };

    // Add pros/cons enhancement styles
    function addProsConsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pros-cons-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            
            .pros-section,
            .cons-section {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .pros-section:hover,
            .cons-section:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .pros-section {
                border-left: 4px solid #28a745;
            }
            
            .cons-section {
                border-left: 4px solid #dc3545;
            }
            
            .pros-header,
            .cons-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                font-weight: 600;
                font-size: 18px;
            }
            
            .pros-header {
                color: #28a745;
            }
            
            .cons-header {
                color: #dc3545;
            }
            
            .pros-icon,
            .cons-icon {
                margin-right: 10px;
                font-size: 20px;
            }
            
            .pros-icon::before {
                content: '✓';
            }
            
            .cons-icon::before {
                content: '✗';
            }
            
            .pros-list,
            .cons-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .pros-list li,
            .cons-list li {
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
                padding: 8px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                line-height: 1.5;
            }
            
            .pros-list li:hover {
                background-color: rgba(40, 167, 69, 0.1);
            }
            
            .cons-list li:hover {
                background-color: rgba(220, 53, 69, 0.1);
            }
            
            .pros-list li::before {
                content: '+';
                color: #28a745;
                font-weight: bold;
                margin-right: 10px;
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .cons-list li::before {
                content: '−';
                color: #dc3545;
                font-weight: bold;
                margin-right: 10px;
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .comparison-summary {
                margin-top: 20px;
                padding: 15px;
                background: #e9ecef;
                border-radius: 8px;
                border-left: 4px solid #6c757d;
            }
            
            .comparison-summary h4 {
                margin: 0 0 10px 0;
                color: #495057;
                display: flex;
                align-items: center;
            }
            
            .comparison-summary h4::before {
                content: '⚖';
                margin-right: 10px;
            }
            
            .comparison-stats {
                display: flex;
                justify-content: space-around;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #dee2e6;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-number {
                display: block;
                font-size: 24px;
                font-weight: bold;
                color: #495057;
            }
            
            .stat-label {
                font-size: 12px;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .text-enhanced {
                line-height: 1.6;
                color: #333;
            }
            
            .text-enhanced h1,
            .text-enhanced h2,
            .text-enhanced h3,
            .text-enhanced h4,
            .text-enhanced h5,
            .text-enhanced h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 600;
            }
            
            .text-enhanced p {
                margin-bottom: 1em;
            }
            
            .text-enhanced ul,
            .text-enhanced ol {
                margin-bottom: 1em;
                padding-left: 1.5em;
            }
            
            .text-enhanced li {
                margin-bottom: 0.5em;
            }
            
            .text-enhanced blockquote {
                margin: 1.5em 0;
                padding: 1em 1.5em;
                background: #f8f9fa;
                border-left: 4px solid #007bff;
                border-radius: 0 4px 4px 0;
                font-style: italic;
            }
            
            .text-enhanced code {
                background: #f1f3f4;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }
            
            .text-enhanced pre {
                background: #f8f9fa;
                padding: 1em;
                border-radius: 4px;
                overflow-x: auto;
                border: 1px solid #e9ecef;
            }
            
            .text-enhanced pre code {
                background: none;
                padding: 0;
            }
            
            .highlight-positive {
                background: linear-gradient(120deg, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0.1) 100%);
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .highlight-negative {
                background: linear-gradient(120deg, rgba(220, 53, 69, 0.2) 0%, rgba(220, 53, 69, 0.1) 100%);
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .highlight-neutral {
                background: linear-gradient(120deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            @media (max-width: 768px) {
                .pros-cons-container {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .pros-section,
                .cons-section {
                    padding: 15px;
                }
                
                .comparison-stats {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .stat-number {
                    font-size: 18px;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .pros-section,
                .cons-section {
                    background: #374151;
                    color: #e5e7eb;
                }
                
                .comparison-summary {
                    background: #4b5563;
                    color: #e5e7eb;
                }
                
                .text-enhanced {
                    color: #e5e7eb;
                }
                
                .text-enhanced blockquote {
                    background: #374151;
                    color: #d1d5db;
                }
                
                .text-enhanced code {
                    background: #4b5563;
                    color: #e5e7eb;
                }
                
                .text-enhanced pre {
                    background: #374151;
                    border-color: #4b5563;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Detect and enhance pros/cons lists
    function detectProsConsLists() {
        const textElements = document.querySelectorAll('p, div, section, article');
        
        textElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            
            // Look for pros/cons indicators
            if (text.includes('pros:') || text.includes('advantages:') || text.includes('benefits:')) {
                enhanceProsConsList(element, 'pros');
            } else if (text.includes('cons:') || text.includes('disadvantages:') || text.includes('drawbacks:')) {
                enhanceProsConsList(element, 'cons');
            }
        });
    }

    // Enhance detected pros/cons lists
    function enhanceProsConsList(element, type) {
        const lists = element.querySelectorAll('ul, ol');
        
        lists.forEach(list => {
            if (type === 'pros') {
                list.classList.add(config.prosClass);
            } else {
                list.classList.add(config.consClass);
            }
        });
    }

    // Create structured pros/cons comparison
    function createProsConsComparison(prosElement, consElement) {
        const container = document.createElement('div');
        container.className = 'pros-cons-container';
        
        const prosSection = document.createElement('div');
        prosSection.className = 'pros-section';
        prosSection.innerHTML = `
            <div class="pros-header">
                <span class="pros-icon"></span>
                Pros
            </div>
            <div class="pros-content"></div>
        `;
        
        const consSection = document.createElement('div');
        consSection.className = 'cons-section';
        consSection.innerHTML = `
            <div class="cons-header">
                <span class="cons-icon"></span>
                Cons
            </div>
            <div class="cons-content"></div>
        `;
        
        // Move content
        prosSection.querySelector('.pros-content').appendChild(prosElement);
        consSection.querySelector('.cons-content').appendChild(consElement);
        
        container.appendChild(prosSection);
        container.appendChild(consSection);
        
        return container;
    }

    // Add comparison summary
    function addComparisonSummary(container) {
        const prosItems = container.querySelectorAll('.pros-list li').length;
        const consItems = container.querySelectorAll('.cons-list li').length;
        const total = prosItems + consItems;
        
        const summary = document.createElement('div');
        summary.className = 'comparison-summary';
        summary.innerHTML = `
            <h4>Comparison Summary</h4>
            <p>This comparison includes ${total} total points to consider when making your decision.</p>
            <div class="comparison-stats">
                <div class="stat-item">
                    <span class="stat-number">${prosItems}</span>
                    <span class="stat-label">Pros</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${consItems}</span>
                    <span class="stat-label">Cons</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round((prosItems / total) * 100)}%</span>
                    <span class="stat-label">Positive</span>
                </div>
            </div>
        `;
        
        container.appendChild(summary);
    }

    // Enhance text readability
    function enhanceTextReadability() {
        const textContainers = document.querySelectorAll('article, .content, .post, .text-content, main');
        
        textContainers.forEach(container => {
            if (!container.classList.contains(config.enhancedClass)) {
                container.classList.add(config.enhancedClass);
                
                // Add semantic highlighting
                highlightSemanticContent(container);
            }
        });
    }

    // Add semantic highlighting to text
    function highlightSemanticContent(container) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            let newHTML = text;
            
            // Highlight positive words
            const positiveWords = /\b(excellent|great|good|best|better|improved|advantage|benefit|positive|success|effective|efficient|fast|easy|simple|clear|helpful|useful|valuable|important|significant|strong|powerful|reliable|stable|secure|safe)\b/gi;
            newHTML = newHTML.replace(positiveWords, '<span class="highlight-positive">$&</span>');
            
            // Highlight negative words
            const negativeWords = /\b(poor|bad|worst|worse|problem|issue|disadvantage|drawback|negative|failure|ineffective|inefficient|slow|difficult|hard|complex|unclear|confusing|useless|dangerous|risky|unstable|insecure|weak)\b/gi;
            newHTML = newHTML.replace(negativeWords, '<span class="highlight-negative">$&</span>');
            
            // Highlight neutral/caution words
            const neutralWords = /\b(consider|note|important|warning|caution|attention|remember|keep in mind|be aware|however|although|but|yet|still|nevertheless|nonetheless)\b/gi;
            newHTML = newHTML.replace(neutralWords, '<span class="highlight-neutral">$&</span>');
            
            if (newHTML !== text) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = newHTML;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    }

    // Auto-organize pros and cons
    function autoOrganizeProsAndCons() {
        const prosLists = document.querySelectorAll(`.${config.prosClass}`);
        const consLists = document.querySelectorAll(`.${config.consClass}`);
        
        // Group nearby pros and cons lists
        prosLists.forEach(prosList => {
            const nextElements = [];
            let nextElement = prosList.parentElement.nextElementSibling;
            
            // Look for cons list within next 3 elements
            for (let i = 0; i < 3 && nextElement; i++) {
                nextElements.push(nextElement);
                const consList = nextElement.querySelector(`.${config.consClass}`);
                
                if (consList) {
                    // Create comparison container
                    const comparison = createProsConsComparison(
                        prosList.cloneNode(true),
                        consList.cloneNode(true)
                    );
                    
                    addComparisonSummary(comparison);
                    
                    // Replace original elements
                    prosList.parentElement.parentNode.insertBefore(comparison, prosList.parentElement);
                    prosList.parentElement.remove();
                    nextElement.remove();
                    
                    break;
                }
                
                nextElement = nextElement.nextElementSibling;
            }
        });
    }

    // Fix common text formatting issues
    function fixTextFormatting() {
        // Fix double spaces
        const textNodes = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = textNodes.nextNode()) {
            if (node.textContent.includes('  ')) {
                node.textContent = node.textContent.replace(/\s+/g, ' ');
            }
        }
        
        // Fix orphaned punctuation
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.innerHTML = p.innerHTML.replace(/\s+([.,!?;:])/g, '$1');
        });
    }

    // Initialize all text enhancements
    function init() {
        addProsConsStyles();
        detectProsConsLists();
        enhanceTextReadability();
        autoOrganizeProsAndCons();
        fixTextFormatting();
        
        // Watch for dynamic content
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const textContainers = node.querySelectorAll ? 
                            [node, ...node.querySelectorAll('article, .content, .post, .text-content')] : 
                            [];
                        
                        textContainers.forEach(container => {
                            if (container && !container.classList.contains(config.enhancedClass)) {
                                container.classList.add(config.enhancedClass);
                                highlightSemanticContent(container);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();