/**
 * Futuristic Header Effects
 * Adds dynamic, interactive effects to the futuristic header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize digital particles
    initDigitalParticles();
    
    // Initialize holographic effects
    initHolographicEffects();
    
    // Initialize mouse interaction effects
    initMouseInteraction();
});

/**
 * Initialize digital particles with dynamic creation
 */
function initDigitalParticles() {
    const particlesContainer = document.querySelector('.digital-particles');
    if (!particlesContainer) return;
    
    // Clear any existing particles
    particlesContainer.innerHTML = '';
    
    // Create dynamic particles
    const particleCount = 50; // Number of particles
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'dynamic-particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size (1-3px)
        const size = 1 + Math.random() * 2;
        
        // Random opacity
        const opacity = 0.1 + Math.random() * 0.3;
        
        // Random animation delay
        const delay = Math.random() * 5;
        
        // Set styles
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        particle.style.animationDelay = `${delay}s`;
        
        // Add to container
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS for dynamic particles if not already in stylesheet
    if (!document.getElementById('dynamic-particles-style')) {
        const style = document.createElement('style');
        style.id = 'dynamic-particles-style';
        style.textContent = `
            .dynamic-particle {
                position: absolute;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
                animation: particle-pulse 4s infinite alternate ease-in-out;
            }
            
            @keyframes particle-pulse {
                0% {
                    transform: scale(1);
                    opacity: var(--opacity, 0.2);
                }
                50% {
                    transform: scale(1.5);
                    opacity: var(--opacity, 0.4);
                }
                100% {
                    transform: scale(1);
                    opacity: var(--opacity, 0.2);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Initialize holographic effects
 */
function initHolographicEffects() {
    const logo = document.querySelector('.navbar-brand.enhanced-logo');
    const holographicGlow = document.querySelector('.holographic-glow');
    
    if (!logo || !holographicGlow) return;
    
    // Add interactive glow effect on hover
    logo.addEventListener('mouseenter', () => {
        holographicGlow.style.opacity = '0.7';
        holographicGlow.style.animation = 'glow-pulse 2s infinite alternate ease-in-out';
    });
    
    logo.addEventListener('mouseleave', () => {
        holographicGlow.style.opacity = '0';
        holographicGlow.style.animation = 'glow-pulse 5s infinite alternate ease-in-out';
    });
    
    // Add click effect
    logo.addEventListener('click', () => {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'logo-ripple';
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        ripple.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(0, 153, 255, 0.8)';
        ripple.style.zIndex = '5';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'logo-ripple 1s forwards cubic-bezier(0.165, 0.84, 0.44, 1)';
        
        logo.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            logo.removeChild(ripple);
        }, 1000);
    });
    
    // Add ripple animation if not already in stylesheet
    if (!document.getElementById('logo-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'logo-ripple-style';
        style.textContent = `
            @keyframes logo-ripple {
                0% {
                    width: 10px;
                    height: 10px;
                    opacity: 1;
                }
                100% {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Initialize mouse interaction effects
 */
function initMouseInteraction() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    // Add mouse move effect
    header.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to header
        const rect = header.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate position as percentage
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Update particles container with mouse position
        const particles = document.querySelector('.digital-particles');
        if (particles) {
            particles.style.setProperty('--mouse-x', `${xPercent}%`);
            particles.style.setProperty('--mouse-y', `${yPercent}%`);
            
            // Add subtle glow around cursor
            updateCursorGlow(particles, x, y);
        }
    });
}

/**
 * Update cursor glow effect
 */
function updateCursorGlow(container, x, y) {
    // Get or create cursor glow element
    let cursorGlow = container.querySelector('.cursor-glow');
    
    if (!cursorGlow) {
        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        cursorGlow.style.position = 'absolute';
        cursorGlow.style.pointerEvents = 'none';
        cursorGlow.style.borderRadius = '50%';
        cursorGlow.style.background = 'radial-gradient(circle, rgba(0, 153, 255, 0.3) 0%, transparent 70%)';
        cursorGlow.style.width = '100px';
        cursorGlow.style.height = '100px';
        cursorGlow.style.transform = 'translate(-50%, -50%)';
        cursorGlow.style.zIndex = '2';
        cursorGlow.style.opacity = '0';
        cursorGlow.style.transition = 'opacity 0.3s ease';
        container.appendChild(cursorGlow);
        
        // Show after a small delay
        setTimeout(() => {
            cursorGlow.style.opacity = '1';
        }, 100);
    }
    
    // Update position
    cursorGlow.style.left = `${x}px`;
    cursorGlow.style.top = `${y}px`;
}
