"""
Script to add a GPT Training Methodology quiz to the database.
"""
import os
from flask import Flask
from models import db, Quiz, QuizQuestion, QuizOption

# Create a Flask app context for database operations
app = Flask(__name__)

# Get the absolute path to the database file
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'thesaurus.db')

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def add_gpt_training_quiz():
    """Add a GPT Training Methodology quiz to the database."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='gpt', topic='training').first()
        if existing_quiz:
            print("GPT Training Methodology quiz already exists. Skipping.")
            return
        
        # Create the quiz
        gpt_training_quiz = Quiz(
            module='gpt',
            topic='training',
            title='GPT Training Methodology',
            description='Test your knowledge of GPT model training methodologies and techniques.',
            passing_score=70
        )
        db.session.add(gpt_training_quiz)
        db.session.flush()  # Flush to get the quiz ID
        
        # Add questions to the quiz
        questions = [
            {
                'question_text': 'What is the primary training objective used in GPT models?',
                'question_type': 'multiple_choice',
                'explanation': 'GPT models are primarily trained using autoregressive language modeling, where the model predicts the next token given the previous tokens. This is also known as causal language modeling.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Masked language modeling', 'is_correct': False, 'order': 1},
                    {'option_text': 'Autoregressive language modeling', 'is_correct': True, 'order': 2},
                    {'option_text': 'Contrastive learning', 'is_correct': False, 'order': 3},
                    {'option_text': 'Supervised classification', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the typical training process for GPT models?',
                'question_type': 'multiple_choice',
                'explanation': 'GPT models typically follow a two-stage training process: pre-training on a large corpus of text data, followed by fine-tuning on specific tasks or with human feedback.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'Pre-training only', 'is_correct': False, 'order': 1},
                    {'option_text': 'Fine-tuning only', 'is_correct': False, 'order': 2},
                    {'option_text': 'Pre-training followed by fine-tuning', 'is_correct': True, 'order': 3},
                    {'option_text': 'Supervised training only', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is Reinforcement Learning from Human Feedback (RLHF)?',
                'question_type': 'multiple_choice',
                'explanation': 'RLHF is a technique where human preferences are used to train a reward model, which is then used to fine-tune the language model using reinforcement learning. This helps align the model with human values and preferences.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'A technique where humans manually correct model outputs', 'is_correct': False, 'order': 1},
                    {'option_text': 'Using human preferences to train a reward model for RL fine-tuning', 'is_correct': True, 'order': 2},
                    {'option_text': 'A method where humans provide the training data', 'is_correct': False, 'order': 3},
                    {'option_text': 'A way to evaluate model performance with human judges', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of the learning rate warmup in GPT training?',
                'question_type': 'multiple_choice',
                'explanation': 'Learning rate warmup gradually increases the learning rate from a small value to the target value at the beginning of training. This helps stabilize early training by preventing large, potentially harmful updates when weights are randomly initialized.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'To prevent overfitting', 'is_correct': False, 'order': 1},
                    {'option_text': 'To stabilize early training with random weights', 'is_correct': True, 'order': 2},
                    {'option_text': 'To speed up convergence at the end of training', 'is_correct': False, 'order': 3},
                    {'option_text': 'To reduce memory usage', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which optimization algorithm is commonly used for training GPT models?',
                'question_type': 'multiple_choice',
                'explanation': 'Adam (Adaptive Moment Estimation) is commonly used for training GPT models because it adapts the learning rate for each parameter, which helps with convergence on complex loss landscapes.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'Stochastic Gradient Descent (SGD)', 'is_correct': False, 'order': 1},
                    {'option_text': 'Adam', 'is_correct': True, 'order': 2},
                    {'option_text': 'RMSprop', 'is_correct': False, 'order': 3},
                    {'option_text': 'Adagrad', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What technique is used to train GPT models on sequences longer than those seen during pre-training?',
                'question_type': 'multiple_choice',
                'explanation': 'Position interpolation involves interpolating the learned positional embeddings to handle sequences longer than those seen during pre-training. This allows the model to generalize to longer contexts.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'Sequence truncation', 'is_correct': False, 'order': 1},
                    {'option_text': 'Position interpolation', 'is_correct': True, 'order': 2},
                    {'option_text': 'Context windowing', 'is_correct': False, 'order': 3},
                    {'option_text': 'Sequence padding', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of gradient accumulation in GPT training?',
                'question_type': 'multiple_choice',
                'explanation': 'Gradient accumulation allows for effectively larger batch sizes by accumulating gradients over multiple forward and backward passes before updating the weights. This is useful when memory constraints prevent using large batch sizes directly.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'To prevent gradient vanishing', 'is_correct': False, 'order': 1},
                    {'option_text': 'To effectively use larger batch sizes with limited memory', 'is_correct': True, 'order': 2},
                    {'option_text': 'To speed up training by skipping gradient calculations', 'is_correct': False, 'order': 3},
                    {'option_text': 'To regularize the model', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of mixed precision training in GPT models?',
                'question_type': 'multiple_choice',
                'explanation': 'Mixed precision training uses lower precision (e.g., 16-bit) for most operations while keeping a master copy of weights in higher precision (32-bit). This reduces memory usage and speeds up training, especially on GPUs with tensor cores.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'To improve model accuracy', 'is_correct': False, 'order': 1},
                    {'option_text': 'To reduce memory usage and speed up training', 'is_correct': True, 'order': 2},
                    {'option_text': 'To make the model more robust', 'is_correct': False, 'order': 3},
                    {'option_text': 'To enable training on CPUs', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of weight decay in GPT training?',
                'question_type': 'multiple_choice',
                'explanation': 'Weight decay (L2 regularization) adds a penalty to the loss function based on the squared magnitude of weights. This encourages smaller weights and helps prevent overfitting by reducing model complexity.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'To speed up convergence', 'is_correct': False, 'order': 1},
                    {'option_text': 'To prevent overfitting by penalizing large weights', 'is_correct': True, 'order': 2},
                    {'option_text': 'To reduce memory usage', 'is_correct': False, 'order': 3},
                    {'option_text': 'To stabilize training', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'GPT models are typically trained with a fixed learning rate throughout the entire training process.',
                'question_type': 'true_false',
                'explanation': 'False. GPT models typically use learning rate schedules, such as warmup followed by decay, to adjust the learning rate during training for better convergence and performance.',
                'points': 1,
                'order': 10,
                'options': [
                    {'option_text': 'True', 'is_correct': False, 'order': 1},
                    {'option_text': 'False', 'is_correct': True, 'order': 2}
                ]
            }
        ]
        
        for question_data in questions:
            question = QuizQuestion(
                quiz_id=gpt_training_quiz.id,
                question_text=question_data['question_text'],
                question_type=question_data['question_type'],
                explanation=question_data['explanation'],
                points=question_data['points'],
                order=question_data['order']
            )
            db.session.add(question)
            db.session.flush()  # Flush to get the question ID
            
            for option_data in question_data['options']:
                option = QuizOption(
                    question_id=question.id,
                    option_text=option_data['option_text'],
                    is_correct=option_data['is_correct'],
                    order=option_data['order']
                )
                db.session.add(option)
        
        # Commit all changes
        db.session.commit()
        print("Successfully added GPT Training Methodology quiz to the database.")

if __name__ == '__main__':
    add_gpt_training_quiz()
