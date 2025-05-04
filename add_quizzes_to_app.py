"""
Script to add comprehensive quiz content for different LLM fine-tuning topics.
This script should be run within the Flask application context.
"""
from datetime import datetime, timezone
from models import db, Quiz, QuizQuestion, QuizOption

# Define comprehensive quiz data
COMPREHENSIVE_QUIZZES = [
    {
        'module': 'fine-tuning',
        'topic': 'basics',
        'title': 'LLM Fine-Tuning Basics',
        'description': 'Test your knowledge of the fundamental concepts and techniques in LLM fine-tuning.',
        'passing_score': 70,
        'questions': [
            {
                'question_text': 'What is the primary purpose of fine-tuning a pre-trained language model?',
                'question_type': 'multiple_choice',
                'explanation': 'Fine-tuning adapts a pre-trained model to specific tasks or domains by updating its parameters on a smaller, task-specific dataset.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'To create a completely new model architecture', 'is_correct': False},
                    {'option_text': 'To adapt a pre-trained model to specific tasks or domains', 'is_correct': True},
                    {'option_text': 'To reduce the model size and make it faster', 'is_correct': False},
                    {'option_text': 'To increase the number of parameters in the model', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is an advantage of fine-tuning over training from scratch?',
                'question_type': 'multiple_choice',
                'explanation': 'Fine-tuning requires less data and computational resources compared to training from scratch because it leverages the knowledge already captured in the pre-trained model.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'Fine-tuning always results in better performance', 'is_correct': False},
                    {'option_text': 'Fine-tuning requires more data than training from scratch', 'is_correct': False},
                    {'option_text': 'Fine-tuning requires less data and computational resources', 'is_correct': True},
                    {'option_text': 'Fine-tuning always produces smaller models', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is catastrophic forgetting in the context of fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Catastrophic forgetting occurs when a model loses previously learned knowledge or capabilities after being fine-tuned on a new task or dataset.',
                'points': 3,
                'order': 3,
                'options': [
                    {'option_text': 'When a model loses previously learned knowledge after fine-tuning', 'is_correct': True},
                    {'option_text': 'When a model fails to learn anything during fine-tuning', 'is_correct': False},
                    {'option_text': 'When a model becomes too large to fit in memory', 'is_correct': False},
                    {'option_text': 'When a model training crashes due to hardware limitations', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a parameter-efficient fine-tuning technique?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that adds trainable low-rank matrices to the model while keeping most of the pre-trained weights frozen.',
                'points': 2,
                'order': 4,
                'options': [
                    {'option_text': 'Full fine-tuning', 'is_correct': False},
                    {'option_text': 'LoRA (Low-Rank Adaptation)', 'is_correct': True},
                    {'option_text': 'Pre-training', 'is_correct': False},
                    {'option_text': 'Model distillation', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the recommended learning rate range for fine-tuning large language models?',
                'question_type': 'multiple_choice',
                'explanation': 'For fine-tuning large language models, a learning rate between 1e-5 and 5e-5 is typically recommended as a starting point, though this may vary depending on the specific model and task.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': '0.1 to 0.01', 'is_correct': False},
                    {'option_text': '0.01 to 0.001', 'is_correct': False},
                    {'option_text': '1e-3 to 1e-4', 'is_correct': False},
                    {'option_text': '1e-5 to 5e-5', 'is_correct': True}
                ]
            }
        ]
    },
    {
        'module': 'lora',
        'topic': 'basics',
        'title': 'LoRA Basics',
        'description': 'Test your knowledge of Low-Rank Adaptation (LoRA) for efficient fine-tuning of large language models.',
        'passing_score': 70,
        'questions': [
            {
                'question_text': 'What does LoRA stand for?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA stands for Low-Rank Adaptation, which refers to the technique of using low-rank matrices for efficient parameter updates during fine-tuning.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'Low-Rank Adaptation', 'is_correct': True},
                    {'option_text': 'Long-Range Attention', 'is_correct': False},
                    {'option_text': 'Local Response Activation', 'is_correct': False},
                    {'option_text': 'Layered Representation Architecture', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the main advantage of using LoRA for fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA significantly reduces the number of trainable parameters by freezing the pre-trained weights and only training small, low-rank update matrices, which reduces memory requirements and speeds up training.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'It always produces better results than full fine-tuning', 'is_correct': False},
                    {'option_text': 'It reduces the number of trainable parameters and memory requirements', 'is_correct': True},
                    {'option_text': 'It allows training without any pre-trained weights', 'is_correct': False},
                    {'option_text': 'It completely eliminates the need for GPUs', 'is_correct': False}
                ]
            },
            {
                'question_text': 'How does LoRA work?',
                'question_type': 'multiple_choice',
                'explanation': 'LoRA freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, typically focusing on the attention weights.',
                'points': 3,
                'order': 3,
                'options': [
                    {'option_text': 'By training only the bias terms in the model', 'is_correct': False},
                    {'option_text': 'By freezing pre-trained weights and adding trainable low-rank update matrices', 'is_correct': True},
                    {'option_text': 'By reducing the vocabulary size of the model', 'is_correct': False},
                    {'option_text': 'By removing layers from the original model', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the rank in LoRA referring to?',
                'question_type': 'multiple_choice',
                'explanation': 'In LoRA, "rank" refers to the dimension of the low-rank matrices used for updates. Lower rank means fewer parameters but potentially less expressive power.',
                'points': 2,
                'order': 4,
                'options': [
                    {'option_text': 'The position of the model in a leaderboard', 'is_correct': False},
                    {'option_text': 'The dimension of the low-rank matrices used for updates', 'is_correct': True},
                    {'option_text': 'The number of layers in the model', 'is_correct': False},
                    {'option_text': 'The batch size used during training', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a key hyperparameter in LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The rank (r) is a critical hyperparameter in LoRA that determines the size of the low-rank matrices and thus the number of trainable parameters and the capacity of the adaptation.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': 'The number of training epochs', 'is_correct': False},
                    {'option_text': 'The batch size', 'is_correct': False},
                    {'option_text': 'The rank (r) of the update matrices', 'is_correct': True},
                    {'option_text': 'The number of attention heads', 'is_correct': False}
                ]
            }
        ]
    },
    {
        'module': 'qlora',
        'topic': 'basics',
        'title': 'QLoRA Basics',
        'description': 'Test your knowledge of Quantized Low-Rank Adaptation (QLoRA) for memory-efficient fine-tuning of large language models.',
        'passing_score': 70,
        'questions': [
            {
                'question_text': 'What is QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA (Quantized Low-Rank Adaptation) combines quantization with LoRA to enable fine-tuning of large language models with even less memory by using 4-bit quantization for the frozen pre-trained weights.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'A technique that combines quantization with LoRA', 'is_correct': True},
                    {'option_text': 'A new architecture for language models', 'is_correct': False},
                    {'option_text': 'A dataset for fine-tuning language models', 'is_correct': False},
                    {'option_text': 'A method for training models from scratch', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the main advantage of QLoRA over standard LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'QLoRA further reduces memory usage compared to standard LoRA by quantizing the frozen pre-trained weights to 4-bit precision, allowing fine-tuning of much larger models on consumer hardware.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'It always produces better results', 'is_correct': False},
                    {'option_text': 'It further reduces memory usage through quantization', 'is_correct': True},
                    {'option_text': 'It trains faster than standard LoRA', 'is_correct': False},
                    {'option_text': 'It requires less training data', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What type of quantization is typically used in QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': '4-bit NormalFloat (NF4) quantization is typically used in QLoRA, as it was specifically designed to better represent the weight distributions found in language models.',
                'points': 3,
                'order': 3,
                'options': [
                    {'option_text': '8-bit integer quantization', 'is_correct': False},
                    {'option_text': '4-bit NormalFloat (NF4) quantization', 'is_correct': True},
                    {'option_text': '2-bit binary quantization', 'is_correct': False},
                    {'option_text': '16-bit floating point quantization', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is double quantization in the context of QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Double quantization in QLoRA refers to quantizing the quantization constants themselves, which further reduces memory usage by storing the quantization constants in a lower precision format.',
                'points': 2,
                'order': 4,
                'options': [
                    {'option_text': 'Applying quantization twice to the same weights', 'is_correct': False},
                    {'option_text': 'Quantizing both the model weights and activations', 'is_correct': False},
                    {'option_text': 'Quantizing the quantization constants themselves', 'is_correct': True},
                    {'option_text': 'Using two different quantization methods simultaneously', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a key component of QLoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'Paged optimizers are a key component of QLoRA that enable efficient training by moving optimizer states to CPU when not in use, reducing GPU memory requirements.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': 'Paged optimizers for memory efficiency', 'is_correct': True},
                    {'option_text': 'Specialized GPUs designed for quantization', 'is_correct': False},
                    {'option_text': 'Custom tokenizers for quantized models', 'is_correct': False},
                    {'option_text': 'Distributed training across multiple machines', 'is_correct': False}
                ]
            }
        ]
    },
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
