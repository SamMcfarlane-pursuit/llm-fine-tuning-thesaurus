"""
Ollama Training System for Visual LLM Platform
Enables users to fine-tune Ollama models with custom datasets
Supports LoRA, QLoRA, and full fine-tuning approaches
"""

import os
import json
import asyncio
import aiohttp
import subprocess
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class TrainingConfig:
    """Configuration for Ollama model training"""
    model_name: str
    base_model: str
    dataset_path: str
    training_type: str  # 'lora', 'qlora', 'full'
    epochs: int = 3
    learning_rate: float = 1e-4
    batch_size: int = 4
    max_length: int = 512
    lora_rank: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.1
    output_dir: str = "trained_models"

@dataclass
class TrainingStatus:
    """Training job status tracking"""
    job_id: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: float
    current_epoch: int
    total_epochs: int
    loss: float
    start_time: datetime
    end_time: Optional[datetime] = None
    error_message: Optional[str] = None

class OllamaTrainingSystem:
    """
    Advanced Ollama Training System
    Provides comprehensive model fine-tuning capabilities
    """
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.training_jobs: Dict[str, TrainingStatus] = {}
        self.models_dir = Path("trained_models")
        self.datasets_dir = Path("training_datasets")
        self.modelfiles_dir = Path("modelfiles")
        
        # Create directories
        for dir_path in [self.models_dir, self.datasets_dir, self.modelfiles_dir]:
            dir_path.mkdir(exist_ok=True)
        
        logger.info("🔥 Ollama Training System initialized")

    async def check_ollama_status(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags", timeout=5) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(f"Ollama not accessible: {e}")
            return False

    async def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available Ollama models"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('models', [])
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
        return []

    def prepare_training_dataset(self, dataset: List[Dict[str, str]], dataset_name: str) -> str:
        """
        Prepare training dataset in Ollama-compatible format
        
        Args:
            dataset: List of {"instruction": str, "response": str} pairs
            dataset_name: Name for the dataset file
            
        Returns:
            Path to the prepared dataset file
        """
        dataset_path = self.datasets_dir / f"{dataset_name}.jsonl"
        
        with open(dataset_path, 'w', encoding='utf-8') as f:
            for item in dataset:
                # Convert to Ollama training format
                training_item = {
                    "prompt": item.get("instruction", ""),
                    "response": item.get("response", ""),
                    "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."
                }
                f.write(json.dumps(training_item) + '\n')
        
        logger.info(f"📊 Dataset prepared: {dataset_path} ({len(dataset)} examples)")
        return str(dataset_path)

    def create_modelfile(self, config: TrainingConfig) -> str:
        """
        Create Ollama Modelfile for fine-tuning
        
        Args:
            config: Training configuration
            
        Returns:
            Path to the created Modelfile
        """
        modelfile_path = self.modelfiles_dir / f"{config.model_name}.Modelfile"
        
        # Create Modelfile content based on training type
        if config.training_type == "lora":
            modelfile_content = f"""FROM {config.base_model}

# LoRA Configuration
PARAMETER lora_rank {config.lora_rank}
PARAMETER lora_alpha {config.lora_alpha}
PARAMETER lora_dropout {config.lora_dropout}

# Training Parameters
PARAMETER learning_rate {config.learning_rate}
PARAMETER epochs {config.epochs}
PARAMETER batch_size {config.batch_size}
PARAMETER max_length {config.max_length}

# System Message
SYSTEM You are an expert AI assistant specializing in LLM fine-tuning, LoRA, QLoRA, and machine learning education. Provide detailed, technical, and practical responses with code examples when appropriate.

# Template
TEMPLATE \"\"\"{{{{ if .System }}}}<|start_header_id|>system<|end_header_id|>

{{{{ .System }}}}<|eot_id|>{{{{ end }}}}{{{{ if .Prompt }}}}<|start_header_id|>user<|end_header_id|>

{{{{ .Prompt }}}}<|eot_id|>{{{{ end }}}}<|start_header_id|>assistant<|end_header_id|>

{{{{ .Response }}}}<|eot_id|>\"\"\"
"""
        elif config.training_type == "qlora":
            modelfile_content = f"""FROM {config.base_model}

# QLoRA Configuration (4-bit quantization)
PARAMETER quantization 4bit
PARAMETER lora_rank {config.lora_rank}
PARAMETER lora_alpha {config.lora_alpha}
PARAMETER lora_dropout {config.lora_dropout}

# Training Parameters
PARAMETER learning_rate {config.learning_rate}
PARAMETER epochs {config.epochs}
PARAMETER batch_size {config.batch_size}
PARAMETER max_length {config.max_length}

# System Message
SYSTEM You are an expert AI assistant specializing in LLM fine-tuning, LoRA, QLoRA, and machine learning education. Provide detailed, technical, and practical responses with code examples when appropriate.
"""
        else:  # full fine-tuning
            modelfile_content = f"""FROM {config.base_model}

# Full Fine-tuning Configuration
PARAMETER learning_rate {config.learning_rate}
PARAMETER epochs {config.epochs}
PARAMETER batch_size {config.batch_size}
PARAMETER max_length {config.max_length}

# System Message
SYSTEM You are an expert AI assistant specializing in LLM fine-tuning, LoRA, QLoRA, and machine learning education. Provide detailed, technical, and practical responses with code examples when appropriate.
"""
        
        with open(modelfile_path, 'w', encoding='utf-8') as f:
            f.write(modelfile_content)
        
        logger.info(f"📝 Modelfile created: {modelfile_path}")
        return str(modelfile_path)

    async def start_training(self, config: TrainingConfig, dataset: List[Dict[str, str]]) -> str:
        """
        Start training a new Ollama model
        
        Args:
            config: Training configuration
            dataset: Training dataset
            
        Returns:
            Job ID for tracking training progress
        """
        job_id = f"train_{config.model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Prepare dataset
        dataset_path = self.prepare_training_dataset(dataset, f"{config.model_name}_dataset")
        
        # Create Modelfile
        modelfile_path = self.create_modelfile(config)
        
        # Initialize training status
        self.training_jobs[job_id] = TrainingStatus(
            job_id=job_id,
            status="pending",
            progress=0.0,
            current_epoch=0,
            total_epochs=config.epochs,
            loss=0.0,
            start_time=datetime.now()
        )
        
        # Start training in background
        asyncio.create_task(self._run_training(job_id, config, modelfile_path, dataset_path))
        
        logger.info(f"🚀 Training started: {job_id}")
        return job_id

    async def _run_training(self, job_id: str, config: TrainingConfig, modelfile_path: str, dataset_path: str):
        """Run the actual training process"""
        try:
            self.training_jobs[job_id].status = "running"
            
            # Create model using Ollama CLI
            cmd = [
                "ollama", "create", config.model_name,
                "-f", modelfile_path,
                "--dataset", dataset_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Monitor training progress
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                
                line_str = line.decode().strip()
                logger.info(f"Training output: {line_str}")
                
                # Parse progress information
                if "epoch" in line_str.lower():
                    # Extract epoch information
                    try:
                        parts = line_str.split()
                        for i, part in enumerate(parts):
                            if part.lower() == "epoch":
                                epoch = int(parts[i + 1].split('/')[0])
                                self.training_jobs[job_id].current_epoch = epoch
                                self.training_jobs[job_id].progress = (epoch / config.epochs) * 100
                                break
                    except:
                        pass
                
                if "loss" in line_str.lower():
                    # Extract loss information
                    try:
                        parts = line_str.split()
                        for i, part in enumerate(parts):
                            if part.lower() == "loss:":
                                loss = float(parts[i + 1])
                                self.training_jobs[job_id].loss = loss
                                break
                    except:
                        pass
            
            await process.wait()
            
            if process.returncode == 0:
                self.training_jobs[job_id].status = "completed"
                self.training_jobs[job_id].progress = 100.0
                self.training_jobs[job_id].end_time = datetime.now()
                logger.info(f"✅ Training completed: {job_id}")
            else:
                stderr = await process.stderr.read()
                error_msg = stderr.decode()
                self.training_jobs[job_id].status = "failed"
                self.training_jobs[job_id].error_message = error_msg
                self.training_jobs[job_id].end_time = datetime.now()
                logger.error(f"❌ Training failed: {job_id} - {error_msg}")
                
        except Exception as e:
            self.training_jobs[job_id].status = "failed"
            self.training_jobs[job_id].error_message = str(e)
            self.training_jobs[job_id].end_time = datetime.now()
            logger.error(f"❌ Training error: {job_id} - {e}")

    def get_training_status(self, job_id: str) -> Optional[TrainingStatus]:
        """Get training job status"""
        return self.training_jobs.get(job_id)

    def list_training_jobs(self) -> List[TrainingStatus]:
        """List all training jobs"""
        return list(self.training_jobs.values())

    async def test_trained_model(self, model_name: str, test_prompt: str) -> Dict[str, Any]:
        """Test a trained model with a prompt"""
        try:
            payload = {
                "model": model_name,
                "prompt": test_prompt,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "response": data.get("response", ""),
                            "model": model_name
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}"
                        }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Example usage and sample datasets
SAMPLE_DATASETS = {
    "llm_finetuning": [
        {
            "instruction": "What is LoRA fine-tuning?",
            "response": "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture. This reduces the number of trainable parameters by up to 10,000x while maintaining comparable performance to full fine-tuning."
        },
        {
            "instruction": "How does QLoRA differ from LoRA?",
            "response": "QLoRA (Quantized LoRA) extends LoRA by adding 4-bit quantization to the base model, further reducing memory requirements. While LoRA reduces trainable parameters, QLoRA also reduces the memory footprint of the frozen parameters through quantization, enabling fine-tuning of larger models on consumer hardware."
        },
        {
            "instruction": "Provide a code example for implementing LoRA with Hugging Face PEFT",
            "response": """Here's a complete LoRA implementation example:

```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load base model and tokenizer
model_name = "microsoft/DialoGPT-medium"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    inference_mode=False,
    r=16,  # rank
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["c_attn", "c_proj"]  # target attention layers
)

# Apply LoRA to model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 294,912 || all params: 117,489,664 || trainable%: 0.25
```

This reduces trainable parameters from 117M to just 295K while maintaining model quality."""
        }
    ]
}
