// Table Visibility Enhancer
// Improves table display, responsiveness, and user interaction

(function() {
    'use strict';

    // Configuration
    const config = {
        responsiveClass: 'table-responsive',
        enhancedClass: 'table-enhanced',
        stickyHeaderClass: 'sticky-header',
        scrollableClass: 'table-scrollable',
        breakpoint: 768
    };

    // Add table enhancement styles
    function addTableStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .table-enhanced {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .table-enhanced th,
            .table-enhanced td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .table-enhanced th {
                background-color: #f8f9fa;
                font-weight: 600;
                color: #495057;
                position: relative;
            }
            
            .table-enhanced tbody tr {
                transition: background-color 0.2s ease;
            }
            
            .table-enhanced tbody tr:hover {
                background-color: #f5f5f5;
            }
            
            .table-enhanced tbody tr:nth-child(even) {
                background-color: #fafafa;
            }
            
            .table-responsive {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .sticky-header th {
                position: sticky;
                top: 0;
                z-index: 10;
                background-color: #f8f9fa;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .table-scrollable {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .table-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .table-search {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                min-width: 200px;
            }
            
            .table-pagination {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .table-pagination button {
                padding: 6px 12px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .table-pagination button:hover:not(:disabled) {
                background-color: #007bff;
                color: white;
                border-color: #007bff;
            }
            
            .table-pagination button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .table-pagination .page-info {
                font-size: 14px;
                color: #666;
            }
            
            .table-export {
                padding: 8px 16px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s ease;
            }
            
            .table-export:hover {
                background: #218838;
            }
            
            .table-loading {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .table-empty {
                text-align: center;
                padding: 40px;
                color: #999;
                font-style: italic;
            }
            
            .column-toggle {
                position: relative;
                display: inline-block;
            }
            
            .column-toggle-btn {
                padding: 8px 12px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .column-toggle-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                z-index: 1000;
                min-width: 200px;
                display: none;
            }
            
            .column-toggle-menu.show {
                display: block;
            }
            
            .column-toggle-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .column-toggle-item:hover {
                background-color: #f8f9fa;
            }
            
            .column-toggle-item input {
                margin-right: 8px;
            }
            
            @media (max-width: 768px) {
                .table-enhanced {
                    font-size: 14px;
                }
                
                .table-enhanced th,
                .table-enhanced td {
                    padding: 8px 10px;
                }
                
                .table-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .table-search {
                    min-width: auto;
                    width: 100%;
                }
                
                .table-pagination {
                    justify-content: center;
                }
                
                .column-toggle-menu {
                    right: auto;
                    left: 0;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .table-enhanced {
                    background-color: #2d3748;
                    color: #e2e8f0;
                }
                
                .table-enhanced th {
                    background-color: #4a5568;
                    color: #e2e8f0;
                }
                
                .table-enhanced tbody tr:hover {
                    background-color: #4a5568;
                }
                
                .table-enhanced tbody tr:nth-child(even) {
                    background-color: #374151;
                }
                
                .table-search {
                    background-color: #374151;
                    border-color: #4a5568;
                    color: #e2e8f0;
                }
                
                .table-pagination button {
                    background-color: #374151;
                    border-color: #4a5568;
                    color: #e2e8f0;
                }
                
                .column-toggle-menu {
                    background-color: #374151;
                    border-color: #4a5568;
                }
                
                .column-toggle-item:hover {
                    background-color: #4a5568;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Create table controls
    function createTableControls(table) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'table-controls';
        
        const leftControls = document.createElement('div');
        leftControls.innerHTML = `
            <input type="text" class="table-search" placeholder="Search table..." data-table-id="${table.id || 'table-' + Date.now()}">
        `;
        
        const rightControls = document.createElement('div');
        rightControls.style.display = 'flex';
        rightControls.style.gap = '10px';
        rightControls.innerHTML = `
            <div class="column-toggle">
                <button class="column-toggle-btn">Columns ▼</button>
                <div class="column-toggle-menu"></div>
            </div>
            <button class="table-export">Export CSV</button>
        `;
        
        controlsContainer.appendChild(leftControls);
        controlsContainer.appendChild(rightControls);
        
        table.parentNode.insertBefore(controlsContainer, table);
        return controlsContainer;
    }

    // Setup table search functionality
    function setupTableSearch(table, searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const shouldShow = text.includes(searchTerm);
                row.style.display = shouldShow ? '' : 'none';
            });
            
            updateTableStats(table);
        });
    }

    // Setup column visibility toggle
    function setupColumnToggle(table, toggleContainer) {
        const toggleBtn = toggleContainer.querySelector('.column-toggle-btn');
        const toggleMenu = toggleContainer.querySelector('.column-toggle-menu');
        const headers = table.querySelectorAll('th');
        
        // Populate column toggle menu
        headers.forEach((header, index) => {
            const item = document.createElement('div');
            item.className = 'column-toggle-item';
            item.innerHTML = `
                <input type="checkbox" checked data-column="${index}">
                <span>${header.textContent.trim()}</span>
            `;
            toggleMenu.appendChild(item);
        });
        
        // Toggle menu visibility
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            toggleMenu.classList.remove('show');
        });
        
        // Handle column visibility changes
        toggleMenu.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const columnIndex = parseInt(e.target.dataset.column);
                const isVisible = e.target.checked;
                toggleColumnVisibility(table, columnIndex, isVisible);
            }
        });
    }

    // Toggle column visibility
    function toggleColumnVisibility(table, columnIndex, isVisible) {
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');
        
        // Toggle header
        if (headers[columnIndex]) {
            headers[columnIndex].style.display = isVisible ? '' : 'none';
        }
        
        // Toggle cells in all rows
        rows.forEach(row => {
            const cell = row.cells[columnIndex];
            if (cell) {
                cell.style.display = isVisible ? '' : 'none';
            }
        });
    }

    // Setup table export functionality
    function setupTableExport(table, exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportTableToCSV(table);
        });
    }

    // Export table to CSV
    function exportTableToCSV(table) {
        const rows = [];
        const headers = [];
        
        // Get visible headers
        table.querySelectorAll('th').forEach(th => {
            if (th.style.display !== 'none') {
                headers.push(th.textContent.trim());
            }
        });
        rows.push(headers);
        
        // Get visible data rows
        table.querySelectorAll('tbody tr').forEach(tr => {
            if (tr.style.display !== 'none') {
                const row = [];
                tr.querySelectorAll('td').forEach(td => {
                    if (td.style.display !== 'none') {
                        row.push(td.textContent.trim());
                    }
                });
                rows.push(row);
            }
        });
        
        // Convert to CSV
        const csvContent = rows.map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `table-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Make table responsive
    function makeTableResponsive(table) {
        const wrapper = document.createElement('div');
        wrapper.className = config.responsiveClass;
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // Add sticky header if table is tall
        if (table.offsetHeight > 400) {
            table.classList.add(config.stickyHeaderClass);
        }
    }

    // Update table statistics
    function updateTableStats(table) {
        const totalRows = table.querySelectorAll('tbody tr').length;
        const visibleRows = table.querySelectorAll('tbody tr:not([style*="display: none"])').length;
        
        // Update or create stats display
        let statsElement = table.parentNode.querySelector('.table-stats');
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.className = 'table-stats';
            statsElement.style.cssText = 'font-size: 12px; color: #666; margin-top: 10px;';
            table.parentNode.appendChild(statsElement);
        }
        
        statsElement.textContent = `Showing ${visibleRows} of ${totalRows} rows`;
    }

    // Setup table sorting
    function setupTableSorting(table) {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                sortTable(table, index);
            });
        });
    }

    // Sort table by column
    function sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const header = table.querySelectorAll('th')[columnIndex];
        
        const isAscending = !header.classList.contains('sort-asc');
        
        // Clear all sort classes
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add current sort class
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            // Try to parse as numbers
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            
            let comparison;
            if (!isNaN(aNum) && !isNaN(bNum)) {
                comparison = aNum - bNum;
            } else {
                comparison = aValue.localeCompare(bValue);
            }
            
            return isAscending ? comparison : -comparison;
        });
        
        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    // Initialize table enhancements
    function enhanceTable(table) {
        table.classList.add(config.enhancedClass);
        
        const controls = createTableControls(table);
        const searchInput = controls.querySelector('.table-search');
        const columnToggle = controls.querySelector('.column-toggle');
        const exportBtn = controls.querySelector('.table-export');
        
        makeTableResponsive(table);
        setupTableSearch(table, searchInput);
        setupColumnToggle(table, columnToggle);
        setupTableExport(table, exportBtn);
        setupTableSorting(table);
        updateTableStats(table);
    }

    // Initialize all table enhancements
    function init() {
        addTableStyles();
        
        // Enhance all tables
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Skip if already enhanced
            if (!table.classList.contains(config.enhancedClass)) {
                enhanceTable(table);
            }
        });
        
        // Watch for dynamically added tables
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tables = node.tagName === 'TABLE' ? [node] : node.querySelectorAll('table');
                        tables.forEach(table => {
                            if (!table.classList.contains(config.enhancedClass)) {
                                enhanceTable(table);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();