#!/bin/bash

# QUICK OLLAMA SETUP FOR VISUAL LLM
# Run this script to set up Ollama AI assistant

echo "🦙 SETTING UP OLLAMA FOR VISUAL LLM"
echo "=================================="

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
else
    echo "📥 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Start Ollama service
echo "🚀 Starting Ollama service..."
ollama serve &
sleep 5

# Download recommended models
echo "📦 Downloading recommended models..."
echo "   - Llama 3.1 (8B) - Main assistant model"
ollama pull llama3.1

echo "   - CodeLlama (7B) - For code examples"
ollama pull codellama

echo "   - Mistral (7B) - Lightweight alternative"
ollama pull mistral

# Test installation
echo "🧪 Testing installation..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running successfully!"
    echo "📋 Available models:"
    ollama list
else
    echo "❌ Ollama setup failed. Please check the installation."
    exit 1
fi

echo ""
echo "🎉 OLLAMA SETUP COMPLETE!"
echo "========================"
echo "✅ Ollama is running on http://localhost:11434"
echo "✅ Models downloaded and ready"
echo "✅ Ready for Visual LLM integration"
echo ""
echo "Next steps:"
echo "1. Integrate with your Flask app"
echo "2. Update the AI assistant frontend"
echo "3. Test with LLM-specific questions"
echo ""
echo "Example test:"
echo 'curl -X POST http://localhost:11434/api/generate -d '"'"'{"model":"llama3.1","prompt":"What is LoRA?","stream":false}'"'"''
