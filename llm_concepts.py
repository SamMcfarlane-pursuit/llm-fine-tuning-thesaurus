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
                    "Parameter-Efficient Fine-Tuning", "QLoRA", "Rank Decomposition", "Attention Layers"
                ],
                "color": "purple",
                "size": 18
            },
            "QLoRA": {
                "description": "Quantized Low-Rank Adaptation - combines 4-bit quantization with LoRA for memory-efficient fine-tuning.",
                "related_concepts": [
                    "LoRA", "Parameter-Efficient Fine-Tuning", "Quantization", "Memory Efficiency"
                ],
                "color": "darkviolet",
                "size": 18
            },
            "Quantization": {
                "description": "Technique to reduce model precision (e.g., from 32-bit to 4-bit) to decrease memory usage.",
                "related_concepts": [
                    "QLoRA", "Memory Efficiency", "Model Compression"
                ],
                "color": "slateblue",
                "size": 15
            },
            "Memory Efficiency": {
                "description": "Techniques to reduce the memory footprint of LLMs during training and inference.",
                "related_concepts": [
                    "QLoRA", "Quantization", "Gradient Checkpointing", "Model Compression"
                ],
                "color": "mediumslateblue",
                "size": 15
            },
            "Model Compression": {
                "description": "Techniques to reduce model size while preserving performance, including pruning, distillation, and quantization.",
                "related_concepts": [
                    "Memory Efficiency", "Quantization", "Knowledge Distillation", "Pruning"
                ],
                "color": "royalblue",
                "size": 15
            },
            "Gradient Checkpointing": {
                "description": "Memory optimization technique that trades computation for memory by recomputing activations during backpropagation.",
                "related_concepts": [
                    "Memory Efficiency", "Backpropagation", "Training Optimization"
                ],
                "color": "cornflowerblue",
                "size": 12
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
            },
            "Attention Mechanism": {
                "description": "A mechanism that allows models to focus on different parts of the input when generating outputs, crucial for transformer architectures.",
                "related_concepts": [
                    "Transformer", "Self-Attention", "Multi-Head Attention", "GPT", "BERT"
                ],
                "color": "#4cc9f0",
                "size": 18
            },
            "Self-Attention": {
                "description": "A type of attention mechanism where the model attends to different positions within the same sequence to compute a representation.",
                "related_concepts": [
                    "Attention Mechanism", "Transformer", "Multi-Head Attention"
                ],
                "color": "#4361ee",
                "size": 15
            },
            "Multi-Head Attention": {
                "description": "A technique that runs multiple attention mechanisms in parallel, allowing the model to focus on different parts of the input simultaneously.",
                "related_concepts": [
                    "Attention Mechanism", "Self-Attention", "Transformer"
                ],
                "color": "#3a86ff",
                "size": 15
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

        # Add nodes with enhanced styling for maximum visibility
        for node in self.graph.nodes():
            # Check if this is the central node (fine-tuning)
            is_central = node.lower() in ["llm fine-tuning", "fine-tuning", "fine tuning", "finetuning"]

            # Set enhanced styling based on node type
            if is_central:
                # Central node styling with maximum visibility
                net.add_node(
                    node,
                    label=node,
                    title=self.graph.nodes[node]["description"],
                    color={
                        'background': '#ff00ff', # Bright magenta
                        'border': '#ffffff', # White border
                        'highlight': {
                            'background': '#ff00ff',
                            'border': '#ffffff'
                        },
                        'hover': {
                            'background': '#ff00ff',
                            'border': '#ffffff'
                        }
                    },
                    size=self.graph.nodes[node]["size"] * 3, # Even larger size
                    font={
                        'size': 22, # Larger font size
                        'face': 'Arial',
                        'color': '#ffffff',
                        'bold': True,
                        'strokeWidth': 4, # Text stroke for better visibility
                        'strokeColor': 'rgba(0, 0, 0, 0.8)' # Black stroke
                    },
                    borderWidth=5, # Thicker border
                    shadow={
                        'enabled': True,
                        'color': 'rgba(255, 0, 255, 0.9)', # Stronger shadow
                        'size': 20, # Larger shadow
                        'x': 0,
                        'y': 0
                    }
                )
            else:
                # Regular node styling with enhanced visibility
                net.add_node(
                    node,
                    label=node,
                    title=self.graph.nodes[node]["description"],
                    color={
                        'background': 'rgba(0, 0, 0, 0.95)', # Darker background
                        'border': '#00ffff', # Brighter cyan border
                        'highlight': {
                            'background': 'rgba(0, 0, 0, 1)',
                            'border': '#ffffff'
                        },
                        'hover': {
                            'background': 'rgba(0, 0, 0, 1)',
                            'border': '#ffffff'
                        }
                    },
                    size=self.graph.nodes[node]["size"] * 2.5, # Larger size
                    font={
                        'size': 18, # Larger font size
                        'face': 'Arial',
                        'color': '#ffffff',
                        'bold': True,
                        'strokeWidth': 3, # Text stroke for better visibility
                        'strokeColor': 'rgba(0, 0, 0, 0.8)' # Black stroke
                    },
                    borderWidth=4, # Thicker border
                    shadow={
                        'enabled': True,
                        'color': 'rgba(0, 255, 255, 0.8)', # Stronger shadow
                        'size': 15, # Larger shadow
                        'x': 0,
                        'y': 0
                    }
                )

        # Add edges with enhanced styling for maximum visibility
        for edge in self.graph.edges():
            net.add_edge(
                edge[0],
                edge[1],
                color={
                    'color': 'rgba(255, 0, 255, 1)', # Fully opaque magenta
                    'highlight': 'rgba(255, 255, 255, 1)', # White on highlight
                    'hover': 'rgba(255, 255, 255, 1)' # White on hover
                },
                width=4, # Thicker lines
                selectionWidth=6, # Even thicker when selected
                hoverWidth=5, # Thicker on hover
                smooth={
                    'type': 'dynamic',
                    'forceDirection': 'none',
                    'roundness': 0.5
                },
                shadow={
                    'enabled': True,
                    'color': 'rgba(255, 0, 255, 0.7)',
                    'size': 10,
                    'x': 0,
                    'y': 0
                }
            )

        # Set enhanced physics layout for optimal visualization
        net.barnes_hut(
            gravity=-60000, # Less negative gravity for better spacing
            central_gravity=0.4, # Stronger central gravity to keep nodes closer
            spring_length=200, # Shorter springs for more compact layout
            spring_strength=0.02, # Stronger springs for better stability
            damping=0.09,
            overlap=0.2 # More overlap avoidance
        )

        # Add enhanced zoom options and other interactive features
        options = {
            "interaction": {
                "hover": True,
                "hoverConnectedEdges": True,
                "selectConnectedEdges": True,
                "multiselect": True,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True,
                "keyboard": {
                    "enabled": True,
                    "speed": {
                        "x": 10,
                        "y": 10,
                        "zoom": 0.1
                    },
                    "bindToWindow": False
                },
                "tooltipDelay": 200
            },
            "physics": {
                "stabilization": {
                    "enabled": True,
                    "iterations": 150,
                    "updateInterval": 25,
                    "fit": True  # This helps fill the container
                },
                "barnesHut": {
                    "gravitationalConstant": -80000,
                    "centralGravity": 0.3,
                    "springLength": 250,
                    "springConstant": 0.01,
                    "damping": 0.09,
                    "avoidOverlap": 0.1
                }
            },
            "layout": {
                "improvedLayout": True,
                "hierarchical": {
                    "enabled": False
                }
            },
            "nodes": {
                "shape": "dot",
                "scaling": {
                    "min": 10,
                    "max": 30,
                    "label": {
                        "enabled": True,
                        "min": 14,
                        "max": 24
                    }
                },
                "shadow": {
                    "enabled": True
                }
            },
            "edges": {
                "smooth": {
                    "enabled": True,
                    "type": "dynamic",
                    "roundness": 0.5
                },
                "shadow": {
                    "enabled": True,
                    "size": 3,
                    "x": 0,
                    "y": 0
                }
            }
        }
        net.set_options(json.dumps(options))

        # Generate the HTML with the network object exposed globally
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LLM Fine-Tuning Concepts Map</title>
            <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/vis-network@9.1.2/dist/vis-network.min.js"></script>
            <style type="text/css">
                #mynetwork {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    border: none;
                    background: linear-gradient(135deg, #1a0033, #2d0052);
                    background-image:
                        linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                    overflow: auto;
                    touch-action: pan-x pan-y;
                }
                body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: auto;
                    overscroll-behavior: none; /* Prevent bounce effects */
                    touch-action: manipulation; /* Improve touch handling */
                    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
                }
                .vis-tooltip {
                    position: absolute;
                    visibility: hidden;
                    padding: 12px;
                    white-space: normal;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    background-color: rgba(0, 0, 0, 0.95);
                    border-radius: 8px;
                    border: 2px solid #00e5ff;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 229, 255, 0.4);
                    max-width: 300px;
                    word-wrap: break-word;
                    z-index: 900;
                    line-height: 1.5;
                }
                .vis-network:focus {
                    outline: 3px solid #00e5ff;
                }
                .vis-navigation {
                    background-color: rgba(0, 0, 0, 0.7) !important;
                    border: 1px solid #00e5ff !important;
                    border-radius: 8px !important;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                }
                .vis-button {
                    background-color: rgba(0, 0, 0, 0.8) !important;
                    color: white !important;
                    border: 1px solid #00e5ff !important;
                    border-radius: 4px !important;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
                }
                .vis-button:hover {
                    background-color: rgba(0, 229, 255, 0.3) !important;
                }
                /* Custom zoom controls */
                .zoom-controls {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 100;
                }
                .zoom-btn {
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    border: 2px solid #00e5ff;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                .zoom-btn:hover {
                    background-color: rgba(0, 229, 255, 0.3);
                    transform: translateY(-2px);
                }
                /* Screen reader only text */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border-width: 0;
                }
                /* Loading indicator */
                #loading-indicator {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    color: white;
                    font-family: Arial, sans-serif;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #ff00ff;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <!-- Loading indicator -->
            <div id="loading-indicator" role="status" aria-live="polite">
                <div class="spinner" aria-hidden="true"></div>
                <div>Loading visualization...</div>
            </div>

            <!-- Accessibility description -->
            <div class="sr-only" id="network-description">
                Interactive concept map showing relationships between LLM fine-tuning concepts.
                Use arrow keys to navigate, plus and minus to zoom, and Enter to select a node.
            </div>

            <!-- Main visualization container -->
            <div id="mynetwork" role="application" aria-labelledby="network-description" tabindex="0"></div>

            <!-- Custom zoom controls -->
            <div class="zoom-controls">
                <button class="zoom-btn" id="zoom-in" aria-label="Zoom in">+</button>
                <button class="zoom-btn" id="zoom-out" aria-label="Zoom out">-</button>
                <button class="zoom-btn" id="zoom-reset" aria-label="Reset zoom">⟲</button>
            </div>

            <!-- Screen reader announcer -->
            <div id="sr-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>

            <script type="text/javascript">
                // Initialize the network
                var container = document.getElementById('mynetwork');
                var data = {NETWORK_DATA};
                var options = {NETWORK_OPTIONS};
                var network = new vis.Network(container, data, options);

                // Make the network object globally accessible
                window.network = network;

                // Get UI elements
                const loadingIndicator = document.getElementById('loading-indicator');
                const zoomInBtn = document.getElementById('zoom-in');
                const zoomOutBtn = document.getElementById('zoom-out');
                const zoomResetBtn = document.getElementById('zoom-reset');
                const srAnnouncer = document.getElementById('sr-announcer');

                // Function to announce to screen readers
                function announceToScreenReader(message) {
                    if (srAnnouncer) {
                        srAnnouncer.textContent = message;
                        // Clear after a delay
                        setTimeout(() => {
                            srAnnouncer.textContent = '';
                        }, 3000);
                    }
                }

                // Function to highlight the central node
                function highlightCentralNode(nodeName) {
                    // Find the central node
                    const centralNode = data.nodes.find(node =>
                        node.label.toLowerCase() === nodeName.toLowerCase() ||
                        node.id.toLowerCase() === nodeName.toLowerCase()
                    );

                    if (centralNode) {
                        // Update the node styling with maximum visibility
                        const nodeId = centralNode.id;
                        const updatedNode = {
                            id: nodeId,
                            color: {
                                background: '#ff00ff', // Bright magenta
                                border: '#ffffff', // White border
                                highlight: {
                                    background: '#ff00ff',
                                    border: '#ffffff'
                                },
                                hover: {
                                    background: '#ff00ff',
                                    border: '#ffffff'
                                }
                            },
                            font: {
                                size: 22, // Larger font size
                                color: '#ffffff', // White text
                                face: 'Arial',
                                bold: true,
                                strokeWidth: 4, // Text stroke for better visibility
                                strokeColor: 'rgba(0, 0, 0, 0.8)' // Black stroke
                            },
                            borderWidth: 5, // Thicker border
                            shadow: {
                                enabled: true,
                                color: 'rgba(255, 0, 255, 0.9)', // Stronger shadow
                                size: 20, // Larger shadow
                                x: 0,
                                y: 0
                            },
                            size: 40 // Larger node size
                        };

                        // Update the node
                        data.nodes.update(updatedNode);

                        // Focus on the central node
                        network.focus(nodeId, {
                            scale: 1.2,
                            animation: {
                                duration: 1000,
                                easingFunction: 'easeInOutQuad'
                            }
                        });

                        // Announce to screen readers
                        announceToScreenReader('Visualization centered on ' + nodeName);
                    }
                }

                // Fit the network to the container on load with enhanced animation
                network.once("afterDrawing", function() {
                    setTimeout(function() {
                        network.fit({
                            animation: {
                                duration: 1000,
                                easingFunction: 'easeInOutQuad'
                            }
                        });

                        // Hide loading indicator
                        if (loadingIndicator) {
                            loadingIndicator.style.opacity = '0';
                            setTimeout(() => {
                                loadingIndicator.style.display = 'none';

                                // Announce that the visualization is ready
                                announceToScreenReader('Concept map visualization is now loaded and ready for interaction');

                                // Highlight the central node
                                highlightCentralNode('fine-tuning');
                            }, 500);
                        }

                        // Notify parent window that network is stabilized
                        try {
                            window.parent.postMessage({ action: 'networkStabilized' }, '*');
                        } catch (e) {
                            console.log('Could not notify parent window');
                        }
                    }, 200);
                });

                // Add click event to nodes with enhanced interaction
                network.on("click", function(params) {
                    if (params.nodes.length > 0) {
                        var nodeId = params.nodes[0];

                        // Add visual feedback before navigation
                        var clickedNode = data.nodes.find(node => node.id === nodeId);
                        if (clickedNode) {
                            // Highlight the node
                            network.selectNodes([nodeId]);

                            // Announce to screen readers
                            announceToScreenReader('Selected concept: ' + clickedNode.label);

                            // Notify parent window
                            try {
                                window.parent.postMessage({
                                    action: 'nodeClicked',
                                    nodeId: nodeId,
                                    nodeLabel: clickedNode.label
                                }, '*');
                            } catch (e) {
                                console.log('Could not notify parent window');
                            }

                            // Add a brief delay for visual feedback before navigation
                            setTimeout(function() {
                                window.parent.location.href = '/concept/' + encodeURIComponent(nodeId);
                            }, 300);
                        }
                    }
                });

                // Add hover effects for better user experience
                network.on("hoverNode", function(params) {
                    document.body.style.cursor = 'pointer';

                    // Get connected nodes
                    var connectedNodes = network.getConnectedNodes(params.node);

                    // Highlight connected edges
                    network.selectEdges(network.getConnectedEdges(params.node));

                    // Get node label for screen readers
                    var hoveredNode = data.nodes.find(node => node.id === params.node);
                    if (hoveredNode) {
                        // Update aria-live region for screen readers
                        announceToScreenReader('Hovering over: ' + hoveredNode.label);
                    }
                });

                network.on("blurNode", function(params) {
                    document.body.style.cursor = 'default';

                    // Remove highlights
                    network.selectEdges([]);
                });

                // Add keyboard navigation for accessibility
                container.addEventListener('keydown', function(event) {
                    // Only handle events when the network container is focused
                    if (document.activeElement === container) {
                        let handled = false;

                        switch(event.key) {
                            case '+':
                            case '=':
                                // Zoom in
                                var scale = network.getScale() * 1.2;
                                network.moveTo({scale: scale});
                                announceToScreenReader('Zoomed in');
                                handled = true;
                                break;
                            case '-':
                                // Zoom out
                                var scale = network.getScale() * 0.8;
                                network.moveTo({scale: scale});
                                announceToScreenReader('Zoomed out');
                                handled = true;
                                break;
                            case '0':
                            case 'Home':
                                // Reset zoom
                                network.fit({animation: {duration: 1000, easingFunction: 'easeInOutQuad'}});
                                announceToScreenReader('View reset');
                                handled = true;
                                break;
                            case 'ArrowUp':
                            case 'ArrowDown':
                            case 'ArrowLeft':
                            case 'ArrowRight':
                                // Pan the view
                                const moveOptions = {
                                    'ArrowUp': {y: -50},
                                    'ArrowDown': {y: 50},
                                    'ArrowLeft': {x: -50},
                                    'ArrowRight': {x: 50}
                                };
                                network.moveTo({
                                    position: moveOptions[event.key],
                                    animation: {
                                        duration: 300,
                                        easingFunction: 'easeOutQuad'
                                    }
                                });
                                handled = true;
                                break;
                        }

                        if (handled) {
                            event.preventDefault();
                        }
                    }
                });

                // Set up zoom control buttons
                if (zoomInBtn) {
                    zoomInBtn.addEventListener('click', function() {
                        var scale = network.getScale() * 1.2;
                        network.moveTo({scale: scale});
                        announceToScreenReader('Zoomed in');
                    });
                }

                if (zoomOutBtn) {
                    zoomOutBtn.addEventListener('click', function() {
                        var scale = network.getScale() * 0.8;
                        network.moveTo({scale: scale});
                        announceToScreenReader('Zoomed out');
                    });
                }

                if (zoomResetBtn) {
                    zoomResetBtn.addEventListener('click', function() {
                        network.fit({animation: {duration: 1000, easingFunction: 'easeInOutQuad'}});
                        announceToScreenReader('View reset');
                    });
                }

                // Listen for messages from parent window
                window.addEventListener('message', function(event) {
                    if (event.data.action === 'zoomIn') {
                        var scale = network.getScale() * 1.2;
                        network.moveTo({scale: scale});
                        announceToScreenReader('Zoomed in');
                    } else if (event.data.action === 'zoomOut') {
                        var scale = network.getScale() * 0.8;
                        network.moveTo({scale: scale});
                        announceToScreenReader('Zoomed out');
                    } else if (event.data.action === 'resetZoom') {
                        network.fit({animation: {duration: 1000, easingFunction: 'easeInOutQuad'}});
                        announceToScreenReader('View reset');
                    } else if (event.data.action === 'enhanceNetwork') {
                        // Apply enhanced options if provided
                        if (event.data.options) {
                            network.setOptions(event.data.options);
                        }
                    } else if (event.data.action === 'highlightCentralNode') {
                        if (event.data.nodeName) {
                            highlightCentralNode(event.data.nodeName);
                        }
                    }
                });

                // Handle touch events for better mobile experience
                let touchStartX, touchStartY;
                let touchMoved = false;

                container.addEventListener('touchstart', function(event) {
                    if (event.touches.length === 1) {
                        touchStartX = event.touches[0].clientX;
                        touchStartY = event.touches[0].clientY;
                        touchMoved = false;
                    }
                }, { passive: true });

                container.addEventListener('touchmove', function(event) {
                    if (event.touches.length === 1) {
                        touchMoved = true;
                    }
                }, { passive: true });

                container.addEventListener('touchend', function(event) {
                    // If it was a tap (not a move), focus the container for keyboard navigation
                    if (!touchMoved) {
                        container.focus();
                    }
                }, { passive: true });

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

    def get_visualization_data(self):
        """
        Get visualization data for the LLM concepts graph.

        Returns:
            dict: Visualization data with nodes and edges
        """
        nodes = []
        for node in self.graph.nodes():
            nodes.append({
                'id': node,
                'label': node,
                'color': self.graph.nodes[node].get('color', '#97c2fc'),
                'size': self.graph.nodes[node].get('size', 25) * 2,
                'title': self.graph.nodes[node].get('description', '')
            })

        edges = []
        for edge in self.graph.edges():
            edges.append({
                'from': edge[0],
                'to': edge[1],
                'color': '#848484',
                'width': 2
            })

        return {
            'nodes': nodes,
            'edges': edges
        }

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
