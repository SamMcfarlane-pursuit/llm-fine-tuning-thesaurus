/**
 * Code block enhancement script
 * Adds copy functionality and syntax highlighting to code blocks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to all code blocks
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(function(block) {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
        copyButton.setAttribute('title', 'Copy to clipboard');
        
        // Add copy functionality
        copyButton.addEventListener('click', function() {
            const code = block.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(function() {
                // Show success feedback
                copyButton.innerHTML = '<i class="bi bi-check2"></i>';
                copyButton.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                    copyButton.classList.remove('copied');
                }, 2000);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
                copyButton.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
                copyButton.classList.add('error');
                
                // Reset after 2 seconds
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                    copyButton.classList.remove('error');
                }, 2000);
            });
        });
        
        // Add button to code block
        block.appendChild(copyButton);
    });
    
    // Add line numbers to code blocks with the 'with-line-numbers' class
    const lineNumberBlocks = document.querySelectorAll('.code-block.with-line-numbers code');
    
    lineNumberBlocks.forEach(function(codeElement) {
        const codeLines = codeElement.innerHTML.split('\n');
        let numberedCode = '';
        
        codeLines.forEach(function(line, index) {
            numberedCode += `<span>${line}</span>\n`;
        });
        
        codeElement.innerHTML = numberedCode;
    });
});
