"""
Seed script to populate the database with sample quizzes.
"""
import os
import sys
from datetime import datetime
from flask import Flask
from models import db, Quiz, QuizQuestion, QuizOption

# Create a Flask app context for database operations
app = Flask(__name__)

# Get the absolute path to the database file
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'thesaurus.db')

# Make sure the instance directory exists
os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def seed_quizzes():
    """Seed the database with sample quizzes."""
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        print("Database tables created.")
        # Check if quizzes already exist
        if Quiz.query.count() > 0:
            print("Quizzes already exist in the database. Skipping seed.")
            return

        # Create LoRA Introduction Quiz
        lora_intro_quiz = Quiz(
            module='lora',
            topic='intro',
            title='Introduction to LoRA',
            description='Test your knowledge of Low-Rank Adaptation (LoRA) basics and concepts.',
            passing_score=70
        )
        db.session.add(lora_intro_quiz)
        db.session.flush()  # Flush to get the quiz ID

        # Add questions to the LoRA Introduction Quiz
        questions = [
            {
                'question_text': 'What does LoRA stand for?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA stands for Low-Rank Adaptation, which is a technique for efficient fine-tuning of large language models.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Low-Rank Adaptation', 'is_correct': True, 'order': 1},
                    {'option_text': 'Large Rank Adaptation', 'is_correct': False, 'order': 2},
                    {'option_text': 'Low-Resource Adaptation', 'is_correct': False, 'order': 3},
                    {'option_text': 'Language Rank Adaptation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the main advantage of using LoRA for fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA significantly reduces the number of trainable parameters by freezing the pre-trained model weights and only training low-rank decomposition matrices.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'It requires more computational resources', 'is_correct': False, 'order': 1},
                    {'option_text': 'It reduces the number of trainable parameters', 'is_correct': True, 'order': 2},
                    {'option_text': 'It increases model accuracy by 50%', 'is_correct': False, 'order': 3},
                    {'option_text': 'It allows training without any data', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'In LoRA, what happens to the original pre-trained weights?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA freezes the original pre-trained weights and adds trainable low-rank matrices in parallel to the frozen weights.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'They are completely replaced', 'is_correct': False, 'order': 1},
                    {'option_text': 'They are frozen and kept unchanged', 'is_correct': True, 'order': 2},
                    {'option_text': 'They are randomly initialized', 'is_correct': False, 'order': 3},
                    {'option_text': 'They are partially trained', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What does the rank (r) parameter in LoRA control?',
                'question_type': 'multiple_choice',
                'explanation': 'The rank (r) parameter in LoRA controls the size of the low-rank matrices and thus the number of trainable parameters.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'The learning rate of the model', 'is_correct': False, 'order': 1},
                    {'option_text': 'The size of the low-rank matrices', 'is_correct': True, 'order': 2},
                    {'option_text': 'The number of training epochs', 'is_correct': False, 'order': 3},
                    {'option_text': 'The batch size during training', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'LoRA can be applied to any part of a transformer model.',
                'question_type': 'true_false',
                'explanation': 'While LoRA can theoretically be applied to any weight matrix, it is most commonly and effectively applied to specific parts like attention layers.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'True', 'is_correct': False, 'order': 1},
                    {'option_text': 'False', 'is_correct': True, 'order': 2}
                ]
            }
        ]

        for question_data in questions:
            question = QuizQuestion(
                quiz_id=lora_intro_quiz.id,
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

        # Create QLoRA Introduction Quiz
        qlora_intro_quiz = Quiz(
            module='qlora',
            topic='intro',
            title='Introduction to QLoRA',
            description='Test your knowledge of Quantized Low-Rank Adaptation (QLoRA) basics and concepts.',
            passing_score=70
        )
        db.session.add(qlora_intro_quiz)
        db.session.flush()  # Flush to get the quiz ID

        # Add questions to the QLoRA Introduction Quiz
        questions = [
            {
                'question_text': 'What does the "Q" in QLoRA stand for?',
                'question_type': 'multiple_choice',
                'explanation': 'The "Q" in QLoRA stands for Quantized, referring to the quantization of the base model weights to reduce memory usage.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Quality', 'is_correct': False, 'order': 1},
                    {'option_text': 'Quantized', 'is_correct': True, 'order': 2},
                    {'option_text': 'Quick', 'is_correct': False, 'order': 3},
                    {'option_text': 'Query', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'How does QLoRA improve upon LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA improves upon LoRA by quantizing the base model weights to 4-bit precision, which significantly reduces memory usage during fine-tuning.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'It increases the rank of the adaptation matrices', 'is_correct': False, 'order': 1},
                    {'option_text': 'It quantizes the base model weights to reduce memory usage', 'is_correct': True, 'order': 2},
                    {'option_text': 'It uses a different optimization algorithm', 'is_correct': False, 'order': 3},
                    {'option_text': 'It requires more training data', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the typical bit precision used for quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA typically uses 4-bit precision for quantizing the base model weights, which provides a good balance between memory efficiency and performance.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': '2-bit', 'is_correct': False, 'order': 1},
                    {'option_text': '4-bit', 'is_correct': True, 'order': 2},
                    {'option_text': '8-bit', 'is_correct': False, 'order': 3},
                    {'option_text': '16-bit', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'QLoRA allows fine-tuning of larger models on consumer hardware compared to full fine-tuning.',
                'question_type': 'true_false',
                'explanation': 'True. QLoRA significantly reduces memory requirements, allowing fine-tuning of larger models on consumer hardware that would otherwise be impossible with full fine-tuning.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'True', 'is_correct': True, 'order': 1},
                    {'option_text': 'False', 'is_correct': False, 'order': 2}
                ]
            },
            {
                'question_text': 'What is a potential drawback of using 4-bit quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'A potential drawback of 4-bit quantization is some loss of precision in the model weights, which could potentially impact performance for certain tasks.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'It requires more training epochs', 'is_correct': False, 'order': 1},
                    {'option_text': 'It increases the model size', 'is_correct': False, 'order': 2},
                    {'option_text': 'Some loss of precision in the model weights', 'is_correct': True, 'order': 3},
                    {'option_text': 'It only works with specific model architectures', 'is_correct': False, 'order': 4}
                ]
            }
        ]

        for question_data in questions:
            question = QuizQuestion(
                quiz_id=qlora_intro_quiz.id,
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

        # Create GPT Architecture Quiz
        gpt_architecture_quiz = Quiz(
            module='gpt',
            topic='architecture',
            title='GPT Architecture',
            description='Test your knowledge of GPT model architecture and components.',
            passing_score=70
        )
        db.session.add(gpt_architecture_quiz)
        db.session.flush()  # Flush to get the quiz ID

        # Add questions to the GPT Architecture Quiz
        questions = [
            {
                'question_text': 'What type of architecture is GPT based on?',
                'question_type': 'multiple_choice',
                'explanation': 'GPT (Generative Pre-trained Transformer) is based on the Transformer architecture, specifically using the decoder-only portion of the original Transformer.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Recurrent Neural Network (RNN)', 'is_correct': False, 'order': 1},
                    {'option_text': 'Convolutional Neural Network (CNN)', 'is_correct': False, 'order': 2},
                    {'option_text': 'Transformer', 'is_correct': True, 'order': 3},
                    {'option_text': 'Long Short-Term Memory (LSTM)', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which part of the Transformer architecture does GPT use?',
                'question_type': 'multiple_choice',
                'explanation': 'GPT uses only the decoder part of the Transformer architecture, making it a decoder-only model.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'Encoder only', 'is_correct': False, 'order': 1},
                    {'option_text': 'Decoder only', 'is_correct': True, 'order': 2},
                    {'option_text': 'Both encoder and decoder', 'is_correct': False, 'order': 3},
                    {'option_text': 'Neither encoder nor decoder', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the key mechanism that allows GPT to process input sequences?',
                'question_type': 'multiple_choice',
                'explanation': 'Self-attention is the key mechanism that allows GPT to process input sequences by weighing the importance of different tokens in relation to each other.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'Convolution', 'is_correct': False, 'order': 1},
                    {'option_text': 'Recurrence', 'is_correct': False, 'order': 2},
                    {'option_text': 'Self-attention', 'is_correct': True, 'order': 3},
                    {'option_text': 'Pooling', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'In GPT, what is the purpose of positional encoding?',
                'question_type': 'multiple_choice',
                'explanation': 'Positional encoding is used to give the model information about the position of tokens in the sequence, as the self-attention mechanism itself is permutation-invariant.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'To encode the semantic meaning of words', 'is_correct': False, 'order': 1},
                    {'option_text': 'To provide information about token positions in the sequence', 'is_correct': True, 'order': 2},
                    {'option_text': 'To compress the input representation', 'is_correct': False, 'order': 3},
                    {'option_text': 'To increase the vocabulary size', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'GPT models use bidirectional attention to process text.',
                'question_type': 'true_false',
                'explanation': 'False. GPT models use unidirectional (causal) attention, where each token can only attend to itself and previous tokens, not future tokens.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'True', 'is_correct': False, 'order': 1},
                    {'option_text': 'False', 'is_correct': True, 'order': 2}
                ]
            }
        ]

        for question_data in questions:
            question = QuizQuestion(
                quiz_id=gpt_architecture_quiz.id,
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
        print("Successfully seeded the database with sample quizzes.")

if __name__ == '__main__':
    seed_quizzes()
