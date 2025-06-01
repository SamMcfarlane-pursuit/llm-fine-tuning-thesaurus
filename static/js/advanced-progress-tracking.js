/**
 * Advanced Progress Tracking System
 * Provides comprehensive learning analytics, skill assessment, and personalized recommendations
 */

class AdvancedProgressTracker {
    constructor() {
        this.userId = this.getCurrentUserId();
        this.sessionData = {
            startTime: Date.now(),
            interactions: [],
            completedTasks: [],
            timeSpent: {},
            skillAssessments: {}
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserProgress();
        this.startSessionTracking();
        this.initializeSkillAssessment();
        this.setupRealtimeSync();
    }

    getCurrentUserId() {
        // Get user ID from data attribute or session
        const userElement = document.querySelector('[data-user-logged-in]');
        return userElement ? userElement.dataset.userId || 'anonymous' : 'anonymous';
    }

    setupEventListeners() {
        // Track page views
        this.trackPageView();

        // Track quiz completions
        document.addEventListener('quizCompleted', (e) => {
            this.trackQuizCompletion(e.detail);
        });

        // Track workshop progress
        document.addEventListener('workshopStepCompleted', (e) => {
            this.trackWorkshopProgress(e.detail);
        });

        // Track code execution
        document.addEventListener('codeExecuted', (e) => {
            this.trackCodeExecution(e.detail);
        });

        // Track time spent on sections
        this.setupTimeTracking();

        // Track scroll depth
        this.setupScrollTracking();

        // Track interaction patterns
        this.setupInteractionTracking();
    }

    trackPageView() {
        const pageData = {
            url: window.location.pathname,
            title: document.title,
            timestamp: Date.now(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };

        this.sessionData.interactions.push({
            type: 'page_view',
            data: pageData,
            timestamp: Date.now()
        });

        this.sendAnalytics('page_view', pageData);
    }

    trackQuizCompletion(quizData) {
        const completionData = {
            quizId: quizData.quizId,
            score: quizData.score,
            totalQuestions: quizData.totalQuestions,
            timeSpent: quizData.timeSpent,
            answers: quizData.answers,
            difficulty: quizData.difficulty,
            topic: quizData.topic
        };

        this.sessionData.completedTasks.push({
            type: 'quiz',
            data: completionData,
            timestamp: Date.now()
        });

        // Update skill assessment
        this.updateSkillAssessment(quizData.topic, quizData.score / quizData.totalQuestions);

        this.sendAnalytics('quiz_completed', completionData);
        this.updateProgressBadges(quizData);
    }

    trackWorkshopProgress(workshopData) {
        const progressData = {
            workshopId: workshopData.workshopId,
            stepId: workshopData.stepId,
            stepNumber: workshopData.stepNumber,
            totalSteps: workshopData.totalSteps,
            timeSpent: workshopData.timeSpent,
            codeExecuted: workshopData.codeExecuted || false
        };

        this.sessionData.completedTasks.push({
            type: 'workshop_step',
            data: progressData,
            timestamp: Date.now()
        });

        this.sendAnalytics('workshop_progress', progressData);
        this.updateWorkshopProgress(workshopData);
    }

    trackCodeExecution(codeData) {
        const executionData = {
            codeType: codeData.type,
            language: codeData.language,
            success: codeData.success,
            executionTime: codeData.executionTime,
            linesOfCode: codeData.code ? codeData.code.split('\n').length : 0,
            context: codeData.context
        };

        this.sessionData.interactions.push({
            type: 'code_execution',
            data: executionData,
            timestamp: Date.now()
        });

        this.sendAnalytics('code_executed', executionData);
    }

    setupTimeTracking() {
        let startTime = Date.now();
        let currentSection = this.getCurrentSection();

        // Track time when user switches tabs or leaves page
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordTimeSpent(currentSection, Date.now() - startTime);
            } else {
                startTime = Date.now();
            }
        });

        // Track time when user scrolls to different sections
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const newSection = entry.target.id || entry.target.className;
                    if (newSection !== currentSection) {
                        this.recordTimeSpent(currentSection, Date.now() - startTime);
                        currentSection = newSection;
                        startTime = Date.now();
                    }
                }
            });
        }, { threshold: 0.5 });

        // Observe all major sections
        document.querySelectorAll('section, .card, .workshop-step').forEach(el => {
            observer.observe(el);
        });
    }

    setupScrollTracking() {
        let maxScroll = 0;
        let scrollMilestones = [25, 50, 75, 90, 100];
        let reachedMilestones = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            maxScroll = Math.max(maxScroll, scrollPercent);

            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
                    reachedMilestones.add(milestone);
                    this.sendAnalytics('scroll_depth', {
                        milestone: milestone,
                        page: window.location.pathname,
                        timestamp: Date.now()
                    });
                }
            });
        });
    }

    setupInteractionTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, .card, .nav-link');
            if (target) {
                this.trackInteraction('click', {
                    element: target.tagName,
                    text: target.textContent?.trim().substring(0, 50),
                    href: target.href,
                    className: target.className,
                    timestamp: Date.now()
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackInteraction('form_submit', {
                formId: e.target.id,
                formAction: e.target.action,
                timestamp: Date.now()
            });
        });
    }

    updateSkillAssessment(topic, score) {
        if (!this.sessionData.skillAssessments[topic]) {
            this.sessionData.skillAssessments[topic] = {
                scores: [],
                averageScore: 0,
                improvement: 0,
                level: 'beginner'
            };
        }

        const topicData = this.sessionData.skillAssessments[topic];
        topicData.scores.push(score);
        
        const previousAverage = topicData.averageScore;
        topicData.averageScore = topicData.scores.reduce((a, b) => a + b, 0) / topicData.scores.length;
        topicData.improvement = topicData.averageScore - previousAverage;

        // Determine skill level
        if (topicData.averageScore >= 0.9) topicData.level = 'expert';
        else if (topicData.averageScore >= 0.7) topicData.level = 'advanced';
        else if (topicData.averageScore >= 0.5) topicData.level = 'intermediate';
        else topicData.level = 'beginner';

        this.updateSkillBadges(topic, topicData);
    }

    updateSkillBadges(topic, skillData) {
        const badgeContainer = document.querySelector('.skill-badges');
        if (!badgeContainer) return;

        const badge = document.createElement('div');
        badge.className = `skill-badge skill-${skillData.level}`;
        badge.innerHTML = `
            <div class="skill-badge-content">
                <h6>${topic}</h6>
                <div class="skill-level">${skillData.level}</div>
                <div class="skill-score">${Math.round(skillData.averageScore * 100)}%</div>
                ${skillData.improvement > 0 ? 
                    `<div class="skill-improvement">+${Math.round(skillData.improvement * 100)}%</div>` : 
                    ''
                }
            </div>
        `;

        badgeContainer.appendChild(badge);
    }

    generatePersonalizedRecommendations() {
        const recommendations = [];
        
        // Analyze weak areas
        Object.entries(this.sessionData.skillAssessments).forEach(([topic, data]) => {
            if (data.averageScore < 0.7) {
                recommendations.push({
                    type: 'improvement',
                    topic: topic,
                    message: `Consider reviewing ${topic} concepts`,
                    action: 'practice',
                    priority: 'high'
                });
            }
        });

        // Suggest next steps based on progress
        const completedTopics = Object.keys(this.sessionData.skillAssessments);
        if (completedTopics.includes('lora') && !completedTopics.includes('qlora')) {
            recommendations.push({
                type: 'progression',
                topic: 'qlora',
                message: 'Ready to learn QLoRA? Build on your LoRA knowledge!',
                action: 'start_learning',
                priority: 'medium'
            });
        }

        this.displayRecommendations(recommendations);
        return recommendations;
    }

    displayRecommendations(recommendations) {
        const container = document.querySelector('.recommendations-container');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <div class="recommendation-content">
                    <h6>${rec.message}</h6>
                    <button class="btn btn-sm btn-primary" onclick="advancedTracker.followRecommendation('${rec.action}', '${rec.topic}')">
                        ${rec.action === 'practice' ? 'Practice Now' : 'Start Learning'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    followRecommendation(action, topic) {
        if (action === 'practice') {
            window.location.href = `/quiz/?topic=${topic}`;
        } else if (action === 'start_learning') {
            window.location.href = `/tutorials?topic=${topic}`;
        }
        
        this.sendAnalytics('recommendation_followed', { action, topic });
    }

    generateProgressReport() {
        const report = {
            totalTimeSpent: Object.values(this.sessionData.timeSpent).reduce((a, b) => a + b, 0),
            completedQuizzes: this.sessionData.completedTasks.filter(t => t.type === 'quiz').length,
            completedWorkshops: this.sessionData.completedTasks.filter(t => t.type === 'workshop_step').length,
            skillLevels: this.sessionData.skillAssessments,
            recommendations: this.generatePersonalizedRecommendations(),
            learningStreak: this.calculateLearningStreak(),
            achievements: this.calculateAchievements()
        };

        return report;
    }

    sendAnalytics(eventType, data) {
        if (typeof apiEndpoints !== 'undefined' && apiEndpoints.analyticsTrack) {
            fetch(apiEndpoints.analyticsTrack, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    event_type: eventType,
                    data: data,
                    user_id: this.userId,
                    session_id: this.sessionId,
                    timestamp: Date.now()
                })
            }).catch(err => console.warn('Analytics tracking failed:', err));
        }
    }

    // Helper methods
    getCurrentSection() {
        return document.querySelector('h1, h2')?.textContent || 'unknown';
    }

    recordTimeSpent(section, duration) {
        if (!this.sessionData.timeSpent[section]) {
            this.sessionData.timeSpent[section] = 0;
        }
        this.sessionData.timeSpent[section] += duration;
    }

    trackInteraction(type, data) {
        this.sessionData.interactions.push({ type, data, timestamp: Date.now() });
    }

    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    calculateLearningStreak() {
        // Implementation for calculating consecutive learning days
        return 5; // Placeholder
    }

    calculateAchievements() {
        // Implementation for calculating earned achievements
        return ['First Quiz', 'Code Runner', 'Workshop Warrior']; // Placeholder
    }
}

// Initialize the advanced progress tracker
let advancedTracker;
document.addEventListener('DOMContentLoaded', () => {
    advancedTracker = new AdvancedProgressTracker();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedProgressTracker;
}
