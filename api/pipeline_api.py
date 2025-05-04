"""
Pipeline API Module

This module provides API endpoints for interacting with the Hugging Face pipeline API.
It supports various NLP tasks such as text generation, sentiment analysis, summarization, etc.
"""

import torch
from flask import Blueprint, request, jsonify
from transformers import pipeline, set_seed
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
pipeline_api = Blueprint('pipeline_api', __name__)

# Global cache for pipelines to avoid reloading models
pipeline_cache = {}

def get_pipeline(task, model_name, **kwargs):
    """
    Get a pipeline instance from cache or create a new one
    
    Args:
        task (str): The pipeline task
        model_name (str): The model name
        **kwargs: Additional arguments for the pipeline
        
    Returns:
        A pipeline instance
    """
    cache_key = f"{task}_{model_name}"
    
    if cache_key in pipeline_cache:
        logger.info(f"Using cached pipeline for {cache_key}")
        return pipeline_cache[cache_key]
    
    logger.info(f"Creating new pipeline for {cache_key}")
    
    # Determine device
    device = -1  # Default to CPU
    if torch.cuda.is_available():
        device = 0  # Use first GPU
        logger.info("Using GPU for inference")
    
    # Create pipeline
    try:
        pipe = pipeline(
            task,
            model=model_name,
            device=device,
            **kwargs
        )
        
        # Cache pipeline
        pipeline_cache[cache_key] = pipe
        
        return pipe
    except Exception as e:
        logger.error(f"Error creating pipeline: {str(e)}")
        raise

@pipeline_api.route('/pipeline', methods=['POST'])
def run_pipeline():
    """
    Run a Hugging Face pipeline with the provided parameters
    
    Request JSON:
    {
        "task": "text-generation",
        "model": "gpt2",
        "input": "Once upon a time",
        "options": {
            "max_length": 50,
            "temperature": 0.7,
            ...
        }
    }
    
    Returns:
        JSON response with the pipeline result
    """
    try:
        data = request.json
        
        # Validate required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        task = data.get('task')
        model = data.get('model')
        input_text = data.get('input')
        options = data.get('options', {})
        
        if not task:
            return jsonify({"error": "Task not specified"}), 400
        
        if not model:
            return jsonify({"error": "Model not specified"}), 400
        
        if not input_text:
            return jsonify({"error": "Input text not specified"}), 400
        
        logger.info(f"Running pipeline: task={task}, model={model}")
        
        # Set seed for reproducibility if provided
        if 'seed' in options:
            set_seed(options.pop('seed'))
        
        # Special handling for specific tasks
        if task == 'translation':
            # Handle translation task
            src_lang = options.pop('source_lang', 'en')
            tgt_lang = options.pop('target_lang', 'fr')
            
            # Use translation pipeline with language pair
            pipe = get_pipeline(f"translation_{src_lang}_to_{tgt_lang}", model)
        else:
            # Use standard pipeline
            pipe = get_pipeline(task, model)
        
        # Run pipeline
        result = pipe(input_text, **options)
        
        # Log success
        logger.info(f"Pipeline executed successfully")
        
        return jsonify({"result": result})
    
    except Exception as e:
        logger.error(f"Error running pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@pipeline_api.route('/pipeline/models', methods=['GET'])
def get_available_models():
    """
    Get a list of recommended models for each task
    
    Returns:
        JSON response with recommended models for each task
    """
    # Define recommended models for each task
    recommended_models = {
        'text-generation': [
            {'id': 'gpt2', 'name': 'GPT-2', 'description': 'OpenAI\'s GPT-2 model for text generation'},
            {'id': 'distilgpt2', 'name': 'DistilGPT-2', 'description': 'Distilled version of GPT-2, smaller and faster'},
            {'id': 'EleutherAI/gpt-neo-125M', 'name': 'GPT-Neo 125M', 'description': 'EleutherAI\'s GPT-Neo model with 125M parameters'}
        ],
        'sentiment-analysis': [
            {'id': 'distilbert-base-uncased-finetuned-sst-2-english', 'name': 'DistilBERT for Sentiment', 'description': 'Fine-tuned DistilBERT for sentiment analysis'},
            {'id': 'nlptown/bert-base-multilingual-uncased-sentiment', 'name': 'Multilingual BERT for Sentiment', 'description': 'BERT model for sentiment analysis in multiple languages'}
        ],
        'summarization': [
            {'id': 'facebook/bart-large-cnn', 'name': 'BART-large-CNN', 'description': 'Facebook\'s BART model fine-tuned on CNN articles'},
            {'id': 'sshleifer/distilbart-cnn-12-6', 'name': 'DistilBART-CNN', 'description': 'Distilled version of BART fine-tuned on CNN articles'}
        ],
        'translation': [
            {'id': 't5-small', 'name': 'T5-small', 'description': 'Google\'s T5 model for translation and summarization'},
            {'id': 'Helsinki-NLP/opus-mt-en-fr', 'name': 'Opus MT (En-Fr)', 'description': 'Opus MT model for English to French translation'}
        ],
        'question-answering': [
            {'id': 'deepset/roberta-base-squad2', 'name': 'RoBERTa for QA', 'description': 'RoBERTa fine-tuned on SQuAD 2.0 for question answering'},
            {'id': 'distilbert-base-cased-distilled-squad', 'name': 'DistilBERT for QA', 'description': 'Distilled BERT fine-tuned on SQuAD for question answering'}
        ]
    }
    
    return jsonify({"models": recommended_models})

@pipeline_api.route('/pipeline/tasks', methods=['GET'])
def get_available_tasks():
    """
    Get a list of available pipeline tasks
    
    Returns:
        JSON response with available tasks
    """
    # Define available tasks with descriptions
    available_tasks = [
        {'id': 'text-generation', 'name': 'Text Generation', 'description': 'Generate text from a prompt'},
        {'id': 'sentiment-analysis', 'name': 'Sentiment Analysis', 'description': 'Analyze the sentiment of text'},
        {'id': 'summarization', 'name': 'Summarization', 'description': 'Summarize long text into shorter text'},
        {'id': 'translation', 'name': 'Translation', 'description': 'Translate text from one language to another'},
        {'id': 'question-answering', 'name': 'Question Answering', 'description': 'Answer questions based on context'}
    ]
    
    return jsonify({"tasks": available_tasks})

@pipeline_api.route('/pipeline/clear-cache', methods=['POST'])
def clear_pipeline_cache():
    """
    Clear the pipeline cache to free up memory
    
    Returns:
        JSON response indicating success
    """
    global pipeline_cache
    
    # Count cached pipelines
    cache_count = len(pipeline_cache)
    
    # Clear cache
    pipeline_cache = {}
    
    # Force garbage collection
    import gc
    gc.collect()
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    
    return jsonify({
        "success": True,
        "message": f"Cleared {cache_count} pipelines from cache"
    })
