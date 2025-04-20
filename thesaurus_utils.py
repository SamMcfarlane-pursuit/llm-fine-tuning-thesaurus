"""
Utility functions for the thesaurus application.
"""
import torch
from transformers import pipeline

class ThesaurusLLM:
    """
    A class to handle thesaurus operations using a fine-tuned LLM.
    """
    
    def __init__(self, model_path, device=None):
        """
        Initialize the ThesaurusLLM with a fine-tuned model.
        
        Args:
            model_path (str): Path to the fine-tuned model
            device (str, optional): Device to run the model on ('cpu', 'cuda', etc.)
        """
        if device is None:
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        self.device = device
        self.generator = pipeline(
            "text-generation",
            model=model_path,
            device=device
        )
    
    def get_synonyms(self, word, max_length=100, num_return_sequences=1):
        """
        Get synonyms for a given word.
        
        Args:
            word (str): The word to find synonyms for
            max_length (int): Maximum length of the generated text
            num_return_sequences (int): Number of different outputs to generate
            
        Returns:
            list: List of synonyms
        """
        prompt = f"List synonyms for the word '{word}'."
        
        outputs = self.generator(
            prompt,
            max_length=max_length,
            num_return_sequences=num_return_sequences,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        # Process the output to extract synonyms
        response = outputs[0]['generated_text']
        
        # Remove the prompt from the response
        response = response.replace(prompt, "").strip()
        
        # Extract the synonyms
        try:
            # Try to extract the list part after the colon
            synonyms_text = response.split(":")[-1].strip()
            synonyms = [s.strip() for s in synonyms_text.split(",")]
            return [s for s in synonyms if s]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]
    
    def get_antonyms(self, word, max_length=100):
        """
        Get antonyms for a given word.
        
        Args:
            word (str): The word to find antonyms for
            max_length (int): Maximum length of the generated text
            
        Returns:
            list: List of antonyms
        """
        prompt = f"What are the antonyms of '{word}'?"
        
        output = self.generator(
            prompt,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']
        
        # Remove the prompt from the response
        response = output.replace(prompt, "").strip()
        
        # Extract the antonyms
        try:
            # Try to extract the list part after the colon
            antonyms_text = response.split(":")[-1].strip()
            antonyms = [a.strip() for a in antonyms_text.split(",")]
            return [a for a in antonyms if a]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]
    
    def get_related_terms(self, word, relation_type="hypernyms", max_length=100):
        """
        Get related terms (hypernyms or hyponyms) for a given word.
        
        Args:
            word (str): The word to find related terms for
            relation_type (str): Type of relation ('hypernyms' or 'hyponyms')
            max_length (int): Maximum length of the generated text
            
        Returns:
            list: List of related terms
        """
        if relation_type == "hypernyms":
            prompt = f"What are more general terms (hypernyms) for '{word}'?"
        else:  # hyponyms
            prompt = f"What are more specific terms (hyponyms) for '{word}'?"
        
        output = self.generator(
            prompt,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']
        
        # Remove the prompt from the response
        response = output.replace(prompt, "").strip()
        
        # Extract the related terms
        try:
            # Try to extract the list part after the colon
            terms_text = response.split(":")[-1].strip()
            terms = [t.strip() for t in terms_text.split(",")]
            return [t for t in terms if t]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]
    
    def answer_question(self, question, max_length=200):
        """
        Answer a thesaurus-related question.
        
        Args:
            question (str): The question to answer
            max_length (int): Maximum length of the generated text
            
        Returns:
            str: The answer to the question
        """
        output = self.generator(
            question,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']
        
        # Remove the question from the response
        response = output.replace(question, "").strip()
        
        return response
