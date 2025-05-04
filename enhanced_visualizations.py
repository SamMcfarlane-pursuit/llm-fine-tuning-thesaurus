"""
Enhanced Visualizations for LLM Fine-Tuning Categories.
This module provides specialized, professional visualizations for different categories.
"""
import json
from pyvis.network import Network

class EnhancedVisualizations:
    """
    A class to create professional, category-specific visualizations.
    """

    def __init__(self):
        """Initialize the enhanced visualizations module."""
        self.color_schemes = {
            "deployment": {
                "primary": "#4287f5",  # Blue
                "secondary": "#42c9f5",  # Light Blue
                "accent": "#f542a7",  # Pink
                "background": "#121220",  # Dark Blue-Black
                "text": "#ffffff"  # White
            },
            "optimization": {
                "primary": "#42f5a7",  # Green
                "secondary": "#42f5d9",  # Teal
                "accent": "#f5a742",  # Orange
                "background": "#122018",  # Dark Green-Black
                "text": "#ffffff"  # White
            },
            "architecture": {
                "primary": "#9442f5",  # Purple
                "secondary": "#c942f5",  # Light Purple
                "accent": "#f54242",  # Red
                "background": "#1a1220",  # Dark Purple-Black
                "text": "#ffffff"  # White
            },
            "training": {
                "primary": "#f5d442",  # Yellow
                "secondary": "#f5a742",  # Orange
                "accent": "#42c9f5",  # Light Blue
                "background": "#201e12",  # Dark Yellow-Black
                "text": "#ffffff"  # White
            },
            "hardware": {
                "primary": "#f54242",  # Red
                "secondary": "#f57542",  # Orange-Red
                "accent": "#42f5d9",  # Teal
                "background": "#201212",  # Dark Red-Black
                "text": "#ffffff"  # White
            }
        }

        # Node shapes for different categories
        self.node_shapes = {
            "deployment": "box",
            "optimization": "diamond",
            "architecture": "dot",
            "training": "triangle",
            "hardware": "hexagon"
        }

        # Edge styles for different categories
        self.edge_styles = {
            "deployment": "dash",
            "optimization": "dot",
            "architecture": "arrow",
            "training": "curve",
            "hardware": "solid"
        }

    def get_category_for_concept(self, concept):
        """
        Determine the category for a given concept.

        Args:
            concept (str): The concept to categorize

        Returns:
            str: The category name
        """
        # Mapping of concepts to categories
        category_mapping = {
            # Deployment & Infrastructure
            "container": "deployment",
            "docker": "deployment",
            "kubernetes": "deployment",
            "deployment": "deployment",
            "infrastructure": "deployment",
            "scaling": "deployment",

            # Optimization Techniques
            "quantization": "optimization",
            "pruning": "optimization",
            "distillation": "optimization",
            "optimization": "optimization",
            "compression": "optimization",
            "efficiency": "optimization",
            "qlora": "optimization",
            "nf4": "optimization",

            # Model Architecture
            "transformer": "architecture",
            "attention": "architecture",
            "encoder": "architecture",
            "decoder": "architecture",
            "architecture": "architecture",
            "layers": "architecture",
            "gpt": "architecture",
            "bert": "architecture",

            # Training Concepts
            "hyperparameters": "training",
            "learning rate": "training",
            "batch size": "training",
            "training": "training",
            "fine-tuning": "training",
            "lora": "training",
            "peft": "training",

            # Hardware Acceleration
            "gpu": "hardware",
            "tpu": "hardware",
            "cuda": "hardware",
            "hardware": "hardware",
            "acceleration": "hardware",
            "parallel": "hardware",
            "distributed": "hardware",
            "tensorflow": "hardware",
            "pytorch": "hardware",
            "mixed precision": "hardware",
            "fp16": "hardware",
            "bfloat16": "hardware"
        }

        # Check if the concept is directly in the mapping
        concept_lower = concept.lower()
        if concept_lower in category_mapping:
            return category_mapping[concept_lower]

        # Check if the concept contains any of the category keywords
        for key, category in category_mapping.items():
            if key in concept_lower:
                return category

        # Default to training if no match is found
        return "training"

    def create_deployment_visualization(self, graph, save_path=None):
        """
        Create a specialized visualization for deployment & infrastructure concepts.

        Args:
            graph (networkx.Graph): The graph to visualize
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height="600px", width="100%", bgcolor="#121220", font_color="white")

        # Set physics options for a 3D-like effect
        physics_options = {
            "solver": "forceAtlas2Based",
            "forceAtlas2Based": {
                "gravitationalConstant": -100,
                "centralGravity": 0.01,
                "springLength": 150,
                "springConstant": 0.08,
                "damping": 0.4,
                "avoidOverlap": 1.5
            },
            "stabilization": {
                "enabled": True,
                "iterations": 200
            }
        }

        # Add nodes with container-like styling
        for node in graph.nodes():
            # Determine if this is a central node
            is_central = graph.nodes[node].get('color') == 'red'

            # Create a container-like appearance
            if is_central:
                shape = "box"
                size = 40
                font_size = 18
                border_width = 3
                color = self.color_schemes["deployment"]["accent"]
            else:
                shape = "box"
                size = 30
                font_size = 14
                border_width = 2
                color = self.color_schemes["deployment"]["primary"]

            # Get node description if available
            description = graph.nodes[node].get('description', '')
            tooltip = f"<div style='max-width:300px;'><b>{node}</b><br/>{description}</div>"

            # Add the node
            net.add_node(
                node,
                label=node,
                shape=shape,
                size=size,
                color=color,
                borderWidth=border_width,
                font={'size': font_size, 'color': 'white'},
                title=tooltip
            )

        # Add edges with connection-like styling
        for edge in graph.edges():
            source, target = edge
            # Create a pipeline-like appearance
            width = 2
            color = self.color_schemes["deployment"]["secondary"]
            dashes = True

            # Add the edge
            net.add_edge(source, target, width=width, color=color, dashes=dashes)

        # Set physics options
        net.set_options(json.dumps({
            "physics": physics_options,
            "interaction": {
                "hover": True,
                "tooltipDelay": 100,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True
            },
            "nodes": {
                "font": {
                    "strokeWidth": 3,
                    "strokeColor": "#121220"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            },
            "edges": {
                "smooth": {
                    "type": "continuous",
                    "forceDirection": "none",
                    "roundness": 0.5
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            }
        }))

        # Generate the HTML file
        if save_path:
            net.save_graph(save_path)
        else:
            save_path = "deployment_visualization.html"
            net.save_graph(save_path)

        return save_path

    def create_optimization_visualization(self, graph, save_path=None):
        """
        Create a specialized visualization for optimization techniques.

        Args:
            graph (networkx.Graph): The graph to visualize
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height="600px", width="100%", bgcolor="#122018", font_color="white")

        # Set physics options for a flowing effect
        physics_options = {
            "solver": "hierarchicalRepulsion",
            "hierarchicalRepulsion": {
                "nodeDistance": 150,
                "centralGravity": 0.0,
                "springLength": 200,
                "springConstant": 0.01,
                "damping": 0.09
            },
            "stabilization": {
                "enabled": True,
                "iterations": 150
            }
        }

        # Add nodes with optimization-themed styling
        for node in graph.nodes():
            # Determine if this is a central node
            is_central = graph.nodes[node].get('color') == 'red'

            # Create a gradient-like appearance
            if is_central:
                shape = "diamond"
                size = 35
                font_size = 18
                border_width = 3
                color = {
                    "background": self.color_schemes["optimization"]["accent"],
                    "border": self.color_schemes["optimization"]["primary"],
                    "highlight": {
                        "background": self.color_schemes["optimization"]["accent"],
                        "border": self.color_schemes["optimization"]["secondary"]
                    }
                }
            else:
                shape = "diamond"
                size = 25
                font_size = 14
                border_width = 2
                color = {
                    "background": self.color_schemes["optimization"]["primary"],
                    "border": self.color_schemes["optimization"]["secondary"],
                    "highlight": {
                        "background": self.color_schemes["optimization"]["secondary"],
                        "border": self.color_schemes["optimization"]["accent"]
                    }
                }

            # Get node description if available
            description = graph.nodes[node].get('description', '')
            tooltip = f"<div style='max-width:300px;'><b>{node}</b><br/>{description}</div>"

            # Add the node
            net.add_node(
                node,
                label=node,
                shape=shape,
                size=size,
                color=color,
                borderWidth=border_width,
                font={'size': font_size, 'color': 'white'},
                title=tooltip
            )

        # Add edges with gradient-like styling
        for edge in graph.edges():
            source, target = edge
            # Create a flowing appearance
            width = 2
            color = {
                "color": self.color_schemes["optimization"]["secondary"],
                "highlight": self.color_schemes["optimization"]["accent"],
                "opacity": 0.8
            }

            # Add the edge
            net.add_edge(source, target, width=width, color=color, smooth={"type": "curvedCW", "roundness": 0.2})

        # Set physics options
        net.set_options(json.dumps({
            "physics": physics_options,
            "interaction": {
                "hover": True,
                "tooltipDelay": 100,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True
            },
            "nodes": {
                "font": {
                    "strokeWidth": 3,
                    "strokeColor": "#122018"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            },
            "edges": {
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            }
        }))

        # Generate the HTML file
        if save_path:
            net.save_graph(save_path)
        else:
            save_path = "optimization_visualization.html"
            net.save_graph(save_path)

        return save_path

    def create_architecture_visualization(self, graph, save_path=None):
        """
        Create a specialized visualization for model architecture concepts.

        Args:
            graph (networkx.Graph): The graph to visualize
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height="600px", width="100%", bgcolor="#1a1220", font_color="white")

        # Set physics options for a neural network-like effect
        physics_options = {
            "solver": "forceAtlas2Based",
            "forceAtlas2Based": {
                "gravitationalConstant": -50,
                "centralGravity": 0.01,
                "springLength": 100,
                "springConstant": 0.08,
                "damping": 0.4,
                "avoidOverlap": 0
            },
            "stabilization": {
                "enabled": True,
                "iterations": 200
            }
        }

        # Add nodes with neural network-like styling
        for node in graph.nodes():
            # Determine if this is a central node
            is_central = graph.nodes[node].get('color') == 'red'

            # Create a neuron-like appearance
            if is_central:
                shape = "dot"
                size = 35
                font_size = 18
                border_width = 3
                color = {
                    "background": self.color_schemes["architecture"]["accent"],
                    "border": self.color_schemes["architecture"]["primary"],
                    "highlight": {
                        "background": self.color_schemes["architecture"]["accent"],
                        "border": self.color_schemes["architecture"]["secondary"]
                    }
                }
            else:
                shape = "dot"
                size = 25
                font_size = 14
                border_width = 2
                color = {
                    "background": self.color_schemes["architecture"]["primary"],
                    "border": self.color_schemes["architecture"]["secondary"],
                    "highlight": {
                        "background": self.color_schemes["architecture"]["secondary"],
                        "border": self.color_schemes["architecture"]["accent"]
                    }
                }

            # Get node description if available
            description = graph.nodes[node].get('description', '')
            tooltip = f"<div style='max-width:300px;'><b>{node}</b><br/>{description}</div>"

            # Add the node
            net.add_node(
                node,
                label=node,
                shape=shape,
                size=size,
                color=color,
                borderWidth=border_width,
                font={'size': font_size, 'color': 'white'},
                title=tooltip
            )

        # Add edges with neural connection-like styling
        for edge in graph.edges():
            source, target = edge
            # Create a synapse-like appearance
            width = 2
            color = {
                "color": self.color_schemes["architecture"]["secondary"],
                "highlight": self.color_schemes["architecture"]["accent"],
                "opacity": 0.8
            }

            # Add the edge with arrows to represent information flow
            net.add_edge(source, target, width=width, color=color, arrows={"to": {"enabled": True, "scaleFactor": 0.5}})

        # Set physics options
        net.set_options(json.dumps({
            "physics": physics_options,
            "interaction": {
                "hover": True,
                "tooltipDelay": 100,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True
            },
            "nodes": {
                "font": {
                    "strokeWidth": 3,
                    "strokeColor": "#1a1220"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            },
            "edges": {
                "smooth": {
                    "type": "continuous",
                    "forceDirection": "none"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            }
        }))

        # Generate the HTML file
        if save_path:
            net.save_graph(save_path)
        else:
            save_path = "architecture_visualization.html"
            net.save_graph(save_path)

        return save_path

    def create_training_visualization(self, graph, save_path=None):
        """
        Create a specialized visualization for training concepts.

        Args:
            graph (networkx.Graph): The graph to visualize
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height="600px", width="100%", bgcolor="#201e12", font_color="white")

        # Set physics options for a dynamic training-like effect
        physics_options = {
            "solver": "repulsion",
            "repulsion": {
                "nodeDistance": 120,
                "centralGravity": 0.1,
                "springLength": 150,
                "springConstant": 0.05,
                "damping": 0.09
            },
            "stabilization": {
                "enabled": True,
                "iterations": 150
            }
        }

        # Add nodes with training-themed styling
        for node in graph.nodes():
            # Determine if this is a central node
            is_central = graph.nodes[node].get('color') == 'red'

            # Create a parameter-like appearance
            if is_central:
                shape = "hexagon"
                size = 35
                font_size = 18
                border_width = 3
                color = {
                    "background": self.color_schemes["training"]["accent"],
                    "border": self.color_schemes["training"]["primary"],
                    "highlight": {
                        "background": self.color_schemes["training"]["accent"],
                        "border": self.color_schemes["training"]["secondary"]
                    }
                }
            else:
                shape = "hexagon"
                size = 25
                font_size = 14
                border_width = 2
                color = {
                    "background": self.color_schemes["training"]["primary"],
                    "border": self.color_schemes["training"]["secondary"],
                    "highlight": {
                        "background": self.color_schemes["training"]["secondary"],
                        "border": self.color_schemes["training"]["accent"]
                    }
                }

            # Get node description if available
            description = graph.nodes[node].get('description', '')
            tooltip = f"<div style='max-width:300px;'><b>{node}</b><br/>{description}</div>"

            # Add the node
            net.add_node(
                node,
                label=node,
                shape=shape,
                size=size,
                color=color,
                borderWidth=border_width,
                font={'size': font_size, 'color': 'white'},
                title=tooltip
            )

        # Add edges with training-like styling
        for edge in graph.edges():
            source, target = edge
            # Create a parameter-flow appearance
            width = 2
            color = {
                "color": self.color_schemes["training"]["secondary"],
                "highlight": self.color_schemes["training"]["accent"],
                "opacity": 0.8
            }

            # Add the edge
            net.add_edge(source, target, width=width, color=color, smooth={"type": "curvedCCW", "roundness": 0.2})

        # Set physics options
        net.set_options(json.dumps({
            "physics": physics_options,
            "interaction": {
                "hover": True,
                "tooltipDelay": 100,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True
            },
            "nodes": {
                "font": {
                    "strokeWidth": 3,
                    "strokeColor": "#201e12"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            },
            "edges": {
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            }
        }))

        # Generate the HTML file
        if save_path:
            net.save_graph(save_path)
        else:
            save_path = "training_visualization.html"
            net.save_graph(save_path)

        return save_path

    def create_hardware_visualization(self, graph, save_path=None):
        """
        Create a specialized visualization for hardware acceleration concepts.

        Args:
            graph (networkx.Graph): The graph to visualize
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Create a pyvis network
        net = Network(height="600px", width="100%", bgcolor="#201212", font_color="white")

        # Set physics options for a hardware-like effect
        physics_options = {
            "solver": "barnesHut",
            "barnesHut": {
                "gravitationalConstant": -80,
                "centralGravity": 0.3,
                "springLength": 150,
                "springConstant": 0.04,
                "damping": 0.09,
                "avoidOverlap": 0.1
            },
            "stabilization": {
                "enabled": True,
                "iterations": 150
            }
        }

        # Add nodes with hardware-themed styling
        for node in graph.nodes():
            # Determine if this is a central node
            is_central = graph.nodes[node].get('color') == 'red'

            # Create a hardware-like appearance
            if is_central:
                shape = "hexagon"
                size = 40
                font_size = 18
                border_width = 3
                color = {
                    "background": self.color_schemes["hardware"]["accent"],
                    "border": self.color_schemes["hardware"]["primary"],
                    "highlight": {
                        "background": self.color_schemes["hardware"]["accent"],
                        "border": self.color_schemes["hardware"]["secondary"]
                    }
                }
            else:
                shape = "hexagon"
                size = 30
                font_size = 14
                border_width = 2
                color = {
                    "background": self.color_schemes["hardware"]["primary"],
                    "border": self.color_schemes["hardware"]["secondary"],
                    "highlight": {
                        "background": self.color_schemes["hardware"]["secondary"],
                        "border": self.color_schemes["hardware"]["accent"]
                    }
                }

            # Get node description if available
            description = graph.nodes[node].get('description', '')
            tooltip = f"<div style='max-width:300px;'><b>{node}</b><br/>{description}</div>"

            # Add the node
            net.add_node(
                node,
                label=node,
                shape=shape,
                size=size,
                color=color,
                borderWidth=border_width,
                font={'size': font_size, 'color': 'white'},
                title=tooltip
            )

        # Add edges with hardware-like styling
        for edge in graph.edges():
            source, target = edge
            # Create a circuit-like appearance
            width = 2
            color = {
                "color": self.color_schemes["hardware"]["secondary"],
                "highlight": self.color_schemes["hardware"]["accent"],
                "opacity": 0.8
            }

            # Add the edge
            net.add_edge(source, target, width=width, color=color)

        # Set physics options
        net.set_options(json.dumps({
            "physics": physics_options,
            "interaction": {
                "hover": True,
                "tooltipDelay": 100,
                "zoomView": True,
                "dragView": True,
                "navigationButtons": True
            },
            "nodes": {
                "font": {
                    "strokeWidth": 3,
                    "strokeColor": "#201212"
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            },
            "edges": {
                "smooth": {
                    "type": "continuous",
                    "forceDirection": "none",
                    "roundness": 0.5
                },
                "shadow": {
                    "enabled": True,
                    "color": "rgba(0,0,0,0.5)",
                    "size": 10,
                    "x": 5,
                    "y": 5
                }
            }
        }))

        # Generate the HTML file
        if save_path:
            net.save_graph(save_path)
        else:
            save_path = "hardware_visualization.html"
            net.save_graph(save_path)

        return save_path

    def create_category_visualization(self, graph, concept, save_path=None):
        """
        Create a category-specific visualization based on the concept.

        Args:
            graph (networkx.Graph): The graph to visualize
            concept (str): The central concept
            save_path (str, optional): Path to save the HTML file

        Returns:
            str: Path to the generated HTML file
        """
        # Determine the category for the concept
        category = self.get_category_for_concept(concept)

        # Create the appropriate visualization based on the category
        if category == "deployment":
            return self.create_deployment_visualization(graph, save_path)
        elif category == "optimization":
            return self.create_optimization_visualization(graph, save_path)
        elif category == "architecture":
            return self.create_architecture_visualization(graph, save_path)
        elif category == "training":
            return self.create_training_visualization(graph, save_path)
        elif category == "hardware":
            return self.create_hardware_visualization(graph, save_path)
        else:
            # Default to training visualization
            return self.create_training_visualization(graph, save_path)

# Example usage
if __name__ == "__main__":
    from llm_thesaurus import LLMThesaurus

    # Create instances
    llm_thesaurus = LLMThesaurus()
    enhanced_vis = EnhancedVisualizations()

    # Test with different concepts
    concepts = ["docker", "quantization", "transformer", "hyperparameters"]

    for concept in concepts:
        # Build the graph
        graph = llm_thesaurus.build_domain_graph(concept)

        if graph:
            # Create a category-specific visualization
            save_path = f"static/visualizations/{concept}_enhanced.html"
            enhanced_vis.create_category_visualization(graph, concept, save_path)
            print(f"Enhanced visualization created for '{concept}' at {save_path}")
