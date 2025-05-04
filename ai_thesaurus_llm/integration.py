"""
Integration utilities for connecting the AI Thesaurus LLM with the main application
"""

import os
import torch
from .models.model_loader import load_finetuned_model
from .inference.text_generation import generate_thesaurus_entries

class ThesaurusLLM:
    """
    Main class for integrating the AI Thesaurus LLM with the application
    """
    
    def __init__(self, model_path=None, base_model_name=None, use_auth_token=None, device_map="auto"):
        """
        Initialize the ThesaurusLLM
        
        Args:
            model_path (str, optional): Path to the fine-tuned model
            base_model_name (str, optional): Name of the base model from BASE_MODELS config
            use_auth_token (str, optional): Hugging Face token for gated models
            device_map (str): Device map for model loading
        """
        self.model = None
        self.tokenizer = None
        self.model_path = model_path
        self.base_model_name = base_model_name
        self.use_auth_token = use_auth_token
        self.device_map = device_map
        
        # Load model if model_path is provided
        if model_path:
            self.load_model(model_path, base_model_name, use_auth_token, device_map)
    
    def load_model(self, model_path, base_model_name=None, use_auth_token=None, device_map="auto"):
        """
        Load a fine-tuned model
        
        Args:
            model_path (str): Path to the fine-tuned model
            base_model_name (str, optional): Name of the base model from BASE_MODELS config
            use_auth_token (str, optional): Hugging Face token for gated models
            device_map (str): Device map for model loading
        """
        self.model_path = model_path
        self.base_model_name = base_model_name
        self.use_auth_token = use_auth_token
        self.device_map = device_map
        
        # Load model
        self.model, self.tokenizer = load_finetuned_model(
            adapter_path=model_path,
            base_model_name=base_model_name,
            device_map=device_map,
            use_auth_token=use_auth_token
        )
    
    def generate_entry(self, term, inference_config_name="default", **kwargs):
        """
        Generate a thesaurus entry for the given term
        
        Args:
            term (str): Term to generate a thesaurus entry for
            inference_config_name (str): Name of the inference config from INFERENCE_CONFIGS
            **kwargs: Additional arguments to override the inference config
            
        Returns:
            dict: A dictionary containing synonyms, antonyms, related terms, and definitions
        """
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        return generate_thesaurus_entries(
            model=self.model,
            tokenizer=self.tokenizer,
            term=term,
            inference_config_name=inference_config_name,
            **kwargs
        )
    
    def batch_generate(self, terms, inference_config_name="default", **kwargs):
        """
        Generate thesaurus entries for multiple terms
        
        Args:
            terms (list): List of terms to generate thesaurus entries for
            inference_config_name (str): Name of the inference config from INFERENCE_CONFIGS
            **kwargs: Additional arguments to override the inference config
            
        Returns:
            dict: A dictionary mapping terms to their thesaurus entries
        """
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        results = {}
        
        for term in terms:
            try:
                results[term] = self.generate_entry(term, inference_config_name, **kwargs)
            except Exception as e:
                results[term] = {"error": str(e)}
        
        return results
    
    def unload_model(self):
        """
        Unload the model from memory
        """
        if self.model is not None:
            del self.model
            self.model = None
        
        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None
        
        # Clear CUDA cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

# Create a singleton instance
thesaurus_llm = ThesaurusLLM()

def initialize_thesaurus_llm(model_path, base_model_name=None, use_auth_token=None, device_map="auto"):
    """
    Initialize the ThesaurusLLM singleton
    
    Args:
        model_path (str): Path to the fine-tuned model
        base_model_name (str, optional): Name of the base model from BASE_MODELS config
        use_auth_token (str, optional): Hugging Face token for gated models
        device_map (str): Device map for model loading
    """
    global thesaurus_llm
    thesaurus_llm.load_model(model_path, base_model_name, use_auth_token, device_map)
    return thesaurus_llm

def get_thesaurus_llm():
    """
    Get the ThesaurusLLM singleton
    
    Returns:
        ThesaurusLLM: The ThesaurusLLM singleton
    """
    global thesaurus_llm
    return thesaurus_llm
