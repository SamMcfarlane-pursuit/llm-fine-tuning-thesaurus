"""
LoRA Fine-Tuning Script for Thesaurus LLM

This script implements LoRA (Low-Rank Adaptation) fine-tuning for language models,
allowing efficient adaptation of large models with minimal memory requirements.
"""

import os
import torch
import argparse
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import (
    LoraConfig,
    get_peft_model,
    TaskType
)

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune a language model with LoRA")
    parser.add_argument(
        "--base_model",
        type=str,
        default="gpt2",
        help="Base model to fine-tune (e.g., gpt2, EleutherAI/pythia-1.4b)"
    )
    parser.add_argument(
        "--dataset_path",
        type=str,
        default="data/thesaurus_dataset.json",
        help="Path to the dataset file or Hugging Face dataset name"
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./thesaurus-model-lora",
        help="Directory to save the fine-tuned model"
    )
    parser.add_argument(
        "--lora_r",
        type=int,
        default=8,
        help="Rank of the LoRA update matrices"
    )
    parser.add_argument(
        "--lora_alpha",
        type=int,
        default=16,
        help="Scaling factor for LoRA"
    )
    parser.add_argument(
        "--lora_dropout",
        type=float,
        default=0.05,
        help="Dropout probability for LoRA layers"
    )
    parser.add_argument(
        "--learning_rate",
        type=float,
        default=3e-4,
        help="Learning rate for training"
    )
    parser.add_argument(
        "--num_train_epochs",
        type=int,
        default=3,
        help="Number of training epochs"
    )
    parser.add_argument(
        "--per_device_train_batch_size",
        type=int,
        default=8,
        help="Batch size per device during training"
    )
    parser.add_argument(
        "--gradient_accumulation_steps",
        type=int,
        default=2,
        help="Number of gradient accumulation steps"
    )
    parser.add_argument(
        "--max_seq_length",
        type=int,
        default=512,
        help="Maximum sequence length for training"
    )
    parser.add_argument(
        "--save_steps",
        type=int,
        default=500,
        help="Save checkpoint every X steps"
    )
    parser.add_argument(
        "--logging_steps",
        type=int,
        default=100,
        help="Log every X steps"
    )
    return parser.parse_args()

def prepare_dataset(dataset_path, tokenizer, max_length):
    """Load and prepare the dataset for training."""
    
    # Check if it's a local file or a Hugging Face dataset
    if os.path.exists(dataset_path):
        # Load from local file
        if dataset_path.endswith('.json'):
            dataset = load_dataset('json', data_files=dataset_path)
        elif dataset_path.endswith('.csv'):
            dataset = load_dataset('csv', data_files=dataset_path)
        else:
            raise ValueError(f"Unsupported file format: {dataset_path}")
    else:
        # Try to load from Hugging Face Hub
        dataset = load_dataset(dataset_path)
    
    # Ensure the dataset has a 'train' split
    if 'train' not in dataset:
        if 'text' in dataset:
            dataset = dataset.train_test_split(test_size=0.1)
        else:
            raise ValueError("Dataset must have a 'train' split or 'text' column")
    
    # Define the tokenization function
    def tokenize_function(examples):
        # Format the text for instruction tuning if needed
        if 'instruction' in examples and 'response' in examples:
            texts = [
                f"### Instruction: {instruction}\n\n### Response: {response}"
                for instruction, response in zip(examples['instruction'], examples['response'])
            ]
        elif 'instruction' in examples and 'input' in examples and 'output' in examples:
            # Format for instruction-input-output data
            texts = []
            for instruction, input_text, output in zip(examples['instruction'], examples['input'], examples['output']):
                if input_text:
                    text = f"### Instruction: {instruction}\n\n### Input: {input_text}\n\n### Response: {output}"
                else:
                    text = f"### Instruction: {instruction}\n\n### Response: {output}"
                texts.append(text)
        elif 'word' in examples and 'synonyms' in examples:
            # Format for thesaurus data
            texts = [
                f"### Instruction: List synonyms for the word '{word}'\n\n### Response: {', '.join(synonyms)}"
                for word, synonyms in zip(examples['word'], examples['synonyms'])
            ]
        else:
            # Use raw text
            texts = examples['text'] if 'text' in examples else examples['input']
        
        # Tokenize the texts
        tokenized = tokenizer(
            texts,
            padding="max_length",
            truncation=True,
            max_length=max_length,
            return_tensors="pt"
        )
        
        # Set the labels to be the same as the inputs
        tokenized["labels"] = tokenized["input_ids"].clone()
        
        return tokenized
    
    # Tokenize the dataset
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )
    
    return tokenized_dataset

def main():
    args = parse_args()
    
    # Load the base model
    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    # Load the tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    
    # Set padding token if not set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Determine target modules based on model architecture
    if "gpt2" in args.base_model.lower():
        target_modules = ["c_attn"]
    elif "pythia" in args.base_model.lower():
        target_modules = ["query_key_value"]
    elif "llama" in args.base_model.lower() or "mistral" in args.base_model.lower():
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"]
    else:
        # Default target modules for most transformer models
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"]
    
    # Define LoRA configuration
    lora_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
        target_modules=target_modules
    )
    
    # Apply LoRA to the model
    model = get_peft_model(model, lora_config)
    
    # Print trainable parameters info
    model.print_trainable_parameters()
    
    # Prepare the dataset
    dataset = prepare_dataset(args.dataset_path, tokenizer, args.max_seq_length)
    
    # Set up training arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        learning_rate=args.learning_rate,
        num_train_epochs=args.num_train_epochs,
        per_device_train_batch_size=args.per_device_train_batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        save_steps=args.save_steps,
        logging_steps=args.logging_steps,
        save_total_limit=3,
        remove_unused_columns=False,
        push_to_hub=False,
        report_to="tensorboard",
        load_best_model_at_end=True,
        fp16=True,  # Enable mixed precision training
    )
    
    # Create data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # We're not doing masked language modeling
    )
    
    # Initialize the Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset.get("test", None),
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    # Start training
    print("Starting LoRA fine-tuning...")
    trainer.train()
    
    # Save the final model
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"Model saved to {args.output_dir}")

if __name__ == "__main__":
    main()
