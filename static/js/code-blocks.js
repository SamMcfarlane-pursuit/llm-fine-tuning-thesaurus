/**
 * Code block enhancement script
 * Adds copy functionality and syntax highlighting to code blocks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to all code blocks (both old and new style)
    const oldCodeBlocks = document.querySelectorAll('.code-block');
    const newCodeBlocks = document.querySelectorAll('.code-container');

    // Handle old style code blocks
    oldCodeBlocks.forEach(function(block) {
        if (!block.querySelector('.copy-btn')) {
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyButton.setAttribute('title', 'Copy to clipboard');

            // Add copy functionality
            copyButton.addEventListener('click', function() {
                const code = block.querySelector('code').innerText;
                copyToClipboard(code, copyButton);
            });

            // Add button to code block
            block.appendChild(copyButton);
        }
    });

    // Handle new style code blocks
    newCodeBlocks.forEach(function(container) {
        const header = container.querySelector('.code-header');

        if (header && !header.querySelector('.copy-btn')) {
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyButton.setAttribute('title', 'Copy to clipboard');

            // Add copy functionality
            copyButton.addEventListener('click', function() {
                const code = container.querySelector('code').innerText;
                copyToClipboard(code, copyButton);
            });

            // Add button to code header
            header.appendChild(copyButton);
        }
    });

    // Add line numbers to code blocks with the 'with-line-numbers' class
    const lineNumberBlocks = document.querySelectorAll('.with-line-numbers code');

    lineNumberBlocks.forEach(function(codeElement) {
        if (!codeElement.classList.contains('line-numbered')) {
            const codeLines = codeElement.innerHTML.split('\n');
            let numberedCode = '';

            codeLines.forEach(function(line, index) {
                numberedCode += `<span class="code-line">${line}</span>\n`;
            });

            codeElement.innerHTML = numberedCode;
            codeElement.classList.add('line-numbered');
        }
    });

    // Helper function to copy text to clipboard
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(function() {
            // Show success feedback
            button.innerHTML = '<i class="bi bi-check2"></i>';
            button.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(function() {
                button.innerHTML = '<i class="bi bi-clipboard"></i>';
                button.classList.remove('copied');
            }, 2000);
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
            button.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
            button.classList.add('error');

            // Reset after 2 seconds
            setTimeout(function() {
                button.innerHTML = '<i class="bi bi-clipboard"></i>';
                button.classList.remove('error');
            }, 2000);
        });
    }

    // Fix any styling issues with code blocks
    fixCodeBlockStyling();
});

// Function to fix styling issues with code blocks
function fixCodeBlockStyling() {
    // Fix any remaining old-style code blocks
    document.querySelectorAll('pre:not(.code-block):not(.line-numbered)').forEach(function(pre) {
        if (!pre.closest('.code-container') && !pre.classList.contains('fixed-styling')) {
            pre.classList.add('fixed-styling');
            pre.style.overflow = 'auto';
            pre.style.maxHeight = '400px';
            pre.style.backgroundColor = '#f6f8fa';
            pre.style.border = '1px solid #e1e4e8';
            pre.style.borderRadius = '6px';
            pre.style.padding = '16px';
            pre.style.margin = '16px 0';
        }
    });

    // Ensure all code containers have proper styling
    document.querySelectorAll('.code-container').forEach(function(container) {
        if (!container.classList.contains('fixed-styling')) {
            container.classList.add('fixed-styling');

            // Ensure the container has proper styling
            container.style.marginBottom = '16px';
            container.style.overflow = 'hidden';

            // Ensure the code content has proper styling
            const codeContent = container.querySelector('.code-content');
            if (codeContent) {
                codeContent.style.overflow = 'auto';
                codeContent.style.maxHeight = '400px';
            }
        }
    });

    // Clean up any visible class attributes in code blocks
    cleanupCodeDisplay();
}

// Function to clean up code display by removing visible class attributes
function cleanupCodeDisplay() {
    // Get all code elements
    const codeElements = document.querySelectorAll('pre code');

    codeElements.forEach(function(codeElement) {
        // Get the HTML content
        let content = codeElement.innerHTML;

        // Remove any visible class attributes
        content = content.replace(/class=["'][^"']*["']/g, '');
        content = content.replace(/class-class=["'][^"']*["']/g, '');
        content = content.replace(/class=["']([^"']*)["']/g, '');

        // Update the content
        codeElement.innerHTML = content;
    });
}
