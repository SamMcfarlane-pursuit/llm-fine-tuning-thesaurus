"""
Script to add a LoRA Implementation quiz to the database.
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

def add_lora_implementation_quiz():
    """Add a LoRA Implementation quiz to the database."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='lora', topic='implementation').first()
        if existing_quiz:
            print("LoRA Implementation quiz already exists. Skipping.")
            return
        
        # Create the quiz
        lora_impl_quiz = Quiz(
            module='lora',
            topic='implementation',
            title='LoRA Implementation',
            description='Test your knowledge of implementing Low-Rank Adaptation (LoRA) in practice.',
            passing_score=70
        )
        db.session.add(lora_impl_quiz)
        db.session.flush()  # Flush to get the quiz ID
        
        # Add questions to the quiz
        questions = [
            {
                'question_text': 'Which library is commonly used to implement LoRA for transformer models?',
                'question_type': 'multiple_choice',
                'explanation': 'The PEFT (Parameter-Efficient Fine-Tuning) library from Hugging Face is commonly used to implement LoRA for transformer models.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'TensorFlow', 'is_correct': False, 'order': 1},
                    {'option_text': 'PyTorch', 'is_correct': False, 'order': 2},
                    {'option_text': 'PEFT', 'is_correct': True, 'order': 3},
                    {'option_text': 'Keras', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'In the PEFT library, which configuration class is used to set up LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The LoraConfig class from the PEFT library is used to configure LoRA parameters such as rank, alpha, and target modules.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'LoraConfig', 'is_correct': True, 'order': 1},
                    {'option_text': 'AdapterConfig', 'is_correct': False, 'order': 2},
                    {'option_text': 'PeftConfig', 'is_correct': False, 'order': 3},
                    {'option_text': 'TransformerConfig', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What does the `target_modules` parameter in LoRA configuration specify?',
                'question_type': 'multiple_choice',
                'explanation': 'The `target_modules` parameter specifies which layers or modules in the model should have LoRA adapters applied to them. This allows for selective application of LoRA to specific parts of the model.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'The output layers to fine-tune', 'is_correct': False, 'order': 1},
                    {'option_text': 'The specific layers to apply LoRA to', 'is_correct': True, 'order': 2},
                    {'option_text': 'The learning rate for each layer', 'is_correct': False, 'order': 3},
                    {'option_text': 'The target accuracy to achieve', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of the `lora_alpha` parameter in LoRA configuration?',
                'question_type': 'multiple_choice',
                'explanation': 'The `lora_alpha` parameter is a scaling factor for the LoRA update. It affects the magnitude of the LoRA contribution to the output. The effective scaling is lora_alpha/r, where r is the rank.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'It sets the learning rate', 'is_correct': False, 'order': 1},
                    {'option_text': 'It controls the dropout rate', 'is_correct': False, 'order': 2},
                    {'option_text': 'It scales the LoRA update', 'is_correct': True, 'order': 3},
                    {'option_text': 'It determines the batch size', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which function from the PEFT library is used to apply LoRA to a pre-trained model?',
                'question_type': 'multiple_choice',
                'explanation': 'The `get_peft_model` function is used to apply LoRA (or other PEFT methods) to a pre-trained model, creating a new model with the LoRA adapters attached.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'apply_lora', 'is_correct': False, 'order': 1},
                    {'option_text': 'get_peft_model', 'is_correct': True, 'order': 2},
                    {'option_text': 'create_lora_model', 'is_correct': False, 'order': 3},
                    {'option_text': 'add_adapters', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'When implementing LoRA, what happens to the original pre-trained model weights during training?',
                'question_type': 'multiple_choice',
                'explanation': 'During LoRA training, the original pre-trained model weights are frozen (not updated), and only the LoRA adapter weights are trained. This is a key aspect of LoRA\'s parameter efficiency.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'They are updated along with LoRA weights', 'is_correct': False, 'order': 1},
                    {'option_text': 'They are frozen and not updated', 'is_correct': True, 'order': 2},
                    {'option_text': 'They are randomly reinitialized', 'is_correct': False, 'order': 3},
                    {'option_text': 'They are gradually reduced to zero', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is a correct code snippet for configuring LoRA with the PEFT library?',
                'question_type': 'multiple_choice',
                'explanation': 'The correct code snippet uses LoraConfig with appropriate parameters (r, lora_alpha, target_modules) and then applies it to a model using get_peft_model.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'lora_config = LoraConfig(r=8, lora_alpha=32, target_modules=["q_proj", "v_proj"])\npeft_model = get_peft_model(model, lora_config)', 'is_correct': True, 'order': 1},
                    {'option_text': 'lora_config = PeftConfig(rank=8, alpha=32, modules=["q_proj", "v_proj"])\npeft_model = apply_lora(model, lora_config)', 'is_correct': False, 'order': 2},
                    {'option_text': 'model.add_lora(rank=8, alpha=32, layers=["q_proj", "v_proj"])', 'is_correct': False, 'order': 3},
                    {'option_text': 'lora_model = LoraModel(model, rank=8, alpha=32)', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'After training a model with LoRA, how can you save just the LoRA weights?',
                'question_type': 'multiple_choice',
                'explanation': 'The `save_pretrained` method on a PEFT model will save only the LoRA adapter weights, not the full model weights. This is useful for distributing the much smaller adapter weights.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'model.save_weights("lora_weights")', 'is_correct': False, 'order': 1},
                    {'option_text': 'model.save_adapters("lora_weights")', 'is_correct': False, 'order': 2},
                    {'option_text': 'model.save_pretrained("lora_weights")', 'is_correct': True, 'order': 3},
                    {'option_text': 'torch.save(model.lora_weights, "lora_weights.pt")', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the advantage of applying LoRA to attention layers rather than all layers in a transformer model?',
                'question_type': 'multiple_choice',
                'explanation': 'Applying LoRA to attention layers (which contain most of the parameters in transformer models) provides a good balance between parameter efficiency and performance. It targets the most important layers while keeping the adapter size small.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'It results in faster inference', 'is_correct': False, 'order': 1},
                    {'option_text': 'It provides better balance between efficiency and performance', 'is_correct': True, 'order': 2},
                    {'option_text': 'It allows for higher learning rates', 'is_correct': False, 'order': 3},
                    {'option_text': 'It prevents overfitting', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'LoRA can only be applied to transformer-based models.',
                'question_type': 'true_false',
                'explanation': 'False. While LoRA was initially designed for transformer models, the concept can be applied to any neural network with weight matrices, though the implementation details and effectiveness may vary.',
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
                quiz_id=lora_impl_quiz.id,
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
        print("Successfully added LoRA Implementation quiz to the database.")

if __name__ == '__main__':
    add_lora_implementation_quiz()
