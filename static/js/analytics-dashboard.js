/**
 * Analytics Dashboard JavaScript
 * Handles real-time updates and interactive charts
 */

// Update interval in milliseconds
const UPDATE_INTERVAL = 30000; // 30 seconds

// Store chart instances for updates
let charts = {};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Initialize date range picker if present
    initDateRangePicker();
    
    // Initialize export functionality
    initExportButtons();
});

/**
 * Initialize real-time updates for dashboard stats
 */
function initRealTimeUpdates() {
    // Start update loop
    updateRealTimeStats();
    setInterval(updateRealTimeStats, UPDATE_INTERVAL);
    
    // Add real-time indicator to header
    const header = document.querySelector('h1');
    if (header) {
        const indicator = document.createElement('span');
        indicator.className = 'real-time-indicator';
        header.prepend(indicator);
        
        // Add "Real-time" text
        const realTimeText = document.createElement('small');
        realTimeText.className = 'text-muted ms-2';
        realTimeText.textContent = 'Auto-refreshing every 30 seconds';
        header.appendChild(realTimeText);
    }
}

/**
 * Update real-time statistics
 */
function updateRealTimeStats() {
    fetch('/analytics/api/real-time-stats')
        .then(response => response.json())
        .then(data => {
            // Update stats cards with animation
            updateStatCard('active_users', data.active_users);
            updateStatCard('completion_rate', data.completion_rate.toFixed(1) + '%');
            updateStatCard('page_views', data.page_views);
            updateStatCard('conversion_rate', data.conversion_rate.toFixed(1) + '%');
            
            // Update last refresh time
            const refreshTime = document.getElementById('last-refresh-time');
            if (refreshTime) {
                const now = new Date();
                refreshTime.textContent = now.toLocaleTimeString();
            }
        })
        .catch(error => console.error('Error updating real-time stats:', error));
}

/**
 * Update a stat card with animation
 * @param {string} statId - ID of the stat to update
 * @param {string|number} value - New value for the stat
 */
function updateStatCard(statId, value) {
    const statElement = document.querySelector(`.card-title:contains("${statId}") + .display-4`);
    if (statElement) {
        // Add animation class
        statElement.classList.add('data-refresh');
        
        // Update value
        statElement.textContent = value;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            statElement.classList.remove('data-refresh');
        }, 500);
    }
}

/**
 * Initialize date range picker for filtering data
 */
function initDateRangePicker() {
    const dateRangePicker = document.getElementById('date-range-picker');
    if (dateRangePicker) {
        // Initialize date range picker with Flatpickr or similar library
        flatpickr(dateRangePicker, {
            mode: 'range',
            maxDate: 'today',
            dateFormat: 'Y-m-d',
            defaultDate: [
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                new Date() // Today
            ],
            onChange: function(selectedDates, dateStr) {
                if (selectedDates.length === 2) {
                    // Update charts with new date range
                    updateChartsWithDateRange(selectedDates[0], selectedDates[1]);
                }
            }
        });
    }
}

/**
 * Update charts with new date range
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 */
function updateChartsWithDateRange(startDate, endDate) {
    // Format dates for API
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Update user activity chart
    fetch(`/analytics/api/user-activity?start_date=${startDateStr}&end_date=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            if (charts.userActivity) {
                charts.userActivity.data.labels = data.labels;
                charts.userActivity.data.datasets[0].data = data.active_users;
                charts.userActivity.data.datasets[1].data = data.page_views;
                charts.userActivity.update();
            }
        })
        .catch(error => console.error('Error updating user activity chart:', error));
    
    // Update content metrics
    fetch(`/analytics/api/content-metrics?start_date=${startDateStr}&end_date=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            // Update tutorial metrics table
            updateContentTable('tutorials', data.tutorials);
            
            // Update quiz metrics table
            updateContentTable('quizzes', data.quizzes);
            
            // Update exercise metrics table
            updateContentTable('exercises', data.exercises);
        })
        .catch(error => console.error('Error updating content metrics:', error));
    
    // Update retention chart
    fetch(`/analytics/api/retention-data?start_date=${startDateStr}&end_date=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            if (charts.retention) {
                charts.retention.data.labels = data.labels;
                charts.retention.data.datasets[0].data = data.rates;
                charts.retention.update();
            }
        })
        .catch(error => console.error('Error updating retention chart:', error));
}

/**
 * Update content metrics table
 * @param {string} contentType - Type of content (tutorials, quizzes, exercises)
 * @param {Array} data - Array of content metrics
 */
function updateContentTable(contentType, data) {
    const tableBody = document.querySelector(`#${contentType} table tbody`);
    if (tableBody && data && data.length > 0) {
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add new rows
        data.forEach(item => {
            const row = document.createElement('tr');
            
            // Create cells based on content type
            if (contentType === 'tutorials') {
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.views}</td>
                    <td>${item.completions}</td>
                    <td>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${item.completion_rate}%;" aria-valuenow="${item.completion_rate}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">${item.completion_rate.toFixed(1)}%</small>
                    </td>
                    <td>${item.avg_time_spent} min</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="me-2">${item.rating.toFixed(1)}</div>
                            <div class="text-warning">
                                ${generateStarRating(item.rating)}
                            </div>
                        </div>
                    </td>
                `;
            } else if (contentType === 'quizzes') {
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.attempts}</td>
                    <td>${item.completions}</td>
                    <td>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${item.pass_rate}%;" aria-valuenow="${item.pass_rate}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">${item.pass_rate.toFixed(1)}%</small>
                    </td>
                    <td>${item.avg_score.toFixed(1)}%</td>
                    <td>
                        ${getDifficultyBadge(item.difficulty)}
                    </td>
                `;
            } else if (contentType === 'exercises') {
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.attempts}</td>
                    <td>${item.completions}</td>
                    <td>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${item.completion_rate}%;" aria-valuenow="${item.completion_rate}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">${item.completion_rate.toFixed(1)}%</small>
                    </td>
                    <td>${item.avg_time_spent} min</td>
                    <td>
                        ${getDifficultyBadge(item.difficulty)}
                    </td>
                `;
            }
            
            tableBody.appendChild(row);
        });
    }
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @returns {string} HTML for star rating
 */
function generateStarRating(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(rating)) {
            stars += '<i class="bi bi-star-fill"></i>';
        } else if (i < Math.ceil(rating)) {
            stars += '<i class="bi bi-star-half"></i>';
        } else {
            stars += '<i class="bi bi-star"></i>';
        }
    }
    return stars;
}

/**
 * Get difficulty badge HTML
 * @param {number} difficulty - Difficulty value (0-100)
 * @returns {string} HTML for difficulty badge
 */
function getDifficultyBadge(difficulty) {
    if (difficulty < 30) {
        return '<span class="badge bg-success">Easy</span>';
    } else if (difficulty < 70) {
        return '<span class="badge bg-warning">Medium</span>';
    } else {
        return '<span class="badge bg-danger">Hard</span>';
    }
}

/**
 * Initialize export buttons
 */
function initExportButtons() {
    const exportButtons = document.querySelectorAll('.export-data-btn');
    exportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataType = this.dataset.type;
            const dateRange = document.getElementById('date-range-picker').value;
            
            // Parse date range
            let startDate, endDate;
            if (dateRange) {
                const dates = dateRange.split(' to ');
                startDate = dates[0];
                endDate = dates.length > 1 ? dates[1] : dates[0];
            } else {
                // Default to last 30 days
                endDate = new Date().toISOString().split('T')[0];
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }
            
            // Generate export URL
            const exportUrl = `/analytics/api/export-data?type=${dataType}&start_date=${startDate}&end_date=${endDate}`;
            
            // Create download link
            const link = document.createElement('a');
            link.href = exportUrl;
            link.download = `${dataType}_${startDate}_to_${endDate}.csv`;
            link.click();
        });
    });
}

/**
 * Store chart instance for later updates
 * @param {string} chartId - ID of the chart
 * @param {Chart} chart - Chart.js instance
 */
function registerChart(chartId, chart) {
    charts[chartId] = chart;
}

// Register charts when they're created
document.addEventListener('DOMContentLoaded', function() {
    // User Activity Chart
    const userActivityChart = Chart.getChart('userActivityChart');
    if (userActivityChart) {
        registerChart('userActivity', userActivityChart);
    }
    
    // User Distribution Chart
    const userDistributionChart = Chart.getChart('userDistributionChart');
    if (userDistributionChart) {
        registerChart('userDistribution', userDistributionChart);
    }
    
    // Retention Chart
    const retentionChart = Chart.getChart('retentionChart');
    if (retentionChart) {
        registerChart('retention', retentionChart);
    }
    
    // Subscription Chart
    const subscriptionChart = Chart.getChart('subscriptionChart');
    if (subscriptionChart) {
        registerChart('subscription', subscriptionChart);
    }
});
