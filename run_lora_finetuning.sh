#!/bin/bash
# Script to run the complete LoRA fine-tuning process

# Exit on error
set -e

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   LoRA Fine-Tuning for Thesaurus LLM   ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "thesaurus_env" ]; then
    echo -e "${GREEN}Creating virtual environment...${NC}"
    python3 -m venv thesaurus_env
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source thesaurus_env/bin/activate

# Install required packages
echo -e "${GREEN}Installing required packages...${NC}"
pip install torch transformers datasets accelerate peft trl nltk networkx matplotlib

# Download NLTK data
echo -e "${GREEN}Downloading NLTK data...${NC}"
python3 -c "import ssl; ssl._create_default_https_context = ssl._create_unverified_context; import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"

# Create data directory if it doesn't exist
mkdir -p data

# Prepare dataset
echo -e "${GREEN}Preparing dataset...${NC}"
python3 prepare_dataset.py

# Run LoRA fine-tuning
echo -e "${GREEN}Starting LoRA fine-tuning...${NC}"
python3 lora_finetune.py \
    --base_model "gpt2" \
    --dataset_path "data/thesaurus_dataset.json" \
    --output_dir "./thesaurus-model-lora" \
    --lora_r 8 \
    --lora_alpha 16 \
    --lora_dropout 0.05 \
    --learning_rate 3e-4 \
    --num_train_epochs 3 \
    --per_device_train_batch_size 8 \
    --gradient_accumulation_steps 2 \
    --max_seq_length 256

# Test the model
echo -e "${GREEN}Testing the fine-tuned model...${NC}"
python3 test_lora_model.py \
    --model_path "./thesaurus-model-lora" \
    --words "learning" "algorithm" "neural" "network"

# Merge the adapter with the base model
echo -e "${GREEN}Merging adapter with base model...${NC}"
python3 merge_lora_adapter.py \
    --adapter_path "./thesaurus-model-lora" \
    --output_path "./thesaurus-model-merged" \
    --half_precision

# Test the merged model
echo -e "${GREEN}Testing the merged model...${NC}"
python3 test_lora_model.py \
    --model_path "./thesaurus-model-merged" \
    --words "machine" "intelligence" "deep" "language"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   LoRA Fine-Tuning Process Completed   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}The fine-tuned model is saved at:${NC} ./thesaurus-model-lora"
echo -e "${GREEN}The merged model is saved at:${NC} ./thesaurus-model-merged"
echo -e "${GREEN}You can now use the model in your application.${NC}"
echo -e "${BLUE}=========================================${NC}"
