import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def load_model():
    """Load the fine-tuned model for inference"""
    # Load the fine-tuned model
    model = AutoModelForCausalLM.from_pretrained(
        "./thesaurus_model_final",
        device_map="auto",
    )

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained("./thesaurus_model_final")

    return model, tokenizer

def generate_response(model, tokenizer, instruction, max_new_tokens=256):
    """Generate a response for a given instruction"""
    prompt = f"### Instruction: {instruction}\n\n### Response:"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=max_new_tokens,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
        )

    response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
    return response.strip()

def get_synonyms(model, tokenizer, word):
    """Get synonyms for a word"""
    instruction = f"Find synonyms for the word '{word}'."
    response = generate_response(model, tokenizer, instruction)

    # Parse the response to extract synonyms
    # This is a simple implementation; you might need more robust parsing
    if "Synonyms:" in response:
        synonyms_text = response.split("Synonyms:")[1].strip()
        synonyms = [s.strip() for s in synonyms_text.split(",")]
        return synonyms
    return []

def get_hypernyms(model, tokenizer, word):
    """Get hypernyms (broader terms) for a word"""
    instruction = f"Find broader terms (hypernyms) for the word '{word}'."
    response = generate_response(model, tokenizer, instruction)

    # Parse the response
    if "Broader terms:" in response:
        terms_text = response.split("Broader terms:")[1].strip()
        terms = [t.strip() for t in terms_text.split(",")]
        return terms
    return []

def get_hyponyms(model, tokenizer, word):
    """Get hyponyms (narrower terms) for a word"""
    instruction = f"Find narrower terms (hyponyms) for the word '{word}'."
    response = generate_response(model, tokenizer, instruction)

    # Parse the response
    if "Narrower terms:" in response:
        terms_text = response.split("Narrower terms:")[1].strip()
        terms = [t.strip() for t in terms_text.split(",")]
        return terms
    return []

def get_related_terms(model, tokenizer, word):
    """Get related terms for a word"""
    instruction = f"Find terms related to '{word}'."
    response = generate_response(model, tokenizer, instruction)

    # Parse the response
    if "Related terms:" in response:
        terms_text = response.split("Related terms:")[1].strip()
        terms = [t.strip() for t in terms_text.split(",")]
        return terms
    return []

def get_definition(model, tokenizer, word):
    """Get definition for a word"""
    instruction = f"Define the word '{word}'."
    response = generate_response(model, tokenizer, instruction)

    # Parse the response
    if "Definitions:" in response:
        definitions = response.split("Definitions:")[1].strip()
        return definitions
    return ""

# Example usage
if __name__ == "__main__":
    model, tokenizer = load_model()

    word = "machine"
    print(f"Synonyms for '{word}':", get_synonyms(model, tokenizer, word))
    print(f"Hypernyms for '{word}':", get_hypernyms(model, tokenizer, word))
    print(f"Hyponyms for '{word}':", get_hyponyms(model, tokenizer, word))
    print(f"Related terms for '{word}':", get_related_terms(model, tokenizer, word))
    print(f"Definition for '{word}':", get_definition(model, tokenizer, word))
