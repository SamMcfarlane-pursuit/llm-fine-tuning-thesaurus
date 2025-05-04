"""
Model loader utilities for AI Thesaurus LLM
"""

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel, PeftConfig

from .config import BASE_MODELS, QLORA_CONFIGS

def load_base_model(model_name, device_map="auto", use_auth_token=None):
    """
    Load a base model from Hugging Face Hub
    
    Args:
        model_name (str): Name of the model from BASE_MODELS config
        device_map (str): Device map for model loading
        use_auth_token (str, optional): Hugging Face token for gated models
        
    Returns:
        tuple: (model, tokenizer)
    """
    if model_name not in BASE_MODELS:
        raise ValueError(f"Model {model_name} not found in BASE_MODELS config")
    
    model_config = BASE_MODELS[model_name]
    model_id = model_config["model_id"]
    
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
    
    return model, tokenizer

def load_quantized_model(model_name, qlora_config_name="default", device_map="auto", use_auth_token=None):
    """
    Load a quantized model using BitsAndBytes
    
    Args:
        model_name (str): Name of the model from BASE_MODELS config
        qlora_config_name (str): Name of the QLoRA config from QLORA_CONFIGS
        device_map (str): Device map for model loading
        use_auth_token (str, optional): Hugging Face token for gated models
        
    Returns:
        tuple: (model, tokenizer)
    """
    if model_name not in BASE_MODELS:
        raise ValueError(f"Model {model_name} not found in BASE_MODELS config")
    
    if qlora_config_name not in QLORA_CONFIGS:
        raise ValueError(f"QLoRA config {qlora_config_name} not found in QLORA_CONFIGS")
    
    model_config = BASE_MODELS[model_name]
    model_id = model_config["model_id"]
    qlora_config = QLORA_CONFIGS[qlora_config_name]
    
    # Check if model requires authentication
    if model_config["requires_auth"] and use_auth_token is None:
        raise ValueError(f"Model {model_name} requires authentication. Please provide a Hugging Face token.")
    
    # Create BitsAndBytes config
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=qlora_config["load_in_4bit"],
        bnb_4bit_use_double_quant=qlora_config["bnb_4bit_use_double_quant"],
        bnb_4bit_quant_type=qlora_config["bnb_4bit_quant_type"],
        bnb_4bit_compute_dtype=getattr(torch, qlora_config["bnb_4bit_compute_dtype"])
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
    
    return model, tokenizer

def load_finetuned_model(adapter_path, base_model_name=None, device_map="auto", use_auth_token=None):
    """
    Load a fine-tuned model with a LoRA adapter
    
    Args:
        adapter_path (str): Path to the adapter model
        base_model_name (str, optional): Name of the base model from BASE_MODELS config
        device_map (str): Device map for model loading
        use_auth_token (str, optional): Hugging Face token for gated models
        
    Returns:
        tuple: (model, tokenizer)
    """
    # Load the PEFT config to get the base model name if not provided
    peft_config = PeftConfig.from_pretrained(adapter_path)
    base_model_id = peft_config.base_model_name_or_path
    
    # If base_model_name is provided, use it to get the model_id from BASE_MODELS
    if base_model_name is not None:
        if base_model_name not in BASE_MODELS:
            raise ValueError(f"Model {base_model_name} not found in BASE_MODELS config")
        base_model_id = BASE_MODELS[base_model_name]["model_id"]
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        base_model_id,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Ensure the tokenizer has a pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load base model
    model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        device_map=device_map,
        torch_dtype=torch.float16,
        use_auth_token=use_auth_token,
        trust_remote_code=True
    )
    
    # Load the fine-tuned model with the adapter
    model = PeftModel.from_pretrained(model, adapter_path)
    
    return model, tokenizer
