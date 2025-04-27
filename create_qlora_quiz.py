"""
Script to create a quiz for the QLoRA Deep Dive workshop.
"""
from app import app, db
from models import Quiz, QuizQuestion, QuizOption

def create_qlora_quiz():
    """Create a quiz for the QLoRA Deep Dive workshop."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='qlora', topic='advanced').first()
        if existing_quiz:
            print(f"Quiz '{existing_quiz.title}' already exists.")
            return
        
        # Create the quiz
        quiz = Quiz(
            module='qlora',
            topic='advanced',
            title='QLoRA Deep Dive Quiz',
            description='Test your understanding of Quantized Low-Rank Adaptation (QLoRA) for fine-tuning large language models.',
            passing_score=70
        )
        db.session.add(quiz)
        db.session.flush()  # Get the quiz ID
        
        # Create questions
        questions = [
            {
                'question_text': 'What does QLoRA stand for?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA stands for Quantized Low-Rank Adaptation, which combines quantization techniques with Low-Rank Adaptation (LoRA) for memory-efficient fine-tuning.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Quantum Low-Rank Adaptation', 'is_correct': False, 'order': 1},
                    {'option_text': 'Quantized Low-Rank Adaptation', 'is_correct': True, 'order': 2},
                    {'option_text': 'Quality Low-Rank Adaptation', 'is_correct': False, 'order': 3},
                    {'option_text': 'Quick Low-Rank Adaptation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is a key innovation in QLoRA compared to standard LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA introduces 4-bit NF4 quantization of the base model weights, which significantly reduces memory usage compared to standard LoRA that typically uses 16-bit or 32-bit weights.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': '4-bit NF4 quantization of base model weights', 'is_correct': True, 'order': 1},
                    {'option_text': 'Training all model parameters instead of a subset', 'is_correct': False, 'order': 2},
                    {'option_text': 'Using higher rank matrices for adaptation', 'is_correct': False, 'order': 3},
                    {'option_text': 'Eliminating the need for backpropagation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Why is NF4 (NormalFloat 4-bit) quantization particularly effective for language models?',
                'question_type': 'multiple_choice',
                'explanation': 'NF4 is designed specifically for the normal distribution of weights in neural networks. Language model weights typically follow a normal distribution, making NF4 more effective than uniform quantization methods.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'It uses fewer bits than other quantization methods', 'is_correct': False, 'order': 1},
                    {'option_text': 'It is optimized for the normal distribution of weights in neural networks', 'is_correct': True, 'order': 2},
                    {'option_text': 'It allows for faster computation on GPUs', 'is_correct': False, 'order': 3},
                    {'option_text': 'It preserves more information in attention layers', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is double quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Double quantization is a technique that quantizes the quantization constants themselves, further reducing memory usage by about 0.37 bits per parameter.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'Applying quantization twice to the same weights', 'is_correct': False, 'order': 1},
                    {'option_text': 'Quantizing both weights and activations', 'is_correct': False, 'order': 2},
                    {'option_text': 'Quantizing the quantization constants themselves', 'is_correct': True, 'order': 3},
                    {'option_text': 'Using two different quantization algorithms in parallel', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which library is commonly used to implement 4-bit quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'bitsandbytes is a library that provides efficient implementations of 4-bit and 8-bit quantization for PyTorch, and is commonly used in QLoRA implementations.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'transformers', 'is_correct': False, 'order': 1},
                    {'option_text': 'bitsandbytes', 'is_correct': True, 'order': 2},
                    {'option_text': 'pytorch-quantization', 'is_correct': False, 'order': 3},
                    {'option_text': 'TensorRT', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the primary advantage of QLoRA over full fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'The primary advantage of QLoRA is its dramatically reduced memory requirements, which allow fine-tuning of much larger models on consumer hardware than would be possible with full fine-tuning.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'Faster training speed', 'is_correct': False, 'order': 1},
                    {'option_text': 'Better model accuracy', 'is_correct': False, 'order': 2},
                    {'option_text': 'Reduced memory requirements', 'is_correct': True, 'order': 3},
                    {'option_text': 'Simpler implementation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is NOT a step in implementing QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Pruning model weights is not part of the QLoRA method. QLoRA involves quantizing the base model, preparing it for k-bit training, applying LoRA adapters, and using memory-efficient training techniques.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'Quantizing the base model to 4-bit precision', 'is_correct': False, 'order': 1},
                    {'option_text': 'Preparing the model for k-bit training', 'is_correct': False, 'order': 2},
                    {'option_text': 'Applying LoRA adapters to specific layers', 'is_correct': False, 'order': 3},
                    {'option_text': 'Pruning model weights to reduce parameters', 'is_correct': True, 'order': 4}
                ]
            },
            {
                'question_text': 'What does the "target_modules" parameter specify in LoRA configuration?',
                'question_type': 'multiple_choice',
                'explanation': 'The "target_modules" parameter in LoRA configuration specifies which layers or modules in the model will have LoRA adapters applied to them, typically attention layers like query and value projections.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'The modules to be frozen during training', 'is_correct': False, 'order': 1},
                    {'option_text': 'The modules to apply LoRA adapters to', 'is_correct': True, 'order': 2},
                    {'option_text': 'The modules to be quantized', 'is_correct': False, 'order': 3},
                    {'option_text': 'The output modules for evaluation', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Approximately how much VRAM is required to fine-tune a 13B parameter model with QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA can fine-tune a 13B parameter model with approximately 8GB of VRAM, compared to around 52GB required for full fine-tuning.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': '4GB', 'is_correct': False, 'order': 1},
                    {'option_text': '8GB', 'is_correct': True, 'order': 2},
                    {'option_text': '16GB', 'is_correct': False, 'order': 3},
                    {'option_text': '24GB', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'True or False: QLoRA generally produces models with significantly worse performance than full fine-tuning.',
                'question_type': 'true_false',
                'explanation': 'False. QLoRA has been shown to match or even exceed the performance of full fine-tuning in many cases, while using a fraction of the memory.',
                'points': 1,
                'order': 10,
                'options': [
                    {'option_text': 'True', 'is_correct': False, 'order': 1},
                    {'option_text': 'False', 'is_correct': True, 'order': 2}
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
    create_qlora_quiz()
