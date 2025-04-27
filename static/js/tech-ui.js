/**
 * Tech UI Enhancement Script
 * Adds interactive features and animations to the LLM Fine-Tuning Thesaurus
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add typing animation to headings
    const mainHeadings = document.querySelectorAll('h1');
    mainHeadings.forEach(heading => {
        const text = heading.textContent;
        heading.innerHTML = '';
        heading.classList.add('typing-animation');
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heading.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        typeWriter();
    });
    
    // Add particle background to visualization container
    const visualizationContainers = document.querySelectorAll('.visualization-container');
    visualizationContainers.forEach(container => {
        // Create canvas for particles
        const canvas = document.createElement('canvas');
        canvas.classList.add('particles-canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        
        // Insert canvas as first child
        container.insertBefore(canvas, container.firstChild);
        
        // Initialize particles
        initParticles(canvas);
    });
    
    // Add code highlighting
    const codeBlocks = document.querySelectorAll('.code-block code');
    codeBlocks.forEach(block => {
        // Simple syntax highlighting
        const content = block.innerHTML;
        
        // Highlight Python keywords
        const pythonKeywords = ['import', 'from', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 
                               'return', 'try', 'except', 'with', 'as', 'in', 'not', 'and', 'or', 'True', 'False', 'None'];
        
        let highlightedContent = content;
        
        // Highlight keywords
        pythonKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlightedContent = highlightedContent.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Highlight strings
        highlightedContent = highlightedContent.replace(/(["'])(.*?)\1/g, '<span class="string">$&</span>');
        
        // Highlight numbers
        highlightedContent = highlightedContent.replace(/\b(\d+)\b/g, '<span class="number">$&</span>');
        
        // Highlight comments
        highlightedContent = highlightedContent.replace(/(#.*)$/gm, '<span class="comment">$&</span>');
        
        // Highlight function calls
        highlightedContent = highlightedContent.replace(/\b(\w+)\(/g, '<span class="function">$1</span>(');
        
        block.innerHTML = highlightedContent;
    });
    
    // Add interactive tooltips to technical terms
    const techTerms = document.querySelectorAll('strong');
    techTerms.forEach(term => {
        term.classList.add('tech-term');
        term.setAttribute('data-toggle', 'tooltip');
        term.setAttribute('data-placement', 'top');
        
        // Set tooltip content based on term
        if (term.textContent.includes('LoRA')) {
            term.setAttribute('data-original-title', 'Low-Rank Adaptation - Efficient fine-tuning method that adds trainable rank decomposition matrices');
        } else if (term.textContent.includes('QLoRA')) {
            term.setAttribute('data-original-title', 'Quantized Low-Rank Adaptation - Combines 4-bit quantization with LoRA for memory-efficient fine-tuning');
        } else if (term.textContent.includes('Quantization')) {
            term.setAttribute('data-original-title', 'Process of reducing model precision (e.g., from 32-bit to 4-bit) to decrease memory usage');
        }
    });
    
    // Initialize tooltips
    if (typeof $ !== 'undefined' && typeof $.fn.tooltip !== 'undefined') {
        $('[data-toggle="tooltip"]').tooltip();
    }
    
    // Add scroll animations
    const animatedElements = document.querySelectorAll('.card, .list-group, .code-block');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        element.classList.add('scroll-animation');
        observer.observe(element);
    });
});

/**
 * Initialize particle animation on canvas
 */
function initParticles(canvas) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;
    
    // Resize canvas to match container
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // Create particles
    function createParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: `rgba(0, 198, 255, ${Math.random() * 0.5 + 0.1})`,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25
            });
        }
    }
    
    // Draw particles
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.speedX *= -1;
            }
            
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.speedY *= -1;
            }
        });
        
        // Draw connections between nearby particles
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(0, 198, 255, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(drawParticles);
    }
    
    // Initialize
    resizeCanvas();
    createParticles();
    drawParticles();
    
    // Handle resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        particles.length = 0;
        createParticles();
    });
}

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .scroll-animation {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-animation.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .typing-animation {
        border-right: 2px solid #00c3ff;
        white-space: nowrap;
        overflow: hidden;
        margin: 0 auto;
        animation: blink-caret 0.75s step-end infinite;
    }
    
    @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: #00c3ff }
    }
    
    .tech-term {
        position: relative;
        color: #00c3ff;
        cursor: help;
        transition: all 0.3s ease;
    }
    
    .tech-term:hover {
        text-shadow: 0 0 8px rgba(0, 198, 255, 0.5);
    }
`;

document.head.appendChild(style);
