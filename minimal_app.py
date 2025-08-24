#!/usr/bin/env python3
"""
Minimal Flask app with only essential functionality
"""

import os
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')

@app.route('/')
def index():
    """Home page"""
    try:
        return render_template('index.html')
    except Exception as e:
        return jsonify({
            'status': 'success',
            'message': 'Minimal Thesaurus LLM App is running!',
            'note': 'Template not found, using JSON response',
            'error': str(e)
        })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app': 'Thesaurus LLM Fine-Tuning',
        'version': '1.0.0'
    })

@app.route('/api/test')
def api_test():
    """Test API endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'API is working correctly',
        'endpoints': [
            '/',
            '/health',
            '/api/test'
        ]
    })

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
        'error': 'Page not found',
        'status': 404
    }), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({
        'error': 'Internal server error',
        'status': 500
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5037))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print(f"🚀 Starting Minimal Thesaurus LLM App on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"📍 Available endpoints:")
    print(f"   - http://localhost:{port}/")
    print(f"   - http://localhost:{port}/health")
    print(f"   - http://localhost:{port}/api/test")
    
    app.run(debug=debug, port=port, host='0.0.0.0')