"""
Script to add comprehensive quiz content for different LLM fine-tuning topics.
"""
import sys
import os
from datetime import datetime, timezone
from flask import Flask
from models import db, Quiz, QuizQuestion, QuizOption

# Create a minimal Flask app to work with the database
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/thesaurus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

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
            },
            {
                'question_text': 'How can you use a pipeline for batch inference on multiple inputs?',
                'question_type': 'multiple_choice',
                'explanation': 'You can pass a list of inputs to the pipeline to perform batch inference on multiple inputs at once.',
                'points': 3,
                'order': 6,
                'options': [
                    {'option_text': 'Create multiple pipeline instances, one for each input', 'is_correct': False},
                    {'option_text': 'Pass a list of inputs to the pipeline', 'is_correct': True},
                    {'option_text': 'Use the batch_size parameter with a single input', 'is_correct': False},
                    {'option_text': 'Pipelines do not support batch inference', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the correct way to use a pipeline for sentiment analysis?',
                'question_type': 'multiple_choice',
                'explanation': 'For sentiment analysis, you can use either "sentiment-analysis" or "text-classification" as the task name.',
                'points': 2,
                'order': 7,
                'options': [
                    {'option_text': 'pipeline("sentiment")', 'is_correct': False},
                    {'option_text': 'pipeline("sentiment-analysis")', 'is_correct': True},
                    {'option_text': 'pipeline("analyze-sentiment")', 'is_correct': False},
                    {'option_text': 'pipeline("emotion")', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is TRUE about using a pipeline with a GPU?',
                'question_type': 'multiple_choice',
                'explanation': 'You can specify the device to use (e.g., GPU) by setting the "device" parameter to the appropriate device ID.',
                'points': 3,
                'order': 8,
                'options': [
                    {'option_text': 'Pipelines always use CPU by default and cannot use GPU', 'is_correct': False},
                    {'option_text': 'You need to manually move the model to GPU after creating the pipeline', 'is_correct': False},
                    {'option_text': 'You can specify the device by setting device=0 for the first GPU', 'is_correct': True},
                    {'option_text': 'GPU usage is automatically determined based on available hardware', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the return type when using a text-classification pipeline?',
                'question_type': 'multiple_choice',
                'explanation': 'A text-classification pipeline returns a list of dictionaries, each containing "label" and "score" keys representing the predicted class and confidence score.',
                'points': 2,
                'order': 9,
                'options': [
                    {'option_text': 'A single string with the predicted class', 'is_correct': False},
                    {'option_text': 'A list of dictionaries with "label" and "score" keys', 'is_correct': True},
                    {'option_text': 'A numpy array of probabilities for each class', 'is_correct': False},
                    {'option_text': 'A boolean indicating positive or negative sentiment', 'is_correct': False}
                ]
            },
            {
                'question_text': 'How can you control the randomness in text generation pipelines?',
                'question_type': 'multiple_choice',
                'explanation': 'You can control randomness in text generation by setting parameters like "temperature", "top_k", "top_p", and "do_sample" when calling the pipeline.',
                'points': 3,
                'order': 10,
                'options': [
                    {'option_text': 'By setting a random seed in the pipeline constructor', 'is_correct': False},
                    {'option_text': 'By using parameters like temperature, top_k, and top_p when calling the pipeline', 'is_correct': True},
                    {'option_text': 'Randomness cannot be controlled in pipelines', 'is_correct': False},
                    {'option_text': 'By specifying the random_state parameter', 'is_correct': False}
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
            },
            {
                'question_text': 'What is the purpose of tokenization in preparing data for LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Tokenization converts text into tokens (subwords, words, or characters) that the model can process, which is a necessary preprocessing step for LLM training.',
                'points': 2,
                'order': 6,
                'options': [
                    {'option_text': 'To encrypt sensitive information in the dataset', 'is_correct': False},
                    {'option_text': 'To convert text into numerical tokens that the model can process', 'is_correct': True},
                    {'option_text': 'To reduce the vocabulary size by removing rare words', 'is_correct': False},
                    {'option_text': 'To translate text into multiple languages', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of special tokens like [CLS], [SEP], and [MASK] in transformer models?',
                'question_type': 'multiple_choice',
                'explanation': 'Special tokens like [CLS], [SEP], and [MASK] serve specific functions in transformer models: [CLS] is used for classification tasks, [SEP] separates different segments of text, and [MASK] is used for masked language modeling.',
                'points': 3,
                'order': 7,
                'options': [
                    {'option_text': 'They are placeholders that get removed during preprocessing', 'is_correct': False},
                    {'option_text': 'They serve specific functions like classification, separation, and masking', 'is_correct': True},
                    {'option_text': 'They are only used for visualization purposes', 'is_correct': False},
                    {'option_text': 'They are used to increase the vocabulary size', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of truncation and padding in data preparation for LLMs?',
                'question_type': 'multiple_choice',
                'explanation': 'Truncation and padding ensure that all input sequences have the same length, which is necessary for batch processing in neural networks.',
                'points': 2,
                'order': 8,
                'options': [
                    {'option_text': 'To ensure all input sequences have the same length for batch processing', 'is_correct': True},
                    {'option_text': 'To increase the diversity of the training data', 'is_correct': False},
                    {'option_text': 'To reduce the model\'s memory usage during inference', 'is_correct': False},
                    {'option_text': 'To improve the model\'s accuracy on specific tasks', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is TRUE about data balancing for LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Data balancing ensures that the model is exposed to a diverse range of examples and doesn\'t become biased towards overrepresented classes or patterns.',
                'points': 3,
                'order': 9,
                'options': [
                    {'option_text': 'Data balancing is only important for classification tasks', 'is_correct': False},
                    {'option_text': 'Imbalanced datasets don\'t affect LLM performance', 'is_correct': False},
                    {'option_text': 'Data balancing ensures the model isn\'t biased towards overrepresented patterns', 'is_correct': True},
                    {'option_text': 'Data balancing means using the same number of examples for all tasks', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of creating validation and test splits in LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Validation and test splits allow you to evaluate the model\'s performance on unseen data, which helps detect overfitting and assess generalization.',
                'points': 2,
                'order': 10,
                'options': [
                    {'option_text': 'To reduce the amount of data needed for training', 'is_correct': False},
                    {'option_text': 'To evaluate the model\'s performance on unseen data', 'is_correct': True},
                    {'option_text': 'To make the training process faster', 'is_correct': False},
                    {'option_text': 'To increase the model\'s parameter count', 'is_correct': False}
                ]
            }
        ]
    },
    {
        'module': 'evaluation',
        'topic': 'metrics',
        'title': 'LLM Evaluation Metrics and Techniques',
        'description': 'Test your knowledge of evaluation metrics and techniques for assessing the performance of fine-tuned language models.',
        'passing_score': 70,
        'questions': [
            {
                'question_text': 'Which of the following is NOT a common evaluation metric for language models?',
                'question_type': 'multiple_choice',
                'explanation': 'While BLEU, ROUGE, and perplexity are common evaluation metrics for language models, Mean Squared Error (MSE) is typically used for regression tasks rather than language modeling.',
                'points': 2,
                'order': 1,
                'options': [
                    {'option_text': 'BLEU (Bilingual Evaluation Understudy)', 'is_correct': False},
                    {'option_text': 'ROUGE (Recall-Oriented Understudy for Gisting Evaluation)', 'is_correct': False},
                    {'option_text': 'Perplexity', 'is_correct': False},
                    {'option_text': 'Mean Squared Error (MSE)', 'is_correct': True}
                ]
            },
            {
                'question_text': 'What does perplexity measure in language models?',
                'question_type': 'multiple_choice',
                'explanation': 'Perplexity measures how well a probability model predicts a sample. Lower perplexity indicates that the model is better at predicting the text.',
                'points': 2,
                'order': 2,
                'options': [
                    {'option_text': 'The model\'s ability to generate diverse responses', 'is_correct': False},
                    {'option_text': 'How well the model predicts the next token (lower is better)', 'is_correct': True},
                    {'option_text': 'The model\'s training speed', 'is_correct': False},
                    {'option_text': 'The complexity of the model architecture', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the primary purpose of human evaluation in LLM assessment?',
                'question_type': 'multiple_choice',
                'explanation': 'Human evaluation provides subjective assessment of aspects like coherence, relevance, and helpfulness that automated metrics may not capture well.',
                'points': 3,
                'order': 3,
                'options': [
                    {'option_text': 'To replace automated metrics entirely', 'is_correct': False},
                    {'option_text': 'To assess subjective aspects like coherence and helpfulness', 'is_correct': True},
                    {'option_text': 'To speed up the evaluation process', 'is_correct': False},
                    {'option_text': 'To reduce the cost of model evaluation', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is TRUE about ROUGE scores?',
                'question_type': 'multiple_choice',
                'explanation': 'ROUGE (Recall-Oriented Understudy for Gisting Evaluation) measures the overlap of n-grams between the generated text and reference text, with higher scores indicating better performance.',
                'points': 2,
                'order': 4,
                'options': [
                    {'option_text': 'ROUGE scores measure the grammatical correctness of generated text', 'is_correct': False},
                    {'option_text': 'Lower ROUGE scores indicate better performance', 'is_correct': False},
                    {'option_text': 'ROUGE measures n-gram overlap between generated and reference text', 'is_correct': True},
                    {'option_text': 'ROUGE is only applicable to code generation tasks', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of A/B testing in LLM evaluation?',
                'question_type': 'multiple_choice',
                'explanation': 'A/B testing compares two versions of a model to determine which performs better in real-world scenarios with actual users.',
                'points': 2,
                'order': 5,
                'options': [
                    {'option_text': 'To test the model on datasets A and B', 'is_correct': False},
                    {'option_text': 'To compare two versions of a model in real-world scenarios', 'is_correct': True},
                    {'option_text': 'To evaluate the model\'s performance on tasks A and B', 'is_correct': False},
                    {'option_text': 'To test the model with users in groups A and B', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the main limitation of using BLEU scores for evaluating conversational AI?',
                'question_type': 'multiple_choice',
                'explanation': 'BLEU scores primarily measure n-gram overlap with reference texts, but in conversational AI, multiple valid responses may exist that don\'t share n-grams with the reference.',
                'points': 3,
                'order': 6,
                'options': [
                    {'option_text': 'BLEU scores are too computationally expensive', 'is_correct': False},
                    {'option_text': 'BLEU doesn\'t account for multiple valid responses that differ from the reference', 'is_correct': True},
                    {'option_text': 'BLEU scores are not standardized across different implementations', 'is_correct': False},
                    {'option_text': 'BLEU can only be used for machine translation tasks', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of the HELM benchmark in LLM evaluation?',
                'question_type': 'multiple_choice',
                'explanation': 'HELM (Holistic Evaluation of Language Models) provides a standardized framework for evaluating language models across multiple dimensions including accuracy, robustness, fairness, and more.',
                'points': 3,
                'order': 7,
                'options': [
                    {'option_text': 'To evaluate only the speed and efficiency of language models', 'is_correct': False},
                    {'option_text': 'To provide a holistic evaluation across multiple dimensions', 'is_correct': True},
                    {'option_text': 'To test language models specifically for medical applications', 'is_correct': False},
                    {'option_text': 'To benchmark hardware performance for LLM training', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is a valid approach to evaluating factual accuracy in LLMs?',
                'question_type': 'multiple_choice',
                'explanation': 'Comparing model outputs against a knowledge base of verified facts is a valid approach to evaluating factual accuracy in language models.',
                'points': 2,
                'order': 8,
                'options': [
                    {'option_text': 'Using perplexity as the primary metric', 'is_correct': False},
                    {'option_text': 'Comparing outputs against a knowledge base of verified facts', 'is_correct': True},
                    {'option_text': 'Measuring the diversity of generated responses', 'is_correct': False},
                    {'option_text': 'Evaluating only the grammatical correctness of outputs', 'is_correct': False}
                ]
            },
            {
                'question_text': 'What is the purpose of adversarial testing in LLM evaluation?',
                'question_type': 'multiple_choice',
                'explanation': 'Adversarial testing involves deliberately challenging the model with difficult or edge cases to identify weaknesses and potential failure modes.',
                'points': 3,
                'order': 9,
                'options': [
                    {'option_text': 'To make the evaluation process faster', 'is_correct': False},
                    {'option_text': 'To identify weaknesses and potential failure modes', 'is_correct': True},
                    {'option_text': 'To reduce the cost of model evaluation', 'is_correct': False},
                    {'option_text': 'To replace human evaluation entirely', 'is_correct': False}
                ]
            },
            {
                'question_text': 'Which of the following is TRUE about using another LLM as an evaluator?',
                'question_type': 'multiple_choice',
                'explanation': 'Using another LLM as an evaluator can provide scalable assessment but may inherit biases from the evaluator model, making it important to validate with human judgments.',
                'points': 2,
                'order': 10,
                'options': [
                    {'option_text': 'It always provides more accurate evaluation than human judges', 'is_correct': False},
                    {'option_text': 'It can provide scalable assessment but may inherit biases from the evaluator model', 'is_correct': True},
                    {'option_text': 'It should completely replace other evaluation methods', 'is_correct': False},
                    {'option_text': 'It only works for evaluating code generation capabilities', 'is_correct': False}
                ]
            }
        ]
    }
]

def add_quizzes():
    """Add comprehensive quizzes to the database."""
    with app.app_context():
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

if __name__ == '__main__':
    add_quizzes()
    print("Comprehensive quizzes added successfully!")
