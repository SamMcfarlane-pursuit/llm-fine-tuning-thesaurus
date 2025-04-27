"""
Script to create all quizzes for the LLM fine-tuning application.
"""
from create_memory_efficiency_quiz import create_memory_efficiency_quiz
from create_qlora_quiz import create_qlora_quiz
from create_llm_finetuning_quiz import create_llm_finetuning_quiz

def create_all_quizzes():
    """Create all quizzes for the application."""
    print("Creating Memory Efficiency Quiz...")
    create_memory_efficiency_quiz()
    
    print("Creating QLoRA Quiz...")
    create_qlora_quiz()
    
    print("Creating LLM Fine-Tuning Fundamentals Quiz...")
    create_llm_finetuning_quiz()
    
    print("All quizzes created successfully!")

if __name__ == '__main__':
    create_all_quizzes()
