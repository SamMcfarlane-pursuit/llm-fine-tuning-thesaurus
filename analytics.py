"""
Analytics module for tracking user activity and application metrics.
Provides real-time data collection and analysis.
"""

import json
from datetime import datetime, timezone, timedelta
from flask import request, session, current_app
from flask_login import current_user
from extensions import db
import supabase_client

# Event types
EVENT_PAGE_VIEW = 'page_view'
EVENT_TUTORIAL_START = 'tutorial_start'
EVENT_TUTORIAL_COMPLETE = 'tutorial_complete'
EVENT_QUIZ_START = 'quiz_start'
EVENT_QUIZ_COMPLETE = 'quiz_complete'
EVENT_EXERCISE_START = 'exercise_start'
EVENT_EXERCISE_COMPLETE = 'exercise_complete'
EVENT_SEARCH = 'search'
EVENT_SIGNUP = 'signup'
EVENT_LOGIN = 'login'
EVENT_SUBSCRIPTION = 'subscription'

def track_event(event_data):
    """
    Track an event with the given data.

    Args:
        event_data: Dictionary containing event information

    Returns:
        bool: True if event was tracked successfully
    """
    try:
        # Extract event type from data
        event_type = event_data.get('event_type', 'unknown')

        # Create event object
        event = {
            'event_type': event_type,
            'event_data': event_data.get('event_data', {}),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'user_id': current_user.id if current_user.is_authenticated else None,
            'session_id': session.get('session_id'),
            'ip_address': request.remote_addr,
            'user_agent': request.user_agent.string,
            'referrer': request.referrer,
            'path': request.path,
            'subscription_tier': current_user.subscription_tier if current_user.is_authenticated else 'anonymous'
        }

        # Store event in Supabase
        try:
            supabase_client.insert_analytics_event(event)
        except Exception as e:
            current_app.logger.error(f"Error storing event in Supabase: {e}")

            # Fall back to local storage
            store_event_locally(event)

        return True
    except Exception as e:
        current_app.logger.error(f"Error tracking event: {e}")
        return False

def store_event_locally(event):
    """
    Store event in local database as fallback.

    Args:
        event: Event data to store
    """
    try:
        from models import AnalyticsEvent

        # Create new event
        new_event = AnalyticsEvent(
            event_type=event['event_type'],
            event_data=event['event_data'],
            user_id=event['user_id'],
            session_id=event['session_id'],
            ip_address=event['ip_address'],
            user_agent=event['user_agent'],
            referrer=event['referrer'],
            path=event['path'],
            subscription_tier=event['subscription_tier']
        )

        # Add to database
        db.session.add(new_event)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Error storing event locally: {e}")

def get_active_users(time_period='day'):
    """
    Get number of active users for the given time period.

    Args:
        time_period: Time period to get active users for (day, week, month)

    Returns:
        int: Number of active users
    """
    try:
        # Calculate start time based on time period
        now = datetime.now(timezone.utc)
        if time_period == 'day':
            start_time = now - timedelta(days=1)
        elif time_period == 'week':
            start_time = now - timedelta(weeks=1)
        elif time_period == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(days=1)

        # Get active users from Supabase
        try:
            return supabase_client.get_active_users(start_time.isoformat())
        except Exception as e:
            current_app.logger.error(f"Error getting active users from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent
            from sqlalchemy import func, distinct

            # Query for distinct user IDs in the time period
            query = db.session.query(func.count(distinct(AnalyticsEvent.user_id)))
            query = query.filter(AnalyticsEvent.timestamp >= start_time)

            return query.scalar() or 0
    except Exception as e:
        current_app.logger.error(f"Error getting active users: {e}")
        return 0

def get_page_views(path=None, time_period='day'):
    """
    Get number of page views for the given path and time period.

    Args:
        path: Path to get page views for (None for all paths)
        time_period: Time period to get page views for (day, week, month)

    Returns:
        int: Number of page views
    """
    try:
        # Calculate start time based on time period
        now = datetime.now(timezone.utc)
        if time_period == 'day':
            start_time = now - timedelta(days=1)
        elif time_period == 'week':
            start_time = now - timedelta(weeks=1)
        elif time_period == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(days=1)

        # Get page views from Supabase
        try:
            return supabase_client.get_page_views(path, start_time.isoformat())
        except Exception as e:
            current_app.logger.error(f"Error getting page views from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent

            # Query for page views
            query = db.session.query(AnalyticsEvent)
            query = query.filter(AnalyticsEvent.event_type == EVENT_PAGE_VIEW)
            query = query.filter(AnalyticsEvent.timestamp >= start_time)

            if path:
                query = query.filter(AnalyticsEvent.path == path)

            return query.count()
    except Exception as e:
        current_app.logger.error(f"Error getting page views: {e}")
        return 0

def get_completion_rate(content_type):
    """
    Get completion rate for the given content type.

    Args:
        content_type: Type of content (tutorial, quiz, exercise)

    Returns:
        float: Completion rate (0-100)
    """
    try:
        # Get completion rate from Supabase
        try:
            return supabase_client.get_completion_rate(content_type)
        except Exception as e:
            current_app.logger.error(f"Error getting completion rate from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent

            # Get start and complete events
            start_event = f"{content_type}_start"
            complete_event = f"{content_type}_complete"

            # Count start events
            start_query = db.session.query(AnalyticsEvent)
            start_query = start_query.filter(AnalyticsEvent.event_type == start_event)
            start_count = start_query.count()

            # Count complete events
            complete_query = db.session.query(AnalyticsEvent)
            complete_query = complete_query.filter(AnalyticsEvent.event_type == complete_event)
            complete_count = complete_query.count()

            # Calculate completion rate
            if start_count > 0:
                return (complete_count / start_count) * 100
            else:
                return 0
    except Exception as e:
        current_app.logger.error(f"Error getting completion rate: {e}")
        return 0

def get_popular_content(content_type, limit=5):
    """
    Get most popular content of the given type.

    Args:
        content_type: Type of content (tutorial, quiz, exercise)
        limit: Maximum number of items to return

    Returns:
        list: List of popular content items with view counts
    """
    try:
        # Get popular content from Supabase
        try:
            return supabase_client.get_popular_content(content_type, limit)
        except Exception as e:
            current_app.logger.error(f"Error getting popular content from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent
            from sqlalchemy import func

            # Get view events for content type
            view_event = f"{content_type}_start"

            # Query for content items with counts
            query = db.session.query(
                AnalyticsEvent.event_data['content_id'].label('content_id'),
                func.count(AnalyticsEvent.id).label('view_count')
            )
            query = query.filter(AnalyticsEvent.event_type == view_event)
            query = query.group_by(AnalyticsEvent.event_data['content_id'])
            query = query.order_by(func.count(AnalyticsEvent.id).desc())
            query = query.limit(limit)

            # Format results
            results = []
            for row in query.all():
                results.append({
                    'content_id': row.content_id,
                    'view_count': row.view_count
                })

            return results
    except Exception as e:
        current_app.logger.error(f"Error getting popular content: {e}")
        return []

def get_user_retention(days=30):
    """
    Get user retention rate over the given number of days.

    Args:
        days: Number of days to calculate retention for

    Returns:
        float: Retention rate (0-100)
    """
    try:
        # Get user retention from Supabase
        try:
            return supabase_client.get_user_retention(days)
        except Exception as e:
            current_app.logger.error(f"Error getting user retention from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent
            from sqlalchemy import func, distinct

            # Calculate time periods
            now = datetime.now(timezone.utc)
            period_start = now - timedelta(days=days)
            period_end = now

            # Get users who logged in during the first day
            first_day_end = period_start + timedelta(days=1)
            first_day_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            first_day_users_query = first_day_users_query.filter(
                AnalyticsEvent.timestamp >= period_start,
                AnalyticsEvent.timestamp < first_day_end,
                AnalyticsEvent.user_id.isnot(None)
            )
            first_day_users = [row[0] for row in first_day_users_query.all()]

            if not first_day_users:
                return 0

            # Get users who logged in during the last day
            last_day_start = period_end - timedelta(days=1)
            last_day_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            last_day_users_query = last_day_users_query.filter(
                AnalyticsEvent.timestamp >= last_day_start,
                AnalyticsEvent.timestamp < period_end,
                AnalyticsEvent.user_id.isnot(None),
                AnalyticsEvent.user_id.in_(first_day_users)
            )
            last_day_users = last_day_users_query.count()

            # Calculate retention rate
            return (last_day_users / len(first_day_users)) * 100
    except Exception as e:
        current_app.logger.error(f"Error getting user retention: {e}")
        return 0

def get_subscription_metrics():
    """
    Get subscription metrics.

    Returns:
        dict: Subscription metrics
    """
    try:
        # Get subscription metrics from Supabase
        try:
            return supabase_client.get_subscription_metrics()
        except Exception as e:
            current_app.logger.error(f"Error getting subscription metrics from Supabase: {e}")

            # Fall back to local database
            from models import User
            from sqlalchemy import func

            # Count users by subscription tier
            query = db.session.query(
                User.subscription_tier,
                func.count(User.id).label('count')
            )
            query = query.group_by(User.subscription_tier)

            # Format results
            results = {
                'free': 0,
                'basic': 0,
                'premium': 0,
                'enterprise': 0,
                'total': 0,
                'conversion_rate': 0
            }

            total_users = 0
            paid_users = 0

            for row in query.all():
                tier = row.subscription_tier
                count = row.count

                results[tier] = count
                total_users += count

                if tier != 'free':
                    paid_users += count

            results['total'] = total_users

            # Calculate conversion rate
            if total_users > 0:
                results['conversion_rate'] = (paid_users / total_users) * 100

            return results
    except Exception as e:
        current_app.logger.error(f"Error getting subscription metrics: {e}")
        return {
            'free': 0,
            'basic': 0,
            'premium': 0,
            'enterprise': 0,
            'total': 0,
            'conversion_rate': 0
        }

def get_user_journey_metrics():
    """
    Get metrics for user journey through the application.

    Returns:
        dict: User journey metrics
    """
    try:
        # Get user journey metrics from Supabase
        try:
            return supabase_client.get_user_journey_metrics()
        except Exception as e:
            current_app.logger.error(f"Error getting user journey metrics from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent
            from sqlalchemy import func, distinct

            # Calculate metrics
            results = {
                'signup_to_tutorial': 0,
                'tutorial_to_quiz': 0,
                'quiz_to_subscription': 0,
                'average_tutorials_per_user': 0,
                'average_quizzes_per_user': 0
            }

            # Count users who signed up
            signup_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            signup_users_query = signup_users_query.filter(
                AnalyticsEvent.event_type == EVENT_SIGNUP,
                AnalyticsEvent.user_id.isnot(None)
            )
            signup_users = [row[0] for row in signup_users_query.all()]

            if not signup_users:
                return results

            # Count users who started a tutorial
            tutorial_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            tutorial_users_query = tutorial_users_query.filter(
                AnalyticsEvent.event_type == EVENT_TUTORIAL_START,
                AnalyticsEvent.user_id.isnot(None),
                AnalyticsEvent.user_id.in_(signup_users)
            )
            tutorial_users = tutorial_users_query.count()

            # Count users who started a quiz
            quiz_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            quiz_users_query = quiz_users_query.filter(
                AnalyticsEvent.event_type == EVENT_QUIZ_START,
                AnalyticsEvent.user_id.isnot(None),
                AnalyticsEvent.user_id.in_(signup_users)
            )
            quiz_users = quiz_users_query.count()

            # Count users who subscribed
            subscription_users_query = db.session.query(distinct(AnalyticsEvent.user_id))
            subscription_users_query = subscription_users_query.filter(
                AnalyticsEvent.event_type == EVENT_SUBSCRIPTION,
                AnalyticsEvent.user_id.isnot(None),
                AnalyticsEvent.user_id.in_(signup_users)
            )
            subscription_users = subscription_users_query.count()

            # Calculate conversion rates
            signup_count = len(signup_users)
            if signup_count > 0:
                results['signup_to_tutorial'] = (tutorial_users / signup_count) * 100

            if tutorial_users > 0:
                results['tutorial_to_quiz'] = (quiz_users / tutorial_users) * 100

            if quiz_users > 0:
                results['quiz_to_subscription'] = (subscription_users / quiz_users) * 100

            # Calculate average tutorials per user
            tutorial_count_query = db.session.query(
                AnalyticsEvent.user_id,
                func.count(distinct(AnalyticsEvent.event_data['content_id'])).label('count')
            )
            tutorial_count_query = tutorial_count_query.filter(
                AnalyticsEvent.event_type == EVENT_TUTORIAL_START,
                AnalyticsEvent.user_id.isnot(None)
            )
            tutorial_count_query = tutorial_count_query.group_by(AnalyticsEvent.user_id)

            tutorial_counts = [row.count for row in tutorial_count_query.all()]
            if tutorial_counts:
                results['average_tutorials_per_user'] = sum(tutorial_counts) / len(tutorial_counts)

            # Calculate average quizzes per user
            quiz_count_query = db.session.query(
                AnalyticsEvent.user_id,
                func.count(distinct(AnalyticsEvent.event_data['content_id'])).label('count')
            )
            quiz_count_query = quiz_count_query.filter(
                AnalyticsEvent.event_type == EVENT_QUIZ_START,
                AnalyticsEvent.user_id.isnot(None)
            )
            quiz_count_query = quiz_count_query.group_by(AnalyticsEvent.user_id)

            quiz_counts = [row.count for row in quiz_count_query.all()]
            if quiz_counts:
                results['average_quizzes_per_user'] = sum(quiz_counts) / len(quiz_counts)

            return results
    except Exception as e:
        current_app.logger.error(f"Error getting user journey metrics: {e}")
        return {
            'signup_to_tutorial': 0,
            'tutorial_to_quiz': 0,
            'quiz_to_subscription': 0,
            'average_tutorials_per_user': 0,
            'average_quizzes_per_user': 0
        }

def get_real_time_users():
    """
    Get number of users currently active on the site.

    Returns:
        int: Number of active users
    """
    try:
        # Get real-time users from Supabase
        try:
            return supabase_client.get_real_time_users()
        except Exception as e:
            current_app.logger.error(f"Error getting real-time users from Supabase: {e}")

            # Fall back to local database
            from models import AnalyticsEvent
            from sqlalchemy import func, distinct

            # Calculate time period (last 5 minutes)
            now = datetime.now(timezone.utc)
            five_minutes_ago = now - timedelta(minutes=5)

            # Query for distinct user IDs in the time period
            query = db.session.query(func.count(distinct(AnalyticsEvent.session_id)))
            query = query.filter(AnalyticsEvent.timestamp >= five_minutes_ago)

            return query.scalar() or 0
    except Exception as e:
        current_app.logger.error(f"Error getting real-time users: {e}")
        return 0
