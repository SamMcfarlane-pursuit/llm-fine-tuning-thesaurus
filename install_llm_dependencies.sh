#!/bin/bash

# Install LLM Dependencies for Visual LLM AI Assistant
# This script installs the necessary packages for LLM integration

echo "🤖 Installing LLM Dependencies for Visual LLM AI Assistant"
echo "=========================================================="

# Activate virtual environment if it exists
if [ -d "thesaurus_env" ]; then
    echo "📦 Activating virtual environment..."
    source thesaurus_env/bin/activate
fi

echo "📚 Installing LLM integration packages..."

# Core LLM packages
pip install openai>=1.0.0
pip install google-generativeai
pip install transformers>=4.30.0
pip install torch>=2.0.0
pip install requests>=2.28.0

# Optional: For local LLM support
echo ""
echo "🔧 Optional: Install Ollama for local LLM support"
echo "Run this command separately if you want local LLM:"
echo "curl -fsSL https://ollama.ai/install.sh | sh"
echo ""

# Optional: For advanced features
echo "📈 Installing optional packages for enhanced features..."
pip install numpy>=1.24.0
pip install scipy>=1.10.0

echo ""
echo "✅ LLM dependencies installed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Choose your LLM provider:"
echo "   • FREE: Install Ollama (local)"
echo "   • PAID: Get OpenAI API key"
echo "   • PAID: Get Google Gemini API key"
echo ""
echo "2. Add API keys to your .env file:"
echo "   OPENAI_API_KEY=your-openai-key"
echo "   GEMINI_API_KEY=your-gemini-key"
echo ""
echo "3. Restart your Visual LLM website:"
echo "   ./deploy.sh"
echo ""
echo "🎉 Your AI assistant will now have real LLM capabilities!"
