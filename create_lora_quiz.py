"""
Script to create a quiz for LoRA fine-tuning concepts.
"""
from flask import Flask
from models import Quiz, QuizQuestion, QuizOption
from extensions import db

def create_lora_quiz():
    """Create a quiz for LoRA fine-tuning concepts."""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///thesaurus.db'
    db.init_app(app)
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='lora', topic='concepts').first()
        if existing_quiz:
            print(f"Quiz '{existing_quiz.title}' already exists.")
            return

        # Create the quiz
        quiz = Quiz(
            module='lora',
            topic='concepts',
            title='LoRA Concepts Quiz',
            description='Test your understanding of Low-Rank Adaptation (LoRA) for fine-tuning large language models.',
            passing_score=70
        )
        db.session.add(quiz)
        db.session.flush()  # Get the quiz ID

        # Create questions
        questions = [
            {
                'question_text': 'What does LoRA stand for?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA stands for Low-Rank Adaptation, which is a technique for fine-tuning large language models with significantly fewer parameters.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Low-Rank Adaptation', 'is_correct': True, 'order': 1},
                    {'option_text': 'Local Rank Adjustment', 'is_correct': False, 'order': 2},
                    {'option_text': 'Lightweight Recursive Adaptation', 'is_correct': False, 'order': 3},
                    {'option_text': 'Linear Regression Adaptation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the primary advantage of LoRA over full fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'The primary advantage of LoRA is that it significantly reduces the number of trainable parameters, which leads to lower memory requirements and faster training times.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'Higher accuracy', 'is_correct': False, 'order': 1},
                    {'option_text': 'Reduced number of trainable parameters', 'is_correct': True, 'order': 2},
                    {'option_text': 'Ability to train without a GPU', 'is_correct': False, 'order': 3},
                    {'option_text': 'Elimination of overfitting', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'How does LoRA reduce the number of trainable parameters?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture. These low-rank matrices have far fewer parameters than the original weight matrices.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'By pruning unnecessary neurons', 'is_correct': False, 'order': 1},
                    {'option_text': 'By using quantization to reduce precision', 'is_correct': False, 'order': 2},
                    {'option_text': 'By freezing pre-trained weights and adding low-rank matrices', 'is_correct': True, 'order': 3},
                    {'option_text': 'By training only the final layer of the model', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the "rank" parameter in LoRA configuration?',
                'question_type': 'multiple_choice',
                'explanation': 'The rank parameter (r) in LoRA determines the dimension of the low-rank matrices. A higher rank can capture more complex adaptations but requires more parameters, while a lower rank is more parameter-efficient but may limit adaptation capacity.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'The position of the model in a leaderboard', 'is_correct': False, 'order': 1},
                    {'option_text': 'The dimension of the low-rank matrices', 'is_correct': True, 'order': 2},
                    {'option_text': 'The number of layers to fine-tune', 'is_correct': False, 'order': 3},
                    {'option_text': 'The learning rate multiplier', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is a typical value for the rank parameter in LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Typical rank values for LoRA range from 4 to 32, with 8 or 16 being common choices that balance parameter efficiency and adaptation capacity.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': '1', 'is_correct': False, 'order': 1},
                    {'option_text': '8', 'is_correct': True, 'order': 2},
                    {'option_text': '128', 'is_correct': False, 'order': 3},
                    {'option_text': '1024', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the "alpha" parameter in LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The alpha parameter in LoRA is a scaling factor that controls the magnitude of the LoRA update. It is typically set to be the same as the rank (r) or higher, which effectively increases the learning rate for the LoRA parameters.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'A regularization parameter', 'is_correct': False, 'order': 1},
                    {'option_text': 'The learning rate for the optimizer', 'is_correct': False, 'order': 2},
                    {'option_text': 'A scaling factor for the LoRA update', 'is_correct': True, 'order': 3},
                    {'option_text': 'The dropout probability', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which modules are typically targeted for LoRA adaptation in a Transformer model?',
                'question_type': 'multiple_choice',
                'explanation': 'In Transformer models, LoRA is typically applied to the query and value projection matrices in the attention layers, as these have been found to be most effective for adaptation while keeping parameter count low.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'Only the embedding layer', 'is_correct': False, 'order': 1},
                    {'option_text': 'Only the output layer', 'is_correct': False, 'order': 2},
                    {'option_text': 'Query and value projections in attention layers', 'is_correct': True, 'order': 3},
                    {'option_text': 'Only the feed-forward networks', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'How much VRAM is typically required to fine-tune a 7B parameter model with LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA significantly reduces memory requirements, allowing a 7B parameter model to be fine-tuned with approximately 8-10GB of VRAM, compared to 14-16GB for full fine-tuning.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': '2-4GB', 'is_correct': False, 'order': 1},
                    {'option_text': '8-10GB', 'is_correct': True, 'order': 2},
                    {'option_text': '20-24GB', 'is_correct': False, 'order': 3},
                    {'option_text': '40-48GB', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is an advantage of using LoRA adapters compared to fully fine-tuned models?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA adapters are small and can be easily swapped without changing the base model. This allows for efficient storage and deployment of multiple task-specific adaptations using a single base model.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'LoRA adapters always produce better results', 'is_correct': False, 'order': 1},
                    {'option_text': 'LoRA adapters can be easily swapped for different tasks', 'is_correct': True, 'order': 2},
                    {'option_text': 'LoRA adapters don\'t require any training', 'is_correct': False, 'order': 3},
                    {'option_text': 'LoRA adapters work without the base model', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'True or False: LoRA can be combined with quantization techniques like QLoRA for even greater memory efficiency.',
                'question_type': 'true_false',
                'explanation': 'True. LoRA can be combined with quantization techniques, as in QLoRA, which quantizes the base model to 4-bit precision while keeping the LoRA adapters in higher precision, further reducing memory requirements.',
                'points': 1,
                'order': 10,
                'options': [
                    {'option_text': 'True', 'is_correct': True, 'order': 1},
                    {'option_text': 'False', 'is_correct': False, 'order': 2}
                ]
            }
        ]

        # Add questions and options
        for q_data in questions:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_data['question_text'],
                question_type=q_data['question_type'],
                explanation=q_data['explanation'],
                points=q_data['points'],
                order=q_data['order']
            )
            db.session.add(question)
            db.session.flush()  # Get the question ID

            for o_data in q_data['options']:
                option = QuizOption(
                    question_id=question.id,
                    option_text=o_data['option_text'],
                    is_correct=o_data['is_correct'],
                    order=o_data['order']
                )
                db.session.add(option)

        # Commit all changes
        db.session.commit()
        print(f"Created quiz: {quiz.title}")

if __name__ == '__main__':
    create_lora_quiz()
