"""
Flask web application for the Visual Thesaurus LLM project.
This provides a web interface for interacting with the thesaurus.
"""
import os
import json
import ssl
import nltk
from flask import Flask, render_template, request, jsonify, send_from_directory
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from visual_thesaurus import VisualThesaurus
from thesaurus_utils import ThesaurusLLM
from llm_concepts import LLMConceptsVisualizer
from llm_thesaurus import LLMThesaurus
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Fix NLTK SSL certificate issue
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download NLTK data
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')
    nltk.download('omw-1.4')

# Initialize WordNet
from nltk.corpus import wordnet as wn
# Force initialization of WordNet
_ = wn.synsets('test')

# Configure Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key')

# Configure paths
app.config['STATIC_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['VISUALIZATIONS_FOLDER'] = os.path.join(app.config['STATIC_FOLDER'], 'visualizations')

# Ensure visualization directory exists
os.makedirs(app.config['VISUALIZATIONS_FOLDER'], exist_ok=True)

# Initialize the visual thesaurus
visual_thesaurus = VisualThesaurus()

# Initialize the LLM concepts visualizer
llm_concepts_visualizer = LLMConceptsVisualizer()

# Initialize the LLM thesaurus
llm_thesaurus_instance = LLMThesaurus()

# Global variables for the model
model = None
tokenizer = None
thesaurus_llm = None

def load_model():
    """Load the fine-tuned model."""
    global model, tokenizer, thesaurus_llm

    # Check if model files exist
    if os.path.exists("./thesaurus-model-lora"):
        try:
            # Load the base model
            base_model = AutoModelForCausalLM.from_pretrained("gpt2")

            # Load the fine-tuned model
            model = PeftModel.from_pretrained(base_model, "./thesaurus-model-lora")
            tokenizer = AutoTokenizer.from_pretrained("./thesaurus-model-lora")

            # Initialize the ThesaurusLLM
            thesaurus_llm = ThesaurusLLM("./thesaurus-model-lora")

            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    else:
        print("Model files not found. Please fine-tune the model first.")
        return False

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/visualize/<word>')
def visualize(word):
    """Render the visualization page for a specific word."""
    return render_template('visualize.html', word=word)

@app.route('/learn')
def learn():
    """Render the learning page with LLM fine-tuning concepts."""
    return render_template('learn.html')

@app.route('/llm-thesaurus')
def llm_thesaurus():
    """Render the LLM fine-tuning thesaurus page."""
    return render_template('llm_thesaurus.html')

@app.route('/concept/<concept_name>')
def concept_detail(concept_name):
    """Render the detail page for a specific LLM fine-tuning concept."""
    concept_info = llm_concepts_visualizer.get_concept_info(concept_name)
    if concept_info:
        return render_template('concept.html', concept=concept_info)
    else:
        return render_template('404.html', message=f"Concept '{concept_name}' not found"), 404

@app.route('/api/thesaurus/<word>')
def get_thesaurus_data(word):
    """API endpoint to get thesaurus data for a word."""
    # Create visualization directory if it doesn't exist
    os.makedirs('static/visualizations', exist_ok=True)

    try:
        # Handle multi-word inputs by using just the first word
        original_word = word
        if ' ' in word:
            word = word.split(' ')[0]
            print(f"Input contains multiple words. Using first word: '{word}'")

        # Try to use domain-specific relationships first
        domain_graph = llm_thesaurus_instance.build_domain_graph(word)

        if domain_graph:
            # Use the domain-specific graph
            visual_thesaurus.graph = domain_graph
            print(f"Using domain-specific graph for '{word}'")
        else:
            # Fall back to WordNet
            visual_thesaurus.build_graph_for_word(word)

            # Try to enhance with domain-specific relationships
            enhanced = llm_thesaurus_instance.enhance_thesaurus_graph(visual_thesaurus, word)
            if enhanced:
                print(f"Enhanced graph for '{word}' with domain-specific relationships")

            # If the graph is still empty, try a default word
            if len(visual_thesaurus.graph.nodes()) == 0:
                # Try some domain-specific default words
                for default_word in ["fine-tuning", "llm", "docker", "happy"]:
                    print(f"No data found for '{word}'. Trying '{default_word}'...")

                    # Try domain-specific graph first
                    domain_graph = llm_thesaurus_instance.build_domain_graph(default_word)
                    if domain_graph:
                        visual_thesaurus.graph = domain_graph
                        word = default_word
                        print(f"Using domain-specific graph for '{default_word}'")
                        break

                    # Fall back to WordNet
                    visual_thesaurus.build_graph_for_word(default_word)
                    if len(visual_thesaurus.graph.nodes()) > 0:
                        word = default_word
                        print(f"Using WordNet graph for '{default_word}'")
                        break

        # Create a static HTML visualization
        vis_path = f'static/visualizations/{word}_thesaurus.html'
        visual_thesaurus.visualize_interactive(save_path=vis_path)

        # Get node and edge data for the frontend (for compatibility)
        nodes = []
        for node in visual_thesaurus.graph.nodes():
            nodes.append({
                'id': node,
                'label': visual_thesaurus.graph.nodes[node].get('label', node),
                'color': visual_thesaurus.graph.nodes[node].get('color', 'blue'),
                'size': visual_thesaurus.graph.nodes[node].get('size', 15)
            })

        edges = []
        for edge in visual_thesaurus.graph.edges():
            edges.append({
                'from': edge[0],
                'to': edge[1],
                'color': visual_thesaurus.graph.edges[edge].get('color', 'gray'),
                'label': visual_thesaurus.graph.edges[edge].get('label', '')
            })

        return jsonify({
            'word': word,
            'original_query': original_word,
            'nodes': nodes,
            'edges': edges,
            'visualization_path': f'/static/visualizations/{word}_thesaurus.html'
        })
    except Exception as e:
        print(f"Error generating thesaurus visualization for '{word}': {e}")
        # Try with a default word as fallback
        try:
            default_word = "happy"
            print(f"Falling back to default word: '{default_word}'")
            visual_thesaurus.build_graph_for_word(default_word)

            vis_path = f'static/visualizations/{default_word}_thesaurus.html'
            visual_thesaurus.visualize_interactive(save_path=vis_path)

            return jsonify({
                'word': default_word,
                'original_query': word,
                'message': f"Could not visualize '{word}', showing '{default_word}' instead",
                'visualization_path': f'/static/visualizations/{default_word}_thesaurus.html'
            })
        except Exception as inner_e:
            print(f"Error with fallback visualization: {inner_e}")
            return jsonify({
                'error': f"Could not generate visualization",
                'message': str(e)
            }), 500

@app.route('/api/synonyms/<word>')
def get_synonyms(word):
    """API endpoint to get synonyms for a word using the fine-tuned model."""
    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Handle multi-word inputs by using just the first word
            if ' ' in word:
                word = word.split(' ')[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'synonyms': []})

            synonyms = []
            for synset in wn.synsets(word):
                for lemma in synset.lemmas():
                    if lemma.name() != word and '_' not in lemma.name():
                        synonyms.append(lemma.name())

            # Remove duplicates and limit to 10
            synonyms = list(set(synonyms))[:10]
            return jsonify({'word': word, 'synonyms': synonyms})
        else:
            synonyms = thesaurus_llm.get_synonyms(word)
            return jsonify({'word': word, 'synonyms': synonyms})
    except Exception as e:
        print(f"Error getting synonyms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'synonyms': []})

@app.route('/api/antonyms/<word>')
def get_antonyms(word):
    """API endpoint to get antonyms for a word using the fine-tuned model."""
    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Handle multi-word inputs by using just the first word
            if ' ' in word:
                word = word.split(' ')[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'antonyms': []})

            antonyms = []
            for synset in wn.synsets(word):
                for lemma in synset.lemmas():
                    for antonym in lemma.antonyms():
                        if '_' not in antonym.name():
                            antonyms.append(antonym.name())

            # Remove duplicates
            antonyms = list(set(antonyms))
            return jsonify({'word': word, 'antonyms': antonyms})
        else:
            antonyms = thesaurus_llm.get_antonyms(word)
            return jsonify({'word': word, 'antonyms': antonyms})
    except Exception as e:
        print(f"Error getting antonyms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'antonyms': []})

@app.route('/api/related/<word>')
def get_related_terms(word):
    """API endpoint to get related terms for a word."""
    relation_type = request.args.get('type', 'hypernyms')

    try:
        # If model is not loaded, use WordNet as fallback
        if thesaurus_llm is None:
            from nltk.corpus import wordnet as wn

            # Handle multi-word inputs by using just the first word
            if ' ' in word:
                word = word.split(' ')[0]

            # Handle case where no synsets are found
            if not wn.synsets(word):
                return jsonify({'word': word, 'relation_type': relation_type, 'terms': []})

            related_terms = []
            for synset in wn.synsets(word):
                if relation_type == 'hypernyms':
                    for hypernym in synset.hypernyms():
                        for lemma in hypernym.lemmas():
                            if '_' not in lemma.name():
                                related_terms.append(lemma.name())
                elif relation_type == 'hyponyms':
                    for hyponym in synset.hyponyms():
                        for lemma in hyponym.lemmas():
                            if '_' not in lemma.name():
                                related_terms.append(lemma.name())

            # Remove duplicates and limit to 10
            related_terms = list(set(related_terms))[:10]
            return jsonify({'word': word, 'relation_type': relation_type, 'terms': related_terms})
        else:
            related_terms = thesaurus_llm.get_related_terms(word, relation_type=relation_type)
            return jsonify({'word': word, 'relation_type': relation_type, 'terms': related_terms})
    except Exception as e:
        print(f"Error getting related terms for '{word}': {e}")
        # Return empty list instead of error to avoid breaking the UI
        return jsonify({'word': word, 'relation_type': relation_type, 'terms': []})

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """API endpoint to ask a question to the model."""
    data = request.json
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # If model is not loaded, provide a generic response
        if thesaurus_llm is None:
            # Simple keyword-based responses for common questions
            question_lower = question.lower()

            if 'synonym' in question_lower:
                answer = "Synonyms are words that have the same or similar meanings. For example, 'happy' and 'joyful' are synonyms."
            elif 'antonym' in question_lower:
                answer = "Antonyms are words that have opposite meanings. For example, 'hot' and 'cold' are antonyms."
            elif 'hypernym' in question_lower or 'general' in question_lower:
                answer = "Hypernyms are words with a broader meaning that includes the meanings of more specific words. For example, 'animal' is a hypernym of 'dog'."
            elif 'hyponym' in question_lower or 'specific' in question_lower:
                answer = "Hyponyms are words with a more specific meaning than a general term. For example, 'dog' is a hyponym of 'animal'."
            elif 'fine-tun' in question_lower or 'finetun' in question_lower:
                answer = "Fine-tuning is the process of taking a pre-trained language model and further training it on a specific dataset to adapt it for particular tasks. In this project, we fine-tune a model to understand word relationships for a thesaurus application."
            elif 'lora' in question_lower:
                answer = "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that adds trainable low-rank matrices to the model's weights while keeping the original weights frozen. This reduces memory requirements and training time."
            else:
                answer = "I'm sorry, I don't have a specific answer for that question. Please try asking about synonyms, antonyms, hypernyms, hyponyms, fine-tuning, or LoRA."

            return jsonify({'question': question, 'answer': answer})
        else:
            answer = thesaurus_llm.answer_question(question)
            return jsonify({'question': question, 'answer': answer})
    except Exception as e:
        print(f"Error answering question: {e}")
        return jsonify({'error': 'Error processing your question', 'message': str(e)}), 500

@app.route('/api/llm-concepts')
def get_llm_concepts():
    """API endpoint to get all LLM fine-tuning concepts."""
    concepts = llm_concepts_visualizer.get_all_concepts()
    return jsonify({'concepts': concepts})

@app.route('/api/llm-concept/<concept_name>')
def get_llm_concept(concept_name):
    """API endpoint to get information about a specific LLM fine-tuning concept."""
    concept_info = llm_concepts_visualizer.get_concept_info(concept_name)
    if concept_info:
        return jsonify(concept_info)
    else:
        return jsonify({'error': f"Concept '{concept_name}' not found"}), 404

@app.route('/api/llm-concepts-visualization')
def get_llm_concepts_visualization():
    """API endpoint to get the LLM concepts visualization."""
    try:
        # Create visualization directory if it doesn't exist
        os.makedirs('static/visualizations', exist_ok=True)

        # Generate the visualization
        llm_concepts_visualizer.create_web_visualization()

        # Return the path to the visualization
        return jsonify({
            'visualization_path': f'/static/visualizations/llm_concepts.html'
        })
    except Exception as e:
        print(f"Error generating LLM concepts visualization: {e}")
        return jsonify({
            'error': 'Could not generate LLM concepts visualization',
            'message': str(e)
        }), 500

@app.route('/api/llm-term/<term>')
def get_llm_term(term):
    """API endpoint to get detailed information about an LLM fine-tuning term."""
    # Get the term information from the LLM thesaurus
    domain_terms = llm_thesaurus_instance.domain_terms
    term_info = domain_terms.get(term.lower())

    if term_info:
        # Format the response
        response = {
            'term': term,
            'description': term_info.get('description', 'No description available'),
            'synonyms': term_info.get('synonyms', []),
            'related': term_info.get('related', [])
        }

        # Add detailed explanation based on the term
        if term == 'fine-tuning':
            response['explanation'] = '''
                <h5>Fine-tuning Process</h5>
                <p>Fine-tuning adapts a pre-trained model to specific tasks by training it on a smaller, task-specific dataset. This process leverages the general knowledge learned during pre-training while specializing the model for particular applications.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Pre-trained Model</strong>: A model like GPT, BERT, or T5 that has been trained on a large corpus of text.</li>
                    <li><strong>Task-specific Dataset</strong>: A smaller dataset relevant to your specific application.</li>
                    <li><strong>Training Procedure</strong>: The process of updating the model's weights based on the task-specific dataset.</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Requires significantly less data than training from scratch</li>
                    <li>Achieves better performance on specific tasks</li>
                    <li>Reduces training time and computational resources</li>
                </ul>
            '''
            response['examples'] = '''
                # Fine-tuning a model with the Transformers library
                from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments

                # Load pre-trained model and tokenizer
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Prepare your dataset
                # ...

                # Define training arguments
                training_args = TrainingArguments(
                    output_dir="./results",
                    num_train_epochs=3,
                    per_device_train_batch_size=8,
                    save_steps=500,
                    save_total_limit=2,
                )

                # Create Trainer and train the model
                trainer = Trainer(
                    model=model,
                    args=training_args,
                    train_dataset=train_dataset,
                )

                trainer.train()

                # Save the fine-tuned model
                model.save_pretrained("./fine-tuned-model")
                tokenizer.save_pretrained("./fine-tuned-model")
            '''
        elif term == 'lora':
            response['explanation'] = '''
                <h5>Low-Rank Adaptation (LoRA)</h5>
                <p>LoRA is a parameter-efficient fine-tuning technique that freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.</p>

                <h5>How LoRA Works</h5>
                <p>For a pre-trained weight matrix W, LoRA parameterizes its change during fine-tuning as:</p>
                <p>W + ΔW = W + BA</p>
                <p>Where:</p>
                <ul>
                    <li>W is the frozen pre-trained weight matrix</li>
                    <li>B is a matrix of size d×r</li>
                    <li>A is a matrix of size r×k</li>
                    <li>r is the rank, which is much smaller than min(d,k)</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Significantly reduces the number of trainable parameters</li>
                    <li>Reduces GPU memory requirements</li>
                    <li>Faster training and inference</li>
                    <li>Enables model merging and composition</li>
                </ul>
            '''
            response['examples'] = '''
                # Fine-tuning with LoRA using the PEFT library
                from transformers import AutoModelForCausalLM, AutoTokenizer
                from peft import LoraConfig, get_peft_model, TaskType

                # Load pre-trained model and tokenizer
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Define LoRA configuration
                lora_config = LoraConfig(
                    task_type=TaskType.CAUSAL_LM,
                    r=8,                     # Rank of the update matrices
                    lora_alpha=32,           # Parameter for scaling
                    lora_dropout=0.1,        # Dropout probability for LoRA layers
                    target_modules=["c_attn", "c_proj"]  # Attention modules to apply LoRA to
                )

                # Apply LoRA to the model
                peft_model = get_peft_model(model, lora_config)

                # Now train the model as usual
                # ...

                # Save the LoRA adapter only (much smaller than full model)
                peft_model.save_pretrained("./lora-adapter")
            '''
        elif term == 'docker':
            response['explanation'] = '''
                <h5>Docker for ML Model Deployment</h5>
                <p>Docker is a platform that uses containerization to package applications and their dependencies together, ensuring consistent behavior across different environments.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Dockerfile</strong>: A text file with instructions to build a Docker image</li>
                    <li><strong>Image</strong>: A lightweight, standalone, executable package that includes everything needed to run the application</li>
                    <li><strong>Container</strong>: A running instance of an image</li>
                </ul>

                <h5>Benefits for ML Deployment</h5>
                <ul>
                    <li>Reproducibility: Ensures the model runs the same way in development and production</li>
                    <li>Isolation: Prevents conflicts between dependencies</li>
                    <li>Portability: Runs consistently across different environments</li>
                    <li>Scalability: Easily scale up or down based on demand</li>
                </ul>
            '''
            response['examples'] = '''
                # Dockerfile for deploying a fine-tuned model
                FROM python:3.9-slim

                WORKDIR /app

                # Install dependencies
                COPY requirements.txt .
                RUN pip install --no-cache-dir -r requirements.txt

                # Copy model files and code
                COPY ./fine-tuned-model /app/fine-tuned-model
                COPY app.py .

                # Expose port
                EXPOSE 5000

                # Run the application
                CMD ["python", "app.py"]

                # Build and run commands:
                # docker build -t my-model .
                # docker run -p 5000:5000 my-model
            '''
        elif term == 'peft':
            response['explanation'] = '''
                <h5>Parameter-Efficient Fine-Tuning (PEFT)</h5>
                <p>PEFT refers to a family of techniques that fine-tune large language models by updating only a small subset of parameters, significantly reducing memory and computational requirements.</p>

                <h5>Popular PEFT Methods</h5>
                <ul>
                    <li><strong>LoRA (Low-Rank Adaptation)</strong>: Adds trainable low-rank matrices to existing weights</li>
                    <li><strong>Prefix Tuning</strong>: Prepends trainable vectors to the hidden states at each layer</li>
                    <li><strong>Prompt Tuning</strong>: Optimizes continuous prompt embeddings while keeping the model frozen</li>
                    <li><strong>Adapter Layers</strong>: Inserts small trainable modules between layers of the frozen model</li>
                </ul>

                <h5>Benefits</h5>
                <ul>
                    <li>Reduces memory requirements by up to 90%</li>
                    <li>Enables fine-tuning of larger models on consumer hardware</li>
                    <li>Faster training and inference</li>
                    <li>Prevents catastrophic forgetting</li>
                </ul>
            '''
            response['examples'] = '''
                # Using the PEFT library for different methods
                from transformers import AutoModelForCausalLM
                from peft import (
                    get_peft_model,
                    LoraConfig,
                    PrefixTuningConfig,
                    PromptTuningConfig,
                    TaskType
                )

                model = AutoModelForCausalLM.from_pretrained("gpt2")

                # LoRA configuration
                lora_config = LoraConfig(
                    task_type=TaskType.CAUSAL_LM,
                    r=8,
                    lora_alpha=32,
                    target_modules=["c_attn"]
                )

                # Prefix Tuning configuration
                prefix_config = PrefixTuningConfig(
                    task_type=TaskType.CAUSAL_LM,
                    num_virtual_tokens=20
                )

                # Prompt Tuning configuration
                prompt_config = PromptTuningConfig(
                    task_type=TaskType.CAUSAL_LM,
                    num_virtual_tokens=10
                )

                # Choose one configuration and apply it
                peft_model = get_peft_model(model, lora_config)
            '''
        elif term == 'transformer':
            response['explanation'] = '''
                <h5>Transformer Architecture</h5>
                <p>The Transformer is a neural network architecture introduced in the paper "Attention Is All You Need" that forms the foundation of modern LLMs like GPT, BERT, and T5.</p>

                <h5>Key Components</h5>
                <ul>
                    <li><strong>Self-Attention Mechanism</strong>: Allows the model to weigh the importance of different words in the input</li>
                    <li><strong>Multi-Head Attention</strong>: Enables the model to focus on different parts of the input simultaneously</li>
                    <li><strong>Feed-Forward Networks</strong>: Process the attention outputs</li>
                    <li><strong>Layer Normalization</strong>: Stabilizes the learning process</li>
                    <li><strong>Positional Encoding</strong>: Provides information about the position of words in the sequence</li>
                </ul>

                <h5>Transformer Variants</h5>
                <ul>
                    <li><strong>Encoder-only</strong>: BERT, RoBERTa (good for classification, NER)</li>
                    <li><strong>Decoder-only</strong>: GPT family (good for text generation)</li>
                    <li><strong>Encoder-Decoder</strong>: T5, BART (good for translation, summarization)</li>
                </ul>
            '''
            response['examples'] = '''
                # Using a pre-trained Transformer model
                from transformers import AutoModelForCausalLM, AutoTokenizer

                # Load a decoder-only Transformer (GPT-2)
                model_name = "gpt2"
                model = AutoModelForCausalLM.from_pretrained(model_name)
                tokenizer = AutoTokenizer.from_pretrained(model_name)

                # Generate text
                input_text = "Fine-tuning is"
                input_ids = tokenizer(input_text, return_tensors="pt").input_ids

                output = model.generate(
                    input_ids,
                    max_length=50,
                    num_return_sequences=1,
                    temperature=0.7
                )

                generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
                print(generated_text)
            '''
        else:
            # Generic explanation for other terms
            response['explanation'] = f'<p>Detailed explanation for {term} will be available soon.</p>'
            response['examples'] = f'# Example code for {term} will be available soon.'

        return jsonify(response)
    else:
        return jsonify({'error': f"Term '{term}' not found"}), 404

@app.route('/static/visualizations/<path:filename>')
def serve_visualization(filename):
    """Serve visualization files."""
    return send_from_directory(app.config['VISUALIZATIONS_FOLDER'], filename)


# Load the model when the module is imported
model_loaded = load_model()

if __name__ == '__main__':
    # Get host and port from environment variables or use defaults
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))

    # Run the application
    app.run(host=host, port=port, debug=os.environ.get('FLASK_ENV') == 'development')
