"""
Utility functions for the thesaurus application.
"""
import torch
from transformers import pipeline

class ThesaurusLLM:
    """
    A class to handle thesaurus operations using a fine-tuned LLM.
    """

    def __init__(self, model_path=None, model=None, tokenizer=None, device=None):
        """
        Initialize the ThesaurusLLM with a fine-tuned model.

        Args:
            model_path (str, optional): Path to the fine-tuned model
            model (object, optional): Pre-loaded model object
            tokenizer (object, optional): Pre-loaded tokenizer object
            device (str, optional): Device to run the model on ('cpu', 'cuda', etc.)
        """
        if device is None:
            device = 'cuda' if torch.cuda.is_available() else 'cpu'

        self.device = device

        # If model and tokenizer are provided directly (for QLoRA)
        if model is not None and tokenizer is not None:
            self.generator = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device_map="auto"  # Use device_map for QLoRA models
            )
        # Otherwise, load from path
        elif model_path is not None:
            self.generator = pipeline(
                "text-generation",
                model=model_path,
                device=device
            )
        else:
            raise ValueError("Either model_path or both model and tokenizer must be provided")

    def get_synonyms(self, word, max_length=100, num_return_sequences=1):
        """
        Get synonyms for a given word.

        Args:
            word (str): The word to find synonyms for
            max_length (int): Maximum length of the generated text
            num_return_sequences (int): Number of different outputs to generate

        Returns:
            list: List of synonyms
        """
        prompt = f"List synonyms for the word '{word}'."

        outputs = self.generator(
            prompt,
            max_length=max_length,
            num_return_sequences=num_return_sequences,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )

        # Process the output to extract synonyms
        response = outputs[0]['generated_text']

        # Remove the prompt from the response
        response = response.replace(prompt, "").strip()

        # Extract the synonyms
        try:
            # Try to extract the list part after the colon
            synonyms_text = response.split(":")[-1].strip()
            synonyms = [s.strip() for s in synonyms_text.split(",")]
            return [s for s in synonyms if s]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]

    def get_antonyms(self, word, max_length=100):
        """
        Get antonyms for a given word.

        Args:
            word (str): The word to find antonyms for
            max_length (int): Maximum length of the generated text

        Returns:
            list: List of antonyms
        """
        prompt = f"What are the antonyms of '{word}'?"

        output = self.generator(
            prompt,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']

        # Remove the prompt from the response
        response = output.replace(prompt, "").strip()

        # Extract the antonyms
        try:
            # Try to extract the list part after the colon
            antonyms_text = response.split(":")[-1].strip()
            antonyms = [a.strip() for a in antonyms_text.split(",")]
            return [a for a in antonyms if a]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]

    def get_related_terms(self, word, relation_type="hypernyms", max_length=100):
        """
        Get related terms (hypernyms or hyponyms) for a given word.

        Args:
            word (str): The word to find related terms for
            relation_type (str): Type of relation ('hypernyms' or 'hyponyms')
            max_length (int): Maximum length of the generated text

        Returns:
            list: List of related terms
        """
        if relation_type == "hypernyms":
            prompt = f"What are more general terms (hypernyms) for '{word}'?"
        else:  # hyponyms
            prompt = f"What are more specific terms (hyponyms) for '{word}'?"

        output = self.generator(
            prompt,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']

        # Remove the prompt from the response
        response = output.replace(prompt, "").strip()

        # Extract the related terms
        try:
            # Try to extract the list part after the colon
            terms_text = response.split(":")[-1].strip()
            terms = [t.strip() for t in terms_text.split(",")]
            return [t for t in terms if t]  # Remove empty strings
        except:
            # If parsing fails, return the raw response
            return [response]

    def answer_question(self, question, max_length=200):
        """
        Answer a thesaurus-related question.

        Args:
            question (str): The question to answer
            max_length (int): Maximum length of the generated text

        Returns:
            str: The answer to the question
        """
        output = self.generator(
            question,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )[0]['generated_text']

        # Remove the question from the response
        response = output.replace(question, "").strip()

        return response

    def answer_question_streaming(self, question, max_length=200):
        """
        Answer a thesaurus-related question with streaming response.

        This method yields partial responses as they are generated, improving
        perceived performance by showing results immediately.

        Args:
            question (str): The question to answer
            max_length (int): Maximum length of the generated text

        Yields:
            str: Partial responses as they are generated
        """
        # Get the model and tokenizer from the pipeline
        model = self.generator.model
        tokenizer = self.generator.tokenizer

        # Tokenize the input
        inputs = tokenizer(question, return_tensors="pt").to(model.device)

        # Track the length of the input to extract only the new tokens
        input_length = inputs.input_ids.shape[1]

        # Generate with streaming
        generated_ids = []

        # Start with the input ids
        current_ids = inputs.input_ids

        # Generate tokens one by one
        for _ in range(max_length):
            with torch.no_grad():
                outputs = model(current_ids)
                next_token_logits = outputs.logits[:, -1, :]

                # Apply temperature and top_p sampling
                next_token_logits = next_token_logits / 0.7

                # Apply top_p sampling
                sorted_logits, sorted_indices = torch.sort(next_token_logits, descending=True)
                cumulative_probs = torch.cumsum(torch.nn.functional.softmax(sorted_logits, dim=-1), dim=-1)

                # Remove tokens with cumulative probability above the threshold
                sorted_indices_to_remove = cumulative_probs > 0.9
                # Shift the indices to the right to keep the first token above the threshold
                sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                sorted_indices_to_remove[..., 0] = 0

                indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                next_token_logits[indices_to_remove] = -float('Inf')

                # Sample from the filtered distribution
                probs = torch.nn.functional.softmax(next_token_logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1)

                # Append the new token to the generated sequence
                current_ids = torch.cat([current_ids, next_token], dim=-1)
                generated_ids.append(next_token.item())

                # Decode the current sequence
                current_text = tokenizer.decode(current_ids[0][input_length:], skip_special_tokens=True)

                # Yield the current text
                yield current_text

                # Stop if we've generated an EOS token
                if next_token.item() == tokenizer.eos_token_id:
                    break
