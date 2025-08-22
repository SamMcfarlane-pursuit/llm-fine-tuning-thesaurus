"""
Ollama Training API for Visual LLM Platform
Provides REST endpoints for model training and management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from extensions import csrf
import asyncio
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

# Import the training system
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ollama_training_system import OllamaTrainingSystem, TrainingConfig, SAMPLE_DATASETS

logger = logging.getLogger(__name__)

# Create blueprint
training_api = Blueprint('training_api', __name__)

# Initialize training system
training_system = OllamaTrainingSystem()

@training_api.route('/api/training/status', methods=['GET'])
@csrf.exempt
def training_status():
    """Check if Ollama training system is available"""
    try:
        # Run async check in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        is_available = loop.run_until_complete(training_system.check_ollama_status())
        loop.close()
        
        return jsonify({
            'available': is_available,
            'system': 'ollama_training',
            'status': 'online' if is_available else 'offline',
            'message': 'Ollama training system ready' if is_available else 'Ollama not running. Start with: ollama serve'
        })
    except Exception as e:
        logger.error(f"Training status check failed: {e}")
        return jsonify({
            'available': False,
            'system': 'ollama_training',
            'status': 'error',
            'error': str(e)
        }), 500

@training_api.route('/api/training/models', methods=['GET'])
@csrf.exempt
def list_models():
    """List available Ollama models for training"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        models = loop.run_until_complete(training_system.list_available_models())
        loop.close()
        
        return jsonify({
            'success': True,
            'models': models,
            'count': len(models)
        })
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@training_api.route('/api/training/datasets/samples', methods=['GET'])
@csrf.exempt
def get_sample_datasets():
    """Get sample training datasets"""
    return jsonify({
        'success': True,
        'datasets': {
            name: {
                'name': name,
                'description': f'Sample dataset for {name.replace("_", " ")} training',
                'size': len(data),
                'preview': data[:3]  # Show first 3 examples
            }
            for name, data in SAMPLE_DATASETS.items()
        }
    })

@training_api.route('/api/training/start', methods=['POST'])
@csrf.exempt
@login_required
def start_training():
    """Start a new training job"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['model_name', 'base_model', 'training_type', 'dataset']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create training configuration
        config = TrainingConfig(
            model_name=data['model_name'],
            base_model=data['base_model'],
            training_type=data['training_type'],
            epochs=data.get('epochs', 3),
            learning_rate=data.get('learning_rate', 1e-4),
            batch_size=data.get('batch_size', 4),
            max_length=data.get('max_length', 512),
            lora_rank=data.get('lora_rank', 16),
            lora_alpha=data.get('lora_alpha', 32),
            lora_dropout=data.get('lora_dropout', 0.1)
        )
        
        # Get dataset
        dataset = data['dataset']
        if isinstance(dataset, str) and dataset in SAMPLE_DATASETS:
            # Use sample dataset
            dataset = SAMPLE_DATASETS[dataset]
        elif isinstance(dataset, list):
            # Use provided dataset
            pass
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid dataset format'
            }), 400
        
        # Start training
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        job_id = loop.run_until_complete(training_system.start_training(config, dataset))
        loop.close()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'Training started for model: {config.model_name}',
            'config': {
                'model_name': config.model_name,
                'base_model': config.base_model,
                'training_type': config.training_type,
                'epochs': config.epochs,
                'dataset_size': len(dataset)
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to start training: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@training_api.route('/api/training/jobs/<job_id>/status', methods=['GET'])
@csrf.exempt
def get_job_status(job_id):
    """Get training job status"""
    try:
        status = training_system.get_training_status(job_id)
        
        if not status:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'status': status.status,
            'progress': status.progress,
            'current_epoch': status.current_epoch,
            'total_epochs': status.total_epochs,
            'loss': status.loss,
            'start_time': status.start_time.isoformat(),
            'end_time': status.end_time.isoformat() if status.end_time else None,
            'error_message': status.error_message
        })
        
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@training_api.route('/api/training/jobs', methods=['GET'])
@csrf.exempt
@login_required
def list_training_jobs():
    """List all training jobs for the current user"""
    try:
        jobs = training_system.list_training_jobs()
        
        job_list = []
        for job in jobs:
            job_list.append({
                'job_id': job.job_id,
                'status': job.status,
                'progress': job.progress,
                'current_epoch': job.current_epoch,
                'total_epochs': job.total_epochs,
                'loss': job.loss,
                'start_time': job.start_time.isoformat(),
                'end_time': job.end_time.isoformat() if job.end_time else None,
                'error_message': job.error_message
            })
        
        return jsonify({
            'success': True,
            'jobs': job_list,
            'count': len(job_list)
        })
        
    except Exception as e:
        logger.error(f"Failed to list training jobs: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@training_api.route('/api/training/test', methods=['POST'])
@csrf.exempt
def test_model():
    """Test a trained model with a prompt"""
    try:
        data = request.get_json()
        
        if 'model_name' not in data or 'prompt' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing model_name or prompt'
            }), 400
        
        model_name = data['model_name']
        prompt = data['prompt']
        
        # Test the model
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(training_system.test_trained_model(model_name, prompt))
        loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Failed to test model: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@training_api.route('/api/training/quick-start', methods=['POST'])
@csrf.exempt
@login_required
def quick_start_training():
    """Quick start training with predefined configurations"""
    try:
        data = request.get_json()
        training_type = data.get('type', 'lora')  # 'lora', 'qlora', 'demo'
        
        if training_type == 'demo':
            # Demo training with small dataset
            config = TrainingConfig(
                model_name=f"visual_llm_demo_{datetime.now().strftime('%H%M%S')}",
                base_model="llama3.1",
                training_type="lora",
                epochs=1,
                learning_rate=1e-4,
                batch_size=2,
                max_length=256,
                lora_rank=8,
                lora_alpha=16
            )
            dataset = SAMPLE_DATASETS['llm_finetuning'][:5]  # Small demo dataset
            
        elif training_type == 'lora':
            # Standard LoRA training
            config = TrainingConfig(
                model_name=f"visual_llm_lora_{datetime.now().strftime('%H%M%S')}",
                base_model="llama3.1",
                training_type="lora",
                epochs=3,
                learning_rate=1e-4,
                batch_size=4,
                lora_rank=16,
                lora_alpha=32
            )
            dataset = SAMPLE_DATASETS['llm_finetuning']
            
        elif training_type == 'qlora':
            # QLoRA training
            config = TrainingConfig(
                model_name=f"visual_llm_qlora_{datetime.now().strftime('%H%M%S')}",
                base_model="llama3.1",
                training_type="qlora",
                epochs=3,
                learning_rate=1e-4,
                batch_size=2,
                lora_rank=16,
                lora_alpha=32
            )
            dataset = SAMPLE_DATASETS['llm_finetuning']
            
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid training type. Use: demo, lora, or qlora'
            }), 400
        
        # Start training
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        job_id = loop.run_until_complete(training_system.start_training(config, dataset))
        loop.close()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'Quick start {training_type.upper()} training initiated',
            'config': {
                'model_name': config.model_name,
                'base_model': config.base_model,
                'training_type': config.training_type,
                'epochs': config.epochs,
                'dataset_size': len(dataset)
            },
            'estimated_time': f"{config.epochs * 2} minutes"
        })
        
    except Exception as e:
        logger.error(f"Quick start training failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
