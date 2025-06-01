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

# Set Supabase URL and Key (replace with your actual values)
export SUPABASE_URL="https://your-supabase-url.supabase.co"
export SUPABASE_KEY="your-supabase-anon-key"

# Stop any existing Flask applications running on port 5036
kill -9 $(lsof -t -i:5036) 2>/dev/null

# Start the Flask application on port 5036
echo "Starting Flask application with fine-tuned model..."
# python3 app.py --port 5036

# Start the Flask application on port 5036
echo "Starting Flask application with fine-tuned model..."
python3 app.py --port 5036
