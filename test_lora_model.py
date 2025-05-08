"""
Script to test a LoRA fine-tuned model for thesaurus generation

This script loads a LoRA fine-tuned model and generates synonyms for given words.
"""

import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

def parse_args():
    parser = argparse.ArgumentParser(description="Test a LoRA fine-tuned model")
    parser.add_argument(
        "--model_path",
        type=str,
        default="./thesaurus-model-lora",
        help="Path to the LoRA fine-tuned model or merged model"
    )
    parser.add_argument(
        "--words",
        type=str,
        nargs="+",
        default=["happy", "intelligent", "beautiful", "strong"],
        help="Words to generate synonyms for"
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Temperature for text generation"
    )
    parser.add_argument(
        "--max_new_tokens",
        type=int,
        default=100,
        help="Maximum number of new tokens to generate"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    print(f"Loading model from {args.model_path}...")
    
    # Check if it's a LoRA adapter or a merged model
    is_peft_model = False
    try:
        # Try to load as a PEFT model
        config = PeftConfig.from_pretrained(args.model_path)
        is_peft_model = True
    except:
        # Not a PEFT model, assume it's a merged model
        is_peft_model = False
    
    if is_peft_model:
        # Load the base model
        print(f"Loading base model: {config.base_model_name_or_path}")
        base_model = AutoModelForCausalLM.from_pretrained(
            config.base_model_name_or_path,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        # Load the tokenizer
        tokenizer = AutoTokenizer.from_pretrained(config.base_model_name_or_path)
        
        # Load the LoRA adapter
        model = PeftModel.from_pretrained(base_model, args.model_path)
    else:
        # Load the merged model directly
        model = AutoModelForCausalLM.from_pretrained(
            args.model_path,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        tokenizer = AutoTokenizer.from_pretrained(args.model_path)
    
    # Set padding token if not set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Generate synonyms for each word
    for word in args.words:
        # Prepare the prompt
        prompt = f"### Instruction: List synonyms for the word '{word}'\n\n### Response:"
        
        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # Generate the response
        print(f"\nGenerating synonyms for '{word}'...")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=args.max_new_tokens,
                temperature=args.temperature,
                num_beams=5,
                num_return_sequences=1,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the synonyms part
        response_parts = response.split("### Response:")
        if len(response_parts) > 1:
            synonyms = response_parts[1].strip()
        else:
            synonyms = response
        
        print(f"Synonyms for '{word}': {synonyms}")

if __name__ == "__main__":
    main()
