#!/usr/bin/env python3
"""
Debug version of app.py to identify problematic imports
"""

import os
import ssl
import nltk
from flask import Flask, render_template, request, jsonify
import json
import uuid

# Test basic imports first
try:
    from flask_login import current_user, login_required
    print("✅ flask_login imported successfully")
except ImportError as e:
    print(f"❌ flask_login import failed: {e}")

try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ dotenv imported and loaded successfully")
except ImportError as e:
    print(f"❌ dotenv import failed: {e}")

try:
    from extensions import db, login_manager, migrate, oauth, csrf
    print("✅ extensions imported successfully")
except ImportError as e:
    print(f"❌ extensions import failed: {e}")

try:
    from config import config
    print("✅ config imported successfully")
except ImportError as e:
    print(f"❌ config import failed: {e}")

# Test problematic imports one by one
try:
    from visual_thesaurus import VisualThesaurus
    print("✅ visual_thesaurus imported successfully")
except ImportError as e:
    print(f"❌ visual_thesaurus import failed: {e}")

try:
    from thesaurus_utils import ThesaurusLLM
    print("✅ thesaurus_utils imported successfully")
except ImportError as e:
    print(f"❌ thesaurus_utils import failed: {e}")

try:
    from models import UserProgress, Quiz
    print("✅ models imported successfully")
except ImportError as e:
    print(f"❌ models import failed: {e}")

try:
    from auth import auth_bp
    print("✅ auth imported successfully")
except ImportError as e:
    print(f"❌ auth import failed: {e}")

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Debug app is working!',
        'imports_tested': True
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5037))
    print(f"🔧 Starting debug app on port {port}")
    app.run(debug=True, port=port, host='0.0.0.0')