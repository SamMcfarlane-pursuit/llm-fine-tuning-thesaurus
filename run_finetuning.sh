#!/bin/bash

# Activate virtual environment
source thesaurus_env/bin/activate

# Prepare dataset
echo "Preparing dataset..."
python prepare_dataset.py

# Run fine-tuning
echo "Starting fine-tuning with QLoRA..."
python finetune_qlora.py

echo "Fine-tuning completed!"
