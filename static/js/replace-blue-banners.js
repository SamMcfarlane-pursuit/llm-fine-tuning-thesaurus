/**
 * Replace Blue Banners
 * Replaces generic blue banners with more engaging, branded content
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // Find blue banners and generic alert banners
        const blueBanners = document.querySelectorAll('.alert-primary, .bg-primary, .banner-blue, [style*="background-color: blue"], [style*="background: blue"]');
        
        blueBanners.forEach(function(banner, index) {
            // Skip if banner already has custom content
            if (banner.classList.contains('custom-banner') || banner.dataset.customized) {
                return;
            }
            
            const currentContent = banner.textContent.trim();
            
            // Determine banner type based on content or context
            let bannerType = 'info';
            let newContent = '';
            
            if (currentContent.toLowerCase().includes('welcome') || banner.closest('.hero')) {
                bannerType = 'welcome';
                newContent = `
                    <div class="welcome-banner-content">
                        <h3><i class="fas fa-rocket"></i> Welcome to Thesaurus AI!</h3>
                        <p>Discover the power of intelligent vocabulary building with our AI-driven platform.</p>
                        <a href="/learn" class="btn btn-light btn-sm">Get Started</a>
                    </div>
                `;
            } else if (currentContent.toLowerCase().includes('feature') || currentContent.toLowerCase().includes('new')) {
                bannerType = 'feature';
                newContent = `
                    <div class="feature-banner-content">
                        <h4><i class="fas fa-star"></i> New Feature Available!</h4>
                        <p>Experience enhanced learning with our latest AI improvements.</p>
                        <a href="/tutorials" class="btn btn-outline-light btn-sm">Learn More</a>
                    </div>
                `;
            } else if (currentContent.toLowerCase().includes('update') || currentContent.toLowerCase().includes('news')) {
                bannerType = 'update';
                newContent = `
                    <div class="update-banner-content">
                        <h4><i class="fas fa-bell"></i> Platform Updates</h4>
                        <p>Stay informed about the latest improvements and features.</p>
                        <button class="btn btn-outline-light btn-sm" onclick="this.parentElement.parentElement.style.display='none'">Dismiss</button>
                    </div>
                `;
            } else {
                bannerType = 'info';
                newContent = `
                    <div class="info-banner-content">
                        <h4><i class="fas fa-info-circle"></i> Thesaurus AI</h4>
                        <p>Enhance your vocabulary with intelligent word suggestions and interactive learning.</p>
                    </div>
                `;
            }
            
            // Apply new styling and content
            banner.innerHTML = newContent;
            banner.classList.remove('alert-primary', 'bg-primary');
            banner.classList.add('custom-banner', bannerType + '-banner');
            banner.dataset.customized = 'true';
        });
        
        // Replace any remaining generic blue backgrounds
        const genericBlueElements = document.querySelectorAll('[style*="background: #007bff"], [style*="background-color: #007bff"]');
        
        genericBlueElements.forEach(function(element) {
            if (!element.dataset.customized) {
                // Apply a gradient instead of solid blue
                element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                element.dataset.customized = 'true';
            }
        });
        
        // Add custom banner styles
        if (!document.querySelector('#custom-banner-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-banner-styles';
            style.textContent = `
                .custom-banner {
                    border-radius: 8px;
                    padding: 20px;
                    margin: 15px 0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .welcome-banner {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .feature-banner {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }
                
                .update-banner {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                }
                
                .info-banner {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    color: white;
                }
                
                .custom-banner h3, .custom-banner h4 {
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                
                .custom-banner p {
                    margin-bottom: 15px;
                    opacity: 0.9;
                }
                
                .custom-banner .btn {
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }
                
                .custom-banner .btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                }
                
                .custom-banner i {
                    margin-right: 8px;
                }
                
                @media (max-width: 768px) {
                    .custom-banner {
                        padding: 15px;
                        margin: 10px 0;
                    }
                    
                    .custom-banner h3, .custom-banner h4 {
                        font-size: 1.1em;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    });
    
})();