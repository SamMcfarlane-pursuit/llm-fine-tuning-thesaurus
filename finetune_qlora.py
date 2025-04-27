import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)

def train_model():
    # Load dataset
    dataset = load_dataset("json", data_files="data/thesaurus_dataset.json")

    # Define model and tokenizer
    model_name = "distilgpt2"  # Using an even smaller model to fit in memory

    # Load model without quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        device_map="auto",
        trust_remote_code=True,
    )

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    # Prepare dataset
    def preprocess_function(examples):
        # Format inputs as: "### Instruction: {instruction}\n\n### Response: {output}"
        prompts = []
        for instruction, input_text, output in zip(examples["instruction"], examples["input"], examples["output"]):
            if input_text:
                prompt = f"### Instruction: {instruction}\n\n### Input: {input_text}\n\n### Response: {output}"
            else:
                prompt = f"### Instruction: {instruction}\n\n### Response: {output}"
            prompts.append(prompt)

        # Tokenize the prompts
        tokenized_inputs = tokenizer(
            prompts,
            padding="max_length",
            truncation=True,
            max_length=256,  # Reduced sequence length
            return_tensors="pt"
        )

        # Set the labels to be the same as inputs for language modeling
        tokenized_inputs["labels"] = tokenized_inputs["input_ids"].clone()

        return tokenized_inputs

    # Process the dataset
    tokenized_dataset = dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=["instruction", "input", "output"]
    )

    # Define training arguments
    training_args = TrainingArguments(
        output_dir="./thesaurus_model",
        num_train_epochs=3,
        per_device_train_batch_size=2,  # Reduced batch size
        gradient_accumulation_steps=2,  # Reduced gradient accumulation
        save_steps=100,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=False,  # Disable fp16 for MPS device
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
    )

    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # We're not doing masked language modeling
    )

    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        data_collator=data_collator,
    )

    # Train model
    trainer.train()

    # Save model
    trainer.save_model("./thesaurus_model_final")

    # Save tokenizer
    tokenizer.save_pretrained("./thesaurus_model_final")

    print("Training completed and model saved!")

if __name__ == "__main__":
    try:
        print("Starting fine-tuning process...")
        train_model()
        print("Fine-tuning completed successfully!")
    except Exception as e:
        import traceback
        print(f"Error during fine-tuning: {e}")
        traceback.print_exc()
