"""
LoRA fine-tuning utilities for AI Thesaurus LLM
"""

import os
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import get_peft_model, LoraConfig, TaskType, prepare_model_for_kbit_training
from datasets import load_dataset

from ..models.config import BASE_MODELS, LORA_CONFIGS, TRAINING_CONFIGS

def prepare_model_for_lora(
    model_name,
    lora_config_name="default",
    device_map="auto",
    use_auth_token=None
):
    """
    Prepare a model for LoRA fine-tuning
    
    Args:
        model_name (str): Name of the model from BASE_MODELS config
        lora_config_name (str): Name of the LoRA config from LORA_CONFIGS
        device_map (str): Device map for model loading
        use_auth_token (str, optional): Hugging Face token for gated models
        
    Returns:
        tuple: (model, tokenizer)
    """
    if model_name not in BASE_MODELS:
        raise ValueError(f"Model {model_name} not found in BASE_MODELS config")
    
    if lora_config_name not in LORA_CONFIGS:
        raise ValueError(f"LoRA config {lora_config_name} not found in LORA_CONFIGS")
    
    model_config = BASE_MODELS[model_name]
    model_id = model_config["model_id"]
    lora_config_dict = LORA_CONFIGS[lora_config_name]
    
    # Check if model requires authentication
    if model_config["requires_auth"] and use_auth_token is None:
        raise ValueError(f"Model {model_name} requires authentication. Please provide a Hugging Face token.")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Ensure the tokenizer has a pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        device_map=device_map,
        torch_dtype=torch.float16,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Create LoRA config
    lora_config = LoraConfig(
        r=lora_config_dict["r"],
        lora_alpha=lora_config_dict["lora_alpha"],
        lora_dropout=lora_config_dict["lora_dropout"],
        bias=lora_config_dict["bias"],
        task_type=TaskType.CAUSAL_LM,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    # Prepare model for LoRA fine-tuning
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model, tokenizer

def prepare_model_for_qlora(
    model_name,
    lora_config_name="default",
    device_map="auto",
    use_auth_token=None
):
    """
    Prepare a model for QLoRA fine-tuning
    
    Args:
        model_name (str): Name of the model from BASE_MODELS config
        lora_config_name (str): Name of the LoRA config from LORA_CONFIGS
        device_map (str): Device map for model loading
        use_auth_token (str, optional): Hugging Face token for gated models
        
    Returns:
        tuple: (model, tokenizer)
    """
    from transformers import BitsAndBytesConfig
    
    if model_name not in BASE_MODELS:
        raise ValueError(f"Model {model_name} not found in BASE_MODELS config")
    
    if lora_config_name not in LORA_CONFIGS:
        raise ValueError(f"LoRA config {lora_config_name} not found in LORA_CONFIGS")
    
    model_config = BASE_MODELS[model_name]
    model_id = model_config["model_id"]
    lora_config_dict = LORA_CONFIGS[lora_config_name]
    
    # Check if model requires authentication
    if model_config["requires_auth"] and use_auth_token is None:
        raise ValueError(f"Model {model_name} requires authentication. Please provide a Hugging Face token.")
    
    # Create BitsAndBytes config for 4-bit quantization
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16
    )
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Ensure the tokenizer has a pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map=device_map,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Prepare model for kbit training
    model = prepare_model_for_kbit_training(model)
    
    # Create LoRA config
    lora_config = LoraConfig(
        r=lora_config_dict["r"],
        lora_alpha=lora_config_dict["lora_alpha"],
        lora_dropout=lora_config_dict["lora_dropout"],
        bias=lora_config_dict["bias"],
        task_type=TaskType.CAUSAL_LM,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    # Prepare model for LoRA fine-tuning
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model, tokenizer

def train_model(
    model,
    tokenizer,
    dataset_path,
    training_config_name="default",
    output_dir="./outputs",
    text_column="text",
    max_seq_length=512
):
    """
    Train a model using LoRA or QLoRA
    
    Args:
        model: The model to train
        tokenizer: The tokenizer for the model
        dataset_path (str): Path to the dataset (local or Hugging Face Hub)
        training_config_name (str): Name of the training config from TRAINING_CONFIGS
        output_dir (str): Directory to save the model
        text_column (str): Name of the text column in the dataset
        max_seq_length (int): Maximum sequence length for tokenization
        
    Returns:
        Trainer: The trainer object after training
    """
    if training_config_name not in TRAINING_CONFIGS:
        raise ValueError(f"Training config {training_config_name} not found in TRAINING_CONFIGS")
    
    training_config = TRAINING_CONFIGS[training_config_name]
    
    # Load dataset
    if os.path.exists(dataset_path):
        # Local dataset
        dataset = load_dataset("json", data_files=dataset_path)
    else:
        # Hugging Face Hub dataset
        dataset = load_dataset(dataset_path)
    
    # Tokenize dataset
    def tokenize_function(examples):
        return tokenizer(
            examples[text_column],
            padding="max_length",
            truncation=True,
            max_length=max_seq_length
        )
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=[col for col in dataset["train"].column_names if col != text_column]
    )
    
    # Create data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    
    # Create training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=training_config["num_train_epochs"],
        per_device_train_batch_size=training_config["per_device_train_batch_size"],
        gradient_accumulation_steps=training_config["gradient_accumulation_steps"],
        learning_rate=training_config["learning_rate"],
        weight_decay=training_config["weight_decay"],
        warmup_ratio=training_config["warmup_ratio"],
        lr_scheduler_type=training_config["lr_scheduler_type"],
        logging_steps=training_config["logging_steps"],
        save_steps=training_config["save_steps"],
        max_grad_norm=training_config["max_grad_norm"],
        max_steps=training_config["max_steps"],
        group_by_length=training_config["group_by_length"],
        report_to="tensorboard",
        fp16=True
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        data_collator=data_collator
    )
    
    # Train model
    trainer.train()
    
    # Save model
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    return trainer
