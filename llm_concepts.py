"""
LLM Fine-Tuning Concepts Visualization.
This module provides tools for visualizing LLM fine-tuning concepts in a thesaurus-like format.
"""
import networkx as nx
import matplotlib.pyplot as plt
from pyvis.network import Network
import json
import os

class LLMConceptsVisualizer:
    """
    A class to visualize LLM fine-tuning concepts in a thesaurus-like format.
    """

    def __init__(self):
        """Initialize the LLM concepts visualizer."""
        self.graph = nx.Graph()
        self.concepts = self._load_concepts()
        self._build_graph()

    def _load_concepts(self):
        """
        Load LLM fine-tuning concepts and their relationships.

        Returns:
            dict: Dictionary of concepts and their relationships
        """
        # Define the concepts and their relationships
        # This could be loaded from a JSON file in a real application
        concepts = {
            "LLM Fine-Tuning": {
                "description": "The process of adapting a pre-trained language model for specific tasks.",
                "related_concepts": [
                    "Pre-trained Models", "Parameter-Efficient Fine-Tuning", "Training Data",
                    "Hyperparameters", "Evaluation Metrics", "Inference"
                ],
                "color": "red",
                "size": 25
            },
            "Pre-trained Models": {
                "description": "Large language models that have been trained on vast amounts of text data.",
                "related_concepts": [
                    "LLM Fine-Tuning", "Model Architecture", "GPT", "BERT", "T5"
                ],
                "color": "blue",
                "size": 20
            },
            "Parameter-Efficient Fine-Tuning": {
                "description": "Techniques to fine-tune LLMs with fewer trainable parameters.",
                "related_concepts": [
                    "LLM Fine-Tuning", "LoRA", "Prefix Tuning", "Adapter Layers", "Prompt Tuning"
                ],
                "color": "green",
                "size": 20
            },
            "LoRA": {
                "description": "Low-Rank Adaptation - a PEFT method that adds low-rank matrices to model weights.",
                "related_concepts": [
                    "Parameter-Efficient Fine-Tuning", "Rank Decomposition", "Attention Layers"
                ],
                "color": "purple",
                "size": 18
            },
            "Training Data": {
                "description": "The dataset used to fine-tune the model for a specific task.",
                "related_concepts": [
                    "LLM Fine-Tuning", "Data Preparation", "Instruction Tuning", "Data Augmentation"
                ],
                "color": "orange",
                "size": 20
            },
            "Hyperparameters": {
                "description": "Parameters that control the fine-tuning process.",
                "related_concepts": [
                    "LLM Fine-Tuning", "Learning Rate", "Batch Size", "Training Steps", "Weight Decay"
                ],
                "color": "cyan",
                "size": 18
            },
            "Evaluation Metrics": {
                "description": "Measures to assess the performance of fine-tuned models.",
                "related_concepts": [
                    "LLM Fine-Tuning", "Perplexity", "BLEU Score", "ROUGE", "Accuracy"
                ],
                "color": "magenta",
                "size": 18
            },
            "Inference": {
                "description": "Using the fine-tuned model to generate outputs for new inputs.",
                "related_concepts": [
                    "LLM Fine-Tuning", "Text Generation", "Sampling Strategies", "Beam Search"
                ],
                "color": "brown",
                "size": 18
            },
            "GPT": {
                "description": "Generative Pre-trained Transformer - a family of autoregressive language models.",
                "related_concepts": [
                    "Pre-trained Models", "Transformer", "Autoregressive Models"
                ],
                "color": "lightblue",
                "size": 15
            },
            "BERT": {
                "description": "Bidirectional Encoder Representations from Transformers - a family of encoder-only models.",
                "related_concepts": [
                    "Pre-trained Models", "Transformer", "Masked Language Modeling"
                ],
                "color": "lightblue",
                "size": 15
            },
            "T5": {
                "description": "Text-to-Text Transfer Transformer - a family of encoder-decoder models.",
                "related_concepts": [
                    "Pre-trained Models", "Transformer", "Encoder-Decoder Models"
                ],
                "color": "lightblue",
                "size": 15
            },
            "Prefix Tuning": {
                "description": "A PEFT method that prepends trainable prefix vectors to hidden states.",
                "related_concepts": [
                    "Parameter-Efficient Fine-Tuning", "Continuous Prompts"
                ],
                "color": "lightgreen",
                "size": 15
            },
            "Adapter Layers": {
                "description": "A PEFT method that adds small trainable modules between layers of the model.",
                "related_concepts": [
                    "Parameter-Efficient Fine-Tuning", "Bottleneck Architecture"
                ],
                "color": "lightgreen",
                "size": 15
            },
            "Prompt Tuning": {
                "description": "A PEFT method that optimizes continuous prompt embeddings.",
                "related_concepts": [
                    "Parameter-Efficient Fine-Tuning", "Soft Prompts"
                ],
                "color": "lightgreen",
                "size": 15
            },
            "Data Preparation": {
                "description": "The process of cleaning, formatting, and organizing data for fine-tuning.",
                "related_concepts": [
                    "Training Data", "Tokenization", "Data Cleaning"
                ],
                "color": "lightorange",
                "size": 15
            },
            "Instruction Tuning": {
                "description": "Fine-tuning models on instruction-response pairs to follow user instructions.",
                "related_concepts": [
                    "Training Data", "RLHF", "Instruction-Following"
                ],
                "color": "lightorange",
                "size": 15
            },
            "Learning Rate": {
                "description": "A hyperparameter that controls how much to adjust model weights during training.",
                "related_concepts": [
                    "Hyperparameters", "Learning Rate Schedulers"
                ],
                "color": "lightcyan",
                "size": 12
            },
            "Batch Size": {
                "description": "A hyperparameter that controls how many samples to process before updating model weights.",
                "related_concepts": [
                    "Hyperparameters", "Gradient Accumulation"
                ],
                "color": "lightcyan",
                "size": 12
            },
            "Perplexity": {
                "description": "A metric that measures how well a model predicts a sample of text.",
                "related_concepts": [
                    "Evaluation Metrics", "Language Modeling"
                ],
                "color": "lightmagenta",
                "size": 12
            },
            "Text Generation": {
                "description": "The process of generating new text using a language model.",
                "related_concepts": [
                    "Inference", "Temperature", "Top-k Sampling", "Top-p Sampling"
                ],
                "color": "lightbrown",
                "size": 15
            },
            "Transformer": {
                "description": "A neural network architecture based on self-attention mechanisms.",
                "related_concepts": [
                    "GPT", "BERT", "T5", "Attention Mechanism", "Self-Attention"
                ],
                "color": "yellow",
                "size": 18
            }
        }

        return concepts

    def _build_graph(self):
        """Build the graph of LLM fine-tuning concepts."""
        # Add nodes
        for concept, data in self.concepts.items():
            self.graph.add_node(
                concept,
                description=data["description"],
                color=data["color"],
                size=data["size"]
            )

        # Add edges
        for concept, data in self.concepts.items():
            for related in data["related_concepts"]:
                if related in self.concepts:  # Only add edges to concepts we've defined
                    self.graph.add_edge(concept, related)

    def visualize_matplotlib(self, figsize=(15, 15), save_path=None):
        """
        Visualize the LLM concepts graph using matplotlib.

        Args:
            figsize (tuple): Figure size
            save_path (str, optional): Path to save the visualization

        Returns:
            matplotlib.figure.Figure: The figure object
        """
        # Create a figure
        plt.figure(figsize=figsize)

        # Get node colors and sizes
        node_colors = [self.graph.nodes[node]["color"] for node in self.graph.nodes()]
        node_sizes = [self.graph.nodes[node]["size"] * 50 for node in self.graph.nodes()]

        # Create a layout for the graph
        pos = nx.spring_layout(self.graph, seed=42, k=0.3)

        # Draw the graph
        nx.draw_networkx_nodes(self.graph, pos, node_color=node_colors, node_size=node_sizes, alpha=0.8)
        nx.draw_networkx_edges(self.graph, pos, width=1.5, alpha=0.7, edge_color="gray")
        nx.draw_networkx_labels(self.graph, pos, font_size=10, font_family='sans-serif')

        plt.axis('off')
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, format='png', dpi=300, bbox_inches='tight')

        return plt.gcf()

    def visualize_interactive(self, height='800px', width='100%', save_path=None):
        """
        Create an interactive visualization of LLM concepts using pyvis.

        Args:
            height (str): Height of the visualization
            width (str): Width of the visualization
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height=height, width=width, notebook=False, directed=False)

        # Add nodes
        for node in self.graph.nodes():
            net.add_node(
                node,
                label=node,
                title=self.graph.nodes[node]["description"],
                color=self.graph.nodes[node]["color"],
                size=self.graph.nodes[node]["size"] * 2,
                font={'size': 16, 'face': 'Arial'}
            )

        # Add edges
        for edge in self.graph.edges():
            net.add_edge(edge[0], edge[1], color="gray", width=2)

        # Set physics layout for better filling of the screen
        net.barnes_hut(
            gravity=-80000,
            central_gravity=0.3,
            spring_length=250,
            spring_strength=0.01,
            damping=0.09,
            overlap=0.1
        )

        # Add zoom options and other interactive features
        options = {
            "interaction": {
                "hover": True,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True,
                "keyboard": True
            },
            "physics": {
                "stabilization": {
                    "iterations": 100,
                    "fit": True  # This helps fill the container
                }
            },
            "layout": {
                "improvedLayout": True,
                "hierarchical": {
                    "enabled": False
                }
            }
        }
        net.set_options(json.dumps(options))

        # Generate the HTML with the network object exposed globally
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>LLM Concepts Visualization</title>
            <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vis-network@9.1.2/dist/vis-network.min.js"></script>
            <style type="text/css">
                #mynetwork {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    border: none;
                    background-color: #ffffff;
                }
                body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                .vis-tooltip {
                    position: absolute;
                    visibility: hidden;
                    padding: 5px;
                    white-space: nowrap;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    color: #000000;
                    background-color: #f5f5f5;
                    border-radius: 3px;
                    border: 1px solid #808080;
                    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
                    max-width: 300px;
                    word-wrap: break-word;
                    z-index: 900;
                }
            </style>
        </head>
        <body>
            <div id="mynetwork"></div>
            <script type="text/javascript">
                // Initialize the network
                var container = document.getElementById('mynetwork');
                var data = {NETWORK_DATA};
                var options = {NETWORK_OPTIONS};
                var network = new vis.Network(container, data, options);

                // Make the network object globally accessible
                window.network = network;

                // Fit the network to the container on load
                network.once("afterDrawing", function() {
                    setTimeout(function() {
                        network.fit({
                            animation: {
                                duration: 1000,
                                easingFunction: 'easeInOutQuad'
                            }
                        });
                    }, 200);
                });

                // Add click event to nodes
                network.on("click", function(params) {
                    if (params.nodes.length > 0) {
                        var nodeId = params.nodes[0];
                        window.parent.location.href = '/concept/' + encodeURIComponent(nodeId);
                    }
                });

                // Prevent errors when iframe is reloaded
                window.addEventListener('unload', function() {
                    if (network) {
                        try {
                            network.destroy();
                        } catch (e) {
                            console.log('Network already destroyed');
                        }
                    }
                });
            </script>
        </body>
        </html>
        """

        # Replace placeholders with actual data
        nodes_data = []
        for node in self.graph.nodes():
            nodes_data.append({
                'id': node,
                'label': node,
                'color': self.graph.nodes[node].get('color', '#97c2fc'),
                'size': self.graph.nodes[node].get('size', 25) * 2,
                'title': self.graph.nodes[node].get('description', '')
            })

        edges_data = []
        for edge in self.graph.edges():
            edges_data.append({
                'from': edge[0],
                'to': edge[1],
                'color': '#848484',
                'width': 2
            })

        network_data = json.dumps({
            "nodes": nodes_data,
            "edges": edges_data
        })
        network_options = json.dumps(options)

        html_content = html_template.replace("{NETWORK_DATA}", network_data).replace("{NETWORK_OPTIONS}", network_options)

        # Save the HTML file
        if save_path:
            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            return save_path
        else:
            temp_path = "llm_concepts_visualization.html"
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            return temp_path

    def get_concept_info(self, concept):
        """
        Get information about a specific concept.

        Args:
            concept (str): The concept to get information about

        Returns:
            dict: Information about the concept
        """
        if concept in self.concepts:
            return {
                "name": concept,
                "description": self.concepts[concept]["description"],
                "related_concepts": self.concepts[concept]["related_concepts"]
            }
        else:
            return None

    def get_all_concepts(self):
        """
        Get a list of all concepts.

        Returns:
            list: List of all concept names
        """
        return list(self.concepts.keys())

    def create_web_visualization(self, output_dir='static/visualizations'):
        """
        Create a standalone HTML visualization for web display.

        Args:
            output_dir (str): Directory to save the visualization

        Returns:
            str: Path to the generated HTML file
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Create the visualization
        output_path = os.path.join(output_dir, 'llm_concepts.html')
        self.visualize_interactive(save_path=output_path)

        return output_path

# Example usage
if __name__ == "__main__":
    # Create a visualizer
    visualizer = LLMConceptsVisualizer()

    # Create and save visualizations
    visualizer.visualize_matplotlib(save_path="llm_concepts.png")
    visualizer.visualize_interactive(save_path="llm_concepts.html")

    print("Visualizations created for LLM fine-tuning concepts")
