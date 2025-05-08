"""
Routes for the quiz module.
"""
from flask import render_template, request, redirect, url_for, flash, jsonify, current_app, session
from flask_login import current_user, login_required
from . import quiz_bp
from models import Quiz, QuizQuestion as Question, QuizOption as Option, QuizAttempt, QuizAnswer, db
from models import QuizAttempt as QuizResult, QuizAnswer as QuizResultDetail
from datetime import datetime
import random

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

@quiz_bp.route('/')
def quiz_list():
    """Render the quiz list page."""
    # Get all quizzes
    quizzes = Quiz.query.all()

    # Get user's attempts for each quiz if logged in
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

    return render_template('quiz/quiz_list.html', quizzes=quizzes, user_attempts=user_attempts)

@quiz_bp.route('/<int:quiz_id>')
def quiz_detail(quiz_id):
    """Render a specific quiz."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Check if user has already taken this quiz
    if current_user.is_authenticated:
        result = QuizResult.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()
        if result:
            flash(f"You've already taken this quiz. Your score was {result.score}/{result.max_score} ({round((result.score / result.max_score) * 100)}%).", "info")
            return redirect(url_for('quiz.quiz_result', result_id=result.id))

    # Shuffle questions for randomization
    questions = list(quiz.questions)
    random.shuffle(questions)

    # Limit to 10 questions if there are more
    if len(questions) > 10:
        questions = questions[:10]

    # Shuffle options for each question
    for question in questions:
        # Convert AppenderQuery to list before shuffling
        options_list = list(question.options)
        random.shuffle(options_list)
        question.options = options_list

    return render_template('quiz/quiz_detail.html', quiz=quiz, questions=questions)

@quiz_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@login_required
def quiz_submit(quiz_id):
    """Handle quiz submission."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Get all questions for this quiz
    questions = Question.query.filter_by(quiz_id=quiz_id).all()

    # Calculate score
    score = 0
    max_score = len(questions)

    # Create quiz result
    quiz_result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=0,  # Will update after processing
        max_score=max_score,
        date_taken=datetime.now()
    )
    db.session.add(quiz_result)
    db.session.flush()  # Get the ID without committing

    # Process each question
    for question in questions:
        # Get user's answer
        user_answer_id = request.form.get(f'question_{question.id}')

        # Find the correct answer
        correct_option = Option.query.filter_by(question_id=question.id, is_correct=True).first()

        # Check if user's answer is correct
        is_correct = False
        if user_answer_id and int(user_answer_id) == correct_option.id:
            score += 1
            is_correct = True

        # Create result detail
        result_detail = QuizResultDetail(
            quiz_result_id=quiz_result.id,
            question_id=question.id,
            selected_option_id=int(user_answer_id) if user_answer_id else None,
            is_correct=is_correct
        )
        db.session.add(result_detail)

    # Update the score
    quiz_result.score = score

    # Commit to database
    try:
        db.session.commit()
        flash(f"Quiz submitted successfully! Your score: {score}/{max_score}", "success")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error submitting quiz: {e}")
        flash("There was an error submitting your quiz. Please try again.", "error")
        return redirect(url_for('quiz.quiz_detail', quiz_id=quiz_id))

    return redirect(url_for('quiz.quiz_result', result_id=quiz_result.id))

@quiz_bp.route('/result/<int:result_id>')
@login_required
def quiz_result(result_id):
    """Show quiz result."""
    result = QuizResult.query.get_or_404(result_id)

    # Ensure user can only see their own results
    if result.user_id != current_user.id:
        flash("You don't have permission to view this result.", "error")
        return redirect(url_for('quiz.quiz_list'))

    # Get quiz details
    quiz = Quiz.query.get(result.quiz_id)

    # Get result details with questions and options
    result_details = QuizResultDetail.query.filter_by(quiz_result_id=result_id).all()

    # Prepare data for template
    details = []
    for detail in result_details:
        question = Question.query.get(detail.question_id)
        selected_option = Option.query.get(detail.selected_option_id) if detail.selected_option_id else None
        correct_option = Option.query.filter_by(question_id=question.id, is_correct=True).first()

        details.append({
            'question': question,
            'selected_option': selected_option,
            'correct_option': correct_option,
            'is_correct': detail.is_correct
        })

    # Calculate percentage
    percentage = round((result.score / result.max_score) * 100) if result.max_score > 0 else 0

    return render_template('quiz/quiz_result.html',
                          result=result,
                          quiz=quiz,
                          details=details,
                          percentage=percentage)

@quiz_bp.route('/api/results')
@login_required
def api_results():
    """API endpoint to get user's quiz results."""
    results = QuizResult.query.filter_by(user_id=current_user.id).all()

    # Format results for API
    formatted_results = []
    for result in results:
        quiz = Quiz.query.get(result.quiz_id)
        formatted_results.append({
            'id': result.id,
            'quiz_id': result.quiz_id,
            'quiz_title': quiz.title,
            'score': result.score,
            'max_score': result.max_score,
            'percentage': round((result.score / result.max_score) * 100) if result.max_score > 0 else 0,
            'date_taken': result.date_taken.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(formatted_results)

@quiz_bp.route('/api/random-question')
def api_random_question():
    """API endpoint to get a random quiz question."""
    # Get a random question
    question_count = Question.query.count()
    if question_count == 0:
        return jsonify({'error': 'No questions available'}), 404

    random_offset = random.randint(0, question_count - 1)
    question = Question.query.offset(random_offset).first()

    # Get options for the question
    options = Option.query.filter_by(question_id=question.id).all()

    # Format for API
    formatted_options = []
    for option in options:
        formatted_options.append({
            'id': option.id,
            'text': option.text,
            # Don't include is_correct in the API response
        })

    # Shuffle options
    random.shuffle(formatted_options)

    return jsonify({
        'id': question.id,
        'text': question.text,
        'options': formatted_options,
        'quiz_id': question.quiz_id
    })

@quiz_bp.route('/api/check-answer', methods=['POST'])
def api_check_answer():
    """API endpoint to check if an answer is correct."""
    data = request.json

    if not data or 'question_id' not in data or 'option_id' not in data:
        return jsonify({'error': 'Invalid request data'}), 400

    question_id = data['question_id']
    option_id = data['option_id']

    # Get the selected option
    option = Option.query.get(option_id)
    if not option or option.question_id != question_id:
        return jsonify({'error': 'Invalid option ID'}), 400

    # Check if the option is correct
    is_correct = option.is_correct

    # Get the correct option for feedback
    correct_option = Option.query.filter_by(question_id=question_id, is_correct=True).first()

    return jsonify({
        'is_correct': is_correct,
        'correct_option_id': correct_option.id,
        'correct_option_text': correct_option.text,
        'feedback': 'Correct!' if is_correct else f'Incorrect. The correct answer is: {correct_option.text}'
    })

@quiz_bp.route('/<int:quiz_id>/take')
def quiz_take(quiz_id):
    """Take a quiz."""
    quiz = Quiz.query.get_or_404(quiz_id)

    # Shuffle questions for randomization
    questions = list(quiz.questions)
    random.shuffle(questions)

    # Limit to 10 questions if there are more
    if len(questions) > 10:
        questions = questions[:10]

    # Shuffle options for each question
    for question in questions:
        # Convert AppenderQuery to list before shuffling
        options_list = list(question.options)
        random.shuffle(options_list)
        question.options = options_list

    return render_template('quiz/quiz_take.html', quiz=quiz, questions=questions)
