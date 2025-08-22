#!/usr/bin/env python3
"""
USER TRAINING SYSTEM FOR VISUAL LLM
Allow users to train their own LoRA models through the platform
"""

import os
import json
import uuid
import time
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TrainingJob:
    """Represents a user training job"""
    job_id: str
    user_id: str
    model_name: str
    base_model: str
    dataset_path: str
    config: Dict[str, Any]
    status: str  # pending, running, completed, failed
    progress: float  # 0.0 to 1.0
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None
    model_path: Optional[str] = None
    metrics: Optional[Dict] = None

class UserTrainingManager:
    """Manages user-initiated LoRA training jobs"""
    
    def __init__(self):
        self.jobs_dir = Path("user_training_jobs")
        self.models_dir = Path("user_models")
        self.datasets_dir = Path("user_datasets")
        self.jobs_db = self.jobs_dir / "training_jobs.json"
        
        # Create directories
        for dir_path in [self.jobs_dir, self.models_dir, self.datasets_dir]:
            dir_path.mkdir(exist_ok=True)
        
        # Load jobs database
        self.jobs = self._load_jobs_db()
        
        # Training queue
        self.training_queue = []
        self.current_job = None
        self.training_thread = None
        
        # User limits (free tier)
        self.user_limits = {
            "max_concurrent_jobs": 1,
            "max_jobs_per_day": 3,
            "max_dataset_size_mb": 10,
            "max_training_time_minutes": 30,
            "max_models_per_user": 5
        }
        
    def _load_jobs_db(self) -> Dict[str, TrainingJob]:
        """Load training jobs database"""
        if self.jobs_db.exists():
            with open(self.jobs_db, 'r') as f:
                data = json.load(f)
                return {
                    job_id: TrainingJob(**job_data) 
                    for job_id, job_data in data.items()
                }
        return {}
    
    def _save_jobs_db(self):
        """Save training jobs database"""
        data = {
            job_id: asdict(job) 
            for job_id, job in self.jobs.items()
        }
        with open(self.jobs_db, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _check_user_limits(self, user_id: str) -> Dict[str, Any]:
        """Check if user can start a new training job"""
        user_jobs = [job for job in self.jobs.values() if job.user_id == user_id]
        
        # Check daily limit
        today = datetime.now().date()
        today_jobs = [
            job for job in user_jobs 
            if datetime.fromisoformat(job.created_at).date() == today
        ]
        
        # Check concurrent jobs
        running_jobs = [
            job for job in user_jobs 
            if job.status in ['pending', 'running']
        ]
        
        # Check total models
        completed_jobs = [
            job for job in user_jobs 
            if job.status == 'completed'
        ]
        
        return {
            "can_train": (
                len(today_jobs) < self.user_limits["max_jobs_per_day"] and
                len(running_jobs) < self.user_limits["max_concurrent_jobs"] and
                len(completed_jobs) < self.user_limits["max_models_per_user"]
            ),
            "daily_jobs_used": len(today_jobs),
            "daily_jobs_limit": self.user_limits["max_jobs_per_day"],
            "running_jobs": len(running_jobs),
            "max_concurrent": self.user_limits["max_concurrent_jobs"],
            "total_models": len(completed_jobs),
            "max_models": self.user_limits["max_models_per_user"]
        }
    
    def create_training_job(self, 
                           user_id: str,
                           model_name: str,
                           base_model: str,
                           dataset_content: str,
                           training_config: Dict = None) -> Dict[str, Any]:
        """Create a new user training job"""
        
        # Check user limits
        limits_check = self._check_user_limits(user_id)
        if not limits_check["can_train"]:
            return {
                "success": False,
                "error": "Training limits exceeded",
                "limits": limits_check
            }
        
        # Validate inputs
        if len(dataset_content) > self.user_limits["max_dataset_size_mb"] * 1024 * 1024:
            return {
                "success": False,
                "error": f"Dataset too large (max {self.user_limits['max_dataset_size_mb']}MB)"
            }
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Save dataset
        dataset_path = self.datasets_dir / f"{user_id}_{job_id}.txt"
        with open(dataset_path, 'w', encoding='utf-8') as f:
            f.write(dataset_content)
        
        # Default training config
        default_config = {
            "rank": 8,  # Lower for user training
            "alpha": 16,
            "dropout": 0.1,
            "epochs": 2,  # Shorter training
            "batch_size": 1,
            "learning_rate": 5e-4,
            "max_length": 256
        }
        
        if training_config:
            default_config.update(training_config)
        
        # Create training job
        job = TrainingJob(
            job_id=job_id,
            user_id=user_id,
            model_name=model_name,
            base_model=base_model,
            dataset_path=str(dataset_path),
            config=default_config,
            status="pending",
            progress=0.0,
            created_at=datetime.now().isoformat()
        )
        
        # Save job
        self.jobs[job_id] = job
        self._save_jobs_db()
        
        # Add to queue
        self.training_queue.append(job_id)
        
        # Start training if not already running
        self._start_training_worker()
        
        logger.info(f"✅ Created training job {job_id} for user {user_id}")
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "pending",
            "estimated_time_minutes": self._estimate_training_time(default_config),
            "queue_position": len(self.training_queue)
        }
    
    def _estimate_training_time(self, config: Dict) -> int:
        """Estimate training time in minutes"""
        base_time = 5  # Base time in minutes
        epochs_factor = config.get("epochs", 2)
        rank_factor = config.get("rank", 8) / 8
        
        return int(base_time * epochs_factor * rank_factor)
    
    def _start_training_worker(self):
        """Start the training worker thread"""
        if self.training_thread is None or not self.training_thread.is_alive():
            self.training_thread = threading.Thread(target=self._training_worker)
            self.training_thread.daemon = True
            self.training_thread.start()
    
    def _training_worker(self):
        """Background worker for processing training jobs"""
        while self.training_queue:
            job_id = self.training_queue.pop(0)
            job = self.jobs.get(job_id)
            
            if job and job.status == "pending":
                self.current_job = job_id
                self._execute_training_job(job)
                self.current_job = None
    
    def _execute_training_job(self, job: TrainingJob):
        """Execute a training job"""
        logger.info(f"🚀 Starting training job {job.job_id}")
        
        try:
            # Update job status
            job.status = "running"
            job.started_at = datetime.now().isoformat()
            job.progress = 0.1
            self._save_jobs_db()
            
            # Prepare dataset
            dataset = self._prepare_user_dataset(job.dataset_path)
            job.progress = 0.2
            self._save_jobs_db()
            
            # Load base model and tokenizer
            model, tokenizer = self._load_base_model(job.base_model)
            job.progress = 0.3
            self._save_jobs_db()
            
            # Apply LoRA configuration
            model = self._apply_lora_config(model, job.config)
            job.progress = 0.4
            self._save_jobs_db()
            
            # Train model
            self._train_model(model, tokenizer, dataset, job)
            job.progress = 0.9
            self._save_jobs_db()
            
            # Save trained model
            model_path = self._save_user_model(model, tokenizer, job)
            job.model_path = str(model_path)
            job.progress = 1.0
            job.status = "completed"
            job.completed_at = datetime.now().isoformat()
            
            # Calculate metrics
            job.metrics = self._calculate_training_metrics(job)
            
            logger.info(f"✅ Training job {job.job_id} completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Training job {job.job_id} failed: {str(e)}")
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.now().isoformat()
        
        finally:
            self._save_jobs_db()
    
    def _prepare_user_dataset(self, dataset_path: str) -> List[Dict]:
        """Prepare user dataset for training"""
        with open(dataset_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Simple dataset format: each line is a training example
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        
        # Convert to conversation format
        dataset = []
        for i, line in enumerate(lines):
            if ':' in line:
                # Format: "Question: Answer"
                parts = line.split(':', 1)
                if len(parts) == 2:
                    question, answer = parts
                    dataset.append({
                        "input": question.strip(),
                        "output": answer.strip()
                    })
            else:
                # Treat as general text
                dataset.append({
                    "input": f"Continue this text: {line[:50]}...",
                    "output": line
                })
        
        return dataset[:50]  # Limit to 50 examples for free tier
    
    def _load_base_model(self, base_model: str):
        """Load base model and tokenizer"""
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        # Use lightweight model for user training
        model_name = "microsoft/DialoGPT-small"  # Smaller for faster training
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,  # Use float32 for CPU
            low_cpu_mem_usage=True
        )
        
        return model, tokenizer
    
    def _apply_lora_config(self, model, config: Dict):
        """Apply LoRA configuration to model"""
        from peft import LoraConfig, get_peft_model, TaskType
        
        lora_config = LoraConfig(
            r=config.get("rank", 8),
            lora_alpha=config.get("alpha", 16),
            target_modules=["c_attn", "c_proj"],  # DialoGPT modules
            lora_dropout=config.get("dropout", 0.1),
            bias="none",
            task_type=TaskType.CAUSAL_LM,
        )
        
        model = get_peft_model(model, lora_config)
        return model
    
    def _train_model(self, model, tokenizer, dataset, job: TrainingJob):
        """Train the LoRA model"""
        from transformers import TrainingArguments, Trainer, DataCollatorForLanguageModeling
        from datasets import Dataset
        import pandas as pd
        import torch
        
        # Format dataset
        def format_conversation(example):
            return {"text": f"Human: {example['input']}\nAssistant: {example['output']}<|endoftext|>"}
        
        hf_dataset = Dataset.from_pandas(pd.DataFrame(dataset))
        hf_dataset = hf_dataset.map(format_conversation)
        
        # Tokenize
        def tokenize_function(examples):
            return tokenizer(
                examples["text"],
                truncation=True,
                padding=False,
                max_length=job.config.get("max_length", 256),
            )
        
        tokenized_dataset = hf_dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=hf_dataset.column_names,
        )
        
        # Training arguments (optimized for user training)
        training_args = TrainingArguments(
            output_dir=f"./temp_training_{job.job_id}",
            overwrite_output_dir=True,
            num_train_epochs=job.config.get("epochs", 2),
            per_device_train_batch_size=job.config.get("batch_size", 1),
            learning_rate=job.config.get("learning_rate", 5e-4),
            logging_steps=1,
            save_strategy="no",  # Don't save intermediate checkpoints
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            report_to=None,  # Disable wandb
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=tokenizer,
            mlm=False,
        )
        
        # Custom trainer with progress callback
        class ProgressTrainer(Trainer):
            def __init__(self, job_ref, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.job_ref = job_ref
            
            def on_step_end(self, args, state, control, **kwargs):
                # Update progress
                progress = 0.4 + (state.global_step / state.max_steps) * 0.5
                self.job_ref.progress = min(progress, 0.9)
                # Save progress every 10 steps
                if state.global_step % 10 == 0:
                    self._save_jobs_db()
        
        # Train
        trainer = ProgressTrainer(
            job,
            model=model,
            args=training_args,
            train_dataset=tokenized_dataset,
            data_collator=data_collator,
        )
        
        trainer.train()
        
        # Cleanup temp directory
        import shutil
        temp_dir = Path(f"./temp_training_{job.job_id}")
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
    
    def _save_user_model(self, model, tokenizer, job: TrainingJob) -> Path:
        """Save the trained user model"""
        model_dir = self.models_dir / f"{job.user_id}_{job.job_id}_{job.model_name}"
        model_dir.mkdir(exist_ok=True)
        
        # Save LoRA adapter
        model.save_pretrained(model_dir)
        tokenizer.save_pretrained(model_dir)
        
        # Save metadata
        metadata = {
            "job_id": job.job_id,
            "user_id": job.user_id,
            "model_name": job.model_name,
            "base_model": job.base_model,
            "config": job.config,
            "created_at": job.created_at,
            "completed_at": job.completed_at,
            "dataset_size": len(self._prepare_user_dataset(job.dataset_path)),
            "training_time_minutes": self._calculate_training_time(job)
        }
        
        with open(model_dir / "user_model_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        return model_dir
    
    def _calculate_training_metrics(self, job: TrainingJob) -> Dict:
        """Calculate training metrics"""
        training_time = self._calculate_training_time(job)
        dataset_size = len(self._prepare_user_dataset(job.dataset_path))
        
        return {
            "training_time_minutes": training_time,
            "dataset_size": dataset_size,
            "parameters_trained": job.config.get("rank", 8) * 2 * 768,  # Approximate
            "efficiency_score": min(100, (dataset_size * 10) / max(training_time, 1))
        }
    
    def _calculate_training_time(self, job: TrainingJob) -> float:
        """Calculate training time in minutes"""
        if job.started_at and job.completed_at:
            start = datetime.fromisoformat(job.started_at)
            end = datetime.fromisoformat(job.completed_at)
            return (end - start).total_seconds() / 60
        return 0
    
    def get_job_status(self, job_id: str) -> Optional[Dict]:
        """Get status of a training job"""
        job = self.jobs.get(job_id)
        if not job:
            return None
        
        return {
            "job_id": job.job_id,
            "status": job.status,
            "progress": job.progress,
            "created_at": job.created_at,
            "started_at": job.started_at,
            "completed_at": job.completed_at,
            "error_message": job.error_message,
            "model_path": job.model_path,
            "metrics": job.metrics,
            "queue_position": self.training_queue.index(job_id) + 1 if job_id in self.training_queue else 0
        }
    
    def get_user_jobs(self, user_id: str) -> List[Dict]:
        """Get all jobs for a user"""
        user_jobs = [job for job in self.jobs.values() if job.user_id == user_id]
        user_jobs.sort(key=lambda x: x.created_at, reverse=True)
        
        return [
            {
                "job_id": job.job_id,
                "model_name": job.model_name,
                "status": job.status,
                "progress": job.progress,
                "created_at": job.created_at,
                "completed_at": job.completed_at,
                "metrics": job.metrics
            }
            for job in user_jobs
        ]
    
    def get_user_models(self, user_id: str) -> List[Dict]:
        """Get all completed models for a user"""
        completed_jobs = [
            job for job in self.jobs.values() 
            if job.user_id == user_id and job.status == "completed"
        ]
        
        return [
            {
                "job_id": job.job_id,
                "model_name": job.model_name,
                "model_path": job.model_path,
                "created_at": job.created_at,
                "metrics": job.metrics,
                "config": job.config
            }
            for job in completed_jobs
        ]

# Global training manager
user_training_manager = UserTrainingManager()

def get_training_manager():
    """Get the global training manager instance"""
    return user_training_manager

if __name__ == "__main__":
    # Test the user training system
    print("👥 Testing User Training System")
    print("=" * 50)
    
    manager = UserTrainingManager()
    
    # Test dataset
    test_dataset = """What is LoRA?: LoRA is a parameter-efficient fine-tuning technique
How does fine-tuning work?: Fine-tuning adapts pre-trained models to specific tasks
What are the benefits?: Reduced computational requirements and faster training"""
    
    # Create test job
    result = manager.create_training_job(
        user_id="test_user",
        model_name="test_model",
        base_model="microsoft/DialoGPT-small",
        dataset_content=test_dataset
    )
    
    print(f"📋 Training job result: {result}")
    
    if result["success"]:
        job_id = result["job_id"]
        print(f"✅ Created job: {job_id}")
        
        # Monitor progress
        while True:
            status = manager.get_job_status(job_id)
            print(f"📊 Status: {status['status']} ({status['progress']*100:.1f}%)")
            
            if status["status"] in ["completed", "failed"]:
                break
            
            time.sleep(5)
        
        print("🎉 User training system test completed!")
