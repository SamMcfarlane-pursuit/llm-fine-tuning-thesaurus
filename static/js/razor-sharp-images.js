/**
 * Razor Sharp Images
 * Advanced image sharpening and optimization system
 */

class RazorSharpImages {
    constructor() {
        this.state = {
            processedImages: new Set(),
            canvas: null,
            context: null,
            isProcessing: false,
            config: {
                sharpening: {
                    enabled: true,
                    intensity: 0.5,
                    radius: 1.0,
                    threshold: 0
                },
                optimization: {
                    autoResize: true,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.9,
                    format: 'auto'
                },
                filters: {
                    contrast: 1.0,
                    brightness: 1.0,
                    saturation: 1.0,
                    clarity: 0
                },
                performance: {
                    useWebGL: true,
                    useWorkers: true,
                    batchSize: 5,
                    debounceTime: 100
                }
            },
            workers: [],
            webglSupported: false
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.detectCapabilities();
        this.setupWorkers();
        this.processExistingImages();
        this.setupImageObserver();
        this.bindEvents();
    }

    setupCanvas() {
        this.state.canvas = document.createElement('canvas');
        this.state.context = this.state.canvas.getContext('2d');
        
        // Try to get WebGL context for advanced processing
        try {
            const webglCanvas = document.createElement('canvas');
            const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
            this.state.webglSupported = !!gl;
        } catch (e) {
            this.state.webglSupported = false;
        }
    }

    detectCapabilities() {
        // Check for various browser capabilities
        this.state.capabilities = {
            canvas: !!this.state.context,
            webgl: this.state.webglSupported,
            workers: typeof Worker !== 'undefined',
            offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
            imageData: typeof ImageData !== 'undefined',
            createImageBitmap: typeof createImageBitmap !== 'undefined'
        };
    }

    setupWorkers() {
        if (!this.state.capabilities.workers || !this.state.config.performance.useWorkers) {
            return;
        }

        // Create worker for image processing
        const workerCode = `
            self.onmessage = function(e) {
                const { imageData, config } = e.data;
                const processed = processImageData(imageData, config);
                self.postMessage({ processed });
            };
            
            function processImageData(imageData, config) {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                
                // Apply sharpening filter
                if (config.sharpening.enabled) {
                    applySharpeningFilter(data, width, height, config.sharpening);
                }
                
                // Apply other filters
                applyColorFilters(data, config.filters);
                
                return imageData;
            }
            
            function applySharpeningFilter(data, width, height, config) {
                const intensity = config.intensity;
                const kernel = [
                    0, -intensity, 0,
                    -intensity, 1 + 4 * intensity, -intensity,
                    0, -intensity, 0
                ];
                
                const output = new Uint8ClampedArray(data);
                
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        for (let c = 0; c < 3; c++) {
                            let sum = 0;
                            for (let ky = -1; ky <= 1; ky++) {
                                for (let kx = -1; kx <= 1; kx++) {
                                    const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                                    sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                                }
                            }
                            const idx = (y * width + x) * 4 + c;
                            output[idx] = Math.max(0, Math.min(255, sum));
                        }
                    }
                }
                
                data.set(output);
            }
            
            function applyColorFilters(data, filters) {
                const { contrast, brightness, saturation } = filters;
                
                for (let i = 0; i < data.length; i += 4) {
                    // Apply brightness and contrast
                    data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));
                    data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness));
                    data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness));
                    
                    // Apply saturation
                    if (saturation !== 1.0) {
                        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                        data[i] = gray + saturation * (data[i] - gray);
                        data[i + 1] = gray + saturation * (data[i + 1] - gray);
                        data[i + 2] = gray + saturation * (data[i + 2] - gray);
                    }
                }
            }
        `;

        try {
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            this.state.workers.push(new Worker(workerUrl));
        } catch (e) {
            console.warn('Could not create image processing worker:', e);
        }
    }

    processExistingImages() {
        const images = document.querySelectorAll('img');
        this.processImageBatch(Array.from(images));
    }

    processImageBatch(images) {
        if (this.state.isProcessing) return;
        
        const batchSize = this.state.config.performance.batchSize;
        const batches = [];
        
        for (let i = 0; i < images.length; i += batchSize) {
            batches.push(images.slice(i, i + batchSize));
        }
        
        this.processBatches(batches);
    }

    async processBatches(batches) {
        this.state.isProcessing = true;
        
        for (const batch of batches) {
            await Promise.all(batch.map(img => this.processImage(img)));
            // Small delay between batches to prevent blocking
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.state.isProcessing = false;
    }

    async processImage(img) {
        if (!img || this.state.processedImages.has(img) || !img.complete || !img.naturalWidth) {
            return;
        }

        try {
            // Mark as processed early to prevent duplicate processing
            this.state.processedImages.add(img);
            
            // Check if image needs processing
            if (!this.shouldProcessImage(img)) {
                return;
            }

            // Create optimized version
            const optimizedDataUrl = await this.createOptimizedImage(img);
            
            if (optimizedDataUrl) {
                // Replace image source with optimized version
                img.src = optimizedDataUrl;
                img.classList.add('razor-sharp-processed');
                
                // Add loading states
                img.style.transition = 'opacity 0.3s ease';
                img.style.opacity = '0';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
            }
        } catch (error) {
            console.warn('Error processing image:', error);
            this.state.processedImages.delete(img);
        }
    }

    shouldProcessImage(img) {
        // Skip if image is too small
        if (img.naturalWidth < 100 || img.naturalHeight < 100) {
            return false;
        }

        // Skip if image is already optimized
        if (img.classList.contains('razor-sharp-processed')) {
            return false;
        }

        // Skip if image source is a data URL (already processed)
        if (img.src.startsWith('data:')) {
            return false;
        }

        // Skip SVG images
        if (img.src.includes('.svg') || img.src.includes('svg+xml')) {
            return false;
        }

        return true;
    }

    async createOptimizedImage(img) {
        const { canvas, context } = this.state;
        
        // Calculate optimal dimensions
        const { width, height } = this.calculateOptimalDimensions(img);
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw image to canvas
        context.clearRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        
        // Get image data for processing
        const imageData = context.getImageData(0, 0, width, height);
        
        // Process image data
        await this.processImageData(imageData);
        
        // Put processed data back to canvas
        context.putImageData(imageData, 0, 0);
        
        // Convert to optimized format
        return this.canvasToOptimizedDataUrl(canvas);
    }

    calculateOptimalDimensions(img) {
        const { maxWidth, maxHeight } = this.state.config.optimization;
        let { naturalWidth: width, naturalHeight: height } = img;
        
        // Calculate scale factor
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
        
        return {
            width: Math.round(width * scale),
            height: Math.round(height * scale)
        };
    }

    async processImageData(imageData) {
        if (this.state.workers.length > 0 && this.state.config.performance.useWorkers) {
            return this.processWithWorker(imageData);
        } else {
            return this.processOnMainThread(imageData);
        }
    }

    processWithWorker(imageData) {
        return new Promise((resolve) => {
            const worker = this.state.workers[0];
            
            worker.onmessage = (e) => {
                resolve(e.data.processed);
            };
            
            worker.postMessage({
                imageData,
                config: this.state.config
            });
        });
    }

    processOnMainThread(imageData) {
        const data = imageData.data;
        
        // Apply sharpening
        if (this.state.config.sharpening.enabled) {
            this.applySharpeningFilter(data, imageData.width, imageData.height);
        }
        
        // Apply color filters
        this.applyColorFilters(data);
        
        return imageData;
    }

    applySharpeningFilter(data, width, height) {
        const intensity = this.state.config.sharpening.intensity;
        const kernel = [
            0, -intensity, 0,
            -intensity, 1 + 4 * intensity, -intensity,
            0, -intensity, 0
        ];
        
        const output = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    output[idx] = Math.max(0, Math.min(255, sum));
                }
            }
        }
        
        data.set(output);
    }

    applyColorFilters(data) {
        const { contrast, brightness, saturation } = this.state.config.filters;
        
        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness and contrast
            data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));
            data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness));
            data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness));
            
            // Apply saturation
            if (saturation !== 1.0) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = gray + saturation * (data[i] - gray);
                data[i + 1] = gray + saturation * (data[i + 1] - gray);
                data[i + 2] = gray + saturation * (data[i + 2] - gray);
            }
        }
    }

    canvasToOptimizedDataUrl(canvas) {
        const { quality, format } = this.state.config.optimization;
        
        // Determine optimal format
        let mimeType = 'image/jpeg';
        if (format === 'auto') {
            // Use WebP if supported, otherwise JPEG
            mimeType = this.supportsWebP() ? 'image/webp' : 'image/jpeg';
        } else if (format === 'png') {
            mimeType = 'image/png';
        }
        
        return canvas.toDataURL(mimeType, quality);
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    setupImageObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                const imagesToProcess = [];
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target.tagName === 'IMG') {
                        imagesToProcess.push(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
                
                if (imagesToProcess.length > 0) {
                    this.processImageBatch(imagesToProcess);
                }
            }, { rootMargin: '50px' });

            // Observe all images
            document.querySelectorAll('img').forEach(img => {
                if (!this.state.processedImages.has(img)) {
                    observer.observe(img);
                }
            });
        }
    }

    bindEvents() {
        // Monitor for new images added to the DOM
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                const newImages = [];
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'IMG') {
                                newImages.push(node);
                            } else {
                                const images = node.querySelectorAll('img');
                                newImages.push(...images);
                            }
                        }
                    });
                });
                
                if (newImages.length > 0) {
                    this.debounce(() => {
                        this.processImageBatch(newImages);
                    }, this.state.config.performance.debounceTime)();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Handle window resize for responsive images
        window.addEventListener('resize', this.debounce(() => {
            this.reprocessVisibleImages();
        }, 250));
    }

    reprocessVisibleImages() {
        const visibleImages = Array.from(document.querySelectorAll('img')).filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });
        
        // Clear processed status for visible images to allow reprocessing
        visibleImages.forEach(img => {
            this.state.processedImages.delete(img);
        });
        
        this.processImageBatch(visibleImages);
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
    setConfig(newConfig) {
        this.state.config = { ...this.state.config, ...newConfig };
    }

    setSharpeningIntensity(intensity) {
        this.state.config.sharpening.intensity = Math.max(0, Math.min(2, intensity));
    }

    setQuality(quality) {
        this.state.config.optimization.quality = Math.max(0.1, Math.min(1, quality));
    }

    processImageManually(img) {
        this.state.processedImages.delete(img);
        return this.processImage(img);
    }

    reprocessAllImages() {
        this.state.processedImages.clear();
        this.processExistingImages();
    }

    getStats() {
        return {
            processedImages: this.state.processedImages.size,
            isProcessing: this.state.isProcessing,
            capabilities: this.state.capabilities,
            config: this.state.config
        };
    }

    destroy() {
        // Clean up workers
        this.state.workers.forEach(worker => worker.terminate());
        this.state.workers = [];
        
        // Clear processed images
        this.state.processedImages.clear();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.razorSharpImages = new RazorSharpImages();
    });
} else {
    window.razorSharpImages = new RazorSharpImages();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RazorSharpImages;
}