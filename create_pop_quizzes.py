"""
Script to create pop quizzes for various topics.
"""
from app import app, db
from models import PopQuiz, PopQuizQuestion
import json

def create_pop_quizzes():
    """Create pop quizzes for various topics."""
    with app.app_context():
        # Check if pop quizzes already exist
        existing_quizzes = PopQuiz.query.all()
        if existing_quizzes:
            print(f"Found {len(existing_quizzes)} existing pop quizzes.")
            return
        
        # Create pop quizzes
        pop_quizzes = [
            # LoRA Implementation Pop Quiz
            {
                'module': 'lora',
                'topic': 'implementation',
                'title': 'Quick Check: LoRA Implementation',
                'description': 'Test your understanding of LoRA implementation concepts.',
                'questions': [
                    {
                        'question_text': 'What does the rank parameter (r) in LoRA control?',
                        'question_type': 'multiple_choice',
                        'explanation': 'The rank parameter (r) in LoRA controls the dimensionality of the low-rank matrices used for adaptation. A higher rank allows for more expressive power but requires more parameters.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'The dimensionality of the low-rank matrices', 'is_correct': True},
                            {'id': 2, 'text': 'The learning rate for training', 'is_correct': False},
                            {'id': 3, 'text': 'The batch size for training', 'is_correct': False},
                            {'id': 4, 'text': 'The number of training epochs', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'Which of the following is NOT a benefit of LoRA?',
                        'question_type': 'multiple_choice',
                        'explanation': 'LoRA does not increase model inference speed compared to the original model. In fact, it might slightly slow down inference if the adapter weights are not merged with the base model.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Reduced memory usage during training', 'is_correct': False},
                            {'id': 2, 'text': 'Faster training time', 'is_correct': False},
                            {'id': 3, 'text': 'Increased inference speed', 'is_correct': True},
                            {'id': 4, 'text': 'Smaller storage size for fine-tuned models', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'In LoRA, which parts of the model are typically frozen during training?',
                        'question_type': 'multiple_choice',
                        'explanation': 'In LoRA, the pre-trained weights of the model are frozen, and only the low-rank adaptation matrices are trained. This significantly reduces the number of trainable parameters.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Only the embedding layer', 'is_correct': False},
                            {'id': 2, 'text': 'Only the output layer', 'is_correct': False},
                            {'id': 3, 'text': 'The pre-trained weights of the model', 'is_correct': True},
                            {'id': 4, 'text': 'The normalization layers', 'is_correct': False}
                        ])
                    }
                ]
            },
            
            # QLoRA Deep Dive Pop Quiz
            {
                'module': 'qlora',
                'topic': 'deep-dive',
                'title': 'Quick Check: QLoRA Concepts',
                'description': 'Test your understanding of QLoRA concepts.',
                'questions': [
                    {
                        'question_text': 'What is the main difference between LoRA and QLoRA?',
                        'question_type': 'multiple_choice',
                        'explanation': 'QLoRA combines LoRA with 4-bit quantization of the base model weights, which further reduces memory usage compared to standard LoRA.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'QLoRA uses 4-bit quantization of the base model weights', 'is_correct': True},
                            {'id': 2, 'text': 'QLoRA uses a higher rank for adaptation', 'is_correct': False},
                            {'id': 3, 'text': 'QLoRA trains more layers of the model', 'is_correct': False},
                            {'id': 4, 'text': 'QLoRA requires more training data', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'QLoRA uses NormalFloat (NF4) quantization. What is true about NF4?',
                        'question_type': 'multiple_choice',
                        'explanation': 'NF4 (NormalFloat 4-bit) is a 4-bit data type optimized for normally distributed weights, which is common in LLMs. It allocates more quantization bins to values near zero.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'It uses 4 bits per parameter', 'is_correct': True},
                            {'id': 2, 'text': 'It requires 4 GPUs to work properly', 'is_correct': False},
                            {'id': 3, 'text': 'It trains 4 times faster than standard quantization', 'is_correct': False},
                            {'id': 4, 'text': 'It reduces model accuracy by 4%', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'Double quantization in QLoRA refers to:',
                        'question_type': 'multiple_choice',
                        'explanation': 'Double quantization in QLoRA refers to quantizing the quantization constants themselves, which further reduces memory usage with minimal impact on model quality.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Quantizing the model twice in succession', 'is_correct': False},
                            {'id': 2, 'text': 'Quantizing both the model and the dataset', 'is_correct': False},
                            {'id': 3, 'text': 'Quantizing the quantization constants themselves', 'is_correct': True},
                            {'id': 4, 'text': 'Using two different quantization methods simultaneously', 'is_correct': False}
                        ])
                    }
                ]
            },
            
            # Pipeline Inference Pop Quiz
            {
                'module': 'inference',
                'topic': 'pipeline',
                'title': 'Quick Check: Pipeline Inference',
                'description': 'Test your understanding of pipeline inference with Hugging Face Transformers.',
                'questions': [
                    {
                        'question_text': 'What is the main advantage of using the pipeline() function in Hugging Face Transformers?',
                        'question_type': 'multiple_choice',
                        'explanation': 'The pipeline() function abstracts away the preprocessing and postprocessing steps, making it easy to use pre-trained models for inference with just a few lines of code.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'It abstracts away preprocessing and postprocessing steps', 'is_correct': True},
                            {'id': 2, 'text': 'It trains models faster', 'is_correct': False},
                            {'id': 3, 'text': 'It reduces model size', 'is_correct': False},
                            {'id': 4, 'text': 'It improves model accuracy', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'When using pipeline() with a fine-tuned model, which parameter specifies the model to use?',
                        'question_type': 'multiple_choice',
                        'explanation': 'The "model" parameter in the pipeline() function specifies which model to use. This can be a model ID from the Hugging Face Hub or a local path to a saved model.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'model', 'is_correct': True},
                            {'id': 2, 'text': 'model_name', 'is_correct': False},
                            {'id': 3, 'text': 'pretrained_model', 'is_correct': False},
                            {'id': 4, 'text': 'checkpoint', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'Is it possible to use pipeline() with a PEFT (LoRA) fine-tuned model?',
                        'question_type': 'true_false',
                        'explanation': 'Yes, you can use pipeline() with PEFT models like LoRA. You need to load the base model, apply the PEFT adapter, and then pass the resulting model to the pipeline() function.',
                        'correct_answer': True
                    }
                ]
            },
            
            # GPT Architecture Pop Quiz
            {
                'module': 'gpt',
                'topic': 'architecture',
                'title': 'Quick Check: GPT Architecture',
                'description': 'Test your understanding of GPT architecture concepts.',
                'questions': [
                    {
                        'question_text': 'What type of attention mechanism is used in GPT models?',
                        'question_type': 'multiple_choice',
                        'explanation': 'GPT models use causal (or autoregressive) attention, which means each token can only attend to itself and previous tokens, not future tokens. This enables the model to generate text one token at a time.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Causal (autoregressive) attention', 'is_correct': True},
                            {'id': 2, 'text': 'Bidirectional attention', 'is_correct': False},
                            {'id': 3, 'text': 'Cross-attention', 'is_correct': False},
                            {'id': 4, 'text': 'Local attention', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'What is the main architectural difference between GPT and BERT?',
                        'question_type': 'multiple_choice',
                        'explanation': 'The main architectural difference is that GPT uses causal attention (can only see previous tokens) while BERT uses bidirectional attention (can see both previous and future tokens). This makes GPT suitable for text generation and BERT for understanding tasks.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'GPT uses causal attention while BERT uses bidirectional attention', 'is_correct': True},
                            {'id': 2, 'text': 'GPT uses RNNs while BERT uses Transformers', 'is_correct': False},
                            {'id': 3, 'text': 'GPT has more parameters than BERT', 'is_correct': False},
                            {'id': 4, 'text': 'GPT uses word embeddings while BERT uses character embeddings', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'In GPT models, does increasing the context length (maximum sequence length) always improve performance?',
                        'question_type': 'true_false',
                        'explanation': 'False. While increasing context length allows the model to consider more tokens, it doesn\'t always improve performance. Longer contexts can lead to attention dilution, increased computational costs, and may not be beneficial for all tasks. Models also need to be trained or fine-tuned on longer sequences to effectively use extended context.',
                        'correct_answer': False
                    }
                ]
            },
            
            # Memory Efficiency Pop Quiz
            {
                'module': 'memory',
                'topic': 'efficiency',
                'title': 'Quick Check: Memory Efficiency',
                'description': 'Test your understanding of memory efficiency techniques in LLM fine-tuning.',
                'questions': [
                    {
                        'question_text': 'What does gradient checkpointing do to improve memory efficiency?',
                        'question_type': 'multiple_choice',
                        'explanation': 'Gradient checkpointing trades computation for memory by discarding intermediate activations during the forward pass and recomputing them during the backward pass when needed for gradient calculation.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Trades computation for memory by recomputing activations', 'is_correct': True},
                            {'id': 2, 'text': 'Reduces model parameters by pruning', 'is_correct': False},
                            {'id': 3, 'text': 'Compresses gradients using quantization', 'is_correct': False},
                            {'id': 4, 'text': 'Splits the model across multiple GPUs', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'Which of the following techniques reduces the precision of model weights to save memory?',
                        'question_type': 'multiple_choice',
                        'explanation': 'Mixed precision training uses lower precision (e.g., FP16 or BF16) for most operations while keeping a master copy of weights in FP32, reducing memory usage and often speeding up training on modern GPUs.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Mixed precision training', 'is_correct': True},
                            {'id': 2, 'text': 'Gradient accumulation', 'is_correct': False},
                            {'id': 3, 'text': 'Gradient checkpointing', 'is_correct': False},
                            {'id': 4, 'text': 'Model parallelism', 'is_correct': False}
                        ])
                    },
                    {
                        'question_text': 'DeepSpeed ZeRO (Zero Redundancy Optimizer) can help train larger models by:',
                        'question_type': 'multiple_choice',
                        'explanation': 'DeepSpeed ZeRO partitions optimizer states, gradients, and model parameters across GPUs, eliminating memory redundancy in data-parallel training and enabling training of much larger models than would otherwise be possible.',
                        'options': json.dumps([
                            {'id': 1, 'text': 'Partitioning optimizer states, gradients, and model parameters', 'is_correct': True},
                            {'id': 2, 'text': 'Reducing the model size through pruning', 'is_correct': False},
                            {'id': 3, 'text': 'Training only on zero-shot examples', 'is_correct': False},
                            {'id': 4, 'text': 'Optimizing zero-gradient parameters only', 'is_correct': False}
                        ])
                    }
                ]
            }
        ]
        
        # Add pop quizzes to the database
        for quiz_data in pop_quizzes:
            quiz = PopQuiz(
                module=quiz_data['module'],
                topic=quiz_data['topic'],
                title=quiz_data['title'],
                description=quiz_data['description']
            )
            db.session.add(quiz)
            db.session.flush()  # Get the quiz ID
            
            # Add questions
            for i, question_data in enumerate(quiz_data['questions']):
                question = PopQuizQuestion(
                    pop_quiz_id=quiz.id,
                    question_text=question_data['question_text'],
                    question_type=question_data['question_type'],
                    explanation=question_data['explanation'],
                    order=i + 1
                )
                
                if question_data['question_type'] == 'multiple_choice':
                    question.options = question_data['options']
                elif question_data['question_type'] == 'true_false':
                    question.correct_answer = question_data['correct_answer']
                
                db.session.add(question)
        
        db.session.commit()
        print(f"Created {len(pop_quizzes)} pop quizzes with a total of {sum(len(q['questions']) for q in pop_quizzes)} questions.")

if __name__ == '__main__':
    create_pop_quizzes()
