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

def generate_response(model, tokenizer, instruction, max_new_tokens=100):
    """Generate a response for a given instruction"""
    prompt = f"### Instruction: {instruction}\n\n### Response:"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            inputs["input_ids"],
            max_new_tokens=max_new_tokens,
            do_sample=True,
            top_p=0.9,
            temperature=0.7,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Decode the response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the response part (if possible)
    if "### Response:" in response:
        response = response.split("### Response:")[1].strip()
    
    return response

def test_qlora_queries():
    """Test the model with QLoRA-related queries"""
    model, tokenizer = load_model()
    
    test_queries = [
        "What is QLoRA?",
        "What are the benefits of QLoRA compared to LoRA?",
        "How does quantization work in QLoRA?",
        "What are the memory requirements for QLoRA?",
        "What is the difference between 4-bit and 8-bit quantization?",
    ]
    
    print("Testing QLoRA-related queries...\n")
    
    for query in test_queries:
        print(f"Query: {query}")
        response = generate_response(model, tokenizer, query)
        print(f"Response: {response}\n")
        print("-" * 50)

if __name__ == "__main__":
    test_qlora_queries()
