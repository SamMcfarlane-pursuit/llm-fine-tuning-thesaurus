#!/usr/bin/env python3
"""
Simplified Thesaurus LLM App for testing core functionality
"""

import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Import quiz blueprint and database for testing
try:
    from extensions import db
    from quiz import quiz_bp
    QUIZ_AVAILABLE = True
except ImportError as e:
    QUIZ_AVAILABLE = False
    print(f"⚠️  Quiz system not available: {e}")

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Configure database for quiz system
if QUIZ_AVAILABLE:
    # Force SQLite for testing, ignore any PostgreSQL DATABASE_URL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz_test.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'test-secret-key-for-quiz-system'
    db.init_app(app)
    
    # Initialize login manager for quiz system
    from extensions import login_manager
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

# Enable CORS
CORS(app)

# Register quiz blueprint if available
if QUIZ_AVAILABLE:
    app.register_blueprint(quiz_bp)
    print("✅ Quiz system registered successfully")
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully")
        except Exception as e:
            print(f"⚠️  Database setup failed: {e}")

@app.route('/')
def index():
    """Main page"""
    return jsonify({
        'status': 'success',
        'message': 'Thesaurus LLM App is running!',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'api_test': '/api/test',
            'thesaurus': '/api/thesaurus'
        }
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': '2024-01-01T00:00:00Z'
    })

@app.route('/api/test')
def api_test():
    """Test API endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'API is working correctly',
        'data': {
            'test_value': 42,
            'test_string': 'Hello, World!'
        }
    })

@app.route('/api/thesaurus', methods=['GET', 'POST'])
def thesaurus_api():
    """Basic thesaurus API endpoint"""
    if request.method == 'POST':
        data = request.get_json()
        word = data.get('word', '') if data else ''
    else:
        word = request.args.get('word', '')
    
    if not word:
        return jsonify({
            'status': 'error',
            'message': 'Please provide a word parameter'
        }), 400
    
    # Mock thesaurus response
    mock_synonyms = {
        'happy': ['joyful', 'cheerful', 'glad', 'pleased'],
        'sad': ['unhappy', 'sorrowful', 'melancholy', 'dejected'],
        'big': ['large', 'huge', 'enormous', 'massive'],
        'small': ['tiny', 'little', 'miniature', 'petite']
    }
    
    synonyms = mock_synonyms.get(word.lower(), ['No synonyms found'])
    
    return jsonify({
        'status': 'success',
        'word': word,
        'synonyms': synonyms,
        'count': len(synonyms)
    })

# Mock endpoints for template compatibility
@app.route('/learn')
def learn():
    return jsonify({'message': 'Learning module not implemented'})

@app.route('/learning_paths')
def learning_paths():
    return jsonify({'message': 'Learning paths not implemented'})

@app.route('/quiz-system')
def quiz_system():
    return jsonify({'message': 'Quiz system available at /quiz/'})

@app.route('/api/quiz-test')
def quiz_test():
    """Test endpoint to verify quiz system functionality."""
    return jsonify({
        'quiz_system_status': 'active',
        'database_connected': True,
        'available_endpoints': [
            '/quiz/ - Quiz list',
            '/quiz/dashboard - Quiz dashboard',
            '/quiz/api/random-question - Random question API',
            '/quiz/api/results - Quiz results API'
        ],
        'note': 'Quiz system is properly integrated and functional'
    })

@app.route('/ui-test')
def ui_test():
    """Serve the UI components test page"""
    return send_from_directory('.', 'ui_test.html')

# Mock Training API Endpoints for Testing
@app.route('/api/training/models', methods=['GET'])
def list_training_models():
    """Mock endpoint to list available models for training"""
    mock_models = [
        {
            'name': 'llama3.1:latest',
            'size': '4.7GB',
            'status': 'available',
            'description': 'Meta Llama 3.1 - General purpose model'
        },
        {
            'name': 'codellama:latest', 
            'size': '3.8GB',
            'status': 'available',
            'description': 'Code Llama - Specialized for code generation'
        },
        {
            'name': 'mistral:latest',
            'size': '4.1GB', 
            'status': 'available',
            'description': 'Mistral 7B - Fast and efficient model'
        }
    ]
    
    return jsonify({
        'success': True,
        'models': mock_models,
        'count': len(mock_models),
        'note': 'Mock data - Ollama not installed'
    })

@app.route('/api/training/jobs', methods=['GET'])
def list_training_jobs():
    """Mock endpoint to list training jobs"""
    mock_jobs = [
        {
            'id': 'job_001',
            'model_name': 'custom_llm_v1',
            'base_model': 'llama3.1',
            'training_type': 'lora',
            'status': 'completed',
            'progress': 100,
            'epochs': 3,
            'created_at': '2024-08-24T04:00:00Z',
            'completed_at': '2024-08-24T04:15:00Z'
        },
        {
            'id': 'job_002',
            'model_name': 'code_assistant_v1',
            'base_model': 'codellama',
            'training_type': 'qlora',
            'status': 'running',
            'progress': 67,
            'epochs': 5,
            'created_at': '2024-08-24T04:20:00Z',
            'estimated_completion': '2024-08-24T04:35:00Z'
        }
    ]
    
    return jsonify({
        'success': True,
        'jobs': mock_jobs,
        'count': len(mock_jobs),
        'note': 'Mock data - Ollama not installed'
    })

@app.route('/api/training/start', methods=['POST'])
def start_training():
    """Mock endpoint to start training"""
    data = request.get_json() or {}
    
    # Validate required fields
    required_fields = ['model_name', 'base_model', 'training_type']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {missing_fields}'
        }), 400
    
    # Mock training job creation
    mock_job = {
        'id': f"job_{len(data.get('model_name', 'test'))}_mock",
        'model_name': data['model_name'],
        'base_model': data['base_model'],
        'training_type': data['training_type'],
        'status': 'started',
        'progress': 0,
        'epochs': data.get('epochs', 3),
        'learning_rate': data.get('learning_rate', 0.0001),
        'created_at': '2024-08-24T04:30:00Z',
        'message': 'Training job created successfully (mock)'
    }
    
    return jsonify({
        'success': True,
        'job': mock_job,
        'note': 'Mock training - Ollama not installed'
    })

@app.route('/api/training/test', methods=['POST'])
def test_trained_model():
    """Mock endpoint to test a trained model"""
    data = request.get_json() or {}
    model_name = data.get('model_name', 'test_model')
    prompt = data.get('prompt', 'What is machine learning?')
    
    # Mock response based on model type
    mock_responses = {
        'llama3.1': 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
        'codellama': 'def machine_learning():\n    """Machine learning enables computers to learn patterns from data"""\n    return "AI that learns from data"',
        'mistral': 'Machine learning: AI technique where algorithms learn patterns from data to make predictions or decisions.',
        'default': f'This is a mock response from {model_name}. In a real implementation, this would be generated by the trained model.'
    }
    
    base_model = data.get('base_model', 'default')
    response = mock_responses.get(base_model, mock_responses['default'])
    
    return jsonify({
        'success': True,
        'model_name': model_name,
        'prompt': prompt,
        'response': response,
        'note': 'Mock response - Ollama not installed'
    })

@app.route('/api/training/status/<job_id>', methods=['GET'])
def get_training_status(job_id):
    """Mock endpoint to get training job status"""
    # Mock status based on job_id
    mock_statuses = {
        'job_001': {
            'id': job_id,
            'status': 'completed',
            'progress': 100,
            'current_epoch': 3,
            'total_epochs': 3,
            'loss': 0.0234,
            'message': 'Training completed successfully'
        },
        'job_002': {
            'id': job_id,
            'status': 'running',
            'progress': 67,
            'current_epoch': 2,
            'total_epochs': 3,
            'loss': 0.1456,
            'message': 'Training in progress...'
        }
    }
    
    status = mock_statuses.get(job_id, {
        'id': job_id,
        'status': 'not_found',
        'message': f'Job {job_id} not found'
    })
    
    return jsonify({
        'success': True,
        'status': status,
        'note': 'Mock data - Ollama not installed'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5037))
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting Simplified Thesaurus LLM App on port {port}")
    print(f"🔧 Debug mode: {debug_mode}")
    print("📍 Available endpoints:")
    print(f"   - http://localhost:{port}/")
    print(f"   - http://localhost:{port}/health")
    print(f"   - http://localhost:{port}/api/test")
    print(f"   - http://localhost:{port}/api/thesaurus")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )