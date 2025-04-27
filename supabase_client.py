"""
Supabase client for the application.
Handles authentication and database operations.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Initialize Supabase client
supabase = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        print("Warning: Supabase credentials not found. Supabase functionality will be disabled.")
        # Create a dummy client for development
        class DummyClient:
            def __getattr__(self, name):
                return self
            def __call__(self, *args, **kwargs):
                return self
            def table(self, *args, **kwargs):
                return self
            def select(self, *args, **kwargs):
                return self
            def insert(self, *args, **kwargs):
                return self
            def update(self, *args, **kwargs):
                return self
            def delete(self, *args, **kwargs):
                return self
            def eq(self, *args, **kwargs):
                return self
            def execute(self, *args, **kwargs):
                return type('obj', (object,), {'data': []})
        supabase = DummyClient()
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    # Create a dummy client for development
    class DummyClient:
        def __getattr__(self, name):
            return self
        def __call__(self, *args, **kwargs):
            return self
        def table(self, *args, **kwargs):
            return self
        def select(self, *args, **kwargs):
            return self
        def insert(self, *args, **kwargs):
            return self
        def update(self, *args, **kwargs):
            return self
        def delete(self, *args, **kwargs):
            return self
        def eq(self, *args, **kwargs):
            return self
        def execute(self, *args, **kwargs):
            return type('obj', (object,), {'data': []})
    supabase = DummyClient()

def get_user_by_email(email):
    """Get user by email from Supabase."""
    try:
        response = supabase.table('users').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None

def get_user_by_id(user_id):
    """Get user by ID from Supabase."""
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

def create_user_profile(user_data):
    """Create a new user profile in Supabase."""
    try:
        response = supabase.table('users').insert(user_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error creating user profile: {e}")
        return None

def update_user_profile(user_id, user_data):
    """Update user profile in Supabase."""
    try:
        response = supabase.table('users').update(user_data).eq('id', user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return None

def get_user_progress(user_id):
    """Get user progress from Supabase."""
    try:
        response = supabase.table('user_progress').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        print(f"Error getting user progress: {e}")
        return []

def update_user_progress(progress_data):
    """Update user progress in Supabase."""
    try:
        # Check if progress entry exists
        user_id = progress_data['user_id']
        content_id = progress_data['content_id']
        content_type = progress_data['content_type']

        response = supabase.table('user_progress').select('*').eq('user_id', user_id).eq('content_id', content_id).eq('content_type', content_type).execute()

        if response.data:
            # Update existing progress
            progress_id = response.data[0]['id']
            response = supabase.table('user_progress').update(progress_data).eq('id', progress_id).execute()
        else:
            # Create new progress entry
            response = supabase.table('user_progress').insert(progress_data).execute()

        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error updating user progress: {e}")
        return None

def get_user_bookmarks(user_id):
    """Get user bookmarks from Supabase."""
    try:
        response = supabase.table('bookmarks').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        print(f"Error getting user bookmarks: {e}")
        return []

def add_bookmark(bookmark_data):
    """Add a bookmark in Supabase."""
    try:
        response = supabase.table('bookmarks').insert(bookmark_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error adding bookmark: {e}")
        return None

def remove_bookmark(bookmark_id):
    """Remove a bookmark from Supabase."""
    try:
        response = supabase.table('bookmarks').delete().eq('id', bookmark_id).execute()
        return True
    except Exception as e:
        print(f"Error removing bookmark: {e}")
        return False

def get_quiz_results(user_id):
    """Get user quiz results from Supabase."""
    try:
        response = supabase.table('quiz_results').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        print(f"Error getting quiz results: {e}")
        return []

def save_quiz_result(result_data):
    """Save quiz result in Supabase."""
    try:
        response = supabase.table('quiz_results').insert(result_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error saving quiz result: {e}")
        return None

def upload_user_avatar(user_id, file_path):
    """Upload user avatar to Supabase Storage."""
    try:
        file_name = f"avatar_{user_id}.jpg"
        with open(file_path, 'rb') as f:
            response = supabase.storage.from_('avatars').upload(file_name, f)

        # Get public URL
        public_url = supabase.storage.from_('avatars').get_public_url(file_name)

        # Update user profile with avatar URL
        update_user_profile(user_id, {'avatar_url': public_url})

        return public_url
    except Exception as e:
        print(f"Error uploading avatar: {e}")
        return None


def insert_analytics_event(event):
    """Insert analytics event into Supabase."""
    try:
        # Insert event
        response = supabase.table('analytics_events').insert(event).execute()

        # Return inserted event
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error inserting analytics event into Supabase: {e}")
        return None


def get_active_users(start_time):
    """Get number of active users since the given start time."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_active_users',
            {'start_timestamp': start_time}
        ).execute()

        # Return count
        return response.data[0]['count'] if response.data else 0
    except Exception as e:
        print(f"Error getting active users from Supabase: {e}")
        return 0


def get_page_views(path, start_time):
    """Get number of page views for the given path since the given start time."""
    try:
        # Build query
        query = supabase.table('analytics_events').select('id').eq('event_type', 'page_view').gte('timestamp', start_time)

        # Add path filter if provided
        if path:
            query = query.eq('path', path)

        # Execute query
        response = query.execute()

        # Return count
        return len(response.data) if response.data else 0
    except Exception as e:
        print(f"Error getting page views from Supabase: {e}")
        return 0


def get_completion_rate(content_type):
    """Get completion rate for the given content type."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_completion_rate',
            {'content_type_param': content_type}
        ).execute()

        # Return rate
        return response.data[0]['rate'] if response.data else 0
    except Exception as e:
        print(f"Error getting completion rate from Supabase: {e}")
        return 0


def get_popular_content(content_type, limit):
    """Get most popular content of the given type."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_popular_content',
            {
                'content_type_param': content_type,
                'limit_param': limit
            }
        ).execute()

        # Return results
        return response.data if response.data else []
    except Exception as e:
        print(f"Error getting popular content from Supabase: {e}")
        return []


def get_user_retention(days):
    """Get user retention rate over the given number of days."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_user_retention',
            {'days_param': days}
        ).execute()

        # Return rate
        return response.data[0]['rate'] if response.data else 0
    except Exception as e:
        print(f"Error getting user retention from Supabase: {e}")
        return 0


def get_subscription_metrics():
    """Get subscription metrics."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_subscription_metrics'
        ).execute()

        # Return metrics
        return response.data[0] if response.data else {
            'free': 0,
            'basic': 0,
            'premium': 0,
            'enterprise': 0,
            'total': 0,
            'conversion_rate': 0
        }
    except Exception as e:
        print(f"Error getting subscription metrics from Supabase: {e}")
        return {
            'free': 0,
            'basic': 0,
            'premium': 0,
            'enterprise': 0,
            'total': 0,
            'conversion_rate': 0
        }


def get_user_journey_metrics():
    """Get metrics for user journey through the application."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_user_journey_metrics'
        ).execute()

        # Return metrics
        return response.data[0] if response.data else {
            'signup_to_tutorial': 0,
            'tutorial_to_quiz': 0,
            'quiz_to_subscription': 0,
            'average_tutorials_per_user': 0,
            'average_quizzes_per_user': 0
        }
    except Exception as e:
        print(f"Error getting user journey metrics from Supabase: {e}")
        return {
            'signup_to_tutorial': 0,
            'tutorial_to_quiz': 0,
            'quiz_to_subscription': 0,
            'average_tutorials_per_user': 0,
            'average_quizzes_per_user': 0
        }


def get_real_time_users():
    """Get number of users currently active on the site."""
    try:
        # Execute RPC function
        response = supabase.rpc(
            'get_real_time_users'
        ).execute()

        # Return count
        return response.data[0]['count'] if response.data else 0
    except Exception as e:
        print(f"Error getting real-time users from Supabase: {e}")
        return 0
