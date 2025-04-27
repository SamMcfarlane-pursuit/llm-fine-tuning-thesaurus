"""
Script to add comprehensive quiz content for different LLM fine-tuning topics.
This script should be run within the Flask application context.
"""
from datetime import datetime, timezone
from models import db, Quiz, QuizQuestion, QuizOption

# Define comprehensive quiz data
COMPREHENSIVE_QUIZZES = [
    {
        'module': 'pipeline',
        'topic': 'inference',
        'title': 'Hugging Face Pipeline Inference',
        'description': 'Test your knowledge of the Hugging Face pipeline() function and how to use it for inference with fine-tuned models.',
        'passing_score': 70,
        'questions': [
            {
                'question_text': 'What is the primary purpose of the Hugging Face pipeline() function?',
                'question_type': 'multiple_choice',
                'explanation': 'The pipeline() function provides a simple way to use models for inference on various NLP tasks without having to handle the preprocessing and postprocessing steps manually.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'To train models from scratch', 'is_correct': False},
                    {'option_text': 'To simplify inference by handling preprocessing and postprocessing', 'is_correct': True},
                    {'option_text': 'To convert models between different frameworks', 'is_correct': False},
                    {'option_text': 'To optimize model performance during training', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a valid task that can be used with the pipeline() function?',
                'question_type': 'multiple_choice',
                'explanation': 'The pipeline() function supports various tasks including text-classification, token-classification, question-answering, summarization, translation, text-generation, and more.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'model-conversion', 'is_correct': False},
                    {'option_text': 'text-classification', 'is_correct': True},
                    {'option_text': 'data-preprocessing', 'is_correct': False},
                    {'option_text': 'model-training', 'is_correct': False}
                ]
            },
            {
                'question_text': 'How do you specify a custom model when using the pipeline() function?',
                'question_type': 'multiple_choice',
                'explanation': 'You can specify a custom model by passing the model name or path as the "model" parameter to the pipeline() function.',
                'points': 2,
                'order': 3,
                'options': [
                    {'option_text': 'pipeline(task="text-classification", model="my-custom-model")', 'is_correct': True},
                    {'option_text': 'pipeline(task="text-classification", custom_model="my-custom-model")', 'is_correct': False},
                    {'option_text': 'pipeline(task="text-classification", model_name="my-custom-model")', 'is_correct': False},
                    {'option_text': 'pipeline("text-classification", use_model="my-custom-model")', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What happens when you use a fine-tuned model with the pipeline() function?',
                'question_type': 'multiple_choice',
                'explanation': 'When using a fine-tuned model with the pipeline() function, it automatically uses the appropriate tokenizer and model configuration based on the model you specify.',
                'points': 3,
                'order': 4,
                'options': [
                    {'option_text': 'You need to manually specify the tokenizer and configuration', 'is_correct': False},
                    {'option_text': 'The pipeline automatically uses the appropriate tokenizer and configuration', 'is_correct': True},
                    {'option_text': 'Fine-tuned models cannot be used with the pipeline() function', 'is_correct': False},
                    {'option_text': 'The pipeline will always use the default configuration regardless of the model', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which parameter can be used to control the output length in a text generation pipeline?',
                'question_type': 'multiple_choice',
                'explanation': 'The "max_length" parameter can be used to control the maximum length of the generated text in a text generation pipeline.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': 'length', 'is_correct': False},
                    {'option_text': 'max_tokens', 'is_correct': False},
                    {'option_text': 'max_length', 'is_correct': True},
                    {'option_text': 'output_length', 'is_correct': False}
                ]
            }
        ]
    },
    {
        'module': 'data-preparation',
        'topic': 'advanced',
        'title': 'Advanced Data Preparation for LLM Fine-Tuning',
        'description': 'Test your knowledge of advanced data preparation techniques for LLM fine-tuning, including data cleaning, augmentation, and formatting.',
        'passing_score': 75,
        'questions': [
            {
                'question_text': 'Which of the following is NOT a common data cleaning technique for LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'While removing duplicates, handling missing values, and normalizing text are common data cleaning techniques, adding random noise to training data is not a standard cleaning technique but rather a form of data augmentation or regularization.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'Removing duplicate examples', 'is_correct': False},
                    {'option_text': 'Handling missing values', 'is_correct': False},
                    {'option_text': 'Normalizing text (e.g., lowercase, removing extra whitespace)', 'is_correct': False},
                    {'option_text': 'Adding random noise to all training examples', 'is_correct': True}
                ]
            },
            {
                'question_text': 'What is the purpose of data augmentation in LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Data augmentation helps increase the diversity and size of the training dataset, which can improve model generalization and robustness.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'To reduce the size of the training dataset', 'is_correct': False},
                    {'option_text': 'To increase diversity and improve model generalization', 'is_correct': True},
                    {'option_text': 'To make the model converge faster during training', 'is_correct': False},
                    {'option_text': 'To reduce the model\'s parameter count', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which data format is commonly used for instruction fine-tuning of language models?',
                'question_type': 'multiple_choice',
                'explanation': 'The JSONL (JSON Lines) format is commonly used for instruction fine-tuning, where each line contains a JSON object with fields like "instruction", "input", and "output".',
                'points': 2,
                'order': 3,
                'options': [
                    {'option_text': 'CSV (Comma-Separated Values)', 'is_correct': False},
                    {'option_text': 'JSONL (JSON Lines)', 'is_correct': True},
                    {'option_text': 'XML (eXtensible Markup Language)', 'is_correct': False},
                    {'option_text': 'YAML (YAML Ain\'t Markup Language)', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of template-based formatting in instruction fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Template-based formatting ensures that the model learns to follow a consistent format for instructions and responses, which helps it understand the task structure better.',
                'points': 3,
                'order': 4,
                'options': [
                    {'option_text': 'To reduce the size of the training data', 'is_correct': False},
                    {'option_text': 'To ensure the model learns a consistent format for instructions and responses', 'is_correct': True},
                    {'option_text': 'To make the training process faster', 'is_correct': False},
                    {'option_text': 'To convert between different file formats', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a valid data augmentation technique for text data?',
                'question_type': 'multiple_choice',
                'explanation': 'Synonym replacement is a valid data augmentation technique where words in the original text are replaced with their synonyms to create variations of the training examples.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': 'Image rotation', 'is_correct': False},
                    {'option_text': 'Synonym replacement', 'is_correct': True},
                    {'option_text': 'Color jittering', 'is_correct': False},
                    {'option_text': 'Horizontal flipping', 'is_correct': False}
                ]
            }
        ]
    }
]

def add_quizzes():
    """Add comprehensive quizzes to the database."""
    for quiz_data in COMPREHENSIVE_QUIZZES:
        # Check if quiz already exists
        existing_quiz = Quiz.query.filter_by(
            module=quiz_data['module'],
            topic=quiz_data['topic']
        ).first()
        
        if existing_quiz:
            print(f"Quiz for {quiz_data['module']}/{quiz_data['topic']} already exists. Skipping.")
            continue
            
        # Create new quiz
        quiz = Quiz(
            module=quiz_data['module'],
            topic=quiz_data['topic'],
            title=quiz_data['title'],
            description=quiz_data['description'],
            passing_score=quiz_data['passing_score'],
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(quiz)
        db.session.flush()  # Get the quiz ID without committing
        
        # Add questions and options
        for question_data in quiz_data['questions']:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=question_data['question_text'],
                question_type=question_data['question_type'],
                explanation=question_data.get('explanation', ''),
                points=question_data.get('points', 1),
                order=question_data.get('order', 0)
            )
            db.session.add(question)
            db.session.flush()  # Get the question ID without committing
            
            # Add options for the question
            for i, option_data in enumerate(question_data.get('options', [])):
                option = QuizOption(
                    question_id=question.id,
                    option_text=option_data['option_text'],
                    is_correct=option_data.get('is_correct', False),
                    order=i
                )
                db.session.add(option)
        
        db.session.commit()
        print(f"Added quiz: {quiz.title}")
    
    print("Comprehensive quizzes added successfully!")
