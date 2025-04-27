#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "thesaurus_env" ]; then
    echo "Creating virtual environment..."
    python3 -m venv thesaurus_env
fi

# Activate virtual environment
source thesaurus_env/bin/activate

# Install required packages
echo "Installing required packages..."
pip install -r requirements.txt

# Check if model exists
if [ ! -d "thesaurus_model_final" ]; then
    echo "Model not found. Please run run_finetuning.sh first."
    exit 1
fi

# Start the Flask application
echo "Starting Flask application with fine-tuned model..."
python3 app.py
