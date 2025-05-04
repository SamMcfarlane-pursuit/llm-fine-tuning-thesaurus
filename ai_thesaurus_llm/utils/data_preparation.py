"""
Data preparation utilities for AI Thesaurus LLM
"""

import json
import os
import random
from datasets import Dataset

def create_thesaurus_prompt(term, synonyms=None, antonyms=None, related_terms=None, definition=None, examples=None):
    """
    Create a prompt for thesaurus entry generation
    
    Args:
        term (str): The term to generate a thesaurus entry for
        synonyms (list, optional): List of synonyms
        antonyms (list, optional): List of antonyms
        related_terms (list, optional): List of related terms
        definition (str, optional): Definition of the term
        examples (list, optional): Usage examples
        
    Returns:
        str: The formatted prompt
    """
    prompt = f"""Generate a comprehensive thesaurus entry for the term "{term}".
    
Format the response as follows:
- Synonyms: [list of synonyms]
- Antonyms: [list of antonyms]
- Related Terms: [list of related terms]
- Definition: [brief definition]
- Usage Examples: [2-3 example sentences]

Thesaurus Entry:
"""
    
    if synonyms:
        prompt += f"- Synonyms: {', '.join(synonyms)}\n"
    if antonyms:
        prompt += f"- Antonyms: {', '.join(antonyms)}\n"
    if related_terms:
        prompt += f"- Related Terms: {', '.join(related_terms)}\n"
    if definition:
        prompt += f"- Definition: {definition}\n"
    if examples:
        prompt += f"- Usage Examples: {'. '.join(examples)}\n"
    
    return prompt

def create_thesaurus_dataset(data, output_path):
    """
    Create a dataset for thesaurus entry generation
    
    Args:
        data (list): List of dictionaries with thesaurus entries
        output_path (str): Path to save the dataset
        
    Returns:
        Dataset: The created dataset
    """
    formatted_data = []
    
    for entry in data:
        term = entry["term"]
        synonyms = entry.get("synonyms", [])
        antonyms = entry.get("antonyms", [])
        related_terms = entry.get("related_terms", [])
        definition = entry.get("definition", "")
        examples = entry.get("examples", [])
        
        # Create prompt
        prompt = create_thesaurus_prompt(term, synonyms, antonyms, related_terms, definition, examples)
        
        # Add to formatted data
        formatted_data.append({
            "text": prompt
        })
    
    # Create dataset
    dataset = Dataset.from_dict({"text": [item["text"] for item in formatted_data]})
    
    # Save dataset
    dataset.save_to_disk(output_path)
    
    # Also save as JSON for easy inspection
    with open(f"{output_path}.json", "w") as f:
        json.dump(formatted_data, f, indent=2)
    
    return dataset

def convert_json_to_dataset(json_path, output_path=None):
    """
    Convert a JSON file to a dataset
    
    Args:
        json_path (str): Path to the JSON file
        output_path (str, optional): Path to save the dataset
        
    Returns:
        Dataset: The created dataset
    """
    # Load JSON data
    with open(json_path, "r") as f:
        data = json.load(f)
    
    # Create dataset
    dataset = Dataset.from_dict({"text": [item["text"] for item in data]})
    
    # Save dataset if output_path is provided
    if output_path:
        dataset.save_to_disk(output_path)
    
    return dataset

def create_instruction_dataset(instructions, output_path):
    """
    Create a dataset for instruction tuning
    
    Args:
        instructions (list): List of dictionaries with instructions and responses
        output_path (str): Path to save the dataset
        
    Returns:
        Dataset: The created dataset
    """
    formatted_data = []
    
    for item in instructions:
        instruction = item["instruction"]
        response = item["response"]
        
        # Format as a prompt
        prompt = f"""### Instruction:
{instruction}

### Response:
{response}"""
        
        # Add to formatted data
        formatted_data.append({
            "text": prompt
        })
    
    # Create dataset
    dataset = Dataset.from_dict({"text": [item["text"] for item in formatted_data]})
    
    # Save dataset
    dataset.save_to_disk(output_path)
    
    # Also save as JSON for easy inspection
    with open(f"{output_path}.json", "w") as f:
        json.dump(formatted_data, f, indent=2)
    
    return dataset
