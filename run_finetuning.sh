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
pip install torch transformers datasets accelerate bitsandbytes peft trl nltk networkx matplotlib

# Download NLTK data
echo "Downloading NLTK data..."
python3 -c "import ssl; ssl._create_default_https_context = ssl._create_unverified_context; import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"

# Prepare dataset
echo "Preparing dataset..."
python3 prepare_dataset.py

# Run fine-tuning
echo "Starting fine-tuning with QLoRA..."
python3 finetune_qlora.py

# Test the model
echo "Testing the model..."
python3 test_model.py

echo "Fine-tuning process completed!"
