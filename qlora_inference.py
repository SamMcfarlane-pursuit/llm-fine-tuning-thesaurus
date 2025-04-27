"""
Inference Script for QLoRA Fine-Tuned Models

This script loads a QLoRA fine-tuned model and runs inference to generate synonyms
for given words or phrases.
"""

import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

def parse_args():
    parser = argparse.ArgumentParser(description="Run inference with a QLoRA fine-tuned model")
    parser.add_argument(
        "--model_path",
        type=str,
        default="./thesaurus-model-qlora",
        help="Path to the fine-tuned model"
    )
    parser.add_argument(
        "--word",
        type=str,
        required=True,
        help="Word to find synonyms for"
    )
    parser.add_argument(
        "--max_length",
        type=int,
        default=100,
        help="Maximum length of generated text"
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Temperature for text generation"
    )
    parser.add_argument(
        "--num_beams",
        type=int,
        default=5,
        help="Number of beams for beam search"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    print(f"Loading model from {args.model_path}...")
    
    # Load the configuration
    config = PeftConfig.from_pretrained(args.model_path)
    
    # Load the base model with 4-bit quantization
    base_model = AutoModelForCausalLM.from_pretrained(
        config.base_model_name_or_path,
        load_in_4bit=True,
        device_map="auto"
    )
    
    # Load the tokenizer
    tokenizer = AutoTokenizer.from_pretrained(config.base_model_name_or_path)
    
    # Load the LoRA adapter
    model = PeftModel.from_pretrained(base_model, args.model_path)
    
    # Prepare the prompt
    prompt = f"### Instruction: List synonyms for the word '{args.word}'\n\n### Response:"
    
    # Tokenize the prompt
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Generate the response
    print(f"Generating synonyms for '{args.word}'...")
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=args.max_length,
            temperature=args.temperature,
            num_beams=args.num_beams,
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
    
    print("\nGenerated Synonyms:")
    print(synonyms)

if __name__ == "__main__":
    main()
