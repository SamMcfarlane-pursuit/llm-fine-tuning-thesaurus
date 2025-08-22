#!/usr/bin/env python3
"""
QLORA MODEL SERVER FOR VISUAL LLM
Advanced 4-bit quantized LoRA model inference system
"""

import torch
import os
import json
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QLoRAModelResponse:
    """Response from QLoRA model inference"""
    text: str
    model_name: str
    adapter_name: str
    quantization: str
    tokens_generated: int
    inference_time: float
    memory_used: float
    success: bool
    error: Optional[str] = None

class QLoRAModelManager:
    """Manages QLoRA (4-bit quantized) fine-tuned models"""
    
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.models_config = self._load_qlora_config()
        
        logger.info(f"⚡ QLoRA Model Manager initialized on {self.device}")
        
        # Check if 4-bit quantization is available
        self.quantization_available = self._check_quantization_support()
        
    def _check_quantization_support(self) -> bool:
        """Check if 4-bit quantization is supported"""
        try:
            import bitsandbytes as bnb
            from transformers import BitsAndBytesConfig
            logger.info(f"✅ BitsAndBytes available: {bnb.__version__}")
            return True
        except ImportError:
            logger.warning("⚠️ BitsAndBytes not available - 4-bit quantization disabled")
            logger.info("📦 Install with: pip install bitsandbytes")
            return False
    
    def _load_qlora_config(self) -> Dict:
        """Load QLoRA model configuration"""
        return {
            "llama_7b_educational": {
                "base_model": "NousResearch/Llama-2-7b-hf",
                "adapter_path": "./models/qlora-llama-7b-educational",
                "description": "Llama-2-7B fine-tuned with QLoRA for LLM education",
                "max_length": 300,
                "temperature": 0.7,
                "quantization": "4bit_nf4",
                "min_gpu_memory": "6GB"
            },
            "codellama_educational": {
                "base_model": "codellama/CodeLlama-7b-hf", 
                "adapter_path": "./models/qlora-codellama-educational",
                "description": "CodeLlama-7B fine-tuned for LoRA code examples",
                "max_length": 400,
                "temperature": 0.3,
                "quantization": "4bit_nf4",
                "min_gpu_memory": "6GB"
            },
            "mistral_educational": {
                "base_model": "mistralai/Mistral-7B-v0.1",
                "adapter_path": "./models/qlora-mistral-educational", 
                "description": "Mistral-7B fine-tuned for advanced LLM concepts",
                "max_length": 350,
                "temperature": 0.6,
                "quantization": "4bit_nf4",
                "min_gpu_memory": "5GB"
            }
        }
    
    def _create_quantization_config(self):
        """Create 4-bit quantization configuration"""
        if not self.quantization_available:
            return None
            
        try:
            from transformers import BitsAndBytesConfig
            
            return BitsAndBytesConfig(
                load_in_4bit=True,                      # Enable 4-bit quantization
                bnb_4bit_quant_type="nf4",              # Use NormalFloat 4-bit
                bnb_4bit_compute_dtype=torch.bfloat16,  # Compute dtype
                bnb_4bit_use_double_quant=True,         # Double quantization
            )
        except Exception as e:
            logger.error(f"❌ Failed to create quantization config: {e}")
            return None
    
    def load_qlora_model(self, model_name: str) -> bool:
        """Load a QLoRA model with 4-bit quantization"""
        if model_name not in self.models_config:
            logger.error(f"❌ QLoRA model {model_name} not found in configuration")
            return False
        
        try:
            config = self.models_config[model_name]
            base_model_name = config["base_model"]
            adapter_path = config["adapter_path"]
            
            logger.info(f"📥 Loading QLoRA model: {base_model_name}")
            
            # Check if adapter exists
            if not os.path.exists(adapter_path):
                logger.warning(f"⚠️ QLoRA adapter not found at {adapter_path}")
                logger.info(f"💡 Train with: python train_qlora_models.py --model {model_name}")
                return False
            
            # Import required libraries
            from transformers import (
                AutoTokenizer, AutoModelForCausalLM, 
                BitsAndBytesConfig
            )
            from peft import PeftModel, prepare_model_for_kbit_training
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(base_model_name)
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            tokenizer.padding_side = "right"
            
            # Create quantization config
            bnb_config = self._create_quantization_config()
            
            if bnb_config and self.device == "cuda":
                logger.info("⚡ Loading with 4-bit quantization...")
                
                # Load base model with quantization
                base_model = AutoModelForCausalLM.from_pretrained(
                    base_model_name,
                    quantization_config=bnb_config,
                    device_map="auto",
                    trust_remote_code=True,
                    torch_dtype=torch.bfloat16,
                )
                
                # Prepare for k-bit training
                base_model = prepare_model_for_kbit_training(base_model)
                
                # Load QLoRA adapter
                model = PeftModel.from_pretrained(base_model, adapter_path)
                
                logger.info("✅ QLoRA model loaded with 4-bit quantization")
                
            else:
                logger.info("🔄 Loading without quantization (CPU or no BitsAndBytes)")
                
                # Load without quantization
                base_model = AutoModelForCausalLM.from_pretrained(
                    base_model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None,
                    low_cpu_mem_usage=True
                )
                
                # Load adapter
                model = PeftModel.from_pretrained(base_model, adapter_path)
                
                logger.info("✅ QLoRA model loaded without quantization")
            
            # Store models
            self.models[model_name] = model
            self.tokenizers[model_name] = tokenizer
            
            # Log memory usage
            if torch.cuda.is_available():
                memory_used = torch.cuda.memory_allocated() / 1e9
                logger.info(f"💾 GPU Memory used: {memory_used:.1f} GB")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load QLoRA model {model_name}: {str(e)}")
            return False
    
    def generate_qlora_response(self, 
                               prompt: str,
                               model_name: str = "llama_7b_educational",
                               max_length: Optional[int] = None,
                               temperature: Optional[float] = None) -> QLoRAModelResponse:
        """Generate response using QLoRA model"""
        
        start_time = time.time()
        memory_before = torch.cuda.memory_allocated() / 1e9 if torch.cuda.is_available() else 0
        
        # Load model if not already loaded
        if model_name not in self.models:
            if not self.load_qlora_model(model_name):
                return QLoRAModelResponse(
                    text="Sorry, the QLoRA model is not available.",
                    model_name=model_name,
                    adapter_name="none",
                    quantization="none",
                    tokens_generated=0,
                    inference_time=0,
                    memory_used=0,
                    success=False,
                    error="Model loading failed"
                )
        
        try:
            model = self.models[model_name]
            tokenizer = self.tokenizers[model_name]
            config = self.models_config[model_name]
            
            # Use config defaults or provided values
            max_length = max_length or config.get("max_length", 300)
            temperature = temperature or config.get("temperature", 0.7)
            
            # Format prompt for different models
            if "llama" in model_name.lower():
                formatted_prompt = f"### Human: {prompt}\n### Assistant:"
            elif "code" in model_name.lower():
                formatted_prompt = f"# Question: {prompt}\n# Answer:"
            else:
                formatted_prompt = f"Human: {prompt}\nAssistant:"
            
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
                    length_penalty=1.0,
                    top_p=0.9,
                    top_k=50
                )
            
            # Decode response
            full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            response_text = full_response[len(formatted_prompt):].strip()
            
            # Calculate metrics
            tokens_generated = len(outputs[0]) - len(inputs[0])
            inference_time = time.time() - start_time
            memory_after = torch.cuda.memory_allocated() / 1e9 if torch.cuda.is_available() else 0
            memory_used = memory_after - memory_before
            
            # Determine quantization type
            quantization = config.get("quantization", "none")
            if not self.quantization_available or self.device != "cuda":
                quantization = "none"
            
            return QLoRAModelResponse(
                text=response_text,
                model_name=model_name,
                adapter_name=config["adapter_path"].split("/")[-1],
                quantization=quantization,
                tokens_generated=tokens_generated,
                inference_time=inference_time,
                memory_used=memory_used,
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ QLoRA generation failed for {model_name}: {str(e)}")
            return QLoRAModelResponse(
                text="Sorry, I encountered an error generating a response.",
                model_name=model_name,
                adapter_name="error",
                quantization="error",
                tokens_generated=0,
                inference_time=time.time() - start_time,
                memory_used=0,
                success=False,
                error=str(e)
            )
    
    def get_available_qlora_models(self) -> Dict[str, Dict]:
        """Get available QLoRA models"""
        available = {}
        for name, config in self.models_config.items():
            adapter_exists = os.path.exists(config["adapter_path"])
            available[name] = {
                "description": config["description"],
                "base_model": config["base_model"],
                "quantization": config["quantization"],
                "min_gpu_memory": config["min_gpu_memory"],
                "adapter_available": adapter_exists,
                "loaded": name in self.models,
                "status": "ready" if adapter_exists else "needs_training",
                "quantization_supported": self.quantization_available
            }
        return available
    
    def get_system_info(self) -> Dict:
        """Get QLoRA system information"""
        info = {
            "device": self.device,
            "quantization_available": self.quantization_available,
            "models_loaded": len(self.models),
            "total_models": len(self.models_config)
        }
        
        if torch.cuda.is_available():
            info["gpu_info"] = {
                "name": torch.cuda.get_device_name(0),
                "memory_total": f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB",
                "memory_allocated": f"{torch.cuda.memory_allocated() / 1e9:.1f} GB",
                "memory_reserved": f"{torch.cuda.memory_reserved() / 1e9:.1f} GB"
            }
        
        return info

# Global QLoRA manager instance
qlora_manager = QLoRAModelManager()

def get_qlora_response(prompt: str, model_name: str = "llama_7b_educational") -> Dict[str, Any]:
    """Get response from QLoRA model (Flask endpoint function)"""
    response = qlora_manager.generate_qlora_response(prompt, model_name)
    
    return {
        "response": response.text,
        "model": response.model_name,
        "adapter": response.adapter_name,
        "quantization": response.quantization,
        "tokens": response.tokens_generated,
        "time": response.inference_time,
        "memory": response.memory_used,
        "success": response.success,
        "error": response.error,
        "type": "qlora_model"
    }

if __name__ == "__main__":
    # Test QLoRA system
    print("⚡ Testing QLoRA Model System")
    print("=" * 60)
    
    # System info
    info = qlora_manager.get_system_info()
    print(f"🔥 Device: {info['device']}")
    print(f"⚡ Quantization: {info['quantization_available']}")
    
    if info.get("gpu_info"):
        gpu = info["gpu_info"]
        print(f"📱 GPU: {gpu['name']}")
        print(f"💾 Memory: {gpu['memory_allocated']}/{gpu['memory_total']}")
    
    # Available models
    available = qlora_manager.get_available_qlora_models()
    print(f"\n📋 Available QLoRA models:")
    for name, model_info in available.items():
        status = "✅" if model_info["adapter_available"] else "❌"
        quant = "⚡" if model_info["quantization_supported"] else "🔄"
        print(f"  {status}{quant} {name}: {model_info['description']}")
        print(f"      Base: {model_info['base_model']}")
        print(f"      Memory: {model_info['min_gpu_memory']}")
        print(f"      Status: {model_info['status']}")
    
    print(f"\n💡 To train QLoRA models: python train_qlora_models.py")
    print(f"📚 QLoRA enables fine-tuning 7B+ models on consumer GPUs!")
