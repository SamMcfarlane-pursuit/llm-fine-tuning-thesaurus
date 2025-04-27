# QLoRA Fine-Tuning for Thesaurus LLM

This directory contains scripts and resources for fine-tuning language models using QLoRA (Quantized Low-Rank Adaptation) for the Thesaurus LLM project.

## What is QLoRA?

QLoRA (Quantized Low-Rank Adaptation) is an extension of LoRA that combines:
1. **4-bit quantization** of the base model weights
2. **Low-rank adaptation** for parameter-efficient fine-tuning
3. **Double quantization** to further reduce memory usage
4. **NormalFloat (NF4)** data type optimized for normally distributed weights

QLoRA allows fine-tuning of large language models (7B+ parameters) on consumer hardware with limited VRAM.

## Setup

1. Install the required dependencies:

```bash
pip install -r qlora_requirements.txt
```

2. Prepare your dataset in JSON format (see `data/thesaurus_dataset.json` for an example).

## Fine-Tuning with QLoRA

To fine-tune a model using QLoRA:

```bash
python qlora_finetune.py \
    --base_model meta-llama/Llama-2-7b-hf \
    --dataset_path data/thesaurus_dataset.json \
    --output_dir ./thesaurus-model-qlora \
    --lora_r 8 \
    --lora_alpha 16 \
    --lora_dropout 0.05 \
    --learning_rate 2e-4 \
    --num_train_epochs 3 \
    --per_device_train_batch_size 4 \
    --gradient_accumulation_steps 4
```

You can adjust the parameters based on your hardware capabilities and dataset size.

## Running Inference

To generate synonyms using the fine-tuned model:

```bash
python qlora_inference.py \
    --model_path ./thesaurus-model-qlora \
    --word "happy" \
    --temperature 0.7
```

## Merging the Adapter with the Base Model

For more efficient inference, you can merge the QLoRA adapter with the base model:

```bash
python merge_qlora_adapter.py \
    --adapter_path ./thesaurus-model-qlora \
    --output_path ./thesaurus-model-merged \
    --half_precision
```

## Memory Requirements

QLoRA significantly reduces memory requirements compared to full fine-tuning:

| Model Size | Full Fine-tuning | LoRA | QLoRA |
|------------|------------------|------|-------|
| 7B         | ~28GB            | ~14GB| ~5GB  |
| 13B        | ~52GB            | ~26GB| ~9GB  |
| 33B        | ~130GB           | ~65GB| ~21GB |

## Tips for Successful Fine-Tuning

1. **Start small**: Begin with smaller models (e.g., 7B) before attempting larger ones.
2. **Adjust batch size**: If you encounter OOM errors, reduce batch size and increase gradient accumulation steps.
3. **Monitor training**: Use TensorBoard to monitor loss and learning rate during training.
4. **Use gradient checkpointing**: This trades computation for memory and is enabled by default.
5. **Experiment with LoRA parameters**: Try different values for `lora_r` and `lora_alpha` to find the optimal balance.

## Integrating with the Web Application

After fine-tuning, you can integrate the model with the web application by:

1. Placing the model in the appropriate directory (`./thesaurus-model-qlora` or `./thesaurus-model-merged`)
2. Updating the inference code in `app.py` to use the new model
3. Testing the integration with sample queries

## References

- [QLoRA Paper](https://arxiv.org/abs/2305.14314)
- [PEFT Library Documentation](https://huggingface.co/docs/peft/index)
- [BitsAndBytes Library](https://github.com/TimDettmers/bitsandbytes)
