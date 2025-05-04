"""
Models for the quiz module.
"""
from extensions import db
from datetime import datetime

class Quiz(db.Model):
    """Quiz model."""
    __tablename__ = 'quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    difficulty = db.Column(db.String(50), nullable=True)  # easy, medium, hard
    time_limit = db.Column(db.Integer, nullable=True)  # in minutes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')
    results = db.relationship('QuizResult', backref='quiz', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Quiz {self.title}>'

class Question(db.Model):
    """Question model."""
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    points = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    options = db.relationship('Option', backref='question', lazy=True, cascade='all, delete-orphan')
    result_details = db.relationship('QuizResultDetail', backref='question', lazy=True)
    
    def __repr__(self):
        return f'<Question {self.id}: {self.text[:30]}...>'

class Option(db.Model):
    """Option model for quiz questions."""
    __tablename__ = 'options'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    result_details = db.relationship('QuizResultDetail', backref='selected_option', lazy=True)
    
    def __repr__(self):
        return f'<Option {self.id}: {self.text[:30]}... (Correct: {self.is_correct})>'

class QuizResult(db.Model):
    """Quiz result model."""
    __tablename__ = 'quiz_results'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    max_score = db.Column(db.Integer, default=0)
    time_taken = db.Column(db.Integer, nullable=True)  # in seconds
    date_taken = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    details = db.relationship('QuizResultDetail', backref='result', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<QuizResult {self.id}: User {self.user_id}, Quiz {self.quiz_id}, Score {self.score}/{self.max_score}>'

class QuizResultDetail(db.Model):
    """Quiz result detail model."""
    __tablename__ = 'quiz_result_details'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_result_id = db.Column(db.Integer, db.ForeignKey('quiz_results.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    selected_option_id = db.Column(db.Integer, db.ForeignKey('options.id'), nullable=True)
    is_correct = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<QuizResultDetail {self.id}: Result {self.quiz_result_id}, Question {self.question_id}, Correct: {self.is_correct}>'
