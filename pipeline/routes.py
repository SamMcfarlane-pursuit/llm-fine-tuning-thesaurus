"""
Routes for the pipeline module.
"""

from flask import render_template, request, jsonify, current_app
from flask_login import current_user, login_required
from . import pipeline_bp

@pipeline_bp.route('/')
def index():
    """Render the main pipeline page."""
    return render_template('pipeline/index.html')

@pipeline_bp.route('/interactive')
def interactive():
    """Render the interactive pipeline demo page."""
    return render_template('pipeline/interactive.html')

@pipeline_bp.route('/api/models')
def get_models():
    """Return a list of available models for a given task."""
    task = request.args.get('task', 'sentiment-analysis')
    
    # This is a simplified example - in a real application, you would fetch this from a database or API
    task_models = {
        'sentiment-analysis': [
            {'id': 'distilbert-base-uncased-finetuned-sst-2-english', 'name': 'DistilBERT (SST-2)'},
            {'id': 'nlptown/bert-base-multilingual-uncased-sentiment', 'name': 'BERT Multilingual Sentiment'},
            {'id': 'cardiffnlp/twitter-roberta-base-sentiment', 'name': 'RoBERTa Twitter Sentiment'}
        ],
        'text-generation': [
            {'id': 'gpt2', 'name': 'GPT-2 (Small)'},
            {'id': 'gpt2-medium', 'name': 'GPT-2 (Medium)'},
            {'id': 'distilgpt2', 'name': 'DistilGPT-2'}
        ],
        'fill-mask': [
            {'id': 'bert-base-uncased', 'name': 'BERT Base Uncased'},
            {'id': 'roberta-base', 'name': 'RoBERTa Base'},
            {'id': 'distilbert-base-uncased', 'name': 'DistilBERT Base Uncased'}
        ],
        'token-classification': [
            {'id': 'dbmdz/bert-large-cased-finetuned-conll03-english', 'name': 'BERT NER (CoNLL-2003)'},
            {'id': 'Jean-Baptiste/camembert-ner', 'name': 'CamemBERT NER (French)'}
        ],
        'question-answering': [
            {'id': 'distilbert-base-cased-distilled-squad', 'name': 'DistilBERT SQuAD'},
            {'id': 'deepset/roberta-base-squad2', 'name': 'RoBERTa SQuAD 2'}
        ],
        'summarization': [
            {'id': 'facebook/bart-large-cnn', 'name': 'BART CNN'},
            {'id': 't5-small', 'name': 'T5 Small'}
        ],
        'translation': [
            {'id': 't5-small', 'name': 'T5 Small (Multilingual)'},
            {'id': 'Helsinki-NLP/opus-mt-en-fr', 'name': 'Opus MT (English to French)'},
            {'id': 'Helsinki-NLP/opus-mt-en-de', 'name': 'Opus MT (English to German)'}
        ]
    }
    
    return jsonify(task_models.get(task, []))

@pipeline_bp.route('/api/run', methods=['POST'])
def run_pipeline():
    """Simulate running a pipeline with the given parameters."""
    data = request.json
    task = data.get('task', 'sentiment-analysis')
    model = data.get('model', '')
    input_text = data.get('input', '')
    
    # This is a simplified example - in a real application, you would actually run the pipeline
    # For now, we'll return mock results
    results = {
        'sentiment-analysis': [
            {'label': 'POSITIVE', 'score': 0.9998}
        ],
        'text-generation': [
            {'generated_text': input_text + " is a powerful technique in natural language processing that allows models to generate coherent and contextually relevant text based on input prompts."}
        ],
        'fill-mask': [
            {'token': 'cat', 'score': 0.1784, 'sequence': input_text.replace('[MASK]', 'cat')},
            {'token': 'dog', 'score': 0.1749, 'sequence': input_text.replace('[MASK]', 'dog')},
            {'token': 'man', 'score': 0.0589, 'sequence': input_text.replace('[MASK]', 'man')}
        ],
        'token-classification': [
            {'entity': 'B-PER', 'score': 0.9971, 'word': 'John', 'start': 11, 'end': 15},
            {'entity': 'B-LOC', 'score': 0.9988, 'word': 'New', 'start': 30, 'end': 33},
            {'entity': 'I-LOC', 'score': 0.9993, 'word': 'York', 'start': 34, 'end': 38}
        ],
        'question-answering': {
            'score': 0.9876,
            'start': 27,
            'end': 37,
            'answer': "NLP tools"
        },
        'summarization': [
            {'summary_text': "This is a summarized version of the input text."}
        ],
        'translation': [
            {'translation_text': "Translated version of the input text."}
        ]
    }
    
    return jsonify({
        'task': task,
        'model': model,
        'input': input_text,
        'results': results.get(task, {'error': 'Task not supported'})
    })
