"""
Configuration for LLM models used in the AI Thesaurus
"""

# Base model configurations
BASE_MODELS = {
    "llama2-7b": {
        "model_id": "meta-llama/Llama-2-7b-hf",
        "description": "Llama 2 7B model from Meta",
        "requires_auth": True,
        "context_length": 4096,
        "recommended_for": ["fine-tuning", "instruction-tuning"]
    },
    "llama2-13b": {
        "model_id": "meta-llama/Llama-2-13b-hf",
        "description": "Llama 2 13B model from Meta",
        "requires_auth": True,
        "context_length": 4096,
        "recommended_for": ["fine-tuning", "instruction-tuning"]
    },
    "mistral-7b": {
        "model_id": "mistralai/Mistral-7B-v0.1",
        "description": "Mistral 7B model",
        "requires_auth": False,
        "context_length": 8192,
        "recommended_for": ["fine-tuning", "instruction-tuning"]
    },
    "pythia-1.4b": {
        "model_id": "EleutherAI/pythia-1.4b",
        "description": "Pythia 1.4B model from EleutherAI",
        "requires_auth": False,
        "context_length": 2048,
        "recommended_for": ["fine-tuning", "lightweight-applications"]
    },
    "opt-1.3b": {
        "model_id": "facebook/opt-1.3b",
        "description": "OPT 1.3B model from Facebook",
        "requires_auth": False,
        "context_length": 2048,
        "recommended_for": ["fine-tuning", "lightweight-applications"]
    }
}

# LoRA configurations
LORA_CONFIGS = {
    "default": {
        "r": 16,
        "lora_alpha": 32,
        "lora_dropout": 0.05,
        "bias": "none",
        "task_type": "CAUSAL_LM"
    },
    "lightweight": {
        "r": 8,
        "lora_alpha": 16,
        "lora_dropout": 0.1,
        "bias": "none",
        "task_type": "CAUSAL_LM"
    },
    "high_quality": {
        "r": 32,
        "lora_alpha": 64,
        "lora_dropout": 0.05,
        "bias": "none",
        "task_type": "CAUSAL_LM"
    }
}

# QLoRA configurations
QLORA_CONFIGS = {
    "default": {
        "load_in_4bit": True,
        "bnb_4bit_use_double_quant": True,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": "float16",
        "lora_config": LORA_CONFIGS["default"]
    },
    "memory_efficient": {
        "load_in_4bit": True,
        "bnb_4bit_use_double_quant": True,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": "float16",
        "lora_config": LORA_CONFIGS["lightweight"]
    },
    "high_quality": {
        "load_in_4bit": True,
        "bnb_4bit_use_double_quant": False,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": "bfloat16",
        "lora_config": LORA_CONFIGS["high_quality"]
    }
}

# Training configurations
TRAINING_CONFIGS = {
    "default": {
        "num_train_epochs": 3,
        "per_device_train_batch_size": 4,
        "gradient_accumulation_steps": 8,
        "learning_rate": 2e-4,
        "weight_decay": 0.01,
        "warmup_ratio": 0.03,
        "lr_scheduler_type": "cosine",
        "logging_steps": 10,
        "save_steps": 100,
        "eval_steps": 100,
        "max_grad_norm": 0.3,
        "max_steps": -1,
        "group_by_length": True,
        "output_dir": "./outputs",
    },
    "lightweight": {
        "num_train_epochs": 2,
        "per_device_train_batch_size": 2,
        "gradient_accumulation_steps": 4,
        "learning_rate": 1e-4,
        "weight_decay": 0.01,
        "warmup_ratio": 0.03,
        "lr_scheduler_type": "cosine",
        "logging_steps": 10,
        "save_steps": 100,
        "eval_steps": 100,
        "max_grad_norm": 0.3,
        "max_steps": -1,
        "group_by_length": True,
        "output_dir": "./outputs",
    },
    "thorough": {
        "num_train_epochs": 5,
        "per_device_train_batch_size": 4,
        "gradient_accumulation_steps": 8,
        "learning_rate": 1e-4,
        "weight_decay": 0.01,
        "warmup_ratio": 0.05,
        "lr_scheduler_type": "cosine",
        "logging_steps": 10,
        "save_steps": 100,
        "eval_steps": 50,
        "max_grad_norm": 0.3,
        "max_steps": -1,
        "group_by_length": True,
        "output_dir": "./outputs",
    }
}

# Inference configurations
INFERENCE_CONFIGS = {
    "default": {
        "max_new_tokens": 512,
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 50,
        "repetition_penalty": 1.1,
        "do_sample": True
    },
    "creative": {
        "max_new_tokens": 512,
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 100,
        "repetition_penalty": 1.05,
        "do_sample": True
    },
    "precise": {
        "max_new_tokens": 512,
        "temperature": 0.3,
        "top_p": 0.85,
        "top_k": 40,
        "repetition_penalty": 1.2,
        "do_sample": True
    },
    "greedy": {
        "max_new_tokens": 512,
        "temperature": 0.0,
        "top_p": 1.0,
        "top_k": 1,
        "repetition_penalty": 1.0,
        "do_sample": False
    }
}
