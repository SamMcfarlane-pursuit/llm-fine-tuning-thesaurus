from inference import load_model, get_synonyms, get_hypernyms, get_hyponyms, get_related_terms, get_definition

def test_model():
    print("Loading model...")
    model, tokenizer = load_model()
    
    test_words = ["machine", "learning", "algorithm", "data", "network"]
    
    for word in test_words:
        print(f"\nTesting word: '{word}'")
        
        print("Synonyms:")
        synonyms = get_synonyms(model, tokenizer, word)
        print(synonyms)
        
        print("Hypernyms:")
        hypernyms = get_hypernyms(model, tokenizer, word)
        print(hypernyms)
        
        print("Hyponyms:")
        hyponyms = get_hyponyms(model, tokenizer, word)
        print(hyponyms)
        
        print("Related terms:")
        related = get_related_terms(model, tokenizer, word)
        print(related)
        
        print("Definition:")
        definition = get_definition(model, tokenizer, word)
        print(definition)

if __name__ == "__main__":
    test_model()
