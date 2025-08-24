#!/usr/bin/env python3
"""
Simple Flask test to verify basic functionality
"""

from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Simple Flask app is working!',
        'port': os.environ.get('PORT', 5037)
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5037))
    print(f"🚀 Starting simple test app on port {port}")
    app.run(debug=True, port=port, host='0.0.0.0')