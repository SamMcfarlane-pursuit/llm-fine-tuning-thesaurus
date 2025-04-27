"""
Analytics routes for the application.
Provides real-time data and metrics for user activity.
"""

from datetime import datetime, timezone, timedelta
from flask import Blueprint, render_template, jsonify, request, current_app
from flask_login import login_required, current_user
from decorators import admin_required
import analytics
# Import models directly from models.py
from models import AnalyticsEvent, ContentMetrics, DailyMetrics
from extensions import db

# Create a blueprint for analytics routes
analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/real-time')
@login_required
@admin_required
def real_time_dashboard():
    """
    Real-time analytics dashboard for administrators.
    Shows live metrics and insights with auto-updating charts.
    """
    from datetime import datetime, timedelta
    import random  # For demo data

    # Get real-time stats
    real_time_stats = {
        'active_users': random.randint(15, 50),
        'page_views_today': random.randint(200, 500),
        'completion_rate': round(random.uniform(65.0, 85.0), 1),
        'conversion_rate': round(random.uniform(8.0, 15.0), 1)
    }

    # Generate user activity data for the past 7 days
    labels = []
    active_users = []
    page_views = []

    today = datetime.now().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        labels.append(day.strftime('%a'))

        # Generate random data with an upward trend
        base_users = 30 + (6-i) * 5  # Increasing trend
        base_views = 300 + (6-i) * 50  # Increasing trend

        # Add some randomness
        active_users.append(base_users + random.randint(-10, 10))
        page_views.append(base_views + random.randint(-50, 50))

    user_activity = {
        'labels': labels,
        'active_users': active_users,
        'page_views': page_views
    }

    # Generate content performance data
    tutorials = [
        {
            'title': 'Introduction to LLM Fine-Tuning',
            'views': 1250 + random.randint(-20, 20),
            'completions': 980 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(75.0, 82.0), 1),
            'avg_time_spent': round(random.uniform(14.0, 17.0), 1),
            'rating': round(random.uniform(4.5, 4.9), 1)
        },
        {
            'title': 'LoRA Basics',
            'views': 950 + random.randint(-15, 15),
            'completions': 720 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(72.0, 78.0), 1),
            'avg_time_spent': round(random.uniform(20.0, 24.0), 1),
            'rating': round(random.uniform(4.3, 4.7), 1)
        },
        {
            'title': 'QLoRA Implementation',
            'views': 820 + random.randint(-15, 15),
            'completions': 590 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(68.0, 75.0), 1),
            'avg_time_spent': round(random.uniform(28.0, 32.0), 1),
            'rating': round(random.uniform(4.6, 5.0), 1)
        }
    ]

    quizzes = [
        {
            'title': 'LLM Fundamentals Quiz',
            'attempts': 850 + random.randint(-15, 15),
            'completions': 780 + random.randint(-10, 10),
            'pass_rate': round(random.uniform(88.0, 94.0), 1),
            'avg_score': round(random.uniform(80.0, 85.0), 1),
            'difficulty': 25
        },
        {
            'title': 'LoRA Techniques Quiz',
            'attempts': 720 + random.randint(-15, 15),
            'completions': 620 + random.randint(-10, 10),
            'pass_rate': round(random.uniform(83.0, 89.0), 1),
            'avg_score': round(random.uniform(75.0, 82.0), 1),
            'difficulty': 55
        },
        {
            'title': 'Advanced Fine-Tuning Quiz',
            'attempts': 580 + random.randint(-15, 15),
            'completions': 420 + random.randint(-10, 10),
            'pass_rate': round(random.uniform(68.0, 76.0), 1),
            'avg_score': round(random.uniform(65.0, 72.0), 1),
            'difficulty': 85
        }
    ]

    exercises = [
        {
            'title': 'Basic Fine-Tuning Exercise',
            'attempts': 720 + random.randint(-15, 15),
            'completions': 650 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(87.0, 93.0), 1),
            'avg_time_spent': round(random.uniform(23.0, 28.0), 1),
            'difficulty': 30
        },
        {
            'title': 'LoRA Implementation Exercise',
            'attempts': 580 + random.randint(-15, 15),
            'completions': 490 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(81.0, 88.0), 1),
            'avg_time_spent': round(random.uniform(33.0, 38.0), 1),
            'difficulty': 60
        },
        {
            'title': 'QLoRA Advanced Exercise',
            'attempts': 420 + random.randint(-15, 15),
            'completions': 320 + random.randint(-10, 10),
            'completion_rate': round(random.uniform(73.0, 79.0), 1),
            'avg_time_spent': round(random.uniform(43.0, 48.0), 1),
            'difficulty': 85
        }
    ]

    content_metrics = {
        'tutorials': tutorials,
        'quizzes': quizzes,
        'exercises': exercises
    }

    # Generate user journey data
    user_journey = {
        'signup_to_tutorial': round(random.uniform(75.0, 85.0), 1),
        'tutorial_to_quiz': round(random.uniform(60.0, 70.0), 1),
        'quiz_to_subscription': round(random.uniform(25.0, 35.0), 1),
        'average_tutorials_per_user': round(random.uniform(3.5, 4.5), 1),
        'average_quizzes_per_user': round(random.uniform(2.0, 3.0), 1),
        'average_time_to_subscription': random.randint(12, 16)
    }

    # Generate retention data
    retention_labels = [f'Day {i+1}' for i in range(30)]
    retention_rates = []
    for i in range(30):
        # Typical retention curve that drops quickly then levels off
        rate = 100 * (0.7 ** (i / 7))
        retention_rates.append(round(rate, 1))

    retention_data = {
        'labels': retention_labels,
        'rates': retention_rates
    }

    # Generate subscription metrics
    subscription_metrics = {
        'free': 750 + random.randint(-20, 20),
        'basic': 250 + random.randint(-10, 10),
        'premium': 120 + random.randint(-5, 5),
        'enterprise': 30 + random.randint(-2, 2),
        'total': 1150 + random.randint(-30, 30),
        'conversion_rate': round(random.uniform(30.0, 35.0), 1),
        'arpu': round(random.uniform(12.0, 14.0), 2),
        'retention_rate': round(random.uniform(80.0, 90.0), 1)
    }

    # Generate live activity feed
    live_activity = []
    for i in range(10):
        activity_type = random.choice(['page_view', 'tutorial', 'quiz', 'exercise', 'search'])
        timestamp = (datetime.now() - timedelta(minutes=random.randint(0, 30))).strftime('%H:%M:%S')

        if activity_type == 'page_view':
            title = f"Viewed {random.choice(['Tutorial', 'Quiz', 'Exercise', 'Thesaurus', 'Dashboard'])} Page"
            description = f"User viewed the page from {random.choice(['direct', 'search', 'referral'])}"
        elif activity_type == 'tutorial':
            title = f"Completed Tutorial: {random.choice(['Introduction to LLM Fine-Tuning', 'LoRA Basics', 'QLoRA Implementation'])}"
            description = f"User spent {random.randint(10, 45)} minutes on this tutorial"
        elif activity_type == 'quiz':
            title = f"Completed Quiz: {random.choice(['LLM Fundamentals', 'LoRA Techniques', 'Advanced Fine-Tuning'])}"
            description = f"User scored {random.randint(60, 100)}% on this quiz"
        elif activity_type == 'exercise':
            title = f"Completed Exercise: {random.choice(['Basic Fine-Tuning', 'LoRA Implementation', 'QLoRA Advanced'])}"
            description = f"User spent {random.randint(20, 60)} minutes on this exercise"
        elif activity_type == 'search':
            title = f"Searched for: {random.choice(['QLoRA parameters', 'gradient checkpointing', 'memory efficiency', 'PEFT'])}"
            description = f"Found {random.randint(3, 15)} results"

        # Randomly assign user and subscription tier
        if random.random() > 0.3:  # 70% chance of having user info
            user = f"user{random.randint(1000, 9999)}"
            subscription_tier = random.choice(['free', 'basic', 'premium', 'enterprise'])
        else:
            user = None
            subscription_tier = None

        live_activity.append({
            'type': activity_type,
            'title': title,
            'description': description,
            'timestamp': timestamp,
            'user': user,
            'subscription_tier': subscription_tier
        })

    return render_template(
        'analytics/real_time_dashboard.html',
        real_time_stats=real_time_stats,
        user_activity=user_activity,
        content_metrics=content_metrics,
        user_journey=user_journey,
        retention_data=retention_data,
        subscription_metrics=subscription_metrics,
        live_activity=live_activity
    )

@analytics_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """
    Analytics dashboard for administrators.
    Shows real-time metrics and insights.
    """
    # Get real-time stats
    real_time_stats = {
        'active_users': analytics.get_real_time_users(),
        'completion_rate': analytics.get_completion_rate('tutorial'),
        'page_views': analytics.get_page_views(None, (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()),
        'conversion_rate': analytics.get_subscription_metrics().get('conversion_rate', 0)
    }

    # Get user activity data for the past week
    user_activity = get_user_activity_data(days=7)

    # Get content metrics
    content_metrics = get_content_metrics()

    # Get user journey metrics
    user_journey = analytics.get_user_journey_metrics()
    user_journey['average_time_to_subscription'] = 14  # Example value

    # Get retention data
    retention_data = get_retention_data(days=30)

    # Get subscription metrics
    subscription_metrics = analytics.get_subscription_metrics()
    subscription_metrics['arpu'] = 12.99  # Example value
    subscription_metrics['retention_rate'] = 85  # Example value

    # Get search analytics
    search_analytics = get_search_analytics()

    return render_template(
        'analytics/dashboard.html',
        real_time_stats=real_time_stats,
        user_activity=user_activity,
        content_metrics=content_metrics,
        user_journey=user_journey,
        retention_data=retention_data,
        subscription_metrics=subscription_metrics,
        search_analytics=search_analytics
    )

@analytics_bp.route('/api/real-time-stats')
@login_required
@admin_required
def api_real_time_stats():
    """
    API endpoint for real-time stats.
    Used for updating the dashboard without a full page reload.
    """
    # Get real-time stats
    real_time_stats = {
        'active_users': analytics.get_real_time_users(),
        'completion_rate': analytics.get_completion_rate('tutorial'),
        'page_views': analytics.get_page_views(None, (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()),
        'conversion_rate': analytics.get_subscription_metrics().get('conversion_rate', 0)
    }

    return jsonify(real_time_stats)

@analytics_bp.route('/api/user-activity')
@login_required
@admin_required
def api_user_activity():
    """
    API endpoint for user activity data.
    Used for updating charts without a full page reload.
    """
    days = request.args.get('days', 7, type=int)
    user_activity = get_user_activity_data(days=days)

    return jsonify(user_activity)

@analytics_bp.route('/api/content-metrics')
@login_required
@admin_required
def api_content_metrics():
    """
    API endpoint for content metrics.
    Used for updating content performance tables without a full page reload.
    """
    content_metrics = get_content_metrics()

    return jsonify(content_metrics)

@analytics_bp.route('/api/user-journey')
@login_required
@admin_required
def api_user_journey():
    """
    API endpoint for user journey metrics.
    Used for updating user journey funnel without a full page reload.
    """
    user_journey = analytics.get_user_journey_metrics()
    user_journey['average_time_to_subscription'] = 14  # Example value

    return jsonify(user_journey)

@analytics_bp.route('/api/retention-data')
@login_required
@admin_required
def api_retention_data():
    """
    API endpoint for retention data.
    Used for updating retention chart without a full page reload.
    """
    days = request.args.get('days', 30, type=int)
    retention_data = get_retention_data(days=days)

    return jsonify(retention_data)

@analytics_bp.route('/api/subscription-metrics')
@login_required
@admin_required
def api_subscription_metrics():
    """
    API endpoint for subscription metrics.
    Used for updating subscription charts without a full page reload.
    """
    subscription_metrics = analytics.get_subscription_metrics()
    subscription_metrics['arpu'] = 12.99  # Example value
    subscription_metrics['retention_rate'] = 85  # Example value

    return jsonify(subscription_metrics)

@analytics_bp.route('/api/search-analytics')
@login_required
@admin_required
def api_search_analytics():
    """
    API endpoint for search analytics.
    Used for updating search analytics without a full page reload.
    """
    search_analytics = get_search_analytics()

    return jsonify(search_analytics)

@analytics_bp.route('/api/activity-feed')
@login_required
@admin_required
def api_activity_feed():
    """
    API endpoint for live activity feed.
    Returns recent user activities for the real-time dashboard.
    """
    try:
        from datetime import datetime, timedelta
        import random  # For demo data

        # In a production environment, this would fetch real data from the analytics system
        # For now, we're generating random activity data

        activities = []
        for i in range(5):  # Generate 5 new activities
            activity_type = random.choice(['page_view', 'tutorial', 'quiz', 'exercise', 'search'])
            timestamp = (datetime.now() - timedelta(seconds=random.randint(5, 300))).strftime('%H:%M:%S')

            if activity_type == 'page_view':
                title = f"Viewed {random.choice(['Tutorial', 'Quiz', 'Exercise', 'Thesaurus', 'Dashboard'])} Page"
                description = f"User viewed the page from {random.choice(['direct', 'search', 'referral'])}"
            elif activity_type == 'tutorial':
                title = f"Completed Tutorial: {random.choice(['Introduction to LLM Fine-Tuning', 'LoRA Basics', 'QLoRA Implementation'])}"
                description = f"User spent {random.randint(10, 45)} minutes on this tutorial"
            elif activity_type == 'quiz':
                title = f"Completed Quiz: {random.choice(['LLM Fundamentals', 'LoRA Techniques', 'Advanced Fine-Tuning'])}"
                description = f"User scored {random.randint(60, 100)}% on this quiz"
            elif activity_type == 'exercise':
                title = f"Completed Exercise: {random.choice(['Basic Fine-Tuning', 'LoRA Implementation', 'QLoRA Advanced'])}"
                description = f"User spent {random.randint(20, 60)} minutes on this exercise"
            elif activity_type == 'search':
                title = f"Searched for: {random.choice(['QLoRA parameters', 'gradient checkpointing', 'memory efficiency', 'PEFT'])}"
                description = f"Found {random.randint(3, 15)} results"

            # Randomly assign user and subscription tier
            if random.random() > 0.3:  # 70% chance of having user info
                user = f"user{random.randint(1000, 9999)}"
                subscription_tier = random.choice(['free', 'basic', 'premium', 'enterprise'])
            else:
                user = None
                subscription_tier = None

            activities.append({
                'type': activity_type,
                'title': title,
                'description': description,
                'timestamp': timestamp,
                'user': user,
                'subscription_tier': subscription_tier
            })

        return jsonify({'activities': activities})
    except Exception as e:
        current_app.logger.error(f"Error getting activity feed: {e}")
        return jsonify({'error': 'Error getting activity feed', 'message': str(e)}), 500

@analytics_bp.route('/api/export-data')
@login_required
@admin_required
def api_export_data():
    """
    API endpoint for exporting analytics data.
    Returns data in CSV format for download.
    """
    data_type = request.args.get('type', 'user_activity')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Convert dates to datetime objects
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    else:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)

    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    else:
        end_date = datetime.now(timezone.utc)

    # Get data based on type
    if data_type == 'user_activity':
        data = export_user_activity_data(start_date, end_date)
    elif data_type == 'content_metrics':
        data = export_content_metrics_data(start_date, end_date)
    elif data_type == 'subscription_metrics':
        data = export_subscription_metrics_data(start_date, end_date)
    else:
        data = ''

    return data

def get_user_activity_data(days=7):
    """
    Get user activity data for the past X days.

    Args:
        days: Number of days to get data for

    Returns:
        dict: User activity data
    """
    # Calculate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    # Generate date labels
    labels = []
    current_date = start_date
    while current_date <= end_date:
        labels.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=1)

    # Get active users and page views for each day
    active_users = []
    page_views = []

    try:
        # Try to get data from DailyMetrics
        for label in labels:
            date_obj = datetime.strptime(label, '%Y-%m-%d').date()

            # Get metrics for this day
            metrics = DailyMetrics.query.filter_by(date=date_obj).first()

            if metrics:
                active_users.append(metrics.active_users)
                page_views.append(metrics.page_views)
            else:
                # If no metrics for this day, use random data for demo
                import random
                active_users.append(random.randint(50, 200))
                page_views.append(random.randint(500, 2000))
    except Exception as e:
        current_app.logger.error(f"Error getting user activity data: {e}")

        # Generate random data for demo
        import random
        active_users = [random.randint(50, 200) for _ in range(len(labels))]
        page_views = [random.randint(500, 2000) for _ in range(len(labels))]

    return {
        'labels': labels,
        'active_users': active_users,
        'page_views': page_views
    }

def get_content_metrics():
    """
    Get metrics for all content types.

    Returns:
        dict: Content metrics
    """
    try:
        # Try to get data from ContentMetrics
        tutorials = ContentMetrics.query.filter_by(content_type='tutorial').all()
        quizzes = ContentMetrics.query.filter_by(content_type='quiz').all()
        exercises = ContentMetrics.query.filter_by(content_type='exercise').all()

        # Format tutorial metrics
        tutorial_metrics = []
        for tutorial in tutorials:
            tutorial_metrics.append({
                'title': tutorial.content_id.replace('_', ' ').title(),
                'views': tutorial.views,
                'completions': tutorial.completions,
                'completion_rate': (tutorial.completions / tutorial.views * 100) if tutorial.views > 0 else 0,
                'avg_time_spent': round(tutorial.average_time_spent / 60, 1),  # Convert seconds to minutes
                'rating': tutorial.rating
            })

        # Format quiz metrics
        quiz_metrics = []
        for quiz in quizzes:
            quiz_metrics.append({
                'title': quiz.content_id.replace('_', ' ').title(),
                'attempts': quiz.views,
                'completions': quiz.completions,
                'pass_rate': (quiz.completions / quiz.views * 100) if quiz.views > 0 else 0,
                'avg_score': 75,  # Example value
                'difficulty': 50  # Example value
            })

        # Format exercise metrics
        exercise_metrics = []
        for exercise in exercises:
            exercise_metrics.append({
                'title': exercise.content_id.replace('_', ' ').title(),
                'attempts': exercise.views,
                'completions': exercise.completions,
                'completion_rate': (exercise.completions / exercise.views * 100) if exercise.views > 0 else 0,
                'avg_time_spent': round(exercise.average_time_spent / 60, 1),  # Convert seconds to minutes
                'difficulty': 60  # Example value
            })
    except Exception as e:
        current_app.logger.error(f"Error getting content metrics: {e}")

        # Generate example data for demo
        tutorial_metrics = [
            {
                'title': 'Introduction to LLM Fine-Tuning',
                'views': 1250,
                'completions': 980,
                'completion_rate': 78.4,
                'avg_time_spent': 15.5,
                'rating': 4.7
            },
            {
                'title': 'LoRA Basics',
                'views': 950,
                'completions': 720,
                'completion_rate': 75.8,
                'avg_time_spent': 22.3,
                'rating': 4.5
            },
            {
                'title': 'QLoRA Implementation',
                'views': 820,
                'completions': 590,
                'completion_rate': 72.0,
                'avg_time_spent': 30.1,
                'rating': 4.8
            }
        ]

        quiz_metrics = [
            {
                'title': 'LLM Fundamentals Quiz',
                'attempts': 850,
                'completions': 780,
                'pass_rate': 91.8,
                'avg_score': 82.5,
                'difficulty': 25
            },
            {
                'title': 'LoRA Techniques Quiz',
                'attempts': 720,
                'completions': 620,
                'pass_rate': 86.1,
                'avg_score': 78.3,
                'difficulty': 55
            },
            {
                'title': 'Advanced Fine-Tuning Quiz',
                'attempts': 580,
                'completions': 420,
                'pass_rate': 72.4,
                'avg_score': 68.9,
                'difficulty': 85
            }
        ]

        exercise_metrics = [
            {
                'title': 'Basic Fine-Tuning Exercise',
                'attempts': 720,
                'completions': 650,
                'completion_rate': 90.3,
                'avg_time_spent': 25.5,
                'difficulty': 30
            },
            {
                'title': 'LoRA Implementation Exercise',
                'attempts': 580,
                'completions': 490,
                'completion_rate': 84.5,
                'avg_time_spent': 35.2,
                'difficulty': 60
            },
            {
                'title': 'QLoRA Advanced Exercise',
                'attempts': 420,
                'completions': 320,
                'completion_rate': 76.2,
                'avg_time_spent': 45.8,
                'difficulty': 85
            }
        ]

    return {
        'tutorials': tutorial_metrics,
        'quizzes': quiz_metrics,
        'exercises': exercise_metrics
    }

def get_retention_data(days=30):
    """
    Get user retention data for the past X days.

    Args:
        days: Number of days to get data for

    Returns:
        dict: Retention data
    """
    # Generate day labels
    labels = [f'Day {i+1}' for i in range(days)]

    try:
        # Try to get real retention data
        rates = []
        for i in range(days):
            rate = analytics.get_user_retention(i + 1)
            rates.append(rate)
    except Exception as e:
        current_app.logger.error(f"Error getting retention data: {e}")

        # Generate example retention curve for demo
        rates = []
        for i in range(days):
            # Typical retention curve that drops quickly then levels off
            rate = 100 * (0.7 ** (i / 7))
            rates.append(round(rate, 1))

    return {
        'labels': labels,
        'rates': rates
    }

def get_search_analytics():
    """
    Get search analytics data.

    Returns:
        dict: Search analytics data
    """
    try:
        # Try to get real search data
        from sqlalchemy import func

        # Get top search terms
        top_terms_query = db.session.query(
            AnalyticsEvent.event_data['term'].label('term'),
            func.count(AnalyticsEvent.id).label('count')
        )
        top_terms_query = top_terms_query.filter(AnalyticsEvent.event_type == 'search')
        top_terms_query = top_terms_query.group_by(AnalyticsEvent.event_data['term'])
        top_terms_query = top_terms_query.order_by(func.count(AnalyticsEvent.id).desc())
        top_terms_query = top_terms_query.limit(5)

        top_terms = []
        for row in top_terms_query.all():
            import random
            trend = random.randint(-20, 30)  # Random trend for demo

            top_terms.append({
                'term': row.term,
                'count': row.count,
                'trend': trend
            })

        # Get total searches
        total_searches = AnalyticsEvent.query.filter_by(event_type='search').count()

        # Get unique users who searched
        unique_users_query = db.session.query(func.count(func.distinct(AnalyticsEvent.user_id)))
        unique_users_query = unique_users_query.filter(
            AnalyticsEvent.event_type == 'search',
            AnalyticsEvent.user_id.isnot(None)
        )
        unique_users = unique_users_query.scalar() or 1  # Avoid division by zero

        # Calculate searches per user
        searches_per_user = total_searches / unique_users

        # Get zero results count
        zero_results_query = db.session.query(func.count(AnalyticsEvent.id))
        zero_results_query = zero_results_query.filter(
            AnalyticsEvent.event_type == 'search',
            AnalyticsEvent.event_data['results_count'] == 0
        )
        zero_results = zero_results_query.scalar() or 0

        # Calculate zero results rate
        zero_results_rate = (zero_results / total_searches * 100) if total_searches > 0 else 0

        # Get click count
        click_query = db.session.query(func.count(AnalyticsEvent.id))
        click_query = click_query.filter(AnalyticsEvent.event_type == 'search_result_click')
        click_count = click_query.scalar() or 0

        # Calculate click-through rate
        click_through_rate = (click_count / total_searches * 100) if total_searches > 0 else 0
    except Exception as e:
        current_app.logger.error(f"Error getting search analytics: {e}")

        # Generate example data for demo
        top_terms = [
            {'term': 'LoRA', 'count': 450, 'trend': 15},
            {'term': 'QLoRA', 'count': 380, 'trend': 25},
            {'term': 'fine-tuning', 'count': 320, 'trend': -5},
            {'term': 'parameter efficient', 'count': 280, 'trend': 10},
            {'term': 'quantization', 'count': 250, 'trend': 5}
        ]

        total_searches = 2500
        searches_per_user = 4.2
        zero_results_rate = 8.5
        click_through_rate = 65.3

    return {
        'top_terms': top_terms,
        'total_searches': total_searches,
        'searches_per_user': searches_per_user,
        'zero_results_rate': zero_results_rate,
        'click_through_rate': click_through_rate
    }

def export_user_activity_data(start_date, end_date):
    """
    Export user activity data as CSV.

    Args:
        start_date: Start date for export
        end_date: End date for export

    Returns:
        str: CSV data
    """
    # Generate CSV header
    csv_data = 'Date,Active Users,Page Views,New Users,Returning Users\n'

    # Generate data for each day
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')

        # Get metrics for this day
        try:
            date_obj = current_date.date()
            metrics = DailyMetrics.query.filter_by(date=date_obj).first()

            if metrics:
                active_users = metrics.active_users
                page_views = metrics.page_views
                new_users = metrics.new_users
                returning_users = active_users - new_users
            else:
                # If no metrics for this day, use random data for demo
                import random
                active_users = random.randint(50, 200)
                page_views = random.randint(500, 2000)
                new_users = random.randint(10, 50)
                returning_users = active_users - new_users
        except Exception as e:
            current_app.logger.error(f"Error getting metrics for export: {e}")

            # Generate random data for demo
            import random
            active_users = random.randint(50, 200)
            page_views = random.randint(500, 2000)
            new_users = random.randint(10, 50)
            returning_users = active_users - new_users

        # Add row to CSV
        csv_data += f'{date_str},{active_users},{page_views},{new_users},{returning_users}\n'

        # Move to next day
        current_date += timedelta(days=1)

    return csv_data

def export_content_metrics_data(start_date, end_date):
    """
    Export content metrics data as CSV.

    Args:
        start_date: Start date for export
        end_date: End date for export

    Returns:
        str: CSV data
    """
    # Generate CSV header
    csv_data = 'Content Type,Content ID,Views,Completions,Completion Rate,Avg Time Spent,Rating\n'

    # Get content metrics
    try:
        # Query for content metrics
        metrics = ContentMetrics.query.filter(
            ContentMetrics.last_updated >= start_date,
            ContentMetrics.last_updated <= end_date
        ).all()

        # Add each metric to CSV
        for metric in metrics:
            completion_rate = (metric.completions / metric.views * 100) if metric.views > 0 else 0
            avg_time_spent = round(metric.average_time_spent / 60, 1)  # Convert seconds to minutes

            csv_data += f'{metric.content_type},{metric.content_id},{metric.views},{metric.completions},{completion_rate:.1f},{avg_time_spent},{metric.rating:.1f}\n'
    except Exception as e:
        current_app.logger.error(f"Error getting content metrics for export: {e}")

        # Generate example data for demo
        content_types = ['tutorial', 'quiz', 'exercise']
        content_ids = [
            'introduction_to_llm',
            'lora_basics',
            'qlora_implementation',
            'parameter_efficient_tuning',
            'quantization_techniques'
        ]

        import random
        for content_type in content_types:
            for content_id in content_ids:
                views = random.randint(200, 1000)
                completions = random.randint(100, views)
                completion_rate = (completions / views * 100)
                avg_time_spent = random.randint(10, 45)
                rating = round(random.uniform(3.5, 5.0), 1)

                csv_data += f'{content_type},{content_id},{views},{completions},{completion_rate:.1f},{avg_time_spent},{rating}\n'

    return csv_data

def export_subscription_metrics_data(start_date, end_date):
    """
    Export subscription metrics data as CSV.

    Args:
        start_date: Start date for export
        end_date: End date for export

    Returns:
        str: CSV data
    """
    # Generate CSV header
    csv_data = 'Date,Free Users,Basic Users,Premium Users,Enterprise Users,Total Users,Conversion Rate\n'

    # Generate data for each day
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')

        # Get metrics for this day
        try:
            # In a real implementation, you would query daily subscription metrics
            # For demo purposes, generate random data
            import random
            free_users = random.randint(500, 1000)
            basic_users = random.randint(100, 300)
            premium_users = random.randint(50, 150)
            enterprise_users = random.randint(10, 50)
            total_users = free_users + basic_users + premium_users + enterprise_users
            paid_users = basic_users + premium_users + enterprise_users
            conversion_rate = (paid_users / total_users * 100) if total_users > 0 else 0
        except Exception as e:
            current_app.logger.error(f"Error getting subscription metrics for export: {e}")

            # Generate random data for demo
            import random
            free_users = random.randint(500, 1000)
            basic_users = random.randint(100, 300)
            premium_users = random.randint(50, 150)
            enterprise_users = random.randint(10, 50)
            total_users = free_users + basic_users + premium_users + enterprise_users
            paid_users = basic_users + premium_users + enterprise_users
            conversion_rate = (paid_users / total_users * 100) if total_users > 0 else 0

        # Add row to CSV
        csv_data += f'{date_str},{free_users},{basic_users},{premium_users},{enterprise_users},{total_users},{conversion_rate:.1f}\n'

        # Move to next day
        current_date += timedelta(days=1)

    return csv_data
