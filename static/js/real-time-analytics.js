/**
 * Real-Time Analytics Dashboard JavaScript
 * Provides live updates of analytics data
 */

// Update interval in milliseconds
const UPDATE_INTERVAL = 10000; // 10 seconds

// Store chart references
let charts = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Register charts for updates
    registerCharts();
    
    // Add real-time indicator
    addRealTimeIndicator();
});

/**
 * Initialize real-time updates
 */
function initRealTimeUpdates() {
    // Start update loop
    updateRealTimeStats();
    setInterval(updateRealTimeStats, UPDATE_INTERVAL);
}

/**
 * Update real-time statistics
 */
function updateRealTimeStats() {
    fetch('/api/analytics/real-time')
        .then(response => response.json())
        .then(data => {
            // Update stats with animation
            updateStatWithAnimation('active-users', data.active_users);
            updateStatWithAnimation('page-views-today', data.page_views_today);
            updateStatWithAnimation('completion-rate', data.completion_rate + '%');
            updateStatWithAnimation('conversion-rate', data.conversion_rate + '%');
            
            // Update charts
            updateCharts(data);
            
            // Update last updated time
            updateLastUpdatedTime();
        })
        .catch(error => console.error('Error updating real-time stats:', error));
}

/**
 * Update a statistic with animation
 * @param {string} elementId - ID of the element to update
 * @param {string|number} value - New value
 */
function updateStatWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add animation class
        element.classList.add('data-refresh');
        
        // Update value
        element.textContent = value;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('data-refresh');
        }, 500);
    }
}

/**
 * Update charts with new data
 * @param {Object} data - New data for charts
 */
function updateCharts(data) {
    // Update user activity chart
    if (charts.userActivity && data.user_activity) {
        charts.userActivity.data.datasets[0].data = data.user_activity.active_users;
        charts.userActivity.data.datasets[1].data = data.user_activity.page_views;
        charts.userActivity.update();
    }
    
    // Update content performance
    if (data.content_performance) {
        updateContentPerformanceTables(data.content_performance);
    }
    
    // Update user journey funnel
    if (data.user_journey) {
        updateUserJourneyFunnel(data.user_journey);
    }
}

/**
 * Update content performance tables
 * @param {Object} data - Content performance data
 */
function updateContentPerformanceTables(data) {
    // Update tutorials table
    updateContentTable('tutorials-table', data.tutorials);
    
    // Update quizzes table
    updateContentTable('quizzes-table', data.quizzes);
    
    // Update exercises table
    updateContentTable('exercises-table', data.exercises);
}

/**
 * Update a content performance table
 * @param {string} tableId - ID of the table to update
 * @param {Array} items - Array of content items
 */
function updateContentTable(tableId, items) {
    const table = document.getElementById(tableId);
    if (table && items && items.length > 0) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            // Clear existing rows
            tbody.innerHTML = '';
            
            // Add new rows
            items.forEach(item => {
                const row = document.createElement('tr');
                
                // Create cells based on table type
                if (tableId === 'tutorials-table') {
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
                } else if (tableId === 'quizzes-table') {
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
                } else if (tableId === 'exercises-table') {
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
                
                tbody.appendChild(row);
            });
        }
    }
}

/**
 * Update user journey funnel
 * @param {Object} data - User journey data
 */
function updateUserJourneyFunnel(data) {
    // Update funnel steps
    updateFunnelStep('signup-to-tutorial', data.signup_to_tutorial);
    updateFunnelStep('tutorial-to-quiz', data.tutorial_to_quiz);
    updateFunnelStep('quiz-to-subscription', data.quiz_to_subscription);
    
    // Update metrics
    updateMetric('avg-tutorials-per-user', data.average_tutorials_per_user.toFixed(1));
    updateMetric('avg-quizzes-per-user', data.average_quizzes_per_user.toFixed(1));
    updateMetric('avg-time-to-subscription', data.average_time_to_subscription + ' days');
}

/**
 * Update a funnel step
 * @param {string} stepId - ID of the funnel step
 * @param {number} value - New value
 */
function updateFunnelStep(stepId, value) {
    const step = document.getElementById(stepId);
    if (step) {
        // Update width
        step.style.width = value + '%';
        
        // Update value text
        const valueElement = step.querySelector('.funnel-value');
        if (valueElement) {
            valueElement.textContent = value.toFixed(1) + '%';
        }
    }
}

/**
 * Update a metric
 * @param {string} metricId - ID of the metric
 * @param {string|number} value - New value
 */
function updateMetric(metricId, value) {
    const element = document.getElementById(metricId);
    if (element) {
        element.textContent = value;
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
 * Register charts for updates
 */
function registerCharts() {
    // Find charts in the page
    const userActivityChart = document.getElementById('userActivityChart');
    if (userActivityChart) {
        charts.userActivity = Chart.getChart(userActivityChart);
    }
    
    const userDistributionChart = document.getElementById('userDistributionChart');
    if (userDistributionChart) {
        charts.userDistribution = Chart.getChart(userDistributionChart);
    }
    
    const retentionChart = document.getElementById('retentionChart');
    if (retentionChart) {
        charts.retention = Chart.getChart(retentionChart);
    }
    
    const subscriptionChart = document.getElementById('subscriptionChart');
    if (subscriptionChart) {
        charts.subscription = Chart.getChart(subscriptionChart);
    }
}

/**
 * Add real-time indicator to the page
 */
function addRealTimeIndicator() {
    const header = document.querySelector('.dashboard-header');
    if (header) {
        // Create indicator element
        const indicator = document.createElement('div');
        indicator.className = 'real-time-indicator-container ms-2';
        indicator.innerHTML = `
            <span class="real-time-indicator"></span>
            <span class="real-time-text">Real-time</span>
            <span class="real-time-updated" id="last-updated-time">Updated just now</span>
        `;
        
        // Add to header
        header.appendChild(indicator);
    }
}

/**
 * Update the last updated time
 */
function updateLastUpdatedTime() {
    const timeElement = document.getElementById('last-updated-time');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        timeElement.textContent = `Updated at ${hours}:${minutes}:${seconds}`;
    }
}
