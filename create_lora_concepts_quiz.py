#!/usr/bin/env python3
"""
Create comprehensive LoRA concepts quiz with factual content and feedback.
This script creates a detailed quiz about LoRA fine-tuning concepts.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Quiz, QuizQuestion, QuizOption
from datetime import datetime

def create_lora_concepts_quiz():
    """Create a comprehensive LoRA concepts quiz."""
    
    with app.app_context():
        # Check if quiz already exists
        existing_quiz = Quiz.query.filter_by(title="LoRA Concepts Mastery").first()
        if existing_quiz:
            print("LoRA Concepts quiz already exists. Updating...")
            # Delete existing questions and options
            for question in existing_quiz.questions:
                for option in question.options:
                    db.session.delete(option)
                db.session.delete(question)
            quiz = existing_quiz
        else:
            # Create new quiz
            quiz = Quiz(
                title="LoRA Concepts Mastery",
                description="Test your understanding of Low-Rank Adaptation (LoRA) concepts, parameters, and applications in LLM fine-tuning.",
                topic="LoRA",
                difficulty="intermediate",
                estimated_time=15,
                created_at=datetime.now()
            )
            db.session.add(quiz)
            db.session.flush()

        # Question 1: Basic LoRA Concept
        q1 = QuizQuestion(
            quiz_id=quiz.id,
            text="What does LoRA stand for in the context of LLM fine-tuning?",
            explanation="LoRA stands for Low-Rank Adaptation, a parameter-efficient fine-tuning technique that reduces the number of trainable parameters by using low-rank matrix decomposition."
        )
        db.session.add(q1)
        db.session.flush()

        # Options for Q1
        options_q1 = [
            QuizOption(question_id=q1.id, text="Low-Rank Adaptation", is_correct=True),
            QuizOption(question_id=q1.id, text="Linear Regression Analysis", is_correct=False),
            QuizOption(question_id=q1.id, text="Long-Range Attention", is_correct=False),
            QuizOption(question_id=q1.id, text="Latent Representation Architecture", is_correct=False)
        ]
        for option in options_q1:
            db.session.add(option)

        # Question 2: LoRA Parameters
        q2 = QuizQuestion(
            quiz_id=quiz.id,
            text="What is the typical range for the rank parameter (r) in LoRA?",
            explanation="The rank parameter (r) in LoRA typically ranges from 1 to 64, with common values being 4, 8, 16, or 32. Lower ranks mean fewer parameters but potentially less expressiveness."
        )
        db.session.add(q2)
        db.session.flush()

        options_q2 = [
            QuizOption(question_id=q2.id, text="1-64", is_correct=True),
            QuizOption(question_id=q2.id, text="100-1000", is_correct=False),
            QuizOption(question_id=q2.id, text="0.1-1.0", is_correct=False),
            QuizOption(question_id=q2.id, text="1000-10000", is_correct=False)
        ]
        for option in options_q2:
            db.session.add(option)

        # Question 3: LoRA Alpha Parameter
        q3 = QuizQuestion(
            quiz_id=quiz.id,
            text="What is the purpose of the alpha parameter in LoRA?",
            explanation="The alpha parameter in LoRA is a scaling factor that controls the magnitude of the LoRA adaptation. It's typically set to be equal to or twice the rank value."
        )
        db.session.add(q3)
        db.session.flush()

        options_q3 = [
            QuizOption(question_id=q3.id, text="Controls the magnitude of LoRA adaptation", is_correct=True),
            QuizOption(question_id=q3.id, text="Sets the learning rate", is_correct=False),
            QuizOption(question_id=q3.id, text="Determines the number of layers", is_correct=False),
            QuizOption(question_id=q3.id, text="Controls the dropout rate", is_correct=False)
        ]
        for option in options_q3:
            db.session.add(option)

        # Question 4: Memory Efficiency
        q4 = QuizQuestion(
            quiz_id=quiz.id,
            text="Compared to full fine-tuning, LoRA typically reduces trainable parameters by what factor?",
            explanation="LoRA can reduce trainable parameters by 1000x or more compared to full fine-tuning, making it extremely memory efficient while maintaining performance."
        )
        db.session.add(q4)
        db.session.flush()

        options_q4 = [
            QuizOption(question_id=q4.id, text="1000x or more", is_correct=True),
            QuizOption(question_id=q4.id, text="2-5x", is_correct=False),
            QuizOption(question_id=q4.id, text="10-50x", is_correct=False),
            QuizOption(question_id=q4.id, text="100-200x", is_correct=False)
        ]
        for option in options_q4:
            db.session.add(option)

        # Question 5: Target Modules
        q5 = QuizQuestion(
            quiz_id=quiz.id,
            text="Which modules are commonly targeted for LoRA adaptation in transformer models?",
            explanation="LoRA commonly targets attention modules (q_proj, k_proj, v_proj, o_proj) and sometimes feed-forward layers. These are the most impactful layers for adaptation."
        )
        db.session.add(q5)
        db.session.flush()

        options_q5 = [
            QuizOption(question_id=q5.id, text="Attention modules (q_proj, v_proj, etc.)", is_correct=True),
            QuizOption(question_id=q5.id, text="Only embedding layers", is_correct=False),
            QuizOption(question_id=q5.id, text="Only the final classification layer", is_correct=False),
            QuizOption(question_id=q5.id, text="Only normalization layers", is_correct=False)
        ]
        for option in options_q5:
            db.session.add(option)

        # Question 6: LoRA vs Full Fine-tuning
        q6 = QuizQuestion(
            quiz_id=quiz.id,
            text="What is a key advantage of LoRA over full fine-tuning?",
            explanation="LoRA's key advantages include dramatically reduced memory usage, faster training, and the ability to maintain multiple task-specific adapters that can be easily swapped."
        )
        db.session.add(q6)
        db.session.flush()

        options_q6 = [
            QuizOption(question_id=q6.id, text="Significantly reduced memory usage and training time", is_correct=True),
            QuizOption(question_id=q6.id, text="Always achieves better performance", is_correct=False),
            QuizOption(question_id=q6.id, text="Requires no hyperparameter tuning", is_correct=False),
            QuizOption(question_id=q6.id, text="Works only with small models", is_correct=False)
        ]
        for option in options_q6:
            db.session.add(option)

        # Question 7: LoRA Implementation
        q7 = QuizQuestion(
            quiz_id=quiz.id,
            text="Which library is commonly used to implement LoRA in practice?",
            explanation="PEFT (Parameter-Efficient Fine-Tuning) by Hugging Face is the most popular library for implementing LoRA, providing easy integration with transformers."
        )
        db.session.add(q7)
        db.session.flush()

        options_q7 = [
            QuizOption(question_id=q7.id, text="PEFT (Parameter-Efficient Fine-Tuning)", is_correct=True),
            QuizOption(question_id=q7.id, text="TensorFlow Extended", is_correct=False),
            QuizOption(question_id=q7.id, text="PyTorch Lightning", is_correct=False),
            QuizOption(question_id=q7.id, text="Scikit-learn", is_correct=False)
        ]
        for option in options_q7:
            db.session.add(option)

        # Question 8: LoRA Merging
        q8 = QuizQuestion(
            quiz_id=quiz.id,
            text="What happens when you merge LoRA adapters with the base model?",
            explanation="Merging LoRA adapters combines the learned low-rank matrices with the original model weights, creating a single model that incorporates the adaptations without requiring the adapter during inference."
        )
        db.session.add(q8)
        db.session.flush()

        options_q8 = [
            QuizOption(question_id=q8.id, text="Creates a single model with incorporated adaptations", is_correct=True),
            QuizOption(question_id=q8.id, text="Deletes the original model weights", is_correct=False),
            QuizOption(question_id=q8.id, text="Reduces model performance", is_correct=False),
            QuizOption(question_id=q8.id, text="Increases model size significantly", is_correct=False)
        ]
        for option in options_q8:
            db.session.add(option)

        # Question 9: LoRA Dropout
        q9 = QuizQuestion(
            quiz_id=quiz.id,
            text="What is the typical range for LoRA dropout values?",
            explanation="LoRA dropout typically ranges from 0.0 to 0.3, with 0.1 being a common default. This helps prevent overfitting in the low-rank adaptation layers."
        )
        db.session.add(q9)
        db.session.flush()

        options_q9 = [
            QuizOption(question_id=q9.id, text="0.0 to 0.3", is_correct=True),
            QuizOption(question_id=q9.id, text="0.5 to 0.9", is_correct=False),
            QuizOption(question_id=q9.id, text="1.0 to 2.0", is_correct=False),
            QuizOption(question_id=q9.id, text="0.01 to 0.05", is_correct=False)
        ]
        for option in options_q9:
            db.session.add(option)

        # Question 10: LoRA Applications
        q10 = QuizQuestion(
            quiz_id=quiz.id,
            text="LoRA is particularly useful for which type of fine-tuning scenarios?",
            explanation="LoRA excels in scenarios where you need to adapt large models to specific tasks or domains with limited computational resources, such as domain adaptation, instruction following, or task-specific customization."
        )
        db.session.add(q10)
        db.session.flush()

        options_q10 = [
            QuizOption(question_id=q10.id, text="Domain adaptation and task-specific customization", is_correct=True),
            QuizOption(question_id=q10.id, text="Only image classification tasks", is_correct=False),
            QuizOption(question_id=q10.id, text="Only pre-training from scratch", is_correct=False),
            QuizOption(question_id=q10.id, text="Only small model fine-tuning", is_correct=False)
        ]
        for option in options_q10:
            db.session.add(option)

        # Question 11: LoRA Mathematical Foundation
        q11 = QuizQuestion(
            quiz_id=quiz.id,
            text="LoRA decomposes weight updates into which mathematical form?",
            explanation="LoRA decomposes weight updates ΔW into the product of two low-rank matrices: ΔW = BA, where B is d×r and A is r×k, with r << min(d,k)."
        )
        db.session.add(q11)
        db.session.flush()

        options_q11 = [
            QuizOption(question_id=q11.id, text="Product of two low-rank matrices (ΔW = BA)", is_correct=True),
            QuizOption(question_id=q11.id, text="Sum of diagonal matrices", is_correct=False),
            QuizOption(question_id=q11.id, text="Kronecker product decomposition", is_correct=False),
            QuizOption(question_id=q11.id, text="Singular value decomposition", is_correct=False)
        ]
        for option in options_q11:
            db.session.add(option)

        # Question 12: LoRA vs Other PEFT Methods
        q12 = QuizQuestion(
            quiz_id=quiz.id,
            text="How does LoRA compare to other PEFT methods like Adapters or Prefix Tuning?",
            explanation="LoRA generally offers better parameter efficiency than Adapters and doesn't require modifying the model architecture like Prefix Tuning, while maintaining competitive performance across various tasks."
        )
        db.session.add(q12)
        db.session.flush()

        options_q12 = [
            QuizOption(question_id=q12.id, text="Better parameter efficiency without architecture changes", is_correct=True),
            QuizOption(question_id=q12.id, text="Always performs worse than other methods", is_correct=False),
            QuizOption(question_id=q12.id, text="Requires more memory than Adapters", is_correct=False),
            QuizOption(question_id=q12.id, text="Only works with specific model architectures", is_correct=False)
        ]
        for option in options_q12:
            db.session.add(option)

        # Commit all changes
        try:
            db.session.commit()
            print("✅ LoRA Concepts quiz created successfully!")
            print(f"Quiz ID: {quiz.id}")
            print(f"Total questions: {len(quiz.questions)}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating quiz: {e}")
            return False

        return True

if __name__ == "__main__":
    success = create_lora_concepts_quiz()
    if success:
        print("\n🎯 LoRA Concepts quiz is ready!")
        print("Students can now test their understanding of:")
        print("- LoRA fundamentals and mathematical foundation")
        print("- Key parameters (rank, alpha, dropout)")
        print("- Implementation details and best practices")
        print("- Comparison with other fine-tuning methods")
        print("- Practical applications and use cases")
    else:
        print("\n❌ Failed to create LoRA Concepts quiz")
        sys.exit(1)
