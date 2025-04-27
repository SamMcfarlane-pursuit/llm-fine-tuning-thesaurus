import json
import os
import nltk
from nltk.corpus import wordnet as wn

# Download required NLTK data
nltk.download('wordnet')
nltk.download('omw-1.4')

def get_synonyms_for_word(word):
    """Get synonyms for a word using WordNet"""
    synonyms = []
    for syn in wn.synsets(word):
        for lemma in syn.lemmas():
            if lemma.name() != word and lemma.name() not in synonyms:
                synonyms.append(lemma.name())
    return synonyms[:10]  # Limit to 10 synonyms

def get_hypernyms_for_word(word):
    """Get hypernyms (broader terms) for a word using WordNet"""
    hypernyms = []
    for syn in wn.synsets(word):
        for hyper in syn.hypernyms():
            for lemma in hyper.lemmas():
                if lemma.name() not in hypernyms:
                    hypernyms.append(lemma.name())
    return hypernyms[:10]  # Limit to 10 hypernyms

def get_hyponyms_for_word(word):
    """Get hyponyms (narrower terms) for a word using WordNet"""
    hyponyms = []
    for syn in wn.synsets(word):
        for hypo in syn.hyponyms():
            for lemma in hypo.lemmas():
                if lemma.name() not in hyponyms:
                    hyponyms.append(lemma.name())
    return hyponyms[:10]  # Limit to 10 hyponyms

def get_related_terms(word):
    """Get related terms for a word using WordNet"""
    related = []
    for syn in wn.synsets(word):
        for related_syn in syn.similar_tos():
            for lemma in related_syn.lemmas():
                if lemma.name() not in related:
                    related.append(lemma.name())
    return related[:10]  # Limit to 10 related terms

def create_thesaurus_dataset():
    """
    Create a dataset for fine-tuning with thesaurus data.
    Format: [{"instruction": "Find synonyms for [word]", "input": "", "output": "Synonyms: [list of synonyms]"}, ...]
    """
    dataset = []
    
    # Define a list of words to include in the dataset
    words = [
        "machine", "learning", "model", "data", "algorithm", "neural", "network", "training",
        "computer", "science", "artificial", "intelligence", "deep", "language", "processing",
        "classification", "regression", "clustering", "reinforcement", "supervised", "unsupervised",
        "tensor", "vector", "matrix", "gradient", "descent", "backpropagation", "activation",
        "function", "layer", "weight", "bias", "epoch", "batch", "validation", "test",
        "precision", "recall", "accuracy", "loss", "optimization", "regularization", "dropout",
        "convolution", "recurrent", "transformer", "attention", "embedding", "tokenization",
        "fine-tuning", "transfer", "generative", "discriminative", "ensemble", "feature"
    ]
    
    # Add synonym finding examples
    for word in words:
        synonyms = get_synonyms_for_word(word)
        if synonyms:
            dataset.append({
                "instruction": f"Find synonyms for the word '{word}'.",
                "input": "",
                "output": f"Synonyms: {', '.join(synonyms)}"
            })
    
    # Add hypernym/hyponym examples
    for word in words:
        hypernyms = get_hypernyms_for_word(word)
        if hypernyms:
            dataset.append({
                "instruction": f"Find broader terms (hypernyms) for the word '{word}'.",
                "input": "",
                "output": f"Broader terms: {', '.join(hypernyms)}"
            })
        
        hyponyms = get_hyponyms_for_word(word)
        if hyponyms:
            dataset.append({
                "instruction": f"Find narrower terms (hyponyms) for the word '{word}'.",
                "input": "",
                "output": f"Narrower terms: {', '.join(hyponyms)}"
            })
    
    # Add relationship examples
    for word in words:
        related = get_related_terms(word)
        if related:
            dataset.append({
                "instruction": f"Find terms related to '{word}'.",
                "input": "",
                "output": f"Related terms: {', '.join(related)}"
            })
    
    # Add definition examples
    for word in words:
        definitions = []
        for syn in wn.synsets(word):
            if syn.definition() not in definitions:
                definitions.append(syn.definition())
        
        if definitions:
            dataset.append({
                "instruction": f"Define the word '{word}'.",
                "input": "",
                "output": f"Definitions:\n" + "\n".join([f"- {d}" for d in definitions[:3]])
            })
    
    # Save dataset
    os.makedirs("data", exist_ok=True)
    with open("data/thesaurus_dataset.json", "w") as f:
        json.dump(dataset, f, indent=2)
    
    print(f"Created dataset with {len(dataset)} examples")
    return dataset

if __name__ == "__main__":
    create_thesaurus_dataset()
