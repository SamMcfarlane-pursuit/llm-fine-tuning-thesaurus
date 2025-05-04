"""
Integration with the main Flask application
"""

from flask import Blueprint, request, jsonify
from .integration import get_thesaurus_llm

# Create Blueprint
thesaurus_llm_bp = Blueprint('thesaurus_llm', __name__, url_prefix='/api/thesaurus-llm')

@thesaurus_llm_bp.route('/generate', methods=['POST'])
def generate_entry():
    """
    Generate a thesaurus entry for the given term
    
    Request JSON:
    {
        "term": "fine-tuning",
        "inference_config": "default"
    }
    """
    data = request.json
    term = data.get('term')
    inference_config = data.get('inference_config', 'default')
    
    if not term:
        return jsonify({'error': 'No term provided'}), 400
    
    try:
        # Get ThesaurusLLM instance
        thesaurus_llm = get_thesaurus_llm()
        
        # Generate thesaurus entry
        result = thesaurus_llm.generate_entry(
            term=term,
            inference_config_name=inference_config
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@thesaurus_llm_bp.route('/batch-generate', methods=['POST'])
def batch_generate():
    """
    Generate thesaurus entries for multiple terms
    
    Request JSON:
    {
        "terms": ["fine-tuning", "LoRA", "QLoRA"],
        "inference_config": "default"
    }
    """
    data = request.json
    terms = data.get('terms')
    inference_config = data.get('inference_config', 'default')
    
    if not terms or not isinstance(terms, list):
        return jsonify({'error': 'No terms provided or terms is not a list'}), 400
    
    try:
        # Get ThesaurusLLM instance
        thesaurus_llm = get_thesaurus_llm()
        
        # Generate thesaurus entries
        results = thesaurus_llm.batch_generate(
            terms=terms,
            inference_config_name=inference_config
        )
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def init_app(app, model_path=None, base_model_name=None, use_auth_token=None):
    """
    Initialize the ThesaurusLLM and register the Blueprint with the Flask app
    
    Args:
        app: Flask application
        model_path (str, optional): Path to the fine-tuned model
        base_model_name (str, optional): Name of the base model from BASE_MODELS config
        use_auth_token (str, optional): Hugging Face token for gated models
    """
    # Register Blueprint
    app.register_blueprint(thesaurus_llm_bp)
    
    # Initialize ThesaurusLLM if model_path is provided
    if model_path:
        from .integration import initialize_thesaurus_llm
        initialize_thesaurus_llm(model_path, base_model_name, use_auth_token)
        
        # Add a route to check if the model is loaded
        @thesaurus_llm_bp.route('/status', methods=['GET'])
        def status():
            thesaurus_llm = get_thesaurus_llm()
            return jsonify({
                'model_loaded': thesaurus_llm.model is not None,
                'model_path': thesaurus_llm.model_path,
                'base_model_name': thesaurus_llm.base_model_name
            })
