"""
Script to create a general quiz on LLM fine-tuning concepts.
"""
from app import app, db
from models import Quiz, QuizQuestion, QuizOption

def create_llm_finetuning_quiz():
    """Create a general quiz on LLM fine-tuning concepts."""
    with app.app_context():
        # Check if the quiz already exists
        existing_quiz = Quiz.query.filter_by(module='fine-tuning', topic='fundamentals').first()
        if existing_quiz:
            print(f"Quiz '{existing_quiz.title}' already exists.")
            return
        
        # Create the quiz
        quiz = Quiz(
            module='fine-tuning',
            topic='fundamentals',
            title='LLM Fine-Tuning Fundamentals Quiz',
            description='Test your knowledge of the fundamental concepts in fine-tuning large language models.',
            passing_score=70
        )
        db.session.add(quiz)
        db.session.flush()  # Get the quiz ID
        
        # Create questions
        questions = [
            {
                'question_text': 'What is fine-tuning in the context of large language models?',
                'question_type': 'multiple_choice',
                'explanation': 'Fine-tuning is the process of further training a pre-trained language model on a specific dataset to adapt it for particular tasks or domains, leveraging the general knowledge it has already learned.',
                'points': 1,
                'order': 1,
                'options': [
                    {'option_text': 'Training a language model from scratch on a small dataset', 'is_correct': False, 'order': 1},
                    {'option_text': 'Adjusting hyperparameters without changing model weights', 'is_correct': False, 'order': 2},
                    {'option_text': 'Further training a pre-trained model on a specific dataset', 'is_correct': True, 'order': 3},
                    {'option_text': 'Reducing the size of a model while preserving its capabilities', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the main advantage of fine-tuning compared to training from scratch?',
                'question_type': 'multiple_choice',
                'explanation': 'Fine-tuning leverages the knowledge already captured in pre-trained models, requiring significantly less data and computational resources than training from scratch while achieving better performance on specific tasks.',
                'points': 1,
                'order': 2,
                'options': [
                    {'option_text': 'Fine-tuning always produces smaller models', 'is_correct': False, 'order': 1},
                    {'option_text': 'Fine-tuning requires less data and computational resources', 'is_correct': True, 'order': 2},
                    {'option_text': 'Fine-tuning is easier to implement technically', 'is_correct': False, 'order': 3},
                    {'option_text': 'Fine-tuning always results in faster inference', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is catastrophic forgetting in the context of fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Catastrophic forgetting occurs when a model loses previously learned knowledge or capabilities after being fine-tuned on a new dataset, essentially "forgetting" its pre-trained knowledge.',
                'points': 1,
                'order': 3,
                'options': [
                    {'option_text': 'When a model completely fails to learn during fine-tuning', 'is_correct': False, 'order': 1},
                    {'option_text': 'When a model loses previously learned knowledge after fine-tuning', 'is_correct': True, 'order': 2},
                    {'option_text': 'When a model requires too much memory during training', 'is_correct': False, 'order': 3},
                    {'option_text': 'When fine-tuning takes too long to complete', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is PEFT in the context of LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'PEFT (Parameter-Efficient Fine-Tuning) refers to techniques that fine-tune only a small subset of a model\'s parameters, significantly reducing memory requirements and computational costs.',
                'points': 1,
                'order': 4,
                'options': [
                    {'option_text': 'Performance Evaluation Fine-Tuning', 'is_correct': False, 'order': 1},
                    {'option_text': 'Parameter-Efficient Fine-Tuning', 'is_correct': True, 'order': 2},
                    {'option_text': 'Pre-trained Embedding Feature Transfer', 'is_correct': False, 'order': 3},
                    {'option_text': 'Post-Embedding Fine-Tuning', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'Which of the following is NOT a common PEFT method?',
                'question_type': 'multiple_choice',
                'explanation': 'Weight averaging is not a PEFT method. Common PEFT methods include LoRA (Low-Rank Adaptation), Prefix Tuning, Prompt Tuning, and Adapter Layers.',
                'points': 1,
                'order': 5,
                'options': [
                    {'option_text': 'LoRA (Low-Rank Adaptation)', 'is_correct': False, 'order': 1},
                    {'option_text': 'Prefix Tuning', 'is_correct': False, 'order': 2},
                    {'option_text': 'Adapter Layers', 'is_correct': False, 'order': 3},
                    {'option_text': 'Weight Averaging', 'is_correct': True, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the learning rate warmup technique in fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Learning rate warmup is a technique where the learning rate starts very small and gradually increases to its target value, helping to stabilize the early phase of training and prevent divergence.',
                'points': 1,
                'order': 6,
                'options': [
                    {'option_text': 'Gradually increasing the learning rate at the start of training', 'is_correct': True, 'order': 1},
                    {'option_text': 'Preheating the GPU before training begins', 'is_correct': False, 'order': 2},
                    {'option_text': 'Using a very high learning rate initially', 'is_correct': False, 'order': 3},
                    {'option_text': 'Warming up the model weights with random noise', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is instruction fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'Instruction fine-tuning is the process of fine-tuning a language model on a dataset of instruction-response pairs to make it better at following user instructions and commands.',
                'points': 1,
                'order': 7,
                'options': [
                    {'option_text': 'Fine-tuning a model to generate step-by-step instructions', 'is_correct': False, 'order': 1},
                    {'option_text': 'Fine-tuning a model on a dataset of instruction-response pairs', 'is_correct': True, 'order': 2},
                    {'option_text': 'Providing detailed instructions to the model during inference', 'is_correct': False, 'order': 3},
                    {'option_text': 'A technique to instruct the model which parameters to update', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is the purpose of the "lora_alpha" parameter in LoRA?',
                'question_type': 'multiple_choice',
                'explanation': 'The "lora_alpha" parameter in LoRA is a scaling factor that controls the magnitude of the LoRA update. It effectively scales the contribution of the low-rank matrices to the original weights.',
                'points': 1,
                'order': 8,
                'options': [
                    {'option_text': 'It controls the learning rate for LoRA parameters', 'is_correct': False, 'order': 1},
                    {'option_text': 'It determines which layers receive LoRA adapters', 'is_correct': False, 'order': 2},
                    {'option_text': 'It scales the contribution of the low-rank matrices', 'is_correct': True, 'order': 3},
                    {'option_text': 'It sets the dropout probability for LoRA layers', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'What is RLHF in the context of LLM fine-tuning?',
                'question_type': 'multiple_choice',
                'explanation': 'RLHF (Reinforcement Learning from Human Feedback) is a technique that uses human preferences to further refine a fine-tuned language model, typically involving a reward model trained on human preferences and reinforcement learning.',
                'points': 1,
                'order': 9,
                'options': [
                    {'option_text': 'Recursive Learning with Hidden Features', 'is_correct': False, 'order': 1},
                    {'option_text': 'Reinforcement Learning from Human Feedback', 'is_correct': True, 'order': 2},
                    {'option_text': 'Rapid Language Handling Framework', 'is_correct': False, 'order': 3},
                    {'option_text': 'Reduced Latency Hyperparameter Fitting', 'is_correct': False, 'order': 4}
                ]
            },
            {
                'question_text': 'True or False: Fine-tuning always requires adjusting all parameters in a pre-trained model.',
                'question_type': 'true_false',
                'explanation': 'False. Parameter-efficient fine-tuning methods like LoRA, adapter layers, and prompt tuning allow fine-tuning by adjusting only a small subset of parameters while keeping most of the pre-trained model frozen.',
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
    create_llm_finetuning_quiz()
