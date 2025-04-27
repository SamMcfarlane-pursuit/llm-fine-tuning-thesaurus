"""
Authentication views.
"""

from flask import render_template, redirect, url_for, flash, request, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
try:
    from werkzeug.urls import url_parse
except ImportError:
    try:
        # For newer versions of Werkzeug
        from werkzeug.urls import url_parse as _url_parse
        def url_parse(url):
            return _url_parse(url)
    except ImportError:
        # Fallback for the latest Werkzeug
        from urllib.parse import urlparse
        def url_parse(url):
            return urlparse(url)
from datetime import datetime

from . import auth
from .forms import LoginForm, RegistrationForm, ProfileForm, GuestConversionForm
from models import User, UserProgress
from extensions import db

@auth.route('/login', methods=['GET', 'POST'])
def login():
    """Login page."""
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid email or password', 'danger')
            return redirect(url_for('auth.login'))

        login_user(user, remember=form.remember_me.data)
        user.update_last_login()

        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')

        flash('You have been logged in successfully!', 'success')
        return redirect(next_page)

    # Pass OAuth providers to template
    oauth_providers = [
        {'name': 'Google', 'icon': 'google', 'url': url_for('auth.google')},
        {'name': 'GitHub', 'icon': 'github', 'url': url_for('auth.github')},
        {'name': 'Facebook', 'icon': 'facebook', 'url': url_for('auth.facebook')}
    ]

    return render_template('auth/login.html', title='Sign In', form=form, oauth_providers=oauth_providers)


@auth.route('/logout')
@login_required
def logout():
    """Logout user."""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))


@auth.route('/register', methods=['GET', 'POST'])
def register():
    """Registration page."""
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            name=form.name.data
        )
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.commit()

        flash('Congratulations, you are now a registered user!', 'success')
        return redirect(url_for('auth.login'))

    # Pass OAuth providers to template
    oauth_providers = [
        {'name': 'Google', 'icon': 'google', 'url': url_for('auth.google')},
        {'name': 'GitHub', 'icon': 'github', 'url': url_for('auth.github')},
        {'name': 'Facebook', 'icon': 'facebook', 'url': url_for('auth.facebook')}
    ]

    return render_template('auth/register.html', title='Register', form=form, oauth_providers=oauth_providers)


@auth.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile page."""
    form = ProfileForm(obj=current_user)

    if form.validate_on_submit():
        current_user.name = form.name.data
        current_user.username = form.username.data

        if form.password.data:
            current_user.set_password(form.password.data)

        db.session.commit()
        flash('Your profile has been updated.', 'success')
        return redirect(url_for('auth.profile'))

    # Get user progress from Supabase
    progress = []
    try:
        from supabase_client import get_user_progress
        progress = get_user_progress(current_user.id)
    except Exception as e:
        print(f"Error getting user progress: {e}")
        # Fallback to database progress
        progress = current_user.progress.all()

    # Get connected social accounts
    social_accounts = current_user.social_accounts.all()

    # Get user stats
    user_stats = {}
    try:
        from user_progress import get_user_completion_stats
        user_stats = get_user_completion_stats(current_user.id)
    except Exception as e:
        print(f"Error getting user stats: {e}")

    return render_template(
        'auth/profile.html',
        title='Profile',
        form=form,
        progress=progress,
        social_accounts=social_accounts,
        user_stats=user_stats
    )


@auth.route('/convert-guest', methods=['GET', 'POST'])
def convert_guest():
    """Show the guest conversion page."""
    # If user is already logged in, redirect to home
    if current_user.is_authenticated:
        flash('You are already logged in.', 'info')
        return redirect(url_for('index'))

    # If there's no guest data in session, redirect to home
    if 'guest_attempts' not in session and 'guest_progress' not in session:
        flash('No guest progress found to convert.', 'info')
        return redirect(url_for('index'))

    form = GuestConversionForm()

    # Get guest quiz attempts from session
    quiz_attempts = {}
    if 'guest_attempts' in session:
        for attempt_id, attempt_data in session['guest_attempts'].items():
            # Get quiz title
            from models import Quiz
            quiz = Quiz.query.get(attempt_data['quiz_id'])
            if quiz:
                quiz_attempts[attempt_id] = {
                    'quiz_id': attempt_data['quiz_id'],
                    'quiz_title': quiz.title,
                    'score': attempt_data['score'],
                    'passed': attempt_data['passed'],
                    'completed_at': attempt_data.get('completed_at')
                }

    # Get guest progress from session
    progress_items = {}
    if 'guest_progress' in session:
        progress_items = session['guest_progress']

    # Pass OAuth providers to template
    oauth_providers = [
        {'name': 'google', 'icon': 'google', 'display_name': 'Google'},
        {'name': 'github', 'icon': 'github', 'display_name': 'GitHub'},
        {'name': 'facebook', 'icon': 'facebook', 'display_name': 'Facebook'}
    ]

    return render_template(
        'auth/convert_guest.html',
        title='Save Your Progress',
        form=form,
        quiz_attempts=quiz_attempts,
        progress_items=progress_items,
        oauth_providers=oauth_providers
    )


@auth.route('/convert-guest-to-user', methods=['POST'])
def convert_guest_to_user():
    """Convert guest account to registered user."""
    # If user is already logged in, redirect to home
    if current_user.is_authenticated:
        flash('You are already logged in.', 'info')
        return redirect(url_for('index'))

    # If there's no guest data in session, redirect to home
    if 'guest_attempts' not in session and 'guest_progress' not in session:
        flash('No guest progress found to convert.', 'info')
        return redirect(url_for('index'))

    form = GuestConversionForm()

    if form.validate_on_submit():
        # Create new user
        user = User(
            username=form.username.data,
            email=form.email.data,
            name=form.username.data  # Use username as name if not provided
        )
        user.set_password(form.password.data)

        db.session.add(user)
        db.session.flush()  # Get user ID without committing

        # Convert guest quiz attempts to user attempts
        if 'guest_attempts' in session:
            from models import QuizAttempt, QuizAnswer

            for attempt_id, attempt_data in session['guest_attempts'].items():
                # Create a new quiz attempt for the user
                quiz_attempt = QuizAttempt(
                    quiz_id=attempt_data['quiz_id'],
                    user_id=user.id,
                    score=attempt_data['score'],
                    passed=attempt_data['passed'],
                    completed_at=datetime.fromisoformat(attempt_data['completed_at']) if attempt_data.get('completed_at') else None
                )
                db.session.add(quiz_attempt)
                db.session.flush()  # Get attempt ID without committing

                # Add answers if available
                if 'answers' in attempt_data:
                    for question_id, answer_data in attempt_data['answers'].items():
                        quiz_answer = QuizAnswer(
                            attempt_id=quiz_attempt.id,
                            question_id=int(question_id),
                            selected_option_id=answer_data.get('selected_option_id'),
                            text_answer=answer_data.get('text_answer'),
                            is_correct=answer_data.get('is_correct', False)
                        )
                        db.session.add(quiz_answer)

        # Convert guest progress to user progress
        if 'guest_progress' in session:
            for progress_key, progress_data in session['guest_progress'].items():
                user_progress = UserProgress(
                    user_id=user.id,
                    module=progress_data['module'],
                    topic=progress_data['topic'],
                    completed=progress_data.get('completed', False),
                    score=progress_data.get('score', 0),
                    last_accessed=datetime.fromisoformat(progress_data['last_accessed']) if progress_data.get('last_accessed') else datetime.now()
                )
                db.session.add(user_progress)

        # Commit all changes
        db.session.commit()

        # Clear guest data from session
        if 'guest_attempts' in session:
            session.pop('guest_attempts')
        if 'guest_progress' in session:
            session.pop('guest_progress')

        # Log in the new user
        login_user(user)

        flash('Your guest progress has been successfully converted to your new account!', 'success')
        return redirect(url_for('index'))

    # If form validation fails, redirect back to convert page
    for field, errors in form.errors.items():
        for error in errors:
            flash(f"{getattr(form, field).label.text}: {error}", 'danger')

    return redirect(url_for('auth.convert_guest'))


@auth.route('/transfer-guest-progress', methods=['POST'])
@login_required
def transfer_guest_progress():
    """Transfer guest progress to logged-in user."""
    # If there's no guest data in session, redirect to home
    if 'guest_attempts' not in session and 'guest_progress' not in session:
        flash('No guest progress found to transfer.', 'info')
        return redirect(url_for('index'))

    # Transfer guest quiz attempts to user attempts
    if 'guest_attempts' in session:
        from models import QuizAttempt, QuizAnswer

        for attempt_id, attempt_data in session['guest_attempts'].items():
            # Create a new quiz attempt for the user
            quiz_attempt = QuizAttempt(
                quiz_id=attempt_data['quiz_id'],
                user_id=current_user.id,
                score=attempt_data['score'],
                passed=attempt_data['passed'],
                completed_at=datetime.fromisoformat(attempt_data['completed_at']) if attempt_data.get('completed_at') else None
            )
            db.session.add(quiz_attempt)
            db.session.flush()  # Get attempt ID without committing

            # Add answers if available
            if 'answers' in attempt_data:
                for question_id, answer_data in attempt_data['answers'].items():
                    quiz_answer = QuizAnswer(
                        attempt_id=quiz_attempt.id,
                        question_id=int(question_id),
                        selected_option_id=answer_data.get('selected_option_id'),
                        text_answer=answer_data.get('text_answer'),
                        is_correct=answer_data.get('is_correct', False)
                    )
                    db.session.add(quiz_answer)

    # Transfer guest progress to user progress
    if 'guest_progress' in session:
        for progress_key, progress_data in session['guest_progress'].items():
            # Check if user already has progress for this module/topic
            existing_progress = UserProgress.query.filter_by(
                user_id=current_user.id,
                module=progress_data['module'],
                topic=progress_data['topic']
            ).first()

            if existing_progress:
                # Update existing progress if guest progress is better
                if progress_data.get('score', 0) > existing_progress.score:
                    existing_progress.score = progress_data['score']
                if progress_data.get('completed', False) and not existing_progress.completed:
                    existing_progress.completed = True
                existing_progress.last_accessed = datetime.now()
            else:
                # Create new progress entry
                user_progress = UserProgress(
                    user_id=current_user.id,
                    module=progress_data['module'],
                    topic=progress_data['topic'],
                    completed=progress_data.get('completed', False),
                    score=progress_data.get('score', 0),
                    last_accessed=datetime.fromisoformat(progress_data['last_accessed']) if progress_data.get('last_accessed') else datetime.now()
                )
                db.session.add(user_progress)

    # Commit all changes
    db.session.commit()

    # Clear guest data from session
    if 'guest_attempts' in session:
        session.pop('guest_attempts')
    if 'guest_progress' in session:
        session.pop('guest_progress')

    flash('Your guest progress has been successfully transferred to your account!', 'success')
    return redirect(url_for('index'))
