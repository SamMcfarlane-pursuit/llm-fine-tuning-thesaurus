"""
User progress tracking module.
Handles tracking user progress through tutorials, exercises, and quizzes.
"""

from flask import session
from flask_login import current_user
from datetime import datetime, timezone
import json

from models.auth import UserProgress
from extensions import db
from supabase_client import get_user_progress as supabase_get_progress
from supabase_client import update_user_progress as supabase_update_progress

def get_progress(user_id=None, content_type=None, content_id=None):
    """
    Get user progress.

    Args:
        user_id: User ID (defaults to current user)
        content_type: Type of content (tutorial, exercise, quiz)
        content_id: ID of the content

    Returns:
        Dictionary with progress information
    """
    if not user_id and current_user.is_authenticated:
        user_id = current_user.id

    if not user_id:
        # For anonymous users, get progress from session
        if not content_type or not content_id:
            return {}

        session_key = f"progress_{content_type}_{content_id}"
        return session.get(session_key, {})

    # For authenticated users, get progress from Supabase
    progress_data = supabase_get_progress(user_id)

    if content_type and content_id:
        # Filter for specific content
        for item in progress_data:
            if item['content_type'] == content_type and item['content_id'] == content_id:
                return item
        return {}

    # Return all progress data
    return progress_data

def update_progress(content_type, content_id, status, progress_data=None):
    """
    Update user progress.

    Args:
        content_type: Type of content (tutorial, exercise, quiz)
        content_id: ID of the content
        status: Status of progress (not_started, in_progress, completed)
        progress_data: Additional progress data (e.g., quiz scores)

    Returns:
        Boolean indicating success
    """
    if current_user.is_authenticated:
        # For authenticated users, update progress in Supabase
        user_id = current_user.id

        progress_item = {
            'user_id': user_id,
            'content_type': content_type,
            'content_id': content_id,
            'status': status,
            'progress_data': progress_data or {},
            'updated_at': datetime.now(timezone.utc).isoformat()
        }

        result = supabase_update_progress(progress_item)
        return result is not None
    else:
        # For anonymous users, store progress in session
        session_key = f"progress_{content_type}_{content_id}"
        session[session_key] = {
            'content_type': content_type,
            'content_id': content_id,
            'status': status,
            'progress_data': progress_data or {},
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        return True

def get_tutorial_progress(tutorial_id):
    """
    Get progress for a specific tutorial.

    Args:
        tutorial_id: ID of the tutorial

    Returns:
        Dictionary with progress information
    """
    return get_progress(content_type='tutorial', content_id=tutorial_id)

def update_tutorial_progress(tutorial_id, status, progress_data=None):
    """
    Update progress for a specific tutorial.

    Args:
        tutorial_id: ID of the tutorial
        status: Status of progress (not_started, in_progress, completed)
        progress_data: Additional progress data

    Returns:
        Boolean indicating success
    """
    return update_progress('tutorial', tutorial_id, status, progress_data)

def get_exercise_progress(exercise_id):
    """
    Get progress for a specific exercise.

    Args:
        exercise_id: ID of the exercise

    Returns:
        Dictionary with progress information
    """
    return get_progress(content_type='exercise', content_id=exercise_id)

def update_exercise_progress(exercise_id, status, progress_data=None):
    """
    Update progress for a specific exercise.

    Args:
        exercise_id: ID of the exercise
        status: Status of progress (not_started, in_progress, completed)
        progress_data: Additional progress data

    Returns:
        Boolean indicating success
    """
    return update_progress('exercise', exercise_id, status, progress_data)

def get_quiz_progress(quiz_id):
    """
    Get progress for a specific quiz.

    Args:
        quiz_id: ID of the quiz

    Returns:
        Dictionary with progress information
    """
    return get_progress(content_type='quiz', content_id=quiz_id)

def update_quiz_progress(quiz_id, status, score=None, max_score=None, answers=None):
    """
    Update progress for a specific quiz.

    Args:
        quiz_id: ID of the quiz
        status: Status of progress (not_started, in_progress, completed)
        score: Quiz score
        max_score: Maximum possible score
        answers: User's answers

    Returns:
        Boolean indicating success
    """
    progress_data = {
        'score': score,
        'max_score': max_score,
        'answers': answers
    }
    return update_progress('quiz', quiz_id, status, progress_data)

def get_user_completion_stats(user_id=None):
    """
    Get completion statistics for a user.

    Args:
        user_id: User ID (defaults to current user)

    Returns:
        Dictionary with completion statistics
    """
    if not user_id and current_user.is_authenticated:
        user_id = current_user.id

    if not user_id:
        # For anonymous users, return default stats with zero completion
        return {
            'total': 19,  # 8 + 5 + 6
            'completed': 0,
            'tutorials': {
                'total': 8,
                'completed': 0,
                'in_progress': 0
            },
            'exercises': {
                'total': 5,
                'completed': 0,
                'in_progress': 0
            },
            'quizzes': {
                'total': 6,
                'completed': 0,
                'in_progress': 0
            },
            'overall_progress': 0
        }

    # Get all progress data for the user
    progress_data = supabase_get_progress(user_id)

    # Count tutorials, exercises, and quizzes
    total_tutorials = 0
    completed_tutorials = 0
    total_exercises = 0
    completed_exercises = 0
    total_quizzes = 0
    completed_quizzes = 0

    for item in progress_data:
        if item['content_type'] == 'tutorial':
            total_tutorials += 1
            if item['status'] == 'completed':
                completed_tutorials += 1
        elif item['content_type'] == 'exercise':
            total_exercises += 1
            if item['status'] == 'completed':
                completed_exercises += 1
        elif item['content_type'] == 'quiz':
            total_quizzes += 1
            if item['status'] == 'completed':
                completed_quizzes += 1

    # Calculate overall progress
    total_items = total_tutorials + total_exercises + total_quizzes
    completed_items = completed_tutorials + completed_exercises + completed_quizzes

    overall_progress = 0
    if total_items > 0:
        overall_progress = (completed_items / total_items) * 100

    # Set default totals if none found
    if total_tutorials == 0:
        total_tutorials = 8  # Default total number of tutorials
    if total_exercises == 0:
        total_exercises = 5  # Default total number of exercises
    if total_quizzes == 0:
        total_quizzes = 6  # Default total number of quizzes

    # Recalculate overall progress with default totals
    total_items = total_tutorials + total_exercises + total_quizzes
    completed_items = completed_tutorials + completed_exercises + completed_quizzes

    if total_items > 0:
        overall_progress = (completed_items / total_items) * 100

    return {
        'total': total_items,
        'completed': completed_items,
        'tutorials': {
            'total': total_tutorials,
            'completed': completed_tutorials,
            'in_progress': sum(1 for item in progress_data if item['content_type'] == 'tutorial' and item['status'] == 'in_progress')
        },
        'exercises': {
            'total': total_exercises,
            'completed': completed_exercises,
            'in_progress': sum(1 for item in progress_data if item['content_type'] == 'exercise' and item['status'] == 'in_progress')
        },
        'quizzes': {
            'total': total_quizzes,
            'completed': completed_quizzes,
            'in_progress': sum(1 for item in progress_data if item['content_type'] == 'quiz' and item['status'] == 'in_progress')
        },
        'overall_progress': overall_progress
    }
