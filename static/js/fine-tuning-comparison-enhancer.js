/**
 * Fine-Tuning Comparison Page Enhancer
 * Improves visibility and interactivity on the fine-tuning comparison page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the fine-tuning comparison page
    if (window.location.pathname.includes('fine-tuning-comparison') || 
        window.location.pathname.includes('guide/finetuning-comparison')) {
        
        // Add the fine-tuning-comparison class to the main container
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('fine-tuning-comparison');
        }
        
        // Enhance code blocks
        enhanceCodeBlocks();
        
        // Enhance resource tables
        enhanceResourceTables();
        
        // Enhance pros and cons lists
        enhanceProsConsList();
        
        // Add method navigation
        addMethodNavigation();
        
        // Add copy buttons to code blocks
        addCopyButtons();
    }
});

/**
 * Enhances code blocks for better visibility
 */
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre, .code-block, code');
    
    codeBlocks.forEach(block => {
        // Skip if already enhanced
        if (block.classList.contains('enhanced')) return;
        
        // Add enhanced class
        block.classList.add('enhanced');
        
        // If it's a pre tag without a parent code-block, wrap it
        if (block.tagName === 'PRE' && !block.closest('.code-block')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            
            // Determine language
            let language = 'code';
            const codeElement = block.querySelector('code');
            if (codeElement) {
                const classes = Array.from(codeElement.classList);
                const langClass = classes.find(cls => cls.startsWith('language-') || cls.startsWith('lang-'));
                if (langClass) {
                    language = langClass.replace('language-', '').replace('lang-', '');
                }
            }
            
            // Add language class
            wrapper.classList.add(language);
            
            // Create header
            const header = document.createElement('div');
            header.className = 'code-header';
            header.textContent = language.charAt(0).toUpperCase() + language.slice(1);
            
            // Insert wrapper and header
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(header);
            wrapper.appendChild(block);
        }
        
        // Add syntax highlighting classes if not already present
        if (block.tagName === 'CODE' && !block.closest('.hljs')) {
            const content = block.textContent;
            
            // Python syntax highlighting
            if (block.classList.contains('language-python') || block.classList.contains('lang-python')) {
                // Keywords
                const keywords = ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'as', 'with', 'try', 'except', 'finally', 'pass', 'break', 'continue', 'and', 'or', 'not', 'is', 'None', 'True', 'False'];
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    block.innerHTML = block.innerHTML.replace(regex, `<span class="python-keyword">${keyword}</span>`);
                });
                
                // Strings
                block.innerHTML = block.innerHTML.replace(/(["'])(.*?)\1/g, '<span class="python-string">$&</span>');
                
                // Comments
                block.innerHTML = block.innerHTML.replace(/(#.*$)/gm, '<span class="python-comment">$&</span>');
                
                // Numbers
                block.innerHTML = block.innerHTML.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="python-number">$&</span>');
                
                // Function calls
                block.innerHTML = block.innerHTML.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="python-function">$1</span>(');
            }
        }
    });
}

/**
 * Enhances resource tables for better visibility
 */
function enhanceResourceTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Skip if already enhanced
        if (table.classList.contains('enhanced')) return;
        
        // Add enhanced class
        table.classList.add('enhanced');
        
        // Check if it's a resource table
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.toLowerCase());
        const isResourceTable = headers.some(header => 
            header.includes('parameter') || 
            header.includes('vram') || 
            header.includes('memory') || 
            header.includes('resource')
        );
        
        if (isResourceTable) {
            // Add resource-table class
            table.classList.add('resource-table');
            
            // Wrap in a container if not already wrapped
            if (!table.closest('.resource-requirements')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'resource-requirements';
                
                // Add a heading if not already present
                const prevElement = table.previousElementSibling;
                let heading;
                
                if (prevElement && (prevElement.tagName === 'H2' || prevElement.tagName === 'H3' || prevElement.tagName === 'H4')) {
                    heading = prevElement;
                    heading.classList.add('resource-heading');
                } else {
                    heading = document.createElement('h3');
                    heading.textContent = 'Resource Requirements';
                    heading.className = 'resource-heading';
                }
                
                // Insert wrapper
                table.parentNode.insertBefore(wrapper, table);
                
                // Move heading and table into wrapper
                if (heading !== prevElement) {
                    wrapper.appendChild(heading);
                }
                wrapper.appendChild(table);
            }
        }
    });
}

/**
 * Enhances pros and cons lists for better visibility
 */
function enhanceProsConsList() {
    // Find potential pros and cons sections
    const sections = document.querySelectorAll('h3, h4');
    
    sections.forEach(section => {
        const title = section.textContent.toLowerCase();
        
        // Check if it's a pros or cons section
        if (title.includes('pros') || title.includes('advantages') || title.includes('benefits')) {
            enhanceList(section, 'pros');
        } else if (title.includes('cons') || title.includes('disadvantages') || title.includes('limitations')) {
            enhanceList(section, 'cons');
        }
    });
    
    // Also look for lists with specific classes
    const lists = document.querySelectorAll('ul, ol');
    
    lists.forEach(list => {
        if (list.classList.contains('pros-list') || list.classList.contains('advantages')) {
            wrapList(list, 'pros', 'Pros');
        } else if (list.classList.contains('cons-list') || list.classList.contains('disadvantages')) {
            wrapList(list, 'cons', 'Cons');
        }
    });
}

/**
 * Enhances a list based on its heading
 * @param {HTMLElement} heading - The heading element
 * @param {string} type - The type of list ('pros' or 'cons')
 */
function enhanceList(heading, type) {
    // Find the next list element
    let list = heading.nextElementSibling;
    
    while (list && (list.tagName !== 'UL' && list.tagName !== 'OL')) {
        list = list.nextElementSibling;
        
        // Break if we hit another heading
        if (list && (list.tagName === 'H2' || list.tagName === 'H3' || list.tagName === 'H4')) {
            return;
        }
    }
    
    if (list) {
        wrapList(list, type, heading.textContent);
    }
}

/**
 * Wraps a list in a styled container
 * @param {HTMLElement} list - The list element
 * @param {string} type - The type of list ('pros' or 'cons')
 * @param {string} title - The title for the list
 */
function wrapList(list, type, title) {
    // Skip if already enhanced
    if (list.closest('.pros') || list.closest('.cons')) return;
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = type;
    
    // Create heading if title is provided
    if (title) {
        const heading = document.createElement('h3');
        heading.textContent = title;
        wrapper.appendChild(heading);
    }
    
    // Insert wrapper and move list
    list.parentNode.insertBefore(wrapper, list);
    wrapper.appendChild(list);
    
    // Add class to list
    list.classList.add(`${type}-list`);
}

/**
 * Adds navigation between methods
 */
function addMethodNavigation() {
    const methodSections = document.querySelectorAll('h2, h3');
    const methods = [];
    
    // Collect method sections
    methodSections.forEach(section => {
        const title = section.textContent.trim();
        
        // Check if it's a method section
        if (title.includes('Fine-Tuning') || 
            title.includes('LoRA') || 
            title.includes('QLoRA') || 
            title.includes('PEFT') || 
            title.includes('Adapter') || 
            title.includes('Method')) {
            
            methods.push({
                id: section.id || `method-${methods.length}`,
                title: title,
                element: section
            });
            
            // Add ID if not present
            if (!section.id) {
                section.id = methods[methods.length - 1].id;
            }
        }
    });
    
    // Create navigation if we have methods
    if (methods.length > 1) {
        const nav = document.createElement('div');
        nav.className = 'method-navigation';
        nav.innerHTML = `
            <h3>Jump to Method</h3>
            <div class="method-links">
                ${methods.map(method => `
                    <a href="#${method.id}" class="method-link">
                        ${method.title}
                    </a>
                `).join('')}
            </div>
        `;
        
        // Insert at the top of the page
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            const firstHeading = mainContent.querySelector('h1, h2');
            if (firstHeading) {
                mainContent.insertBefore(nav, firstHeading.nextSibling);
            } else {
                mainContent.insertBefore(nav, mainContent.firstChild);
            }
        }
    }
}

/**
 * Adds copy buttons to code blocks
 */
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.code-block, pre');
    
    codeBlocks.forEach(block => {
        // Skip if already has a copy button
        if (block.querySelector('.copy-button')) return;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
        copyButton.title = 'Copy to clipboard';
        
        // Add click event
        copyButton.addEventListener('click', function() {
            // Get code content
            const codeElement = block.querySelector('code') || block;
            const code = codeElement.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(code).then(() => {
                // Show success message
                copyButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
                copyButton.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                copyButton.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                }, 2000);
            });
        });
        
        // Add to code block
        if (block.querySelector('.code-header')) {
            block.querySelector('.code-header').appendChild(copyButton);
        } else {
            // Create header if not present
            const header = document.createElement('div');
            header.className = 'code-header';
            header.textContent = 'Code';
            header.appendChild(copyButton);
            
            // Add header to block
            block.insertBefore(header, block.firstChild);
        }
    });
}
