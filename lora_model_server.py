#!/usr/bin/env python3
"""
LORA MODEL SERVER FOR VISUAL LLM
Real LoRA fine-tuned model inference system
"""

import torch
import os
import json
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    pipeline
)
from peft import PeftModel, PeftConfig
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LoRAModelResponse:
    """Response from LoRA model inference"""
    text: str
    model_name: str
    adapter_name: str
    tokens_generated: int
    inference_time: float
    success: bool
    error: Optional[str] = None

class LoRAModelManager:
    """Manages multiple LoRA fine-tuned models for inference"""
    
    def __init__(self):
        self.base_models = {}
        self.lora_adapters = {}
        self.tokenizers = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models_config = self._load_models_config()
        
        logger.info(f"🔥 LoRA Model Manager initialized on {self.device}")
        
    def _load_models_config(self) -> Dict:
        """Load model configuration"""
        config = {
            "educational_assistant": {
                "base_model": "microsoft/DialoGPT-medium",
                "adapter_path": "./models/lora-educational-assistant",
                "description": "Fine-tuned for LLM education and LoRA/QLoRA questions",
                "max_length": 200,
                "temperature": 0.7
            },
            "code_helper": {
                "base_model": "microsoft/DialoGPT-medium", 
                "adapter_path": "./models/lora-code-helper",
                "description": "Fine-tuned for code generation and debugging",
                "max_length": 300,
                "temperature": 0.3
            },
            "general_chat": {
                "base_model": "microsoft/DialoGPT-medium",
                "adapter_path": "./models/lora-general-chat", 
                "description": "General conversational AI with LoRA adaptation",
                "max_length": 150,
                "temperature": 0.8
            }
        }
        return config
    
    def load_model(self, model_name: str) -> bool:
        """Load a specific LoRA model"""
        if model_name not in self.models_config:
            logger.error(f"❌ Model {model_name} not found in configuration")
            return False
            
        try:
            config = self.models_config[model_name]
            base_model_name = config["base_model"]
            adapter_path = config["adapter_path"]
            
            logger.info(f"📥 Loading base model: {base_model_name}")
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(base_model_name)
            tokenizer.pad_token = tokenizer.eos_token
            
            # Load base model
            base_model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                low_cpu_mem_usage=True
            )
            
            # Load LoRA adapter if exists
            if os.path.exists(adapter_path):
                logger.info(f"📥 Loading LoRA adapter: {adapter_path}")
                model = PeftModel.from_pretrained(base_model, adapter_path)
                logger.info(f"✅ LoRA adapter loaded successfully")
            else:
                logger.warning(f"⚠️ LoRA adapter not found at {adapter_path}, using base model")
                model = base_model
            
            # Store models
            self.base_models[model_name] = base_model
            self.lora_adapters[model_name] = model
            self.tokenizers[model_name] = tokenizer
            
            logger.info(f"✅ Model {model_name} loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load model {model_name}: {str(e)}")
            return False
    
    def generate_response(self, 
                         prompt: str, 
                         model_name: str = "educational_assistant",
                         max_length: Optional[int] = None,
                         temperature: Optional[float] = None) -> LoRAModelResponse:
        """Generate response using LoRA fine-tuned model"""
        
        start_time = time.time()
        
        # Load model if not already loaded
        if model_name not in self.lora_adapters:
            if not self.load_model(model_name):
                return LoRAModelResponse(
                    text="Sorry, the model is not available.",
                    model_name=model_name,
                    adapter_name="none",
                    tokens_generated=0,
                    inference_time=0,
                    success=False,
                    error="Model loading failed"
                )
        
        try:
            model = self.lora_adapters[model_name]
            tokenizer = self.tokenizers[model_name]
            config = self.models_config[model_name]
            
            # Use config defaults or provided values
            max_length = max_length or config.get("max_length", 200)
            temperature = temperature or config.get("temperature", 0.7)
            
            # Format prompt for educational assistant
            if model_name == "educational_assistant":
                formatted_prompt = f"Human: {prompt}\nAssistant:"
            else:
                formatted_prompt = prompt
            
            # Tokenize input
            inputs = tokenizer.encode(formatted_prompt, return_tensors="pt")
            if self.device == "cuda":
                inputs = inputs.to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=len(inputs[0]) + max_length,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id,
                    num_return_sequences=1,
                    repetition_penalty=1.1,
                    length_penalty=1.0
                )
            
            # Decode response
            full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the generated part
            if model_name == "educational_assistant":
                response_text = full_response[len(formatted_prompt):].strip()
            else:
                response_text = full_response[len(prompt):].strip()
            
            # Calculate metrics
            tokens_generated = len(outputs[0]) - len(inputs[0])
            inference_time = time.time() - start_time
            
            return LoRAModelResponse(
                text=response_text,
                model_name=model_name,
                adapter_name=config["adapter_path"].split("/")[-1],
                tokens_generated=tokens_generated,
                inference_time=inference_time,
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Generation failed for {model_name}: {str(e)}")
            return LoRAModelResponse(
                text="Sorry, I encountered an error generating a response.",
                model_name=model_name,
                adapter_name="error",
                tokens_generated=0,
                inference_time=time.time() - start_time,
                success=False,
                error=str(e)
            )
    
    def get_available_models(self) -> Dict[str, Dict]:
        """Get list of available LoRA models"""
        available = {}
        for name, config in self.models_config.items():
            adapter_exists = os.path.exists(config["adapter_path"])
            available[name] = {
                "description": config["description"],
                "base_model": config["base_model"],
                "adapter_available": adapter_exists,
                "loaded": name in self.lora_adapters,
                "status": "ready" if adapter_exists else "adapter_missing"
            }
        return available
    
    def unload_model(self, model_name: str) -> bool:
        """Unload a model to free memory"""
        try:
            if model_name in self.lora_adapters:
                del self.lora_adapters[model_name]
            if model_name in self.base_models:
                del self.base_models[model_name]
            if model_name in self.tokenizers:
                del self.tokenizers[model_name]
            
            # Clear GPU cache
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            logger.info(f"✅ Model {model_name} unloaded successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to unload model {model_name}: {str(e)}")
            return False

class LoRATrainingManager:
    """Manages LoRA fine-tuning for new adapters"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def create_educational_assistant(self) -> bool:
        """Create and train educational assistant LoRA adapter"""
        try:
            from transformers import TrainingArguments, Trainer, DataCollatorForLanguageModeling
            from peft import LoraConfig, get_peft_model, TaskType
            from datasets import Dataset
            import pandas as pd
            
            logger.info("🚀 Starting LoRA fine-tuning for educational assistant...")
            
            # Educational dataset
            educational_data = [
                {
                    "input": "What is LoRA?",
                    "output": "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that reduces trainable parameters by up to 99% while maintaining model performance. It works by decomposing weight updates into low-rank matrices A and B, where the update is A×B instead of updating the full weight matrix."
                },
                {
                    "input": "How does QLoRA work?",
                    "output": "QLoRA (Quantized LoRA) combines 4-bit quantization with LoRA to enable fine-tuning of massive models on consumer GPUs. It uses NF4 (NormalFloat 4-bit) quantization, double quantization for constants, and paged optimizers to achieve ~75% memory reduction while maintaining quality."
                },
                {
                    "input": "What are the benefits of parameter-efficient fine-tuning?",
                    "output": "Parameter-efficient fine-tuning offers: 1) Massive memory reduction (99% fewer parameters), 2) Faster training, 3) Cost-effective training on consumer hardware, 4) Easy deployment with small adapter files, 5) Multiple adapters per base model, 6) Reduced overfitting risk."
                },
                {
                    "input": "How to choose LoRA rank?",
                    "output": "LoRA rank (r) controls adaptation capacity. Start with r=16 for most tasks. Higher ranks (32-64) provide better quality but more parameters. Lower ranks (4-8) are more efficient but may limit adaptation. The sweet spot is usually 16-32 for educational fine-tuning."
                },
                {
                    "input": "What is the difference between full fine-tuning and LoRA?",
                    "output": "Full fine-tuning updates all model parameters (expensive, requires large GPUs), while LoRA only trains small adapter matrices (99% fewer parameters, works on consumer GPUs). LoRA achieves similar performance with dramatically reduced computational requirements."
                }
            ]
            
            # Format dataset
            def format_conversation(example):
                return {"text": f"Human: {example['input']}\nAssistant: {example['output']}<|endoftext|>"}
            
            dataset = Dataset.from_pandas(pd.DataFrame(educational_data))
            dataset = dataset.map(format_conversation)
            
            # Load base model and tokenizer
            model_name = "microsoft/DialoGPT-medium"
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            tokenizer.pad_token = tokenizer.eos_token
            
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None
            )
            
            # LoRA configuration
            lora_config = LoraConfig(
                r=16,
                lora_alpha=32,
                target_modules=["c_attn", "c_proj"],
                lora_dropout=0.1,
                bias="none",
                task_type=TaskType.CAUSAL_LM,
            )
            
            # Apply LoRA
            model = get_peft_model(model, lora_config)
            model.print_trainable_parameters()
            
            # Tokenize dataset
            def tokenize_function(examples):
                return tokenizer(
                    examples["text"],
                    truncation=True,
                    padding=False,
                    max_length=512,
                )
            
            tokenized_dataset = dataset.map(
                tokenize_function,
                batched=True,
                remove_columns=dataset.column_names,
            )
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir="./models/lora-educational-assistant",
                overwrite_output_dir=True,
                num_train_epochs=3,
                per_device_train_batch_size=2,
                gradient_accumulation_steps=2,
                warmup_steps=10,
                learning_rate=5e-4,
                fp16=True if self.device == "cuda" else False,
                logging_steps=1,
                save_strategy="epoch",
                remove_unused_columns=False,
                dataloader_pin_memory=False,
            )
            
            # Data collator
            data_collator = DataCollatorForLanguageModeling(
                tokenizer=tokenizer,
                mlm=False,
            )
            
            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=tokenized_dataset,
                data_collator=data_collator,
            )
            
            # Train
            logger.info("🏋️ Starting training...")
            trainer.train()
            
            # Save adapter
            model.save_pretrained("./models/lora-educational-assistant")
            tokenizer.save_pretrained("./models/lora-educational-assistant")
            
            logger.info("✅ Educational assistant LoRA adapter trained and saved!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Training failed: {str(e)}")
            return False

# Global model manager instance
lora_manager = LoRAModelManager()

def get_lora_response(prompt: str, model_name: str = "educational_assistant") -> Dict[str, Any]:
    """Get response from LoRA model (Flask endpoint function)"""
    response = lora_manager.generate_response(prompt, model_name)
    
    return {
        "response": response.text,
        "model": response.model_name,
        "adapter": response.adapter_name,
        "tokens": response.tokens_generated,
        "time": response.inference_time,
        "success": response.success,
        "error": response.error,
        "type": "lora_model"
    }

if __name__ == "__main__":
    # Test the LoRA model system
    print("🧪 Testing LoRA Model System")
    print("=" * 50)
    
    # Check available models
    available = lora_manager.get_available_models()
    print("📋 Available models:")
    for name, info in available.items():
        status = "✅" if info["adapter_available"] else "❌"
        print(f"  {status} {name}: {info['description']}")
    
    # Test training (if no adapters exist)
    if not any(info["adapter_available"] for info in available.values()):
        print("\n🚀 No LoRA adapters found. Training educational assistant...")
        trainer = LoRATrainingManager()
        if trainer.create_educational_assistant():
            print("✅ Training completed!")
        else:
            print("❌ Training failed!")
    
    # Test inference
    print("\n🧪 Testing inference...")
    test_prompts = [
        "What is LoRA?",
        "How does QLoRA work?",
        "What are the benefits of parameter-efficient fine-tuning?"
    ]
    
    for prompt in test_prompts:
        print(f"\n📝 Prompt: {prompt}")
        response = lora_manager.generate_response(prompt)
        if response.success:
            print(f"🤖 Response: {response.text}")
            print(f"⚡ Time: {response.inference_time:.2f}s, Tokens: {response.tokens_generated}")
        else:
            print(f"❌ Error: {response.error}")
    
    print("\n✅ LoRA Model System test completed!")
