"""
Script to create a test user for the Visual Thesaurus LLM application.
"""
from app import app, db
from models import User

def create_test_user():
    """Create a test user if it doesn't exist."""
    with app.app_context():
        # Check if the test user already exists
        test_user = User.query.filter_by(email='test@example.com').first()
        if test_user:
            print(f"Test user already exists: {test_user.username}")
            return
        
        # Create the test user
        test_user = User(
            username='testuser',
            email='test@example.com',
            password='password',
            first_name='Test',
            last_name='User'
        )
        db.session.add(test_user)
        db.session.commit()
        print(f"Created test user: {test_user.username}")

if __name__ == '__main__':
    create_test_user()
