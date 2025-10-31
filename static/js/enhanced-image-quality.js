/**
 * Enhanced Image Quality Optimizer
 * Provides advanced image quality optimization with adaptive settings
 */

class EnhancedImageQuality {
    constructor() {
        this.state = {
            formatSupport: {
                webp: false,
                avif: false,
                jxl: false
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            connectionSpeed: this.getConnectionSpeed(),
            qualitySettings: {
                high: { jpeg: 95, webp: 90, avif: 85 },
                medium: { jpeg: 85, webp: 80, avif: 75 },
                low: { jpeg: 75, webp: 70, avif: 65 }
            },
            adaptiveQuality: true,
            performanceMode: false
        };
        
        this.init();
    }

    init() {
        this.detectFormatSupport();
        this.setupPerformanceMonitoring();
        this.optimizeExistingImages();
        this.setupImageObserver();
        this.bindEvents();
    }

    detectFormatSupport() {
        // Test WebP support
        const webpImg = new Image();
        webpImg.onload = webpImg.onerror = () => {
            this.state.formatSupport.webp = webpImg.height === 2;
        };
        webpImg.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

        // Test AVIF support
        const avifImg = new Image();
        avifImg.onload = avifImg.onerror = () => {
            this.state.formatSupport.avif = avifImg.height === 2;
        };
        avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';

        // Test JPEG XL support (simplified)
        this.state.formatSupport.jxl = false; // Simplified - most browsers don't support JXL yet
    }

    getConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                switch (connection.effectiveType) {
                    case 'slow-2g':
                    case '2g':
                        return 'slow';
                    case '3g':
                        return 'medium';
                    case '4g':
                    default:
                        return 'fast';
                }
            }
        }
        return 'medium';
    }

    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        if (entry.startTime > 2500) {
                            this.state.performanceMode = true;
                        }
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    optimizeExistingImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.optimizeImage(img));
    }

    setupImageObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadOptimizedImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                observer.observe(img);
            });
        }
    }

    optimizeImage(img) {
        if (img.dataset.optimized) return;

        const quality = this.getOptimalQuality();
        const format = this.getBestFormat();
        
        // Add loading optimization
        if (!img.loading) {
            img.loading = 'lazy';
        }

        // Add decode hint
        if (!img.decoding) {
            img.decoding = 'async';
        }

        // Optimize for retina displays
        if (this.state.devicePixelRatio > 1) {
            this.handleRetinaDisplay(img);
        }

        img.dataset.optimized = 'true';
    }

    getOptimalQuality() {
        if (this.state.performanceMode) return 'low';
        
        switch (this.state.connectionSpeed) {
            case 'slow': return 'low';
            case 'medium': return 'medium';
            case 'fast': return 'high';
            default: return 'medium';
        }
    }

    getBestFormat() {
        if (this.state.formatSupport.avif) return 'avif';
        if (this.state.formatSupport.webp) return 'webp';
        return 'jpeg';
    }

    handleRetinaDisplay(img) {
        const srcset = img.getAttribute('srcset');
        if (!srcset && img.src) {
            const src = img.src;
            const extension = src.split('.').pop();
            const baseName = src.replace(`.${extension}`, '');
            
            // Create 2x version if available
            const retinaUrl = `${baseName}@2x.${extension}`;
            img.srcset = `${src} 1x, ${retinaUrl} 2x`;
        }
    }

    loadOptimizedImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        const optimizedSrc = this.generateOptimizedUrl(src);
        
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = optimizedSrc;
            img.classList.add('loaded');
        };
        tempImg.onerror = () => {
            img.src = src; // Fallback to original
            img.classList.add('error');
        };
        tempImg.src = optimizedSrc;
    }

    generateOptimizedUrl(src) {
        const quality = this.getOptimalQuality();
        const format = this.getBestFormat();
        
        // This would typically integrate with an image optimization service
        // For now, return the original URL
        return src;
    }

    bindEvents() {
        // Monitor for new images added to the DOM
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                            images.forEach(img => this.optimizeImage(img));
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Handle window resize for responsive images
        window.addEventListener('resize', this.debounce(() => {
            this.optimizeExistingImages();
        }, 250));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    setQualityMode(mode) {
        if (['low', 'medium', 'high'].includes(mode)) {
            this.state.adaptiveQuality = false;
            this.currentQuality = mode;
            this.optimizeExistingImages();
        }
    }

    enableAdaptiveQuality() {
        this.state.adaptiveQuality = true;
        this.optimizeExistingImages();
    }

    getStats() {
        return {
            formatSupport: this.state.formatSupport,
            connectionSpeed: this.state.connectionSpeed,
            performanceMode: this.state.performanceMode,
            devicePixelRatio: this.state.devicePixelRatio
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedImageQuality = new EnhancedImageQuality();
    });
} else {
    window.enhancedImageQuality = new EnhancedImageQuality();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedImageQuality;
}