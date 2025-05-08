/**
 * Guide Navigation JavaScript
 * Handles navigation and scrolling for guide pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Table of contents navigation
    const tocLinks = document.querySelectorAll('#toc a');
    const sections = document.querySelectorAll('.guide-content section');
    
    // Smooth scroll to section when clicking on TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, `#${targetId}`);
                
                // Highlight active link
                tocLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Highlight active section on scroll
    function highlightActiveSection() {
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Initial highlight
    highlightActiveSection();
    
    // Highlight on scroll
    window.addEventListener('scroll', highlightActiveSection);
    
    // Handle initial hash in URL
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        const targetLink = document.querySelector(`#toc a[href="#${targetId}"]`);
        
        if (targetSection) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                if (targetLink) {
                    tocLinks.forEach(l => l.classList.remove('active'));
                    targetLink.classList.add('active');
                }
            }, 300);
        }
    }
    
    // Make TOC sticky on scroll
    const toc = document.querySelector('#toc');
    if (toc) {
        const tocParent = toc.parentElement;
        const tocParentTop = tocParent.offsetTop;
        
        function updateTocPosition() {
            if (window.scrollY > tocParentTop) {
                tocParent.classList.add('sticky-top');
            } else {
                tocParent.classList.remove('sticky-top');
            }
        }
        
        // Initial position
        updateTocPosition();
        
        // Update on scroll
        window.addEventListener('scroll', updateTocPosition);
    }
    
    // Add active class to TOC links
    document.querySelectorAll('#toc a').forEach(link => {
        link.classList.add('nav-link');
        
        // Add hover effect
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Style TOC links
    document.querySelectorAll('#toc .nav-link').forEach(link => {
        link.style.transition = 'transform 0.2s, color 0.2s';
        link.style.display = 'block';
        link.style.padding = '0.5rem 0';
        link.style.color = '#00e5ff';
        link.style.borderLeft = '2px solid transparent';
        link.style.paddingLeft = '0.5rem';
        
        // Add active style
        if (link.classList.contains('active')) {
            link.style.borderLeftColor = '#00e5ff';
            link.style.fontWeight = 'bold';
        }
    });
});
