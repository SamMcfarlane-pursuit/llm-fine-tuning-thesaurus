"""
Example script for generating thesaurus entries with the AI Thesaurus LLM package
"""

import argparse
import json
from ai_thesaurus_llm.models.model_loader import load_finetuned_model
from ai_thesaurus_llm.inference.text_generation import generate_thesaurus_entries

def main(args):
    print(f"Loading fine-tuned model from {args.model_path}...")
    
    # Load fine-tuned model
    model, tokenizer = load_finetuned_model(
        adapter_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    print(f"Generating thesaurus entry for '{args.term}'...")
    
    # Generate thesaurus entries
    result = generate_thesaurus_entries(
        model=model,
        tokenizer=tokenizer,
        term=args.term,
        inference_config_name=args.inference_config
    )
    
    # Print result
    print("\nGenerated Thesaurus Entry:")
    print(f"Term: {result['term']}")
    print(f"Synonyms: {', '.join(result['synonyms'])}")
    print(f"Antonyms: {', '.join(result['antonyms'])}")
    print(f"Related Terms: {', '.join(result['related_terms'])}")
    print(f"Definition: {result['definition']}")
    print("Usage Examples:")
    for example in result['examples']:
        print(f"- {example}")
    
    # Save result to file if output_file is provided
    if args.output_file:
        with open(args.output_file, "w") as f:
            json.dump(result, f, indent=2)
        print(f"\nResult saved to {args.output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate thesaurus entries")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--term", type=str, required=True, help="Term to generate thesaurus entry for")
    parser.add_argument("--inference_config", type=str, default="default", help="Name of the inference config from INFERENCE_CONFIGS")
    parser.add_argument("--output_file", type=str, default=None, help="Path to save the result")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    main(args)
