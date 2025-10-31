/**
 * Direct Banner Replacement
 * Replaces placeholder banners with actual content
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // Find placeholder banners
        const placeholderBanners = document.querySelectorAll('.placeholder-banner, .coming-soon-banner, [data-placeholder="banner"]');
        
        placeholderBanners.forEach(function(banner) {
            const bannerType = banner.dataset.type || 'default';
            
            // Create replacement content based on banner type
            let replacementContent = '';
            
            switch(bannerType) {
                case 'hero':
                    replacementContent = `
                        <div class="hero-banner">
                            <div class="hero-content">
                                <h1>Welcome to Thesaurus AI</h1>
                                <p>Enhance your vocabulary with AI-powered learning</p>
                                <a href="/learn" class="btn btn-primary btn-lg">Start Learning</a>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'feature':
                    replacementContent = `
                        <div class="feature-banner">
                            <div class="feature-content">
                                <h2>Advanced Learning Features</h2>
                                <div class="feature-grid">
                                    <div class="feature-item">
                                        <h3>AI-Powered Suggestions</h3>
                                        <p>Get intelligent word recommendations</p>
                                    </div>
                                    <div class="feature-item">
                                        <h3>Interactive Exercises</h3>
                                        <p>Practice with engaging activities</p>
                                    </div>
                                    <div class="feature-item">
                                        <h3>Progress Tracking</h3>
                                        <p>Monitor your learning journey</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'cta':
                    replacementContent = `
                        <div class="cta-banner">
                            <div class="cta-content">
                                <h2>Ready to Expand Your Vocabulary?</h2>
                                <p>Join thousands of learners improving their language skills</p>
                                <div class="cta-buttons">
                                    <a href="/auth/register" class="btn btn-primary">Sign Up Free</a>
                                    <a href="/learn" class="btn btn-outline-primary">Try Demo</a>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                default:
                    replacementContent = `
                        <div class="default-banner">
                            <div class="banner-content">
                                <h2>Thesaurus AI</h2>
                                <p>Your intelligent vocabulary companion</p>
                            </div>
                        </div>
                    `;
            }
            
            // Replace the placeholder with actual content
            banner.innerHTML = replacementContent;
            banner.classList.remove('placeholder-banner', 'coming-soon-banner');
            banner.classList.add('active-banner', bannerType + '-banner');
        });
        
        // Remove any "Coming Soon" text
        const comingSoonElements = document.querySelectorAll('*');
        comingSoonElements.forEach(function(element) {
            if (element.textContent && element.textContent.toLowerCase().includes('coming soon')) {
                if (element.children.length === 0) {
                    // If it's just text, replace it
                    element.textContent = element.textContent.replace(/coming soon/gi, 'Available Now');
                }
            }
        });
        
        // Add banner styles if not present
        if (!document.querySelector('#banner-styles')) {
            const style = document.createElement('style');
            style.id = 'banner-styles';
            style.textContent = `
                .hero-banner {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 60px 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                
                .feature-banner {
                    background: #f8f9fa;
                    padding: 40px 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .feature-item {
                    text-align: center;
                    padding: 20px;
                }
                
                .cta-banner {
                    background: #007bff;
                    color: white;
                    padding: 40px 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                
                .cta-buttons {
                    margin-top: 20px;
                }
                
                .cta-buttons .btn {
                    margin: 0 10px;
                }
                
                .default-banner {
                    background: #6c757d;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 20px 0;
                }
            `;
            document.head.appendChild(style);
        }
    });
    
})();