"""
Example script for generating thesaurus entries with streaming output
"""

import argparse
import time
from ai_thesaurus_llm.models.model_loader import load_finetuned_model
from ai_thesaurus_llm.inference.text_generation import generate_text_stream

def main(args):
    print(f"Loading fine-tuned model from {args.model_path}...")
    
    # Load fine-tuned model
    model, tokenizer = load_finetuned_model(
        adapter_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    print(f"Generating thesaurus entry for '{args.term}' with streaming output...\n")
    
    # Create prompt
    prompt = f"""Generate a comprehensive thesaurus entry for the term "{args.term}".
    
Format the response as follows:
- Synonyms: [list of synonyms]
- Antonyms: [list of antonyms]
- Related Terms: [list of related terms]
- Definition: [brief definition]
- Usage Examples: [2-3 example sentences]

Thesaurus Entry:
"""
    
    # Generate text with streaming
    streamer = generate_text_stream(
        model=model,
        tokenizer=tokenizer,
        prompt=prompt,
        inference_config_name=args.inference_config,
        max_new_tokens=args.max_tokens
    )
    
    # Process the streamed output
    print("Generated output:")
    for token in streamer:
        print(token, end="", flush=True)
        time.sleep(0.01)  # Add a small delay for a more natural typing effect
    
    print("\n\nGeneration complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate thesaurus entries with streaming output")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--term", type=str, required=True, help="Term to generate thesaurus entry for")
    parser.add_argument("--inference_config", type=str, default="default", help="Name of the inference config from INFERENCE_CONFIGS")
    parser.add_argument("--max_tokens", type=int, default=512, help="Maximum number of tokens to generate")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    main(args)
