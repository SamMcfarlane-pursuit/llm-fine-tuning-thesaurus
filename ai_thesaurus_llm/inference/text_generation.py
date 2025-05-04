"""
Text generation utilities for AI Thesaurus LLM
"""

import torch
from transformers import TextIteratorStreamer
from threading import Thread

from ..models.config import INFERENCE_CONFIGS

def generate_text(
    model,
    tokenizer,
    prompt,
    inference_config_name="default",
    **kwargs
):
    """
    Generate text using a fine-tuned model
    
    Args:
        model: The model to use for generation
        tokenizer: The tokenizer for the model
        prompt (str): The prompt to generate from
        inference_config_name (str): Name of the inference config from INFERENCE_CONFIGS
        **kwargs: Additional arguments to override the inference config
        
    Returns:
        str: The generated text
    """
    if inference_config_name not in INFERENCE_CONFIGS:
        raise ValueError(f"Inference config {inference_config_name} not found in INFERENCE_CONFIGS")
    
    # Get inference config
    inference_config = INFERENCE_CONFIGS[inference_config_name].copy()
    
    # Override with kwargs
    inference_config.update(kwargs)
    
    # Tokenize prompt
    inputs = tokenizer(prompt, return_tensors="pt")
    input_ids = inputs["input_ids"].to(model.device)
    
    # Generate text
    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids,
            max_new_tokens=inference_config["max_new_tokens"],
            temperature=inference_config["temperature"],
            top_p=inference_config["top_p"],
            top_k=inference_config["top_k"],
            repetition_penalty=inference_config["repetition_penalty"],
            do_sample=inference_config["do_sample"],
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
    
    # Decode and return the generated text
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Remove the prompt from the generated text
    if generated_text.startswith(prompt):
        generated_text = generated_text[len(prompt):]
    
    return generated_text

def generate_text_stream(
    model,
    tokenizer,
    prompt,
    inference_config_name="default",
    **kwargs
):
    """
    Generate text using a fine-tuned model and stream the output
    
    Args:
        model: The model to use for generation
        tokenizer: The tokenizer for the model
        prompt (str): The prompt to generate from
        inference_config_name (str): Name of the inference config from INFERENCE_CONFIGS
        **kwargs: Additional arguments to override the inference config
        
    Returns:
        TextIteratorStreamer: A streamer object that yields generated tokens
    """
    if inference_config_name not in INFERENCE_CONFIGS:
        raise ValueError(f"Inference config {inference_config_name} not found in INFERENCE_CONFIGS")
    
    # Get inference config
    inference_config = INFERENCE_CONFIGS[inference_config_name].copy()
    
    # Override with kwargs
    inference_config.update(kwargs)
    
    # Tokenize prompt
    inputs = tokenizer(prompt, return_tensors="pt")
    input_ids = inputs["input_ids"].to(model.device)
    
    # Create streamer
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
    
    # Generate text in a separate thread
    generation_kwargs = dict(
        input_ids=input_ids,
        max_new_tokens=inference_config["max_new_tokens"],
        temperature=inference_config["temperature"],
        top_p=inference_config["top_p"],
        top_k=inference_config["top_k"],
        repetition_penalty=inference_config["repetition_penalty"],
        do_sample=inference_config["do_sample"],
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id,
        streamer=streamer
    )
    
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()
    
    return streamer

def generate_thesaurus_entries(
    model,
    tokenizer,
    term,
    inference_config_name="default",
    **kwargs
):
    """
    Generate thesaurus entries for a given term
    
    Args:
        model: The model to use for generation
        tokenizer: The tokenizer for the model
        term (str): The term to generate thesaurus entries for
        inference_config_name (str): Name of the inference config from INFERENCE_CONFIGS
        **kwargs: Additional arguments to override the inference config
        
    Returns:
        dict: A dictionary containing synonyms, antonyms, related terms, and definitions
    """
    # Create a prompt for thesaurus generation
    prompt = f"""Generate a comprehensive thesaurus entry for the term "{term}".
    
Format the response as follows:
- Synonyms: [list of synonyms]
- Antonyms: [list of antonyms]
- Related Terms: [list of related terms]
- Definition: [brief definition]
- Usage Examples: [2-3 example sentences]

Thesaurus Entry:
"""
    
    # Generate text
    generated_text = generate_text(
        model,
        tokenizer,
        prompt,
        inference_config_name=inference_config_name,
        **kwargs
    )
    
    # Parse the generated text into a structured format
    result = {
        "term": term,
        "synonyms": [],
        "antonyms": [],
        "related_terms": [],
        "definition": "",
        "examples": []
    }
    
    current_section = None
    
    for line in generated_text.split("\n"):
        line = line.strip()
        
        if line.startswith("- Synonyms:") or line.startswith("Synonyms:"):
            current_section = "synonyms"
            line = line.replace("- Synonyms:", "").replace("Synonyms:", "").strip()
        elif line.startswith("- Antonyms:") or line.startswith("Antonyms:"):
            current_section = "antonyms"
            line = line.replace("- Antonyms:", "").replace("Antonyms:", "").strip()
        elif line.startswith("- Related Terms:") or line.startswith("Related Terms:"):
            current_section = "related_terms"
            line = line.replace("- Related Terms:", "").replace("Related Terms:", "").strip()
        elif line.startswith("- Definition:") or line.startswith("Definition:"):
            current_section = "definition"
            line = line.replace("- Definition:", "").replace("Definition:", "").strip()
        elif line.startswith("- Usage Examples:") or line.startswith("Usage Examples:"):
            current_section = "examples"
            line = line.replace("- Usage Examples:", "").replace("Usage Examples:", "").strip()
        
        if current_section and line and not line.startswith("-"):
            if current_section in ["synonyms", "antonyms", "related_terms"]:
                # Split by commas and clean up
                terms = [t.strip().strip(",.") for t in line.split(",")]
                # Remove empty strings
                terms = [t for t in terms if t]
                result[current_section].extend(terms)
            elif current_section == "definition":
                result["definition"] += " " + line
            elif current_section == "examples":
                if line:
                    result["examples"].append(line)
    
    # Clean up the definition
    result["definition"] = result["definition"].strip()
    
    return result
