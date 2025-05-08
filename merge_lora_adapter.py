"""
Script to merge LoRA adapter weights with the base model

This script merges the LoRA adapter weights with the base model to create
a single model that can be used for inference without the adapter.
"""

import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

def parse_args():
    parser = argparse.ArgumentParser(description="Merge LoRA adapter with base model")
    parser.add_argument(
        "--adapter_path",
        type=str,
        default="./thesaurus-model-lora",
        help="Path to the LoRA adapter"
    )
    parser.add_argument(
        "--output_path",
        type=str,
        default="./thesaurus-model-merged",
        help="Path to save the merged model"
    )
    parser.add_argument(
        "--half_precision",
        action="store_true",
        help="Save the model in half precision (float16)"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    print(f"Loading adapter from {args.adapter_path}...")
    
    # Load the configuration
    config = PeftConfig.from_pretrained(args.adapter_path)
    
    # Load the base model
    print(f"Loading base model: {config.base_model_name_or_path}")
    base_model = AutoModelForCausalLM.from_pretrained(
        config.base_model_name_or_path,
        torch_dtype=torch.float16 if args.half_precision else torch.float32,
        device_map="auto"
    )
    
    # Load the tokenizer
    tokenizer = AutoTokenizer.from_pretrained(config.base_model_name_or_path)
    
    # Load the LoRA adapter
    model = PeftModel.from_pretrained(base_model, args.adapter_path)
    
    # Merge the adapter with the base model
    print("Merging adapter weights with base model...")
    merged_model = model.merge_and_unload()
    
    # Save the merged model
    print(f"Saving merged model to {args.output_path}...")
    merged_model.save_pretrained(args.output_path)
    tokenizer.save_pretrained(args.output_path)
    
    print("Model successfully merged and saved!")

if __name__ == "__main__":
    main()
