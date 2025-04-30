"""
Script to regenerate the thesaurus visualization.
"""
import os
from visual_thesaurus import VisualThesaurus
from llm_thesaurus import LLMThesaurus

# Create output directory if it doesn't exist
os.makedirs('static/visualizations', exist_ok=True)

# Initialize the visual thesaurus
visual_thesaurus = VisualThesaurus()

# Initialize the LLM thesaurus
llm_thesaurus = LLMThesaurus()

# Test with a domain-specific word
word = "fine-tuning"
domain_graph = llm_thesaurus.build_domain_graph(word)

if domain_graph:
    visual_thesaurus.graph = domain_graph
    vis_path = f'static/visualizations/{word}_thesaurus.html'
    visual_thesaurus.visualize_interactive(save_path=vis_path)
    print(f"Visualization created for '{word}' at {vis_path}")
else:
    print(f"No domain graph found for '{word}'")
