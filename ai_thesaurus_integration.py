"""
Integration script to connect the AI Thesaurus LLM folder with the existing ThesaurusLLM class
"""

import os
import argparse
from thesaurus_utils import ThesaurusLLM as ExistingThesaurusLLM
from ai_thesaurus_llm.integration import ThesaurusLLM as NewThesaurusLLM

def integrate_thesaurus_llm(model_path, base_model_name=None, use_auth_token=None):
    """
    Integrate the new AI Thesaurus LLM with the existing ThesaurusLLM class
    
    Args:
        model_path (str): Path to the fine-tuned model
        base_model_name (str, optional): Name of the base model from BASE_MODELS config
        use_auth_token (str, optional): Hugging Face token for gated models
    
    Returns:
        ExistingThesaurusLLM: An instance of the existing ThesaurusLLM class with the new model
    """
    # Initialize the new ThesaurusLLM
    new_thesaurus_llm = NewThesaurusLLM(model_path=model_path, base_model_name=base_model_name, use_auth_token=use_auth_token)
    
    # Get the model and tokenizer from the new ThesaurusLLM
    model = new_thesaurus_llm.model
    tokenizer = new_thesaurus_llm.tokenizer
    
    # Initialize the existing ThesaurusLLM with the new model and tokenizer
    existing_thesaurus_llm = ExistingThesaurusLLM(model=model, tokenizer=tokenizer)
    
    return existing_thesaurus_llm

def main(args):
    print(f"Integrating AI Thesaurus LLM with the existing ThesaurusLLM class...")
    
    # Integrate the new ThesaurusLLM with the existing one
    thesaurus_llm = integrate_thesaurus_llm(
        model_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    # Test the integrated ThesaurusLLM
    if args.test:
        print(f"\nTesting the integrated ThesaurusLLM with term: '{args.test_term}'")
        
        # Get synonyms
        print("\nSynonyms:")
        synonyms = thesaurus_llm.get_synonyms(args.test_term)
        for synonym in synonyms:
            print(f"- {synonym}")
        
        # Get antonyms
        print("\nAntonyms:")
        antonyms = thesaurus_llm.get_antonyms(args.test_term)
        for antonym in antonyms:
            print(f"- {antonym}")
        
        # Get related terms
        print("\nRelated Terms:")
        related_terms = thesaurus_llm.get_related_terms(args.test_term)
        for term in related_terms:
            print(f"- {term}")
        
        # Answer a question
        print("\nQuestion: What is the definition of " + args.test_term + "?")
        answer = thesaurus_llm.answer_question(f"What is the definition of {args.test_term}?")
        print(f"Answer: {answer}")
    
    print("\nIntegration complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrate the AI Thesaurus LLM with the existing ThesaurusLLM class")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    parser.add_argument("--test", action="store_true", help="Test the integrated ThesaurusLLM")
    parser.add_argument("--test_term", type=str, default="fine-tuning", help="Term to test the integrated ThesaurusLLM with")
    
    args = parser.parse_args()
    main(args)
