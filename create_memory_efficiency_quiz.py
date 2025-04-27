"""
Script to create a quiz for the Memory Efficiency in LLM Fine-Tuning workshop.
"""
from app import app, db
from models import Quiz, QuizQuestion, QuizOption

def create_memory_efficiency_quiz():
    """Create a quiz for the Memory Efficiency workshop."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='memory-efficiency', topic='basics').first()
        if existing_quiz:
            print(f"Quiz '{existing_quiz.title}' already exists.")
            return
        
        # Create the quiz
        quiz = Quiz(
            module='memory-efficiency',
            topic='basics',
            title='Memory Efficiency in LLM Fine-Tuning Quiz',
            description='Test your knowledge of memory efficiency techniques for LLM fine-tuning.',
            passing_score=70
        )
        db.session.add(quiz)
        db.session.flush()  # Get the quiz ID
        
        # Create questions
        questions = [
            {
                'question_text': 'What is the primary benefit of using 4-bit quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA uses 4-bit quantization to dramatically reduce the memory footprint of the base model, allowing for fine-tuning of much larger models on consumer hardware.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Faster training speed', 'is_correct': False, 'order': 1},
                    {'option_text': 'Reduced memory usage', 'is_correct': True, 'order': 2},
                    {'option_text': 'Better model accuracy', 'is_correct': False, 'order': 3},
                    {'option_text': 'Smaller file size for deployment', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What does NF4 stand for in the context of QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'NF4 (NormalFloat 4-bit) is a 4-bit data type specifically designed for the normal distribution of weights in neural networks, providing better empirical results than uniform quantization.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'Neural Format 4-bit', 'is_correct': False, 'order': 1},
                    {'option_text': 'NormalFloat 4-bit', 'is_correct': True, 'order': 2},
                    {'option_text': 'Non-Floating 4-bit', 'is_correct': False, 'order': 3},
                    {'option_text': 'New Format 4-bit', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is gradient checkpointing?',
                'question_type': 'multiple_choice',
                'explanation': 'Gradient checkpointing is a technique that trades computation for memory by recomputing activations during the backward pass instead of storing them in memory during the forward pass.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'Saving model checkpoints during training', 'is_correct': False, 'order': 1},
                    {'option_text': 'Verifying gradients for numerical stability', 'is_correct': False, 'order': 2},
                    {'option_text': 'Recomputing activations during backpropagation instead of storing them', 'is_correct': True, 'order': 3},
                    {'option_text': 'Skipping gradient updates for certain layers', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is NOT a component of QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA combines 4-bit NF4 quantization, double quantization, LoRA, and paged optimizers. Knowledge distillation is a separate technique for creating smaller models by training them to mimic larger ones.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': '4-bit NF4 quantization', 'is_correct': False, 'order': 1},
                    {'option_text': 'Double quantization', 'is_correct': False, 'order': 2},
                    {'option_text': 'Low-rank adaptation (LoRA)', 'is_correct': False, 'order': 3},
                    {'option_text': 'Knowledge distillation', 'is_correct': True, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the approximate memory reduction achieved by using 8-bit optimizers compared to 32-bit optimizers?',
                'question_type': 'multiple_choice',
                'explanation': '8-bit optimizers reduce the memory footprint of optimizer states by 75% compared to 32-bit (FP32) optimizers, as they use 8 bits per parameter instead of 32 bits.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': '25%', 'is_correct': False, 'order': 1},
                    {'option_text': '50%', 'is_correct': False, 'order': 2},
                    {'option_text': '75%', 'is_correct': True, 'order': 3},
                    {'option_text': '90%', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the primary trade-off when using gradient checkpointing?',
                'question_type': 'multiple_choice',
                'explanation': 'Gradient checkpointing trades computation time for memory savings. By recomputing activations during the backward pass, it reduces memory usage but increases the computation time, typically making training about 20-30% slower.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'Model accuracy vs. training speed', 'is_correct': False, 'order': 1},
                    {'option_text': 'Memory usage vs. computation time', 'is_correct': True, 'order': 2},
                    {'option_text': 'Model size vs. inference speed', 'is_correct': False, 'order': 3},
                    {'option_text': 'Training data size vs. model capacity', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which parameter in LoRA controls the rank of the low-rank matrices?',
                'question_type': 'multiple_choice',
                'explanation': 'In LoRA, the "r" parameter controls the rank of the low-rank matrices. A higher rank can capture more complex adaptations but requires more memory and computation.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'lora_alpha', 'is_correct': False, 'order': 1},
                    {'option_text': 'r', 'is_correct': True, 'order': 2},
                    {'option_text': 'lora_dropout', 'is_correct': False, 'order': 3},
                    {'option_text': 'target_modules', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is double quantization in the context of QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Double quantization is a technique used in QLoRA that quantizes the quantization constants themselves, further reducing memory usage by about 0.37 bits per parameter.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'Quantizing a model twice in succession', 'is_correct': False, 'order': 1},
                    {'option_text': 'Quantizing both weights and activations', 'is_correct': False, 'order': 2},
                    {'option_text': 'Quantizing the quantization constants themselves', 'is_correct': True, 'order': 3},
                    {'option_text': 'Using two different quantization methods simultaneously', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following models could you fine-tune on a consumer GPU with 24GB VRAM using QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA enables fine-tuning of models with up to 65B parameters on a single consumer GPU with 24GB VRAM (like an NVIDIA RTX 3090/4090).',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'A 7B parameter model', 'is_correct': False, 'order': 1},
                    {'option_text': 'A 13B parameter model', 'is_correct': False, 'order': 2},
                    {'option_text': 'A 33B parameter model', 'is_correct': False, 'order': 3},
                    {'option_text': 'All of the above', 'is_correct': True, 'order': 4}
                ]
            },
            {
                'question_text': 'True or False: Flash Attention reduces both memory usage and computation time.',
                'question_type': 'true_false',
                'explanation': 'True. Flash Attention is an optimized attention implementation that reduces both memory usage and computation time by using a more efficient algorithm for computing attention.',
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
    create_memory_efficiency_quiz()
