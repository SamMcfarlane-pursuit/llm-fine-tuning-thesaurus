// Fine-Tuning Comparison Enhancer
// Enhances model comparison tables and visualizations

(function() {
    'use strict';

    // Configuration
    const config = {
        comparisonClass: 'comparison-table',
        highlightClass: 'comparison-highlight',
        sortableClass: 'sortable',
        filterClass: 'comparison-filter',
        animationDuration: 300
    };

    // Create comparison controls
    function createComparisonControls(table) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'comparison-controls';
        controlsContainer.innerHTML = `
            <div class="comparison-filters">
                <label for="model-filter">Filter by Model:</label>
                <select id="model-filter" class="${config.filterClass}">
                    <option value="">All Models</option>
                </select>
                
                <label for="metric-filter">Sort by Metric:</label>
                <select id="metric-filter" class="${config.filterClass}">
                    <option value="">Default</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="loss">Loss</option>
                    <option value="training-time">Training Time</option>
                    <option value="model-size">Model Size</option>
                </select>
                
                <button id="reset-comparison" class="btn btn-secondary">Reset</button>
            </div>
            
            <div class="comparison-stats">
                <span class="stat-item">Models: <span id="model-count">0</span></span>
                <span class="stat-item">Best Accuracy: <span id="best-accuracy">-</span></span>
                <span class="stat-item">Avg Training Time: <span id="avg-time">-</span></span>
            </div>
        `;
        
        table.parentNode.insertBefore(controlsContainer, table);
        return controlsContainer;
    }

    // Add comparison table styles
    function addComparisonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .comparison-controls {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .comparison-filters {
                display: flex;
                gap: 15px;
                align-items: center;
                flex-wrap: wrap;
                margin-bottom: 10px;
            }
            
            .comparison-filters label {
                font-weight: 600;
                color: #495057;
            }
            
            .comparison-filters select {
                padding: 5px 10px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                background: white;
            }
            
            .comparison-stats {
                display: flex;
                gap: 20px;
                font-size: 14px;
            }
            
            .stat-item {
                color: #6c757d;
            }
            
            .stat-item span {
                font-weight: 600;
                color: #495057;
            }
            
            .comparison-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            
            .comparison-table th,
            .comparison-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            
            .comparison-table th {
                background-color: #f8f9fa;
                font-weight: 600;
                cursor: pointer;
                position: relative;
            }
            
            .comparison-table th:hover {
                background-color: #e9ecef;
            }
            
            .comparison-table th.sortable::after {
                content: '↕';
                position: absolute;
                right: 8px;
                opacity: 0.5;
            }
            
            .comparison-table th.sort-asc::after {
                content: '↑';
                opacity: 1;
            }
            
            .comparison-table th.sort-desc::after {
                content: '↓';
                opacity: 1;
            }
            
            .comparison-highlight {
                background-color: #fff3cd !important;
                transition: background-color 0.3s ease;
            }
            
            .comparison-best {
                background-color: #d4edda !important;
                font-weight: 600;
            }
            
            .comparison-worst {
                background-color: #f8d7da !important;
            }
            
            .model-badge {
                display: inline-block;
                padding: 4px 8px;
                background: #007bff;
                color: white;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .metric-value {
                font-family: 'Courier New', monospace;
                font-weight: 600;
            }
            
            .progress-bar {
                width: 100px;
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                display: inline-block;
                margin-left: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
                transition: width 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .comparison-filters {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .comparison-stats {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .comparison-table {
                    font-size: 14px;
                }
                
                .comparison-table th,
                .comparison-table td {
                    padding: 8px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Enhanced table sorting
    function setupTableSorting(table) {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            header.classList.add(config.sortableClass);
            header.addEventListener('click', () => sortTable(table, index, header));
        });
    }

    // Sort table by column
    function sortTable(table, columnIndex, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isNumeric = header.dataset.type === 'number';
        const currentSort = header.classList.contains('sort-asc') ? 'desc' : 'asc';
        
        // Clear all sort classes
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add current sort class
        header.classList.add(`sort-${currentSort}`);
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            let comparison;
            if (isNumeric) {
                comparison = parseFloat(aValue) - parseFloat(bValue);
            } else {
                comparison = aValue.localeCompare(bValue);
            }
            
            return currentSort === 'asc' ? comparison : -comparison;
        });
        
        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    // Add progress bars to metric columns
    function addProgressBars(table) {
        const metricColumns = table.querySelectorAll('td[data-metric]');
        
        metricColumns.forEach(cell => {
            const value = parseFloat(cell.textContent);
            const max = parseFloat(cell.dataset.max) || 100;
            const percentage = (value / max) * 100;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = `<div class="progress-fill" style="width: ${percentage}%"></div>`;
            
            cell.appendChild(progressBar);
        });
    }

    // Highlight best and worst performers
    function highlightPerformers(table) {
        const metricColumns = {};
        
        // Group cells by metric type
        table.querySelectorAll('td[data-metric]').forEach(cell => {
            const metric = cell.dataset.metric;
            if (!metricColumns[metric]) {
                metricColumns[metric] = [];
            }
            metricColumns[metric].push({
                cell: cell,
                value: parseFloat(cell.textContent)
            });
        });
        
        // Highlight best and worst for each metric
        Object.keys(metricColumns).forEach(metric => {
            const cells = metricColumns[metric];
            if (cells.length < 2) return;
            
            const isHigherBetter = metric === 'accuracy' || metric === 'f1-score';
            
            cells.sort((a, b) => a.value - b.value);
            
            const best = isHigherBetter ? cells[cells.length - 1] : cells[0];
            const worst = isHigherBetter ? cells[0] : cells[cells.length - 1];
            
            best.cell.classList.add('comparison-best');
            worst.cell.classList.add('comparison-worst');
        });
    }

    // Update comparison statistics
    function updateStats(table) {
        const rows = table.querySelectorAll('tbody tr');
        const modelCount = rows.length;
        
        let totalAccuracy = 0;
        let totalTime = 0;
        let bestAccuracy = 0;
        let validAccuracyCount = 0;
        let validTimeCount = 0;
        
        rows.forEach(row => {
            const accuracyCell = row.querySelector('[data-metric="accuracy"]');
            const timeCell = row.querySelector('[data-metric="training-time"]');
            
            if (accuracyCell) {
                const accuracy = parseFloat(accuracyCell.textContent);
                if (!isNaN(accuracy)) {
                    totalAccuracy += accuracy;
                    bestAccuracy = Math.max(bestAccuracy, accuracy);
                    validAccuracyCount++;
                }
            }
            
            if (timeCell) {
                const time = parseFloat(timeCell.textContent);
                if (!isNaN(time)) {
                    totalTime += time;
                    validTimeCount++;
                }
            }
        });
        
        // Update display
        const modelCountEl = document.getElementById('model-count');
        const bestAccuracyEl = document.getElementById('best-accuracy');
        const avgTimeEl = document.getElementById('avg-time');
        
        if (modelCountEl) modelCountEl.textContent = modelCount;
        if (bestAccuracyEl) bestAccuracyEl.textContent = validAccuracyCount > 0 ? `${bestAccuracy.toFixed(2)}%` : '-';
        if (avgTimeEl) avgTimeEl.textContent = validTimeCount > 0 ? `${(totalTime / validTimeCount).toFixed(1)}s` : '-';
    }

    // Setup filtering
    function setupFiltering(table, controls) {
        const modelFilter = controls.querySelector('#model-filter');
        const metricFilter = controls.querySelector('#metric-filter');
        const resetButton = controls.querySelector('#reset-comparison');
        
        // Populate model filter options
        const models = new Set();
        table.querySelectorAll('tbody tr').forEach(row => {
            const modelCell = row.querySelector('td');
            if (modelCell) {
                models.add(modelCell.textContent.trim());
            }
        });
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelFilter.appendChild(option);
        });
        
        // Filter handlers
        modelFilter.addEventListener('change', () => filterTable(table, modelFilter.value, 'model'));
        metricFilter.addEventListener('change', () => sortByMetric(table, metricFilter.value));
        resetButton.addEventListener('click', () => resetComparison(table, controls));
    }

    // Filter table rows
    function filterTable(table, filterValue, filterType) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            let shouldShow = true;
            
            if (filterValue && filterType === 'model') {
                const modelCell = row.querySelector('td');
                shouldShow = modelCell && modelCell.textContent.trim().includes(filterValue);
            }
            
            row.style.display = shouldShow ? '' : 'none';
        });
        
        updateStats(table);
    }

    // Sort by specific metric
    function sortByMetric(table, metric) {
        if (!metric) return;
        
        const headers = table.querySelectorAll('th');
        let targetHeader = null;
        
        headers.forEach((header, index) => {
            if (header.dataset.metric === metric) {
                targetHeader = header;
                sortTable(table, index, header);
            }
        });
    }

    // Reset comparison view
    function resetComparison(table, controls) {
        // Reset filters
        controls.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Show all rows
        table.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = '';
        });
        
        // Clear sort indicators
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        updateStats(table);
    }

    // Initialize comparison enhancements
    function init() {
        addComparisonStyles();
        
        const comparisonTables = document.querySelectorAll('table[data-comparison], .comparison-table, table.model-comparison');
        
        comparisonTables.forEach(table => {
            table.classList.add(config.comparisonClass);
            
            const controls = createComparisonControls(table);
            setupTableSorting(table);
            setupFiltering(table, controls);
            addProgressBars(table);
            highlightPerformers(table);
            updateStats(table);
        });
        
        // Auto-detect comparison tables
        const potentialTables = document.querySelectorAll('table');
        potentialTables.forEach(table => {
            const headers = table.querySelectorAll('th');
            const hasModelColumn = Array.from(headers).some(th => 
                th.textContent.toLowerCase().includes('model') ||
                th.textContent.toLowerCase().includes('architecture')
            );
            const hasMetricColumn = Array.from(headers).some(th => 
                th.textContent.toLowerCase().includes('accuracy') ||
                th.textContent.toLowerCase().includes('loss') ||
                th.textContent.toLowerCase().includes('score')
            );
            
            if (hasModelColumn && hasMetricColumn && !table.classList.contains(config.comparisonClass)) {
                table.classList.add(config.comparisonClass);
                const controls = createComparisonControls(table);
                setupTableSorting(table);
                setupFiltering(table, controls);
                addProgressBars(table);
                highlightPerformers(table);
                updateStats(table);
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();