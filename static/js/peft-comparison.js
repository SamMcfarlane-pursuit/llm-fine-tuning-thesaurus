/**
 * Interactive PEFT Method Comparison Tool
 */

document.addEventListener('DOMContentLoaded', function() {
    // PEFT methods data
    const peftMethods = {
        'full': {
            name: 'Full Fine-Tuning',
            description: 'Updates all parameters in the model',
            parameters: '100% of base model',
            memory: 'Very High',
            performance: 'Excellent',
            training_speed: 'Slow',
            implementation: 'Standard training loop',
            use_case: 'When computational resources are abundant',
            pros: [
                'Maximum performance potential',
                'No architectural constraints',
                'Well-established methodology'
            ],
            cons: [
                'Extremely high memory requirements',
                'Requires high-end GPUs/TPUs',
                'Long training times',
                'Large storage requirements for checkpoints'
            ]
        },
        'lora': {
            name: 'LoRA',
            description: 'Low-Rank Adaptation using small update matrices',
            parameters: '0.1-1% of base model',
            memory: 'Medium',
            performance: 'Very Good',
            training_speed: 'Fast',
            implementation: 'Hugging Face PEFT library',
            use_case: 'General fine-tuning with limited resources',
            pros: [
                'Significantly reduced memory requirements',
                'Faster training',
                'Performance close to full fine-tuning',
                'Small adapter size (easy to share and store)'
            ],
            cons: [
                'Slightly lower performance than full fine-tuning',
                'Still requires 16-bit precision for base model',
                'Limited to certain model architectures'
            ]
        },
        'qlora': {
            name: 'QLoRA',
            description: 'Quantized Low-Rank Adaptation with 4-bit precision',
            parameters: '0.1-1% of base model',
            memory: 'Low',
            performance: 'Very Good',
            training_speed: 'Medium',
            implementation: 'Hugging Face PEFT + BitsAndBytes',
            use_case: 'Fine-tuning very large models on consumer hardware',
            pros: [
                'Dramatically reduced memory requirements',
                'Enables fine-tuning of very large models on consumer hardware',
                'Performance comparable to full fine-tuning',
                'Small adapter size'
            ],
            cons: [
                'Slightly lower performance than full fine-tuning',
                'Quantization can introduce minor artifacts',
                'More complex implementation'
            ]
        },
        'adapters': {
            name: 'Adapters',
            description: 'Small bottleneck layers inserted within transformer blocks',
            parameters: '0.5-5% of base model',
            memory: 'Medium',
            performance: 'Good',
            training_speed: 'Fast',
            implementation: 'Hugging Face PEFT library',
            use_case: 'Multi-task learning and modular fine-tuning',
            pros: [
                'Modular architecture',
                'Good for multi-task learning',
                'Established methodology with strong theoretical backing',
                'Multiple adapter variants available'
            ],
            cons: [
                'Slightly more parameters than LoRA',
                'Performance can vary by task',
                'More complex to implement than some alternatives'
            ]
        },
        'prefix': {
            name: 'Prefix Tuning',
            description: 'Prepends trainable vectors to attention layers',
            parameters: '0.1-1% of base model',
            memory: 'Medium',
            performance: 'Good',
            training_speed: 'Fast',
            implementation: 'Hugging Face PEFT library',
            use_case: 'Generation tasks and sequence-to-sequence models',
            pros: [
                'Very parameter-efficient',
                'Particularly effective for generation tasks',
                'Works well with encoder-decoder models',
                'Minimal interference with pre-trained weights'
            ],
            cons: [
                'Sometimes less effective than other methods',
                'More complex implementation',
                'Performance depends heavily on prefix length'
            ]
        },
        'ia3': {
            name: 'IA³',
            description: 'Rescales activations with learned vectors',
            parameters: '<0.1% of base model',
            memory: 'Low',
            performance: 'Good',
            training_speed: 'Very Fast',
            implementation: 'Hugging Face PEFT library',
            use_case: 'Extremely parameter-constrained environments',
            pros: [
                'Extremely parameter-efficient',
                'Very fast training',
                'Minimal memory overhead',
                'Surprisingly effective despite simplicity'
            ],
            cons: [
                'Generally lower performance than other methods',
                'Limited expressivity',
                'Less widely used and tested'
            ]
        }
    };
    
    // Function to create the comparison tool
    function createComparisonTool() {
        // Find the comparison section
        const content = document.getElementById('peft-content');
        if (!content) return;
        
        // Find the comparative analysis section
        let comparisonSection = null;
        content.querySelectorAll('h2').forEach(heading => {
            if (heading.textContent.includes('Comparative Analysis')) {
                comparisonSection = heading;
            }
        });
        
        if (!comparisonSection) return;
        
        // Create the comparison tool
        const comparisonTool = document.createElement('div');
        comparisonTool.className = 'card mt-4 mb-4';
        comparisonTool.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-bar-chart-fill me-2"></i>Interactive Method Comparison</h5>
            </div>
            <div class="card-body">
                <p>Select methods to compare:</p>
                <div class="d-flex flex-wrap gap-2 mb-3" id="method-selector">
                    ${Object.entries(peftMethods).map(([id, method]) => `
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="check-${id}" value="${id}" ${id === 'lora' || id === 'qlora' ? 'checked' : ''}>
                            <label class="form-check-label" for="check-${id}">${method.name}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="table-responsive">
                    <table class="table table-bordered method-comparison-table" id="comparison-table">
                        <thead class="table-light">
                            <tr>
                                <th>Feature</th>
                                <!-- Method columns will be added dynamically -->
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Parameters</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Memory Usage</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Performance</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Training Speed</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Implementation</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Best Use Case</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Pros</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                            <tr>
                                <td>Cons</td>
                                <!-- Data will be added dynamically -->
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Insert the comparison tool after the section heading
        comparisonSection.parentNode.insertBefore(comparisonTool, comparisonSection.nextSibling);
        
        // Add event listeners to checkboxes
        document.querySelectorAll('#method-selector input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateComparisonTable);
        });
        
        // Initial update
        updateComparisonTable();
    }
    
    // Function to update the comparison table based on selected methods
    function updateComparisonTable() {
        const table = document.getElementById('comparison-table');
        if (!table) return;
        
        // Get selected methods
        const selectedMethods = [];
        document.querySelectorAll('#method-selector input[type="checkbox"]:checked').forEach(checkbox => {
            selectedMethods.push(checkbox.value);
        });
        
        // Update table header
        const headerRow = table.querySelector('thead tr');
        headerRow.innerHTML = '<th>Feature</th>';
        selectedMethods.forEach(methodId => {
            const method = peftMethods[methodId];
            headerRow.innerHTML += `<th>${method.name}</th>`;
        });
        
        // Update table body
        const rows = table.querySelectorAll('tbody tr');
        
        // Parameters row
        rows[0].innerHTML = '<td>Parameters</td>';
        selectedMethods.forEach(methodId => {
            rows[0].innerHTML += `<td>${peftMethods[methodId].parameters}</td>`;
        });
        
        // Memory Usage row
        rows[1].innerHTML = '<td>Memory Usage</td>';
        selectedMethods.forEach(methodId => {
            const memory = peftMethods[methodId].memory;
            let badgeClass = '';
            if (memory === 'Low') badgeClass = 'bg-success';
            else if (memory === 'Medium') badgeClass = 'bg-warning';
            else if (memory === 'High' || memory === 'Very High') badgeClass = 'bg-danger';
            
            rows[1].innerHTML += `<td><span class="badge ${badgeClass}">${memory}</span></td>`;
        });
        
        // Performance row
        rows[2].innerHTML = '<td>Performance</td>';
        selectedMethods.forEach(methodId => {
            const performance = peftMethods[methodId].performance;
            let badgeClass = '';
            if (performance === 'Excellent') badgeClass = 'bg-success';
            else if (performance === 'Very Good') badgeClass = 'bg-success';
            else if (performance === 'Good') badgeClass = 'bg-warning';
            else badgeClass = 'bg-danger';
            
            rows[2].innerHTML += `<td><span class="badge ${badgeClass}">${performance}</span></td>`;
        });
        
        // Training Speed row
        rows[3].innerHTML = '<td>Training Speed</td>';
        selectedMethods.forEach(methodId => {
            const speed = peftMethods[methodId].training_speed;
            let badgeClass = '';
            if (speed === 'Very Fast' || speed === 'Fast') badgeClass = 'bg-success';
            else if (speed === 'Medium') badgeClass = 'bg-warning';
            else if (speed === 'Slow') badgeClass = 'bg-danger';
            
            rows[3].innerHTML += `<td><span class="badge ${badgeClass}">${speed}</span></td>`;
        });
        
        // Implementation row
        rows[4].innerHTML = '<td>Implementation</td>';
        selectedMethods.forEach(methodId => {
            rows[4].innerHTML += `<td>${peftMethods[methodId].implementation}</td>`;
        });
        
        // Best Use Case row
        rows[5].innerHTML = '<td>Best Use Case</td>';
        selectedMethods.forEach(methodId => {
            rows[5].innerHTML += `<td>${peftMethods[methodId].use_case}</td>`;
        });
        
        // Pros row
        rows[6].innerHTML = '<td>Pros</td>';
        selectedMethods.forEach(methodId => {
            const pros = peftMethods[methodId].pros;
            rows[6].innerHTML += `
                <td>
                    <ul class="mb-0 ps-3">
                        ${pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </td>
            `;
        });
        
        // Cons row
        rows[7].innerHTML = '<td>Cons</td>';
        selectedMethods.forEach(methodId => {
            const cons = peftMethods[methodId].cons;
            rows[7].innerHTML += `
                <td>
                    <ul class="mb-0 ps-3">
                        ${cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </td>
            `;
        });
    }
    
    // Check if the content is loaded
    const checkContentLoaded = setInterval(function() {
        if (document.getElementById('peft-content') && 
            document.getElementById('peft-content').innerHTML !== 'Loading content...') {
            clearInterval(checkContentLoaded);
            createComparisonTool();
        }
    }, 500);
});
