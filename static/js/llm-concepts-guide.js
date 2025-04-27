/**
 * LLM Concepts Guide - Provides detailed explanations of key LLM concepts
 * This script adds interactive tooltips and concept explanations throughout the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Comprehensive LLM concepts database
    const llmConcepts = {
        // Core LLM Concepts
        'llm': {
            title: 'Large Language Model (LLM)',
            short: 'Neural network trained on vast text data to generate human-like text',
            full: `<p>A Large Language Model (LLM) is a type of artificial intelligence model designed to understand, generate, and manipulate human language. These models are built using deep neural networks with billions or even trillions of parameters, trained on massive datasets of text from the internet, books, and other sources.</p>
                  <p>Key characteristics of LLMs:</p>
                  <ul>
                    <li><strong>Scale</strong>: Modern LLMs contain billions to trillions of parameters</li>
                    <li><strong>Architecture</strong>: Typically based on the Transformer architecture with attention mechanisms</li>
                    <li><strong>Training</strong>: Pre-trained on vast corpora of text using self-supervised learning</li>
                    <li><strong>Capabilities</strong>: Text generation, translation, summarization, question answering, and more</li>
                  </ul>
                  <p>Examples include GPT-4, LLaMA, Claude, PaLM, and Gemini.</p>`,
            links: [
                { text: 'Transformer Architecture Paper', url: 'https://arxiv.org/abs/1706.03762' },
                { text: 'Scaling Laws for Neural Language Models', url: 'https://arxiv.org/abs/2001.08361' }
            ]
        },
        'fine-tuning': {
            title: 'Fine-Tuning',
            short: 'Process of adapting a pre-trained model to specific tasks or domains',
            full: `<p>Fine-tuning is the process of taking a pre-trained language model and further training it on a smaller, more specific dataset to adapt it for particular tasks, domains, or to align with specific values.</p>
                  <p>Key aspects of fine-tuning:</p>
                  <ul>
                    <li><strong>Transfer Learning</strong>: Leverages knowledge from pre-training on a broad dataset</li>
                    <li><strong>Task Adaptation</strong>: Customizes the model for specific downstream tasks</li>
                    <li><strong>Data Efficiency</strong>: Requires much less data than pre-training from scratch</li>
                    <li><strong>Parameter Updates</strong>: Can involve updating all parameters (full fine-tuning) or a subset (parameter-efficient fine-tuning)</li>
                  </ul>
                  <p>Fine-tuning can dramatically improve performance on specific tasks while preserving the general knowledge acquired during pre-training.</p>`,
            links: [
                { text: 'Fine-tuning Large Language Models', url: 'https://huggingface.co/blog/how-to-train' },
                { text: 'Instruction Fine-tuning', url: 'https://arxiv.org/abs/2203.02155' }
            ]
        },
        
        // Parameter-Efficient Fine-Tuning Methods
        'lora': {
            title: 'LoRA (Low-Rank Adaptation)',
            short: 'Parameter-efficient fine-tuning method using low-rank matrix decomposition',
            full: `<p>LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that significantly reduces the number of trainable parameters by adding small, trainable "adapter" matrices to the existing weights of a pre-trained model.</p>
                  <p>Key features of LoRA:</p>
                  <ul>
                    <li><strong>Low-Rank Decomposition</strong>: Represents weight updates as products of low-rank matrices</li>
                    <li><strong>Memory Efficiency</strong>: Reduces memory requirements by up to 10x compared to full fine-tuning</li>
                    <li><strong>Performance</strong>: Achieves comparable results to full fine-tuning</li>
                    <li><strong>Mathematical Formulation</strong>: For a weight matrix W, LoRA adds ΔW = BA, where B and A are low-rank matrices</li>
                    <li><strong>Adaptability</strong>: Can be applied to specific layers or components of the model</li>
                  </ul>
                  <p>LoRA has become one of the most popular methods for fine-tuning large language models due to its efficiency and effectiveness.</p>`,
            links: [
                { text: 'LoRA Paper', url: 'https://arxiv.org/abs/2106.09685' },
                { text: 'LoRA Implementation Guide', url: 'https://huggingface.co/docs/peft/conceptual_guides/lora' }
            ]
        },
        'qlora': {
            title: 'QLoRA (Quantized Low-Rank Adaptation)',
            short: 'Combines 4-bit quantization with LoRA for extreme memory efficiency',
            full: `<p>QLoRA (Quantized Low-Rank Adaptation) is an advanced parameter-efficient fine-tuning method that combines 4-bit quantization with LoRA to enable fine-tuning of very large language models on consumer hardware.</p>
                  <p>Key innovations in QLoRA:</p>
                  <ul>
                    <li><strong>4-bit Quantization</strong>: Stores model weights in 4-bit precision instead of 16-bit or 32-bit</li>
                    <li><strong>Double Quantization</strong>: Quantizes the quantization constants for additional memory savings</li>
                    <li><strong>NormalFloat (NF4)</strong>: A 4-bit data type optimized for normally distributed weights</li>
                    <li><strong>Paged Optimizers</strong>: Manages memory more efficiently during training</li>
                    <li><strong>Extreme Memory Efficiency</strong>: Enables fine-tuning of 65B+ parameter models on a single GPU</li>
                  </ul>
                  <p>QLoRA makes it possible to fine-tune models that would otherwise be too large for most hardware, democratizing access to state-of-the-art LLMs.</p>`,
            links: [
                { text: 'QLoRA Paper', url: 'https://arxiv.org/abs/2305.14314' },
                { text: 'QLoRA Implementation Tutorial', url: 'https://huggingface.co/blog/4bit-transformers-bitsandbytes' }
            ]
        },
        
        // Memory Optimization Techniques
        'gradient-checkpointing': {
            title: 'Gradient Checkpointing',
            short: 'Memory optimization technique that trades computation for memory',
            full: `<p>Gradient Checkpointing is a memory optimization technique that reduces the memory requirements during training by trading off computational efficiency for memory efficiency.</p>
                  <p>How it works:</p>
                  <ul>
                    <li><strong>Standard Backpropagation</strong>: Normally, all intermediate activations are stored during the forward pass for use in backpropagation</li>
                    <li><strong>Memory Problem</strong>: For large models, storing all activations requires enormous amounts of memory</li>
                    <li><strong>Checkpointing Solution</strong>: Only store activations at certain "checkpoint" layers</li>
                    <li><strong>Recomputation</strong>: During backpropagation, recompute the missing activations as needed</li>
                    <li><strong>Trade-off</strong>: Increases computation time but dramatically reduces memory usage</li>
                  </ul>
                  <p>Gradient checkpointing is essential for training large models on limited hardware and is often used in conjunction with other memory optimization techniques.</p>`,
            links: [
                { text: 'Gradient Checkpointing Paper', url: 'https://arxiv.org/abs/1604.06174' },
                { text: 'PyTorch Implementation', url: 'https://pytorch.org/docs/stable/checkpoint.html' }
            ]
        },
        'mixed-precision': {
            title: 'Mixed Precision Training',
            short: 'Using lower precision (FP16) with FP32 for faster, memory-efficient training',
            full: `<p>Mixed Precision Training is a technique that uses lower precision formats (typically FP16) for most operations while maintaining a master copy of weights in higher precision (FP32) to improve training speed and memory efficiency.</p>
                  <p>Key components:</p>
                  <ul>
                    <li><strong>FP16 Operations</strong>: Most matrix multiplications and convolutions use 16-bit floating point</li>
                    <li><strong>FP32 Master Weights</strong>: Weights are stored in 32-bit precision for stability</li>
                    <li><strong>Loss Scaling</strong>: Prevents underflow in gradients by scaling the loss up before backpropagation</li>
                    <li><strong>Benefits</strong>: Up to 2-3x speedup and 2x memory reduction</li>
                    <li><strong>Hardware Support</strong>: Modern GPUs have specialized hardware (Tensor Cores) for FP16 operations</li>
                  </ul>
                  <p>Mixed precision training is now standard practice for training large language models and is supported by frameworks like PyTorch through Automatic Mixed Precision (AMP).</p>`,
            links: [
                { text: 'Mixed Precision Training Paper', url: 'https://arxiv.org/abs/1710.03740' },
                { text: 'PyTorch AMP Documentation', url: 'https://pytorch.org/docs/stable/amp.html' }
            ]
        },
        
        // Data and Training Concepts
        'instruction-tuning': {
            title: 'Instruction Tuning',
            short: 'Fine-tuning LLMs on instruction-response pairs to follow user instructions',
            full: `<p>Instruction Tuning is a specific fine-tuning approach where models are trained on datasets consisting of instruction-response pairs to improve their ability to follow user instructions and generate helpful responses.</p>
                  <p>Key aspects:</p>
                  <ul>
                    <li><strong>Data Format</strong>: Pairs of instructions/prompts and their ideal responses</li>
                    <li><strong>Purpose</strong>: Teaches models to understand and follow natural language instructions</li>
                    <li><strong>Examples</strong>: "Summarize this article:", "Explain quantum computing to a 10-year-old:"</li>
                    <li><strong>Benefits</strong>: Improves usability, reduces need for prompt engineering, and enhances alignment</li>
                    <li><strong>Advanced Variants</strong>: RLHF (Reinforcement Learning from Human Feedback) often builds on instruction-tuned models</li>
                  </ul>
                  <p>Instruction tuning has been crucial in making models like ChatGPT, Claude, and others more helpful, harmless, and honest in their responses to users.</p>`,
            links: [
                { text: 'FLAN Paper', url: 'https://arxiv.org/abs/2109.01652' },
                { text: 'InstructGPT Paper', url: 'https://arxiv.org/abs/2203.02155' }
            ]
        },
        'tokenization': {
            title: 'Tokenization',
            short: 'Process of converting text into tokens that LLMs can process',
            full: `<p>Tokenization is the process of converting raw text into tokens (smaller units) that language models can process. It's a fundamental preprocessing step for all LLM operations.</p>
                  <p>Key concepts in tokenization:</p>
                  <ul>
                    <li><strong>Tokens</strong>: Units of text that the model processes (can be words, subwords, or characters)</li>
                    <li><strong>Vocabulary</strong>: The complete set of tokens the model recognizes</li>
                    <li><strong>Subword Tokenization</strong>: Breaking uncommon words into smaller pieces (e.g., "tokenization" → "token" + "ization")</li>
                    <li><strong>Common Algorithms</strong>: BPE (Byte-Pair Encoding), WordPiece, SentencePiece, Unigram</li>
                    <li><strong>Special Tokens</strong>: [PAD], [CLS], [SEP], [MASK], etc. for specific functions</li>
                  </ul>
                  <p>The choice of tokenization strategy significantly impacts model performance, especially for multilingual models and when handling specialized vocabulary.</p>`,
            links: [
                { text: 'BPE Paper', url: 'https://arxiv.org/abs/1508.07909' },
                { text: 'Hugging Face Tokenizers', url: 'https://huggingface.co/docs/tokenizers/index' }
            ]
        },
        
        // Deployment and Inference
        'quantization': {
            title: 'Quantization',
            short: 'Reducing model precision to improve inference speed and memory usage',
            full: `<p>Quantization is the process of converting model weights and activations from higher precision (e.g., FP32 or FP16) to lower precision formats (e.g., INT8, INT4) to reduce memory usage and improve inference speed.</p>
                  <p>Types and techniques:</p>
                  <ul>
                    <li><strong>Post-Training Quantization (PTQ)</strong>: Applied after training without further fine-tuning</li>
                    <li><strong>Quantization-Aware Training (QAT)</strong>: Incorporates quantization effects during training</li>
                    <li><strong>Precision Levels</strong>: 8-bit (INT8), 4-bit (INT4), even 2-bit or 1-bit (binary) in extreme cases</li>
                    <li><strong>Weight-Only Quantization</strong>: Only quantizes weights, keeping activations in higher precision</li>
                    <li><strong>Benefits</strong>: Smaller model size, faster inference, lower memory usage, lower power consumption</li>
                  </ul>
                  <p>Quantization is essential for deploying large language models on resource-constrained devices and for reducing inference costs in production environments.</p>`,
            links: [
                { text: 'GPTQ Paper', url: 'https://arxiv.org/abs/2210.17323' },
                { text: 'Quantization for LLMs', url: 'https://huggingface.co/blog/hf-bitsandbytes-integration' }
            ]
        },
        'inference': {
            title: 'Inference',
            short: 'Process of using a trained model to generate predictions or outputs',
            full: `<p>Inference is the process of using a trained language model to generate text, answer questions, or perform other tasks based on input prompts or contexts.</p>
                  <p>Key inference concepts for LLMs:</p>
                  <ul>
                    <li><strong>Decoding Strategies</strong>: Methods for generating text (greedy, beam search, sampling)</li>
                    <li><strong>Temperature</strong>: Controls randomness in generation (higher = more random)</li>
                    <li><strong>Top-k/Top-p Sampling</strong>: Techniques to filter the token distribution before sampling</li>
                    <li><strong>Batch Processing</strong>: Processing multiple inputs simultaneously for efficiency</li>
                    <li><strong>Optimization Techniques</strong>: KV caching, quantization, tensor parallelism for faster inference</li>
                  </ul>
                  <p>Efficient inference is crucial for production applications, as it directly impacts user experience, throughput, and operational costs.</p>`,
            links: [
                { text: 'Text Generation Strategies', url: 'https://huggingface.co/blog/how-to-generate' },
                { text: 'Efficient Inference Guide', url: 'https://huggingface.co/docs/transformers/main_classes/pipelines' }
            ]
        }
    };
    
    // Function to create concept tooltips
    function createConceptTooltips() {
        // Find all concept tags
        document.querySelectorAll('.llm-concept').forEach(element => {
            const conceptId = element.getAttribute('data-concept');
            const concept = llmConcepts[conceptId];
            
            if (concept) {
                // Add tooltip attributes
                element.setAttribute('data-bs-toggle', 'tooltip');
                element.setAttribute('data-bs-placement', 'top');
                element.setAttribute('title', concept.short);
                element.classList.add('concept-link');
                
                // Add click event to show modal
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    showConceptModal(conceptId);
                });
            }
        });
        
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Function to show concept modal
    function showConceptModal(conceptId) {
        const concept = llmConcepts[conceptId];
        if (!concept) return;
        
        // Create links HTML
        let linksHtml = '';
        if (concept.links && concept.links.length > 0) {
            linksHtml = `
                <h6 class="mt-4">Learn More:</h6>
                <ul class="list-group list-group-flush">
                    ${concept.links.map(link => `
                        <li class="list-group-item">
                            <a href="${link.url}" target="_blank" class="text-decoration-none">
                                <i class="bi bi-box-arrow-up-right me-2"></i>${link.text}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        }
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="conceptModal" tabindex="-1" aria-labelledby="conceptModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="conceptModalLabel">
                                <i class="bi bi-lightbulb-fill me-2"></i>${concept.title}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${concept.full}
                            ${linksHtml}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <a href="/search?q=${encodeURIComponent(concept.title)}" class="btn btn-primary">
                                <i class="bi bi-search me-2"></i>Find Related Tutorials
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('conceptModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('conceptModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Function to scan text for concepts and add tooltips
    function scanForConcepts() {
        // Get all text nodes in the document
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    if (node.parentNode.tagName === 'SCRIPT' || 
                        node.parentNode.tagName === 'STYLE' ||
                        node.parentNode.classList.contains('concept-link')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }
        
        // Process each text node
        textNodes.forEach(textNode => {
            let text = textNode.nodeValue;
            let modified = false;
            
            // Check for each concept
            for (const [conceptId, concept] of Object.entries(llmConcepts)) {
                // Create regex to match the concept (case insensitive, whole word)
                const regex = new RegExp(`\\b${concept.title}\\b`, 'i');
                
                if (regex.test(text)) {
                    // Replace the first occurrence only
                    const newText = text.replace(regex, `<span class="llm-concept" data-concept="${conceptId}">${concept.title}</span>`);
                    
                    // Create a temporary element to hold the HTML
                    const temp = document.createElement('div');
                    temp.innerHTML = newText;
                    
                    // Replace the text node with the new nodes
                    const fragment = document.createDocumentFragment();
                    while (temp.firstChild) {
                        fragment.appendChild(temp.firstChild);
                    }
                    
                    textNode.parentNode.replaceChild(fragment, textNode);
                    modified = true;
                    break; // Only replace one concept per text node
                }
            }
            
            // If modified, we need to re-scan the document
            if (modified) {
                setTimeout(scanForConcepts, 0);
                return;
            }
        });
        
        // Create tooltips for the newly added concept spans
        createConceptTooltips();
    }
    
    // Initialize concept tooltips for manually added concept tags
    createConceptTooltips();
    
    // Scan document for concepts and add tooltips (optional, can be resource-intensive)
    // Uncomment the line below to enable automatic concept detection
    // scanForConcepts();
});
