"""
Example script for batch processing multiple terms with the AI Thesaurus LLM
"""

import os
import argparse
import json
import time
from tqdm import tqdm
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
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Process each term
    results = {}
    start_time = time.time()
    
    for term in tqdm(terms, desc="Generating thesaurus entries"):
        try:
            # Generate thesaurus entry
            result = generate_thesaurus_entries(
                model=model,
                tokenizer=tokenizer,
                term=term,
                inference_config_name=args.inference_config
            )
            
            # Add to results
            results[term] = result
            
            # Save individual result if requested
            if args.save_individual:
                with open(os.path.join(args.output_dir, f"{term.replace(' ', '_')}.json"), 'w') as f:
                    json.dump(result, f, indent=2)
            
            # Add a small delay to avoid overloading the GPU
            if args.delay > 0:
                time.sleep(args.delay)
        
        except Exception as e:
            print(f"Error processing term '{term}': {str(e)}")
            results[term] = {"error": str(e)}
    
    # Calculate processing time
    total_time = time.time() - start_time
    avg_time = total_time / len(terms)
    
    print(f"\nProcessing complete!")
    print(f"Total time: {total_time:.2f} seconds")
    print(f"Average time per term: {avg_time:.2f} seconds")
    
    # Save all results
    with open(os.path.join(args.output_dir, "all_results.json"), 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Results saved to {os.path.join(args.output_dir, 'all_results.json')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch process multiple terms")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--input_file", type=str, required=True, help="Path to a file containing terms (one per line) or a JSON file")
    parser.add_argument("--output_dir", type=str, default="./outputs", help="Directory to save the results")
    parser.add_argument("--inference_config", type=str, default="default", help="Name of the inference config from INFERENCE_CONFIGS")
    parser.add_argument("--save_individual", action="store_true", help="Save individual results for each term")
    parser.add_argument("--delay", type=float, default=0.0, help="Delay between processing terms (in seconds)")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    main(args)
