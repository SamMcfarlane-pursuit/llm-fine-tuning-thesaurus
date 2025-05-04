"""
Example script for integrating the AI Thesaurus LLM with the main application
"""

import os
import argparse
import json
from ai_thesaurus_llm.integration import initialize_thesaurus_llm, get_thesaurus_llm

def main(args):
    print(f"Initializing ThesaurusLLM with model from {args.model_path}...")
    
    # Initialize ThesaurusLLM
    initialize_thesaurus_llm(
        model_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    # Get ThesaurusLLM instance
    thesaurus_llm = get_thesaurus_llm()
    
    # Generate thesaurus entry for a single term
    if args.term:
        print(f"Generating thesaurus entry for '{args.term}'...")
        
        result = thesaurus_llm.generate_entry(
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
    
    # Generate thesaurus entries for multiple terms
    elif args.input_file:
        print(f"Processing terms from {args.input_file}...")
        
        # Load terms from file
        if args.input_file.endswith('.json'):
            with open(args.input_file, 'r') as f:
                data = json.load(f)
                if isinstance(data, list):
                    terms = data
                elif isinstance(data, dict) and 'terms' in data:
                    terms = data['terms']
                else:
                    raise ValueError("Input JSON file must contain a list of terms or a dictionary with a 'terms' key")
        else:
            with open(args.input_file, 'r') as f:
                terms = [line.strip() for line in f if line.strip()]
        
        print(f"Processing {len(terms)} terms...")
        
        # Create output directory if it doesn't exist
        if args.output_dir:
            os.makedirs(args.output_dir, exist_ok=True)
        
        # Process terms
        results = thesaurus_llm.batch_generate(
            terms=terms,
            inference_config_name=args.inference_config
        )
        
        # Save results
        if args.output_dir:
            output_file = os.path.join(args.output_dir, "batch_results.json")
            with open(output_file, "w") as f:
                json.dump(results, f, indent=2)
            print(f"\nResults saved to {output_file}")
        
        # Print summary
        print("\nProcessing complete!")
        print(f"Processed {len(results)} terms")
        
        # Print errors if any
        errors = {term: result for term, result in results.items() if "error" in result}
        if errors:
            print(f"\nErrors occurred for {len(errors)} terms:")
            for term, result in errors.items():
                print(f"- {term}: {result['error']}")
    
    # Unload model
    print("\nUnloading model...")
    thesaurus_llm.unload_model()
    print("Model unloaded successfully")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrate the AI Thesaurus LLM with the main application")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--term", type=str, help="Term to generate thesaurus entry for")
    parser.add_argument("--input_file", type=str, help="Path to a file containing terms (one per line) or a JSON file")
    parser.add_argument("--output_file", type=str, help="Path to save the result for a single term")
    parser.add_argument("--output_dir", type=str, help="Directory to save the results for multiple terms")
    parser.add_argument("--inference_config", type=str, default="default", help="Name of the inference config from INFERENCE_CONFIGS")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.term and not args.input_file:
        parser.error("Either --term or --input_file must be provided")
    
    if args.term and args.input_file:
        parser.error("Only one of --term or --input_file can be provided")
    
    if args.term and not args.output_file and args.output_dir:
        args.output_file = os.path.join(args.output_dir, f"{args.term.replace(' ', '_')}.json")
    
    main(args)
