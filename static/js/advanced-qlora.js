/**
 * Advanced QLoRA Implementation
 * This script provides a more detailed implementation of QLoRA fine-tuning
 * with interactive elements for learning and experimentation.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the advanced QLoRA page
    const qloraContainer = document.getElementById('advanced-qlora-container');
    if (!qloraContainer) return;

    // Initialize the interactive QLoRA demo
    initQLoRADemo();

    // Add event listeners for parameter sliders
    setupParameterSliders();

    // Initialize the memory usage calculator
    initMemoryCalculator();
});

/**
 * Initialize the interactive QLoRA demo
 */
function initQLoRADemo() {
    // Create the model architecture visualization
    createModelVisualization();

    // Add animation for quantization process
    animateQuantizationProcess();
}

/**
 * Create a visual representation of the model architecture with QLoRA
 */
function createModelVisualization() {
    const canvas = document.getElementById('model-architecture-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw model layers
    drawModelLayers(ctx, width, height);

    // Draw LoRA adapters
    drawLoRAAdapters(ctx, width, height);

    // Add labels
    addArchitectureLabels(ctx, width, height);
}

/**
 * Draw the base model layers
 */
function drawModelLayers(ctx, width, height) {
    // Base model settings
    const layerCount = 12;
    const layerWidth = width * 0.6;
    const layerHeight = height / (layerCount + 2);
    const startX = (width - layerWidth) / 2;

    // Draw each layer
    for (let i = 0; i < layerCount; i++) {
        const y = (i + 1) * layerHeight;

        // Layer background - darker for 4-bit quantized layers
        const gradient = ctx.createLinearGradient(startX, y, startX + layerWidth, y);
        gradient.addColorStop(0, 'rgba(18, 18, 18, 0.9)');
        gradient.addColorStop(1, 'rgba(30, 30, 30, 0.9)');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(0, 198, 255, 0.3)';
        ctx.lineWidth = 1;

        // Draw rounded rectangle
        roundRect(ctx, startX, y, layerWidth, layerHeight * 0.7, 5, true, true);

        // Add quantization indicator
        ctx.fillStyle = 'rgba(0, 198, 255, 0.7)';
        ctx.font = '10px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('4-bit Quantized', startX + layerWidth / 2, y + layerHeight * 0.4);
    }
}

/**
 * Draw the LoRA adapter modules
 */
function drawLoRAAdapters(ctx, width, height) {
    // LoRA adapter settings
    const layerCount = 12;
    const mainLayerWidth = width * 0.6;
    const layerHeight = height / (layerCount + 2);
    const mainStartX = (width - mainLayerWidth) / 2;
    const adapterWidth = width * 0.15;
    const adapterStartX = mainStartX + mainLayerWidth + 20;

    // Draw each adapter
    for (let i = 0; i < layerCount; i++) {
        const y = (i + 1) * layerHeight;

        // Only add adapters to certain layers (attention layers)
        if (i % 2 === 0) {
            // Adapter background
            const gradient = ctx.createLinearGradient(adapterStartX, y, adapterStartX + adapterWidth, y);
            gradient.addColorStop(0, 'rgba(94, 23, 235, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 102, 255, 0.7)');

            ctx.fillStyle = gradient;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;

            // Draw rounded rectangle
            roundRect(ctx, adapterStartX, y, adapterWidth, layerHeight * 0.7, 5, true, true);

            // Add adapter label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '10px Roboto';
            ctx.textAlign = 'center';
            ctx.fillText('LoRA (16-bit)', adapterStartX + adapterWidth / 2, y + layerHeight * 0.4);

            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(mainStartX + mainLayerWidth, y + layerHeight * 0.35);
            ctx.lineTo(adapterStartX, y + layerHeight * 0.35);
            ctx.strokeStyle = 'rgba(0, 198, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

/**
 * Add labels to the architecture visualization
 */
function addArchitectureLabels(ctx, width, height) {
    // Base model label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('Base Model (4-bit Frozen)', width / 2, 20);

    // LoRA adapters label
    const mainLayerWidth = width * 0.6;
    const mainStartX = (width - mainLayerWidth) / 2;
    const adapterWidth = width * 0.15;
    const adapterStartX = mainStartX + mainLayerWidth + 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('LoRA Adapters', adapterStartX + adapterWidth / 2, 20);

    // Add legend
    const legendY = height - 40;

    // 4-bit quantized legend
    ctx.fillStyle = 'rgba(18, 18, 18, 0.9)';
    roundRect(ctx, 20, legendY, 20, 20, 3, true, false);
    ctx.strokeStyle = 'rgba(0, 198, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'left';
    ctx.fillText('4-bit Quantized (Frozen)', 50, legendY + 15);

    // LoRA adapter legend
    const gradient = ctx.createLinearGradient(width - 150, legendY, width - 130, legendY);
    gradient.addColorStop(0, 'rgba(94, 23, 235, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 102, 255, 0.7)');

    ctx.fillStyle = gradient;
    roundRect(ctx, width - 150, legendY, 20, 20, 3, true, false);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'left';
    ctx.fillText('16-bit LoRA (Trainable)', width - 120, legendY + 15);
}

/**
 * Animate the quantization process
 */
function animateQuantizationProcess() {
    const canvas = document.getElementById('quantization-process-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Animation variables
    let frame = 0;
    const totalFrames = 120;

    // Animation function
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate animation progress
        const progress = frame / totalFrames;

        // Draw the quantization process
        drawQuantizationStep(ctx, width, height, progress);

        // Increment frame or reset
        frame = (frame + 1) % totalFrames;

        // Continue animation
        requestAnimationFrame(animate);
    }

    // Start animation
    animate();
}

/**
 * Draw a single frame of the quantization animation
 */
function drawQuantizationStep(ctx, width, height, progress) {
    // Draw original weights (32-bit)
    const startX = 50;
    const endX = width - 50;
    const midX = startX + (endX - startX) * progress;
    const topY = 50;
    const bottomY = height - 50;
    const midY = height / 2;

    // Draw title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('Quantization Process Visualization', width / 2, 20);

    // Draw 32-bit representation (more dots, higher precision)
    ctx.fillStyle = 'rgba(0, 102, 255, 0.7)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('32-bit Floating Point', startX, topY - 15);

    // Draw 32-bit weight matrix
    const dotSize32 = 3;
    const dotSpacing32 = 6;
    const matrixWidth32 = 20;
    const matrixHeight32 = 20;

    for (let i = 0; i < matrixWidth32; i++) {
        for (let j = 0; j < matrixHeight32; j++) {
            const x = startX + i * dotSpacing32;
            const y = topY + j * dotSpacing32;

            // Only draw dots that haven't been "quantized" yet
            if (x < midX) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize32, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 102, 255, ${0.5 + Math.random() * 0.5})`;
                ctx.fill();
            }
        }
    }

    // Draw 4-bit representation (fewer dots, lower precision)
    ctx.fillStyle = 'rgba(94, 23, 235, 0.7)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('4-bit Quantized', endX, bottomY + 25);

    // Draw 4-bit weight matrix
    const dotSize4 = 6;
    const dotSpacing4 = 24;
    const matrixWidth4 = 5;
    const matrixHeight4 = 5;

    for (let i = 0; i < matrixWidth4; i++) {
        for (let j = 0; j < matrixHeight4; j++) {
            const x = endX - (matrixWidth4 - i) * dotSpacing4;
            const y = bottomY - (matrixHeight4 - j) * dotSpacing4;

            // Only draw dots that have been "quantized"
            if (x <= midX) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(94, 23, 235, 0.7)';
                ctx.fill();
            }
        }
    }

    // Draw arrow showing the process
    ctx.beginPath();
    ctx.moveTo(startX, midY);
    ctx.lineTo(endX, midY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, midY);
    ctx.lineTo(endX - 10, midY - 5);
    ctx.lineTo(endX - 10, midY + 5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw quantization point
    ctx.beginPath();
    ctx.arc(midX, midY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 198, 255, 0.7)';
    ctx.fill();

    // Add labels for the process
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('Higher Precision', startX, bottomY + 25);
    ctx.fillText('Lower Memory', endX, topY - 15);

    // Add memory savings indicator
    const memorySavings = Math.round(progress * 87.5); // 4-bit is 87.5% less memory than 32-bit
    ctx.fillStyle = 'rgba(0, 198, 255, 0.9)';
    ctx.font = 'bold 16px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(`Memory Savings: ${memorySavings}%`, width / 2, height - 15);
}

/**
 * Set up the interactive parameter sliders
 */
function setupParameterSliders() {
    // Get all sliders
    const sliders = document.querySelectorAll('.parameter-slider');
    if (!sliders.length) return;

    // Add event listeners to each slider
    sliders.forEach(slider => {
        const output = document.getElementById(slider.dataset.output);
        if (!output) return;

        // Update output value when slider changes
        slider.addEventListener('input', function() {
            output.textContent = this.value;

            // If this is a memory-related parameter, update the memory calculator
            if (this.dataset.memoryParam) {
                updateMemoryUsage();
            }
        });

        // Set initial value
        output.textContent = slider.value;
    });
}

/**
 * Initialize the memory usage calculator
 */
function initMemoryCalculator() {
    const calculator = document.getElementById('memory-calculator');
    if (!calculator) return;

    // Initial calculation
    updateMemoryUsage();

    // Add event listener to the model size dropdown
    const modelSizeSelect = document.getElementById('model-size');
    if (modelSizeSelect) {
        modelSizeSelect.addEventListener('change', updateMemoryUsage);
    }
}

/**
 * Update the memory usage calculation based on parameters
 */
function updateMemoryUsage() {
    // Get parameter values
    const modelSizeSelect = document.getElementById('model-size');
    const rankSlider = document.getElementById('lora-rank');
    const alphaSlider = document.getElementById('lora-alpha');
    const bitsSlider = document.getElementById('quantization-bits');

    if (!modelSizeSelect || !rankSlider || !alphaSlider || !bitsSlider) return;

    // Get model size in billions of parameters
    const modelSizeOptions = {
        'small': 0.125,
        'medium': 0.35,
        'large': 1.3,
        'xl': 2.7,
        'xxl': 6.7,
        'xxxl': 13
    };

    const modelSize = modelSizeOptions[modelSizeSelect.value] || 1.3;
    const rank = parseInt(rankSlider.value);
    const bits = parseInt(bitsSlider.value);

    // Calculate memory usage
    // Base model memory (parameters * bits / 8 bytes)
    const baseModelMemoryGB = (modelSize * 1000000000 * 32) / 8 / 1000000000;

    // Quantized model memory
    const quantizedModelMemoryGB = (modelSize * 1000000000 * bits) / 8 / 1000000000;

    // LoRA memory (much smaller, depends on rank)
    // Assuming LoRA is applied to about 40% of the parameters
    const loraParamCount = modelSize * 1000000000 * 0.4;
    const loraMemoryGB = (loraParamCount * rank * 2 * 16) / 8 / 1000000000;

    // Total memory for QLoRA
    const qloraMemoryGB = quantizedModelMemoryGB + loraMemoryGB;

    // Memory savings
    const memorySavingsPercent = ((baseModelMemoryGB - qloraMemoryGB) / baseModelMemoryGB) * 100;

    // Update the UI
    const baseMemoryElement = document.getElementById('base-memory');
    const qloraMemoryElement = document.getElementById('qlora-memory');
    const memorySavingsElement = document.getElementById('memory-savings');

    if (baseMemoryElement) baseMemoryElement.textContent = baseModelMemoryGB.toFixed(2);
    if (qloraMemoryElement) qloraMemoryElement.textContent = qloraMemoryGB.toFixed(2);
    if (memorySavingsElement) memorySavingsElement.textContent = memorySavingsPercent.toFixed(1);

    // Update the memory bar visualization
    updateMemoryBar(baseModelMemoryGB, qloraMemoryGB);
}

/**
 * Update the memory usage bar visualization
 */
function updateMemoryBar(baseMemory, qloraMemory) {
    const memoryBar = document.getElementById('memory-bar');
    const qloraBar = document.getElementById('qlora-memory-bar');

    if (!memoryBar || !qloraBar) return;

    // Calculate the percentage width for the QLoRA bar
    const percentage = (qloraMemory / baseMemory) * 100;

    // Update the width
    qloraBar.style.width = `${percentage}%`;

    // Update color based on memory savings
    if (percentage < 25) {
        qloraBar.className = 'memory-bar-segment bg-success';
    } else if (percentage < 50) {
        qloraBar.className = 'memory-bar-segment bg-info';
    } else if (percentage < 75) {
        qloraBar.className = 'memory-bar-segment bg-warning';
    } else {
        qloraBar.className = 'memory-bar-segment bg-danger';
    }
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fill) {
        ctx.fill();
    }

    if (stroke) {
        ctx.stroke();
    }
}
