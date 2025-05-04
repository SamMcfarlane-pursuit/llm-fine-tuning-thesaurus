# AI Thesaurus LLM

A comprehensive toolkit for fine-tuning language models for thesaurus applications.

## Overview

This package provides utilities for fine-tuning language models to generate high-quality thesaurus entries. It includes tools for:

- Model configuration and loading
- LoRA and QLoRA fine-tuning
- Text generation and inference
- Data preparation and processing

## Directory Structure

```
ai_thesaurus_llm/
├── models/              # Model definitions and configurations
├── fine_tuning/         # Fine-tuning scripts and utilities
├── inference/           # Inference and text generation utilities
├── datasets/            # Example datasets and data utilities
└── utils/               # Utility functions
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pip install -r requirements.txt
```

### Fine-tuning a Model

```python
from ai_thesaurus_llm.fine_tuning.lora_trainer import prepare_model_for_qlora, train_model
from ai_thesaurus_llm.utils.data_preparation import convert_json_to_dataset

# Prepare model for QLoRA fine-tuning
model, tokenizer = prepare_model_for_qlora(
    model_name="mistral-7b",
    lora_config_name="default",
    use_auth_token="your_huggingface_token"  # if needed
)

# Convert dataset
dataset_path = "ai_thesaurus_llm/datasets/sample_thesaurus_data.json"
convert_json_to_dataset(dataset_path, "processed_dataset")

# Train model
train_model(
    model=model,
    tokenizer=tokenizer,
    dataset_path="processed_dataset",
    training_config_name="default",
    output_dir="./fine_tuned_model"
)
```

### Generating Thesaurus Entries

```python
from ai_thesaurus_llm.models.model_loader import load_finetuned_model
from ai_thesaurus_llm.inference.text_generation import generate_thesaurus_entries

# Load fine-tuned model
model, tokenizer = load_finetuned_model(
    adapter_path="./fine_tuned_model",
    base_model_name="mistral-7b",
    use_auth_token="your_huggingface_token"  # if needed
)

# Generate thesaurus entries
result = generate_thesaurus_entries(
    model=model,
    tokenizer=tokenizer,
    term="fine-tuning",
    inference_config_name="creative"
)

print(result)
```

## Configuration

The package includes various configuration options for models, fine-tuning, and inference:

- `BASE_MODELS`: Configurations for base models
- `LORA_CONFIGS`: Configurations for LoRA fine-tuning
- `QLORA_CONFIGS`: Configurations for QLoRA fine-tuning
- `TRAINING_CONFIGS`: Configurations for training
- `INFERENCE_CONFIGS`: Configurations for text generation

## Examples

### Example 1: Fine-tune a Small Model

```python
from ai_thesaurus_llm.fine_tuning.lora_trainer import prepare_model_for_lora, train_model

# Prepare model for LoRA fine-tuning
model, tokenizer = prepare_model_for_lora(
    model_name="pythia-1.4b",
    lora_config_name="lightweight"
)

# Train model
train_model(
    model=model,
    tokenizer=tokenizer,
    dataset_path="ai_thesaurus_llm/datasets/sample_thesaurus_data.json",
    training_config_name="lightweight",
    output_dir="./fine_tuned_small_model"
)
```

### Example 2: Generate Thesaurus Entries with Streaming

```python
from ai_thesaurus_llm.models.model_loader import load_finetuned_model
from ai_thesaurus_llm.inference.text_generation import generate_text_stream

# Load fine-tuned model
model, tokenizer = load_finetuned_model(
    adapter_path="./fine_tuned_model"
)

# Create prompt
prompt = """Generate a comprehensive thesaurus entry for the term "machine learning".
    
Format the response as follows:
- Synonyms: [list of synonyms]
- Antonyms: [list of antonyms]
- Related Terms: [list of related terms]
- Definition: [brief definition]
- Usage Examples: [2-3 example sentences]

Thesaurus Entry:
"""

# Generate text with streaming
streamer = generate_text_stream(
    model=model,
    tokenizer=tokenizer,
    prompt=prompt,
    inference_config_name="creative"
)

# Process the streamed output
for token in streamer:
    print(token, end="", flush=True)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
