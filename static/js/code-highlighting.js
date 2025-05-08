/**
 * Code Highlighting JavaScript
 * Adds syntax highlighting to code blocks in guides
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add syntax highlighting classes to code blocks
    document.querySelectorAll('.code-block code').forEach(block => {
        // Get language from class if available
        const classes = block.className.split(' ');
        let language = '';
        
        for (const cls of classes) {
            if (cls.startsWith('language-')) {
                language = cls.substring(9);
                break;
            }
        }
        
        // Default to python if no language specified
        if (!language) {
            language = 'python';
            block.classList.add(`language-${language}`);
        }
        
        // Apply basic syntax highlighting
        highlightCode(block, language);
    });
    
    // Simple syntax highlighting function
    function highlightCode(codeElement, language) {
        let code = codeElement.textContent;
        let highlighted = '';
        
        if (language === 'python') {
            // Python keywords
            const keywords = [
                'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 
                'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 
                'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 
                'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 
                'while', 'with', 'yield'
            ];
            
            // Python built-ins
            const builtins = [
                'abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
                'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
                'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format',
                'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex',
                'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
                'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
                'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr',
                'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod',
                'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'
            ];
            
            // Split code into lines
            const lines = code.split('\n');
            const highlightedLines = [];
            
            for (const line of lines) {
                let highlightedLine = line;
                
                // Highlight strings
                highlightedLine = highlightedLine.replace(
                    /(["'])((?:\\\1|(?!\1).)*)\1/g, 
                    '<span style="color: #a5d6a7;">$1$2$1</span>'
                );
                
                // Highlight comments
                highlightedLine = highlightedLine.replace(
                    /(#.*)$/g, 
                    '<span style="color: #9e9e9e;">$1</span>'
                );
                
                // Highlight keywords
                for (const keyword of keywords) {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    highlightedLine = highlightedLine.replace(
                        regex, 
                        `<span style="color: #ff79c6; font-weight: bold;">${keyword}</span>`
                    );
                }
                
                // Highlight built-ins
                for (const builtin of builtins) {
                    const regex = new RegExp(`\\b${builtin}\\b`, 'g');
                    highlightedLine = highlightedLine.replace(
                        regex, 
                        `<span style="color: #8be9fd;">${builtin}</span>`
                    );
                }
                
                // Highlight numbers
                highlightedLine = highlightedLine.replace(
                    /\b(\d+(\.\d+)?)\b/g, 
                    '<span style="color: #bd93f9;">$1</span>'
                );
                
                // Highlight function calls
                highlightedLine = highlightedLine.replace(
                    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 
                    '<span style="color: #50fa7b;">$1</span>('
                );
                
                highlightedLines.push(highlightedLine);
            }
            
            highlighted = highlightedLines.join('\n');
        } else if (language === 'dockerfile') {
            // Dockerfile keywords
            const keywords = [
                'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 
                'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 
                'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'
            ];
            
            // Split code into lines
            const lines = code.split('\n');
            const highlightedLines = [];
            
            for (const line of lines) {
                let highlightedLine = line;
                
                // Highlight comments
                highlightedLine = highlightedLine.replace(
                    /(#.*)$/g, 
                    '<span style="color: #9e9e9e;">$1</span>'
                );
                
                // Highlight keywords
                for (const keyword of keywords) {
                    const regex = new RegExp(`^\\s*(${keyword})\\b`, 'g');
                    highlightedLine = highlightedLine.replace(
                        regex, 
                        `<span style="color: #ff79c6; font-weight: bold;">$1</span>`
                    );
                }
                
                highlightedLines.push(highlightedLine);
            }
            
            highlighted = highlightedLines.join('\n');
        } else {
            // Default highlighting for other languages
            highlighted = code;
        }
        
        codeElement.innerHTML = highlighted;
    }
});
