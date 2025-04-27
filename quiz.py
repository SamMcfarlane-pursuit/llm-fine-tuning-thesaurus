"""
Quiz routes for the Visual Thesaurus LLM application.
"""
from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, session
from flask_wtf import FlaskForm
from flask_login import current_user
from models import db, Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer, UserProgress, PopQuiz, PopQuizQuestion

# Create a blueprint for quiz routes
quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/dashboard')
def quiz_dashboard():
    """Show the quiz dashboard with progress tracking."""
    # Get all quizzes
    quizzes = Quiz.query.all()

    # Initialize statistics
    stats = {
        'total_quizzes': len(quizzes),
        'completed_quizzes': 0,
        'in_progress_quizzes': 0,
        'avg_score': 0,
        'completion_percentage': 0
    }

    # Initialize topic progress
    topic_progress = {}

    # Get recent attempts
    recent_attempts = []

    # Get recommended quizzes
    recommended_quizzes = []

    if current_user.is_authenticated:
        # Get user's quiz attempts
        attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()

        # Calculate statistics
        completed_quiz_ids = set()
        in_progress_quiz_ids = set()
        total_score = 0
        score_count = 0

        for attempt in attempts:
            if attempt.passed:
                completed_quiz_ids.add(attempt.quiz_id)
            else:
                in_progress_quiz_ids.add(attempt.quiz_id)

            if attempt.score > 0:
                total_score += attempt.score
                score_count += 1

        # Remove duplicates (quizzes that are both completed and in progress)
        in_progress_quiz_ids = in_progress_quiz_ids - completed_quiz_ids

        stats['completed_quizzes'] = len(completed_quiz_ids)
        stats['in_progress_quizzes'] = len(in_progress_quiz_ids)
        stats['avg_score'] = int(total_score / score_count) if score_count > 0 else 0
        stats['completion_percentage'] = int((stats['completed_quizzes'] / stats['total_quizzes']) * 100) if stats['total_quizzes'] > 0 else 0

        # Calculate topic progress
        for quiz in quizzes:
            topic = quiz.topic
            if topic not in topic_progress:
                topic_progress[topic] = {
                    'total_quizzes': 0,
                    'completed_quizzes': 0,
                    'completion_percentage': 0
                }

            topic_progress[topic]['total_quizzes'] += 1
            if quiz.id in completed_quiz_ids:
                topic_progress[topic]['completed_quizzes'] += 1

        # Calculate completion percentage for each topic
        for topic, data in topic_progress.items():
            data['completion_percentage'] = int((data['completed_quizzes'] / data['total_quizzes']) * 100) if data['total_quizzes'] > 0 else 0

        # Get recent attempts (limit to 5)
        recent_attempts = QuizAttempt.query.filter_by(user_id=current_user.id)\
            .filter(QuizAttempt.completed_at.isnot(None))\
            .order_by(QuizAttempt.completed_at.desc())\
            .limit(5)\
            .all()

        # Get recommended quizzes (not completed, limit to 3)
        incomplete_quiz_ids = set(quiz.id for quiz in quizzes) - completed_quiz_ids
        if incomplete_quiz_ids:
            recommended_quizzes = Quiz.query.filter(Quiz.id.in_(incomplete_quiz_ids)).limit(3).all()
    else:
        # For guest users, use session data if available
        if 'guest_attempts' in session:
            completed_quiz_ids = set()
            in_progress_quiz_ids = set()
            total_score = 0
            score_count = 0

            for attempt_id, attempt_data in session['guest_attempts'].items():
                quiz_id = attempt_data['quiz_id']
                if attempt_data.get('passed', False):
                    completed_quiz_ids.add(quiz_id)
                else:
                    in_progress_quiz_ids.add(quiz_id)

                if attempt_data.get('score', 0) > 0:
                    total_score += attempt_data['score']
                    score_count += 1

            # Remove duplicates
            in_progress_quiz_ids = in_progress_quiz_ids - completed_quiz_ids

            stats['completed_quizzes'] = len(completed_quiz_ids)
            stats['in_progress_quizzes'] = len(in_progress_quiz_ids)
            stats['avg_score'] = int(total_score / score_count) if score_count > 0 else 0
            stats['completion_percentage'] = int((stats['completed_quizzes'] / stats['total_quizzes']) * 100) if stats['total_quizzes'] > 0 else 0

            # Calculate topic progress
            for quiz in quizzes:
                topic = quiz.topic
                if topic not in topic_progress:
                    topic_progress[topic] = {
                        'total_quizzes': 0,
                        'completed_quizzes': 0,
                        'completion_percentage': 0
                    }

                topic_progress[topic]['total_quizzes'] += 1
                if quiz.id in completed_quiz_ids:
                    topic_progress[topic]['completed_quizzes'] += 1

            # Calculate completion percentage for each topic
            for topic, data in topic_progress.items():
                data['completion_percentage'] = int((data['completed_quizzes'] / data['total_quizzes']) * 100) if data['total_quizzes'] > 0 else 0

            # Get recent attempts (convert session data to objects)
            recent_attempts_data = []
            for attempt_id, attempt_data in session['guest_attempts'].items():
                if attempt_data.get('completed_at'):
                    quiz = Quiz.query.get(attempt_data['quiz_id'])
                    if quiz:
                        # Create a simple object to mimic QuizAttempt
                        class GuestAttempt:
                            def __init__(self, id, quiz_id, quiz, score, passed, completed_at):
                                self.id = id
                                self.quiz_id = quiz_id
                                self.quiz = quiz
                                self.score = score
                                self.passed = passed
                                self.completed_at = datetime.fromisoformat(completed_at)

                        guest_attempt = GuestAttempt(
                            attempt_id,
                            quiz.id,
                            quiz,
                            attempt_data['score'],
                            attempt_data['passed'],
                            attempt_data['completed_at']
                        )
                        recent_attempts_data.append(guest_attempt)

            # Sort by completed_at and limit to 5
            recent_attempts = sorted(recent_attempts_data, key=lambda x: x.completed_at, reverse=True)[:5]

            # Get recommended quizzes (not completed, limit to 3)
            incomplete_quiz_ids = set(quiz.id for quiz in quizzes) - completed_quiz_ids
            if incomplete_quiz_ids:
                recommended_quizzes = Quiz.query.filter(Quiz.id.in_(incomplete_quiz_ids)).limit(3).all()

    return render_template('quiz/dashboard.html',
                           title='Learning Dashboard',
                           stats=stats,
                           topic_progress=topic_progress,
                           recent_attempts=recent_attempts,
                           recommended_quizzes=recommended_quizzes)


@quiz_bp.route('/topic/<topic>')
def topic_quizzes(topic):
    """Show quizzes for a specific topic."""
    quizzes = Quiz.query.filter_by(topic=topic).all()

    # Get the user's attempts for each quiz
    user_attempts = {}

    if current_user.is_authenticated:
        for quiz in quizzes:
            attempts = QuizAttempt.query.filter_by(user_id=current_user.id, quiz_id=quiz.id).all()
            if attempts:
                # Get the best attempt
                best_attempt = max(attempts, key=lambda a: a.score)
                user_attempts[quiz.id] = {
                    'attempts': len(attempts),
                    'best_score': best_attempt.score,
                    'passed': best_attempt.passed
                }
    else:
        # For guest users, use session data if available
        if 'guest_attempts' in session:
            for quiz in quizzes:
                quiz_attempts = []
                for attempt_id, attempt_data in session['guest_attempts'].items():
                    if attempt_data['quiz_id'] == quiz.id:
                        quiz_attempts.append(attempt_data)

                if quiz_attempts:
                    # Get the best attempt
                    best_attempt = max(quiz_attempts, key=lambda a: a['score'])
                    user_attempts[quiz.id] = {
                        'attempts': len(quiz_attempts),
                        'best_score': best_attempt['score'],
                        'passed': best_attempt['passed']
                    }

    return render_template('quiz/quiz_list.html',
                           title=f'Quizzes for {topic}',
                           quizzes=quizzes,
                           user_attempts=user_attempts,
                           topic_filter=topic)


@quiz_bp.route('/module/<module>')
def module_quizzes(module):
    """Show quizzes for a specific module."""
    quizzes = Quiz.query.filter_by(module=module).all()

    # Get the user's attempts for each quiz
    user_attempts = {}

    if current_user.is_authenticated:
        for quiz in quizzes:
            attempts = QuizAttempt.query.filter_by(user_id=current_user.id, quiz_id=quiz.id).all()
            if attempts:
                # Get the best attempt
                best_attempt = max(attempts, key=lambda a: a.score)
                user_attempts[quiz.id] = {
                    'attempts': len(attempts),
                    'best_score': best_attempt.score,
                    'passed': best_attempt.passed
                }
    else:
        # For guest users, use session data if available
        if 'guest_attempts' in session:
            for quiz in quizzes:
                quiz_attempts = []
                for attempt_id, attempt_data in session['guest_attempts'].items():
                    if attempt_data['quiz_id'] == quiz.id:
                        quiz_attempts.append(attempt_data)

                if quiz_attempts:
                    # Get the best attempt
                    best_attempt = max(quiz_attempts, key=lambda a: a['score'])
                    user_attempts[quiz.id] = {
                        'attempts': len(quiz_attempts),
                        'best_score': best_attempt['score'],
                        'passed': best_attempt['passed']
                    }

    return render_template('quiz/quiz_list.html',
                           title=f'Quizzes for {module} module',
                           quizzes=quizzes,
                           user_attempts=user_attempts,
                           module_filter=module)


@quiz_bp.route('/quizzes')
def quiz_list():
    """Show a list of all available quizzes."""
    quizzes = Quiz.query.all()

    # Get the user's attempts for each quiz if logged in
    user_attempts = {}
    if current_user.is_authenticated:
        for quiz in quizzes:
            attempts = QuizAttempt.query.filter_by(user_id=current_user.id, quiz_id=quiz.id).all()
            if attempts:
                # Get the best attempt
                best_attempt = max(attempts, key=lambda a: a.score)
                user_attempts[quiz.id] = {
                    'attempts': len(attempts),
                    'best_score': best_attempt.score,
                    'passed': best_attempt.passed
                }

    return render_template('quiz/quiz_list.html',
                           title='Available Quizzes',
                           quizzes=quizzes,
                           user_attempts=user_attempts)


@quiz_bp.route('/quiz/<int:quiz_id>')
def quiz_detail(quiz_id):
    """Show details of a specific quiz."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Default values for unauthenticated users
    attempts = []
    passed = False
    best_attempt = None

    # Get user-specific data if logged in
    if current_user.is_authenticated:
        # Get the user's attempts for this quiz
        attempts = QuizAttempt.query.filter_by(user_id=current_user.id, quiz_id=quiz.id).all()

        # Check if the user has passed this quiz
        passed = any(attempt.passed for attempt in attempts)

        # Get the best attempt
        if attempts:
            best_attempt = max(attempts, key=lambda a: a.score)

    return render_template('quiz/quiz_detail.html',
                           title=quiz.title,
                           quiz=quiz,
                           attempts=attempts,
                           passed=passed,
                           best_attempt=best_attempt)


@quiz_bp.route('/quiz/<int:quiz_id>/start', methods=['GET'])
def quiz_start(quiz_id):
    """Show the quiz start page."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Check if login is required for this quiz
    login_required = False

    # If user is not logged in and this is a premium quiz, show login prompt
    if not current_user.is_authenticated and login_required:
        flash('Please log in to take this quiz.', 'info')
        return redirect(url_for('auth.login', next=request.path))

    return render_template('quiz/quiz_start.html',
                           title=f"Start: {quiz.title}",
                           quiz=quiz)


@quiz_bp.route('/quiz/<int:quiz_id>/take/<attempt_id>', methods=['GET', 'POST'])
def quiz_take(quiz_id, attempt_id):
    """Take a quiz."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Handle guest users with session-based attempts
    if not current_user.is_authenticated:
        # Use session to track guest attempts
        if 'guest_attempts' not in session:
            session['guest_attempts'] = {}

        # If attempt_id is 0, create a new session-based attempt
        if attempt_id == '0' or attempt_id == 0:
            # Generate a unique ID for this attempt
            import uuid
            guest_attempt_id = str(uuid.uuid4())

            # Store attempt info in session
            session['guest_attempts'][guest_attempt_id] = {
                'quiz_id': quiz.id,
                'started_at': datetime.now().isoformat(),
                'score': 0,
                'passed': False,
                'completed_at': None,
                'answers': {}
            }
            session.modified = True

            # Use the guest attempt ID as the attempt_id
            return redirect(url_for('quiz.quiz_take', quiz_id=quiz.id, attempt_id=guest_attempt_id))

        # For existing guest attempts
        if attempt_id in session.get('guest_attempts', {}):
            guest_attempt = session['guest_attempts'][attempt_id]

            # Ensure the attempt is for the correct quiz
            if guest_attempt['quiz_id'] != quiz.id:
                flash('Invalid quiz attempt.', 'danger')
                return redirect(url_for('quiz.quiz_list'))

            # Ensure the attempt is not already completed
            if guest_attempt.get('completed_at') is not None:
                flash('This quiz attempt has already been completed.', 'info')
                return redirect(url_for('quiz.quiz_result', quiz_id=quiz.id, attempt_id=attempt_id))

            # Create a simple attempt object for the template
            class GuestAttempt:
                def __init__(self, id, quiz_id):
                    self.id = id
                    self.quiz_id = quiz_id

            attempt = GuestAttempt(attempt_id, quiz.id)
        else:
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))
    else:
        # For authenticated users, use the database
        # If attempt_id is 0, create a new attempt
        if attempt_id == '0' or attempt_id == 0:
            # Create a new quiz attempt
            attempt = QuizAttempt(
                quiz_id=quiz.id,
                user_id=current_user.id,
                score=0,  # Will be calculated after completion
                passed=False  # Will be determined after completion
            )
            db.session.add(attempt)
            db.session.commit()
            return redirect(url_for('quiz.quiz_take', quiz_id=quiz.id, attempt_id=attempt.id))

        # Get the existing attempt
        attempt = QuizAttempt.query.get_or_404(attempt_id)

        # Ensure the attempt belongs to the current user
        if attempt.user_id != current_user.id:
            flash('You do not have permission to access this quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Ensure the attempt is for the correct quiz
        if attempt.quiz_id != quiz.id:
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Ensure the attempt is not already completed
        if attempt.completed_at is not None:
            flash('This quiz attempt has already been completed.', 'info')
            return redirect(url_for('quiz.quiz_result', quiz_id=quiz.id, attempt_id=attempt.id))

    # Get all questions for this quiz, ordered by their order field
    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).order_by(QuizQuestion.order).all()

    if not questions:
        flash('This quiz has no questions.', 'warning')
        return redirect(url_for('quiz.quiz_list'))

    if request.method == 'POST':
        # Process the quiz submission
        total_points = 0
        earned_points = 0

        # Handle guest users
        if not current_user.is_authenticated:
            # Process answers for guest users
            guest_answers = {}

            for question in questions:
                total_points += question.points

                # Get the user's answer for this question
                if question.question_type == 'multiple_choice':
                    selected_option_id = request.form.get(f'question_{question.id}')

                    if selected_option_id:
                        selected_option = QuizOption.query.get(selected_option_id)
                        is_correct = selected_option.is_correct

                        # Store the answer
                        guest_answers[str(question.id)] = {
                            'selected_option_id': selected_option_id,
                            'is_correct': is_correct
                        }

                        if is_correct:
                            earned_points += question.points
                    else:
                        # No answer provided
                        guest_answers[str(question.id)] = {
                            'is_correct': False
                        }

                elif question.question_type == 'true_false':
                    answer_value = request.form.get(f'question_{question.id}')

                    if answer_value:
                        # Find the correct option
                        correct_option = QuizOption.query.filter_by(question_id=question.id, is_correct=True).first()
                        is_correct = (answer_value == 'true' and correct_option.option_text.lower() == 'true') or \
                                    (answer_value == 'false' and correct_option.option_text.lower() == 'false')

                        # Store the answer
                        guest_answers[str(question.id)] = {
                            'text_answer': answer_value,
                            'is_correct': is_correct
                        }

                        if is_correct:
                            earned_points += question.points
                    else:
                        # No answer provided
                        guest_answers[str(question.id)] = {
                            'is_correct': False
                        }

                elif question.question_type == 'text':
                    text_answer = request.form.get(f'question_{question.id}', '').strip()

                    # Store the answer
                    guest_answers[str(question.id)] = {
                        'text_answer': text_answer,
                        'is_correct': False  # Will need to be graded manually
                    }

            # Calculate the score as a percentage
            if total_points > 0:
                score = int((earned_points / total_points) * 100)
            else:
                score = 0

            # Update the guest attempt in session
            guest_attempt = session['guest_attempts'][attempt_id]
            guest_attempt['score'] = score
            guest_attempt['passed'] = score >= quiz.passing_score
            guest_attempt['completed_at'] = datetime.now().isoformat()
            guest_attempt['answers'] = guest_answers
            session.modified = True

            return redirect(url_for('quiz.quiz_result', quiz_id=quiz.id, attempt_id=attempt_id))
        else:
            # Process answers for authenticated users
            for question in questions:
                total_points += question.points

                # Get the user's answer for this question
                if question.question_type == 'multiple_choice':
                    selected_option_id = request.form.get(f'question_{question.id}')

                    if selected_option_id:
                        selected_option = QuizOption.query.get(selected_option_id)

                        # Create an answer record
                        answer = QuizAnswer(
                            attempt_id=attempt.id,
                            question_id=question.id,
                            selected_option_id=selected_option_id,
                            is_correct=selected_option.is_correct
                        )
                        db.session.add(answer)

                        if selected_option.is_correct:
                            earned_points += question.points
                    else:
                        # No answer provided
                        answer = QuizAnswer(
                            attempt_id=attempt.id,
                            question_id=question.id,
                            is_correct=False
                        )
                        db.session.add(answer)

                elif question.question_type == 'true_false':
                    answer_value = request.form.get(f'question_{question.id}')

                    if answer_value:
                        # Find the correct option
                        correct_option = QuizOption.query.filter_by(question_id=question.id, is_correct=True).first()
                        is_correct = (answer_value == 'true' and correct_option.option_text.lower() == 'true') or \
                                    (answer_value == 'false' and correct_option.option_text.lower() == 'false')

                        # Create an answer record
                        answer = QuizAnswer(
                            attempt_id=attempt.id,
                            question_id=question.id,
                            text_answer=answer_value,
                            is_correct=is_correct
                        )
                        db.session.add(answer)

                        if is_correct:
                            earned_points += question.points
                    else:
                        # No answer provided
                        answer = QuizAnswer(
                            attempt_id=attempt.id,
                            question_id=question.id,
                            is_correct=False
                        )
                        db.session.add(answer)

                elif question.question_type == 'text':
                    text_answer = request.form.get(f'question_{question.id}', '').strip()

                    # For text questions, we'll need manual grading or a more sophisticated
                    # matching algorithm. For now, we'll just record the answer.
                    answer = QuizAnswer(
                        attempt_id=attempt.id,
                        question_id=question.id,
                        text_answer=text_answer,
                        is_correct=False  # Will need to be graded manually
                    )
                    db.session.add(answer)

            # Calculate the score as a percentage
            if total_points > 0:
                score = int((earned_points / total_points) * 100)
            else:
                score = 0

            # Update the attempt record
            attempt.score = score
            attempt.passed = score >= quiz.passing_score
            attempt.completed_at = datetime.now()

            # Update user progress if they passed
            if attempt.passed:
                progress = UserProgress.query.filter_by(
                    user_id=current_user.id,
                    module=quiz.module,
                    topic=quiz.topic
                ).first()

                if progress:
                    progress.completed = True
                    progress.score = score
                    progress.last_accessed = datetime.now()
                else:
                    progress = UserProgress(
                        user_id=current_user.id,
                        module=quiz.module,
                        topic=quiz.topic,
                        completed=True,
                        score=score
                    )
                    db.session.add(progress)

            db.session.commit()

            return redirect(url_for('quiz.quiz_result', quiz_id=quiz.id, attempt_id=attempt.id))

    # Create an empty form for CSRF protection
    form = FlaskForm()

    return render_template('quiz/quiz_take.html',
                           title=f"Taking: {quiz.title}",
                           quiz=quiz,
                           attempt=attempt,
                           questions=questions,
                           form=form)


@quiz_bp.route('/quiz/<int:quiz_id>/result/<attempt_id>')
def quiz_result(quiz_id, attempt_id):
    """Show the results of a quiz attempt."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Handle guest users
    if not current_user.is_authenticated:
        # Check if this is a valid guest attempt
        if attempt_id not in session.get('guest_attempts', {}):
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        guest_attempt = session['guest_attempts'][attempt_id]

        # Ensure the attempt is for the correct quiz
        if guest_attempt['quiz_id'] != quiz.id:
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Create a simple attempt object for the template
        class GuestAttempt:
            def __init__(self, id, quiz_id, score, passed, completed_at):
                self.id = id
                self.quiz_id = quiz_id
                self.score = score
                self.passed = passed
                self.completed_at = completed_at

        # Convert completed_at string to datetime if it exists
        completed_at = None
        if 'completed_at' in guest_attempt and guest_attempt['completed_at']:
            try:
                completed_at = datetime.fromisoformat(guest_attempt['completed_at'])
            except (ValueError, TypeError):
                completed_at = None

        attempt = GuestAttempt(
            attempt_id,
            quiz.id,
            guest_attempt['score'],
            guest_attempt['passed'],
            completed_at
        )

        # Create a simple answer dictionary
        answer_dict = {}
        for question_id, answer_data in guest_attempt.get('answers', {}).items():
            class GuestAnswer:
                def __init__(self, question_id, selected_option_id=None, text_answer=None, is_correct=False):
                    self.question_id = int(question_id)
                    self.selected_option_id = selected_option_id
                    self.text_answer = text_answer
                    self.is_correct = is_correct

            answer = GuestAnswer(
                question_id,
                answer_data.get('selected_option_id'),
                answer_data.get('text_answer'),
                answer_data.get('is_correct', False)
            )
            answer_dict[int(question_id)] = answer
    else:
        # Handle authenticated users
        attempt = QuizAttempt.query.get_or_404(attempt_id)

        # Ensure the attempt belongs to the current user
        if attempt.user_id != current_user.id:
            flash('You do not have permission to access this quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Get all answers for this attempt
        answers = QuizAnswer.query.filter_by(attempt_id=attempt.id).all()

        # Organize answers by question
        answer_dict = {answer.question_id: answer for answer in answers}

    # Get all questions for this quiz
    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).order_by(QuizQuestion.order).all()

    return render_template('quiz/quiz_result.html',
                           title=f"Results: {quiz.title}",
                           quiz=quiz,
                           attempt=attempt,
                           questions=questions,
                           answers=answer_dict)


@quiz_bp.route('/module/<module_id>/topic/<topic_id>/quiz')
def module_topic_quiz(module_id, topic_id):
    """Show the quiz for a specific module and topic."""
    # Find the quiz for this module and topic
    quiz = Quiz.query.filter_by(module=module_id, topic=topic_id).first_or_404()

    return redirect(url_for('quiz.quiz_detail', quiz_id=quiz.id))


@quiz_bp.route('/quiz/<int:quiz_id>/assignment/<attempt_id>')
def quiz_assignment(quiz_id, attempt_id):
    """Show the assignment for a quiz after completion."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Handle guest users
    if not current_user.is_authenticated:
        # Check if this is a valid guest attempt
        if attempt_id not in session.get('guest_attempts', {}):
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        guest_attempt = session['guest_attempts'][attempt_id]

        # Ensure the attempt is for the correct quiz
        if guest_attempt['quiz_id'] != quiz.id:
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Create a simple attempt object for the template
        class GuestAttempt:
            def __init__(self, id, quiz_id, score, passed):
                self.id = id
                self.quiz_id = quiz_id
                self.score = score
                self.passed = passed

        attempt = GuestAttempt(
            attempt_id,
            quiz.id,
            guest_attempt['score'],
            guest_attempt['passed']
        )
    else:
        # Handle authenticated users
        attempt = QuizAttempt.query.get_or_404(attempt_id)

        # Ensure the attempt belongs to the current user
        if attempt.user_id != current_user.id:
            flash('You do not have permission to access this quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

        # Ensure the attempt is for the correct quiz
        if attempt.quiz_id != quiz.id:
            flash('Invalid quiz attempt.', 'danger')
            return redirect(url_for('quiz.quiz_list'))

    return render_template('quiz/quiz_assignment.html',
                           title=f"Assignment: {quiz.title}",
                           quiz=quiz,
                           attempt=attempt)


@quiz_bp.route('/api/quizzes/<module_id>/<topic_id>')
def api_get_quiz(module_id, topic_id):
    """API endpoint to get a quiz for a specific module and topic."""
    quiz = Quiz.query.filter_by(module=module_id, topic=topic_id).first()

    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    # Get the questions for this quiz
    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).order_by(QuizQuestion.order).all()

    # Format the quiz data
    quiz_data = {
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'passing_score': quiz.passing_score,
        'questions': []
    }

    for question in questions:
        # Get the options for this question
        options = QuizOption.query.filter_by(question_id=question.id).order_by(QuizOption.order).all()

        question_data = {
            'id': question.id,
            'text': question.question_text,
            'type': question.question_type,
            'explanation': question.explanation,
            'points': question.points,
            'options': [{'id': option.id, 'text': option.option_text} for option in options]
        }

        quiz_data['questions'].append(question_data)

    return jsonify(quiz_data)


@quiz_bp.route('/api/quiz-attempt', methods=['POST'])
def api_submit_quiz():
    """API endpoint to submit a quiz attempt."""
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    quiz_id = data.get('quiz_id')
    answers = data.get('answers', [])

    if not quiz_id:
        return jsonify({'error': 'Quiz ID is required'}), 400

    if not answers:
        return jsonify({'error': 'No answers provided'}), 400

    # Get the quiz
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    # Create a new attempt
    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score=0,
        passed=False
    )
    db.session.add(attempt)
    db.session.commit()

    # Process the answers
    total_points = 0
    earned_points = 0

    for answer_data in answers:
        question_id = answer_data.get('question_id')
        selected_option_id = answer_data.get('selected_option_id')
        text_answer = answer_data.get('text_answer')

        if not question_id:
            continue

        # Get the question
        question = QuizQuestion.query.get(question_id)
        if not question or question.quiz_id != quiz.id:
            continue

        total_points += question.points

        if question.question_type == 'multiple_choice':
            if selected_option_id:
                selected_option = QuizOption.query.get(selected_option_id)
                if selected_option and selected_option.question_id == question.id:
                    # Create an answer record
                    answer = QuizAnswer(
                        attempt_id=attempt.id,
                        question_id=question.id,
                        selected_option_id=selected_option_id,
                        is_correct=selected_option.is_correct
                    )
                    db.session.add(answer)

                    if selected_option.is_correct:
                        earned_points += question.points

        elif question.question_type == 'true_false':
            if text_answer:
                # Find the correct option
                correct_option = QuizOption.query.filter_by(question_id=question.id, is_correct=True).first()
                is_correct = (text_answer.lower() == 'true' and correct_option.option_text.lower() == 'true') or \
                            (text_answer.lower() == 'false' and correct_option.option_text.lower() == 'false')

                # Create an answer record
                answer = QuizAnswer(
                    attempt_id=attempt.id,
                    question_id=question.id,
                    text_answer=text_answer,
                    is_correct=is_correct
                )
                db.session.add(answer)

                if is_correct:
                    earned_points += question.points

        elif question.question_type == 'text':
            if text_answer:
                # For text questions, we'll need manual grading
                answer = QuizAnswer(
                    attempt_id=attempt.id,
                    question_id=question.id,
                    text_answer=text_answer,
                    is_correct=False  # Will need to be graded manually
                )
                db.session.add(answer)

    # Calculate the score as a percentage
    if total_points > 0:
        score = int((earned_points / total_points) * 100)
    else:
        score = 0

    # Update the attempt record
    attempt.score = score
    attempt.passed = score >= quiz.passing_score
    attempt.completed_at = datetime.now()

    # Update user progress if they passed
    if attempt.passed:
        progress = UserProgress.query.filter_by(
            user_id=current_user.id,
            module=quiz.module,
            topic=quiz.topic
        ).first()

        if progress:
            progress.completed = True
            progress.score = score
            progress.last_accessed = datetime.now()
        else:
            progress = UserProgress(
                user_id=current_user.id,
                module=quiz.module,
                topic=quiz.topic,
                completed=True,
                score=score
            )
            db.session.add(progress)

    db.session.commit()

    return jsonify({
        'attempt_id': attempt.id,
        'score': score,
        'passed': attempt.passed,
        'result_url': url_for('quiz.quiz_result', quiz_id=quiz.id, attempt_id=attempt.id)
    })


@quiz_bp.route('/api/quiz/topic/<module_id>/<topic_id>/pop')
def api_get_pop_quiz(module_id, topic_id):
    """API endpoint to get a pop quiz for a specific module and topic."""
    pop_quiz = PopQuiz.query.filter_by(module=module_id, topic=topic_id).first()

    if not pop_quiz:
        # If no pop quiz exists for this topic, create a simple one from the regular quiz
        regular_quiz = Quiz.query.filter_by(module=module_id, topic=topic_id).first()

        if not regular_quiz:
            return jsonify({'success': False, 'message': 'No quiz found for this topic'})

        # Get a subset of questions from the regular quiz
        questions = QuizQuestion.query.filter_by(quiz_id=regular_quiz.id).order_by(QuizQuestion.order).limit(3).all()

        if not questions:
            return jsonify({'success': False, 'message': 'No questions found for this topic'})

        # Format the quiz data
        quiz_data = {
            'success': True,
            'quiz': {
                'id': regular_quiz.id,
                'title': f"Quick Check: {regular_quiz.title}",
                'description': "A quick knowledge check to reinforce your learning.",
                'questions': []
            }
        }

        for question in questions:
            # Get the options for this question
            options = QuizOption.query.filter_by(question_id=question.id).order_by(QuizOption.order).all()

            question_data = {
                'id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'explanation': question.explanation,
                'options': [{'id': option.id, 'option_text': option.option_text} for option in options]
            }

            quiz_data['quiz']['questions'].append(question_data)

        return jsonify(quiz_data)

    # If a pop quiz exists, return it
    questions = PopQuizQuestion.query.filter_by(pop_quiz_id=pop_quiz.id).order_by(PopQuizQuestion.order).all()

    if not questions:
        return jsonify({'success': False, 'message': 'No questions found for this pop quiz'})

    # Format the quiz data
    quiz_data = {
        'success': True,
        'quiz': {
            'id': pop_quiz.id,
            'title': pop_quiz.title,
            'description': pop_quiz.description,
            'questions': []
        }
    }

    for question in questions:
        question_data = {
            'id': question.id,
            'question_text': question.question_text,
            'question_type': question.question_type,
            'explanation': question.explanation
        }

        if question.question_type == 'multiple_choice':
            question_data['options'] = question.options
        elif question.question_type == 'true_false':
            question_data['options'] = [
                {'id': 'true', 'option_text': 'True'},
                {'id': 'false', 'option_text': 'False'}
            ]

        quiz_data['quiz']['questions'].append(question_data)

    return jsonify(quiz_data)


@quiz_bp.route('/api/quiz/submit-pop', methods=['POST'])
def api_submit_pop_quiz():
    """API endpoint to submit a pop quiz attempt."""
    data = request.json

    if not data:
        return jsonify({'success': False, 'message': 'No data provided'})

    quiz_id = data.get('quiz_id')
    answers = data.get('answers', {})

    if not quiz_id:
        return jsonify({'success': False, 'message': 'Quiz ID is required'})

    if not answers:
        return jsonify({'success': False, 'message': 'No answers provided'})

    # Check if this is a regular quiz or a pop quiz
    pop_quiz = PopQuiz.query.get(quiz_id)

    if pop_quiz:
        # Process pop quiz answers
        correct_count = 0
        question_results = {}

        for question_id, answer_data in answers.items():
            question = PopQuizQuestion.query.get(int(question_id))
            if not question:
                continue

            selected_option = answer_data.get('selected_option')
            is_correct = False
            user_answer = ""
            correct_answer = ""

            if question.question_type == 'multiple_choice':
                if selected_option and question.options:
                    options = question.options
                    for option in options:
                        if str(option['id']) == str(selected_option):
                            user_answer = option['text']
                            is_correct = option.get('is_correct', False)
                        if option.get('is_correct', False):
                            correct_answer = option['text']

            elif question.question_type == 'true_false':
                user_answer = 'True' if selected_option == 'true' else 'False'
                correct_answer = 'True' if question.correct_answer else 'False'
                is_correct = (selected_option == 'true' and question.correct_answer) or \
                            (selected_option == 'false' and not question.correct_answer)

            if is_correct:
                correct_count += 1

            question_results[question_id] = {
                'is_correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'explanation': question.explanation
            }

        # Update user progress
        progress = UserProgress.query.filter_by(
            user_id=current_user.id,
            module=pop_quiz.module,
            topic=pop_quiz.topic
        ).first()

        if progress:
            progress.last_accessed = datetime.now()
        else:
            progress = UserProgress(
                user_id=current_user.id,
                module=pop_quiz.module,
                topic=pop_quiz.topic,
                last_accessed=datetime.now()
            )
            db.session.add(progress)

        db.session.commit()

        return jsonify({
            'success': True,
            'results': {
                'correct_count': correct_count,
                'total_count': len(question_results),
                'question_results': question_results
            }
        })

    else:
        # Process regular quiz answers as a pop quiz
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'success': False, 'message': 'Quiz not found'})

        correct_count = 0
        question_results = {}

        for question_id, answer_data in answers.items():
            question = QuizQuestion.query.get(int(question_id))
            if not question:
                continue

            selected_option = answer_data.get('selected_option')
            is_correct = False
            user_answer = ""
            correct_answer = ""

            if question.question_type == 'multiple_choice':
                if selected_option:
                    selected_option_obj = QuizOption.query.get(int(selected_option))
                    if selected_option_obj:
                        user_answer = selected_option_obj.option_text
                        is_correct = selected_option_obj.is_correct

                # Find the correct answer
                correct_option = QuizOption.query.filter_by(question_id=question.id, is_correct=True).first()
                if correct_option:
                    correct_answer = correct_option.option_text

            elif question.question_type == 'true_false':
                user_answer = 'True' if selected_option == 'true' else 'False'

                # Find the correct answer
                correct_option = QuizOption.query.filter_by(question_id=question.id, is_correct=True).first()
                if correct_option:
                    correct_answer = correct_option.option_text
                    is_correct = (selected_option == 'true' and correct_option.option_text.lower() == 'true') or \
                                (selected_option == 'false' and correct_option.option_text.lower() == 'false')

            if is_correct:
                correct_count += 1

            question_results[question_id] = {
                'is_correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'explanation': question.explanation
            }

        # Update user progress
        progress = UserProgress.query.filter_by(
            user_id=current_user.id,
            module=quiz.module,
            topic=quiz.topic
        ).first()

        if progress:
            progress.last_accessed = datetime.now()
        else:
            progress = UserProgress(
                user_id=current_user.id,
                module=quiz.module,
                topic=quiz.topic,
                last_accessed=datetime.now()
            )
            db.session.add(progress)

        db.session.commit()

        return jsonify({
            'success': True,
            'results': {
                'correct_count': correct_count,
                'total_count': len(question_results),
                'question_results': question_results
            }
        })


@quiz_bp.route('/api/user/progress', methods=['POST'])
def api_update_user_progress():
    """API endpoint to update user progress."""
    data = request.json

    if not data:
        return jsonify({'success': False, 'message': 'No data provided'})

    module_id = data.get('module_id')
    topic_id = data.get('topic_id')
    quiz_score = data.get('quiz_score', 0)
    completed = data.get('completed', False)

    if not module_id or not topic_id:
        return jsonify({'success': False, 'message': 'Module ID and Topic ID are required'})

    # Handle guest users
    if not current_user.is_authenticated:
        # Store progress in session
        if 'guest_progress' not in session:
            session['guest_progress'] = {}

        # Create a unique key for this module/topic
        progress_key = f"{module_id}_{topic_id}"

        # Update or create progress entry
        if progress_key in session['guest_progress']:
            progress = session['guest_progress'][progress_key]
            progress['last_accessed'] = datetime.now().isoformat()
            if completed:
                progress['completed'] = True
            if quiz_score > progress.get('score', 0):
                progress['score'] = quiz_score
        else:
            session['guest_progress'][progress_key] = {
                'module': module_id,
                'topic': topic_id,
                'completed': completed,
                'score': quiz_score,
                'last_accessed': datetime.now().isoformat()
            }

        session.modified = True

        return jsonify({
            'success': True,
            'message': 'Guest progress updated successfully',
            'note': 'Progress will be lost when session expires. Sign in to save progress permanently.'
        })
    else:
        # Update user progress for authenticated users
        progress = UserProgress.query.filter_by(
            user_id=current_user.id,
            module=module_id,
            topic=topic_id
        ).first()

        if progress:
            progress.last_accessed = datetime.now()
            if completed:
                progress.completed = True
            if quiz_score > progress.score:
                progress.score = quiz_score
        else:
            progress = UserProgress(
                user_id=current_user.id,
                module=module_id,
                topic=topic_id,
                completed=completed,
                score=quiz_score,
                last_accessed=datetime.now()
            )
            db.session.add(progress)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'User progress updated successfully'
        })