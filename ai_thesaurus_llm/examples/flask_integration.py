"""
Example Flask application integrating the AI Thesaurus LLM
"""

import os
import argparse
from flask import Flask, request, jsonify, render_template_string
from ai_thesaurus_llm.models.model_loader import load_finetuned_model
from ai_thesaurus_llm.inference.text_generation import generate_thesaurus_entries

# Create Flask app
app = Flask(__name__)

# Global variables for model and tokenizer
model = None
tokenizer = None

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>AI Thesaurus LLM Demo</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #2980b9;
        }
        .result {
            margin-top: 30px;
            display: none;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        .loading {
            text-align: center;
            display: none;
            margin-top: 20px;
        }
        .term {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .examples {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .example {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <h1>AI Thesaurus LLM Demo</h1>
    
    <div class="container">
        <div class="form-group">
            <label for="term">Enter a term:</label>
            <input type="text" id="term" name="term" placeholder="e.g., fine-tuning">
        </div>
        
        <div class="form-group">
            <label for="inference_config">Inference style:</label>
            <select id="inference_config" name="inference_config">
                <option value="default">Default</option>
                <option value="creative">Creative</option>
                <option value="precise">Precise</option>
                <option value="greedy">Greedy</option>
            </select>
        </div>
        
        <button id="generate">Generate Thesaurus Entry</button>
        
        <div class="loading" id="loading">
            <p>Generating thesaurus entry... This may take a few seconds.</p>
        </div>
        
        <div class="result" id="result">
            <div class="term" id="result-term"></div>
            
            <div class="section">
                <div class="section-title">Synonyms:</div>
                <div id="synonyms"></div>
            </div>
            
            <div class="section">
                <div class="section-title">Antonyms:</div>
                <div id="antonyms"></div>
            </div>
            
            <div class="section">
                <div class="section-title">Related Terms:</div>
                <div id="related-terms"></div>
            </div>
            
            <div class="section">
                <div class="section-title">Definition:</div>
                <div id="definition"></div>
            </div>
            
            <div class="section">
                <div class="section-title">Usage Examples:</div>
                <div class="examples" id="examples"></div>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('generate').addEventListener('click', async () => {
            const term = document.getElementById('term').value.trim();
            if (!term) {
                alert('Please enter a term');
                return;
            }
            
            const inferenceConfig = document.getElementById('inference_config').value;
            
            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        term: term,
                        inference_config: inferenceConfig
                    })
                });
                
                const data = await response.json();
                
                // Update result
                document.getElementById('result-term').textContent = data.term;
                document.getElementById('synonyms').textContent = data.synonyms.join(', ');
                document.getElementById('antonyms').textContent = data.antonyms.join(', ');
                document.getElementById('related-terms').textContent = data.related_terms.join(', ');
                document.getElementById('definition').textContent = data.definition;
                
                // Update examples
                const examplesContainer = document.getElementById('examples');
                examplesContainer.innerHTML = '';
                data.examples.forEach(example => {
                    const div = document.createElement('div');
                    div.className = 'example';
                    div.textContent = example;
                    examplesContainer.appendChild(div);
                });
                
                // Show result
                document.getElementById('loading').style.display = 'none';
                document.getElementById('result').style.display = 'block';
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while generating the thesaurus entry');
                document.getElementById('loading').style.display = 'none';
            }
        });
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Render the web interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/generate', methods=['POST'])
def generate():
    """Generate a thesaurus entry for the given term"""
    data = request.json
    term = data.get('term')
    inference_config = data.get('inference_config', 'default')
    
    if not term:
        return jsonify({'error': 'No term provided'}), 400
    
    try:
        # Generate thesaurus entry
        result = generate_thesaurus_entries(
            model=model,
            tokenizer=tokenizer,
            term=term,
            inference_config_name=inference_config
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def main(args):
    global model, tokenizer
    
    print(f"Loading fine-tuned model from {args.model_path}...")
    
    # Load fine-tuned model
    model, tokenizer = load_finetuned_model(
        adapter_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    print(f"Starting Flask server on port {args.port}...")
    
    # Start Flask server
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a Flask server for the AI Thesaurus LLM")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=5000, help="Port to run the server on")
    parser.add_argument("--debug", action="store_true", help="Run the server in debug mode")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    
    args = parser.parse_args()
    main(args)
