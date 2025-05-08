# LoRA Fine-Tuning for Thesaurus LLM

This directory contains scripts and resources for fine-tuning language models using LoRA (Low-Rank Adaptation) for the Thesaurus LLM project.

## What is LoRA?

LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that:

1. **Freezes the pre-trained model weights**
2. **Adds trainable rank decomposition matrices** to each layer of the Transformer architecture
3. **Significantly reduces the number of trainable parameters**
4. **Reduces memory requirements and training time**

This makes it possible to fine-tune large language models on consumer hardware.

## Setup

1. Install the required dependencies:

```bash
pip install -r lora_requirements.txt
```

Alternatively, you can use the provided shell script which will set up a virtual environment and install all dependencies:

```bash
chmod +x run_lora_finetuning.sh
./run_lora_finetuning.sh
```

2. Prepare your dataset in JSON format (see `data/thesaurus_dataset.json` for an example).

## Fine-Tuning with LoRA

To fine-tune a model using LoRA:

```bash
python lora_finetune.py \
    --base_model gpt2 \
    --dataset_path data/thesaurus_dataset.json \
    --output_dir ./thesaurus-model-lora \
    --lora_r 8 \
    --lora_alpha 16 \
    --lora_dropout 0.05 \
    --learning_rate 3e-4 \
    --num_train_epochs 3 \
    --per_device_train_batch_size 8 \
    --gradient_accumulation_steps 2
```

You can adjust the parameters based on your hardware capabilities and dataset size.

## Running Inference

To generate synonyms using the fine-tuned model:

```bash
python test_lora_model.py \
    --model_path ./thesaurus-model-lora \
    --words happy intelligent beautiful strong \
    --temperature 0.7
```

## Merging the Adapter with the Base Model

For more efficient inference, you can merge the LoRA adapter with the base model:

```bash
python merge_lora_adapter.py \
    --adapter_path ./thesaurus-model-lora \
    --output_path ./thesaurus-model-merged \
    --half_precision
```

## Memory Requirements

LoRA significantly reduces memory requirements compared to full fine-tuning:

| Model Size | Full Fine-tuning | LoRA    |
|------------|------------------|---------|
| GPT-2 (124M)| ~500MB          | ~170MB  |
| GPT-2 Medium (355M) | ~1.4GB  | ~300MB  |
| GPT-2 Large (774M)  | ~3.1GB  | ~500MB  |
| GPT-2 XL (1.5B)     | ~6GB    | ~800MB  |
| GPT-J (6B)          | ~24GB   | ~1.2GB  |

## Tips for Successful Fine-Tuning

1. **Start with a smaller model**: Begin with GPT-2 or similar sized models before moving to larger ones.

2. **Adjust LoRA rank (r)**: 
   - Lower rank (4-8) for smaller models or limited hardware
   - Higher rank (16-32) for larger models when more capacity is needed

3. **Adjust LoRA alpha**:
   - Usually set to 2x the rank value
   - Controls the scaling of the LoRA update

4. **Target the right modules**:
   - For GPT-2: `["c_attn"]`
   - For Pythia: `["query_key_value"]`
   - For LLaMA/Mistral: `["q_proj", "k_proj", "v_proj", "o_proj"]`

5. **Dataset preparation**:
   - Format your data as instruction-response pairs
   - Include diverse examples for better generalization
   - Balance the dataset to avoid bias

6. **Training parameters**:
   - Learning rate: 2e-4 to 5e-4 typically works well
   - Batch size: Start small (4-8) and increase if hardware allows
   - Epochs: 3-5 epochs is usually sufficient

## Troubleshooting

1. **Out of memory errors**:
   - Reduce batch size
   - Reduce sequence length
   - Use gradient accumulation
   - Lower the LoRA rank

2. **Poor performance**:
   - Increase LoRA rank
   - Check dataset quality
   - Try different target modules
   - Increase training epochs

3. **Slow training**:
   - Enable mixed precision training (fp16)
   - Use a GPU with more VRAM
   - Optimize dataset loading

## References

- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [PEFT Library Documentation](https://huggingface.co/docs/peft/index)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
- [Parameter-Efficient Fine-Tuning Methods](https://huggingface.co/blog/peft)
