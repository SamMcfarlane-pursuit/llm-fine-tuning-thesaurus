/**
 * Table Visibility Enhancer
 * Dynamically enhances the visibility of tables across the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Enhance all tables on the page
    enhanceAllTables();
    
    // Set up a mutation observer to enhance tables that are added dynamically
    observeDynamicTables();
});

/**
 * Enhances all tables on the page for better visibility
 */
function enhanceAllTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Skip if already enhanced
        if (table.classList.contains('enhanced-table')) return;
        
        // Add enhanced class
        table.classList.add('enhanced-table');
        
        // Determine table type based on content
        determineTableType(table);
        
        // Wrap table in responsive container if not already wrapped
        wrapTableInResponsiveContainer(table);
        
        // Add caption if missing
        addTableCaption(table);
        
        // Add data-labels for mobile view
        addDataLabelsForMobile(table);
        
        // Add zebra striping
        addZebraStriping(table);
        
        // Add hover effect
        addHoverEffect(table);
    });
}

/**
 * Determines the type of table based on its content
 * @param {HTMLElement} table - The table element
 */
function determineTableType(table) {
    // Get table headers
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.toLowerCase());
    
    // Check for resource table
    if (headers.some(header => 
        header.includes('parameter') || 
        header.includes('vram') || 
        header.includes('memory') || 
        header.includes('resource') ||
        header.includes('usage')
    )) {
        table.classList.add('resource-table');
    }
    
    // Check for comparison table
    else if (headers.some(header => 
        header.includes('method') || 
        header.includes('comparison') || 
        header.includes('vs') ||
        header.includes('versus')
    )) {
        table.classList.add('comparison-table');
    }
    
    // Check for method table
    else if (headers.some(header => 
        header.includes('step') || 
        header.includes('action') || 
        header.includes('description') ||
        header.includes('function')
    )) {
        table.classList.add('method-table');
    }
    
    // Default to enhanced table
    else {
        table.classList.add('default-table');
    }
}

/**
 * Wraps a table in a responsive container if not already wrapped
 * @param {HTMLElement} table - The table element
 */
function wrapTableInResponsiveContainer(table) {
    // Skip if already in a responsive container
    if (table.parentElement.classList.contains('table-responsive')) return;
    
    // Create responsive container
    const container = document.createElement('div');
    container.className = 'table-responsive';
    
    // Insert container and move table
    table.parentNode.insertBefore(container, table);
    container.appendChild(table);
}

/**
 * Adds a caption to a table if missing
 * @param {HTMLElement} table - The table element
 */
function addTableCaption(table) {
    // Skip if already has a caption
    if (table.querySelector('caption')) return;
    
    // Try to find a heading before the table
    let heading = table.parentElement.previousElementSibling;
    while (heading && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(heading.tagName)) {
        heading = heading.previousElementSibling;
    }
    
    // If heading found, use it as caption
    if (heading) {
        const caption = document.createElement('caption');
        caption.textContent = heading.textContent;
        table.prepend(caption);
    }
    // Otherwise, create a generic caption based on table type
    else {
        const caption = document.createElement('caption');
        
        if (table.classList.contains('resource-table')) {
            caption.textContent = 'Resource Requirements';
        } else if (table.classList.contains('comparison-table')) {
            caption.textContent = 'Method Comparison';
        } else if (table.classList.contains('method-table')) {
            caption.textContent = 'Method Steps';
        } else {
            // No caption for default tables without a heading
            return;
        }
        
        table.prepend(caption);
    }
}

/**
 * Adds data-labels for mobile view
 * @param {HTMLElement} table - The table element
 */
function addDataLabelsForMobile(table) {
    // Get headers
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    // Skip if no headers
    if (headers.length === 0) return;
    
    // Add data-label to each cell
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        cells.forEach((cell, index) => {
            if (index < headers.length) {
                cell.setAttribute('data-label', headers[index]);
            }
        });
    });
}

/**
 * Adds zebra striping to a table
 * @param {HTMLElement} table - The table element
 */
function addZebraStriping(table) {
    // Add zebra striping to rows
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach((row, index) => {
        if (index % 2 === 1) {
            row.classList.add('even-row');
        } else {
            row.classList.add('odd-row');
        }
    });
}

/**
 * Adds hover effect to a table
 * @param {HTMLElement} table - The table element
 */
function addHoverEffect(table) {
    // Add hover effect to rows
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.classList.add('hover-row');
        });
        
        row.addEventListener('mouseleave', function() {
            this.classList.remove('hover-row');
        });
    });
}

/**
 * Sets up a mutation observer to enhance tables that are added dynamically
 */
function observeDynamicTables() {
    // Create an observer instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if nodes were added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(function(node) {
                    // If the added node is a table, enhance it
                    if (node.nodeName === 'TABLE') {
                        enhanceSingleTable(node);
                    }
                    // If the added node contains tables, enhance them
                    else if (node.nodeType === 1) { // ELEMENT_NODE
                        const tables = node.querySelectorAll('table');
                        tables.forEach(table => enhanceSingleTable(table));
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Enhances a single table
 * @param {HTMLElement} table - The table to enhance
 */
function enhanceSingleTable(table) {
    // Skip if already enhanced
    if (table.classList.contains('enhanced-table')) return;
    
    // Add enhanced class
    table.classList.add('enhanced-table');
    
    // Determine table type based on content
    determineTableType(table);
    
    // Wrap table in responsive container if not already wrapped
    wrapTableInResponsiveContainer(table);
    
    // Add caption if missing
    addTableCaption(table);
    
    // Add data-labels for mobile view
    addDataLabelsForMobile(table);
    
    // Add zebra striping
    addZebraStriping(table);
    
    // Add hover effect
    addHoverEffect(table);
}
