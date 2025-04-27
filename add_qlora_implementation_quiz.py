"""
Script to add a QLoRA Implementation quiz to the database.
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

def add_qlora_implementation_quiz():
    """Add a QLoRA Implementation quiz to the database."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='qlora', topic='implementation').first()
        if existing_quiz:
            print("QLoRA Implementation quiz already exists. Skipping.")
            return
        
        # Create the quiz
        qlora_impl_quiz = Quiz(
            module='qlora',
            topic='implementation',
            title='QLoRA Implementation',
            description='Test your knowledge of implementing Quantized Low-Rank Adaptation (QLoRA) in practice.',
            passing_score=70
        )
        db.session.add(qlora_impl_quiz)
        db.session.flush()  # Flush to get the quiz ID
        
        # Add questions to the quiz
        questions = [
            {
                'question_text': 'Which library is commonly used to implement QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The PEFT (Parameter-Efficient Fine-Tuning) library from Hugging Face, combined with bitsandbytes for quantization, is commonly used to implement QLoRA.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'TensorFlow', 'is_correct': False, 'order': 1},
                    {'option_text': 'PEFT + bitsandbytes', 'is_correct': True, 'order': 2},
                    {'option_text': 'PyTorch only', 'is_correct': False, 'order': 3},
                    {'option_text': 'Keras', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the typical bit precision used for quantizing the base model in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA typically uses 4-bit precision for quantizing the base model weights, which provides a good balance between memory efficiency and performance.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': '2-bit', 'is_correct': False, 'order': 1},
                    {'option_text': '4-bit', 'is_correct': True, 'order': 2},
                    {'option_text': '8-bit', 'is_correct': False, 'order': 3},
                    {'option_text': '16-bit', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which quantization method is typically used in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'NormalFloat4 (NF4) is a 4-bit quantization method specifically designed for language model weights, which better preserves the distribution of weights compared to standard quantization methods.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'Integer quantization', 'is_correct': False, 'order': 1},
                    {'option_text': 'NormalFloat4 (NF4)', 'is_correct': True, 'order': 2},
                    {'option_text': 'Dynamic range quantization', 'is_correct': False, 'order': 3},
                    {'option_text': 'Binary quantization', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of double quantization in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Double quantization further reduces memory usage by quantizing the quantization constants themselves, which can save an additional 0.4-0.5 GB of memory.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'To improve model accuracy', 'is_correct': False, 'order': 1},
                    {'option_text': 'To further reduce memory usage', 'is_correct': True, 'order': 2},
                    {'option_text': 'To speed up inference', 'is_correct': False, 'order': 3},
                    {'option_text': 'To enable multi-GPU training', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is a correct code snippet for loading a model with 4-bit quantization for QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The correct code uses BitsAndBytesConfig with load_in_4bit=True and other appropriate parameters, then passes this config to the from_pretrained method.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'model = AutoModelForCausalLM.from_pretrained("model_name", quantization=4)', 'is_correct': False, 'order': 1},
                    {'option_text': 'bnb_config = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_use_double_quant=True,\n    bnb_4bit_quant_type="nf4"\n)\nmodel = AutoModelForCausalLM.from_pretrained("model_name", quantization_config=bnb_config)', 'is_correct': True, 'order': 2},
                    {'option_text': 'model = AutoModelForCausalLM.from_pretrained("model_name")\nmodel.quantize(bits=4)', 'is_correct': False, 'order': 3},
                    {'option_text': 'model = quantize_model(AutoModelForCausalLM.from_pretrained("model_name"), bits=4)', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is paged_adamw_32bit in the context of QLoRA training?',
                'question_type': 'multiple_choice',
                'explanation': 'Paged AdamW is a memory-efficient optimizer that offloads optimizer states to CPU memory when not in use, which helps reduce GPU memory usage during training.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'A 32-bit version of the AdamW optimizer', 'is_correct': False, 'order': 1},
                    {'option_text': 'A memory-efficient optimizer that offloads states to CPU', 'is_correct': True, 'order': 2},
                    {'option_text': 'A quantized version of AdamW', 'is_correct': False, 'order': 3},
                    {'option_text': 'A parallel implementation of AdamW for multi-GPU training', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of gradient checkpointing in QLoRA training?',
                'question_type': 'multiple_choice',
                'explanation': 'Gradient checkpointing trades computation for memory by recomputing activations during the backward pass instead of storing them. This reduces memory usage at the cost of increased computation time.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'To save model checkpoints during training', 'is_correct': False, 'order': 1},
                    {'option_text': 'To reduce memory usage by recomputing activations', 'is_correct': True, 'order': 2},
                    {'option_text': 'To validate gradients for numerical stability', 'is_correct': False, 'order': 3},
                    {'option_text': 'To parallelize gradient computation across GPUs', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is NOT a memory optimization technique commonly used with QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Model parallelism (splitting the model across multiple GPUs) is not commonly used with QLoRA, as QLoRA already reduces memory usage significantly, allowing large models to fit on a single GPU.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'Gradient checkpointing', 'is_correct': False, 'order': 1},
                    {'option_text': 'Paged optimizers', 'is_correct': False, 'order': 2},
                    {'option_text': 'Flash attention', 'is_correct': False, 'order': 3},
                    {'option_text': 'Model parallelism', 'is_correct': True, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the main advantage of QLoRA over standard LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The main advantage of QLoRA over standard LoRA is the significantly reduced memory usage due to 4-bit quantization, which allows fine-tuning of much larger models on consumer hardware.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'Better performance on downstream tasks', 'is_correct': False, 'order': 1},
                    {'option_text': 'Significantly reduced memory usage', 'is_correct': True, 'order': 2},
                    {'option_text': 'Faster training speed', 'is_correct': False, 'order': 3},
                    {'option_text': 'Support for more model architectures', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'QLoRA adapters can be merged back into the original full-precision model for deployment.',
                'question_type': 'true_false',
                'explanation': 'True. After training with QLoRA, the LoRA adapters can be merged back into the original full-precision model for deployment, eliminating the need for the adapter overhead during inference.',
                'points': 1,
                'order': 10,
                'options': [
                    {'option_text': 'True', 'is_correct': True, 'order': 1},
                    {'option_text': 'False', 'is_correct': False, 'order': 2}
                ]
            }
        ]
        
        for question_data in questions:
            question = QuizQuestion(
                quiz_id=qlora_impl_quiz.id,
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
        print("Successfully added QLoRA Implementation quiz to the database.")

if __name__ == '__main__':
    add_qlora_implementation_quiz()
