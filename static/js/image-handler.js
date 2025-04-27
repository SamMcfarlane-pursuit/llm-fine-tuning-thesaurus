/**
 * Image Handler Script
 * Enhances image loading, display, and interaction
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Add image zoom functionality
    addImageZoom();
    
    // Format code blocks with syntax highlighting
    formatCodeBlocks();
    
    // Add captions to images that don't have them
    addImageCaptions();
});

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    // Get all images that should be lazy loaded
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Create an intersection observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the image is in the viewport
            if (entry.isIntersecting) {
                const img = entry.target;
                // Replace the src with the data-src
                img.src = img.dataset.src;
                // Remove the data-src attribute
                img.removeAttribute('data-src');
                // Add a fade-in class
                img.classList.add('fade-in');
                // Stop observing the image
                observer.unobserve(img);
            }
        });
    });
    
    // Observe each image
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Add zoom functionality to images
 */
function addImageZoom() {
    // Get all content images
    const contentImages = document.querySelectorAll('.content-image, .diagram-image, .image-container img');
    
    contentImages.forEach(img => {
        // Create a wrapper for the image if it doesn't have one
        if (!img.parentElement.classList.contains('image-container')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-container');
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
        }
        
        // Add click event for zooming
        img.addEventListener('click', function() {
            // Create a modal for the zoomed image
            const modal = document.createElement('div');
            modal.classList.add('image-modal');
            modal.innerHTML = `
                <div class="image-modal-content">
                    <span class="image-modal-close">&times;</span>
                    <img src="${this.src}" alt="${this.alt || 'Image'}" class="image-modal-img">
                    <div class="image-modal-caption">${this.alt || ''}</div>
                </div>
            `;
            
            // Add the modal to the body
            document.body.appendChild(modal);
            
            // Show the modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Close the modal when clicking the close button
            modal.querySelector('.image-modal-close').addEventListener('click', function() {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Close the modal when clicking outside the image
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }
            });
        });
    });
}

/**
 * Format code blocks with syntax highlighting
 */
function formatCodeBlocks() {
    // Get all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
        // Add line numbers
        const code = codeBlock.innerHTML;
        const lines = code.split('\n');
        let formattedCode = '';
        
        lines.forEach((line, index) => {
            // Skip the last empty line
            if (index === lines.length - 1 && line.trim() === '') return;
            
            // Add a span for each line
            formattedCode += `<span class="code-line">${line}</span>\n`;
        });
        
        // Update the code block
        codeBlock.innerHTML = formattedCode;
        
        // Add line numbers class to parent
        codeBlock.parentElement.classList.add('with-line-numbers');
        
        // Apply syntax highlighting
        applySyntaxHighlighting(codeBlock);
    });
}

/**
 * Apply syntax highlighting to a code block
 */
function applySyntaxHighlighting(codeBlock) {
    // Simple syntax highlighting for Python
    const pythonKeywords = ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'in', 'not', 'and', 'or', 'True', 'False', 'None'];
    const pythonBuiltins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'open', 'file', 'object', 'super'];
    
    // Get all lines
    const lines = codeBlock.querySelectorAll('.code-line');
    
    lines.forEach(line => {
        // Highlight strings
        line.innerHTML = line.innerHTML.replace(/(["'])(.*?)\1/g, '<span class="string">$&</span>');
        
        // Highlight comments
        line.innerHTML = line.innerHTML.replace(/(#.*$)/g, '<span class="comment">$&</span>');
        
        // Highlight numbers
        line.innerHTML = line.innerHTML.replace(/\b(\d+)\b/g, '<span class="number">$&</span>');
        
        // Highlight keywords
        pythonKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            line.innerHTML = line.innerHTML.replace(regex, '<span class="keyword">$&</span>');
        });
        
        // Highlight builtins
        pythonBuiltins.forEach(builtin => {
            const regex = new RegExp(`\\b(${builtin})\\b`, 'g');
            line.innerHTML = line.innerHTML.replace(regex, '<span class="builtin">$&</span>');
        });
        
        // Highlight function definitions
        line.innerHTML = line.innerHTML.replace(/\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="keyword">def</span> <span class="function">$2</span>');
        
        // Highlight class definitions
        line.innerHTML = line.innerHTML.replace(/\b(class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="keyword">class</span> <span class="class">$2</span>');
        
        // Highlight function calls
        line.innerHTML = line.innerHTML.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="function">$1</span>(');
    });
}

/**
 * Add captions to images that don't have them
 */
function addImageCaptions() {
    // Get all images that don't have captions
    const images = document.querySelectorAll('img:not(.image-container img):not(.content-image):not(.diagram-image)');
    
    images.forEach(img => {
        // If the image has an alt text, use it as a caption
        if (img.alt && !img.parentElement.classList.contains('image-container')) {
            // Create a wrapper for the image
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-container');
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Add a caption
            const caption = document.createElement('div');
            caption.classList.add('image-caption');
            caption.textContent = img.alt;
            wrapper.appendChild(caption);
        }
    });
}

// Add CSS for the image modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-modal.show {
    opacity: 1;
}

.image-modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    margin: auto;
}

.image-modal-img {
    max-width: 100%;
    max-height: 90vh;
    display: block;
    margin: 0 auto;
    border-radius: 5px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.image-modal-close {
    position: absolute;
    top: -30px;
    right: 0;
    color: white;
    font-size: 30px;
    font-weight: bold;
    cursor: pointer;
}

.image-modal-caption {
    color: white;
    text-align: center;
    padding: 10px;
    font-style: italic;
}

.fade-in {
    animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
document.head.appendChild(modalStyle);
