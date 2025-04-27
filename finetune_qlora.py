import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

def train_model():
    # Load dataset
    dataset = load_dataset("json", data_files="data/thesaurus_dataset.json")
    
    # Define model and tokenizer
    model_name = "meta-llama/Llama-2-7b-hf"  # Or another model of your choice
    
    # Configure quantization
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )
    
    # Load model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Prepare model for training
    model = prepare_model_for_kbit_training(model)
    
    # Define LoRA configuration
    lora_config = LoraConfig(
        r=16,  # Rank
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    
    # Apply LoRA
    model = get_peft_model(model, lora_config)
    
    # Define training arguments
    training_args = TrainingArguments(
        output_dir="./thesaurus_model",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        save_steps=100,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=True,
        optim="paged_adamw_8bit",
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="cosine",
    )
    
    # Initialize trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset["train"],
        args=training_args,
        tokenizer=tokenizer,
        max_seq_length=512,
        packing=True,
    )
    
    # Train model
    trainer.train()
    
    # Save model
    trainer.save_model("./thesaurus_model_final")
    
    # Save tokenizer
    tokenizer.save_pretrained("./thesaurus_model_final")
    
    print("Training completed and model saved!")

if __name__ == "__main__":
    train_model()
