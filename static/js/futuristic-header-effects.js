// Futuristic Header Effects
// Adds modern, animated visual effects to headers and navigation

(function() {
    'use strict';

    // Configuration
    const config = {
        headerSelector: 'header, .header, .navbar, nav',
        titleSelector: 'h1, .title, .brand, .logo',
        navItemSelector: 'nav a, .nav-link, .menu-item',
        animationDuration: 300,
        glowIntensity: 0.8,
        particleCount: 50
    };

    // Animation state
    let animationFrame;
    let particles = [];
    let mousePosition = { x: 0, y: 0 };

    // Add futuristic styles
    function addFuturisticStyles() {
        const style = document.createElement('style');
        style.id = 'futuristic-header-styles';
        style.textContent = `
            /* Futuristic Header Base Styles */
            .futuristic-header {
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .futuristic-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                    rgba(255,255,255,0.1) 0%, 
                    transparent 50%, 
                    rgba(255,255,255,0.1) 100%);
                transform: translateX(-100%);
                transition: transform 0.6s ease;
            }
            
            .futuristic-header:hover::before {
                transform: translateX(100%);
            }
            
            /* Animated Background Grid */
            .grid-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.1;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
                background-size: 20px 20px;
                animation: gridMove 20s linear infinite;
            }
            
            @keyframes gridMove {
                0% { transform: translate(0, 0); }
                100% { transform: translate(20px, 20px); }
            }
            
            /* Glowing Title Effects */
            .glow-title {
                position: relative;
                color: #fff;
                text-shadow: 
                    0 0 5px rgba(255,255,255,0.8),
                    0 0 10px rgba(255,255,255,0.6),
                    0 0 15px rgba(255,255,255,0.4),
                    0 0 20px rgba(102,126,234,0.8),
                    0 0 35px rgba(102,126,234,0.6),
                    0 0 40px rgba(102,126,234,0.4);
                animation: titleGlow 2s ease-in-out infinite alternate;
            }
            
            @keyframes titleGlow {
                from {
                    text-shadow: 
                        0 0 5px rgba(255,255,255,0.8),
                        0 0 10px rgba(255,255,255,0.6),
                        0 0 15px rgba(255,255,255,0.4),
                        0 0 20px rgba(102,126,234,0.8),
                        0 0 35px rgba(102,126,234,0.6),
                        0 0 40px rgba(102,126,234,0.4);
                }
                to {
                    text-shadow: 
                        0 0 2px rgba(255,255,255,0.9),
                        0 0 5px rgba(255,255,255,0.8),
                        0 0 8px rgba(255,255,255,0.6),
                        0 0 12px rgba(102,126,234,1),
                        0 0 18px rgba(102,126,234,0.8),
                        0 0 25px rgba(102,126,234,0.6);
                }
            }
            
            /* Holographic Navigation */
            .holo-nav {
                position: relative;
                display: flex;
                gap: 20px;
            }
            
            .holo-nav-item {
                position: relative;
                color: rgba(255,255,255,0.8);
                text-decoration: none;
                padding: 10px 20px;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 25px;
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .holo-nav-item::before {
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
            
            .holo-nav-item:hover {
                color: #fff;
                border-color: rgba(255,255,255,0.6);
                background: rgba(255,255,255,0.1);
                box-shadow: 
                    0 0 20px rgba(102,126,234,0.5),
                    inset 0 0 20px rgba(255,255,255,0.1);
                transform: translateY(-2px);
            }
            
            .holo-nav-item:hover::before {
                left: 100%;
            }
            
            .holo-nav-item.active {
                color: #fff;
                background: rgba(102,126,234,0.3);
                border-color: rgba(102,126,234,0.8);
                box-shadow: 
                    0 0 25px rgba(102,126,234,0.6),
                    inset 0 0 25px rgba(102,126,234,0.2);
            }
            
            /* Particle Canvas */
            .particle-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }
            
            /* Cyber Border Effect */
            .cyber-border {
                position: relative;
            }
            
            .cyber-border::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 2px solid transparent;
                border-radius: inherit;
                background: linear-gradient(45deg, #667eea, #764ba2, #667eea) border-box;
                mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                mask-composite: exclude;
                animation: borderRotate 3s linear infinite;
            }
            
            @keyframes borderRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Neon Glow Button */
            .neon-button {
                position: relative;
                background: transparent;
                border: 2px solid #667eea;
                color: #667eea;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }
            
            .neon-button:hover {
                color: #fff;
                background: rgba(102,126,234,0.1);
                box-shadow: 
                    0 0 20px rgba(102,126,234,0.8),
                    inset 0 0 20px rgba(102,126,234,0.1),
                    0 0 40px rgba(102,126,234,0.4);
                text-shadow: 0 0 10px rgba(255,255,255,0.8);
            }
            
            .neon-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 25px;
                background: linear-gradient(45deg, transparent, rgba(102,126,234,0.1), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .neon-button:hover::before {
                opacity: 1;
                animation: neonPulse 1.5s ease-in-out infinite;
            }
            
            @keyframes neonPulse {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 0.3; }
            }
            
            /* Hologram Effect */
            .hologram {
                position: relative;
                background: linear-gradient(45deg, 
                    rgba(255,255,255,0.1) 0%,
                    rgba(255,255,255,0.05) 25%,
                    rgba(255,255,255,0.1) 50%,
                    rgba(255,255,255,0.05) 75%,
                    rgba(255,255,255,0.1) 100%);
                background-size: 20px 20px;
                animation: hologramShift 2s linear infinite;
            }
            
            @keyframes hologramShift {
                0% { background-position: 0 0; }
                100% { background-position: 20px 20px; }
            }
            
            /* Matrix Rain Effect */
            .matrix-rain {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .matrix-char {
                position: absolute;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                opacity: 0.7;
                animation: matrixFall 3s linear infinite;
            }
            
            @keyframes matrixFall {
                0% {
                    transform: translateY(-100vh);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .holo-nav {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .holo-nav-item {
                    padding: 8px 16px;
                    font-size: 14px;
                }
                
                .glow-title {
                    font-size: 1.5em;
                }
                
                .neon-button {
                    padding: 10px 20px;
                    font-size: 14px;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .glow-title,
                .grid-background,
                .cyber-border::after,
                .neon-button::before,
                .hologram,
                .matrix-char {
                    animation: none;
                }
                
                .futuristic-header::before,
                .holo-nav-item::before {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Create particle system
    function createParticle(x, y) {
        return {
            x: x || Math.random() * window.innerWidth,
            y: y || Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            decay: Math.random() * 0.02 + 0.005,
            size: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 70%)`
        };
    }

    // Update particles
    function updateParticles(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Add new particles occasionally
        if (Math.random() < 0.1 && particles.length < config.particleCount) {
            particles.push(createParticle());
        }
    }

    // Create particle canvas
    function createParticleCanvas(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        container.appendChild(canvas);
        
        function animate() {
            updateParticles(canvas, ctx);
            animationFrame = requestAnimationFrame(animate);
        }
        
        animate();
        
        return canvas;
    }

    // Create matrix rain effect
    function createMatrixRain(container) {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-rain';
        
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        function createMatrixChar() {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = chars[Math.floor(Math.random() * chars.length)];
            char.style.left = Math.random() * 100 + '%';
            char.style.animationDelay = Math.random() * 3 + 's';
            char.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            matrixContainer.appendChild(char);
            
            setTimeout(() => {
                if (char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, 5000);
        }
        
        // Create initial characters
        for (let i = 0; i < 20; i++) {
            setTimeout(createMatrixChar, Math.random() * 2000);
        }
        
        // Continue creating characters
        setInterval(createMatrixChar, 200);
        
        container.appendChild(matrixContainer);
    }

    // Add grid background
    function addGridBackground(container) {
        const grid = document.createElement('div');
        grid.className = 'grid-background';
        container.appendChild(grid);
    }

    // Enhance header with futuristic effects
    function enhanceHeader(header) {
        header.classList.add('futuristic-header');
        
        // Add grid background
        addGridBackground(header);
        
        // Add particle system
        createParticleCanvas(header);
        
        // Add matrix rain (optional, can be disabled for performance)
        if (window.innerWidth > 768) {
            createMatrixRain(header);
        }
        
        // Enhance title
        const title = header.querySelector(config.titleSelector);
        if (title) {
            title.classList.add('glow-title');
        }
        
        // Enhance navigation
        const nav = header.querySelector('nav, .nav, .navigation');
        if (nav) {
            nav.classList.add('holo-nav');
            
            const navItems = nav.querySelectorAll(config.navItemSelector);
            navItems.forEach(item => {
                item.classList.add('holo-nav-item');
                
                // Add active state detection
                if (item.href && window.location.href.includes(item.href)) {
                    item.classList.add('active');
                }
            });
        }
        
        // Enhance buttons
        const buttons = header.querySelectorAll('button, .btn, .button');
        buttons.forEach(button => {
            button.classList.add('neon-button');
        });
    }

    // Add mouse interaction effects
    function addMouseEffects(header) {
        header.addEventListener('mousemove', (e) => {
            mousePosition.x = e.clientX;
            mousePosition.y = e.clientY;
            
            // Create particles at mouse position
            if (Math.random() < 0.3) {
                const rect = header.getBoundingClientRect();
                particles.push(createParticle(
                    e.clientX - rect.left,
                    e.clientY - rect.top
                ));
            }
        });
        
        header.addEventListener('click', (e) => {
            // Create burst of particles on click
            const rect = header.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < 10; i++) {
                particles.push(createParticle(x, y));
            }
        });
    }

    // Add scroll effects
    function addScrollEffects(header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
            
            // Parallax effect for grid background
            const grid = header.querySelector('.grid-background');
            if (grid) {
                grid.style.transform = `translateY(${scrollY * 0.5}px)`;
            }
            
            // Fade header on scroll
            const opacity = Math.max(0.3, 1 - (scrollY / window.innerHeight));
            header.style.opacity = opacity;
            
            lastScrollY = scrollY;
        });
    }

    // Add typing effect to titles
    function addTypingEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text[i];
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
            }
        }, 100);
    }

    // Initialize futuristic effects
    function init() {
        addFuturisticStyles();
        
        const headers = document.querySelectorAll(config.headerSelector);
        
        headers.forEach(header => {
            enhanceHeader(header);
            addMouseEffects(header);
            addScrollEffects(header);
            
            // Add typing effect to title
            const title = header.querySelector(config.titleSelector);
            if (title && title.textContent.length < 50) {
                setTimeout(() => addTypingEffect(title), 1000);
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Restart particle systems if needed
            particles = [];
        });
    }

    // Cleanup function
    function cleanup() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        particles = [];
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cleanup();
        } else {
            init();
        }
    });

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

})();