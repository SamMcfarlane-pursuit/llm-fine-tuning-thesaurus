"""
LLM Fine-Tuning Thesaurus Module.
This module provides domain-specific relationships for LLM fine-tuning terms.
"""
import networkx as nx
from visual_thesaurus import VisualThesaurus

class LLMThesaurus:
    """
    A specialized thesaurus for LLM fine-tuning and related technical concepts.
    """
    
    def __init__(self):
        """Initialize the LLM thesaurus with domain-specific relationships."""
        self.domain_terms = self._load_domain_terms()
    
    def _load_domain_terms(self):
        """
        Load domain-specific terms and their relationships.
        
        Returns:
            dict: Dictionary of terms and their relationships
        """
        # Define the domain-specific terms and their relationships
        terms = {
            # LLM Core Concepts
            "llm": {
                "synonyms": ["large language model", "language model", "neural language model"],
                "related": ["transformer", "gpt", "bert", "t5", "fine-tuning", "inference", "prompt engineering"],
                "description": "Large Language Model - a type of AI model trained on vast amounts of text data to generate and understand human language."
            },
            "fine-tuning": {
                "synonyms": ["adaptation", "specialized training", "transfer learning"],
                "related": ["llm", "lora", "peft", "hyperparameters", "training data", "base model", "adapter layers"],
                "description": "The process of adapting a pre-trained model for specific tasks by training it on a smaller, task-specific dataset."
            },
            "peft": {
                "synonyms": ["parameter-efficient fine-tuning", "efficient adaptation"],
                "related": ["lora", "prefix tuning", "prompt tuning", "adapter layers", "fine-tuning"],
                "description": "Parameter-Efficient Fine-Tuning - techniques to fine-tune LLMs with fewer trainable parameters."
            },
            "lora": {
                "synonyms": ["low-rank adaptation", "rank decomposition"],
                "related": ["peft", "fine-tuning", "adapter layers", "rank", "attention layers"],
                "description": "Low-Rank Adaptation - a PEFT method that adds trainable low-rank matrices to model weights."
            },
            
            # Training Concepts
            "training data": {
                "synonyms": ["dataset", "training corpus", "fine-tuning data"],
                "related": ["fine-tuning", "data preparation", "data augmentation", "instruction tuning"],
                "description": "The dataset used to fine-tune a model for a specific task."
            },
            "hyperparameters": {
                "synonyms": ["training parameters", "model configuration"],
                "related": ["learning rate", "batch size", "epochs", "weight decay", "fine-tuning"],
                "description": "Parameters that control the fine-tuning process and model behavior."
            },
            "learning rate": {
                "synonyms": ["step size", "alpha"],
                "related": ["hyperparameters", "optimizer", "learning rate scheduler"],
                "description": "A hyperparameter that controls how much to adjust model weights during training."
            },
            "batch size": {
                "synonyms": ["mini-batch size", "training batch"],
                "related": ["hyperparameters", "gradient accumulation", "memory usage"],
                "description": "A hyperparameter that controls how many samples to process before updating model weights."
            },
            
            # Model Architecture
            "transformer": {
                "synonyms": ["attention-based model", "self-attention model"],
                "related": ["attention mechanism", "encoder", "decoder", "llm", "gpt", "bert"],
                "description": "A neural network architecture based on self-attention mechanisms, forming the basis of modern LLMs."
            },
            "attention mechanism": {
                "synonyms": ["self-attention", "multi-head attention"],
                "related": ["transformer", "encoder", "decoder", "attention layers"],
                "description": "A mechanism that allows models to focus on different parts of the input when generating output."
            },
            "encoder": {
                "synonyms": ["transformer encoder", "encoding layer"],
                "related": ["transformer", "bert", "attention mechanism", "decoder"],
                "description": "The part of a transformer that processes the input sequence."
            },
            "decoder": {
                "synonyms": ["transformer decoder", "decoding layer"],
                "related": ["transformer", "gpt", "attention mechanism", "encoder"],
                "description": "The part of a transformer that generates the output sequence."
            },
            
            # Deployment & Infrastructure
            "container": {
                "synonyms": ["software container", "application container"],
                "related": ["docker", "kubernetes", "deployment", "containerization", "infrastructure"],
                "description": "A lightweight, standalone executable package that includes everything needed to run a piece of software."
            },
            "docker": {
                "synonyms": ["docker container", "docker platform"],
                "related": ["container", "dockerfile", "docker image", "kubernetes", "deployment"],
                "description": "A platform for developing, shipping, and running applications in containers."
            },
            "kubernetes": {
                "synonyms": ["k8s", "container orchestration"],
                "related": ["docker", "container", "deployment", "scaling", "infrastructure"],
                "description": "An open-source system for automating deployment, scaling, and management of containerized applications."
            },
            "deployment": {
                "synonyms": ["model deployment", "production deployment"],
                "related": ["docker", "kubernetes", "inference", "api", "container", "scaling"],
                "description": "The process of making a trained model available for use in a production environment."
            },
            "inference": {
                "synonyms": ["model inference", "prediction", "generation"],
                "related": ["deployment", "api", "latency", "throughput", "quantization"],
                "description": "Using a trained model to generate predictions or outputs for new inputs."
            },
            
            # Optimization Techniques
            "quantization": {
                "synonyms": ["model quantization", "weight quantization"],
                "related": ["optimization", "inference", "int8", "int4", "deployment"],
                "description": "The process of reducing the precision of model weights to improve performance and reduce memory usage."
            },
            "pruning": {
                "synonyms": ["model pruning", "weight pruning"],
                "related": ["optimization", "sparsity", "quantization", "model compression"],
                "description": "Removing unnecessary weights from a model to reduce its size and improve efficiency."
            },
            "distillation": {
                "synonyms": ["knowledge distillation", "model distillation"],
                "related": ["optimization", "teacher-student", "model compression"],
                "description": "Training a smaller model (student) to mimic the behavior of a larger model (teacher)."
            }
        }
        
        return terms
    
    def get_domain_relationships(self, word):
        """
        Get domain-specific relationships for a word.
        
        Args:
            word (str): The word to get relationships for
            
        Returns:
            dict: Dictionary of relationships or None if not found
        """
        # Normalize the word
        word_lower = word.lower()
        
        # Check if the word is in our domain terms
        if word_lower in self.domain_terms:
            return self.domain_terms[word_lower]
        
        # Check if the word is a synonym of any domain term
        for term, data in self.domain_terms.items():
            if word_lower in [syn.lower() for syn in data.get("synonyms", [])]:
                return self.domain_terms[term]
        
        return None
    
    def enhance_thesaurus_graph(self, visual_thesaurus, word):
        """
        Enhance a visual thesaurus graph with domain-specific relationships.
        
        Args:
            visual_thesaurus (VisualThesaurus): The visual thesaurus instance
            word (str): The central word
            
        Returns:
            bool: True if the graph was enhanced, False otherwise
        """
        # Check if the word is in our domain terms
        domain_info = self.get_domain_relationships(word)
        if not domain_info:
            return False
        
        # Add domain-specific relationships to the graph
        word_lower = word.lower()
        
        # Add the central word if it doesn't exist
        if not visual_thesaurus.graph.has_node(word_lower):
            visual_thesaurus.graph.add_node(word_lower, label=word, color='red', size=25)
        
        # Add synonyms
        for synonym in domain_info.get("synonyms", []):
            if not visual_thesaurus.graph.has_node(synonym):
                visual_thesaurus.graph.add_node(synonym, label=synonym, color='blue', size=20)
            if not visual_thesaurus.graph.has_edge(word_lower, synonym):
                visual_thesaurus.graph.add_edge(word_lower, synonym, color='blue', label='synonym')
        
        # Add related terms
        for related in domain_info.get("related", []):
            # Get the related term's info if available
            related_info = self.domain_terms.get(related)
            
            if not visual_thesaurus.graph.has_node(related):
                visual_thesaurus.graph.add_node(
                    related, 
                    label=related,
                    color='green', 
                    size=20,
                    description=related_info.get("description", "") if related_info else ""
                )
            if not visual_thesaurus.graph.has_edge(word_lower, related):
                visual_thesaurus.graph.add_edge(word_lower, related, color='green', label='related')
        
        return True
    
    def build_domain_graph(self, word):
        """
        Build a graph for a domain-specific word.
        
        Args:
            word (str): The central word
            
        Returns:
            networkx.Graph: The constructed graph or None if word not found
        """
        # Check if the word is in our domain terms
        domain_info = self.get_domain_relationships(word)
        if not domain_info:
            return None
        
        # Create a new graph
        graph = nx.Graph()
        
        # Add the central word
        word_lower = word.lower()
        graph.add_node(word_lower, label=word, color='red', size=25, description=domain_info.get("description", ""))
        
        # Add synonyms
        for synonym in domain_info.get("synonyms", []):
            graph.add_node(synonym, label=synonym, color='blue', size=20)
            graph.add_edge(word_lower, synonym, color='blue', label='synonym')
        
        # Add related terms
        for related in domain_info.get("related", []):
            # Get the related term's info if available
            related_info = self.domain_terms.get(related)
            
            graph.add_node(
                related, 
                label=related,
                color='green', 
                size=20,
                description=related_info.get("description", "") if related_info else ""
            )
            graph.add_edge(word_lower, related, color='green', label='related')
        
        return graph

# Example usage
if __name__ == "__main__":
    llm_thesaurus = LLMThesaurus()
    visual_thesaurus = VisualThesaurus()
    
    # Test with a domain-specific word
    word = "fine-tuning"
    llm_thesaurus.enhance_thesaurus_graph(visual_thesaurus, word)
    
    # Visualize the graph
    visual_thesaurus.visualize_matplotlib(save_path=f"{word}_thesaurus.png")
    print(f"Visualization created for '{word}'")
