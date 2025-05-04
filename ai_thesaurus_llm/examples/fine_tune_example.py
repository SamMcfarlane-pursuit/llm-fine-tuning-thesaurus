"""
Example script for fine-tuning a model with the AI Thesaurus LLM package
"""

import os
import argparse
from ai_thesaurus_llm.fine_tuning.lora_trainer import prepare_model_for_qlora, train_model
from ai_thesaurus_llm.utils.data_preparation import convert_json_to_dataset

def main(args):
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    print(f"Preparing model {args.model_name} for QLoRA fine-tuning...")
    
    # Prepare model for QLoRA fine-tuning
    model, tokenizer = prepare_model_for_qlora(
        model_name=args.model_name,
        lora_config_name=args.lora_config,
        use_auth_token=args.auth_token
    )
    
    print(f"Converting dataset {args.dataset_path}...")
    
    # Convert dataset
    dataset_path = args.dataset_path
    processed_dataset_path = os.path.join(args.output_dir, "processed_dataset")
    convert_json_to_dataset(dataset_path, processed_dataset_path)
    
    print(f"Training model with config {args.training_config}...")
    
    # Train model
    train_model(
        model=model,
        tokenizer=tokenizer,
        dataset_path=processed_dataset_path,
        training_config_name=args.training_config,
        output_dir=os.path.join(args.output_dir, "fine_tuned_model"),
        max_seq_length=args.max_seq_length
    )
    
    print(f"Fine-tuning complete! Model saved to {os.path.join(args.output_dir, 'fine_tuned_model')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune a model for thesaurus generation")
    parser.add_argument("--model_name", type=str, default="pythia-1.4b", help="Name of the model from BASE_MODELS config")
    parser.add_argument("--lora_config", type=str, default="default", help="Name of the LoRA config from LORA_CONFIGS")
    parser.add_argument("--training_config", type=str, default="default", help="Name of the training config from TRAINING_CONFIGS")
    parser.add_argument("--dataset_path", type=str, default="../datasets/sample_thesaurus_data.json", help="Path to the dataset")
    parser.add_argument("--output_dir", type=str, default="./outputs", help="Directory to save the model")
    parser.add_argument("--max_seq_length", type=int, default=512, help="Maximum sequence length for tokenization")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    main(args)
